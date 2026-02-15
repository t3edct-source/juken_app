#!/usr/bin/env node
/**
 * 小5のおぼえる編を、わかる編のg5に含まれるレッスンのみに対応するように修正
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

// app.jsを読み込む
const appPath = path.join(projectRoot, 'app.js');
let appContent = fs.readFileSync(appPath, 'utf-8');

// g5のレッスンリストを抽出（シミュレーションを除外）
const g5Match = appContent.match(/id: 'g5'[\s\S]*?lessons: \[([\s\S]*?)\]/);
if (!g5Match) {
  console.error('g5のレッスンリストが見つかりません');
  process.exit(1);
}

const g5LessonsText = g5Match[1];
const g5LessonIds = [];
const lessonIdPattern = /'([^']+)'/g;
let match;
while ((match = lessonIdPattern.exec(g5LessonsText)) !== null) {
  const lessonId = match[1];
  // シミュレーションを除外
  if (!lessonId.includes('_sim') && !lessonId.includes('sim')) {
    g5LessonIds.push(lessonId);
  }
}

console.log(`g5のレッスン（シミュレーション除外）: ${g5LessonIds.length}個\n`);

// g5_drillのレッスンリストを抽出
const g5DrillMatch = appContent.match(/id: 'g5_drill'[\s\S]*?lessons: \[([\s\S]*?)\]/);
if (!g5DrillMatch) {
  console.error('g5_drillのレッスンリストが見つかりません');
  process.exit(1);
}

const g5DrillLessonsText = g5DrillMatch[1];
const g5DrillLessonIds = [];
while ((match = lessonIdPattern.exec(g5DrillLessonsText)) !== null) {
  g5DrillLessonIds.push(match[1]);
}

console.log(`g5_drillの現在のレッスン: ${g5DrillLessonIds.length}個\n`);

// わかる編に対応するおぼえる編のみを抽出
const validOboeruIds = [];
for (const wakaruId of g5LessonIds) {
  const oboeruId = wakaruId + '_oboeru';
  if (g5DrillLessonIds.includes(oboeruId)) {
    validOboeruIds.push(oboeruId);
  } else {
    console.log(`⚠️ おぼえる編が見つかりません: ${oboeruId} (わかる編: ${wakaruId})`);
  }
}

// おぼえる編にあって、わかる編に対応しないものを特定
const invalidOboeruIds = [];
for (const oboeruId of g5DrillLessonIds) {
  const wakaruId = oboeruId.replace('_oboeru', '');
  if (!g5LessonIds.includes(wakaruId)) {
    invalidOboeruIds.push(oboeruId);
    console.log(`❌ わかる編に対応していません: ${oboeruId} (わかる編: ${wakaruId} はg5に含まれていません)`);
  }
}

console.log(`\n有効なおぼえる編: ${validOboeruIds.length}個`);
console.log(`削除すべきおぼえる編: ${invalidOboeruIds.length}個\n`);

// catalog.jsonを読み込む
let catalogContent = fs.readFileSync(path.join(projectRoot, 'catalog.json'), 'utf-8');
if (catalogContent.charCodeAt(0) === 0xFEFF) {
  catalogContent = catalogContent.slice(1);
}
const catalog = JSON.parse(catalogContent);

// g5_drillのレッスンリストを再生成
let newG5DrillLessons = '    lessons: [\n';
for (const oboeruId of validOboeruIds.sort()) {
  const catalogEntry = catalog.find(e => e.id === oboeruId);
  const title = catalogEntry?.title?.replace('〈覚える編〉', '') || oboeruId;
  newG5DrillLessons += `      '${oboeruId}', // ${title}\n`;
}
newG5DrillLessons += '    ]';

// app.jsを更新
const g5DrillStart = g5DrillMatch.index + g5DrillMatch[0].indexOf('lessons: [');
const g5DrillEnd = g5DrillMatch.index + g5DrillMatch[0].lastIndexOf(']') + 1;
appContent = appContent.substring(0, g5DrillStart) + newG5DrillLessons + appContent.substring(g5DrillEnd);

fs.writeFileSync(appPath, appContent, 'utf-8');
console.log('✅ app.jsのg5_drillを更新しました\n');

console.log('削除されたレッスン:');
for (const id of invalidOboeruIds) {
  const catalogEntry = catalog.find(e => e.id === id);
  console.log(`  - ${id}: ${catalogEntry?.title || '見つかりません'}`);
}

