// シンプルな戻るボタンの機能
function goBack() {
  console.log('🏠 ホームボタンクリック');
  
  // 相対パスでメインページに移動
  console.log('🏠 ホームに移動: ../../../../index.html');
  
  try {
    // 相対パスを使用（lessons/soc/modular/wakaru/ から index.html へ）
    window.location.href = '../../../../index.html';
  } catch (e) {
    console.error('❌ ホーム移動エラー:', e);
    // フォールバック: 相対パス（別の方法）
    window.location.href = '../../../../index.html';
  }
}

const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get("mode") || "wakaru"; // デフォルトはわかる編
const era = urlParams.get("era") || "4100_land_topography_climate_with_sources"; // レッスンID生成用
const eraKey = urlParams.get("era") || "kodai"; // 単元キー（OK判定に使用）

document.getElementById("modeLabel").textContent = 
  mode === "oboeru" ? "覚える編（タイマー付き）" : "わかる編";

let current = 0;
let timer = null;
let timeLeft = 20;
let shuffledQuestions = []; // 出題用（わかる編=そのまま, 覚える編=ランダム）
let checkpointMode = false; // チェックポイントモーダル表示中フラグ

const questionEl = document.getElementById("question");
const visualEl = document.getElementById("visual");
const sourceEl = document.getElementById("source");
const choicesEl = document.getElementById("choices");
const explanationEl = document.getElementById("explanation");
const nextBtn = document.getElementById("nextBtn");

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
  const questionHeader = document.querySelector(".question-header");
  const questionBox = document.querySelector(".question-box");
  if (questionHeader) {
    questionHeader.style.position = "relative";
    questionHeader.appendChild(progressDisplay);
  } else {
    // フォールバック：従来の方法
    questionBox.style.position = "relative";
    questionBox.appendChild(progressDisplay);
  }
  return progressDisplay;
}

