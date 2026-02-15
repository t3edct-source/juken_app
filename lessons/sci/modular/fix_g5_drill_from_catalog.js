#!/usr/bin/env node
/**
 * catalog.jsonの小5わかる編（シミュレーション除外）に対応するおぼえる編のみをg5_drillに登録
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

// 小5のわかる編を取得（シミュレーションシリーズを除外）
const g5WakaruLessons = catalog.filter(e => 
  e.subject === 'sci' && 
  e.grade === 5 &&
  !e.title.includes('シミュレーションで学ぶ理科') &&
  !e.id.includes('_sim') &&
  !e.path.includes('_sim') &&
  !e.path.includes('sim.html')
);

console.log(`小5わかる編（シミュレーション除外）: ${g5WakaruLessons.length}個\n`);

// 小5のおぼえる編を取得
const g5OboeruLessons = catalog.filter(e => 
  e.subject === 'science_drill' && 
  e.grade === 5
);

// わかる編に対応するおぼえる編のみを抽出
const validOboeruIds = [];
for (const wakaruLesson of g5WakaruLessons) {
  const oboeruId = wakaruLesson.id + '_oboeru';
  const oboeruLesson = g5OboeruLessons.find(o => o.id === oboeruId);
  if (oboeruLesson) {
    validOboeruIds.push(oboeruId);
  } else {
    console.log(`⚠️ おぼえる編が見つかりません: ${oboeruId} (わかる編: ${wakaruLesson.title})`);
  }
}

console.log(`有効なおぼえる編: ${validOboeruIds.length}個\n`);

// app.jsを読み込む
const appPath = path.join(projectRoot, 'app.js');
let appContent = fs.readFileSync(appPath, 'utf-8');

// g5_drillのレッスンリストを更新
const g5DrillMatch = appContent.match(/id: 'g5_drill'[\s\S]*?lessons: \[([\s\S]*?)\]/);
if (!g5DrillMatch) {
  console.error('g5_drillのレッスンリストが見つかりません');
  process.exit(1);
}

// レッスンリストを再生成（カテゴリ別に整理）
const categories = {
  biology: [],
  chemistry: [],
  earth: [],
  physics: []
};

for (const oboeruId of validOboeruIds) {
  const catalogEntry = catalog.find(e => e.id === oboeruId);
  if (!catalogEntry) continue;
  
  const title = catalogEntry.title.replace('〈覚える編〉', '');
  const category = oboeruId.split('.')[1];
  
  if (category === 'biology') {
    categories.biology.push({ id: oboeruId, title });
  } else if (category === 'chemistry') {
    categories.chemistry.push({ id: oboeruId, title });
  } else if (category === 'earth') {
    categories.earth.push({ id: oboeruId, title });
  } else if (category === 'physics') {
    categories.physics.push({ id: oboeruId, title });
  }
}

// ソート
categories.biology.sort((a, b) => a.id.localeCompare(b.id));
categories.chemistry.sort((a, b) => a.id.localeCompare(b.id));
categories.earth.sort((a, b) => a.id.localeCompare(b.id));
categories.physics.sort((a, b) => a.id.localeCompare(b.id));

// レッスンリストを生成
let newG5DrillLessons = '    lessons: [\n';
if (categories.biology.length > 0) {
  newG5DrillLessons += '      // 生物\n';
  for (const lesson of categories.biology) {
    newG5DrillLessons += `      '${lesson.id}', // ${lesson.title}\n`;
  }
}
if (categories.chemistry.length > 0) {
  newG5DrillLessons += '      // 化学\n';
  for (const lesson of categories.chemistry) {
    newG5DrillLessons += `      '${lesson.id}', // ${lesson.title}\n`;
  }
}
if (categories.earth.length > 0) {
  newG5DrillLessons += '      // 地学\n';
  for (const lesson of categories.earth) {
    newG5DrillLessons += `      '${lesson.id}', // ${lesson.title}\n`;
  }
}
if (categories.physics.length > 0) {
  newG5DrillLessons += '      // 物理\n';
  for (const lesson of categories.physics) {
    newG5DrillLessons += `      '${lesson.id}', // ${lesson.title}\n`;
  }
}
newG5DrillLessons += '    ]';

// app.jsを更新
const g5DrillStart = g5DrillMatch.index + g5DrillMatch[0].indexOf('lessons: [');
const g5DrillEnd = g5DrillMatch.index + g5DrillMatch[0].lastIndexOf(']') + 1;
appContent = appContent.substring(0, g5DrillStart) + newG5DrillLessons + appContent.substring(g5DrillEnd);

fs.writeFileSync(appPath, appContent, 'utf-8');
console.log('✅ app.jsのg5_drillを更新しました');
console.log(`   生物: ${categories.biology.length}個`);
console.log(`   化学: ${categories.chemistry.length}個`);
console.log(`   地学: ${categories.earth.length}個`);
console.log(`   物理: ${categories.physics.length}個`);
console.log(`   合計: ${validOboeruIds.length}個\n`);

