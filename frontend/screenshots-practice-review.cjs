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

  // 1. DailyTaskHome
  console.log('Capturing DailyTaskHome...');
  await page.goto('http://localhost:3000/sections/practice-review/screen-designs/DailyTaskHome');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: '.playwright-mcp/daily-task-home.png', fullPage: true });
  console.log('✓ DailyTaskHome captured');

  // 2. PracticeQuestionView
  console.log('Capturing PracticeQuestionView...');
  await page.goto('http://localhost:3000/sections/practice-review/screen-designs/PracticeQuestionView');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: '.playwright-mcp/practice-question-view.png', fullPage: true });
  console.log('✓ PracticeQuestionView captured');

  // 3. PracticeResultSummary
  console.log('Capturing PracticeResultSummary...');
  await page.goto('http://localhost:3000/sections/practice-review/screen-designs/PracticeResultSummary');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: '.playwright-mcp/practice-result-summary.png', fullPage: true });
  console.log('✓ PracticeResultSummary captured');

  // 4. ReviewSchedule
  console.log('Capturing ReviewSchedule...');
  await page.goto('http://localhost:3000/sections/practice-review/screen-designs/ReviewSchedule');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: '.playwright-mcp/review-schedule.png', fullPage: true });
  console.log('✓ ReviewSchedule captured');

  // 5. WrongAnswersReview
  console.log('Capturing WrongAnswersReview...');
  await page.goto('http://localhost:3000/sections/practice-review/screen-designs/WrongAnswersReview');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: '.playwright-mcp/wrong-answers-review.png', fullPage: true });
  console.log('✓ WrongAnswersReview captured');

  // 6. ProgressStats
  console.log('Capturing ProgressStats...');
  await page.goto('http://localhost:3000/sections/practice-review/screen-designs/ProgressStats');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: '.playwright-mcp/progress-stats.png', fullPage: true });
  console.log('✓ ProgressStats captured');

  await browser.close();
  console.log('\nAll screenshots captured successfully!');
})();
