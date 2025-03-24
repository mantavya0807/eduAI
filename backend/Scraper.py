import json
from canvasapi import Canvas
from datetime import datetime, timezone

# Canvas API configuration
API_URL = "https://canvas.instructure.com"  # Update if needed
API_KEY = "ENTER_YOUR_API_KEY"  # Replace with your personal API token

# Initialize the Canvas object
canvas = Canvas(API_URL, API_KEY)

# Dictionary to store your data
my_data = {}

print("Retrieving current user info...")
# 1. Retrieve current user information
current_user = canvas.get_current_user()
my_data['user'] = {
    'id': current_user.id,
    'name': current_user.name,
    'sortable_name': getattr(current_user, 'sortable_name', None),
    'login_id': getattr(current_user, 'login_id', None)
}

# Set the cutoff date (January 1, 2025) with UTC timezone
cutoff_date = datetime(2025, 1, 1, tzinfo=timezone.utc)

print("Retrieving your courses (processing all courses if start date is not defined)...")
# 2. Retrieve courses for the current user (only courses you are enrolled in)
courses = list(canvas.get_courses())
my_data['courses'] = []

for course in courses:
    # Ensure the course has a name
    course_name = getattr(course, 'name', 'Unknown Course')
    
    # Check the course's start date only if defined.
    if hasattr(course, 'start_at') and course.start_at:
        try:
            course_start = datetime.fromisoformat(course.start_at.replace("Z", "+00:00"))
        except Exception as e:
            print(f"Error parsing start_at for course {course_name}: {e}")
            course_start = None
        # Only skip the course if the start date is defined and before the cutoff.
        if course_start and course_start < cutoff_date:
            print(f"Skipping course {course_name} (start_at: {course.start_at})")
            continue

    print(f"Processing course: {course_name}")
    course_data = {
        'id': course.id,
        'name': course_name,
        'course_code': getattr(course, 'course_code', None),
        'description': getattr(course, 'description', None),
        'start_at': getattr(course, 'start_at', None),
        'end_at': getattr(course, 'end_at', None)
    }

    # 2a. Retrieve your enrollment data for this course
    try:
        enrollments = list(course.get_enrollments(type=['student']))
        my_enrollment = next((e for e in enrollments if e.user_id == current_user.id), None)
        if my_enrollment:
            course_data['enrollment'] = {
                'user_id': my_enrollment.user_id,
                'role': my_enrollment.role,
                'grades': getattr(my_enrollment, 'grades', {})
            }
        else:
            course_data['enrollment'] = "No enrollment found for current user"
    except Exception as e:
        course_data['enrollment'] = f"Error retrieving enrollment: {e}"

    # 2b. Retrieve assignments and your submission for each assignment
    try:
        assignments = list(course.get_assignments())
        course_data['assignments'] = []
        for assignment in assignments:
            try:
                submission = assignment.get_submission(current_user.id)
                submission_data = {
                    'submitted_at': submission.submitted_at,
                    'score': submission.score,
                    'grade': submission.grade,
                    'workflow_state': submission.workflow_state,
                    'submission_comments': getattr(submission, 'submission_comments', None)
                }
            except Exception as sub_e:
                submission_data = f"Error retrieving submission: {sub_e}"
            course_data['assignments'].append({
                'id': assignment.id,
                'name': assignment.name,
                'due_at': assignment.due_at,
                'description': assignment.description,
                'points_possible': assignment.points_possible,
                'submission': submission_data
            })
    except Exception as e:
        course_data['assignments'] = f"Error retrieving assignments: {e}"

    # 2c. Retrieve quizzes and your quiz submission for each quiz
    try:
        quizzes = list(course.get_quizzes())
        course_data['quizzes'] = []
        for quiz in quizzes:
            try:
                submissions = list(course.get_quiz_submissions(quiz_id=quiz.id, user_id=current_user.id))
                if submissions:
                    submission = submissions[0]
                    quiz_submission_data = {
                        'score': getattr(submission, 'score', None),
                        'graded_at': getattr(submission, 'graded_at', None)
                    }
                else:
                    quiz_submission_data = "No submission"
            except Exception as qsub_e:
                quiz_submission_data = f"Error retrieving quiz submission: {qsub_e}"
            course_data['quizzes'].append({
                'id': quiz.id,
                'title': quiz.title,
                'due_at': quiz.due_at,
                'description': quiz.description,
                'points_possible': getattr(quiz, 'points_possible', None),
                'submission': quiz_submission_data
            })
    except Exception as e:
        course_data['quizzes'] = f"Error retrieving quizzes: {e}"

    # 2d. Retrieve discussion topics that you authored
    try:
        discussions = list(course.get_discussion_topics())
        my_discussions = []
        for discussion in discussions:
            if hasattr(discussion, 'author') and discussion.author.get('id', None) == current_user.id:
                my_discussions.append({
                    'id': discussion.id,
                    'title': discussion.title,
                    'message': discussion.message,
                    'posted_at': discussion.posted_at
                })
        course_data['discussions'] = my_discussions
    except Exception as e:
        course_data['discussions'] = f"Error retrieving discussions: {e}"

    # 2e. Retrieve modules and module items
    try:
        modules = list(course.get_modules())
        course_data['modules'] = []
        for module in modules:
            module_data = {
                'id': module.id,
                'name': module.name,
                'items': []
            }
            try:
                module_items = list(module.get_module_items())
                for item in module_items:
                    module_data['items'].append({
                        'id': item.id,
                        'title': item.title,
                        'type': item.type,
                        'content_id': item.content_id,
                        'published': item.published
                    })
            except Exception as mi_e:
                module_data['items'] = f"Error retrieving module items: {mi_e}"
            course_data['modules'].append(module_data)
    except Exception as e:
        course_data['modules'] = f"Error retrieving modules: {e}"

    # 2f. Retrieve course pages (detailed course content)
    try:
        pages = list(course.get_pages())
        course_data['pages'] = []
        for page in pages:
            course_data['pages'].append({
                'url': page.url,
                'title': page.title,
                'body': page.body
            })
    except Exception as e:
        course_data['pages'] = f"Error retrieving pages: {e}"

    # 2g. Retrieve gradebook history feed (convert response to JSON)
    try:
        gb_response = course._requester.request("GET", f"courses/{course.id}/gradebook_history/feed")
        gb_history = gb_response.json()
        course_data['gradebook_history'] = gb_history
    except Exception as e:
        course_data['gradebook_history'] = f"Error retrieving gradebook history: {e}"

    my_data['courses'].append(course_data)

# Dump the collected data into a JSON file in the same directory
output_filename = "my_canvas_data.json"
with open(output_filename, "w", encoding="utf-8") as f:
    json.dump(my_data, f, indent=4)

print(f"\nData retrieval complete. Data dumped to {output_filename}")
