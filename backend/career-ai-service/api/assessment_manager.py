import json
from typing import Dict, List, Union
import os
import logging

class AssessmentManager:
    def __init__(self):
        # Initialize all traits with default score 0.0
        self.trait_scores = {
            'Analytical Thinking': 0.0,
            'Critical Thinking': 0.0,
            'Problem-Solving': 0.0,
            'Logical Reasoning': 0.0,
            'Decision-Making': 0.0,
            'Strategic Planning': 0.0,
            'Research Skills': 0.0,
            'Data Analysis': 0.0,
            'Verbal Communication': 0.0,
            'Written Communication': 0.0,
            'Presentation Skills': 0.0,
            'Active Listening': 0.0,
            'Negotiation': 0.0,
            'Persuasion': 0.0,
            'Public Speaking': 0.0,
            'Teamwork': 0.0,
            'Collaboration': 0.0,
            'Empathy': 0.0,
            'Conflict Resolution': 0.0,
            'Networking': 0.0,
            'Relationship Building': 0.0,
            'Technical Aptitude': 0.0,
            'Coding/Programming': 0.0,
            'Mathematical Skills': 0.0,
            'Scientific Knowledge': 0.0,
            'Digital Literacy': 0.0,
            'Creativity': 0.0,
            'Innovation': 0.0,
            'Design Thinking': 0.0,
            'Artistic Skills': 0.0,
            'Content Creation': 0.0,
            'Leadership': 0.0,
            'Time Management': 0.0,
            'Project Management': 0.0,
            'Organizational Skills': 0.0,
            'Entrepreneurial Mindset': 0.0,
            'Adaptability': 0.0,
            'Work Ethic': 0.0,
            'Resilience': 0.0,
            'Attention to Detail': 0.0
        }
        
        try:
            # Load scoring system
            scoring_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'config', 'scoring_system.json')
            if not os.path.exists(scoring_path):
                raise FileNotFoundError(f"Scoring system file not found at {scoring_path}")
                
            with open(scoring_path, 'r') as f:
                self.scoring_system = json.load(f)
            
            self._validate_scoring_system()
            
        except Exception as e:
            logging.error(f"Failed to initialize AssessmentManager: {str(e)}")
            raise

    def _validate_scoring_system(self):
        """Validate that all traits in scoring system exist in trait_scores."""
        missing_traits = set()
        
        for question in self.scoring_system.values():
            for trait in question.keys():
                if trait not in self.trait_scores:
                    missing_traits.add(trait)
        
        if missing_traits:
            logging.error(f"Found undefined traits in scoring system: {missing_traits}")
            raise ValueError(f"Scoring system contains undefined traits: {missing_traits}")

    def calculate_scores(self, answers: Dict[str, Union[str, List[str]]]) -> Dict[str, float]:
        """Calculate trait scores based on questionnaire answers."""
        try:
            # Reset scores
            for trait in self.trait_scores:
                self.trait_scores[trait] = 0.0
                
            # Process each answer
            for question_id, answer in answers.items():
                if question_id not in self.scoring_system:
                    continue

                question_data = self.scoring_system[question_id]
                selected_answers = [answer] if isinstance(answer, str) else answer
                
                for trait in question_data:
                    trait_values = question_data[trait]
                    for ans in selected_answers:
                        if ans in trait_values:
                            self.trait_scores[trait] += trait_values[ans]
            
            # Normalize scores
            return self._normalize_scores()
            
        except Exception as e:
            logging.error(f"Score calculation failed: {str(e)}")
            raise

    def _normalize_scores(self) -> Dict[str, float]:
        """Normalize trait scores to 0-100 range based on maximum possible scores."""
        max_possible = {trait: 0.0 for trait in self.trait_scores}
        
        # Calculate maximum possible score for each trait
        for question in self.scoring_system.values():
            for trait, options in question.items():
                if options:
                    max_in_question = max(options.values())
                    max_possible[trait] += max_in_question
        
        # Normalize scores
        normalized = {}
        for trait, score in self.trait_scores.items():
            if max_possible[trait] > 0:
                normalized[trait] = round((score / max_possible[trait]) * 100, 2)
            else:
                normalized[trait] = 0.0
                
        return normalized

    def get_career_prediction_prompt(self, trait_scores: Dict[str, float], student_info: Dict) -> str:
        """Generate prompt for career prediction based on trait scores."""
        return f"""Based on the following comprehensive assessment of {student_info.get('name', 'the student')}:

Trait Scores Analysis:
{json.dumps(trait_scores, indent=2)}

Student Profile:
- Age: {student_info.get('age', 'Not provided')}
- Academic Background: {student_info.get('academic_info', 'Not provided')}
- Interests: {student_info.get('interests', 'Not provided')}
- Notable Achievements: {student_info.get('achievements', 'Not provided')}

Please provide a detailed career analysis including:
1. Top 5 recommended career paths based on the trait scores
2. Required skills and development roadmap for each career
3. Educational requirements and recommended certifications
4. Industry growth prospects and future outlook
5. Potential challenges and strategies to overcome them

Format the response in clear sections with detailed explanations for each recommendation."""