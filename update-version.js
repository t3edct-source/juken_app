#!/usr/bin/env node
/**
 * デプロイ時にindex.htmlのバージョンクエリパラメータを自動更新するスクリプト
 */

const fs = require('fs');
const path = require('path');

// バージョンを生成（タイムスタンプ + Gitコミットハッシュの短縮版）
function generateVersion() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD形式
  
  // Gitコミットハッシュを取得（可能な場合）
  let gitHash = '000';
  try {
    const { execSync } = require('child_process');
    const hash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8', stdio: 'pipe' }).trim();
    gitHash = hash.substring(0, 3);
  } catch (e) {
    // Gitが利用できない場合はタイムスタンプの分部分を使用
    gitHash = String(now.getMinutes()).padStart(2, '0') + String(now.getSeconds()).padStart(2, '0').substring(0, 1);
  }
  
  return `${dateStr}-${gitHash}`;
}

// index.htmlを更新
function updateIndexHtml() {
  const indexPath = path.join(__dirname, 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    console.error('❌ index.htmlが見つかりません');
    process.exit(1);
  }
  
  let content = fs.readFileSync(indexPath, 'utf-8');
  const newVersion = generateVersion();
  
  // app.jsのバージョンクエリパラメータを更新
  const oldPattern = /app\.js\?v=[\w-]+/g;
  const newScript = `app.js?v=${newVersion}`;
  
  if (oldPattern.test(content)) {
    content = content.replace(oldPattern, newScript);
    fs.writeFileSync(indexPath, content, 'utf-8');
    console.log(`✅ バージョンを更新しました: ${newVersion}`);
    console.log(`   ${newScript}`);
    return newVersion;
  } else {
    console.warn('⚠️ app.jsのバージョンクエリパラメータが見つかりませんでした');
    return null;
  }
}

// メイン処理
const version = updateIndexHtml();
if (version) {
  console.log(`\n📦 デプロイ準備完了: バージョン ${version}`);
} else {
  console.log('\n⚠️ バージョン更新に失敗しました');
  process.exit(1);
}

