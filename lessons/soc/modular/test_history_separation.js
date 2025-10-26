// 履歴分離テストスクリプト
// わかる編と覚える編の履歴が正しく分離されているかテスト

function testHistorySeparation() {
  console.log('🧪 履歴分離テスト開始');
  
  try {
    // 1. 覚える編の履歴を確認
    const oboeruData = localStorage.getItem('learningHistory_oboeru');
    const oboeruHistory = oboeruData ? JSON.parse(oboeruData) : null;
    
    console.log('📊 覚える編履歴:', {
      exists: !!oboeruHistory,
      sessions: oboeruHistory?.sessions?.length || 0,
      stats: oboeruHistory?.stats
    });
    
    // 2. わかる編の履歴を確認
    const wakaruData = localStorage.getItem('learningHistory_wakaru');
    const wakaruHistory = wakaruData ? JSON.parse(wakaruData) : null;
    
    console.log('📊 わかる編履歴:', {
      exists: !!wakaruHistory,
      sessions: wakaruHistory?.sessions?.length || 0,
      stats: wakaruHistory?.stats
    });
    
    // 3. バックアップデータの確認
    const backupData = localStorage.getItem('learningHistory_backup');
    const backupHistory = backupData ? JSON.parse(backupData) : null;
    
    console.log('💾 バックアップデータ:', {
      exists: !!backupHistory,
      sessions: backupHistory?.sessions?.length || 0
    });
    
    // 4. 元のデータが残っているかチェック
    const originalData = localStorage.getItem('learningHistory');
    console.log('🔍 元データの状態:', {
      exists: !!originalData,
      shouldBeEmpty: !originalData || originalData === 'null'
    });
    
    // 5. 分離の整合性チェック
    if (oboeruHistory && wakaruHistory && backupHistory) {
      const totalOriginalSessions = backupHistory.sessions?.length || 0;
      const totalOboeruSessions = oboeruHistory.sessions?.length || 0;
      const totalWakaruSessions = wakaruHistory.sessions?.length || 0;
      
      console.log('✅ 分離整合性チェック:', {
        original: totalOriginalSessions,
        oboeru: totalOboeruSessions,
        wakaru: totalWakaruSessions,
        total: totalOboeruSessions + totalWakaruSessions,
        isConsistent: (totalOboeruSessions + totalWakaruSessions) === totalOriginalSessions
      });
      
      // 6. mode別の分離確認
      if (oboeruHistory.sessions) {
        const oboeruModes = oboeruHistory.sessions.map(s => s.mode).filter(Boolean);
        const uniqueOboeruModes = [...new Set(oboeruModes)];
        console.log('🔍 覚える編のmode分布:', uniqueOboeruModes);
      }
      
      if (wakaruHistory.sessions) {
        const wakaruModes = wakaruHistory.sessions.map(s => s.mode).filter(Boolean);
        const uniqueWakaruModes = [...new Set(wakaruModes)];
        console.log('🔍 わかる編のmode分布:', uniqueWakaruModes);
      }
    }
    
    console.log('🎉 履歴分離テスト完了');
    
  } catch (error) {
    console.error('❌ 履歴分離テストエラー:', error);
  }
}

// テスト実行
testHistorySeparation();
