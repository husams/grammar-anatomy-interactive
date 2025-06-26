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
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    // 1. Login page
    console.log('Taking login screenshot...');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(publicDir, 'login-dark.png') });

    // 2. Register page
    console.log('Taking register screenshot...');
    await page.goto('http://localhost:3000/register');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(publicDir, 'register-dark.png') });

    // Login to access authenticated pages
    console.log('Logging in...');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    // Fill login form (adjust selectors as needed)
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

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

    // 5. Module detail (use first available module)
    console.log('Taking module detail screenshot...');
    await page.goto('http://localhost:3000/module/1');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(authDir, 'module-detail-dark.png') });

    console.log('All screenshots taken successfully!');

  } catch (error) {
    console.error('Error taking screenshots:', error);
  } finally {
    await browser.close();
  }
}

takeScreenshots();