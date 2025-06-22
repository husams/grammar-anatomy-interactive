"""
Tests for content management functionality.
"""
import pytest
import json
from pathlib import Path
from unittest.mock import patch, MagicMock
from app.core.content_loader import ContentLoader, Exercise, LessonContent, GlossaryEntry


class TestContentLoader:
    """Test cases for ContentLoader class."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.content_dir = Path("test_content")
        self.loader = ContentLoader(str(self.content_dir))
        
        # Create test content structure
        self.setup_test_content()
    
    def teardown_method(self):
        """Clean up test fixtures."""
        import shutil
        if self.content_dir.exists():
            shutil.rmtree(self.content_dir)
    
    def setup_test_content(self):
        """Create test content files."""
        # Create test module directory
        module_dir = self.content_dir / "modules" / "01-test-module"
        module_dir.mkdir(parents=True, exist_ok=True)
        
        # Create test lesson file
        lesson_content = """---
title: "Test Lesson"
order: 1
module: "01-test-module"
---

# Test Lesson

This is a test lesson content.
"""
        with open(module_dir / "lesson.md", "w") as f:
            f.write(lesson_content)
        
        # Create test exercises file
        exercises_data = [
            {
                "id": "ex1",
                "type": "identification",
                "prompt": "Identify the verb in: The cat runs.",
                "answer": "runs",
                "explanation": "Runs is the action verb.",
                "difficulty": "easy"
            },
            {
                "id": "ex2",
                "type": "multiple_choice",
                "prompt": "What type of word is 'cat'?",
                "options": ["Noun", "Verb", "Adjective", "Adverb"],
                "answer": "Noun",
                "explanation": "Cat is a noun because it names a thing.",
                "difficulty": "easy"
            }
        ]
        with open(module_dir / "exercises.json", "w") as f:
            json.dump(exercises_data, f)
        
        # Create test glossary file
        glossary_data = [
            {
                "term": "Noun",
                "definition": "A word that names a person, place, thing, or idea.",
                "examples": ["cat", "teacher", "happiness"],
                "related_lessons": ["01-test-module"],
                "category": "Parts of Speech"
            },
            {
                "term": "Verb",
                "definition": "A word that expresses an action or state of being.",
                "examples": ["run", "is", "think"],
                "related_lessons": ["01-test-module"],
                "category": "Parts of Speech"
            }
        ]
        with open(self.content_dir / "glossary.json", "w") as f:
            json.dump(glossary_data, f)
    
    def test_get_modules(self):
        """Test getting all modules."""
        modules = self.loader.get_modules()
        
        assert len(modules) == 1
        module = modules[0]
        assert module["id"] == "01-test-module"
        assert module["title"] == "Test Lesson"
        assert module["order"] == 1
        assert module["module"] == "01-test-module"
    
    def test_get_lesson_content(self):
        """Test getting lesson content."""
        lesson = self.loader.get_lesson_content("01-test-module")
        
        assert lesson is not None
        assert lesson.title == "Test Lesson"
        assert lesson.order == 1
        assert lesson.module == "01-test-module"
        assert "# Test Lesson" in lesson.content
    
    def test_get_exercises(self):
        """Test getting exercises."""
        exercises = self.loader.get_exercises("01-test-module")
        
        assert len(exercises) == 2
        
        # Check first exercise
        ex1 = exercises[0]
        assert ex1.id == "ex1"
        assert ex1.type == "identification"
        assert ex1.prompt == "Identify the verb in: The cat runs."
        assert ex1.answer == "runs"
        assert ex1.difficulty == "easy"
        
        # Check second exercise
        ex2 = exercises[1]
        assert ex2.id == "ex2"
        assert ex2.type == "multiple_choice"
        assert ex2.options == ["Noun", "Verb", "Adjective", "Adverb"]
        assert ex2.answer == "Noun"
    
    def test_get_glossary(self):
        """Test getting glossary entries."""
        glossary = self.loader.get_glossary()
        
        assert len(glossary) == 2
        
        # Check first entry
        noun_entry = next(entry for entry in glossary if entry.term == "Noun")
        assert noun_entry.definition == "A word that names a person, place, thing, or idea."
        assert noun_entry.examples == ["cat", "teacher", "happiness"]
        assert noun_entry.category == "Parts of Speech"
        
        # Check second entry
        verb_entry = next(entry for entry in glossary if entry.term == "Verb")
        assert verb_entry.definition == "A word that expresses an action or state of being."
        assert verb_entry.examples == ["run", "is", "think"]
    
    def test_search_glossary(self):
        """Test glossary search functionality."""
        # Search by term
        results = self.loader.search_glossary("Noun")
        assert len(results) == 1
        assert results[0].term == "Noun"
        
        # Search by definition
        results = self.loader.search_glossary("action")
        assert len(results) == 1
        assert results[0].term == "Verb"
        
        # Search by example
        results = self.loader.search_glossary("cat")
        assert len(results) == 1
        assert results[0].term == "Noun"
        
        # Search with no results
        results = self.loader.search_glossary("nonexistent")
        assert len(results) == 0
    
    def test_get_glossary_by_category(self):
        """Test getting glossary entries by category."""
        results = self.loader.get_glossary_by_category("Parts of Speech")
        assert len(results) == 2
        assert all(entry.category == "Parts of Speech" for entry in results)
        
        # Test with non-existent category
        results = self.loader.get_glossary_by_category("Nonexistent")
        assert len(results) == 0
    
    def test_validate_content(self):
        """Test content validation."""
        errors = self.loader.validate_content()
        
        # Should be no errors with valid content
        assert not errors["modules"]
        assert not errors["exercises"]
        assert not errors["glossary"]
    
    def test_validate_content_with_invalid_exercise_type(self):
        """Test validation with invalid exercise type."""
        # Create invalid exercise
        invalid_exercises = [
            {
                "id": "ex3",
                "type": "invalid_type",
                "prompt": "Test prompt",
                "answer": "test",
                "explanation": "Test explanation",
                "difficulty": "easy"
            }
        ]
        
        with open(self.content_dir / "modules" / "01-test-module" / "exercises.json", "w") as f:
            json.dump(invalid_exercises, f)
        
        # Clear cache to reload
        self.loader.clear_cache()
        
        errors = self.loader.validate_content()
        assert len(errors["exercises"]) == 1
        assert "invalid_type" in errors["exercises"][0]
    
    def test_get_nonexistent_module(self):
        """Test getting non-existent module."""
        lesson = self.loader.get_lesson_content("nonexistent")
        assert lesson is None
        
        exercises = self.loader.get_exercises("nonexistent")
        assert exercises == []
    
    def test_cache_functionality(self):
        """Test that caching works correctly."""
        # First call should populate cache
        modules1 = self.loader.get_modules()
        
        # Second call should use cache
        modules2 = self.loader.get_modules()
        
        assert modules1 == modules2
        
        # Clear cache
        self.loader.clear_cache()
        
        # Should reload from files
        modules3 = self.loader.get_modules()
        assert modules3 == modules1
    
    def test_exercise_validation(self):
        """Test exercise model validation."""
        # Valid exercise
        valid_exercise = Exercise(
            id="test",
            type="identification",
            prompt="Test prompt",
            answer="test",
            explanation="Test explanation"
        )
        assert valid_exercise.id == "test"
        assert valid_exercise.type == "identification"
        
        # Exercise with options
        mc_exercise = Exercise(
            id="mc_test",
            type="multiple_choice",
            prompt="Test prompt",
            answer="A",
            explanation="Test explanation",
            options=["A", "B", "C", "D"]
        )
        assert mc_exercise.options == ["A", "B", "C", "D"]
    
    def test_lesson_content_validation(self):
        """Test lesson content model validation."""
        lesson = LessonContent(
            title="Test Lesson",
            order=1,
            module="test-module",
            content="# Test Content"
        )
        assert lesson.title == "Test Lesson"
        assert lesson.order == 1
        assert lesson.module == "test-module"
        assert lesson.content == "# Test Content"
    
    def test_glossary_entry_validation(self):
        """Test glossary entry model validation."""
        entry = GlossaryEntry(
            term="Test Term",
            definition="Test definition",
            examples=["example1", "example2"],
            related_lessons=["lesson1"],
            category="Test Category"
        )
        assert entry.term == "Test Term"
        assert entry.definition == "Test definition"
        assert entry.examples == ["example1", "example2"]
        assert entry.related_lessons == ["lesson1"]
        assert entry.category == "Test Category"


class TestContentLoaderWithoutFrontmatter:
    """Test ContentLoader without frontmatter library."""
    
    @patch('app.core.content_loader.frontmatter', None)
    def test_get_modules_without_frontmatter(self):
        """Test getting modules without frontmatter library."""
        content_dir = Path("test_content_no_frontmatter")
        content_dir.mkdir(exist_ok=True)
        
        # Create simple lesson file without frontmatter
        module_dir = content_dir / "modules" / "01-test"
        module_dir.mkdir(parents=True, exist_ok=True)
        
        with open(module_dir / "lesson.md", "w") as f:
            f.write("# Test Lesson\n\nThis is content.")
        
        loader = ContentLoader(str(content_dir))
        modules = loader.get_modules()
        
        assert len(modules) == 1
        assert modules[0]["id"] == "01-test"
        assert modules[0]["title"] == "01 Test"  # Fallback title
        
        # Cleanup
        import shutil
        shutil.rmtree(content_dir)
    
    @patch('app.core.content_loader.frontmatter', None)
    def test_get_lesson_content_without_frontmatter(self):
        """Test getting lesson content without frontmatter library."""
        content_dir = Path("test_content_no_frontmatter")
        content_dir.mkdir(exist_ok=True)
        
        module_dir = content_dir / "modules" / "01-test"
        module_dir.mkdir(parents=True, exist_ok=True)
        
        with open(module_dir / "lesson.md", "w") as f:
            f.write("# Test Lesson\n\nThis is content.")
        
        loader = ContentLoader(str(content_dir))
        lesson = loader.get_lesson_content("01-test")
        
        assert lesson is not None
        assert lesson.title == "01 Test"  # Fallback title
        assert lesson.content == "# Test Lesson\n\nThis is content."
        
        # Cleanup
        import shutil
        shutil.rmtree(content_dir) 