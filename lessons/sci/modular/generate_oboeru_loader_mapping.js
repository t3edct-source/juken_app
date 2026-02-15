#!/usr/bin/env node
/**
 * おぼえる編のloader.jsのマッピングを生成するスクリプト
 * 実際に存在するファイル名から、catalog.jsonのレッスンIDとの対応を生成
 */
const fs = require('fs');
const path = require('path');

// catalog.jsonを読み込む
const catalogPath = path.join(__dirname, '../../../../catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

// 実際に存在するおぼえる編のファイル
const oboeruDir = path.join(__dirname, 'oboeru');
const actualFiles = fs.readdirSync(oboeruDir)
  .filter(file => file.endsWith('.js') && !['loader.js', 'script.js'].includes(file))
  .map(file => file.replace('.js', ''));

console.log(`実際に存在するファイル数: ${actualFiles.length}`);

// science_drillのレッスンを抽出
const oboeruLessons = catalog.filter(e => e.subject === 'science_drill');
console.log(`catalog.jsonのレッスン数: ${oboeruLessons.length}`);

// IDからファイル名への変換関数
function idToFileName(id) {
  // 特殊ケース: seasons_living_things_oboeru → seasons_living_things_spring.js
  if (id === 'sci.biology.seasons_living_things_oboeru') {
    return 'seasons_living_things_spring.js';
  }
  // 通常の変換: sci.biology.plants_growth_light_oboeru → biology_plants_growth_light_oboeru.js
  return id.replace(/^sci\./, '').replace(/\./g, '_') + '.js';
}

// ファイル名からレッスンIDを逆算する関数
function fileNameToId(fileName) {
  // seasons_living_things_spring.js → sci.biology.seasons_living_things_oboeru
  if (fileName === 'seasons_living_things_spring') {
    return 'sci.biology.seasons_living_things_oboeru';
  }
  // biology_plants_growth_light_oboeru → sci.biology.plants_growth_light_oboeru
  if (fileName.endsWith('_oboeru')) {
    const parts = fileName.replace('_oboeru', '').split('_');
    if (parts[0] === 'biology') {
      return `sci.biology.${parts.slice(1).join('_')}_oboeru`;
    } else if (parts[0] === 'physics') {
      return `sci.physics.${parts.slice(1).join('_')}_oboeru`;
    } else if (parts[0] === 'chemistry') {
      return `sci.chemistry.${parts.slice(1).join('_')}_oboeru`;
    } else if (parts[0] === 'earth') {
      return `sci.earth.${parts.slice(1).join('_')}_oboeru`;
    } else if (parts[0] === 'comprehensive') {
      return `sci.comprehensive.${parts.slice(1).join('_')}_oboeru`;
    }
  }
  return null;
}

// マッピングを生成
const mapping = {};

// catalog.jsonからマッピングを生成
oboeruLessons.forEach(lesson => {
  const fileName = idToFileName(lesson.id);
  mapping[lesson.id] = fileName;
});

// 実際に存在するファイルで、catalog.jsonにないものを追加
actualFiles.forEach(fileName => {
  const id = fileNameToId(fileName);
  if (id && !mapping[id]) {
    mapping[id] = fileName + '.js';
    console.log(`追加: ${id} → ${fileName}.js`);
  }
});

// loader.jsのマッピング部分を生成
const mapContent = Object.keys(mapping)
  .sort()
  .map(id => {
    const fileName = mapping[id];
    // カテゴリ別にコメントを追加
    let comment = '';
    if (id.startsWith('sci.biology.')) {
      if (id === 'sci.biology.seasons_living_things_oboeru') {
        comment = '    // 小4理科（生物）';
      }
    } else if (id.startsWith('sci.physics.') && !mapping[Object.keys(mapping).find(k => k.startsWith('sci.physics.') && k < id)]) {
      comment = '    // 小4理科（物理）';
    }
    return `    '${id}': '${fileName}',`;
  })
  .join('\n');

console.log(`\n生成されたマッピング数: ${Object.keys(mapping).length}`);
console.log('\nマッピングの最初の10個:');
Object.keys(mapping).slice(0, 10).forEach(id => {
  console.log(`  ${id} → ${mapping[id]}`);
});

// loader.jsを更新
const loaderPath = path.join(oboeruDir, 'loader.js');
let loaderContent = fs.readFileSync(loaderPath, 'utf-8');

// マッピング部分を置き換え
const mapStart = loaderContent.indexOf('  const map = {');
const mapEnd = loaderContent.indexOf('  };', mapStart);
const beforeMap = loaderContent.substring(0, mapStart);
const afterMap = loaderContent.substring(mapEnd);

// カテゴリ別に整理したマッピングを生成
const biologyIds = Object.keys(mapping).filter(id => id.startsWith('sci.biology.')).sort();
const physicsIds = Object.keys(mapping).filter(id => id.startsWith('sci.physics.')).sort();
const chemistryIds = Object.keys(mapping).filter(id => id.startsWith('sci.chemistry.')).sort();
const earthIds = Object.keys(mapping).filter(id => id.startsWith('sci.earth.')).sort();
const comprehensiveIds = Object.keys(mapping).filter(id => id.startsWith('sci.comprehensive.')).sort();

const newMapContent = '  const map = {\n' +
  '    // 小4理科（生物）\n' +
  biologyIds.map(id => `    '${id}': '${mapping[id]}',`).join('\n') + '\n' +
  '    \n' +
  '    // 小4理科（物理）\n' +
  physicsIds.map(id => `    '${id}': '${mapping[id]}',`).join('\n') + '\n' +
  '    \n' +
  '    // 小4理科（化学）\n' +
  chemistryIds.map(id => `    '${id}': '${mapping[id]}',`).join('\n') + '\n' +
  '    \n' +
  '    // 小4理科（地学）\n' +
  earthIds.map(id => `    '${id}': '${mapping[id]}',`).join('\n') + '\n' +
  '    \n' +
  '    // 小6理科（総合）\n' +
  comprehensiveIds.map(id => `    '${id}': '${mapping[id]}',`).join('\n') + '\n' +
  '  }';

const newLoaderContent = beforeMap + newMapContent + afterMap;

// ファイルを書き込む
fs.writeFileSync(loaderPath, newLoaderContent, 'utf-8');

console.log(`\n✅ loader.jsを更新しました (${Object.keys(mapping).length}個のマッピング)`);

