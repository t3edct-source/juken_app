// 戻るボタンの機能
function goBack() {
  // iframe内で実行されているかチェック
  if (window.parent !== window) {
    // iframe内の場合、親フレームに戻るメッセージを送信
    try {
      window.parent.postMessage({ type: 'lesson:goBack' }, '*');
      return;
    } catch (e) {
      console.log('postMessage failed, falling back to direct navigation');
    }
  }
  
  // メインページがある場合は戻る、ない場合は前のページに戻る
  if (window.opener && !window.opener.closed) {
    window.close();
  } else if (document.referrer) {
    // 前のページが社会のホームページの場合は、そこに戻る
    if (document.referrer.includes('home_modular.html')) {
      window.history.back();
    } else {
      // それ以外の場合はメインページに移動
      window.location.href = '../../../index.html';
    }
  } else {
    // メインページに移動
    window.location.href = '../../../index.html';
  }
}

const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get("mode") || "wakaru"; // デフォルトはわかる編
const eraKey = urlParams.get("era") || "kodai"; // 単元キー（OK判定に使用）

document.getElementById("modeLabel").textContent = 
  mode === "oboeru" ? "覚える編（タイマー付き）" : "わかる編（年代順）";

let current = 0;
let timer = null;
let timeLeft = 20;
let shuffledQuestions = []; // 出題用（わかる編=そのまま, 覚える編=ランダム）

const questionEl = document.getElementById("question");
const sourceEl = document.getElementById("source");
const choicesEl = document.getElementById("choices");
const explanationEl = document.getElementById("explanation");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

// 進捗表示用
function createProgressDisplay() {
  const progressDisplay = document.createElement("div");
  progressDisplay.id = "progress";
  progressDisplay.style.position = "absolute";
  progressDisplay.style.top = "10px";
  progressDisplay.style.right = "15px";
  progressDisplay.style.fontSize = "0.75em";
  progressDisplay.style.fontWeight = "500";
  progressDisplay.style.color = "#666";
  progressDisplay.style.background = "transparent";
  progressDisplay.style.border = "none";
  progressDisplay.style.boxShadow = "none";
  
  // 親要素に相対位置を設定
  const questionBox = document.querySelector(".question-box");
  questionBox.style.position = "relative";
  questionBox.appendChild(progressDisplay);
  return progressDisplay;
}

// タイマー表示用
const timerDisplay = document.createElement("div");
timerDisplay.id = "timer";
timerDisplay.style.fontSize = "1em";
timerDisplay.style.fontWeight = "bold";
timerDisplay.style.color = "#d00";
timerDisplay.style.margin = "0.5em 0";
document.querySelector(".question-box").insertBefore(timerDisplay, sourceEl);

// 戻るボタンを初期化時に追加
function addBackButton() {
  const backButton = document.createElement("button");
  backButton.textContent = "🏠 ホームに戻る";
  backButton.style.position = "fixed";
  backButton.style.top = "20px";
  backButton.style.left = "20px";
  backButton.style.zIndex = "1000";
  backButton.style.padding = "12px 18px";
  backButton.style.background = "linear-gradient(135deg, #ea580c, #f97316)";
  backButton.style.color = "white";
  backButton.style.border = "none";
  backButton.style.borderRadius = "12px";
  backButton.style.cursor = "pointer";
  backButton.style.fontSize = "14px";
  backButton.style.fontWeight = "600";
  backButton.style.boxShadow = "0 4px 12px rgba(234, 88, 12, 0.3)";
  backButton.style.transition = "all 0.3s ease";
  backButton.onclick = () => {
    // iframe内の場合は、親フレームに戻るメッセージを送信
    if (window.parent !== window || window.top !== window) {
      try {
        window.parent.postMessage({ type: 'lesson:goBack' }, '*');
        window.top.postMessage({ type: 'lesson:goBack' }, '*');
        console.log('🏠 ホームに戻るメッセージを送信しました');
        return;
      } catch (e) {
        console.log('ホームに戻るメッセージの送信に失敗:', e);
      }
    }
    // iframe外の場合は直接メインページに戻る
    window.location.href = "../../../index.html";
  };
  
  // ホバー効果
  backButton.onmouseover = () => {
    backButton.style.transform = 'translateY(-2px) scale(1.05)';
    backButton.style.boxShadow = '0 6px 16px rgba(234, 88, 12, 0.4)';
  };
  backButton.onmouseout = () => {
    backButton.style.transform = 'translateY(0) scale(1)';
    backButton.style.boxShadow = '0 4px 12px rgba(234, 88, 12, 0.3)';
  };
  
  document.body.appendChild(backButton);
}

