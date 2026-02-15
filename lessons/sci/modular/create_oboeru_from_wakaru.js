#!/usr/bin/env node
/**
 * わかる編からおぼえる編を生成するスクリプト
 * - わかる編の text, choices, answer, qnum, tags, difficulty, asof をそのまま使用
 * - source は空文字列 "" にする
 */
const fs = require('fs');
const path = require('path');

// スクリプトのディレクトリを取得
const SCRIPT_DIR = __dirname || path.dirname(require.main.filename);
const WAKARU_DIR = path.join(SCRIPT_DIR, 'wakaru');
const OBOERU_DIR = path.join(SCRIPT_DIR, 'oboeru');

console.log('WAKARU_DIR:', WAKARU_DIR);
console.log('OBOERU_DIR:', OBOERU_DIR);

// 除外するファイル
const EXCLUDE_FILES = ['loader.js', 'script.js', 'index_modular.html', 'style.css'];

function getWakaruFiles() {
  const files = fs.readdirSync(WAKARU_DIR)
    .filter(file => file.endsWith('.js') && !EXCLUDE_FILES.includes(file))
    .filter(file => !file.includes('.backup'))
    .map(file => path.join(WAKARU_DIR, file));
  return files.sort();
}

function getOboeruFilenameMapping() {
  const mapping = {};
  
  // 既存のおぼえる編ファイルを確認
  if (fs.existsSync(OBOERU_DIR)) {
    const files = fs.readdirSync(OBOERU_DIR)
      .filter(file => file.endsWith('.js') && !EXCLUDE_FILES.includes(file));
    
    for (const file of files) {
      const name = path.basename(file, '.js');
      
      // _oboeru サフィックスを削除してわかる編のファイル名を推測
      if (name.endsWith('_oboeru')) {
        const wakaruName = name.slice(0, -7); // '_oboeru' を削除
        mapping[wakaruName] = name;
      } else {
        // サフィックスがない場合は同じ名前
        mapping[name] = name;
      }
    }
  }
  
  return mapping;
}

function determineOboeruFilename(wakaruFile, mapping) {
  const wakaruName = path.basename(wakaruFile, '.js');
  
  if (mapping[wakaruName]) {
    return mapping[wakaruName] + '.js';
  } else {
    // マッピングがない場合は _oboeru サフィックスを追加
    return wakaruName + '_oboeru.js';
  }
}

function createOboeruFromWakaru(wakaruFile, oboeruFile) {
  try {
    // わかる編を読み込む
    const content = fs.readFileSync(wakaruFile, 'utf-8');
    
    // window.questions を抽出して評価
    // 安全のため、vmモジュールを使用
    const vm = require('vm');
    const context = { window: {} };
    vm.createContext(context);
    vm.runInContext(content, context);
    
    const questions = context.window.questions;
    if (!Array.isArray(questions)) {
      console.log(`[警告] ${path.basename(wakaruFile)}: questions が配列ではありません`);
      return false;
    }
    
    // おぼえる編用に変換（source を空文字列に）
    const oboeruQuestions = questions.map(q => ({
      qnum: q.qnum,
      text: q.text,
      choices: q.choices,
      answer: q.answer,
      source: '', // 空文字列
      tags: q.tags || [],
      difficulty: q.difficulty || 1,
      asof: q.asof || '2025-01-27'
    }));
    
    // おぼえる編ファイルを生成
    let oboeruContent = 'window.questions = [\n';
    for (let i = 0; i < oboeruQuestions.length; i++) {
      const q = oboeruQuestions[i];
      oboeruContent += '  {\n';
      oboeruContent += `    "qnum": ${JSON.stringify(q.qnum)},\n`;
      oboeruContent += `    "text": ${JSON.stringify(q.text)},\n`;
      oboeruContent += `    "choices": ${JSON.stringify(q.choices)},\n`;
      oboeruContent += `    "answer": ${q.answer},\n`;
      oboeruContent += `    "source": "",\n`;
      oboeruContent += `    "tags": ${JSON.stringify(q.tags)},\n`;
      oboeruContent += `    "difficulty": ${q.difficulty},\n`;
      oboeruContent += `    "asof": ${JSON.stringify(q.asof)}\n`;
      oboeruContent += '  }';
      if (i < oboeruQuestions.length - 1) {
        oboeruContent += ',';
      }
      oboeruContent += '\n';
    }
    oboeruContent += '];\n';
    
    // ファイルを書き込む
    fs.writeFileSync(oboeruFile, oboeruContent, 'utf-8');
    
    return true;
    
  } catch (error) {
    console.log(`[エラー] (${path.basename(wakaruFile)}): ${error.message}`);
    console.error(error);
    return false;
  }
}

function main() {
  console.log('わかる編からおぼえる編を生成します...\n');
  
  // わかる編の全ファイルを取得
  const wakaruFiles = getWakaruFiles();
  console.log(`わかる編ファイル数: ${wakaruFiles.length}`);
  
  // おぼえる編のファイル名マッピングを取得
  const mapping = getOboeruFilenameMapping();
  console.log(`既存のおぼえる編マッピング: ${Object.keys(mapping).length}個\n`);
  
  // おぼえる編ディレクトリが存在しない場合は作成
  if (!fs.existsSync(OBOERU_DIR)) {
    fs.mkdirSync(OBOERU_DIR, { recursive: true });
  }
  
  // 各ファイルを処理
  let created = 0;
  let updated = 0;
  let errors = 0;
  
  for (const wakaruFile of wakaruFiles) {
    const oboeruFilename = determineOboeruFilename(wakaruFile, mapping);
    const oboeruFile = path.join(OBOERU_DIR, oboeruFilename);
    
    const existed = fs.existsSync(oboeruFile);
    
    if (createOboeruFromWakaru(wakaruFile, oboeruFile)) {
      if (existed) {
        console.log(`[更新] ${oboeruFilename} (元: ${path.basename(wakaruFile)})`);
        updated++;
      } else {
        console.log(`[作成] ${oboeruFilename} (元: ${path.basename(wakaruFile)})`);
        created++;
      }
    } else {
      errors++;
    }
  }
  
  console.log(`\n完了!`);
  console.log(`  新規作成: ${created}個`);
  console.log(`  更新: ${updated}個`);
  if (errors > 0) {
    console.log(`  エラー: ${errors}個`);
  }
}

main();

