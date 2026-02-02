const fs = require('fs');
const path = require('path');

console.log('开始修复组件导入路径...\n');

// 修复所有组件文件中的导入路径
const componentDirs = [
  'app/src/components/shell',
  'app/src/components/photo-capture',
  'app/src/components/vocabulary-library',
  'app/src/components/practice-review',
  'app/src/components/progress-dashboard'
];

componentDirs.forEach(dir => {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);

  files.forEach(file => {
    if (!file.endsWith('.tsx')) return;

    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 修复类型导入路径
    if (content.includes("@/../product/sections/")) {
      content = content.replace(
        /from '@\/\.\.\/\.\.\/product\/sections\/[^\/]+\/types'/g,
        "from '../../../lib/types'"
      );
      modified = true;
    }

    // 移除未使用的导入
    if (file === 'MainNav.tsx') {
      content = content.replace(/import\s*\{\s*[^}]*\bGrid2\b[^}]*\}\s*from\s*['"]lucide-react['"];\s*/g, '');
      modified = true;
    }

    // 修复 ArrowRight 未使用问题
    content = content.replace(/import\s*\{\s*([^}]*\bArrowRight\b[^}]*)\}\s*from\s*['"]lucide-react['"];\s*/g, (match, imports) => {
      const newImports = imports.replace(/,\s*\w*\s*\bArrowRight\b\s*,?\s*/g, '').replace(/,\s*\w*\s*\bArrowRight\b\s*/g, '');
      if (newImports.trim()) {
        return `import { ${newImports.trim()} } from 'lucide-react';\n`;
      }
      return '';
    });

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log('✓ 修复:', path.relative('app', filePath));
    }
  });
});

// 修复 routes/index.tsx
const routesPath = 'app/src/routes/index.tsx';
if (fs.existsSync(routesPath)) {
  let content = fs.readFileSync(routesPath, 'utf8');

  // 添加 navigationItems prop 到 AppShell
  content = content.replace(
    /<AppShell>/,
    `<AppShell navigationItems={[`
  );

  content = content.replace(
    /<\/AppShell>/,
    `]}>\n        <Routes>\n          <Route path="/" element={<Navigate to="/photo-capture" replace />} />\n          <Route path="/photo-capture" element={<PhotoCaptureResult photoData={mockPhotoCaptureData} onSaveWord={(id) => console.log('Save:', id)} onPlayAudio={(text) => console.log('Play:', text)} />} />\n          <Route path="/vocabulary" element={<VocabularyListWrapper />} />\n          <Route path="/practice" element={<DailyTaskHome dailyTask={mockPracticeData.dailyTask} progressStats={mockPracticeData.progressStats} wrongAnswersCount={mockPracticeData.wrongAnswersCount} onStartPractice={() => console.log('Start')} onViewReviewSchedule={() => console.log('Schedule')} onViewProgressStats={() => console.log('Stats')} onReviewWrongAnswers={() => console.log('Review')} />} />\n          <Route path="/dashboard" element={<ProgressDashboard overviewStats={mockProgressData.overviewStats} chartData={mockProgressData.chartData} wordStats={mockProgressData.wordStats} recentActivity={mockProgressData.recentActivity} achievements={mockProgressData.achievements} onViewDayDetails={(d) => console.log('Day:', d)} onViewTagWords={(t) => console.log('Tag:', t)} onViewAchievement={(id) => console.log('Achievement:', id)} onViewActivityDetails={(id) => console.log('Activity:', id)} />} />\n          <Route path="*" element={<div className="p-8 text-center">404</div>} />\n        </Routes>\n      </AppShell>`
  );

  fs.writeFileSync(routesPath, content);
  console.log('✓ 修复路由配置');
}

// 修复 api.ts 的类型问题
const apiPath = 'app/src/lib/api.ts';
if (fs.existsSync(apiPath)) {
  let content = fs.readFileSync(apiPath, 'utf8');

  // 修复 HeadersInit 类型问题
  content = content.replace(
    /const headers: HeadersInit =/,
    'const headers: Record<string, string> ='
  );

  fs.writeFileSync(apiPath, content);
  console.log('✓ 修复 API 客户端类型');
}

console.log('\n✅ 所有导入路径已修复！');
