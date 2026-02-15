#!/usr/bin/env node
/**
 * 小5のわかる編からシミュレーションシリーズを除外して、覚える編との対応を確認
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

// 小5の覚える編を取得
const g5OboeruLessons = catalog.filter(e => 
  e.subject === 'science_drill' && 
  e.grade === 5
);

console.log('='.repeat(80));
console.log('小5のわかる編とおぼえる編の対応関係（シミュレーション除外）');
console.log('='.repeat(80));
console.log(`\nわかる編（シミュレーション除外）: ${g5WakaruLessons.length}個`);
console.log(`おぼえる編: ${g5OboeruLessons.length}個\n`);

// わかる編の一覧
console.log('\n【小5わかる編の一覧（シミュレーション除外）】');
console.log('-'.repeat(80));
for (const lesson of g5WakaruLessons.sort((a, b) => a.id.localeCompare(b.id))) {
  console.log(`${lesson.id}`);
  console.log(`  タイトル: ${lesson.title}`);
  console.log('');
}

// おぼえる編の一覧
console.log('\n【小5おぼえる編の一覧】');
console.log('-'.repeat(80));
for (const lesson of g5OboeruLessons.sort((a, b) => a.id.localeCompare(b.id))) {
  const wakaruId = lesson.id.replace('_oboeru', '');
  const wakaruLesson = g5WakaruLessons.find(w => w.id === wakaruId);
  const status = wakaruLesson ? '✅ 対応あり' : '❌ 対応なし';
  console.log(`${lesson.id} ${status}`);
  console.log(`  タイトル: ${lesson.title}`);
  if (!wakaruLesson) {
    console.log(`  対応するわかる編: ${wakaruId} (存在しません)`);
  }
  console.log('');
}

// 対応関係を確認
const wakaruIds = new Set(g5WakaruLessons.map(l => l.id));
const oboeruWithWakaru = [];
const oboeruWithoutWakaru = [];

for (const oboeru of g5OboeruLessons) {
  const wakaruId = oboeru.id.replace('_oboeru', '');
  if (wakaruIds.has(wakaruId)) {
    oboeruWithWakaru.push(oboeru);
  } else {
    oboeruWithoutWakaru.push(oboeru);
  }
}

console.log(`\n対応しているおぼえる編: ${oboeruWithWakaru.length}個`);
console.log(`対応していないおぼえる編: ${oboeruWithoutWakaru.length}個`);

if (oboeruWithoutWakaru.length > 0) {
  console.log('\n【対応していないおぼえる編】');
  for (const oboeru of oboeruWithoutWakaru) {
    console.log(`  - ${oboeru.id}: ${oboeru.title}`);
  }
}

// 重複チェック
const oboeruTitles = g5OboeruLessons.map(l => l.title);
const duplicateTitles = oboeruTitles.filter((title, index) => oboeruTitles.indexOf(title) !== index);
if (duplicateTitles.length > 0) {
  console.log('\n【重複しているタイトル】');
  const uniqueDuplicates = [...new Set(duplicateTitles)];
  for (const title of uniqueDuplicates) {
    const lessons = g5OboeruLessons.filter(l => l.title === title);
    console.log(`  "${title}": ${lessons.length}個`);
    for (const lesson of lessons) {
      console.log(`    - ${lesson.id}`);
    }
  }
}

