# EduAI: Smart Academic Assistant

EduAI is an intelligent academic assistant that helps students manage their coursework, schedule, and study plans. The application integrates with Canvas LMS data to provide personalized assistance for academic planning and organization.

## Features

- **AI-Powered Assistance**: Get answers about your courses, assignments, and quizzes
- **Interactive Calendar**: Schedule and manage your academic events
- **Smart Planning**: Generate study plans based on your upcoming deadlines
- **Beautiful UI**: Modern, responsive interface with animations and interactive elements
- **Canvas Integration**: Connects with your Canvas LMS data for personalized assistance

## Project Structure

```
EduAI/
├── backend/
│   ├── main.py                 # Flask API server
│   ├── my_canvas_data.json     # Canvas data for the AI assistant
│   └── Scraper.py              # Tool to fetch Canvas data (run separately)
├── frontend/
│   └── eduai/
│       ├── src/
│       │   ├── App.jsx         # Main application component
│       │   ├── Api/
│       │   │   └── ChatbotApi.jsx  # Chatbot interface component
│       │   ├── components/
│       │   │   ├── Experience.jsx
│       │   │   ├── Animations/
│       │   │   └── Layout/
│       │   │       ├── Cards/
│       │   │       └── Navbar/
│       │   ├── index.css
│       │   └── main.jsx
│       ├── package.json
│       └── ...
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- Python (v3.7+)
- pip (Python package manager)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install required Python packages:
   ```bash
   pip install flask flask-cors faiss-cpu numpy sentence-transformers google-generativeai python-dateutil pytz
   ```

4. Set up your API key for Google Generative AI:
   ```bash
   export GEMINI_API_KEY="your-api-key-here"  # On Windows: set GEMINI_API_KEY=your-api-key-here
   ```

5. Start the Flask server:
   ```bash
   python main.py
   ```

### Frontend Setup

1. Navigate to the frontend/eduai directory:
   ```bash
   cd frontend/eduai
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and go to:
   ```
   http://localhost:5173
   ```

## Canvas Data

### Using Existing Data
The application comes with sample Canvas data in `backend/my_canvas_data.json`. This is used by default for development.

### Using Your Own Canvas Data (Optional)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Update the `Scraper.py` file with your Canvas API key:
   ```python
   API_KEY = "your-canvas-api-key"
   ```

3. Run the scraper to fetch your Canvas data:
   ```bash
   python Scraper.py
   ```

4. This will create/update `my_canvas_data.json` with your personal Canvas information.

## Usage

1. Type your question in the chat input at the bottom of the screen.
2. For calendar-related functions:
   - Type "schedule [event]" to add events to your calendar
   - Type "calendar" to view your calendar
3. For academic questions, simply ask about your courses, assignments, due dates, etc.

## Development Notes

- The frontend is built with React, Tailwind CSS, and Framer Motion
- The backend uses Flask, FAISS for vector search, and Google's Generative AI
- Session management is implemented to maintain conversation context

