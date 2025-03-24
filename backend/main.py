from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
import google.generativeai as genai
import os
import pytz
from dateutil import parser
from datetime import datetime

app = Flask(__name__)
CORS(app)

# User's timezone - Eastern Time
USER_TIMEZONE = pytz.timezone('America/New_York')

# -----------------------------
# Data Loading and Processing
# -----------------------------
def load_and_process_data():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_filename = os.path.join(script_dir, "my_canvas_data.json")
    
    with open(data_filename, "r", encoding="utf-8") as f:
        canvas_data = json.load(f)

    documents = []  # List to hold flattened, human-readable documents
    metadata = []   # Optional metadata for each document

    # Process each course and create structured documents
    for course in canvas_data.get("courses", []):
        course_name = course.get("name", "Unknown Course")
        course_code = course.get("course_code", "No code")
        
        # Course overview document
        course_doc = f"**Course:** {course_name}\n**Code:** {course_code}\n"
        if course.get("description"):
            course_doc += f"**Description:** {course.get('description')}\n"
        documents.append(course_doc)
        metadata.append({"type": "course", "course": course_name})
        
        # Assignments
        for assignment in course.get("assignments", []):
            if isinstance(assignment, dict):
                a_name = assignment.get("name", "Unnamed Assignment")
                due_str = assignment.get("due_at", "No due date")
                
                # Convert UTC time to user's local timezone
                if due_str and due_str != "No due date":
                    try:
                        # Parse the ISO format date
                        due_utc = parser.parse(due_str)
                        # If it's naive (no timezone), assume UTC
                        if due_utc.tzinfo is None:
                            due_utc = pytz.UTC.localize(due_utc)
                        # Convert to user's timezone
                        due_local = due_utc.astimezone(USER_TIMEZONE)
                        # Format in a readable way with timezone
                        due = due_local.strftime("%Y-%m-%d %I:%M %p %Z")
                    except Exception:
                        due = due_str
                else:
                    due = due_str
                
                a_desc = assignment.get("description", "No description")
                submission = assignment.get("submission", {})
                if isinstance(submission, dict):
                    sub_scores = submission.get("scores", "No submission")
                else:
                    sub_scores = "No submission"
            else:
                a_name = str(assignment)
                due = "No due date"
                a_desc = ""
                sub_scores = ""
                
            assign_doc = (
                f"**Assignment in {course_name}:**\n"
                f"- **Name:** {a_name}\n"
                f"- **Due Date:** {due}\n"
                f"- **Description:** {a_desc}\n"
                f"- **Submission Scores:** {sub_scores}\n"
            )
            documents.append(assign_doc)
            metadata.append({"type": "assignment", "course": course_name, "title": a_name})
        
        # Quizzes
        for quiz in course.get("quizzes", []):
            if isinstance(quiz, dict):
                q_title = quiz.get("title", "Unnamed Quiz")
                due_str = quiz.get("due_at", "No due date")
                
                # Convert UTC time to user's local timezone
                if due_str and due_str != "No due date":
                    try:
                        # Parse the ISO format date
                        due_utc = parser.parse(due_str)
                        # If it's naive (no timezone), assume UTC
                        if due_utc.tzinfo is None:
                            due_utc = pytz.UTC.localize(due_utc)
                        # Convert to user's timezone
                        due_local = due_utc.astimezone(USER_TIMEZONE)
                        # Format in a readable way with timezone
                        due = due_local.strftime("%Y-%m-%d %I:%M %p %Z")
                    except Exception:
                        due = due_str
                else:
                    due = due_str
                
                q_desc = quiz.get("description", "No description")
                submission = quiz.get("submission", {})
                if isinstance(submission, dict):
                    sub_scores = submission.get("scores", "No submission")
                else:
                    sub_scores = "No submission"
            else:
                q_title = str(quiz)
                due = "No due date"
                q_desc = ""
                sub_scores = ""
                
            quiz_doc = (
                f"**Quiz in {course_name}:**\n"
                f"- **Title:** {q_title}\n"
                f"- **Due Date:** {due}\n"
                f"- **Description:** {q_desc}\n"
                f"- **Submission Scores:** {sub_scores}\n"
            )
            documents.append(quiz_doc)
            metadata.append({"type": "quiz", "course": course_name, "title": q_title})
    
    return documents, metadata, canvas_data

# -----------------------------
# Vector Search Setup
# -----------------------------
def build_faiss_index(documents):
    global embedder
    if 'embedder' not in globals():
        model_name = "all-MiniLM-L6-v2"  # Lightweight embedding model
        embedder = SentenceTransformer(model_name)
    
    embeddings = embedder.encode(documents, convert_to_numpy=True)
    d = embeddings.shape[1]
    index = faiss.IndexFlatL2(d)
    index.add(embeddings)
    return index, embedder

# -----------------------------
# AI Setup
# -----------------------------
def setup_gemini_api():
    api_key = os.environ.get("GEMINI_API_KEY")
    if api_key:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        return model
    return None