// タイマー表示用（覚える編でのみ作成・表示）
let timerDisplay = null;
if (mode === "oboeru") {
  timerDisplay = document.createElement("div");
  timerDisplay.id = "timer";
  timerDisplay.style.fontSize = "1em";
  timerDisplay.style.fontWeight = "bold";
  timerDisplay.style.color = "#d00";
  timerDisplay.style.margin = "0.5em 0";
  timerDisplay.style.display = "block"; // 覚える編では表示
  // タイマーはスクロール部分の最初に配置
  const questionContent = document.querySelector(".question-content");
  if (questionContent) {
    questionContent.insertBefore(timerDisplay, questionContent.firstChild);
  } else {
    // フォールバック：従来の方法
    document.querySelector(".question-box").insertBefore(timerDisplay, sourceEl);
  }
} else {
  // わかる編の場合、もしタイマー要素が存在していたら完全に非表示にする
  const existingTimer = document.getElementById("timer");
  if (existingTimer) {
    existingTimer.style.display = "none";
    existingTimer.style.visibility = "hidden";
    existingTimer.style.height = "0";
    existingTimer.style.minHeight = "0";
    existingTimer.style.padding = "0";
    existingTimer.style.margin = "0";
    existingTimer.style.overflow = "hidden";
    existingTimer.remove(); // DOMから完全に削除
  }
}

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
    window.location.href = "../../../../index.html";
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
  // window.questions または questions のいずれかを使用
  const questionsArray = window.questions || questions;
  if (!questionsArray || !Array.isArray(questionsArray)) {
    console.error('❌ 問題データが読み込まれていません');
    return [];
  }
  const shuffled = [...questionsArray];
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
  
  // 進捗表示を追加（説明テキスト表示後は表示）
  const progressDisplay = document.getElementById("progress") || createProgressDisplay();
  if (progressDisplay) {
    progressDisplay.style.display = "block";
    const questionsArray = window.questions || questions;
    const totalQuestions = questionsArray ? questionsArray.length : 0;
    progressDisplay.textContent = `問題 ${current + 1} / ${totalQuestions}`;
  }
  
  questionEl.innerHTML = q.text || q.question;
  
  // 図解の表示（visualフィールドがある場合）
  if (q.visual && mode === "wakaru") {
    visualEl.textContent = q.visual;
    visualEl.style.display = "block";
  } else {
    visualEl.style.display = "none";
    visualEl.innerHTML = ""; // 内容もクリア
  }
  
  sourceEl.innerHTML = mode === "wakaru" ? q.source : "";
  
  // wakaruモードでタイマー要素が存在する場合は確実に削除
  if (mode === "wakaru") {
    const timerEl = document.getElementById("timer");
    if (timerEl) {
      timerEl.remove();
    }
  }
  explanationEl.textContent = "";
  nextBtn.style.display = "none";
  choicesEl.innerHTML = "";
  if (timerDisplay) {
    timerDisplay.textContent = "";
  }
  
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

  if (mode === "oboeru" && timerDisplay) {
    timeLeft = 20;
    timerDisplay.textContent = `のこり ${timeLeft} 秒`;
    timer = setInterval(() => {
      timeLeft--;
      if (timerDisplay) {
        timerDisplay.textContent = `のこり ${timeLeft} 秒`;
      }
      if (timeLeft <= 0) {
        clearInterval(timer);
        handleAnswer(-1); // 時間切れ → 不正解処理
      }
    }, 1000);
  }
  
  // 画面を上部にスクロール（次の問題を上部から表示）
  setTimeout(() => {
    // question-boxまたはquestion要素にスクロール
    const questionBox = document.querySelector('.question-box');
    const questionElement = document.getElementById('question');
    const scrollTarget = questionBox || questionElement || document.body;
    
    if (scrollTarget) {
      scrollTarget.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    } else {
      // フォールバック: ページの先頭にスクロール
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, 100); // 少し遅延させてDOM更新後に実行
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
  
  // 個別問題の回答をメインページに送信
  sendQuestionAnswerToParent(q, selected, isCorrect);
}

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
    resultMessage = '💪 もう一度チャレンジしよう！';
  }
  
  // totalTimeを正しく計算
  const totalTime = Date.now() - session.startTime;
  const timeMinutes = Math.floor(totalTime / 60000);
  const timeSeconds = Math.floor((totalTime % 60000) / 1000);
  const timeDisplay = timeMinutes > 0 ? 
    `${timeMinutes}分${timeSeconds}秒` : 
    `${timeSeconds}秒`;
  
  console.log('📊 セッション結果表示:', {
    score: session.score,
    totalQuestions: session.totalQuestions,
    scorePercent: scorePercent,
    totalTime: totalTime,
    timeDisplay: timeDisplay
  });
  
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
  const questionsArray = window.questions || questions;
  const totalQuestions = questionsArray ? questionsArray.length : 0;
  console.log('🔄 nextBtn.onclick 実行:', { current, totalQuestions: totalQuestions });
  current++;
  
  // チェックポイント検出（10問、20問完了時）
  if (current > 0 && current % 10 === 0 && current < totalQuestions) {
    console.log(`✅ チェックポイント到達: ${current}問完了`);
    // チェックポイントを自動保存
    saveCheckpoint();
    // チェックポイントモーダルを表示
    showCheckpointDialog(current);
    return; // ユーザーが選択するまで待つ
  }
  
  if (current < totalQuestions) {
    console.log('📝 次の問題を読み込み:', current + 1);
    loadQuestion();
  } else {
    console.log('🎯 レッスン完了！メッセージ送信処理を開始');
    questionEl.textContent = "終了！おつかれさまでした。";
    sourceEl.textContent = "";
    if (timerDisplay) {
      timerDisplay.textContent = "";
    }
    choicesEl.innerHTML = "";
    explanationEl.textContent = "";
    nextBtn.style.display = "none";
    
    // 学習履歴を保存
    learningTracker.saveSession();
    
    // レッスン完了時にチェックポイントを削除
    clearCheckpoint();
    
    // 今回のセッション結果を表示
    const historyDisplay = document.getElementById("historyDisplay");
    historyDisplay.innerHTML = showCurrentSessionResult();

    // 完了メッセージを親フレームに送信
    console.log('🎯 メッセージ送信処理開始');
    console.log('iframe検出チェック:', {
      'window.parent !== window': window.parent !== window,
      'window.top !== window': window.top !== window,
      'window.frameElement': !!window.frameElement,
      'URL includes lessons': window.location.href.includes('/lessons/')
    });
    
    // 確実にメッセージを送信（iframe検出を強制的に有効化）
    const isInIframe = window.parent !== window || window.top !== window || window.location.href.includes('/lessons/');
    console.log('📡 メッセージ送信判定:', isInIframe);
    
    // 強制的にメッセージ送信を実行（iframe判定に関係なく）
    console.log('🚀 強制的にメッセージ送信を実行');
    
    // iframe判定に関係なく、常にメッセージを送信
    try {
        // 現在のURLから正しいlessonIdを生成（eraは既にグローバルで定義済み）
        
        // modeパラメータを考慮したレッスンID変換処理
        // 覚える編とわかる編で異なるID体系を使用
        let lessonId;
        
        // パターンマッチングでID変換
        if (era.includes('land_topography_climate')) {
          lessonId = 'soc.geography.land_topography_climate';
        } else if (era.includes('agriculture_forestry_fishery')) {
          lessonId = 'soc.geography.agriculture_forestry_fishery';
        } else if (era.includes('prefectures_cities')) {
          lessonId = 'soc.geography.prefectures_cities';
        } else if (era.includes('industry_energy')) {
          lessonId = 'soc.geography.industry_energy';
        } else if (era.includes('commerce_trade_transportation')) {
          lessonId = 'soc.geography.commerce_trade_transportation';
        } else if (era.includes('environment')) {
          lessonId = 'soc.geography.environment';
        } else if (era.includes('information')) {
          lessonId = 'soc.geography.information';
        } else if (era.includes('maps_symbols') || era.includes('maps_topographic_symbols')) {
          lessonId = 'soc.geography.maps_symbols';
        } else if (era.includes('hokkaido_region')) {
          lessonId = 'soc.geography.hokkaido_region';
        } else if (era.includes('tohoku_region')) {
          lessonId = 'soc.geography.tohoku_region';
        } else if (era.includes('kanto_region')) {
          lessonId = 'soc.geography.kanto_region';
        } else if (era.includes('chubu_region')) {
          lessonId = 'soc.geography.chubu_region';
        } else if (era.includes('kinki_region')) {
          lessonId = 'soc.geography.kinki_region';
        } else if (era.includes('chugoku_shikoku_region')) {
          lessonId = 'soc.geography.chugoku_shikoku_region';
        } else if (era.includes('kyushu_region')) {
          lessonId = 'soc.geography.kyushu_region';
        } else if (era.includes('world_geography')) {
          lessonId = 'soc.geography.world_geography';
        } else {
          // その他の場合はデフォルト形式
          lessonId = `soc.geography.${era}`;
        }
        
        // modeパラメータによるID分離（catalog.jsonと一致させる）
        if (mode === 'oboeru') {
          // 覚える編: _oboeruサフィックスを追加
          lessonId = lessonId + '_oboeru';
          console.log('🔍 覚える編のID変換:', lessonId);
        } else {
          // わかる編: _wakaruサフィックスを追加
          lessonId = lessonId + '_wakaru';
          console.log('🔍 わかる編のID変換:', lessonId);
        }
        
        console.log('🔄 レッスンID変換:', era, '→', lessonId);
        
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
        console.log('🚀 送信前の状態確認:', {
          'window.parent !== window': window.parent !== window,
          'window.top !== window': window.top !== window,
          'current URL': window.location.href
        });
        
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
        
        // 方法4: storage eventを使用した代替通信（強化版）
        try {
          const storageMessage = {
            ...messageData,
            timestamp: Date.now()
          };
          localStorage.setItem('lessonCompleteMessage', JSON.stringify(storageMessage));
          console.log('✅ localStorage での通信設定完了:', storageMessage);
          
          // 追加: 直接メインページの関数を呼び出し
          if (window.parent && window.parent.saveLessonProgress) {
            console.log('🔄 直接メインページの関数を呼び出し');
            window.parent.saveLessonProgress(messageData.lessonId, messageData.detail.correct, messageData.detail.total, messageData.detail.timeSec);
          }
        } catch (e) {
          console.log('❌ localStorage での通信失敗:', e);
        }
        
        // 方法5: 強制的にstorage eventを発火
        try {
          const storageEvent = new StorageEvent('storage', {
            key: 'lessonCompleteMessage',
            newValue: JSON.stringify({
              ...messageData,
              timestamp: Date.now()
            }),
            oldValue: null,
            storageArea: localStorage
          });
          window.dispatchEvent(storageEvent);
          console.log('✅ 強制的なstorage event発火完了');
        } catch (e) {
          console.log('❌ 強制的なstorage event発火失敗:', e);
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
      window.location.href = "../../../../index.html";
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
    this.mode = 'wakaru'; // わかる編専用
    this.historyKey = `learningHistory_wakaru`;
    
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
      
      // totalTimeを正しく計算
      const totalTime = Date.now() - this.currentSession.startTime;
      this.currentSession.totalTime = totalTime;
      
      // 新しいセッションを追加
      const sessionToSave = {
        ...this.currentSession,
        endTime: Date.now(),
        duration: totalTime,
        totalTime: totalTime
      };
      
      existingHistory.sessions.push(sessionToSave);

      // 統計情報を更新
      existingHistory.stats = this.calculateStats(existingHistory.sessions);
      
      // 保存（mode別キーを使用）
      localStorage.setItem(this.historyKey, JSON.stringify(existingHistory));
      console.log(`✅ 履歴保存完了: ${this.historyKey}`);
      
      console.log('✅ セッション保存完了:', {
        score: this.currentSession.score,
        totalQuestions: this.currentSession.totalQuestions,
        totalTime: totalTime,
        mode: this.currentSession.mode
      });
      
      return true;
    } catch (error) {
      console.error('セッション保存エラー:', error);
      return false;
    }
  }

  // 履歴を読み込み
  loadHistory() {
    try {
      // mode別キーで読み込み
      const historyKey = `learningHistory_${this.mode}`;
      const data = localStorage.getItem(historyKey);
      if (data) {
        console.log(`📖 履歴読み込み成功: ${historyKey}`);
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('履歴読み込みエラー:', error);
    }
    
    // 初期データ
    console.log(`🆕 新規履歴作成: learningHistory_${this.mode}`);
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

// レッスンIDを取得する関数（script.jsと同じロジック）
function getLessonId() {
  const urlParams = new URLSearchParams(window.location.search);
  const eraParam = urlParams.get("era") || era;
  
  // パターンマッチングでID変換
  let lessonId;
  
  // 歴史レッスンの判定（42で始まる）
  if (eraParam.startsWith('42')) {
    if (eraParam.includes('paleolithic_jomon_yayoi') || eraParam.includes('4200_')) {
      lessonId = 'soc.history.paleolithic_jomon_yayoi';
    } else if (eraParam.includes('kofun_asuka') || eraParam.includes('4201_')) {
      lessonId = 'soc.history.kofun_asuka';
    } else if (eraParam.includes('nara_period') || eraParam.includes('4202_')) {
      lessonId = 'soc.history.nara_period';
    } else if (eraParam.includes('heian_period') || eraParam.includes('4203_')) {
      lessonId = 'soc.history.heian_period';
    } else if (eraParam.includes('kamakura_period') || eraParam.includes('4204_')) {
      lessonId = 'soc.history.kamakura_period';
    } else if (eraParam.includes('muromachi_period') || eraParam.includes('4205_')) {
      lessonId = 'soc.history.muromachi_period';
    } else if (eraParam.includes('azuchi_momoyama') || eraParam.includes('4206_')) {
      lessonId = 'soc.history.azuchi_momoyama';
    } else if (eraParam.includes('edo_period') || eraParam.includes('4207_')) {
      lessonId = 'soc.history.edo_period';
    } else if (eraParam.includes('meiji_period') || eraParam.includes('4208_')) {
      lessonId = 'soc.history.meiji_period';
    } else if (eraParam.includes('taisho_showa_prewar') || eraParam.includes('4209_')) {
      lessonId = 'soc.history.taisho_showa_prewar';
    } else if (eraParam.includes('showa_postwar') || eraParam.includes('4210_')) {
      lessonId = 'soc.history.showa_postwar';
    } else if (eraParam.includes('heisei_reiwa') || eraParam.includes('4211_')) {
      lessonId = 'soc.history.heisei_reiwa';
    } else if (eraParam.includes('cross_period_problems') || eraParam.includes('4212_')) {
      lessonId = 'soc.history.cross_period_problems';
    } else if (eraParam.includes('theme_politics_economy') || eraParam.includes('4213_')) {
      lessonId = 'soc.history.theme_politics_economy';
    } else if (eraParam.includes('theme_people') || eraParam.includes('4214_')) {
      lessonId = 'soc.history.theme_people';
    } else if (eraParam.includes('theme_diplomacy') || eraParam.includes('4215_')) {
      lessonId = 'soc.history.theme_diplomacy';
    } else if (eraParam.includes('theme_culture') || eraParam.includes('4216_')) {
      lessonId = 'soc.history.theme_culture';
    } else {
      lessonId = `soc.history.${eraParam.replace(/^42\d+_/, '')}`;
    }
  }
  // 総合レッスンの判定（4217以降）
  else if (eraParam.startsWith('4217') || eraParam.startsWith('4218') || 
           eraParam.startsWith('4219') || eraParam.startsWith('422') || eraParam.includes('comprehensive')) {
    if (eraParam.includes('geography_theme_cross') || eraParam.includes('4217_')) {
      lessonId = 'soc.comprehensive.geography_theme_cross';
    } else if (eraParam.includes('history_theme_cross') || eraParam.includes('4218_')) {
      lessonId = 'soc.comprehensive.history_theme_cross';
    } else if (eraParam.includes('civics_theme_cross') || eraParam.includes('4219_')) {
      lessonId = 'soc.comprehensive.civics_theme_cross';
    } else if (eraParam.includes('general_comprehensive') || eraParam.includes('4220_')) {
      lessonId = 'soc.comprehensive.general_comprehensive';
    } else if (eraParam.includes('practice_a') || eraParam.includes('4225_')) {
      lessonId = 'soc.comprehensive.practice_a';
    } else if (eraParam.includes('practice_b') || eraParam.includes('4226_')) {
      lessonId = 'soc.comprehensive.practice_b';
    } else if (eraParam.includes('practice_c') || eraParam.includes('4227_')) {
      lessonId = 'soc.comprehensive.practice_c';
    } else if (eraParam.includes('practice_d') || eraParam.includes('4228_')) {
      lessonId = 'soc.comprehensive.practice_d';
    } else {
      lessonId = `soc.comprehensive.${eraParam.replace(/^42\d+_/, '')}`;
    }
  }
  // 公民レッスンの判定（43で始まる）
  else if (eraParam.startsWith('43') || eraParam.includes('civics')) {
    if (eraParam.includes('politics_national_life') || eraParam.includes('4300_')) {
      lessonId = 'soc.civics.politics_national_life';
    } else if (eraParam.includes('constitution_three_principles') || eraParam.includes('4301_')) {
      lessonId = 'soc.civics.constitution_three_principles';
    } else if (eraParam.includes('diet_cabinet_judiciary') || eraParam.includes('4302_')) {
      lessonId = 'soc.civics.diet_cabinet_judiciary';
    } else if (eraParam.includes('finance_local_government') || eraParam.includes('4303_')) {
      lessonId = 'soc.civics.finance_local_government';
    } else if (eraParam.includes('world_affairs_international') || eraParam.includes('4304_')) {
      lessonId = 'soc.civics.world_affairs_international';
    } else if (eraParam.includes('modern_social_issues') || eraParam.includes('4305_')) {
      lessonId = 'soc.civics.modern_social_issues';
    } else {
      lessonId = `soc.civics.${eraParam.replace(/^43\d+_/, '')}`;
    }
  }
  // 地理レッスンの判定
  else if (eraParam.includes('land_topography_climate')) {
    lessonId = 'soc.geography.land_topography_climate';
  } else if (eraParam.includes('agriculture_forestry_fishery')) {
    lessonId = 'soc.geography.agriculture_forestry_fishery';
  } else if (eraParam.includes('prefectures_cities')) {
    lessonId = 'soc.geography.prefectures_cities';
  } else if (eraParam.includes('industry_energy')) {
    lessonId = 'soc.geography.industry_energy';
  } else if (eraParam.includes('commerce_trade_transportation')) {
    lessonId = 'soc.geography.commerce_trade_transportation';
  } else if (eraParam.includes('environment')) {
    lessonId = 'soc.geography.environment';
  } else if (eraParam.includes('information')) {
    lessonId = 'soc.geography.information';
  } else if (eraParam.includes('maps_symbols') || eraParam.includes('maps_topographic_symbols')) {
    lessonId = 'soc.geography.maps_symbols';
  } else if (eraParam.includes('hokkaido_region')) {
    lessonId = 'soc.geography.hokkaido_region';
  } else if (eraParam.includes('tohoku_region')) {
    lessonId = 'soc.geography.tohoku_region';
  } else if (eraParam.includes('kanto_region')) {
    lessonId = 'soc.geography.kanto_region';
  } else if (eraParam.includes('chubu_region')) {
    lessonId = 'soc.geography.chubu_region';
  } else if (eraParam.includes('kinki_region')) {
    lessonId = 'soc.geography.kinki_region';
  } else if (eraParam.includes('chugoku_shikoku_region')) {
    lessonId = 'soc.geography.chugoku_shikoku_region';
  } else if (eraParam.includes('kyushu_region')) {
    lessonId = 'soc.geography.kyushu_region';
  } else if (eraParam.includes('world_geography')) {
    lessonId = 'soc.geography.world_geography';
  } else {
    lessonId = `soc.geography.${eraParam}`;
  }
  
  // modeパラメータによるID分離
  if (mode === 'oboeru') {
    lessonId = lessonId + '_oboeru';
  } else {
    lessonId = lessonId + '_wakaru';
  }
  
  return lessonId;
}

// チェックポイント関連の関数（script.jsと同じ）
function saveCheckpoint() {
  try {
    const lessonId = getLessonId();
    const checkpointKey = `checkpoint:${lessonId}`;
    const checkpointData = {
      current: current,
      timestamp: Date.now(),
      session: {
        score: learningTracker.currentSession.score,
        totalQuestions: learningTracker.currentSession.totalQuestions
      }
    };
    localStorage.setItem(checkpointKey, JSON.stringify(checkpointData));
    console.log('✅ チェックポイント保存完了:', checkpointData);
    return true;
  } catch (error) {
    console.error('❌ チェックポイント保存エラー:', error);
    return false;
  }
}

function loadCheckpoint() {
  try {
    const lessonId = getLessonId();
    const checkpointKey = `checkpoint:${lessonId}`;
    const checkpointData = localStorage.getItem(checkpointKey);
    if (checkpointData) {
      const data = JSON.parse(checkpointData);
      console.log('📖 チェックポイント読み込み:', data);
      return data;
    }
    return null;
  } catch (error) {
    console.error('❌ チェックポイント読み込みエラー:', error);
    return null;
  }
}

function clearCheckpoint() {
  try {
    const lessonId = getLessonId();
    const checkpointKey = `checkpoint:${lessonId}`;
    localStorage.removeItem(checkpointKey);
    console.log('🗑️ チェックポイント削除完了');
    return true;
  } catch (error) {
    console.error('❌ チェックポイント削除エラー:', error);
    return false;
  }
}

// 再開確認モーダルを表示する関数（Promiseを返す）
function showResumeDialog(checkpoint) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.id = 'resume-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      z-index: 10000;
      display: flex;
      justify-content: center;
      align-items: center;
      animation: fadeIn 0.3s ease;
      backdrop-filter: blur(4px);
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 24px;
      padding: 0;
      max-width: 90%;
      width: 420px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1);
      animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      overflow: hidden;
      position: relative;
    `;
    
    const questionsArray = window.questions || questions;
    const totalQuestions = questionsArray ? questionsArray.length : 0;
    const progressPercent = totalQuestions > 0 ? Math.round((checkpoint.current / totalQuestions) * 100) : 0;
    const scorePercent = checkpoint.session.totalQuestions > 0 ? 
      Math.round((checkpoint.session.score / checkpoint.session.totalQuestions) * 100) : 0;
    
    modal.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #10b981, #059669, #047857);
        padding: 2rem 2rem 1.5rem;
        text-align: center;
        position: relative;
        overflow: hidden;
      ">
        <div style="
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: rotate 20s linear infinite;
        "></div>
        <div style="position: relative; z-index: 1;">
          <div style="
            font-size: 3rem;
            margin-bottom: 0.5rem;
            animation: bounceIn 0.6s ease-out;
          ">📌</div>
          <div style="
            font-size: 1.5rem;
            font-weight: 700;
            color: white;
            margin-bottom: 0.25rem;
          ">前回の続きから</div>
          <div style="
            font-size: 0.9rem;
            color: rgba(255,255,255,0.9);
          ">学習を再開しますか？</div>
        </div>
      </div>
      <div style="padding: 2rem;">
        <div style="
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
          border: 2px solid #86efac;
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        ">
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          ">
            <div style="
              font-size: 0.9rem;
              color: #166534;
              font-weight: 600;
            ">進捗状況</div>
            <div style="
              font-size: 0.85rem;
              color: #10b981;
              font-weight: 600;
              background: rgba(16, 185, 129, 0.1);
              padding: 0.25rem 0.75rem;
              border-radius: 8px;
            ">${progressPercent}%</div>
          </div>
          <div style="
            font-size: 1.1rem;
            font-weight: 700;
            color: #166534;
            margin-bottom: 0.75rem;
          ">${checkpoint.current} / ${totalQuestions}問完了</div>
          <div style="
            height: 8px;
            background: #dcfce7;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 1rem;
          ">
            <div style="
              height: 100%;
              width: ${progressPercent}%;
              background: linear-gradient(90deg, #10b981, #059669);
              border-radius: 4px;
              transition: width 0.3s ease;
            "></div>
          </div>
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 0.75rem;
            border-top: 1px solid #86efac;
          ">
            <div style="
              font-size: 0.85rem;
              color: #166534;
              font-weight: 600;
            ">スコア</div>
            <div style="
              font-size: 1.1rem;
              font-weight: 700;
              background: linear-gradient(135deg, #10b981, #059669);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            ">${checkpoint.session.score}/${checkpoint.session.totalQuestions}問正解 (${scorePercent}%)</div>
          </div>
        </div>
        <div style="
          display: flex;
          gap: 0.75rem;
          flex-direction: column;
        ">
          <button id="resume-continue" style="
            width: 100%;
            padding: 1rem 1.5rem;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          ">
            <span style="position: relative; z-index: 1;">続きから再開する →</span>
          </button>
          <button id="resume-start-over" style="
            width: 100%;
            padding: 0.875rem 1.5rem;
            background: white;
            color: #64748b;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            font-size: 0.95rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          ">🔄 最初から始める</button>
        </div>
      </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // アニメーション用のスタイルを追加（既に存在する場合はスキップ）
    if (!document.getElementById('checkpoint-styles')) {
      const style = document.createElement('style');
      style.id = 'checkpoint-styles';
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(30px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.1); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        #resume-continue:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.5);
        }
        #resume-continue:active {
          transform: translateY(0);
        }
        #resume-start-over:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #475569;
          transform: translateY(-1px);
        }
        #resume-continue::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }
        #resume-continue:hover::before {
          width: 300px;
          height: 300px;
        }
      `;
      document.head.appendChild(style);
    }
    
    // 「続きから再開する」ボタンのイベント
    document.getElementById('resume-continue').onclick = () => {
      document.body.removeChild(overlay);
      resolve(true);
    };
    
    // 「最初から始める」ボタンのイベント
    document.getElementById('resume-start-over').onclick = () => {
      document.body.removeChild(overlay);
      resolve(false);
    };
    
    // オーバーレイクリックで閉じる（最初から始めるとして扱う）
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
        resolve(false);
      }
    };
  });
}

