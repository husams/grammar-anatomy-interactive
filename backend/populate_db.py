#!/usr/bin/env python3
"""
Database Population Script for Grammar Anatomy App

This script populates the database with sample modules, lessons, and exercises
from the content directory for testing and development purposes.
"""

import os
import json
import sys
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import markdown
import frontmatter

# Add the app directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings

# Import Base first to avoid circular imports
from app.db.base import Base, get_db


def create_database_session():
    """Create database session.""" 
    # Import models here to avoid circular imports
    from app.models.module import Module
    from app.models.lesson import Lesson
    from app.models.exercise import Exercise
    
    engine = create_engine(settings.DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return SessionLocal()


def load_lesson_content(lesson_file_path):
    """Load lesson content from markdown file with frontmatter."""
    try:
        with open(lesson_file_path, 'r', encoding='utf-8') as f:
            post = frontmatter.load(f)
            return {
                'title': post.metadata.get('title', 'Untitled Lesson'),
                'order': post.metadata.get('order', 1),
                'module': post.metadata.get('module', ''),
                'content': post.content
            }
    except Exception as e:
        print(f"Error loading lesson {lesson_file_path}: {e}")
        return None


def load_exercises(exercises_file_path):
    """Load exercises from JSON file."""
    try:
        with open(exercises_file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading exercises {exercises_file_path}: {e}")
        return []


def populate_modules_and_lessons(db):
    """Populate database with modules and lessons from content directory."""
    # Import models here to avoid circular imports
    from app.models.module import Module
    from app.models.lesson import Lesson
    from app.models.exercise import Exercise
    
    # Get the content directory path
    content_dir = Path(__file__).parent.parent / "content" / "modules"
    
    if not content_dir.exists():
        print(f"Content directory not found: {content_dir}")
        return
    
    print(f"Loading content from: {content_dir}")
    
    # Clear existing data (optional - comment out if you want to preserve data)
    print("Clearing existing modules, lessons, and exercises...")
    db.query(Exercise).delete()
    db.query(Lesson).delete()
    db.query(Module).delete()
    db.commit()
    
    # Process each module directory
    module_dirs = sorted([d for d in content_dir.iterdir() if d.is_dir()])
    
    for module_dir in module_dirs:
        print(f"\nProcessing module: {module_dir.name}")
        
        lesson_file = module_dir / "lesson.md"
        exercises_file = module_dir / "exercises.json"
        
        if not lesson_file.exists():
            print(f"  No lesson.md found in {module_dir.name}, skipping...")
            continue
        
        # Load lesson content
        lesson_data = load_lesson_content(lesson_file)
        if not lesson_data:
            print(f"  Failed to load lesson data for {module_dir.name}")
            continue
        
        # Extract module order from directory name (e.g., "01-nouns-verbs" -> 1)
        try:
            module_order = int(module_dir.name.split('-')[0])
        except (ValueError, IndexError):
            print(f"  Could not extract order from {module_dir.name}, using order 999")
            module_order = 999
        
        # Create module title from directory name
        module_title = module_dir.name.replace('-', ' ').title()
        if lesson_data['title']:
            # Use the lesson title if it's more descriptive
            module_title = lesson_data['title']
        
        # Create module
        module = Module(
            title=module_title,
            order=module_order
        )
        db.add(module)
        db.flush()  # Get the module ID
        
        print(f"  Created module: {module.title} (Order: {module.order})")
        
        # Create lesson
        lesson = Lesson(
            module_id=module.id,
            title=lesson_data['title'],
            content=lesson_data['content'],
            order=lesson_data['order']
        )
        db.add(lesson)
        db.flush()  # Get the lesson ID
        
        print(f"    Created lesson: {lesson.title}")
        
        # Load and create exercises if they exist
        if exercises_file.exists():
            exercises_data = load_exercises(exercises_file)
            
            for i, exercise_data in enumerate(exercises_data):
                try:
                    exercise = Exercise(
                        lesson_id=lesson.id,
                        title=exercise_data.get('title', f'Exercise {i+1}'),
                        type=exercise_data.get('type', 'multiple_choice'),
                        question=exercise_data.get('question', ''),
                        options=exercise_data.get('options', []),
                        correct_answer=exercise_data.get('correct_answer', ''),
                        explanation=exercise_data.get('explanation', ''),
                        order=i + 1
                    )
                    db.add(exercise)
                    print(f"      Created exercise: {exercise.title}")
                    
                except Exception as e:
                    print(f"      Error creating exercise {i+1}: {e}")
                    continue
        
        else:
            print(f"    No exercises.json found for {module_dir.name}")
    
    # Commit all changes
    db.commit()
    print(f"\n✅ Database population completed successfully!")


def create_additional_modules(db):
    """Create additional empty modules for testing the module list."""
    # Import models here to avoid circular imports
    from app.models.module import Module
    from app.models.lesson import Lesson
    
    additional_modules = [
        {"title": "Adjectives: Describing Words", "order": 3},
        {"title": "Adverbs: Modifying Words", "order": 4},
        {"title": "Prepositions: Connecting Words", "order": 5},
        {"title": "Conjunctions: Joining Words", "order": 6},
        {"title": "Articles: The, A, An", "order": 7},
        {"title": "Interjections: Exclamatory Words", "order": 8},
    ]
    
    print(f"\nCreating additional modules for testing...")
    
    for module_data in additional_modules:
        # Check if module already exists
        existing = db.query(Module).filter(Module.title == module_data["title"]).first()
        if existing:
            print(f"  Module '{module_data['title']}' already exists, skipping...")
            continue
        
        module = Module(
            title=module_data["title"],
            order=module_data["order"]
        )
        db.add(module)
        db.flush()
        
        # Create a basic lesson for each module
        lesson = Lesson(
            module_id=module.id,
            title=f"Introduction to {module_data['title'].split(':')[0]}",
            content=f"# {module_data['title']}\n\nThis lesson will cover the basics of {module_data['title'].split(':')[0].lower()}.\n\n*Content coming soon...*",
            order=1
        )
        db.add(lesson)
        
        print(f"  Created module: {module.title}")
    
    db.commit()
    print(f"✅ Additional modules created successfully!")


def verify_population(db):
    """Verify that the data was populated correctly."""
    # Import models here to avoid circular imports
    from app.models.module import Module
    from app.models.lesson import Lesson
    from app.models.exercise import Exercise
    
    print(f"\n📊 Database Population Summary:")
    print(f"=" * 40)
    
    modules = db.query(Module).order_by(Module.order).all()
    print(f"Total Modules: {len(modules)}")
    
    total_lessons = 0
    total_exercises = 0
    
    for module in modules:
        lessons = db.query(Lesson).filter(Lesson.module_id == module.id).all()
        total_lessons += len(lessons)
        
        for lesson in lessons:
            exercises = db.query(Exercise).filter(Exercise.lesson_id == lesson.id).all()
            total_exercises += len(exercises)
        
        print(f"  {module.order}. {module.title} ({len(lessons)} lesson{'s' if len(lessons) != 1 else ''})")
    
    print(f"\nTotal Lessons: {total_lessons}")
    print(f"Total Exercises: {total_exercises}")
    print(f"=" * 40)


def main():
    """Main function to populate the database."""
    
    print("🚀 Starting Grammar Anatomy Database Population")
    print("=" * 50)
    
    try:
        # Create database session
        db = create_database_session()
        
        # Populate modules and lessons from content files
        populate_modules_and_lessons(db)
        
        # Create additional modules for testing
        create_additional_modules(db)
        
        # Verify the population
        verify_population(db)
        
        print(f"\n🎉 Database population completed successfully!")
        print(f"You can now start the application and see the modules in the UI.")
        
    except Exception as e:
        print(f"❌ Error during database population: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    finally:
        if 'db' in locals():
            db.close()
    
    return 0


if __name__ == "__main__":
    exit(main())