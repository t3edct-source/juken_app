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
  progressDisplay.style.fontSize = "0.85em";
  progressDisplay.style.fontWeight = "bold";
  progressDisplay.style.color = "white";
  progressDisplay.style.margin = "0.4em 0";
  progressDisplay.style.textAlign = "center";
  document.querySelector(".question-box").insertBefore(progressDisplay, sourceEl);
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
  
  questionEl.innerHTML = q.question;
  sourceEl.innerHTML = mode === "wakaru" ? q.source : "";
  explanationEl.textContent = "";
  nextBtn.style.display = "none";
  prevBtn.style.display = current > 0 ? "inline-block" : "none";
  choicesEl.innerHTML = "";
  timerDisplay.textContent = "";
  
  // 最後の問題に到達した場合、完了メッセージを送信
  if (current === shuffledQuestions.length - 1) {
    console.log('最後の問題に到達しました。完了メッセージを準備中...');
    // 少し遅延させてから完了メッセージを送信
    setTimeout(() => {
      if (window.parent !== window) {
        try {
          // 現在のURLから正しいlessonIdを生成
          const urlParams = new URLSearchParams(window.location.search);
          const era = urlParams.get("era") || "japan_geo1_front";
          const mode = urlParams.get("mode") || "wakaru";
          // catalog.jsonのIDに合わせて正確に実装
          let lessonId;
          if (era === 'japan_geo1_front') {
            lessonId = mode === 'wakaru' ? 'soc.geography.japan_terrain_front' : 'soc.geography.japan_terrain_front_quiz';
          } else if (era === 'japan_geo1_back') {
            lessonId = mode === 'wakaru' ? 'soc.geography.japan_terrain_back' : 'soc.geography.japan_terrain_back_quiz';
          } else {
            // フォールバック
            lessonId = `soc.geography.${era}.${mode}`;
          }
          
          console.log('最後の問題完了時にメッセージを送信します:', {
            type: 'lesson:complete',
            lessonId: lessonId,
            detail: {
              correct: 1,
              total: 1,
              timeSec: 0
            }
          });
          
          window.parent.postMessage({
            type: 'lesson:complete',
            lessonId: lessonId,
            detail: {
              correct: 1,
              total: 1,
              timeSec: 0
            }
          }, '*');
          
          console.log('最後の問題完了時のメッセージを送信しました');
        } catch (e) {
          console.log('完了メッセージの送信に失敗しました:', e);
        }
      } else {
        console.log('iframe内ではないため、完了メッセージを送信しません');
      }
    }, 2000); // 2秒後に完了メッセージを送信
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
}

// 前の問題へ戻る
prevBtn.onclick = () => {
  if (current > 0) {
    current--;
    loadQuestion();
  }
};

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
    
    // 学習履歴を表示
    const historyDisplay = document.getElementById("historyDisplay");
    historyDisplay.innerHTML = learningTracker.showHistory();

    // 完了メッセージを親フレームに送信
    if (window.parent !== window) {
      try {
        // 現在のURLから正しいlessonIdを生成
        const urlParams = new URLSearchParams(window.location.search);
        const era = urlParams.get("era") || "japan_geo1_front";
        const mode = urlParams.get("mode") || "wakaru";
        // catalog.jsonのIDに合わせて正確に実装
        let lessonId;
        if (era === 'japan_geo1_front') {
          lessonId = mode === 'wakaru' ? 'soc.geography.japan_terrain_front' : 'soc.geography.japan_terrain_front_quiz';
        } else if (era === 'japan_geo1_back') {
          lessonId = mode === 'wakaru' ? 'soc.geography.japan_terrain_back' : 'soc.geography.japan_terrain_back_quiz';
        } else {
          // フォールバック
          lessonId = `soc.geography.${era}.${mode}`;
        }
        
        console.log('完了メッセージを送信します:', {
          type: 'lesson:complete',
          lessonId: lessonId,
          detail: {
            correct: learningTracker.currentSession.score,
            total: learningTracker.currentSession.totalQuestions,
            timeSec: learningTracker.currentSession.totalTime || 0
          }
        });
        
        window.parent.postMessage({
          type: 'lesson:complete',
          lessonId: lessonId,
          detail: {
            correct: learningTracker.currentSession.score,
            total: learningTracker.currentSession.totalQuestions,
            timeSec: learningTracker.currentSession.totalTime || 0
          }
        }, '*');
        
        console.log('完了メッセージを送信しました');
      } catch (e) {
        console.log('完了メッセージの送信に失敗しました:', e);
      }
    } else {
      console.log('iframe内ではないため、完了メッセージを送信しません');
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
    homeButton.onclick = () => {
      window.location.href = "home_modular.html";
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
