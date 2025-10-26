// 履歴データクリーンアップスクリプト
// 誤ったIDで生成されたログを整理し、正しい履歴データを作成

function cleanupHistoryData() {
  console.log('🧹 履歴データクリーンアップを開始します...');
  
  try {
    // 1. 現在の履歴データを取得
    const oboeruData = localStorage.getItem('learningHistory_oboeru');
    const wakaruData = localStorage.getItem('learningHistory_wakaru');
    const originalData = localStorage.getItem('learningHistory');
    
    console.log('📊 現在のデータ状況:', {
      oboeru: oboeruData ? JSON.parse(oboeruData).sessions?.length : 0,
      wakaru: wakaruData ? JSON.parse(wakaruData).sessions?.length : 0,
      original: originalData ? JSON.parse(originalData).sessions?.length : 0
    });
    
    // 2. 元のデータから正しい履歴を再構築
    if (originalData) {
      const originalHistory = JSON.parse(originalData);
      
      // 覚える編とわかる編のセッションを正しく分離
      const oboeruSessions = [];
      const wakaruSessions = [];
      
      if (originalHistory.sessions) {
        originalHistory.sessions.forEach(session => {
          // modeが明確に設定されている場合はそのまま使用
          if (session.mode === 'oboeru') {
            oboeruSessions.push(session);
          } else if (session.mode === 'wakaru') {
            wakaruSessions.push(session);
          } else {
            // modeが未設定の場合は、レッスンIDから判定
            const lessonId = session.lessonId || '';
            if (lessonId.includes('_understand') || lessonId.includes('wakaru')) {
              wakaruSessions.push({...session, mode: 'wakaru'});
            } else {
              oboeruSessions.push({...session, mode: 'oboeru'});
            }
          }
        });
      }
      
      console.log('🔄 セッション分離結果:', {
        oboeru: oboeruSessions.length,
        wakaru: wakaruSessions.length
      });
      
      // 3. 重複データの除去
      const cleanOboeruSessions = removeDuplicateSessions(oboeruSessions);
      const cleanWakaruSessions = removeDuplicateSessions(wakaruSessions);
      
      console.log('🧹 重複除去後:', {
        oboeru: cleanOboeruSessions.length,
        wakaru: cleanWakaruSessions.length
      });
      
      // 4. 正しい履歴データを作成
      const cleanOboeruHistory = {
        sessions: cleanOboeruSessions,
        stats: calculateCleanStats(cleanOboeruSessions)
      };
      
      const cleanWakaruHistory = {
        sessions: cleanWakaruSessions,
        stats: calculateCleanStats(cleanWakaruSessions)
      };
      
      // 5. 古いデータをバックアップ
      localStorage.setItem('learningHistory_old_backup', originalData);
      if (oboeruData) localStorage.setItem('learningHistory_oboeru_old_backup', oboeruData);
      if (wakaruData) localStorage.setItem('learningHistory_wakaru_old_backup', wakaruData);
      
      // 6. クリーンなデータを保存
      localStorage.setItem('learningHistory_oboeru', JSON.stringify(cleanOboeruHistory));
      localStorage.setItem('learningHistory_wakaru', JSON.stringify(cleanWakaruHistory));
      
      // 7. 移行フラグをリセット（再移行を可能にする）
      localStorage.removeItem('history_migration_completed');
      
      console.log('✅ 履歴データクリーンアップ完了');
      console.log('📊 最終結果:', {
        oboeru: cleanOboeruSessions.length,
        wakaru: cleanWakaruSessions.length,
        oboeruStats: cleanOboeruHistory.stats,
        wakaruStats: cleanWakaruHistory.stats
      });
      
    } else {
      console.log('📝 元の履歴データがありません - 新規作成');
      
      // 空の履歴を作成
      const emptyHistory = {
        sessions: [],
        stats: {
          totalSessions: 0,
          totalQuestions: 0,
          correctAnswers: 0,
          averageScore: 0,
          bestScore: 0
        }
      };
      
      localStorage.setItem('learningHistory_oboeru', JSON.stringify(emptyHistory));
      localStorage.setItem('learningHistory_wakaru', JSON.stringify(emptyHistory));
    }
    
  } catch (error) {
    console.error('❌ 履歴データクリーンアップエラー:', error);
  }
}

// 重複セッションを除去する関数
function removeDuplicateSessions(sessions) {
  const seen = new Set();
  const uniqueSessions = [];
  
  sessions.forEach(session => {
    // セッションの一意性を判定（開始時間 + レッスンID）
    const key = `${session.startTime}_${session.lessonId || 'unknown'}`;
    
    if (!seen.has(key)) {
      seen.add(key);
      uniqueSessions.push(session);
    } else {
      console.log('🔄 重複セッションを除去:', session);
    }
  });
  
  return uniqueSessions;
}

// クリーンな統計を計算する関数
function calculateCleanStats(sessions) {
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

// 実行
cleanupHistoryData();
