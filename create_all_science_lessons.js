const fs = require('fs');
const path = require('path');

// catalog.jsonを読み込む
const catalog = JSON.parse(fs.readFileSync('catalog.json', 'utf8'));

// 理科レッスンを抽出
const sciLessons = catalog.filter(e => e.subject === 'sci');
const oboeruLessons = catalog.filter(e => e.subject === 'science_drill');

console.log(`📚 理科レッスン: ${sciLessons.length}個 (わかる編)`);
console.log(`📝 覚える編レッスン: ${oboeruLessons.length}個`);

// テンプレート（oboeru用 - 空の配列）
const oboeruTemplate = `window.questions = [
  // 問題データをここに追加してください
];`;

// テンプレート（wakaru用 - 空の配列）
const wakaruTemplate = `window.questions = [
  // 問題データをここに追加してください
];`;

// ディレクトリを作成
const oboeruDir = 'lessons/sci/modular/oboeru';
const wakaruDir = 'lessons/sci/modular/wakaru';

if (!fs.existsSync(oboeruDir)) {
  fs.mkdirSync(oboeruDir, { recursive: true });
}
if (!fs.existsSync(wakaruDir)) {
  fs.mkdirSync(wakaruDir, { recursive: true });
}

// IDからファイル名を生成する関数
function idToFileName(lessonId) {
  // sci.biology.seasons_living_things -> seasons_living_things
  // sci.biology.seasons_living_things_oboeru -> seasons_living_things_oboeru
  return lessonId.replace(/^sci\./, '').replace(/\./g, '_');
}

// 覚える編の.jsファイルを作成
let oboeruCreated = 0;
let oboeruSkipped = 0;
for (const lesson of oboeruLessons) {
  const fileName = `${idToFileName(lesson.id)}.js`;
  const filePath = path.join(oboeruDir, fileName);
  
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, oboeruTemplate, 'utf8');
    oboeruCreated++;
  } else {
    oboeruSkipped++;
  }
}

// わかる編の.jsファイルを作成
let wakaruCreated = 0;
let wakaruSkipped = 0;
for (const lesson of sciLessons) {
  const fileName = `${idToFileName(lesson.id)}.js`;
  const filePath = path.join(wakaruDir, fileName);
  
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, wakaruTemplate, 'utf8');
    wakaruCreated++;
  } else {
    wakaruSkipped++;
  }
}

console.log(`\n✅ 覚える編: ${oboeruCreated}個作成, ${oboeruSkipped}個スキップ`);
console.log(`✅ わかる編: ${wakaruCreated}個作成, ${wakaruSkipped}個スキップ`);

// loader.jsとindex_modular.htmlを更新するためのデータを生成
const loaderMap = {};
const eraMap = {};

// 覚える編
for (const lesson of oboeruLessons) {
  const fileName = idToFileName(lesson.id);
  loaderMap[lesson.id] = fileName + '.js';
  eraMap[lesson.id] = lesson.title;
}

// わかる編
for (const lesson of sciLessons) {
  const fileName = idToFileName(lesson.id);
  loaderMap[lesson.id] = fileName + '.js';
  eraMap[lesson.id] = lesson.title;
}

console.log(`\n✅ マップ生成完了: loaderMap=${Object.keys(loaderMap).length}個, eraMap=${Object.keys(eraMap).length}個`);

// loader.jsを更新
const oboeruLoaderPath = path.join(oboeruDir, 'loader.js');
let oboeruLoaderContent = fs.readFileSync(oboeruLoaderPath, 'utf8');
const oboeruLoaderMapEntries = oboeruLessons.map(lesson => {
  const fileName = idToFileName(lesson.id);
  return `    '${lesson.id}': '${fileName}.js',`;
}).join('\n');

// loader.jsのmapを更新（既存のmapの後に追加）
if (oboeruLoaderContent.includes("// 小4理科")) {
  // 既存のmapの後に追加
  const mapEndIndex = oboeruLoaderContent.indexOf('  };');
  if (mapEndIndex > 0) {
    const beforeMap = oboeruLoaderContent.substring(0, mapEndIndex);
    const afterMap = oboeruLoaderContent.substring(mapEndIndex);
    oboeruLoaderContent = beforeMap + '\n' + oboeruLoaderMapEntries + '\n' + afterMap;
  }
}

