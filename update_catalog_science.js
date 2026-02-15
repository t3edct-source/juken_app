#!/usr/bin/env node
/**
 * catalog.jsonを更新して、すべてのわかる編とおぼえる編のレッスンを登録する
 */
const fs = require('fs');
const path = require('path');

// ファイル名からレッスンIDを生成する関数
function filenameToLessonId(filename, isOboeru = false) {
  // .jsを削除
  let name = filename.replace('.js', '');
  
  // おぼえる編の場合、_oboeruを削除
  if (isOboeru && name.endsWith('_oboeru')) {
    name = name.slice(0, -7);
  }
  
  // 特別なケース: seasons_living_things_spring
  if (name === 'seasons_living_things_spring') {
    return isOboeru 
      ? 'sci.biology.seasons_living_things_oboeru'
      : 'sci.biology.seasons_living_things';
  }
  
  // アンダースコアをドットに変換し、sci.を先頭に追加
  // biology_plants_growth_light → sci.biology.plants_growth_light
  const parts = name.split('_');
  let category = '';
  let topic = '';
  
  // 最初の部分がカテゴリ（biology, chemistry, physics, earth, comprehensive）
  if (parts[0] === 'biology') {
    category = 'biology';
    topic = parts.slice(1).join('_');
  } else if (parts[0] === 'chemistry') {
    category = 'chemistry';
    topic = parts.slice(1).join('_');
  } else if (parts[0] === 'physics') {
    category = 'physics';
    topic = parts.slice(1).join('_');
  } else if (parts[0] === 'earth') {
    category = 'earth';
    topic = parts.slice(1).join('_');
  } else if (parts[0] === 'comprehensive') {
    category = 'comprehensive';
    topic = parts.slice(1).join('_');
  } else {
    // その他の場合はそのまま
    category = parts[0];
    topic = parts.slice(1).join('_');
  }
  
  const lessonId = topic 
    ? `sci.${category}.${topic}`
    : `sci.${category}`;
  
  // おぼえる編の場合は_oboeruを追加
  return isOboeru ? lessonId + '_oboeru' : lessonId;
}

// ファイル名からタイトルを生成する関数（簡易版）
function filenameToTitle(filename, isOboeru = false) {
  let name = filename.replace('.js', '');
  
  if (isOboeru && name.endsWith('_oboeru')) {
    name = name.slice(0, -7);
  }
  
  // 既存のcatalog.jsonからタイトルを取得する関数
  // ここでは簡易的にファイル名から推測
  const parts = name.split('_');
  const categoryMap = {
    'biology': '生物',
    'chemistry': '化学',
    'physics': '物理',
    'earth': '地学',
    'comprehensive': '総合'
  };
  
  // 既存のcatalog.jsonから対応するタイトルを探す
  return null; // 後で既存のタイトルを使用
}

// catalog.jsonを読み込む
const catalog = JSON.parse(fs.readFileSync('catalog.json', 'utf-8'));

// プロジェクトルートを取得（このファイルがルートにあることを前提）
const projectRoot = __dirname;
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

// わかる編のレッスンIDを生成
const wakaruLessonIds = new Map();
for (const file of wakaruFiles) {
  const lessonId = filenameToLessonId(file, false);
  wakaruLessonIds.set(lessonId, file);
}

// おぼえる編のレッスンIDを生成
const oboeruLessonIds = new Map();
for (const file of oboeruFiles) {
  // seasons_living_things_spring.js の特別処理
  if (file === 'seasons_living_things_spring.js') {
    oboeruLessonIds.set('sci.biology.seasons_living_things_oboeru', file);
  } else {
    const lessonId = filenameToLessonId(file, true);
    oboeruLessonIds.set(lessonId, file);
  }
}

// 不足しているレッスンを特定
const missingWakaru = [];
for (const [lessonId, file] of wakaruLessonIds) {
  if (!existingSciIds.has(lessonId)) {
    missingWakaru.push({ lessonId, file });
  }
}

const missingOboeru = [];
for (const [lessonId, file] of oboeruLessonIds) {
  if (!existingDrillIds.has(lessonId)) {
    missingOboeru.push({ lessonId, file });
  }
}

