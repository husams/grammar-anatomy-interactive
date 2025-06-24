import { test, expect } from '@playwright/test';

test.describe('Exercise Interaction E2E Tests', () => {
  
  // Helper function to login and navigate to exercise
  async function loginAndNavigateToExercise(page: any, exerciseId = 'test-exercise-1') {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button:has-text("Login")');
    await expect(page).toHaveURL('/dashboard');
    
    // Navigate to exercise
    await page.goto(`/exercises/${exerciseId}`);
  }

  test('1. Multiple Choice Exercise Completion', async ({ page }) => {
    await loginAndNavigateToExercise(page, 'multiple-choice-1');

    // User sees exercise with clear question and radio button options
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible();
    await expect(page.getByRole('radio').first()).toBeVisible();
    
    // User selects an answer option
    const firstOption = page.getByRole('radio').first();
    await firstOption.click();
    await expect(firstOption).toBeChecked();

    // User clicks "Submit Answer" button
    const submitButton = page.getByRole('button', { name: /submit answer/i });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // System shows immediate feedback with correct/incorrect indication
    await expect(page.getByText(/correct|incorrect/i)).toBeVisible({ timeout: 1000 });
    
    // Check for either success or retry flow
    const feedbackText = await page.textContent('[class*="feedback"], [class*="result"]');
    if (feedbackText?.toLowerCase().includes('correct')) {
      // If correct: User sees congratulations and "Next Exercise" button
      await expect(page.getByText(/congratulations|correct/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /next|continue/i })).toBeVisible();
    } else {
      // If incorrect: User sees explanation and "Try Again" button
      await expect(page.getByText(/explanation|try again/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /try again/i })).toBeVisible();
    }
  });

  test('2. Fill-in-the-Blank Exercise Flow', async ({ page }) => {
    await loginAndNavigateToExercise(page, 'fill-in-blank-1');

    // User sees text with clearly marked blank spaces
    await expect(page.getByText(/blank/i)).toBeVisible();
    const blankInputs = page.getByPlaceholder(/type your answer/i);
    await expect(blankInputs.first()).toBeVisible();

    // User types answers into blank input fields
    const inputs = await blankInputs.all();
    for (let i = 0; i < inputs.length; i++) {
      await inputs[i].fill(`answer${i + 1}`);
    }

    // System provides real-time validation hints (if implemented)
    // This would depend on the specific implementation

    // User submits completed exercise
    const submitButton = page.getByRole('button', { name: /submit answer/i });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // System evaluates each blank individually
    await expect(page.getByText(/submitting|feedback/i)).toBeVisible({ timeout: 1000 });

    // User sees feedback for each blank with correct answers
    await expect(page.getByText(/feedback|result/i)).toBeVisible();
  });

  test('3. Identification Exercise Interaction', async ({ page }) => {
    await loginAndNavigateToExercise(page, 'identification-1');

    // User sees text with highlighting instructions
    await expect(page.getByText(/click|identify|select/i)).toBeVisible();
    
    // User clicks on words/phrases to identify grammatical elements
    const selectableElements = page.getByRole('button').filter({ hasText: /.+/ });
    const firstElement = selectableElements.first();
    await firstElement.click();

    // Selected elements are visually highlighted
    await expect(firstElement).toHaveClass(/selected|active|highlighted/);

    // User can deselect incorrect choices
    await firstElement.click(); // Click again to deselect
    // await expect(firstElement).not.toHaveClass(/selected|active|highlighted/);

    // Re-select and submit
    await firstElement.click();
    await selectableElements.nth(1).click();

    // User submits identification choices
    const submitButton = page.getByRole('button', { name: /submit answer/i });
    await submitButton.click();

    // System highlights correct vs incorrect selections
    await expect(page.getByText(/feedback|result/i)).toBeVisible();
  });

  test('4. Sentence Construction Exercise', async ({ page }) => {
    await loginAndNavigateToExercise(page, 'sentence-construction-1');

    // User sees word bank and empty construction area
    await expect(page.getByText(/available words|word bank/i)).toBeVisible();
    await expect(page.getByText(/your sentence|construction/i)).toBeVisible();

    // User drags words from bank to construction area (simulated with clicks)
    const availableWords = page.getByRole('button').filter({ hasText: /^\\w+$/ });
    const firstWord = availableWords.first();
    const secondWord = availableWords.nth(1);
    
    await firstWord.click();
    await secondWord.click();

    // Words snap into position to form sentence
    await expect(page.getByText(/your sentence/i).locator('..').getByRole('button')).toHaveCount(2);

    // User can reorder words by dragging (simulated)
    // This would require more complex interaction for actual drag and drop

    // User submits constructed sentence
    const submitButton = page.getByRole('button', { name: /submit answer/i });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // System evaluates sentence structure and grammar
    await expect(page.getByText(/feedback|result/i)).toBeVisible();
  });

  test('5. Exercise Navigation Flow', async ({ page }) => {
    await loginAndNavigateToExercise(page, 'navigation-test-1');

    // Complete first exercise successfully (simplified)
    const option = page.getByRole('radio').first();
    await option.click();
    await page.getByRole('button', { name: /submit answer/i }).click();
    
    // Wait for feedback
    await expect(page.getByText(/feedback/i)).toBeVisible();

    // User clicks "Next Exercise" button
    const nextButton = page.getByRole('button', { name: /next/i });
    if (await nextButton.isVisible()) {
      await nextButton.click();
      
      // System loads next exercise in sequence
      await expect(page).toHaveURL(/exercises\\/[^/]+/);
    }

    // User can navigate back to previous exercise
    const prevButton = page.getByRole('button', { name: /previous/i });
    if (await prevButton.isVisible()) {
      await prevButton.click();
    }

    // User sees progress indicator showing position in lesson
    await expect(page.getByText(/exercise \\d+/i)).toBeVisible();
  });

  test('6. Exercise Retry Mechanism', async ({ page }) => {
    await loginAndNavigateToExercise(page, 'retry-test-1');

    // Deliberately select wrong answer (assuming first option is wrong)
    const wrongOption = page.getByRole('radio').first();
    await wrongOption.click();
    await page.getByRole('button', { name: /submit answer/i }).click();

    // User receives feedback for incorrect answer
    await expect(page.getByText(/incorrect|not quite|try again/i)).toBeVisible();

    // User clicks "Try Again" button
    const retryButton = page.getByRole('button', { name: /try again/i });
    await retryButton.click();

    // Exercise resets to initial state
    await expect(page.getByRole('button', { name: /submit answer/i })).toBeVisible();
    await expect(page.getByRole('radio').first()).not.toBeChecked();

    // User can attempt exercise again with fresh start
    const correctOption = page.getByRole('radio').nth(1);
    await correctOption.click();
    await page.getByRole('button', { name: /submit answer/i }).click();

    // System tracks number of attempts
    await expect(page.getByText(/attempt/i)).toBeVisible();
  });

  test('7. Network Error Recovery', async ({ page }) => {
    await loginAndNavigateToExercise(page);

    // Select an answer
    await page.getByRole('radio').first().click();
    
    // Simulate network interruption by intercepting the request
    await page.route('**/exercises/*/submit', route => {
      route.abort('failed');
    });

    // User completes exercise and clicks submit during network interruption
    await page.getByRole('button', { name: /submit answer/i }).click();

    // System shows "Network error" message with retry button
    await expect(page.getByText(/network error|connection/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /retry/i })).toBeVisible();

    // Remove network interception to simulate recovery
    await page.unroute('**/exercises/*/submit');

    // User clicks retry button
    await page.getByRole('button', { name: /retry/i }).click();

    // System attempts resubmission with cached answer
    await expect(page.getByText(/submitting/i)).toBeVisible();
  });

  test('8. Exercise Progress Auto-Save', async ({ page }) => {
    await loginAndNavigateToExercise(page);

    // User begins answering exercise but doesn't submit
    await page.getByRole('radio').first().click();

    // User navigates to different page
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');

    // User returns to exercise page
    await page.goto('/exercises/test-exercise-1');

    // System restores previous answer state
    await expect(page.getByRole('radio').first()).toBeChecked();
  });

  test('9. Accessibility Keyboard Navigation', async ({ page }) => {
    await loginAndNavigateToExercise(page);

    // User tabs through exercise elements in logical order
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();

    // Continue tabbing through elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // User selects answers using keyboard (Enter/Space)
    const focusedElement = page.locator(':focus');
    if (await focusedElement.getAttribute('type') === 'radio') {
      await page.keyboard.press('Space');
      await expect(focusedElement).toBeChecked();
    }

    // User submits exercise using keyboard
    // Tab to submit button and press Enter
    while (true) {
      const focused = page.locator(':focus');
      const tagName = await focused.evaluate(el => el.tagName.toLowerCase());
      const text = await focused.textContent();
      
      if (tagName === 'button' && text?.toLowerCase().includes('submit')) {
        await page.keyboard.press('Enter');
        break;
      }
      
      await page.keyboard.press('Tab');
    }

    // User navigates to next exercise using keyboard
    await expect(page.getByText(/feedback/i)).toBeVisible();
    
    // Focus indicators should be clearly visible throughout
    await expect(page.locator(':focus')).toBeVisible();
  });

  test('10. Mobile Touch Interaction', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await loginAndNavigateToExercise(page);

    // Exercise renders correctly on mobile screen
    await expect(page.getByRole('heading')).toBeVisible();
    
    // Touch targets are appropriately sized (minimum 44px)
    const touchTargets = page.getByRole('radio');
    const firstTarget = touchTargets.first();
    const boundingBox = await firstTarget.boundingBox();
    
    if (boundingBox) {
      expect(boundingBox.width).toBeGreaterThanOrEqual(44);
      expect(boundingBox.height).toBeGreaterThanOrEqual(44);
    }

    // User can interact with all exercise elements via touch
    await firstTarget.tap();
    await expect(firstTarget).toBeChecked();

    // Text input shows mobile-optimized keyboard (for fill-in-blank exercises)
    // This would be tested on an actual mobile device

    // Submit button should be easily tappable
    const submitButton = page.getByRole('button', { name: /submit answer/i });
    await submitButton.tap();
    
    await expect(page.getByText(/feedback/i)).toBeVisible();
  });

  test('11. Exercise Performance Under Load', async ({ page }) => {
    const startTime = Date.now();
    
    await loginAndNavigateToExercise(page, 'performance-test-exercise');

    // Exercise loads within 1.5 second requirement
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(1500);

    // User interactions remain responsive during loading
    await expect(page.getByRole('radio').first()).toBeVisible();
    
    const interactionStart = Date.now();
    await page.getByRole('radio').first().click();
    const interactionTime = Date.now() - interactionStart;
    
    // Interactions should be fast
    expect(interactionTime).toBeLessThan(200);

    // Answer submission provides feedback within 500ms
    const submissionStart = Date.now();
    await page.getByRole('button', { name: /submit answer/i }).click();
    
    await expect(page.getByText(/feedback/i)).toBeVisible({ timeout: 500 });
    const submissionTime = Date.now() - submissionStart;
    
    expect(submissionTime).toBeLessThan(500);
  });

  test('12. Progress Integration Verification', async ({ page }) => {
    await loginAndNavigateToExercise(page);

    // Complete first exercise in lesson
    await page.getByRole('radio').first().click();
    await page.getByRole('button', { name: /submit answer/i }).click();
    await expect(page.getByText(/feedback/i)).toBeVisible();

    // Navigate to dashboard to check progress updates
    await page.goto('/dashboard');
    
    // Dashboard progress bar updates immediately
    await expect(page.getByText(/progress/i)).toBeVisible();
    
    // Return to exercise and complete more
    await page.goto('/exercises/test-exercise-2');
    await page.getByRole('radio').first().click();
    await page.getByRole('button', { name: /submit answer/i }).click();
    
    // Check that lesson progress percentage increases appropriately
    await page.goto('/dashboard');
    await expect(page.getByText(/\\d+%/)).toBeVisible();
  });

  test('13. Exercise Content Validation', async ({ page }) => {
    // Navigate to an exercise with invalid/missing content
    await loginAndNavigateToExercise(page, 'invalid-exercise');

    // System detects content validation errors
    await expect(
      page.getByText(/error|invalid|not found/i)
    ).toBeVisible();

    // Error boundary displays helpful error message
    await expect(
      page.getByText(/something went wrong|exercise not available/i)
    ).toBeVisible();

    // User can navigate back to lesson or retry loading
    await expect(
      page.getByRole('button', { name: /go back|retry/i })
    ).toBeVisible();
  });

  test('14. Multi-Exercise Session Flow', async ({ page }) => {
    await loginAndNavigateToExercise(page, 'session-test-1');

    // Complete exercises in order from lesson
    for (let i = 1; i <= 3; i++) {
      // Progress indicator shows position in exercise sequence
      await expect(page.getByText(new RegExp(`exercise ${i}`, 'i'))).toBeVisible();

      // Complete current exercise
      await page.getByRole('radio').first().click();
      await page.getByRole('button', { name: /submit answer/i }).click();
      await expect(page.getByText(/feedback/i)).toBeVisible();

      // Navigate to next exercise (except for last one)
      if (i < 3) {
        const nextButton = page.getByRole('button', { name: /next/i });
        if (await nextButton.isVisible()) {
          await nextButton.click();
        } else {
          // Navigate manually if next button not available
          await page.goto(`/exercises/session-test-${i + 1}`);
        }
      }
    }

    // User can navigate forward and backward between completed exercises
    const prevButton = page.getByRole('button', { name: /previous/i });
    if (await prevButton.isVisible()) {
      await prevButton.click();
      await expect(page.getByText(/exercise 2/i)).toBeVisible();
    }

    // Exercise results are retained throughout session
    await expect(page.getByText(/completed|feedback/i)).toBeVisible();

    // Lesson completion triggers celebration and progress update
    await page.goto('/exercises/session-test-3');
    await expect(page.getByText(/congratulations|lesson complete/i)).toBeVisible();
  });

  test('15. Exercise Analytics Data Collection', async ({ page }) => {
    await loginAndNavigateToExercise(page);

    // Complete exercises with varying accuracy and time
    const startTime = Date.now();
    
    // First attempt - incorrect
    await page.getByRole('radio').first().click();
    await page.getByRole('button', { name: /submit answer/i }).click();
    await expect(page.getByText(/incorrect|try again/i)).toBeVisible();

    // Retry - correct
    await page.getByRole('button', { name: /try again/i }).click();
    await page.getByRole('radio').nth(1).click();
    await page.getByRole('button', { name: /submit answer/i }).click();
    await expect(page.getByText(/correct/i)).toBeVisible();

    const completionTime = Date.now() - startTime;

    // Navigate to dashboard to view analytics
    await page.goto('/dashboard');

    // Analytics reflect accurate completion rates and improvement trends
    await expect(page.getByText(/accuracy|performance|analytics/i)).toBeVisible();
    
    // Check for attempt tracking
    await expect(page.getByText(/attempts|tries/i)).toBeVisible();
    
    // Verify time tracking (completion time should be recorded)
    // This would typically be shown in a detailed analytics section
  });
});

test.describe('Exercise Accessibility Tests', () => {
  test('Exercise components meet WCAG 2.1 AA standards', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button:has-text("Login")');
    await page.goto('/exercises/accessibility-test');

    // Check color contrast ratios (would need specific implementation)
    // Check for proper ARIA labels
    await expect(page.getByRole('radio').first()).toHaveAttribute('aria-label');
    
    // Check semantic HTML structure
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('heading')).toBeVisible();
    
    // Check keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    // Check screen reader announcements (would need specialized testing)
    // Check for alternative text on any images
    const images = page.getByRole('img');
    const imageCount = await images.count();
    for (let i = 0; i < imageCount; i++) {
      await expect(images.nth(i)).toHaveAttribute('alt');
    }
  });
});