fs.writeFileSync(oboeruLoaderPath, oboeruLoaderContent, 'utf8');
console.log('✅ oboeru/loader.jsを更新しました');

// wakaru/loader.jsを更新
const wakaruLoaderPath = path.join(wakaruDir, 'loader.js');
let wakaruLoaderContent = fs.readFileSync(wakaruLoaderPath, 'utf8');
const wakaruLoaderMapEntries = sciLessons.map(lesson => {
  const fileName = idToFileName(lesson.id);
  return `    '${lesson.id}': '${fileName}.js',`;
}).join('\n');

if (wakaruLoaderContent.includes("// 小4理科")) {
  const mapEndIndex = wakaruLoaderContent.indexOf('  };');
  if (mapEndIndex > 0) {
    const beforeMap = wakaruLoaderContent.substring(0, mapEndIndex);
    const afterMap = wakaruLoaderContent.substring(mapEndIndex);
    wakaruLoaderContent = beforeMap + '\n' + wakaruLoaderMapEntries + '\n' + afterMap;
  }
}

fs.writeFileSync(wakaruLoaderPath, wakaruLoaderContent, 'utf8');
console.log('✅ wakaru/loader.jsを更新しました');

// index_modular.htmlを更新
const oboeruIndexPath = path.join(oboeruDir, 'index_modular.html');
let oboeruIndexContent = fs.readFileSync(oboeruIndexPath, 'utf8');
const oboeruEraMapEntries = oboeruLessons.map(lesson => {
  return `      '${lesson.id}': '${lesson.title}',`;
}).join('\n');

if (oboeruIndexContent.includes("const eraMap = {")) {
  const eraMapEndIndex = oboeruIndexContent.indexOf('    };');
  if (eraMapEndIndex > 0) {
    const beforeEraMap = oboeruIndexContent.substring(0, eraMapEndIndex);
    const afterEraMap = oboeruIndexContent.substring(eraMapEndIndex);
    oboeruIndexContent = beforeEraMap + '\n' + oboeruEraMapEntries + '\n' + afterEraMap;
  }
}

fs.writeFileSync(oboeruIndexPath, oboeruIndexContent, 'utf8');
console.log('✅ oboeru/index_modular.htmlを更新しました');

// wakaru/index_modular.htmlを更新
const wakaruIndexPath = path.join(wakaruDir, 'index_modular.html');
let wakaruIndexContent = fs.readFileSync(wakaruIndexPath, 'utf8');
const wakaruEraMapEntries = sciLessons.map(lesson => {
  return `      '${lesson.id}': '${lesson.title}',`;
}).join('\n');

if (wakaruIndexContent.includes("const eraMap = {")) {
  const eraMapEndIndex = wakaruIndexContent.indexOf('    };');
  if (eraMapEndIndex > 0) {
    const beforeEraMap = wakaruIndexContent.substring(0, eraMapEndIndex);
    const afterEraMap = wakaruIndexContent.substring(eraMapEndIndex);
    wakaruIndexContent = beforeEraMap + '\n' + wakaruEraMapEntries + '\n' + afterEraMap;
  }
}

fs.writeFileSync(wakaruIndexPath, wakaruIndexContent, 'utf8');
console.log('✅ wakaru/index_modular.htmlを更新しました');

// catalog.jsonのpathを更新
let catalogUpdated = 0;
for (let i = 0; i < catalog.length; i++) {
  const entry = catalog[i];
  if (entry.subject === 'sci' || entry.subject === 'science_drill') {
    const oldPath = entry.path;
    // 既にmodularパスになっているものはスキップ
    if (!oldPath.includes('modular')) {
      if (entry.subject === 'sci') {
        entry.path = `lessons/sci/modular/wakaru/index_modular.html?era=${entry.id}&mode=wakaru`;
      } else if (entry.subject === 'science_drill') {
        entry.path = `lessons/sci/modular/oboeru/index_modular.html?era=${entry.id}&mode=oboeru`;
      }
      catalogUpdated++;
    }
  }
}

fs.writeFileSync('catalog.json', JSON.stringify(catalog, null, 2) + '\n', 'utf8');
console.log(`✅ catalog.jsonのpathを${catalogUpdated}個更新しました`);

console.log('\n🎉 全レッスンの基本構造作成完了！');

