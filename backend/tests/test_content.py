"""
Tests for content management functionality.
"""
import pytest
import json
from pathlib import Path
from unittest.mock import patch, MagicMock
from app.core.content_loader import ContentLoader, Exercise, LessonContent, GlossaryEntry


class TestContentLoader:
    """Test cases for ContentLoader class using real content data."""

    @classmethod
    def setup_class(cls):
        # Use the actual content directory
        cls.loader = ContentLoader("../content")

    def test_get_modules(self):
        modules = self.loader.get_modules()
        assert len(modules) > 0
        module = modules[0]
        assert module["id"] == "01-nouns-verbs"
        assert module["title"] == "Nouns and Verbs"
        assert module["order"] == 1
        assert module["module"] == "01-nouns-verbs"

    def test_get_lesson_content(self):
        lesson = self.loader.get_lesson_content("01-nouns-verbs")
        assert lesson is not None
        assert lesson.title == "Nouns and Verbs"
        assert lesson.order == 1
        assert lesson.module == "01-nouns-verbs"
        assert "Nouns" in lesson.content
    
    def test_get_exercises(self):
        """Test getting exercises."""
        exercises = self.loader.get_exercises("01-nouns-verbs")
        
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
        assert ex2.type == "identification"
        assert ex2.options is None
        assert ex2.answer == "children"
    
    def test_get_glossary(self):
        """Test getting glossary entries."""
        glossary = self.loader.get_glossary()
        assert len(glossary) > 0
        # Check for a known entry
        noun_entry = next(entry for entry in glossary if entry.term == "Noun")
        assert "person" in noun_entry.definition
        assert "cat" in noun_entry.examples
    
    def test_search_glossary(self):
        """Test glossary search functionality."""
        results = self.loader.search_glossary("Noun")
        assert any(entry.term == "Noun" for entry in results)
        
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
        assert len(results) > 0
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