#!/usr/bin/env node
/**
 * catalog.jsonからloader.js、index_modular.html、app.jsを更新する
 */
const fs = require('fs');
const path = require('path');

// プロジェクトルートを取得
function findProjectRoot() {
  let currentDir = __dirname;
  for (let i = 0; i < 10; i++) {
    const catalogPath = path.join(currentDir, 'catalog.json');
    if (fs.existsSync(catalogPath)) {
      return currentDir;
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break;
    currentDir = parentDir;
  }
  return __dirname;
}

const projectRoot = findProjectRoot();

// catalog.jsonを読み込む
let catalogContent = fs.readFileSync(path.join(projectRoot, 'catalog.json'), 'utf-8');
if (catalogContent.charCodeAt(0) === 0xFEFF) {
  catalogContent = catalogContent.slice(1);
}
const catalog = JSON.parse(catalogContent);

// science_drillのレッスンを取得
const oboeruLessons = catalog.filter(e => e.subject === 'science_drill');
console.log(`おぼえる編レッスン数: ${oboeruLessons.length}個\n`);

// IDからファイル名を生成する関数（loader.jsと同じロジック）
function idToFileName(id) {
  // 特別なケース: seasons_living_things_oboeru
  if (id === 'sci.biology.seasons_living_things_oboeru') {
    return 'seasons_living_things_spring.js';
  }
  return id.replace(/^sci\./, '').replace(/\./g, '_') + '.js';
}

// loader.jsのmapを生成
const loaderMap = {};
for (const lesson of oboeruLessons) {
  const fileName = idToFileName(lesson.id);
  loaderMap[lesson.id] = fileName;
}

// loader.jsを更新
const loaderPath = path.join(projectRoot, 'lessons', 'sci', 'modular', 'oboeru', 'loader.js');
let loaderContent = fs.readFileSync(loaderPath, 'utf-8');

// mapオブジェクトを置き換え
const mapStart = loaderContent.indexOf('const map = {');
const mapEnd = loaderContent.indexOf('};', mapStart) + 2;

// mapの内容を生成
let mapContent = '  const map = {\n';
const sortedIds = Object.keys(loaderMap).sort();
for (const id of sortedIds) {
  const fileName = loaderMap[id];
  // カテゴリごとにコメントを追加
  const category = id.split('.')[1];
  if (id === sortedIds[0] || id.split('.')[1] !== sortedIds[sortedIds.indexOf(id) - 1]?.split('.')[1]) {
    const categoryNames = {
      'biology': '生物',
      'chemistry': '化学',
      'physics': '物理',
      'earth': '地学',
      'comprehensive': '総合'
    };
    mapContent += `    // ${categoryNames[category] || category}\n`;
  }
  mapContent += `    '${id}': '${fileName}',\n`;
}
mapContent += '  };';

loaderContent = loaderContent.substring(0, mapStart) + mapContent + loaderContent.substring(mapEnd);
fs.writeFileSync(loaderPath, loaderContent, 'utf-8');
console.log('✅ loader.jsを更新しました');

// index_modular.htmlのeraMapを更新
const indexPath = path.join(projectRoot, 'lessons', 'sci', 'modular', 'oboeru', 'index_modular.html');
let indexContent = fs.readFileSync(indexPath, 'utf-8');

// eraMapを置き換え
const eraMapStart = indexContent.indexOf('const eraMap = {');
const eraMapEnd = indexContent.indexOf('};', eraMapStart) + 2;

let eraMapContent = '    const eraMap = {\n';
for (const id of sortedIds) {
  const lesson = oboeruLessons.find(l => l.id === id);
  const title = lesson ? lesson.title.replace('〈覚える編〉', '') : id;
  const category = id.split('.')[1];
  if (id === sortedIds[0] || id.split('.')[1] !== sortedIds[sortedIds.indexOf(id) - 1]?.split('.')[1]) {
    const categoryNames = {
      'biology': '生物',
      'chemistry': '化学',
      'physics': '物理',
      'earth': '地学',
      'comprehensive': '総合'
    };
    eraMapContent += `      // ${categoryNames[category] || category}\n`;
  }
  eraMapContent += `      '${id}': '${title}',\n`;
}
eraMapContent += '    };';

indexContent = indexContent.substring(0, eraMapStart) + eraMapContent + indexContent.substring(eraMapEnd);
fs.writeFileSync(indexPath, indexContent, 'utf-8');
console.log('✅ index_modular.htmlを更新しました');

// app.jsのscienceDrillUnitsを更新
const appPath = path.join(projectRoot, 'app.js');
let appContent = fs.readFileSync(appPath, 'utf-8');

// scienceDrillUnitsの各単元のlessons配列を更新
const gradeMap = {
  'g4_drill': 4,
  'g5_drill': 5,
  'g6_drill': 6
};

for (const [unitId, grade] of Object.entries(gradeMap)) {
  // 該当する学年のレッスンを取得
  const gradeLessons = oboeruLessons.filter(l => l.grade === grade);
  
  // app.js内の該当単元のlessons配列を探す
  const unitPattern = new RegExp(`id: '${unitId}'[\\s\\S]*?lessons: \\[[\\s\\S]*?\\]`, 'm');
  const match = appContent.match(unitPattern);
  
  if (match) {
    // lessons配列の内容を生成
    let lessonsContent = '    lessons: [\n';
    for (const lesson of gradeLessons) {
      const title = lesson.title.replace('〈覚える編〉', '');
      lessonsContent += `      '${lesson.id}', // ${title}\n`;
    }
    lessonsContent += '    ]';
    
    // lessons配列を置き換え
    const lessonsStart = match[0].indexOf('lessons: [');
    const lessonsEnd = match[0].lastIndexOf(']') + 1;
    const newMatch = match[0].substring(0, lessonsStart) + lessonsContent + match[0].substring(lessonsEnd);
    appContent = appContent.replace(match[0], newMatch);
    console.log(`✅ app.jsの${unitId}を更新しました（${gradeLessons.length}個のレッスン）`);
  }
}

fs.writeFileSync(appPath, appContent, 'utf-8');
console.log('\n✅ すべてのファイルを更新しました');

