from flask import Blueprint, request, jsonify
from .assessment_manager import AssessmentManager

assessment_bp = Blueprint('assessment', __name__, url_prefix='/api')

# Your existing routes
@assessment_bp.route('/submit-assessment', methods=['POST'])
def submit_assessment():
    # Your existing code here
    pass

@assessment_bp.route('/task-status/<task_id>', methods=['GET'])
def task_status(task_id):
    # Your existing code here
    pass

# Add the new route for calculating scores
@assessment_bp.route('/calculate-scores', methods=['POST'])
def calculate_scores():
    try:
        data = request.json
        if not data or 'answers' not in data:
            return jsonify({'error': 'Missing answers data'}), 400

        # Initialize the assessment manager and calculate scores
        assessment_mgr = AssessmentManager()
        trait_scores = assessment_mgr.calculate_scores(data['answers'])

        return jsonify({
            'trait_scores': trait_scores
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500