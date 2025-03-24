Here’s the markdown structure for your README file:

```markdown
# EduAI - Your AI Study Buddy

EduAI is an intelligent assistant that helps students organize their academic life by providing personalized study plans, tracking assignments, and answering questions about courses based on Canvas LMS data.

## Project Overview

This application consists of two components:

- **Backend**: Flask API that processes Canvas data, uses vector search, and integrates with Google's Gemini AI
- **Frontend**: User interface for interacting with the AI assistant

## Features
- 🤖 **AI-powered study assistant** using Google's Gemini model
- 📝 **Assignment and quiz tracking** from Canvas data
- 📅 **Personalized study planning**
- 🔍 **Semantic search** across all your course materials
- ⏰ **Time-aware responses** with timezone support

## Setup and Installation

### Prerequisites
- Python 3.8+ for the backend
- Node.js and npm for the frontend
- Google Gemini API key

### Backend Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Create a virtual environment and install dependencies:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   pip install -r requirements.txt
   ```

3. Create/verify `.env` file in the backend directory with your Gemini API key:
   ```
   GEMINI_API_KEY=your-gemini-api-key-here
   ```

4. Install `python-dotenv` if not included in `requirements.txt`:
   ```bash
   pip install python-dotenv
   ```

5. Ensure your Canvas data file (`my_canvas_data.json`) is placed in the backend directory.

6. Start the backend server:
   ```bash
   python main.py
   ```

   The backend will run on [http://localhost:5000](http://localhost:5000).

### Frontend Setup

1. Navigate to the `eduai/frontend` directory:
   ```bash
   cd eduai/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will run on [http://localhost:3000](http://localhost:3000).

## How It Works

### Data Processing:
The backend loads Canvas data from a JSON file (`my_canvas_data.json`), extracting information about courses, assignments, and quizzes.

### Vector Search:
Using FAISS and sentence transformers, the application builds a vector index for efficient semantic search.

### AI Integration:
The Google Gemini model is used to generate intelligent responses based on retrieved context.

## API Endpoints:
- **`/api/chat`**: Main endpoint for interacting with the AI
- **`/api/reset-chat`**: Resets conversation history
- **`/api/data/summary`**: Provides a summary of Canvas data
- **`/api/health`**: Status check endpoint

## Project Structure

```
eduai/
├── backend/
│   ├── main.py  # Flask server file
│   ├── my_canvas_data.json  # Canvas data file
│   └── .env  # Environment variables (Gemini API key)
├── frontend/
│   └── ...  # Frontend files (React, etc.)
└── requirements.txt  # Python dependencies
```

## Notes
This project assumes your Canvas data is already structured in the required JSON format. The AI's effectiveness depends on the quality and completeness of the Canvas data provided.
```

In the `requirements.txt` file for the backend, you should include the following packages based on the imports in `main.py`:

```
Flask==2.1.1
flask-cors==3.1.1
faiss-cpu==1.7.2
sentence-transformers==2.2.0
google-generativeai==0.1.0
python-dotenv==0.19.2
pytz==2022.1
dateutil==2.8.2
numpy==1.21.0
```

This setup will ensure that the backend and frontend are ready to run as expected.