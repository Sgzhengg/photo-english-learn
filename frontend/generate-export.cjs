const fs = require('fs');
const path = require('path');

// Base directories
const baseDir = 'E:/photo-english-learn-Frontend';
const productPlanDir = path.join(baseDir, 'product-plan');

// File mappings (source -> destination)
const mappings = [
  // Design System
  { src: 'product/design-system/colors.json', dest: 'product-plan/design-system/colors.json' },
  { src: 'product/design-system/typography.json', dest: 'product-plan/design-system/typography.json' },

  // Data Model
  { src: 'product/data-model/data-model.md', dest: 'product-plan/data-model/README.md' },

  // Shell specs
  { src: 'product/shell/spec.md', dest: 'product-plan/shell/README.md' },

  // Section specs
  { src: 'product/sections/foundation/spec.md', dest: 'product-plan/sections/foundation/README.md' },
  { src: 'product/sections/foundation/types.ts', dest: 'product-plan/sections/foundation/types.ts' },
  { src: 'product/sections/foundation/data.json', dest: 'product-plan/sections/foundation/sample-data.json' },

  { src: 'product/sections/photo-capture/spec.md', dest: 'product-plan/sections/photo-capture/README.md' },
  { src: 'product/sections/photo-capture/types.ts', dest: 'product-plan/sections/photo-capture/types.ts' },
  { src: 'product/sections/photo-capture/data.json', dest: 'product-plan/sections/photo-capture/sample-data.json' },

  { src: 'product/sections/vocabulary-library/spec.md', dest: 'product-plan/sections/vocabulary-library/README.md' },
  { src: 'product/sections/vocabulary-library/types.ts', dest: 'product-plan/sections/vocabulary-library/types.ts' },
  { src: 'product/sections/vocabulary-library/data.json', dest: 'product-plan/sections/vocabulary-library/sample-data.json' },

  { src: 'product/sections/practice-review/spec.md', dest: 'product-plan/sections/practice-review/README.md' },
  { src: 'product/sections/practice-review/types.ts', dest: 'product-plan/sections/practice-review/types.ts' },
  { src: 'product/sections/practice-review/data.json', dest: 'product-plan/sections/practice-review/sample-data.json' },

  { src: 'product/sections/progress-dashboard/spec.md', dest: 'product-plan/sections/progress-dashboard/README.md' },
  { src: 'product/sections/progress-dashboard/types.ts', dest: 'product-plan/sections/progress-dashboard/types.ts' },
  { src: 'product/sections/progress-dashboard/data.json', dest: 'product-plan/sections/progress-dashboard/sample-data.json' },

  // Foundation components
  { src: 'src/sections/foundation/components/LoginPage.tsx', dest: 'product-plan/sections/foundation/components/LoginPage.tsx' },
  { src: 'src/sections/foundation/components/RegisterPage.tsx', dest: 'product-plan/sections/foundation/components/RegisterPage.tsx' },
  { src: 'src/sections/foundation/components/OnboardingPage.tsx', dest: 'product-plan/sections/foundation/components/OnboardingPage.tsx' },

  // Photo Capture components
  { src: 'src/sections/photo-capture/components/WordCard.tsx', dest: 'product-plan/sections/photo-capture/components/WordCard.tsx' },
  { src: 'src/sections/photo-capture/components/SceneSentence.tsx', dest: 'product-plan/sections/photo-capture/components/SceneSentence.tsx' },
  { src: 'src/sections/photo-capture/components/PhotoCaptureResult.tsx', dest: 'product-plan/sections/photo-capture/components/PhotoCaptureResult.tsx' },

  // Vocabulary Library components
  { src: 'src/sections/vocabulary-library/components/VocabularyList.tsx', dest: 'product-plan/sections/vocabulary-library/components/VocabularyList.tsx' },
  { src: 'src/sections/vocabulary-library/components/WordDetail.tsx', dest: 'product-plan/sections/vocabulary-library/components/WordDetail.tsx' },

  // Practice Review components
  { src: 'src/sections/practice-review/components/DailyTaskHome.tsx', dest: 'product-plan/sections/practice-review/components/DailyTaskHome.tsx' },
  { src: 'src/sections/practice-review/components/PracticeQuestionView.tsx', dest: 'product-plan/sections/practice-review/components/PracticeQuestionView.tsx' },
  { src: 'src/sections/practice-review/components/PracticeResultSummary.tsx', dest: 'product-plan/sections/practice-review/components/PracticeResultSummary.tsx' },
  { src: 'src/sections/practice-review/components/ReviewSchedule.tsx', dest: 'product-plan/sections/practice-review/components/ReviewSchedule.tsx' },
  { src: 'src/sections/practice-review/components/WrongAnswersReview.tsx', dest: 'product-plan/sections/practice-review/components/WrongAnswersReview.tsx' },
  { src: 'src/sections/practice-review/components/ProgressStats.tsx', dest: 'product-plan/sections/practice-review/components/ProgressStats.tsx' },

  // Progress Dashboard components
  { src: 'src/sections/progress-dashboard/components/ProgressDashboard.tsx', dest: 'product-plan/sections/progress-dashboard/components/ProgressDashboard.tsx' },

  // Shell components
  { src: 'src/shell/components/AppShell.tsx', dest: 'product-plan/shell/components/AppShell.tsx' },
  { src: 'src/shell/components/MainNav.tsx', dest: 'product-plan/shell/components/MainNav.tsx' },
  { src: 'src/shell/components/UserMenu.tsx', dest: 'product-plan/shell/components/UserMenu.tsx' },
];

// Function to transform imports
function transformImports(content, destPath) {
  // Transform @/../product/... imports to relative paths
  content = content.replace(/from '@\/\.\.\/product\/sections\/([^/]+)\/types'/g, 'from \'../types\'');
  content = content.replace(/from "@\/\.\.\/product\/sections\/([^/]+)\/types"/g, 'from "../types"');
  content = content.replace(/from '@\/\.\.\/product\/data-model\/types'/g, 'from \'../../../data-model/types\'');
  content = content.replace(/from "@\/\.\.\/product\/data-model\/types"/g, 'from "../../../data-model/types"');

  // Transform @/ imports to relative paths based on file location
  content = content.replace(/from '@\/lib\/router'/g, 'from \'../../../../lib/router\'');
  content = content.replace(/from "@\/lib\/router"/g, 'from "../../../../lib/router"');

  return content;
}

// Copy files
let copiedCount = 0;
let errorCount = 0;

mappings.forEach(mapping => {
  const srcPath = path.join(baseDir, mapping.src);
  const destPath = path.join(baseDir, mapping.dest);

  try {
    // Ensure directory exists
    fs.mkdirSync(path.dirname(destPath), { recursive: true });

    // Read source file
    let content = fs.readFileSync(srcPath, 'utf8');

    // Transform imports for TS/TSX files
    if (destPath.endsWith('.ts') || destPath.endsWith('.tsx')) {
      content = transformImports(content, mapping.dest);
    }

    // Write to destination
    fs.writeFileSync(destPath, content, 'utf8');
    copiedCount++;
    console.log(`✓ Copied: ${mapping.src} -> ${mapping.dest}`);
  } catch (error) {
    errorCount++;
    console.error(`✗ Error copying ${mapping.src}:`, error.message);
  }
});

console.log(`\n=== Summary ===`);
console.log(`Copied: ${copiedCount} files`);
console.log(`Errors: ${errorCount} files`);
