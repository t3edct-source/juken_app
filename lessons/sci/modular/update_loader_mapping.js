#!/usr/bin/env node
/**
 * loader.jsのマッピングを更新するスクリプト
 * catalog.jsonからすべてのscience_drillレッスンIDを取得し、loader.jsのマッピングを生成
 */
const fs = require('fs');
const path = require('path');

// catalog.jsonを読み込む
const catalogPath = path.join(__dirname, '../../../../catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

// science_drillのレッスンを抽出
const oboeruLessons = catalog.filter(e => e.subject === 'science_drill');

console.log(`おぼえる編レッスン数: ${oboeruLessons.length}`);

// IDからファイル名への変換関数
function idToFileName(id) {
  // 特殊ケース: seasons_living_things_oboeru → seasons_living_things_spring.js
  if (id === 'sci.biology.seasons_living_things_oboeru') {
    return 'seasons_living_things_spring.js';
  }
  // 通常の変換: sci.biology.plants_growth_light_oboeru → biology_plants_growth_light_oboeru.js
  return id.replace(/^sci\./, '').replace(/\./g, '_') + '.js';
}

// マッピングを生成
const mapping = {};
oboeruLessons.forEach(lesson => {
  mapping[lesson.id] = idToFileName(lesson.id);
});

// loader.jsを読み込む
const loaderPath = path.join(__dirname, 'oboeru', 'loader.js');
let loaderContent = fs.readFileSync(loaderPath, 'utf-8');

// マッピング部分を置き換え
const mapStart = loaderContent.indexOf('  const map = {');
const mapEnd = loaderContent.indexOf('  };', mapStart);
const beforeMap = loaderContent.substring(0, mapStart);
const afterMap = loaderContent.substring(mapEnd);

// マッピングを生成（カテゴリ別に整理）
const mapContent = '  const map = {\n' +
  '    // 小4理科（生物）\n' +
  oboeruLessons
    .filter(l => l.id.startsWith('sci.biology.'))
    .map(l => `    '${l.id}': '${idToFileName(l.id)}',`)
    .join('\n') + '\n' +
  '    \n' +
  '    // 小4理科（物理）\n' +
  oboeruLessons
    .filter(l => l.id.startsWith('sci.physics.'))
    .map(l => `    '${l.id}': '${idToFileName(l.id)}',`)
    .join('\n') + '\n' +
  '    \n' +
  '    // 小4理科（化学）\n' +
  oboeruLessons
    .filter(l => l.id.startsWith('sci.chemistry.'))
    .map(l => `    '${l.id}': '${idToFileName(l.id)}',`)
    .join('\n') + '\n' +
  '    \n' +
  '    // 小4理科（地学）\n' +
  oboeruLessons
    .filter(l => l.id.startsWith('sci.earth.'))
    .map(l => `    '${l.id}': '${idToFileName(l.id)}',`)
    .join('\n') + '\n' +
  '    \n' +
  '    // 小6理科（総合）\n' +
  oboeruLessons
    .filter(l => l.id.startsWith('sci.comprehensive.'))
    .map(l => `    '${l.id}': '${idToFileName(l.id)}',`)
    .join('\n') + '\n' +
  '  }';

const newLoaderContent = beforeMap + mapContent + afterMap;

// ファイルを書き込む
fs.writeFileSync(loaderPath, newLoaderContent, 'utf-8');

console.log(`✅ loader.jsを更新しました (${Object.keys(mapping).length}個のマッピング)`);