function showCheckpointDialog(questionNum) {
  if (checkpointMode) return;
  
  checkpointMode = true;
  const questionsArray = window.questions || questions;
  const totalQuestions = questionsArray ? questionsArray.length : 0;
  const completedQuestions = questionNum;
  const session = learningTracker.currentSession;
  const scorePercent = session.totalQuestions > 0 ? 
    Math.round((session.score / session.totalQuestions) * 100) : 0;
  
  const overlay = document.createElement('div');
  overlay.id = 'checkpoint-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    z-index: 10000;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: fadeIn 0.3s ease;
    backdrop-filter: blur(4px);
  `;
  
  // モーダルコンテンツを作成（モダンなデザイン）
  const modal = document.createElement('div');
  modal.style.cssText = `
    background: white;
    border-radius: 24px;
    padding: 0;
    max-width: 90%;
    width: 420px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1);
    animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    overflow: hidden;
    position: relative;
  `;
  
  // グラデーション背景ヘッダー
  modal.innerHTML = `
    <div style="
      background: linear-gradient(135deg, #8b5cf6, #7c3aed, #6d28d9);
      padding: 2rem 2rem 1.5rem;
      text-align: center;
      position: relative;
      overflow: hidden;
    ">
      <div style="
        position: absolute;
        top: -50%;
        right: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        animation: rotate 20s linear infinite;
      "></div>
      <div style="position: relative; z-index: 1;">
        <div style="
          font-size: 3rem;
          margin-bottom: 0.5rem;
          animation: bounceIn 0.6s ease-out;
        ">🎉</div>
        <div style="
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.25rem;
        ">${completedQuestions}問完了！</div>
        <div style="
          font-size: 0.9rem;
          color: rgba(255,255,255,0.9);
        ">チェックポイントに到達しました</div>
      </div>
    </div>
    <div style="padding: 2rem;">
      <div style="
        background: linear-gradient(135deg, #f8fafc, #f1f5f9);
        border: 2px solid #e2e8f0;
        border-radius: 16px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
      ">
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        ">
          <div style="
            font-size: 0.9rem;
            color: #64748b;
            font-weight: 600;
          ">現在のスコア</div>
          <div style="
            font-size: 0.85rem;
            color: #8b5cf6;
            font-weight: 600;
            background: rgba(139, 92, 246, 0.1);
            padding: 0.25rem 0.75rem;
            border-radius: 8px;
          ">${scorePercent}%</div>
        </div>
        <div style="
          font-size: 2.25rem;
          font-weight: 800;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.75rem;
        ">${session.score}/${session.totalQuestions}問正解</div>
        <div style="
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #64748b;
        ">
          <span style="
            display: inline-block;
            width: 8px;
            height: 8px;
            background: #8b5cf6;
            border-radius: 50%;
            animation: pulse 2s infinite;
          "></span>
          残り ${totalQuestions - completedQuestions}問
        </div>
      </div>
      <div style="
        display: flex;
        gap: 0.75rem;
        flex-direction: column;
      ">
        <button id="checkpoint-continue" style="
          width: 100%;
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        ">
          <span style="position: relative; z-index: 1;">続ける →</span>
        </button>
        <button id="checkpoint-save-exit" style="
          width: 100%;
          padding: 0.875rem 1.5rem;
          background: white;
          color: #64748b;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        ">💾 保存して終了</button>
      </div>
    </div>
  `;
  
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  if (!document.getElementById('checkpoint-styles')) {
    const style = document.createElement('style');
    style.id = 'checkpoint-styles';
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(30px) scale(0.95); opacity: 0; }
        to { transform: translateY(0) scale(1); opacity: 1; }
      }
      @keyframes bounceIn {
        0% { transform: scale(0.3); opacity: 0; }
        50% { transform: scale(1.1); }
        70% { transform: scale(0.9); }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(1.2); }
      }
      #checkpoint-continue:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(139, 92, 246, 0.5);
      }
      #checkpoint-continue:active {
        transform: translateY(0);
      }
      #checkpoint-save-exit:hover {
        background: #f8fafc;
        border-color: #cbd5e1;
        color: #475569;
        transform: translateY(-1px);
      }
      #checkpoint-continue::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: translate(-50%, -50%);
        transition: width 0.6s, height 0.6s;
      }
      #checkpoint-continue:hover::before {
        width: 300px;
        height: 300px;
      }
    `;
    document.head.appendChild(style);
  }
  
  document.getElementById('checkpoint-continue').onclick = () => {
    document.body.removeChild(overlay);
    checkpointMode = false;
    loadQuestion();
  };
  
  document.getElementById('checkpoint-save-exit').onclick = () => {
    saveCheckpoint();
    learningTracker.saveSession();
    goBack();
  };
  
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
      checkpointMode = false;
    }
  };
}

