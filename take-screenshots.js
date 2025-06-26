const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function takeScreenshots() {
  // Ensure screenshot directory exists
  const screenshotDir = '/Users/husam/workspace/tutor/grammar-anatomy-app/docs/screenshots';
  const publicDir = path.join(screenshotDir, 'public');
  const authDir = path.join(screenshotDir, 'authenticated');
  
  [screenshotDir, publicDir, authDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ 
    viewport: { width: 1280, height: 1024 }
  });
  const page = await context.newPage();

  try {
    // Step 1: Register a new user first
    console.log('Going to register page...');
    await page.goto('http://localhost:3000/register');
    await page.waitForLoadState('networkidle');
    
    // Enable dark mode first
    console.log('Enabling dark mode...');
    await page.click('button:has-text("Dark Mode")');
    await page.waitForTimeout(1000); // Wait for theme to apply
    
    // Take register screenshot in dark mode
    console.log('Taking register screenshot...');
    await page.screenshot({ path: path.join(publicDir, 'register-dark.png') });
    
    // Fill registration form with unique email
    const timestamp = Date.now();
    const email = `testuser${timestamp}@example.com`;
    console.log('Registering new user with email:', email);
    await page.fill('input[placeholder="Name"], input[name="name"]', 'Test User');
    await page.fill('input[placeholder="Email"], input[name="email"], input[type="email"]', email);
    await page.fill('input[placeholder="Password"], input[name="password"], input[type="password"]', 'password123');
    await page.fill('input[placeholder="Confirm Password"], input[name="confirmPassword"]', 'password123');
    
    // Submit registration
    await page.click('button:has-text("Register"), button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for registration to complete
    
    // User is already logged in after registration, so logout first
    console.log('Logging out to capture login screen...');
    await page.click('button:has-text("Logout"), a:has-text("Logout")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Go to login page and enable dark mode
    console.log('Going to login page...');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    // Enable dark mode on login page (try different selectors)
    console.log('Enabling dark mode on login page...');
    try {
      await page.click('button:has-text("Light Mode")');
    } catch {
      try {
        await page.click('button:has-text("Dark Mode")');
      } catch {
        console.log('Could not find dark mode toggle, proceeding with current theme');
      }
    }
    await page.waitForTimeout(1000);
    
    // Take login screenshot in dark mode
    console.log('Taking login screenshot...');
    await page.screenshot({ path: path.join(publicDir, 'login-dark.png') });

    // Login with the registered user
    console.log('Logging in with registered user...');
    await page.fill('input[type="email"], input[name="email"]', email);
    await page.fill('input[type="password"], input[name="password"]', 'password123');
    await page.click('button:has-text("Login"), button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 3. Dashboard
    console.log('Taking dashboard screenshot...');
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(authDir, 'dashboard-dark.png') });

    // 4. Modules list
    console.log('Taking modules list screenshot...');
    await page.goto('http://localhost:3000/modules');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(authDir, 'modules-list-dark.png') });

    // 5. Module detail - navigate to modules first, then click on a module
    console.log('Going to modules list to select a module...');
    await page.goto('http://localhost:3000/modules');
    await page.waitForLoadState('networkidle');
    
    // Click on the first module to navigate to its detail page
    console.log('Clicking on first module to view details...');
    console.log('Current URL before clicking:', await page.url());
    
    try {
      // Try multiple specific selectors for the module cards
      const selectors = [
        'h3:has-text("Nouns & Verbs")',
        'a:has-text("Nouns & Verbs")', 
        '[href*="/module"]',
        'div:has-text("Nouns & Verbs: The Building Blocks of Sentences")',
        'div:has-text("Module 1")',
        '.module-card',
        '.card',
        '[data-testid="module-card"]',
        'div:has-text("Not Started")'
      ];
      
      let clicked = false;
      for (const selector of selectors) {
        try {
          console.log(`Trying selector: ${selector}`);
          await page.click(selector, { timeout: 3000 });
          console.log(`Successfully clicked: ${selector}`);
          clicked = true;
          break;
        } catch (e) {
          console.log(`Selector failed: ${selector}`);
        }
      }
      
      if (!clicked) {
        console.log('Trying to find all clickable elements...');
        const elements = await page.$$('div, a, button, h3, h2');
        console.log(`Found ${elements.length} elements to try`);
        
        for (let i = 0; i < Math.min(elements.length, 20); i++) {
          try {
            const text = await elements[i].textContent();
            if (text && (text.includes('Nouns') || text.includes('Module 1') || text.includes('Building Blocks'))) {
              console.log(`Clicking element with text: "${text}"`);
              await elements[i].click();
              clicked = true;
              break;
            }
          } catch (e) {
            // Continue to next element
          }
        }
      }
      
      if (clicked) {
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        console.log('URL after clicking:', await page.url());
      } else {
        console.log('Could not find any clickable module element');
      }
      
    } catch (error) {
      console.log('Error clicking on module:', error.message);
    }
    
    console.log('Taking module detail screenshot...');
    // Use fullPage option to capture entire content
    await page.screenshot({ 
      path: path.join(authDir, 'module-detail-dark.png'),
      fullPage: true 
    });

    console.log('All screenshots taken successfully!');

  } catch (error) {
    console.error('Error taking screenshots:', error);
    console.error('Current page URL:', await page.url());
    console.error('Page content preview:', await page.textContent('body').catch(() => 'Could not get page content'));
  } finally {
    await browser.close();
  }
}

takeScreenshots();