# Define prompt instructions for the AI
prompt_instructions = (
    "You are an AI Study Buddy with access to structured Canvas course data. "
    "Your role is to help the user plan their study, answer questions about upcoming assignments and quizzes, "
    "and provide personalized study plans. Use the provided context to answer questions accurately. "
    "When a study plan is requested (e.g., 'Plan my week' or 'Give me a five-day study plan'), "
    "output a neatly formatted plan with bold headings and a table or bullet list format. "
    "If asked about upcoming assignments or quizzes, automatically select the most imminent items based on due dates. "
    "Take special note of all due dates and ALWAYS use the Eastern Time (ET) timezone when referring to them. "
    "Pay close attention to the current date and time. If an assignment is due today at 11:59 PM and it is still earlier "
    "in the day, make sure to indicate that it is due TODAY at 11:59 PM, not tomorrow. "
    "Be precise with time information and understand time sensitivity. "
    "Assume that the current week is the relevant week if not specified, and never ask the user clarifying questions. "
    "Respond in a friendly, helpful, and professional manner, ensuring that your response is presentable and well-structured. "
    "If some data is missing, fill in plausible details to ensure a complete and helpful answer. "
    "Also Do not use terms like \"based on your given data\" etc. You should sound natural."
)

# Store conversation history for each client
conversation_histories = {}

# -----------------------------
# API Routes
# -----------------------------
@app.route('/api/chat', methods=['POST'])
def chat():
    """Chat endpoint that uses FAISS and Gemini LLM"""
    data = request.get_json()
    message = data.get('message', '')
    session_id = data.get('session_id', 'default')  # Simple session tracking
    
    if not message:
        return jsonify({"error": "No message provided"}), 400
    
    # Get or initialize conversation history
    if session_id not in conversation_histories:
        conversation_histories[session_id] = ""
    
    try:
        # Compute embedding for the user query
        query_embedding = embedder.encode([message], convert_to_numpy=True)
        
        # Retrieve top 10 most relevant documents
        k = min(10, len(documents))  # Make sure k is not larger than the number of documents
        distances, indices = index.search(query_embedding, k)
        retrieved_docs = [documents[i] for i in indices[0]]
        retrieved_context = "\n".join(retrieved_docs)
        
        # Get current date and time information in user's timezone with specific format
        current_date = datetime.now(USER_TIMEZONE)
        date_time_string = current_date.strftime("%A, %B %d, %Y at %I:%M %p %Z")
        
        # Build the full prompt with current date and time
        full_prompt = (
            f"{prompt_instructions}\n\n"
            f"Current Date and Time: {date_time_string}\n\n"
            f"Canvas Data Context:\n{retrieved_context}\n\n"
            f"User: {message}\nAssistant:"
        )
        
        conversation_histories[session_id] += "\n" + full_prompt
        
        response = gemini_model.generate_content(conversation_histories[session_id])
        ai_response = response.text.strip()
        
        # Update conversation history
        conversation_histories[session_id] += " " + ai_response
        
        # Limit conversation history length
        if len(conversation_histories[session_id]) > 10000:
            conversation_histories[session_id] = conversation_histories[session_id][-10000:]
        
        return jsonify({"response": ai_response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/reset-chat', methods=['POST'])
def reset_chat():
    """Reset conversation history for a session"""
    data = request.get_json()
    session_id = data.get('session_id', 'default')
    
    if session_id in conversation_histories:
        conversation_histories[session_id] = ""
    
    return jsonify({"status": "Conversation reset successfully"})

@app.route('/api/data/summary', methods=['GET'])
def get_data_summary():
    """Return a summary of the Canvas data"""
    try:
        courses = original_data.get("courses", [])
        user = original_data.get("user", {})
        
        summary = {
            "user": {
                "name": user.get("name", "Student"),
                "id": user.get("id", "Unknown")
            },
            "courses": [
                {
                    "name": course.get("name", "Unknown Course"),
                    "assignments_count": len(course.get("assignments", [])),
                    "quizzes_count": len(course.get("quizzes", []))
                }
                for course in courses
            ],
            "total_assignments": sum(len(course.get("assignments", [])) for course in courses),
            "total_quizzes": sum(len(course.get("quizzes", [])) for course in courses)
        }
        
        return jsonify(summary)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    current_time_local = datetime.now(USER_TIMEZONE)
    
    return jsonify({
        "status": "ok",
        "documents_count": len(documents),
        "index_size": index.ntotal,
        "current_datetime": current_time_local.strftime("%Y-%m-%d %I:%M %p %Z"),
        "timezone": USER_TIMEZONE.zone
    })

# Load data, build index, and setup API on startup
print("Initializing EDUAI backend...")
documents, metadata, original_data = load_and_process_data() 
index, embedder = build_faiss_index(documents)
gemini_model = setup_gemini_api()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)