// 説明テキストを表示する関数
function showIntroduction() {
  if (mode !== "wakaru") {
    loadQuestion();
    return;
  }
  
  // window.introduction のチェック（空文字列や空白のみの場合はスキップ）
  const introValue = window.introduction;
  const introTrimmed = introValue ? introValue.trim() : '';
  
  if (typeof introValue === 'undefined' || !introValue || introTrimmed === '' || introTrimmed.length < 10) {
    loadQuestion();
    return;
  }
  
  // 進捗表示を非表示
  const progressDisplay = document.getElementById("progress");
  if (progressDisplay) {
    progressDisplay.style.display = "none";
  }
  
  // 説明テキストを表示
  questionEl.innerHTML = window.introduction;
  sourceEl.innerHTML = "";
  explanationEl.textContent = "";
  choicesEl.innerHTML = "";
  nextBtn.style.display = "none";
  
  // 「学習を開始」ボタンを追加
  const startButton = document.createElement("button");
  startButton.textContent = "学習を開始";
  startButton.className = "choice";
  startButton.style.cssText = "background: linear-gradient(135deg, #ea580c, #f97316); color: white; border: none; padding: 1rem 2rem; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; margin-top: 1.5rem; box-shadow: 0 4px 12px rgba(234, 88, 12, 0.3); transition: all 0.3s ease;";
  startButton.onmouseover = function() {
    this.style.transform = 'translateY(-2px) scale(1.02)';
    this.style.boxShadow = '0 6px 16px rgba(234, 88, 12, 0.4)';
  };
  startButton.onmouseout = function() {
    this.style.transform = 'translateY(0) scale(1)';
    this.style.boxShadow = '0 4px 12px rgba(234, 88, 12, 0.3)';
  };
  startButton.onclick = () => {
    // 説明テキスト表示フラグを設定
    window._introductionShown = true;
    // 最初の問題を表示
    loadQuestion();
  };
  
  choicesEl.appendChild(startButton);
}

