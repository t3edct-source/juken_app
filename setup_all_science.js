const fs = require('fs');
const catalog = JSON.parse(fs.readFileSync('catalog.json', 'utf8'));

const sciLessons = catalog.filter(e => e.subject === 'sci');
const oboeruLessons = catalog.filter(e => e.subject === 'science_drill');

function idToFileName(id) {
  return id.replace(/^sci\./, '').replace(/\./g, '_');
}

const template = 'window.questions = [\n  // 問題データをここに追加してください\n];';

// ファイル作成
let created = 0;
for (const lesson of [...oboeruLessons, ...sciLessons]) {
  const dir = lesson.subject === 'science_drill' ? 'lessons/sci/modular/oboeru' : 'lessons/sci/modular/wakaru';
  const file = `${dir}/${idToFileName(lesson.id)}.js`;
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, template, 'utf8');
    created++;
  }
}

console.log(`✅ ${created}個のファイルを作成しました`);

