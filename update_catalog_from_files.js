#!/usr/bin/env node
/**
 * 実際のファイルからcatalog.jsonを更新する
 * わかる編のファイルから、対応するおぼえる編のレッスンを自動生成
 */
const fs = require('fs');
const path = require('path');

// プロジェクトルートを取得（catalog.jsonがあるディレクトリを探す）
function findProjectRoot() {
  let currentDir = __dirname;
  
  // 最大10階層まで上に遡る
  for (let i = 0; i < 10; i++) {
    const catalogPath = path.join(currentDir, 'catalog.json');
    if (fs.existsSync(catalogPath)) {
      return currentDir;
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break; // ルートディレクトリに到達
    }
    currentDir = parentDir;
  }
  
  // 見つからない場合は__dirnameを使用
  console.warn('警告: catalog.jsonが見つかりません。__dirnameを使用します:', __dirname);
  return __dirname;
}

const projectRoot = findProjectRoot();
console.log('プロジェクトルート:', projectRoot);

// catalog.jsonを読み込む
const catalog = JSON.parse(fs.readFileSync(path.join(projectRoot, 'catalog.json'), 'utf-8'));

// わかる編とおぼえる編のディレクトリ
const wakaruDir = path.join(projectRoot, 'lessons', 'sci', 'modular', 'wakaru');
const oboeruDir = path.join(projectRoot, 'lessons', 'sci', 'modular', 'oboeru');

const excludeFiles = ['loader.js', 'script.js', 'index_modular.html', 'style.css'];

// ファイル一覧を取得
const wakaruFiles = fs.readdirSync(wakaruDir)
  .filter(file => file.endsWith('.js') && !excludeFiles.includes(file))
  .filter(file => !file.includes('.backup'));

const oboeruFiles = fs.readdirSync(oboeruDir)
  .filter(file => file.endsWith('.js') && !excludeFiles.includes(file))
  .filter(file => !file.includes('.backup'));

console.log(`わかる編ファイル数: ${wakaruFiles.length}`);
console.log(`おぼえる編ファイル数: ${oboeruFiles.length}\n`);

// 既存のレッスンIDを取得
const existingSciIds = new Set(catalog.filter(e => e.subject === 'sci').map(e => e.id));
const existingDrillIds = new Set(catalog.filter(e => e.subject === 'science_drill').map(e => e.id));

// ファイル名からレッスンIDを生成（loader.jsのidToFileNameの逆変換）
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
  
  // アンダースコアをドットに変換し、sci.を先頭に追加
  // biology_plants_growth_light → sci.biology.plants_growth_light
  const parts = name.split('_');
  if (parts.length < 2) {
    return null; // 無効なファイル名
  }
  
  const category = parts[0]; // biology, chemistry, physics, earth, comprehensive
  const topic = parts.slice(1).join('_');
  
  const lessonId = `sci.${category}.${topic}`;
  return isOboeru ? lessonId + '_oboeru' : lessonId;
}

// わかる編のファイルからレッスンIDを生成
const wakaruFileToId = new Map();
for (const file of wakaruFiles) {
  const lessonId = fileNameToId(file, false);
  if (lessonId) {
    wakaruFileToId.set(lessonId, file);
  }
}

// おぼえる編のファイルからレッスンIDを生成
const oboeruFileToId = new Map();
for (const file of oboeruFiles) {
  if (file === 'seasons_living_things_spring.js') {
    oboeruFileToId.set('sci.biology.seasons_living_things_oboeru', file);
  } else {
    const lessonId = fileNameToId(file, true);
    if (lessonId) {
      oboeruFileToId.set(lessonId, file);
    }
  }
}

// 不足しているレッスンを特定
const missingWakaru = [];
for (const [lessonId, file] of wakaruFileToId) {
  if (!existingSciIds.has(lessonId)) {
    missingWakaru.push({ lessonId, file });
  }
}

const missingOboeru = [];
for (const [lessonId, file] of oboeruFileToId) {
  if (!existingDrillIds.has(lessonId)) {
    missingOboeru.push({ lessonId, file });
  }
}

console.log(`不足しているわかる編: ${missingWakaru.length}個`);
console.log(`不足しているおぼえる編: ${missingOboeru.length}個\n`);

// 不足しているレッスンを追加
let addedCount = 0;

// わかる編を追加（既存のレッスンから情報を取得できない場合はデフォルト値を使用）
for (const { lessonId, file } of missingWakaru) {
  // 類似のレッスンを探す（同じカテゴリのレッスン）
  const parts = lessonId.split('.');
  const category = parts[1];
  const topic = parts.slice(2).join('_');
  
  const similarLesson = catalog.find(e => 
    e.subject === 'sci' && 
    e.id.includes(category) &&
    e.id.includes(topic.split('_')[0])
  );
  
  const newLesson = {
    id: lessonId,
    grade: similarLesson?.grade || 4,
    subject: 'sci',
    title: similarLesson?.title || topic.replace(/_/g, ' '),
    duration_min: similarLesson?.duration_min || 15,
    sku_required: similarLesson?.sku_required || null,
    path: `lessons/sci/modular/wakaru/index_modular.html?era=${lessonId}&mode=wakaru`,
    format: 'html',
    tags: similarLesson?.tags || []
  };
  
  catalog.push(newLesson);
  addedCount++;
  console.log(`[追加] わかる編: ${lessonId} - ${newLesson.title}`);
}

// おぼえる編を追加（対応するわかる編から情報を取得）
for (const { lessonId, file } of missingOboeru) {
  // 対応するわかる編のIDを取得
  const wakaruId = lessonId.replace('_oboeru', '');
  const wakaruLesson = catalog.find(e => e.id === wakaruId && e.subject === 'sci');
  
  if (!wakaruLesson) {
    console.log(`[警告] 対応するわかる編が見つかりません: ${wakaruId}`);
    continue;
  }
  
  const newLesson = {
    id: lessonId,
    grade: wakaruLesson.grade,
    subject: 'science_drill',
    title: wakaruLesson.title + '〈覚える編〉',
    duration_min: wakaruLesson.duration_min,
    sku_required: wakaruLesson.sku_required,
    path: `lessons/sci/modular/oboeru/index_modular.html?era=${lessonId}&mode=oboeru`,
    format: 'html',
    tags: wakaruLesson.tags
  };
  
  catalog.push(newLesson);
  addedCount++;
  console.log(`[追加] おぼえる編: ${lessonId} - ${newLesson.title}`);
}

// catalog.jsonを保存
if (addedCount > 0) {
  // IDでソート（sci.で始まるものをまとめる）
  catalog.sort((a, b) => {
    // まずsubjectでソート
    const subjectOrder = { 'sci': 1, 'science_drill': 2 };
    const aOrder = subjectOrder[a.subject] || 999;
    const bOrder = subjectOrder[b.subject] || 999;
    if (aOrder !== bOrder) return aOrder - bOrder;
    
    // 同じsubject内でIDでソート
    return a.id.localeCompare(b.id);
  });
  
  fs.writeFileSync(
    path.join(projectRoot, 'catalog.json'), 
    JSON.stringify(catalog, null, 2) + '\n', 
    'utf-8'
  );
  console.log(`\n✅ catalog.jsonを更新しました（${addedCount}個のレッスンを追加）`);
} else {
  console.log('\n✅ すべてのレッスンが既に登録されています');
}