// 初期化：わかる編は配列順、覚える編はランダム
async function startApp() {
  // チェックポイントを読み込む
  const checkpoint = loadCheckpoint();
  if (checkpoint) {
    // モダンな再開確認モーダルを表示
    const shouldResume = await showResumeDialog(checkpoint);
    if (shouldResume) {
      current = checkpoint.current;
      // セッション情報を復元
      learningTracker.currentSession.score = checkpoint.session.score;
      learningTracker.currentSession.totalQuestions = checkpoint.session.totalQuestions;
      console.log('📖 チェックポイントから再開:', current);
    } else {
      // チェックポイントを削除して最初から開始
      clearCheckpoint();
    }
  }
  
  if (mode === "oboeru") {
    shuffledQuestions = shuffleQuestions();
    if (current > 0) {
      // 再開時は現在の問題から開始
      loadQuestion();
    } else {
      loadQuestion();
    }
  } else {
    // わかる編は questions をそのまま
    // window.questions または questions のいずれかを使用
    const questionsArray = window.questions || questions;
    if (!questionsArray || !Array.isArray(questionsArray) || questionsArray.length === 0) {
      console.error('❌ 問題データが読み込まれていません');
      return;
    }
    shuffledQuestions = [...questionsArray];
    
    // 再開時は説明テキストをスキップして直接問題を表示
    if (current > 0) {
      loadQuestion();
    } else {
      // 説明テキストがあれば表示、なければ問題を表示
      showIntroduction();
    }
  }
}

// データ到着後に開始（loader.js が questions を読み込むため）
(function waitForQuestions(){
  // 既に実行済みの場合は再実行しない
  if (window._appStarted) {
    return;
  }
  
  // window.questions または questions のいずれかが読み込まれているかチェック
  const questionsLoaded = (typeof window.questions !== 'undefined' && Array.isArray(window.questions) && window.questions.length > 0) ||
                         (typeof questions !== 'undefined' && Array.isArray(questions) && questions.length > 0);
  
  if (questionsLoaded) {
    // 実行済みフラグを設定
    window._appStarted = true;
    startApp();
  } else {
    setTimeout(waitForQuestions, 50);
  }
})();
