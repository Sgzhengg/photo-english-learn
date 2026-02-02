const fs = require('fs');
const path = require('path');

// 创建导出包的辅助函数
function copyFile(src, dest) {
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

function writeFile(dest, content) {
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(dest, content, 'utf8');
}

console.log('开始生成导出包...\n');

// 1. 复制设计系统文件
console.log('1. 复制设计系统...');
copyFile('product/design-system/colors.json', 'product-plan/design-system/colors.json');
copyFile('product/design-system/typography.json', 'product-plan/design-system/typography.json');

// 生成 tokens.css
writeFile('product-plan/design-system/tokens.css', '/* Design Tokens for PhotoEnglish */\n\n:root {\n  /* Colors */\n  --color-primary: indigo;\n  --color-secondary: lime;\n  --color-neutral: slate;\n\n  /* Typography */\n  --font-heading: \'DM Sans\', sans-serif;\n  --font-body: \'Inter\', sans-serif;\n  --font-mono: \'IBM Plex Mono\', monospace;\n}');

// 生成 tailwind-colors.md
writeFile('product-plan/design-system/tailwind-colors.md', '# Tailwind Color Configuration\n\n## Color Choices\n\n- **Primary:** `indigo` — Used for buttons, links, key accents\n- **Secondary:** `lime` — Used for tags, highlights, secondary elements\n- **Neutral:** `slate` — Used for backgrounds, text, borders\n\n## Usage Examples\n\nPrimary button: `bg-indigo-600 hover:bg-indigo-700 text-white`\nSecondary badge: `bg-lime-100 text-lime-800`\nNeutral text: `text-slate-600 dark:text-slate-400`\n');

// 生成 fonts.md
writeFile('product-plan/design-system/fonts.md', '# Typography Configuration\n\n## Google Fonts Import\n\nAdd to your HTML `<head>` or CSS:\n\n```html\n<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link href="https://fonts.googleapis.com/css2?family=DM+Sans&family=Inter&family=IBM+Plex+Mono&display=swap" rel="stylesheet">\n```\n\n## Font Usage\n\n- **Headings:** DM Sans\n- **Body text:** Inter\n- **Code/technical:** IBM Plex Mono\n');

console.log('✓ 设计系统完成\n');

// 2. 复制数据模型
console.log('2. 复制数据模型...');
copyFile('product/data-model/data-model.md', 'product-plan/data-model/data-model.md');
writeFile('product-plan/data-model/README.md', '# Data Model\n\nThis directory contains the core entity definitions for PhotoEnglish.\n\n## Entities\n\n- **User** — 使用应用的学习者\n- **Photo** — 用户拍摄的照片记录\n- **Word** — 从照片中提取的英文生词\n- **Tag** — 用户创建的标签\n- **Practice** — 用户的练习记录\n- **Review** — 基于间隔重复算法的复习记录\n- **Progress** — 学习统计数据\n\nSee `data-model.md` for detailed entity descriptions and relationships.\n');
console.log('✓ 数据模型完成\n');

// 3. 复制 Shell 组件
console.log('3. 复制应用外壳组件...');
copyFile('src/shell/components/AppShell.tsx', 'product-plan/shell/components/AppShell.tsx');
copyFile('src/shell/components/MainNav.tsx', 'product-plan/shell/components/MainNav.tsx');
copyFile('src/shell/components/UserMenu.tsx', 'product-plan/shell/components/UserMenu.tsx');
copyFile('src/shell/components/index.ts', 'product-plan/shell/components/index.ts');

writeFile('product-plan/shell/README.md', '# Application Shell\n\n## Overview\n\n移动端应用壳，采用底部标签栏导航模式，提供核心功能的快速切换和用户菜单访问。\n\n## Navigation Structure\n\n底部标签栏包含 4 个主导航项：\n- **拍照识别** → Photo Capture（中央大按钮，突出显示）\n- **生词库** → Vocabulary Library\n- **练习** → Practice & Review\n- **统计** → Progress Dashboard\n\n## Components\n\n- `AppShell.tsx` — Main layout wrapper\n- `MainNav.tsx` — Bottom tab navigation\n- `UserMenu.tsx` — User menu with avatar\n\n## Wire Up Navigation\n\nConnect navigation to your routing:\n\n- 拍照识别 → `/photo-capture`\n- 生词库 → `/vocabulary`\n- 练习 → `/practice`\n- 统计 → `/dashboard`\n');
console.log('✓ 应用外壳完成\n');

// 4. 复制各个 section
const sections = ['photo-capture', 'vocabulary-library', 'practice-review', 'progress-dashboard'];

sections.forEach(sectionId => {
  console.log('4. 复制 ' + sectionId + ' 部分...');

  // 创建目录
  fs.mkdirSync('product-plan/sections/' + sectionId + '/components/', { recursive: true });

  // 复制组件
  const componentsDir = 'src/sections/' + sectionId + '/components/';
  if (fs.existsSync(componentsDir)) {
    const files = fs.readdirSync(componentsDir);
    files.forEach(file => {
      if (file.endsWith('.tsx') && file !== 'index.ts') {
        copyFile(path.join(componentsDir, file), 'product-plan/sections/' + sectionId + '/components/' + file);
      }
    });
  }

  // 复制 index.ts
  const indexPath = path.join(componentsDir, 'index.ts');
  if (fs.existsSync(indexPath)) {
    copyFile(indexPath, 'product-plan/sections/' + sectionId + '/components/index.ts');
  }

  // 复制类型和数据文件
  copyFile('product/sections/' + sectionId + '/types.ts', 'product-plan/sections/' + sectionId + '/types.ts');
  copyFile('product/sections/' + sectionId + '/data.json', 'product-plan/sections/' + sectionId + '/sample-data.json');

  // 复制截图
  const screenshots = fs.readdirSync('product/sections/' + sectionId).filter(f => f.endsWith('.png'));
  screenshots.forEach(ss => {
    copyFile('product/sections/' + sectionId + '/' + ss, 'product-plan/sections/' + sectionId + '/' + ss);
  });

  console.log('✓ ' + sectionId + ' 完成');
});

console.log('');

// 5. 生成 README
console.log('5. 生成主 README...');
const mainReadme = '# PhotoEnglish — Design Handoff\n\nThis folder contains everything needed to implement PhotoEnglish.\n\n## What\'s Included\n\n**Ready-to-Use Prompts:**\n- `prompts/one-shot-prompt.md` — Prompt for full implementation\n- `prompts/section-prompt.md` — Prompt template for section-by-section implementation\n\n**Instructions:**\n- `product-overview.md` — Product summary (provide with every implementation)\n- `instructions/one-shot-instructions.md` — All milestones combined for full implementation\n- `instructions/incremental/` — Milestone-by-milestone instructions (foundation, then sections)\n\n**Design Assets:**\n- `design-system/` — Colors, fonts, design tokens\n- `data-model/` — Core entities and TypeScript types\n- `shell/` — Application shell components\n- `sections/` — All section components, types, sample data, and test instructions\n\n## How to Use This\n\n### Option A: Incremental (Recommended)\n\nBuild your app milestone by milestone for better control:\n\n1. Copy the `product-plan/` folder to your codebase\n2. Start with Foundation (`instructions/incremental/01-foundation.md`)\n3. For each section, use `prompts/section-prompt.md` with the section variables filled in\n4. Review and test after each milestone\n\n### Option B: One-Shot\n\nBuild the entire app in one session:\n\n1. Copy the `product-plan/` folder to your codebase\n2. Open `prompts/one-shot-prompt.md`\n3. Add any additional notes to the prompt\n4. Copy/paste into your coding agent\n5. Answer clarifying questions and let the agent implement\n\n## Test-Driven Development\n\nEach section includes test-writing instructions. For best results:\n\n1. Read `sections/[section-id]/tests.md` before implementing\n2. Write failing tests based on the instructions\n3. Implement the feature to make tests pass\n4. Refactor while keeping tests green\n\nThe test instructions are **framework-agnostic** — adapt to your testing setup (Jest, Vitest, Playwright, Cypress, etc.).\n\n## Tips\n\n- **Use the pre-written prompts** — They include important clarifying questions about auth and data modeling\n- **Add your own notes** — Customize prompts with project-specific context\n- **Build on your designs** — Use completed sections as the starting point for future features\n- **Review thoroughly** — Check plans and implementations carefully\n- **Fill in the gaps** — Backend business logic may need manual additions\n\n---\n\n*Generated by Design OS*\n';

writeFile('product-plan/README.md', mainReadme);
console.log('✓ README 完成\n');

console.log('========================================');
console.log('导出包生成完成！');
console.log('');
console.log('位置: product-plan/');
console.log('');
console.log('包含内容:');
console.log('- 4 个产品部分');
console.log('- 设计系统文件');
console.log('- 数据模型');
console.log('- 应用外壳组件');
console.log('- 主 README');
console.log('========================================');