// 初期化時に戻るボタンを追加
addBackButton();

// ランダム出題用のシャッフル関数
function shuffleQuestions() {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 選択肢インデックスをシャッフル
function generateShuffledIndices(length) {
  const indices = Array.from({ length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

function loadQuestion() {
  const q = shuffledQuestions[current];
  
  // 進捗表示を追加
  const progressDisplay = document.getElementById("progress") || createProgressDisplay();
  progressDisplay.textContent = `問題 ${current + 1} / ${questions.length}`;
  
  questionEl.innerHTML = q.text || q.question;
  sourceEl.innerHTML = mode === "wakaru" ? q.source : "";
  explanationEl.textContent = "";
  nextBtn.style.display = "none";
  prevBtn.style.display = current > 0 ? "inline-block" : "none";
  choicesEl.innerHTML = "";
  timerDisplay.textContent = "";
  
  // 最後の問題に到達した場合、完了メッセージを送信
  if (current === shuffledQuestions.length - 1) {
    console.log('最後の問題に到達しました。完了メッセージを準備中...');
    // 最後の問題では個別の完了メッセージは送信しない
    // （全問題完了時に一度だけ正しい結果を送信）
  }

  // 表示する選択肢の順序を毎回ランダムにする
  const shuffledChoiceIndices = generateShuffledIndices(q.choices.length);
  shuffledChoiceIndices.forEach((originalIndex) => {
    const btn = document.createElement("button");
    btn.textContent = q.choices[originalIndex];
    btn.dataset.originalIndex = String(originalIndex);
    btn.onclick = () => handleAnswer(originalIndex);
    choicesEl.appendChild(btn);
  });

  if (mode === "oboeru") {
    timeLeft = 20;
    timerDisplay.textContent = `のこり ${timeLeft} 秒`;
    timer = setInterval(() => {
      timeLeft--;
      timerDisplay.textContent = `のこり ${timeLeft} 秒`;
      if (timeLeft <= 0) {
        clearInterval(timer);
        handleAnswer(-1); // 時間切れ → 不正解処理
      }
    }, 1000);
  }
}

function handleAnswer(selected) {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }

  const q = shuffledQuestions[current];
  const buttons = choicesEl.querySelectorAll("button");
  const selectedOriginalIndex = selected;
  buttons.forEach((btn) => {
    btn.disabled = true;
    const originalIndex = parseInt(btn.dataset.originalIndex || "-1", 10);
    if (originalIndex === q.answer) {
      btn.classList.add("correct");
    }
    if (originalIndex === selectedOriginalIndex && selectedOriginalIndex !== q.answer) {
      btn.classList.add("wrong");
    }
  });

  // 正解・不正解のメッセージをアニメーション付きで表示
  const isCorrect = selected === q.answer;
  const message = isCorrect ? 
    "🎉 正解です！素晴らしい！" : 
    `❌ 不正解です。正解は「${q.choices[q.answer]}」でした。`;
  
  explanationEl.textContent = message;
  explanationEl.style.animation = isCorrect ? "correctPulse 0.6s ease" : "wrongShake 0.6s ease";
  nextBtn.style.display = "inline-block";
  
  // 学習履歴に記録（わかる編はタイム計測なしのため 0 秒扱い）
  const spent = mode === "oboeru" ? (20 - timeLeft) : 0;
  learningTracker.recordAnswer(current, selected, q.answer, spent);
  
  // 個別問題の回答をメインページに送信（復習システム用）
  sendQuestionAnswerToParent(q, selected, isCorrect);
}

// 前の問題へ戻る
prevBtn.onclick = () => {
  if (current > 0) {
    current--;
    loadQuestion();
  }
};

// 個別問題の回答をメインページに送信する関数
function sendQuestionAnswerToParent(questionData, userAnswer, isCorrect) {
  // レッスンIDを生成
  const urlParams = new URLSearchParams(window.location.search);
  const era = urlParams.get("era") || "geo_land_topo";
  const lessonId = `soc.geography.${era}.${mode}`;
  
  const messageData = {
    type: 'question:answered',
    lessonId: lessonId,
    questionData: {
      qnum: questionData.qnum || current,
      question: questionData.question,
      choices: questionData.choices,
      answer: questionData.answer,
      explanation: questionData.explanation
    },
    userAnswer: userAnswer,
    correctAnswer: questionData.answer,
    isCorrect: isCorrect,
    timestamp: Date.now()
  };
  
  console.log('📝 個別問題回答を送信:', messageData);
  
  // 複数の方法でメッセージを送信
  try {
    // 方法1: postMessage
    if (window.parent !== window) {
      window.parent.postMessage(messageData, '*');
    }
    if (window.top !== window) {
      window.top.postMessage(messageData, '*');
    }
    
    // 方法2: localStorage経由での代替通信
    const existingAnswers = JSON.parse(localStorage.getItem('questionAnswers') || '[]');
    existingAnswers.push(messageData);
    localStorage.setItem('questionAnswers', JSON.stringify(existingAnswers));
    
    console.log('✅ 個別問題回答送信完了 (postMessage + localStorage)');
  } catch (e) {
    console.log('❌ 個別問題回答送信失敗:', e);
  }
}

// 今回のセッション結果を表示する関数
function showCurrentSessionResult() {
  const session = learningTracker.currentSession;
  const scorePercent = session.totalQuestions > 0 ? 
    Math.round((session.score / session.totalQuestions) * 100) : 0;
  
  // 成績に応じたメッセージ
  let resultMessage = '';
  if (scorePercent >= 90) {
    resultMessage = '🎉 素晴らしい成果です！';
  } else if (scorePercent >= 70) {
    resultMessage = '👍 よくできました！';
  } else if (scorePercent >= 50) {
    resultMessage = '📚 もう少し頑張りましょう！';
  } else {
    resultMessage = '💪 復習して再チャレンジしよう！';
  }
  
  const timeMinutes = Math.floor((session.totalTime || 0) / 60);
  const timeSeconds = (session.totalTime || 0) % 60;
  const timeDisplay = timeMinutes > 0 ? 
    `${timeMinutes}分${timeSeconds}秒` : 
    `${timeSeconds}秒`;
  
  return `
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 16px; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
      <div style="font-size: 1.8rem; font-weight: bold; margin-bottom: 1rem;">学習完了！</div>
      <div style="font-size: 1.1rem; margin-bottom: 1.5rem;">${resultMessage}</div>
      <div style="background: rgba(255,255,255,0.2); border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem;">
        <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 0.5rem;">${session.score}/${session.totalQuestions}問正解</div>
        <div style="font-size: 1.5rem; font-weight: 600;">${scorePercent}%</div>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 0.9rem; opacity: 0.9;">
        <div>学習時間: <strong>${timeDisplay}</strong></div>
        <div>完了時刻: <strong>${new Date().toLocaleString('ja-JP', {month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</strong></div>
      </div>
    </div>
  `;
}

// 次の問題へ進む
nextBtn.onclick = () => {
  current++;
  if (current < questions.length) {
    loadQuestion();
  } else {
    questionEl.textContent = "終了！おつかれさまでした。";
    sourceEl.textContent = "";
    timerDisplay.textContent = "";
    choicesEl.innerHTML = "";
    explanationEl.textContent = "";
    nextBtn.style.display = "none";
    prevBtn.style.display = "none";
    
    // 学習履歴を保存
    learningTracker.saveSession();
    
    // 今回のセッション結果を表示
    const historyDisplay = document.getElementById("historyDisplay");
    historyDisplay.innerHTML = showCurrentSessionResult();

    // 完了メッセージを親フレームに送信
    console.log('iframe検出チェック:', {
      'window.parent !== window': window.parent !== window,
      'window.top !== window': window.top !== window,
      'window.frameElement': !!window.frameElement,
      'URL includes lessons': window.location.href.includes('/lessons/')
    });
    
    // 確実にメッセージを送信（iframe検出を強制的に有効化）
    const isInIframe = window.parent !== window || window.top !== window || window.location.href.includes('/lessons/');
    console.log('📡 メッセージ送信判定:', isInIframe);
    
    if (isInIframe) {
      try {
        // 現在のURLから正しいlessonIdを生成
        const urlParams = new URLSearchParams(window.location.search);
        const era = urlParams.get("era") || "geo_land_topo";
        // グローバルのmode変数を使用
        // 新しい地理コンテンツに対応
        let lessonId = `soc.geography.${era}.${mode}`;
        
        const messageData = {
          type: 'lesson:complete',
          lessonId: lessonId,
          detail: {
            correct: learningTracker.currentSession.score,
            total: learningTracker.currentSession.totalQuestions,
            timeSec: learningTracker.currentSession.totalTime || 0
          }
        };
        
        console.log('🚀 完了メッセージを送信します:', messageData);
        console.log('🚀 現在のセッション情報:', learningTracker.currentSession);
        
        // 複数の方法で確実にメッセージを送信
        console.log('🔄 複数の方法でメッセージを送信開始');
        
        // 方法1: parent
        try {
          window.parent.postMessage(messageData, '*');
          console.log('✅ window.parent.postMessage 送信成功');
        } catch (e) {
          console.log('❌ window.parent.postMessage 失敗:', e);
        }
        
        // 方法2: top
        try {
          if (window.top !== window) {
            window.top.postMessage(messageData, '*');
            console.log('✅ window.top.postMessage 送信成功');
          }
        } catch (e) {
          console.log('❌ window.top.postMessage 失敗:', e);
        }
        
        // 方法3: 全てのframeに送信
        try {
          if (window.frames) {
            for (let i = 0; i < window.frames.length; i++) {
              window.frames[i].postMessage(messageData, '*');
            }
            console.log('✅ frames への送信完了');
          }
        } catch (e) {
          console.log('❌ frames への送信失敗:', e);
        }
        
        // 方法4: storage eventを使用した代替通信
        try {
          localStorage.setItem('lessonCompleteMessage', JSON.stringify({
            ...messageData,
            timestamp: Date.now()
          }));
          console.log('✅ localStorage での通信設定完了');
        } catch (e) {
          console.log('❌ localStorage での通信失敗:', e);
        }
        
        // セッション結果をメインページ用に保存（将来の機能用）
        try {
          const sessionResult = {
            lessonId: lessonId,
            correct: learningTracker.currentSession.score,
            total: learningTracker.currentSession.totalQuestions,
            seconds: learningTracker.currentSession.totalTime || 0,
            completedAt: new Date().toISOString()
          };
          
          sessionStorage.setItem('currentSessionResult', JSON.stringify(sessionResult));
          console.log('🎯 セッション結果を保存:', sessionResult);
          
        } catch (e) {
          console.log('❌ セッション結果保存失敗:', e);
        }
        
        console.log('✅ 完了メッセージを送信しました');
      } catch (e) {
        console.log('完了メッセージの送信に失敗しました:', e);
      }
    } else {
      console.log('⚠️ iframe検出に失敗しました。手動送信ボタンを追加します。');
      
      // 手動でメッセージを送信するボタンを追加
      const manualSendButton = document.createElement("button");
      manualSendButton.textContent = "🔄 結果を送信";
      manualSendButton.style.marginTop = "1rem";
      manualSendButton.style.padding = "0.75rem 1.5rem";
      manualSendButton.style.fontSize = "1rem";
      manualSendButton.style.fontWeight = "600";
      manualSendButton.style.background = "linear-gradient(135deg, #e53e3e 0%, #c53030 100%)";
      manualSendButton.style.color = "white";
      manualSendButton.style.border = "none";
      manualSendButton.style.borderRadius = "8px";
      manualSendButton.style.cursor = "pointer";
      manualSendButton.onclick = () => {
        try {
          const urlParams = new URLSearchParams(window.location.search);
          const era = urlParams.get("era") || "geo_land_topo";
          let lessonId = `soc.geography.${era}.${mode}`;
          
          const messageData = {
            type: 'lesson:complete',
            lessonId: lessonId,
            detail: {
              correct: learningTracker.currentSession.score,
              total: learningTracker.currentSession.totalQuestions,
              timeSec: learningTracker.currentSession.totalTime || 0
            }
          };
          
          console.log('🔧 手動でメッセージを送信:', messageData);
          window.parent.postMessage(messageData, '*');
          window.top.postMessage(messageData, '*');
          
          manualSendButton.textContent = "✅ 送信完了";
          manualSendButton.disabled = true;
        } catch (e) {
          console.error('手動送信も失敗:', e);
          manualSendButton.textContent = "❌ 送信失敗";
        }
      };
      
      document.querySelector(".question-box").appendChild(manualSendButton);
    }

    // 手動でホームに戻るボタン（自動遷移なし）
    const homeButton = document.createElement("button");
    homeButton.textContent = "🏠 ホームに戻る";
    homeButton.style.marginTop = "1.5rem";
    homeButton.style.padding = "1rem 2rem";
    homeButton.style.fontSize = "1.1rem";
    homeButton.style.fontWeight = "600";
    homeButton.style.background = "linear-gradient(135deg, #4a90e2 0%, #357abd 100%)";
    homeButton.style.color = "white";
    homeButton.style.border = "none";
    homeButton.style.borderRadius = "15px";
    homeButton.style.cursor = "pointer";
    homeButton.style.boxShadow = "0 8px 25px rgba(74, 144, 226, 0.3)";
    homeButton.style.transition = "all 0.3s ease";
    homeButton.style.minHeight = "44px";
    homeButton.style.width = "100%";
    homeButton.onclick = () => {
      // iframe内の場合は、親フレームに戻るメッセージを送信
      if (window.parent !== window || window.top !== window) {
        try {
          window.parent.postMessage({ type: 'lesson:goBack' }, '*');
          window.top.postMessage({ type: 'lesson:goBack' }, '*');
          console.log('🏠 ホームに戻るメッセージを送信しました');
          return;
        } catch (e) {
          console.log('ホームに戻るメッセージの送信に失敗:', e);
        }
      }
      // iframe外の場合は直接メインページに戻る
      window.location.href = "../../../index.html";
    };
    document.querySelector(".question-box").appendChild(homeButton);

    // 覚える編で80%以上正解なら、該当単元をOKとして記録
    try {
      if (mode === "oboeru" && learningTracker.currentSession.totalQuestions > 0) {
        const percentage = Math.round(
          (learningTracker.currentSession.score / learningTracker.currentSession.totalQuestions) * 100
        );
        if (percentage >= 80) {
          const progressRaw = localStorage.getItem('unitProgress');
          const progress = progressRaw ? JSON.parse(progressRaw) : {};
          const prev = progress[eraKey] || {};
          progress[eraKey] = {
            ...prev,
            oboeruOk: true,
            oboeruBest: Math.max(prev.oboeruBest || 0, percentage)
          };
          localStorage.setItem('unitProgress', JSON.stringify(progress));

          const okNotice = document.createElement('div');
          okNotice.style.marginTop = '0.75rem';
          okNotice.style.fontWeight = '700';
          okNotice.style.color = '#2c7a7b';
          okNotice.textContent = `OK達成！この単元は ${percentage}% の正解率でした。`;
          document.querySelector('.question-box').appendChild(okNotice);
        }
      }
    } catch (e) {
      console.error('OK判定の保存に失敗しました:', e);
    }
    
  }
};

// 学習履歴管理クラス
class LearningTracker {
  constructor() {
    this.currentSession = {
      startTime: Date.now(),
      questions: [],
      score: 0,
      totalQuestions: 0,
      mode: mode
    };
  }

  // 問題回答を記録
  recordAnswer(questionId, selectedAnswer, correctAnswer, timeSpent) {
    this.currentSession.questions.push({
      questionId,
      selectedAnswer,
      correctAnswer,
      isCorrect: selectedAnswer === correctAnswer,
      timeSpent,
      timestamp: Date.now()
    });

    if (selectedAnswer === correctAnswer) {
      this.currentSession.score++;
    }
    this.currentSession.totalQuestions++;

    // 即座に保存
    this.saveSession();
  }

  // セッションを保存
  saveSession() {
    try {
      // 既存の履歴を読み込み
      const existingHistory = this.loadHistory();
      
      // 新しいセッションを追加
      existingHistory.sessions.push({
        ...this.currentSession,
        endTime: Date.now(),
        duration: Date.now() - this.currentSession.startTime
      });

      // 統計情報を更新
      existingHistory.stats = this.calculateStats(existingHistory.sessions);
      
      // 保存
      localStorage.setItem('learningHistory', JSON.stringify(existingHistory));
      
      return true;
    } catch (error) {
      console.error('セッション保存エラー:', error);
      return false;
    }
  }

  // 履歴を読み込み
  loadHistory() {
    try {
      const data = localStorage.getItem('learningHistory');
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('履歴読み込みエラー:', error);
    }
    
    // 初期データ
    return {
      sessions: [],
      stats: {
        totalSessions: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        averageScore: 0,
        bestScore: 0
      }
    };
  }

  // 統計を計算
  calculateStats(sessions) {
    const stats = {
      totalSessions: sessions.length,
      totalQuestions: 0,
      correctAnswers: 0,
      averageScore: 0,
      bestScore: 0
    };

    sessions.forEach(session => {
      stats.totalQuestions += session.totalQuestions;
      stats.correctAnswers += session.score;
      stats.bestScore = Math.max(stats.bestScore, session.score);
    });

    if (stats.totalSessions > 0 && stats.totalQuestions > 0) {
      stats.averageScore = (stats.correctAnswers / stats.totalQuestions * 100).toFixed(1);
    }

    return stats;
  }

  // 学習履歴を表示
  showHistory() {
    const history = this.loadHistory();
    const stats = history.stats;
    
    return `
      <div class="history-stats">
        <h3>学習履歴</h3>
        <p>総学習回数: ${stats.totalSessions}回</p>
        <p>総問題数: ${stats.totalQuestions}問</p>
        <p>正答率: ${stats.averageScore}%</p>
        <p>最高得点: ${stats.bestScore}点</p>
      </div>
    `;
  }
}

// 学習履歴管理インスタンスを作成
const learningTracker = new LearningTracker();

// 初期化：わかる編は配列順、覚える編はランダム
function startApp() {
  if (mode === "oboeru") {
    shuffledQuestions = shuffleQuestions();
  } else {
    // わかる編は questions をそのまま
    shuffledQuestions = [...questions];
  }
  loadQuestion();
}

// データ到着後に開始（loader.js が questions を読み込むため）
(function waitForQuestions(){
  if (typeof questions !== 'undefined' && Array.isArray(questions) && questions.length > 0) {
    startApp();
  } else {
    setTimeout(waitForQuestions, 50);
  }
})();
