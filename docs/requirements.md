# **App Specification: Grammar Anatomy Interactive**

## **1. Introduction & Vision**

**App Name:** Grammar Anatomy Interactive

**Vision:** To transform the static content of "Brehe's Grammar Anatomy" into an engaging, interactive, and personalized learning experience. The app will empower users to actively practice and master English grammar through a series of guided lessons, interactive exercises, and intelligent learning tools.

## **2. Target Audience**

* **Primary:** Students using "Brehe's Grammar Anatomy" as a textbook.  
* **Secondary:** Individuals seeking to improve their English grammar skills for academic, professional, or personal development.  
* **Tertiary:** English language learners looking for a structured way to understand grammatical concepts.

## **3. Core Features & Modules**

The app will be structured around the chapters of the book, with each chapter constituting a "Module."

### **3.1. Dashboard & Progress Tracking**

* **Visual Progress Bar:** Shows the user's overall completion percentage of the course.  
* **Module Overview:** A list of all modules (chapters) with their completion status (Not Started, In Progress, Completed).  
* **Skill Summary:** Displays proficiency levels for key grammar concepts (e.g., Nouns, Verbs, Tenses, Clauses) based on exercise performance.  
* **Achievements/Badges:** Gamified rewards for milestones like completing a module, achieving a high score, or maintaining a daily streak.

### **3.2. Learning Modules (Based on Book Chapters)**

Each module will follow a consistent structure:

1. **Learn:**  
   * **Bite-Sized Lessons:** The core concepts from each chapter will be broken down into digestible, mobile-friendly cards or short screens.  
   * **Interactive Examples:** Key sentences from the book will be interactive. For example, users can tap on a word to see its part of speech or tap on a phrase to see its function.  
     * *Example (from Chapter 1):* In the sentence "Alice fell," tapping on "Alice" would reveal "Simple Subject," and tapping "fell" would reveal "Simple Predicate."  
2. **Practice (Interactive Exercises):**  
   * This is the core of the interactive experience. Exercises will be varied and directly relate to the concepts taught in the lesson.

### **3.3. Exercise Types**

* **Identification:**  
  * **Tap & Tag:** Users are presented with a sentence and asked to tap on and identify specific parts of speech, clauses, or phrases.  
    * *Example (from Chapter 2):* "Identify the **action verb** in the sentence: *Pearl painted Mr. Morton's porch.*"  
  * **Highlighting:** Users drag their finger to highlight the complete subject, predicate, or a specific type of clause.  
* **Sentence Construction:**  
  * **Drag & Drop:** Users build sentences by dragging words or phrases into the correct order.  
    * *Example (from Chapter 1):* Given the words "cellar," "Devlin," "the," "Alicia," "in," "wine," and "caught," the user would arrange them to form a grammatically correct sentence.  
  * **Fill-in-the-Blanks:**  
    * *Example (from Chapter 3):* "I have \_\_\_\_\_ here for an hour. (lain / laid)"  
    * *Example (from Chapter 7):* "Give the book to \_\_\_\_\_. (I / me)"  
* **Classification:**  
  * **Multiple Choice:** Users classify sentences by structure (simple, compound, complex) or purpose (declarative, interrogative, etc.).  
    * *Example (from Chapter 10):* "Classify the following sentence: *My family owned a cocker spaniel when I was young.*" (Options: Simple, Compound, Complex, Compound-Complex).  
  * **Sorting/Categorization:** Users drag words or phrases into columns to categorize them (e.g., "Action Verbs" vs. "Linking Verbs").  
* **Correction:**  
  * **Error Spotting:** Users are presented with a sentence containing a grammatical error (e.g., a dangling participle, incorrect pronoun case) and must identify and correct it.  
    * *Example (from Chapter 17):* "Rowing across the river, the boat struck the ice." The user would have to identify that "the boat" cannot be "rowing."

### **3.4. Interactive Learning Tools**

#### **3.4.1. Sentence Anatomy Lab**

A dedicated space where users can dissect sentences to understand their structure.

* **Decomposition:** Users can type or paste any sentence into the lab. The app will visually break it down, showing the relationships between its components.  
* **Visual Diagramming:** The output will be a tree-like diagram showing:  
  * The main clause(s).  
  * Subject and Predicate.  
  * Dependent clauses (and their type).  
  * Phrases (prepositional, participial, etc.).  
  * Individual parts of speech for each word.  
* **Interactive Exploration:** Users can tap on any part of the diagram to get a definition and link to the relevant lesson in the app.

#### **3.4.2. AI-Powered Assistance**

* **Read Aloud:** An accessibility feature where users can have lessons, examples, and exercise questions read to them.  
  * A speaker icon will appear next to text blocks. Tapping it will activate a natural-sounding AI voice.  
* **Ask the Grammar Guru:** An AI-powered chatbot available throughout the app.  
  * Users can ask specific grammar questions (e.g., "What's the difference between 'who' and 'whom'?" or "Why is this a complex sentence?").  
  * The chatbot will provide clear, concise answers based on the book's content and general grammar rules, and can provide links to specific lessons for more detail.

### **3.5. Review & Reinforcement**

* **Glossary:** An easily searchable digital version of the book's glossary. Tapping a term would show its definition and a link to the relevant lesson.  
* **Review Mode:** A "flashcard" style review of concepts the user has struggled with, based on their exercise performance.  
* **Practice Again:** Option to re-do exercises for any lesson.

## **4. User Interface (UI) & User Experience (UX)**

* **Clean & Minimalist Design:** The focus should be on the content. Use clear typography and a simple color palette.  
* **Intuitive Navigation:** A bottom navigation bar could provide easy access to the Dashboard, Modules, Tools (Anatomy Lab/Guru), and Glossary.  
* **Immediate Feedback:** Provide instant feedback on exercise answers. Correct answers get a positive reinforcement (e.g., a green checkmark), and incorrect answers get a brief explanation and a link back to the relevant lesson.  
* **Micro-interactions:** Use subtle animations to make the experience more dynamic and engaging (e.g., a word wiggling when tapped, a card flipping over).

## **5. Technical Specification (High-Level)**

* **Platform:** iOS and Android (or a cross-platform framework like React Native or Flutter).  
* **AI Integration:** Will require APIs for Text-to-Speech (TTS) and a Large Language Model (LLM) for the Q&A bot.  
* **Data Storage:** User progress and performance data will be stored locally on the device, with an option to sync to the cloud for multi-device use.  
* **Content Management:** The app's content (lessons, exercises) should be manageable, allowing for potential updates or additions without requiring a full app update. 