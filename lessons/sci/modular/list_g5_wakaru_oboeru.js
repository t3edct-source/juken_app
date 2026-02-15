#!/usr/bin/env node
/**
 * 小5のわかる編とおぼえる編の一覧をリスト化
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

// わかる編とおぼえる編のディレクトリ
const wakaruDir = path.join(projectRoot, 'lessons', 'sci', 'modular', 'wakaru');
const oboeruDir = path.join(projectRoot, 'lessons', 'sci', 'modular', 'oboeru');

const excludeFiles = ['loader.js', 'script.js', 'index_modular.html', 'style.css'];

// ファイル一覧を取得
const wakaruFiles = fs.readdirSync(wakaruDir)
  .filter(file => file.endsWith('.js') && !excludeFiles.includes(file))
  .filter(file => !file.includes('.backup'))
  .sort();

const oboeruFiles = fs.readdirSync(oboeruDir)
  .filter(file => file.endsWith('.js') && !excludeFiles.includes(file))
  .filter(file => !file.includes('.backup'))
  .filter(file => !file.endsWith('.hidden'))
  .sort();

// ファイル名からレッスンIDを生成
function fileNameToId(filename, isOboeru = false) {
  let name = filename.replace('.js', '');
  
  if (name === 'seasons_living_things_spring') {
    return isOboeru 
      ? 'sci.biology.seasons_living_things_oboeru'
      : 'sci.biology.seasons_living_things';
  }
  
  if (isOboeru && name.endsWith('_oboeru')) {
    name = name.slice(0, -7);
  }
  
  const parts = name.split('_');
  if (parts.length < 2) {
    return null;
  }
  
  const category = parts[0];
  const topic = parts.slice(1).join('_');
  
  const lessonId = `sci.${category}.${topic}`;
  return isOboeru ? lessonId + '_oboeru' : lessonId;
}

// 小5のレッスンを抽出
const g5WakaruLessons = [];
for (const file of wakaruFiles) {
  const lessonId = fileNameToId(file, false);
  if (lessonId) {
    const catalogEntry = catalog.find(e => e.id === lessonId && e.subject === 'sci');
    if (catalogEntry && catalogEntry.grade === 5) {
      g5WakaruLessons.push({
        id: lessonId,
        file: file,
        title: catalogEntry.title,
        grade: catalogEntry.grade
      });
    }
  }
}

const g5OboeruLessons = [];
for (const file of oboeruFiles) {
  let lessonId;
  if (file === 'seasons_living_things_spring.js') {
    lessonId = 'sci.biology.seasons_living_things_oboeru';
  } else {
    lessonId = fileNameToId(file, true);
  }
  
  if (lessonId) {
    const catalogEntry = catalog.find(e => e.id === lessonId && e.subject === 'science_drill');
    if (catalogEntry && catalogEntry.grade === 5) {
      g5OboeruLessons.push({
        id: lessonId,
        file: file,
        title: catalogEntry.title,
        grade: catalogEntry.grade,
        wakaruId: lessonId.replace('_oboeru', '')
      });
    }
  }
}

// 対応関係を確認
const wakaruIds = new Set(g5WakaruLessons.map(l => l.id));
const oboeruWithWakaru = [];
const oboeruWithoutWakaru = [];

for (const oboeru of g5OboeruLessons) {
  if (wakaruIds.has(oboeru.wakaruId)) {
    oboeruWithWakaru.push(oboeru);
  } else {
    oboeruWithoutWakaru.push(oboeru);
  }
}

// 結果を出力
console.log('='.repeat(80));
console.log('小5のわかる編とおぼえる編の対応関係');
console.log('='.repeat(80));
console.log(`\nわかる編: ${g5WakaruLessons.length}個`);
console.log(`おぼえる編: ${g5OboeruLessons.length}個`);
console.log(`対応しているおぼえる編: ${oboeruWithWakaru.length}個`);
console.log(`対応していないおぼえる編: ${oboeruWithoutWakaru.length}個\n`);

// わかる編の一覧
console.log('\n【小5わかる編の一覧】');
console.log('-'.repeat(80));
for (const lesson of g5WakaruLessons.sort((a, b) => a.id.localeCompare(b.id))) {
  console.log(`${lesson.id}`);
  console.log(`  ファイル: ${lesson.file}`);
  console.log(`  タイトル: ${lesson.title}`);
  console.log('');
}

// おぼえる編の一覧（対応しているもの）
console.log('\n【小5おぼえる編の一覧（わかる編に対応）】');
console.log('-'.repeat(80));
for (const oboeru of oboeruWithWakaru.sort((a, b) => a.id.localeCompare(b.id))) {
  const wakaru = g5WakaruLessons.find(w => w.id === oboeru.wakaruId);
  console.log(`${oboeru.id}`);
  console.log(`  ファイル: ${oboeru.file}`);
  console.log(`  タイトル: ${oboeru.title}`);
  console.log(`  対応するわかる編: ${wakaru ? wakaru.id : oboeru.wakaruId} (${wakaru ? wakaru.file : '見つかりません'})`);
  console.log('');
}

// おぼえる編の一覧（対応していないもの）
if (oboeruWithoutWakaru.length > 0) {
  console.log('\n【小5おぼえる編の一覧（わかる編に対応していない）】');
  console.log('-'.repeat(80));
  for (const oboeru of oboeruWithoutWakaru.sort((a, b) => a.id.localeCompare(b.id))) {
    console.log(`${oboeru.id}`);
    console.log(`  ファイル: ${oboeru.file}`);
    console.log(`  タイトル: ${oboeru.title}`);
    console.log(`  対応するわかる編: ${oboeru.wakaruId} (存在しません)`);
    console.log('');
  }
}

// app.jsのg5_drillのレッスンリストも確認
const appPath = path.join(projectRoot, 'app.js');
const appContent = fs.readFileSync(appPath, 'utf-8');
const g5DrillMatch = appContent.match(/id: 'g5_drill'[\s\S]*?lessons: \[([\s\S]*?)\]/);
if (g5DrillMatch) {
  const lessonsText = g5DrillMatch[1];
  const lessonIds = lessonsText.match(/'([^']+)'/g)?.map(m => m.slice(1, -1)) || [];
  console.log('\n【app.jsのg5_drillに登録されているレッスン】');
  console.log('-'.repeat(80));
  console.log(`登録数: ${lessonIds.length}個\n`);
  for (const id of lessonIds.sort()) {
    const catalogEntry = catalog.find(e => e.id === id);
    console.log(`  ${id}`);
    console.log(`    タイトル: ${catalogEntry?.title || '見つかりません'}`);
    console.log(`    学年: 小${catalogEntry?.grade || '?'}`);
    console.log('');
  }
}

