// earth_earthquake_structure.jsを読み込んでテスト
const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'wakaru', 'earth_earthquake_structure.js');
const content = fs.readFileSync(filepath, 'utf-8');

// windowオブジェクトをモック
const window = {};

// JavaScriptとして評価
eval(content);

if (window.questions) {
    console.log(`[OK] window.questionsが読み込まれました: ${window.questions.length}問`);
    
    // 最初の3問を確認
    for (let i = 0; i < Math.min(3, window.questions.length); i++) {
        const q = window.questions[i];
        console.log(`  Q${q.qnum}: ${q.text.substring(0, 50)}...`);
    }
} else {
    console.log('[ERROR] window.questionsが定義されていません');
}

