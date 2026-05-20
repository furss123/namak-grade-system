/**
 * 프로젝트 텍스트 파일 줄바꿈을 LF로 통일
 * 실행: node scripts/normalize-line-endings.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const skipDirs = new Set(['node_modules', '.git']);
const exts = new Set([
  '.html', '.js', '.mjs', '.cjs', '.json', '.md', '.yml', '.yaml',
  '.css', '.gitattributes', '.gitignore', '.editorconfig',
]);

function walk(dir, out) {
  for (const name of fs.readdirSync(dir)) {
    if (skipDirs.has(name)) continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else {
      const ext = path.extname(name) || (name.startsWith('.') ? name : '');
      if (exts.has(ext) || name === '.gitattributes' || name === '.gitignore') out.push(p);
    }
  }
}

const files = [];
walk(root, files);
walk(path.join(root, 'verification'), files);

let changed = 0;
for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8');
  const normalized = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (raw !== normalized) {
    fs.writeFileSync(file, normalized, 'utf8');
    changed++;
    console.log('LF:', path.relative(root, file));
  }
}
console.log(`Done. ${changed} file(s) normalized.`);
