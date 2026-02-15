#!/usr/bin/env node
/**
 * わかる編に対応していないおぼえる編を非表示にする
 * 1. ファイル名を.hiddenにリネーム
 * 2. loader.jsから削除
 * 3. index_modular.htmlから削除
 * 4. app.jsから削除
 * 5. catalog.jsonから削除
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

// 非表示にするレッスンIDのリスト
const hideLessonIds = [
  'sci.chemistry.air_properties_oboeru',
  'sci.chemistry.combustion_air_oboeru',
  'sci.chemistry.solubility_temperature_oboeru',
  'sci.chemistry.water_three_states_oboeru',
  'sci.earth.constellations_seasons_oboeru',
  'sci.earth.volcano_structure_oboeru',
  'sci.physics.force_motion_oboeru',
  'sci.physics.spring_force_oboeru'
];

console.log('非表示にするレッスン:', hideLessonIds.length, '個\n');

// IDからファイル名を生成する関数
function idToFileName(id) {
  if (id === 'sci.biology.seasons_living_things_oboeru') {
    return 'seasons_living_things_spring.js';
  }
  return id.replace(/^sci\./, '').replace(/\./g, '_') + '.js';
}

// 1. ファイルをリネーム
const oboeruDir = path.join(projectRoot, 'lessons', 'sci', 'modular', 'oboeru');
let renamedCount = 0;

for (const lessonId of hideLessonIds) {
  const fileName = idToFileName(lessonId);
  const filePath = path.join(oboeruDir, fileName);
  const hiddenPath = path.join(oboeruDir, fileName + '.hidden');
  
  if (fs.existsSync(filePath)) {
    fs.renameSync(filePath, hiddenPath);
    console.log(`[リネーム] ${fileName} → ${fileName}.hidden`);
    renamedCount++;
  } else {
    console.log(`[警告] ファイルが見つかりません: ${fileName}`);
  }
}

console.log(`\n✅ ${renamedCount}個のファイルをリネームしました\n`);

// 2. loader.jsから削除
const loaderPath = path.join(projectRoot, 'lessons', 'sci', 'modular', 'oboeru', 'loader.js');
let loaderContent = fs.readFileSync(loaderPath, 'utf-8');

// mapオブジェクト内の該当エントリを削除
for (const lessonId of hideLessonIds) {
  const fileName = idToFileName(lessonId);
  // エントリを削除（行全体を削除）
  const pattern = new RegExp(`\\s+'${lessonId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}':\\s+'${fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}',?\\n`, 'g');
  loaderContent = loaderContent.replace(pattern, '');
}

fs.writeFileSync(loaderPath, loaderContent, 'utf-8');
console.log('✅ loader.jsから削除しました');

// 3. index_modular.htmlから削除
const indexPath = path.join(projectRoot, 'lessons', 'sci', 'modular', 'oboeru', 'index_modular.html');
let indexContent = fs.readFileSync(indexPath, 'utf-8');

// eraMap内の該当エントリを削除
for (const lessonId of hideLessonIds) {
  // エントリを削除（行全体を削除）
  const pattern = new RegExp(`\\s+'${lessonId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}':\\s+'[^']+',?\\n`, 'g');
  indexContent = indexContent.replace(pattern, '');
}

fs.writeFileSync(indexPath, indexContent, 'utf-8');
console.log('✅ index_modular.htmlから削除しました');

// 4. app.jsから削除
const appPath = path.join(projectRoot, 'app.js');
let appContent = fs.readFileSync(appPath, 'utf-8');

// scienceDrillUnits内の該当レッスンIDを削除
for (const lessonId of hideLessonIds) {
  // レッスンIDの行を削除（コメントも含む）
  const pattern = new RegExp(`\\s*'${lessonId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}',?\\s*(//[^\\n]*)?\\n`, 'g');
  appContent = appContent.replace(pattern, '');
}

fs.writeFileSync(appPath, appContent, 'utf-8');
console.log('✅ app.jsから削除しました');

// 5. catalog.jsonから削除
let catalogContent = fs.readFileSync(path.join(projectRoot, 'catalog.json'), 'utf-8');
if (catalogContent.charCodeAt(0) === 0xFEFF) {
  catalogContent = catalogContent.slice(1);
}
const catalog = JSON.parse(catalogContent);

const originalLength = catalog.length;
const filteredCatalog = catalog.filter(entry => !hideLessonIds.includes(entry.id));
const removedCount = originalLength - filteredCatalog.length;

if (removedCount > 0) {
  fs.writeFileSync(
    path.join(projectRoot, 'catalog.json'),
    JSON.stringify(filteredCatalog, null, 2) + '\n',
    'utf-8'
  );
  console.log(`✅ catalog.jsonから${removedCount}個のエントリを削除しました`);
} else {
  console.log('⚠️ catalog.jsonに該当するエントリが見つかりませんでした');
}

console.log('\n✅ すべての処理が完了しました');
console.log(`\n非表示にしたレッスン:`);
for (const lessonId of hideLessonIds) {
  console.log(`  - ${lessonId}`);
}

