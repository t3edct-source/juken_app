// mode判定デバッグスクリプト
function debugModeDetection() {
  console.log('🔍 mode判定デバッグ開始');
  
  // 現在のURL情報
  console.log('📍 現在のURL:', window.location.href);
  
  // URLパラメータの詳細
  const urlParams = new URLSearchParams(window.location.search);
  console.log('📋 URLパラメータ一覧:', Array.from(urlParams.entries()));
  
  // modeパラメータの詳細
  const mode = urlParams.get('mode');
  console.log('🎯 modeパラメータ:', mode);
  console.log('🎯 modeの型:', typeof mode);
  console.log('🎯 modeがnullか:', mode === null);
  console.log('🎯 modeがundefinedか:', mode === undefined);
  console.log('🎯 modeが空文字か:', mode === '');
  
  // eraパラメータの詳細
  const era = urlParams.get('era');
  console.log('📚 eraパラメータ:', era);
  
  // 履歴キーの生成テスト
  const historyKey = `learningHistory_${mode}`;
  console.log('🗂️ 生成される履歴キー:', historyKey);
  
  // 現在の履歴データを確認
  console.log('📊 覚える編履歴:', localStorage.getItem('learningHistory_oboeru'));
  console.log('📊 わかる編履歴:', localStorage.getItem('learningHistory_wakaru'));
  
  // 元の履歴データを確認
  console.log('📊 元の履歴データ:', localStorage.getItem('learningHistory'));
  
  console.log('✅ mode判定デバッグ完了');
}

// 実行
debugModeDetection();
