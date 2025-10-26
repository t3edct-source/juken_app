// 開発データ完全クリアスクリプト
// 後方互換性を廃止して、シンプルな実装に移行するためのデータクリア

function clearAllDevelopmentData() {
  console.log('🧹 開発データの完全クリアを開始します...');
  
  try {
    // 1. 全進捗データをクリア
    const progressKeys = Object.keys(localStorage).filter(key => key.startsWith('progress:'));
    progressKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`🗑️ 進捗データ削除: ${key}`);
    });
    
    // 2. 全学習履歴をクリア
    const historyKeys = Object.keys(localStorage).filter(key => key.startsWith('learningHistory'));
    historyKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`🗑️ 学習履歴削除: ${key}`);
    });
    
    // 3. 移行フラグをクリア
    const migrationKeys = Object.keys(localStorage).filter(key => key.includes('migration'));
    migrationKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`🗑️ 移行フラグ削除: ${key}`);
    });
    
    // 4. その他の開発関連データをクリア
    const devKeys = [
      'lessonCompleteMessage',
      'questionAnswers',
      'history_migration_completed',
      'progress_migration_completed'
    ];
    
    devKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`🗑️ 開発データ削除: ${key}`);
      }
    });
    
    console.log('✅ 開発データの完全クリア完了');
    console.log('📊 クリア結果:', {
      progressKeys: progressKeys.length,
      historyKeys: historyKeys.length,
      migrationKeys: migrationKeys.length,
      devKeys: devKeys.filter(key => localStorage.getItem(key)).length
    });
    
  } catch (error) {
    console.error('❌ データクリアエラー:', error);
  }
}

// 実行
clearAllDevelopmentData();

