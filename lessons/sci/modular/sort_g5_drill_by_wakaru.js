#!/usr/bin/env node
/**
 * 小5のおぼえる編の並び順を、わかる編の並び順に合わせる
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

// catalog.jsonを読み込む
let catalogContent = fs.readFileSync(path.join(projectRoot, 'catalog.json'), 'utf-8');
if (catalogContent.charCodeAt(0) === 0xFEFF) {
  catalogContent = catalogContent.slice(1);
}
const catalog = JSON.parse(catalogContent);

// わかる編の順序に従って、おぼえる編のリストを生成
const oboeruIds = [];
for (const wakaruId of g5LessonIds) {
  const oboeruId = wakaruId + '_oboeru';
  const catalogEntry = catalog.find(e => e.id === oboeruId && e.subject === 'science_drill' && e.grade === 5);
  if (catalogEntry) {
    oboeruIds.push(oboeruId);
  } else {
    console.log(`⚠️ おぼえる編が見つかりません: ${oboeruId} (わかる編: ${wakaruId})`);
  }
}

console.log(`おぼえる編: ${oboeruIds.length}個\n`);

// g5_drillのレッスンリストを更新
const g5DrillMatch = appContent.match(/id: 'g5_drill'[\s\S]*?lessons: \[([\s\S]*?)\]/);
if (!g5DrillMatch) {
  console.error('g5_drillのレッスンリストが見つかりません');
  process.exit(1);
}

// レッスンリストを生成（わかる編と同じ順序、コメントも追加）
let newG5DrillLessons = '    lessons: [\n';
let currentCategory = '';
for (const oboeruId of oboeruIds) {
  const catalogEntry = catalog.find(e => e.id === oboeruId);
  if (!catalogEntry) continue;
  
  const title = catalogEntry.title.replace('〈覚える編〉', '');
  const category = oboeruId.split('.')[1];
  
  // カテゴリが変わったらコメントを追加
  let categoryComment = '';
  if (category === 'biology' && currentCategory !== 'biology') {
    categoryComment = '      // 生物\n';
    currentCategory = 'biology';
  } else if (category === 'chemistry' && currentCategory !== 'chemistry') {
    categoryComment = '      // 化学\n';
    currentCategory = 'chemistry';
  } else if (category === 'earth' && currentCategory !== 'earth') {
    categoryComment = '      // 地学\n';
    currentCategory = 'earth';
  } else if (category === 'physics' && currentCategory !== 'physics') {
    categoryComment = '      // 物理\n';
    currentCategory = 'physics';
  }
  
  newG5DrillLessons += categoryComment;
  newG5DrillLessons += `      '${oboeruId}', // ${title}\n`;
}
newG5DrillLessons += '    ]';

// app.jsを更新
const g5DrillStart = g5DrillMatch.index + g5DrillMatch[0].indexOf('lessons: [');
const g5DrillEnd = g5DrillMatch.index + g5DrillMatch[0].lastIndexOf(']') + 1;
appContent = appContent.substring(0, g5DrillStart) + newG5DrillLessons + appContent.substring(g5DrillEnd);

fs.writeFileSync(appPath, appContent, 'utf-8');
console.log('✅ app.jsのg5_drillを更新しました（わかる編の順序に合わせました）\n');

// 確認のため、最初の5個と最後の5個を表示
console.log('最初の5個:');
for (let i = 0; i < Math.min(5, oboeruIds.length); i++) {
  const catalogEntry = catalog.find(e => e.id === oboeruIds[i]);
  console.log(`  ${i + 1}. ${oboeruIds[i]}: ${catalogEntry?.title || '見つかりません'}`);
}
console.log('\n最後の5個:');
for (let i = Math.max(0, oboeruIds.length - 5); i < oboeruIds.length; i++) {
  const catalogEntry = catalog.find(e => e.id === oboeruIds[i]);
  console.log(`  ${i + 1}. ${oboeruIds[i]}: ${catalogEntry?.title || '見つかりません'}`);
}

