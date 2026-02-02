const fs = require('fs');
const path = require('path');

console.log('开始复制组件...\n');

// 复制 Shell 组件
console.log('1. 复制 Shell 组件...');
const shellComponents = ['AppShell', 'MainNav', 'UserMenu'];
shellComponents.forEach(comp => {
  const src = 'product-plan/shell/components/' + comp + '.tsx';
  const dest = 'app/src/components/shell/' + comp + '.tsx';

  if (fs.existsSync(src)) {
    let content = fs.readFileSync(src, 'utf8');

    // 移除 Design OS 特定的导入，保留 lucide-react
    content = content.replace(/import.*from\s+['"]@\/.*['"]/g, (match) => {
      if (match.includes('lucide-react')) {
        return match;
      }
      return '';
    });

    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, content);
    console.log('  ✓', comp);
  }
});

// 复制各个部分的组件
const sections = ['photo-capture', 'vocabulary-library', 'practice-review', 'progress-dashboard'];

sections.forEach(sectionId => {
  console.log('2. 复制 ' + sectionId + ' 组件...');

  const srcDir = 'product-plan/sections/' + sectionId + '/components/';
  const destDir = 'app/src/components/' + sectionId + '/';

  if (fs.existsSync(srcDir)) {
    fs.mkdirSync(destDir, { recursive: true });

    const files = fs.readdirSync(srcDir);
    files.forEach(file => {
      if (file.endsWith('.tsx')) {
        const src = path.join(srcDir, file);
        const dest = path.join(destDir, file);
        let content = fs.readFileSync(src, 'utf8');

        // 调整导入路径 - 移除 product-plan 特定的导入
        content = content
          .replace(/from '@\/\.\.\/\.\.\/product\/sections\/[^\/]+\/types'/g, 'from \'../../../lib/types\'')
          .replace(/from ['"]lucide-react['"]/g, 'from \'lucide-react\'');

        fs.writeFileSync(dest, content);
        console.log('  ✓', sectionId + '/' + file);
      }
    });
  }
});

// 复制类型定义
console.log('3. 复制类型定义...');
const typeFiles = [
  'product-plan/sections/photo-capture/types.ts',
  'product-plan/sections/vocabulary-library/types.ts',
  'product-plan/sections/practice-review/types.ts',
  'product-plan/sections/progress-dashboard/types.ts'
];

let allTypes = '';
typeFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    allTypes += '// ' + path.basename(file, '.ts') + '\n';
    allTypes += content + '\n\n';
  }
});

fs.writeFileSync('app/src/lib/types.ts', allTypes);
console.log('  ✓ types.ts');

console.log('\n========================================');
console.log('组件复制完成！');
console.log('========================================');
