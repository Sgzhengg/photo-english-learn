const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const baseDir = 'E:/photo-english-learn-Frontend';
const zipPath = path.join(baseDir, 'product-plan.zip');

try {
  // Try using 7zip if available (Windows)
  execSync(`cd "${baseDir}" && 7z a -tzip product-plan.zip product-plan\\*`, { stdio: 'inherit' });
  console.log('✓ Created product-plan.zip using 7zip');
} catch (e) {
  try {
    // Try using tar (Git Bash/WSL)
    execSync(`cd "${baseDir}" && tar -czf product-plan.tar.gz product-plan/`, { stdio: 'inherit' });
    console.log('✓ Created product-plan.tar.gz using tar');
    console.log('Note: tar.gz created instead of zip due to tool availability');
  } catch (e2) {
    console.log('Note: Zip compression tools not available');
    console.log('The product-plan/ directory is ready with all files');
    console.log('You can manually compress it if needed');
  }
}