console.log(`不足しているわかる編: ${missingWakaru.length}個`);
console.log(`不足しているおぼえる編: ${missingOboeru.length}個\n`);

// 既存のレッスンからタイトルを取得する関数
function getTitleFromExisting(lessonId, isOboeru = false) {
  // わかる編のタイトルを取得
  const wakaruId = isOboeru ? lessonId.replace('_oboeru', '') : lessonId;
  const wakaruLesson = catalog.find(e => e.id === wakaruId && e.subject === 'sci');
  
  if (wakaruLesson) {
    return isOboeru ? wakaruLesson.title + '〈覚える編〉' : wakaruLesson.title;
  }
  
  // タイトルが見つからない場合はファイル名から推測
  const parts = lessonId.split('.');
  const category = parts[1];
  const topic = parts.slice(2).join('_');
  
  const categoryMap = {
    'biology': '生物',
    'chemistry': '化学',
    'physics': '物理',
    'earth': '地学',
    'comprehensive': '総合'
  };
  
  // 簡易的なタイトル生成（実際には既存のタイトルを使用する方が良い）
  return topic || category;
}

// 不足しているレッスンを追加
let addedCount = 0;

// わかる編を追加
for (const { lessonId, file } of missingWakaru) {
  // 既存のレッスンから情報を取得
  const existingLesson = catalog.find(e => 
    e.subject === 'sci' && 
    e.id.includes(lessonId.split('.').slice(-1)[0])
  );
  
  const newLesson = {
    id: lessonId,
    grade: existingLesson?.grade || 4,
    subject: 'sci',
    title: existingLesson?.title || getTitleFromExisting(lessonId, false),
    duration_min: existingLesson?.duration_min || 15,
    sku_required: existingLesson?.sku_required || null,
    path: `lessons/sci/modular/wakaru/index_modular.html?era=${lessonId}&mode=wakaru`,
    format: 'html',
    tags: existingLesson?.tags || []
  };
  
  catalog.push(newLesson);
  addedCount++;
  console.log(`[追加] わかる編: ${lessonId} - ${newLesson.title}`);
}

// おぼえる編を追加
for (const { lessonId, file } of missingOboeru) {
  // 対応するわかる編のIDを取得
  const wakaruId = lessonId.replace('_oboeru', '');
  const wakaruLesson = catalog.find(e => e.id === wakaruId && e.subject === 'sci');
  
  const newLesson = {
    id: lessonId,
    grade: wakaruLesson?.grade || 4,
    subject: 'science_drill',
    title: wakaruLesson?.title ? wakaruLesson.title + '〈覚える編〉' : getTitleFromExisting(lessonId, true),
    duration_min: wakaruLesson?.duration_min || 15,
    sku_required: wakaruLesson?.sku_required || null,
    path: `lessons/sci/modular/oboeru/index_modular.html?era=${lessonId}&mode=oboeru`,
    format: 'html',
    tags: wakaruLesson?.tags || []
  };
  
  catalog.push(newLesson);
  addedCount++;
  console.log(`[追加] おぼえる編: ${lessonId} - ${newLesson.title}`);
}

// catalog.jsonを保存
if (addedCount > 0) {
  // IDでソート（sci.で始まるものをまとめる）
  catalog.sort((a, b) => {
    if (a.subject === 'sci' && b.subject === 'sci') {
      return a.id.localeCompare(b.id);
    }
    if (a.subject === 'science_drill' && b.subject === 'science_drill') {
      return a.id.localeCompare(b.id);
    }
    if (a.subject === 'sci') return -1;
    if (b.subject === 'sci') return 1;
    if (a.subject === 'science_drill') return -1;
    if (b.subject === 'science_drill') return 1;
    return a.id.localeCompare(b.id);
  });
  
  fs.writeFileSync('catalog.json', JSON.stringify(catalog, null, 2) + '\n', 'utf-8');
  console.log(`\n✅ catalog.jsonを更新しました（${addedCount}個のレッスンを追加）`);
} else {
  console.log('\n✅ すべてのレッスンが既に登録されています');
}

