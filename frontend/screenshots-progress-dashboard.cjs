const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();

  // Progress Dashboard
  console.log('Capturing ProgressDashboard...');
  await page.goto('http://localhost:3000/sections/progress-dashboard/screen-designs/ProgressDashboard');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: '.playwright-mcp/progress-dashboard.png', fullPage: true });
  console.log('✓ ProgressDashboard captured');

  await browser.close();
  console.log('\nScreenshot captured successfully!');
})();
