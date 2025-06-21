from typing import Dict, Any, Tuple
from app.schemas.exercise import ExerciseType


class ExerciseEvaluator:
    """Evaluates exercise submissions based on exercise type."""
    
    @staticmethod
    def evaluate_exercise(
        exercise_type: ExerciseType,
        exercise_content: Dict[str, Any],
        user_answer: Dict[str, Any]
    ) -> Tuple[bool, float]:
        """
        Evaluate an exercise submission.
        
        Returns:
            Tuple of (is_correct: bool, score: float)
        """
        if exercise_type == ExerciseType.IDENTIFICATION:
            return ExerciseEvaluator._evaluate_identification(exercise_content, user_answer)
        elif exercise_type == ExerciseType.MULTIPLE_CHOICE:
            return ExerciseEvaluator._evaluate_multiple_choice(exercise_content, user_answer)
        elif exercise_type == ExerciseType.FILL_IN_BLANK:
            return ExerciseEvaluator._evaluate_fill_in_blank(exercise_content, user_answer)
        elif exercise_type == ExerciseType.SENTENCE_CONSTRUCTION:
            return ExerciseEvaluator._evaluate_sentence_construction(exercise_content, user_answer)
        else:
            raise ValueError(f"Unknown exercise type: {exercise_type}")
    
    @staticmethod
    def _validate_exercise_content(exercise_type: ExerciseType, content: Dict[str, Any]) -> None:
        """Validate exercise content structure based on type."""
        if not isinstance(content, dict):
            raise ValueError("Content must be a dictionary")
        
        if exercise_type == ExerciseType.IDENTIFICATION:
            if "correct_identifications" not in content:
                raise ValueError("Identification exercise must have 'correct_identifications' field")
            if not isinstance(content["correct_identifications"], dict):
                raise ValueError("correct_identifications must be a dictionary")
        
        elif exercise_type == ExerciseType.MULTIPLE_CHOICE:
            if "correct_answer" not in content:
                raise ValueError("Multiple choice exercise must have 'correct_answer' field")
            if "options" not in content:
                raise ValueError("Multiple choice exercise must have 'options' field")
            if not isinstance(content["options"], list):
                raise ValueError("options must be a list")
        
        elif exercise_type == ExerciseType.FILL_IN_BLANK:
            if "correct_answers" not in content:
                raise ValueError("Fill-in-blank exercise must have 'correct_answers' field")
            if not isinstance(content["correct_answers"], dict):
                raise ValueError("correct_answers must be a dictionary")
        
        elif exercise_type == ExerciseType.SENTENCE_CONSTRUCTION:
            if "correct_order" not in content:
                raise ValueError("Sentence construction exercise must have 'correct_order' field")
            if not isinstance(content["correct_order"], list):
                raise ValueError("correct_order must be a list")
            if "words" not in content:
                raise ValueError("Sentence construction exercise must have 'words' field")
            if not isinstance(content["words"], list):
                raise ValueError("words must be a list")
    
    @staticmethod
    def _evaluate_identification(content: Dict[str, Any], answer: Dict[str, Any]) -> Tuple[bool, float]:
        """Evaluate identification exercise (tap & tag)."""
        correct_identifications = content.get("correct_identifications", {})
        user_identifications = answer.get("identifications", {})
        
        if not correct_identifications or not user_identifications:
            return False, 0.0
        
        correct_count = 0
        total_count = len(correct_identifications)
        
        for word_id, expected_type in correct_identifications.items():
            if word_id in user_identifications:
                user_type = user_identifications[word_id]
                if user_type.lower() == expected_type.lower():
                    correct_count += 1
        
        score = correct_count / total_count if total_count > 0 else 0.0
        is_correct = score >= 0.8  # 80% threshold for correct
        
        return is_correct, score
    
    @staticmethod
    def _evaluate_multiple_choice(content: Dict[str, Any], answer: Dict[str, Any]) -> Tuple[bool, float]:
        """Evaluate multiple choice exercise."""
        # Validate answer format
        if not isinstance(answer, dict):
            raise ValueError("Answer must be a dictionary")
        if "selected_option" not in answer:
            raise ValueError("Multiple choice answer must have 'selected_option' field")
        
        correct_answer = content.get("correct_answer")
        user_answer_value = answer.get("selected_option")
        
        if correct_answer is None or user_answer_value is None:
            return False, 0.0
        
        is_correct = str(user_answer_value).lower() == str(correct_answer).lower()
        score = 1.0 if is_correct else 0.0
        
        return is_correct, score
    
    @staticmethod
    def _evaluate_fill_in_blank(content: Dict[str, Any], answer: Dict[str, Any]) -> Tuple[bool, float]:
        """Evaluate fill-in-the-blank exercise."""
        correct_answers = content.get("correct_answers", {})
        user_answers = answer.get("answers", {})
        
        if not correct_answers or not user_answers:
            return False, 0.0
        
        correct_count = 0
        total_count = len(correct_answers)
        
        for blank_id, expected_answer in correct_answers.items():
            if blank_id in user_answers:
                user_answer_value = user_answers[blank_id]
                # Allow for case-insensitive comparison and slight variations
                if str(user_answer_value).lower().strip() == str(expected_answer).lower().strip():
                    correct_count += 1
        
        score = correct_count / total_count if total_count > 0 else 0.0
        is_correct = score >= 0.8  # 80% threshold for correct
        
        return is_correct, score
    
    @staticmethod
    def _evaluate_sentence_construction(content: Dict[str, Any], answer: Dict[str, Any]) -> Tuple[bool, float]:
        """Evaluate sentence construction exercise (drag & drop)."""
        correct_order = content.get("correct_order", [])
        user_order = answer.get("word_order", [])
        
        if not correct_order or not user_order:
            return False, 0.0
        
        if len(correct_order) != len(user_order):
            return False, 0.0
        
        correct_positions = 0
        total_positions = len(correct_order)
        
        for i, correct_word in enumerate(correct_order):
            if i < len(user_order) and user_order[i] == correct_word:
                correct_positions += 1
        
        score = correct_positions / total_positions if total_positions > 0 else 0.0
        is_correct = score >= 0.8  # 80% threshold for correct
        
        return is_correct, score 