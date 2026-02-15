#!/usr/bin/env node
/**
 * わかる編とおぼえる編の一覧をリスト化し、対応関係を確認する
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
  .sort();

// ファイル名からレッスンIDを生成
function fileNameToId(filename, isOboeru = false) {
  let name = filename.replace('.js', '');
  
  // 特別なケース: seasons_living_things_spring.js
  if (name === 'seasons_living_things_spring') {
    return isOboeru 
      ? 'sci.biology.seasons_living_things_oboeru'
      : 'sci.biology.seasons_living_things';
  }
  
  // _oboeruを削除
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

// わかる編のレッスンIDを生成
const wakaruLessons = [];
for (const file of wakaruFiles) {
  const lessonId = fileNameToId(file, false);
  if (lessonId) {
    const catalogEntry = catalog.find(e => e.id === lessonId && e.subject === 'sci');
    wakaruLessons.push({
      id: lessonId,
      file: file,
      title: catalogEntry?.title || file,
      grade: catalogEntry?.grade || '?'
    });
  }
}

// おぼえる編のレッスンIDを生成
const oboeruLessons = [];
for (const file of oboeruFiles) {
  let lessonId;
  if (file === 'seasons_living_things_spring.js') {
    lessonId = 'sci.biology.seasons_living_things_oboeru';
  } else {
    lessonId = fileNameToId(file, true);
  }
  
  if (lessonId) {
    const catalogEntry = catalog.find(e => e.id === lessonId && e.subject === 'science_drill');
    oboeruLessons.push({
      id: lessonId,
      file: file,
      title: catalogEntry?.title || file,
      grade: catalogEntry?.grade || '?',
      wakaruId: lessonId.replace('_oboeru', '')
    });
  }
}

// 対応関係を確認
const wakaruIds = new Set(wakaruLessons.map(l => l.id));
const oboeruWithWakaru = [];
const oboeruWithoutWakaru = [];

for (const oboeru of oboeruLessons) {
  if (wakaruIds.has(oboeru.wakaruId)) {
    oboeruWithWakaru.push(oboeru);
  } else {
    oboeruWithoutWakaru.push(oboeru);
  }
}

// 結果を出力
console.log('='.repeat(80));
console.log('わかる編とおぼえる編の対応関係');
console.log('='.repeat(80));
console.log(`\nわかる編: ${wakaruLessons.length}個`);
console.log(`おぼえる編: ${oboeruLessons.length}個`);
console.log(`対応しているおぼえる編: ${oboeruWithWakaru.length}個`);
console.log(`対応していないおぼえる編: ${oboeruWithoutWakaru.length}個\n`);

// わかる編の一覧
console.log('\n【わかる編の一覧】');
console.log('-'.repeat(80));
for (const lesson of wakaruLessons) {
  console.log(`[小${lesson.grade}] ${lesson.id}`);
  console.log(`  ファイル: ${lesson.file}`);
  console.log(`  タイトル: ${lesson.title}`);
  console.log('');
}

// おぼえる編の一覧（対応しているもの）
console.log('\n【おぼえる編の一覧（わかる編に対応）】');
console.log('-'.repeat(80));
for (const oboeru of oboeruWithWakaru.sort((a, b) => a.id.localeCompare(b.id))) {
  const wakaru = wakaruLessons.find(w => w.id === oboeru.wakaruId);
  console.log(`[小${oboeru.grade}] ${oboeru.id}`);
  console.log(`  ファイル: ${oboeru.file}`);
  console.log(`  タイトル: ${oboeru.title}`);
  console.log(`  対応するわかる編: ${wakaru ? wakaru.id : oboeru.wakaruId} (${wakaru ? wakaru.file : '見つかりません'})`);
  console.log('');
}

// おぼえる編の一覧（対応していないもの）
if (oboeruWithoutWakaru.length > 0) {
  console.log('\n【おぼえる編の一覧（わかる編に対応していない）】');
  console.log('-'.repeat(80));
  for (const oboeru of oboeruWithoutWakaru.sort((a, b) => a.id.localeCompare(b.id))) {
    console.log(`[小${oboeru.grade}] ${oboeru.id}`);
    console.log(`  ファイル: ${oboeru.file}`);
    console.log(`  タイトル: ${oboeru.title}`);
    console.log(`  対応するわかる編: ${oboeru.wakaruId} (存在しません)`);
    console.log('');
  }
}

// CSV形式でも出力
const csvPath = path.join(projectRoot, 'lessons', 'sci', 'modular', 'wakaru_oboeru_list.csv');
let csvContent = '種類,学年,レッスンID,ファイル名,タイトル,対応するレッスンID\n';

// わかる編
for (const lesson of wakaruLessons) {
  csvContent += `わかる編,小${lesson.grade},"${lesson.id}","${lesson.file}","${lesson.title}",\n`;
}

// おぼえる編（対応している）
for (const oboeru of oboeruWithWakaru.sort((a, b) => a.id.localeCompare(b.id))) {
  csvContent += `おぼえる編（対応あり）,小${oboeru.grade},"${oboeru.id}","${oboeru.file}","${oboeru.title}","${oboeru.wakaruId}"\n`;
}

// おぼえる編（対応していない）
for (const oboeru of oboeruWithoutWakaru.sort((a, b) => a.id.localeCompare(b.id))) {
  csvContent += `おぼえる編（対応なし）,小${oboeru.grade},"${oboeru.id}","${oboeru.file}","${oboeru.title}","${oboeru.wakaruId}"\n`;
}

fs.writeFileSync(csvPath, csvContent, 'utf-8');
console.log(`\n✅ CSVファイルを出力しました: ${csvPath}`);

