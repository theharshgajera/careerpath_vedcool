# D:\new backup latest\career-guide - Copy\backend\career-ai-service\app.py

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import logging
import json
import os
from dotenv import load_dotenv
from api.prompt_manager import extract_career_goal, generate_topic_reports
from api.gemini_client import setup_gemini_api
from api.assessment_manager import AssessmentManager
from reports.report_builder import build_report_data
from reports.pdf_generator import generate_pdf_report
import threading
import uuid

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s: %(message)s',
    handlers=[logging.FileHandler('career_guidance.log'), logging.StreamHandler()]
)

app = Flask(__name__)
CORS(app)

# Initialize services
assessment_manager = AssessmentManager()

# Configure Gemini API on startup
try:
    setup_gemini_api()
except Exception as e:
    logging.error(f"Failed to initialize Gemini API: {str(e)}")
    exit(1)

# Define report storage directory
REPORTS_DIR = "D:/new backup latest/career-guide - Copy/backend/career-ai-service/reportss"
os.makedirs(REPORTS_DIR, exist_ok=True)

# Dictionary to track task statuses
tasks = {}

@app.route('/api/calculate-scores', methods=['POST'])
def calculate_scores():
    """Calculate trait scores based on questionnaire answers without generating a report."""
    try:
        data = request.get_json()
        if not data or 'answers' not in data:
            return jsonify({"error": "Missing answers data"}), 400
        if not isinstance(data['answers'], dict):
            return jsonify({"error": "Invalid answers format"}), 400

        # Calculate trait scores using the assessment manager
        trait_scores = assessment_manager.calculate_scores(data['answers'])
        
        return jsonify({
            "message": "Skill scores calculated successfully",
            "trait_scores": trait_scores
        }), 200

    except Exception as e:
        logging.error(f"Error calculating scores: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to calculate skill scores"}), 500

@app.route('/api/submit-assessment', methods=['POST'])
def submit_assessment():
    """Initiate assessment submission and generate career report in the background."""
    try:
        data = request.get_json()
        if not data or 'answers' not in data:
            return jsonify({"error": "Missing answers data"}), 400
        if not isinstance(data['answers'], dict):
            return jsonify({"error": "Invalid answers format"}), 400

        # Generate a unique task ID
        task_id = str(uuid.uuid4())
        tasks[task_id] = {'status': 'processing'}

        # Start report generation in a background thread
        thread = threading.Thread(target=generate_report, args=(data, task_id))
        thread.start()

        return jsonify({"message": "Report generation started", "task_id": task_id}), 202

    except Exception as e:
        logging.error(f"Error starting report generation: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to start report generation"}), 500

def generate_report(data, task_id):
    """Generate the career report and update task status."""
    try:
        # Calculate trait scores
        trait_scores = assessment_manager.calculate_scores(data['answers'])
        
        # Extract student information
        student_name = data.get('studentName', 'Student').strip()
        student_info = {
            'name': student_name,
            'age': str(data.get('age', 'Not provided')),
            'academic_info': str(data.get('academicInfo', 'Not provided')),
            'interests': str(data.get('interests', 'Not provided')),
            'achievements': [
                str(data.get('answers', {}).get('question13', 'None')),
                str(data.get('answers', {}).get('question30', 'None'))
            ]
        }
        
        # Extract career goal
        career_goal = extract_career_goal(list(data['answers'].values()))
        if not career_goal:
            tasks[task_id] = {'status': 'error', 'error': "Failed to extract career goal"}
            return
        
        # Generate report sections
        context = f"""
        Trait Scores: {json.dumps(trait_scores)}
        Student Info: {json.dumps(student_info)}
        """
        report_sections = generate_topic_reports(context.strip(), career_goal, student_info['name'])
        if not report_sections:
            tasks[task_id] = {'status': 'error', 'error': "Failed to generate report sections"}
            return
        
        # Build report data
        report_data = build_report_data(student_info['name'], career_goal, report_sections)

        # Generate the PDF
        pdf_filename = f"{student_name.replace(' ', '_')}_Career_Report.pdf"
        pdf_path = os.path.join(REPORTS_DIR, pdf_filename)
        generate_pdf_report(report_data, pdf_path)

        # Update task status with report URL
        tasks[task_id] = {'status': 'completed', 'report_url': f"/api/download-report/{pdf_filename}"}

    except Exception as e:
        logging.error(f"Report generation error: {str(e)}", exc_info=True)
        tasks[task_id] = {'status': 'error', 'error': str(e)}

@app.route('/api/task-status/<task_id>', methods=['GET'])
def task_status(task_id):
    """Check the status of a report generation task."""
    task = tasks.get(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404
    return jsonify(task)

@app.route('/api/download-report/<filename>', methods=['GET'])
def download_report(filename):
    filename = filename.strip()  # Remove unwanted spaces
    expected_path = os.path.join(REPORTS_DIR, filename)

    # Debugging logs
    logging.info(f"Received request for: {repr(filename)}")
    logging.info(f"Checking path: {expected_path}")

    if not os.path.exists(expected_path):
        logging.error(f"File not found at: {expected_path}")
        return jsonify({"error": "File not found"}), 404

    return send_from_directory(REPORTS_DIR, filename, as_attachment=True)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001, debug=False)