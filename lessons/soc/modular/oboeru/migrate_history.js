// 履歴データ移行スクリプト
// 覚える編の履歴を保護しながら、わかる編用の履歴を作成

function migrateLearningHistory() {
  console.log('🔄 履歴データ移行開始');
  
  try {
    // 既存の履歴を読み込み
    const existingData = localStorage.getItem('learningHistory');
    if (!existingData) {
      console.log('📝 既存の履歴データなし - 新規作成');
      return;
    }
    
    const history = JSON.parse(existingData);
    console.log('📊 既存履歴データ:', {
      totalSessions: history.sessions?.length || 0,
      stats: history.stats
    });
    
    // 覚える編とわかる編のセッションを分離
    const oboeruSessions = [];
    const wakaruSessions = [];
    
    if (history.sessions) {
      history.sessions.forEach(session => {
        if (session.mode === 'oboeru') {
          oboeruSessions.push(session);
        } else if (session.mode === 'wakaru') {
          wakaruSessions.push(session);
        } else {
          // modeが未設定の場合は覚える編として扱う（既存データ保護）
          console.log('⚠️ mode未設定のセッションを覚える編として分類:', session);
          oboeruSessions.push({...session, mode: 'oboeru'});
        }
      });
    }
    
    // 覚える編の履歴を作成・保存
    const oboeruHistory = {
      sessions: oboeruSessions,
      stats: calculateStats(oboeruSessions)
    };
    localStorage.setItem('learningHistory_oboeru', JSON.stringify(oboeruHistory));
    console.log('✅ 覚える編履歴保存完了:', {
      sessions: oboeruSessions.length,
      stats: oboeruHistory.stats
    });
    
    // わかる編の履歴を作成・保存
    const wakaruHistory = {
      sessions: wakaruSessions,
      stats: calculateStats(wakaruSessions)
    };
    localStorage.setItem('learningHistory_wakaru', JSON.stringify(wakaruHistory));
    console.log('✅ わかる編履歴保存完了:', {
      sessions: wakaruSessions.length,
      stats: wakaruHistory.stats
    });
    
    // 元のデータをバックアップ
    localStorage.setItem('learningHistory_backup', existingData);
    console.log('💾 元データをバックアップ保存');
    
    console.log('🎉 履歴データ移行完了');
    
  } catch (error) {
    console.error('❌ 履歴データ移行エラー:', error);
  }
}

// 統計計算関数
function calculateStats(sessions) {
  const stats = {
    totalSessions: sessions.length,
    totalQuestions: 0,
    correctAnswers: 0,
    averageScore: 0,
    bestScore: 0
  };

  sessions.forEach(session => {
    stats.totalQuestions += session.totalQuestions || 0;
    stats.correctAnswers += session.score || 0;
    stats.bestScore = Math.max(stats.bestScore, session.score || 0);
  });

  if (stats.totalSessions > 0 && stats.totalQuestions > 0) {
    stats.averageScore = (stats.correctAnswers / stats.totalQuestions * 100).toFixed(1);
  }

  return stats;
}

// 移行実行
migrateLearningHistory();
