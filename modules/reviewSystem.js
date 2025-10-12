// 復習レッスンシステム - 独立モジュール
console.log('🎓 復習システムモジュール読み込み開始');

// 文字列安全化＆省略ユーティリティ
function toStr(v) { return v == null ? '' : String(v); }
function trunc(v, n = 80) {
  const s = toStr(v);
  return s.length > n ? s.slice(0, n) + '…' : s;
}

// 復習システムの設定
const REVIEW_SYSTEM_CONFIG = {
  MIN_WRONG_FOR_GENERATION: 5, // 復習レッスン生成に必要な最小間違い数（10→5に改善）
  MAX_REVIEW_QUESTIONS: 30, // 復習レッスンに含める最大問題数（全問を含む）
  STORAGE_KEY: 'wrong_questions', // LocalStorage のキー
  FIRESTORE_COLLECTION: 'user_wrong_questions', // Firestore のコレクション名
  // 新機能：難易度別復習設定
  DIFFICULTY_LEVELS: {
    BASIC: { threshold: 3, label: '基本問題復習' },
    STANDARD: { threshold: 5, label: '標準問題復習' },
    ADVANCED: { threshold: 7, label: '応用問題復習' }
  }
};

// 復習システムクラス
class ReviewSystem {
  constructor() {
    this.wrongQuestions = [];
    this.reviewLessons = [];
    this.currentReviewSession = null;
  }

  // 復習システムの初期化
  initialize() {
    console.log('🚀 復習システムを初期化中...');
    
    // LocalStorage から間違い問題を読み込み
    this.loadWrongQuestionsFromLocal();
    
    // 復習レッスンも読み込み
    this.loadReviewLessonsFromLocal();
    
    // 既存データの正規化マイグレーション
    this.migrateWrongQuestionsData();
    
    console.log('✅ 復習システム初期化完了');
  }

  // 間違えた問題を記録する
  recordWrongAnswer(lessonId, questionData, userAnswer) {
    console.log('🔴 間違い問題を記録:', { lessonId, questionData, userAnswer });
    
    // ID正規化を実施
    const baseId = this.normalizeLessonId(lessonId);
    const key = `${baseId}_${questionData.qnum}`;
    
    // 既存に同キーがあれば差し替え（重複しない）
    this.wrongQuestions = this.wrongQuestions.filter(w => `${w.lessonId}_${w.questionId}` !== key);
    
    const wrongQuestion = {
      id: `${key}_${Date.now()}`,
      lessonId: baseId, // 正規化されたID
      questionId: questionData.qnum,
      questionData: questionData,
      userAnswer: userAnswer,
      wrongAt: Date.now(),
      reviewCount: 0 // 復習した回数
    };
    
    // ローカル状態に追加
    this.wrongQuestions.push(wrongQuestion);
    
    console.log('📝 正規化されたID:', baseId, '元ID:', lessonId);
    
    // LocalStorage に保存
    this.saveWrongQuestionsToLocal();
    
    // Firebase に同期（ユーザーがログインしている場合）
    if (window.state?.user?.id) {
      this.saveWrongQuestionsToFirebase(window.state.user.id);
    }
    
    // 復習レッスン生成の条件をチェック（正規化されたIDで）
    this.checkReviewLessonGeneration(baseId);
    
    console.log(`📝 間違い問題記録完了。現在の間違い問題数: ${this.wrongQuestions.length}`);
  }

  // 正解した問題を処理する（復習レッスンで）
  recordCorrectAnswer(lessonId, questionData) {
    console.log('✅ 正解を記録:', { lessonId, questionData });
    
    // 間違い問題リストから該当の問題を削除
    const questionIndex = this.wrongQuestions.findIndex(wq => 
      wq.lessonId === lessonId && wq.questionId === questionData.qnum
    );
    
    if (questionIndex !== -1) {
      this.wrongQuestions.splice(questionIndex, 1);
      console.log(`✅ 間違い問題リストから削除: ${lessonId}_${questionData.qnum}`);
      
      // LocalStorage に保存
      this.saveWrongQuestionsToLocal();
      
      // Firebase に同期（ユーザーがログインしている場合）
      if (window.state?.user?.id) {
        this.saveWrongQuestionsToFirebase(window.state.user.id);
      }
    }
  }

  // レッスンIDの正規化
  normalizeLessonId(lessonId) {
    if (!lessonId) return '';
    
    // review_ プレフィックスを除去
    let normalized = lessonId.replace(/^review_/, '');
    
    // タイムスタンプサフィックスを除去 (_数字13桁以上)
    normalized = normalized.replace(/_\d{13,}$/, '');
    
    // .oboeru, .wakaru などのサフィックスを除去
    normalized = normalized.replace(/\.(oboeru|wakaru|quiz|test)$/, '');
    
    return normalized;
  }

  // LocalStorage に間違い問題を保存
  saveWrongQuestionsToLocal() {
    try {
      localStorage.setItem(REVIEW_SYSTEM_CONFIG.STORAGE_KEY, JSON.stringify(this.wrongQuestions));
      console.log('💾 間違い問題をLocalStorageに保存完了');
    } catch (error) {
      console.error('❌ LocalStorage保存エラー:', error);
    }
  }

  // LocalStorage から間違い問題を読み込み
  loadWrongQuestionsFromLocal() {
    try {
      const stored = localStorage.getItem(REVIEW_SYSTEM_CONFIG.STORAGE_KEY);
      if (stored) {
        this.wrongQuestions = JSON.parse(stored);
        console.log(`📖 LocalStorageから間違い問題を読み込み: ${this.wrongQuestions.length}問`);
      }
    } catch (error) {
      console.error('❌ LocalStorage読み込みエラー:', error);
      this.wrongQuestions = [];
    }
  }

  // 復習レッスンをLocalStorageに保存
  saveReviewLessons() {
    try {
      localStorage.setItem('reviewLessons', JSON.stringify(this.reviewLessons));
      console.log(`📚 復習レッスンをLocalStorageに保存: ${this.reviewLessons.length}件`);
    } catch (e) { 
      console.warn('reviewLessons 保存失敗', e); 
    }
  }

  // 復習レッスンをLocalStorageから読み込み
  loadReviewLessonsFromLocal() {
    try {
      const stored = localStorage.getItem('reviewLessons');
      if (stored) {
        this.reviewLessons = JSON.parse(stored);
        console.log(`📚 復習レッスンをLocalStorageから読み込み: ${this.reviewLessons.length}件`);
      }
    } catch (error) {
      console.error('❌ 復習レッスンの読み込みエラー:', error);
      this.reviewLessons = [];
    }
  }

  // データマイグレーション
  migrateWrongQuestionsData() {
    // 既存データの正規化処理（必要に応じて実装）
    console.log('🔄 データマイグレーション完了');
  }

  // Firebase に間違い問題を保存
  async saveWrongQuestionsToFirebase(userId) {
    try {
      if (!window.db) {
        console.warn('⚠️ Firebase未初期化のため同期をスキップ');
        return;
      }

      const userDocRef = window.db.collection(REVIEW_SYSTEM_CONFIG.FIRESTORE_COLLECTION).doc(userId);
      await userDocRef.set({
        wrongQuestions: this.wrongQuestions,
        updatedAt: Date.now()
      });
      console.log('☁️ Firebaseに間違い問題を同期完了');
    } catch (error) {
      console.error('❌ Firebase保存エラー:', error);
    }
  }

  // Firebase から間違い問題を読み込み
  async loadWrongQuestionsFromFirebase(userId) {
    try {
      if (!window.db) {
        console.warn('⚠️ Firebase未初期化のため読み込みをスキップ');
        return;
      }

      const userDocRef = window.db.collection(REVIEW_SYSTEM_CONFIG.FIRESTORE_COLLECTION).doc(userId);
      const doc = await userDocRef.get();
      
      if (doc.exists) {
        const data = doc.data();
        if (data.wrongQuestions && Array.isArray(data.wrongQuestions)) {
          this.wrongQuestions = data.wrongQuestions;
          console.log(`☁️ Firebaseから間違い問題を読み込み: ${this.wrongQuestions.length}問`);
          
          // LocalStorageにも保存
          this.saveWrongQuestionsToLocal();
        }
      }
    } catch (error) {
      console.error('❌ Firebase読み込みエラー:', error);
    }
  }

  // 復習レッスン生成条件をチェック
  checkReviewLessonGeneration(baseId) {
    // 特定のレッスンIDの間違い問題を取得
    const lessonWrongQuestions = this.wrongQuestions.filter(wq => wq.lessonId === baseId);
    
    console.log(`🔍 復習レッスン生成チェック: ${baseId} (${lessonWrongQuestions.length}問)`);
    
    if (lessonWrongQuestions.length >= REVIEW_SYSTEM_CONFIG.MIN_WRONG_FOR_GENERATION) {
      console.log(`🎯 復習レッスン生成条件達成: ${baseId} (${lessonWrongQuestions.length}問)`);
      
      // 問題を選出
      const selectedQuestions = this.pickForReview(baseId);
      console.log(`📝 選出された問題数: ${selectedQuestions.length}問`);
      
      // 復習レッスンを生成
      const reviewId = this.upsertReviewLesson(baseId, selectedQuestions);
      
      // 生成されたレッスンを取得して通知
      const reviewLesson = this.reviewLessons.find(r => r.id === reviewId);
      if (reviewLesson) {
        this.showReviewLessonNotification(reviewLesson);
      }
    }
  }

  // 復習用問題選出
  pickForReview(baseId) {
    const list = this.wrongQuestions
      .filter(w => w.lessonId === baseId)
      .sort((a, b) => b.wrongAt - a.wrongAt);

    const seen = new Set();
    const unique = [];
    const limit = Math.min(REVIEW_SYSTEM_CONFIG.MAX_REVIEW_QUESTIONS || 30, 10);
    
    for (const w of list) {
      const k = `${w.lessonId}_${w.questionId}`;
      if (!seen.has(k)) { 
        seen.add(k); 
        unique.push(w); 
      }
      if (unique.length === limit) break;
    }
    return unique;
  }

  // 復習レッスンを生成/更新
  upsertReviewLesson(originalLessonId, wrongQuestions) {
    const baseId = this.normalizeLessonId(originalLessonId);
    const title = this.getTitleByLessonId(baseId);

    // 既存を検索（normalized で比較）
    let existing = this.reviewLessons.find(r => this.normalizeLessonId(r.originalLessonId) === baseId);
    if (existing) {
      // 既存があるなら上書きせず、必要なら問題を補充する程度に留める
      existing.questions = existing.questions.slice(0, 10);
      this.saveReviewLessons();
      console.log('🔄 既存の復習レッスンを更新:', existing.id);
      return existing.id;
    }

    // 新規作成
    const id = `review_${baseId}_${Date.now()}`;
    const review = {
      id,
      originalLessonId: baseId,
      title: `${title}（復習）`,
      questions: wrongQuestions.slice(0, 10),
      createdAt: Date.now(),
      type: 'review',
      isActive: true
    };
    this.reviewLessons.push(review);
    this.saveReviewLessons();
    console.log('🎓 新しい復習レッスンを作成:', review);
    return id;
  }

  // レッスンタイトルを取得
  getTitleByLessonId(lessonId) {
    // window.state.catalog から検索
    if (window.state?.catalog) {
      const lesson = window.state.catalog.find(item => item.id === lessonId);
      if (lesson) return lesson.title;
    }
    return '復習レッスン';
  }

  // 復習レッスン通知を表示
  showReviewLessonNotification(reviewLesson) {
    console.log('🔔 復習レッスン通知を表示:', reviewLesson);
    
    const notificationHTML = `
      <div id="reviewNotification" class="review-notification-overlay">
        <div class="review-notification-dialog">
          <div class="review-notification-header">
            <span class="review-notification-icon">🎓</span>
            <h3>復習レッスンが生成されました！</h3>
          </div>
          <div class="review-notification-content">
            <p><strong>${reviewLesson.title}</strong></p>
            <p>間違えた問題 ${reviewLesson.questions.length}問を集めました。</p>
            <p>今すぐ復習しますか？</p>
          </div>
          <div class="review-notification-actions">
            <button class="btn-secondary" onclick="reviewSystem.closeReviewNotification()">キャンセル</button>
            <button class="btn-primary" onclick="reviewSystem.acceptReviewNotification('${reviewLesson.id}')">OK</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', notificationHTML);
    
    // アニメーション表示
    setTimeout(() => {
      const notification = document.getElementById('reviewNotification');
      if (notification) {
        notification.classList.add('show');
      }
    }, 100);
  }

  // 復習通知を閉じる
  closeReviewNotification() {
    console.log('❌ 復習通知をキャンセル');
    const notification = document.getElementById('reviewNotification');
    if (notification) {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }
  }

  // 復習通知のOKボタン処理
  acceptReviewNotification(reviewLessonId) {
    console.log('✅ 復習通知のOKボタンがクリックされました:', reviewLessonId);
    this.closeReviewNotification();
    this.openReviewLesson(reviewLessonId);
  }

  // 復習レッスンを開く
  openReviewLesson(reviewLessonId) {
    console.log('📖 復習レッスンを開きます:', reviewLessonId);
    
    const reviewLesson = this.reviewLessons.find(rl => rl.id === reviewLessonId);
    if (!reviewLesson) {
      console.error('❌ 復習レッスンが見つかりません:', reviewLessonId);
      console.log('📊 現在の復習レッスン一覧:', this.reviewLessons);
      alert('復習レッスンが見つかりません。');
      return;
    }
    
    console.log('✅ 復習レッスンが見つかりました:', reviewLesson);
    
    // 復習レッスン用のURLハッシュを設定
    location.hash = `#/review/${reviewLessonId}`;
    
    // 直接描画も実行（ハッシュ監視のフォールバック）
    if (typeof this.renderReviewLesson === 'function') {
      this.renderReviewLesson(reviewLessonId);
    }
  }

  // 復習レッスンのビューを表示
  renderReviewLesson(reviewLessonId) {
    console.log('🎓 復習レッスンビューを表示:', reviewLessonId);
    
    const reviewLesson = this.reviewLessons.find(rl => rl.id === reviewLessonId);
    if (!reviewLesson) {
      console.error('❌ 復習レッスンが見つかりません:', reviewLessonId);
      return;
    }
    
    // 安全性チェック：問題データの存在確認
    if (!Array.isArray(reviewLesson.questions) || reviewLesson.questions.length === 0) {
      console.warn('⚠️ レビューに表示できる問題がありません:', reviewLessonId, reviewLesson);
      alert('復習レッスンに問題データがありません。ホーム画面に戻ります。');
      if (window.setHash) window.setHash('home');
      return;
    }
    
    // 復習レッスン用の問題データを準備
    const reviewQuestions = reviewLesson.questions.map(wq => wq.questionData);
    
    console.log(`📝 復習レッスン問題数: ${reviewQuestions.length}問`);
    
    // 復習レッスン専用のHTMLを生成
    this.renderReviewLessonHTML(reviewLesson, reviewQuestions);
  }

  // 復習レッスン用のHTMLを生成・表示
  renderReviewLessonHTML(reviewLesson, questions) {
    const homeView = document.getElementById('homeView');
    const app = document.getElementById('app');
    
    // 通常レイアウトに戻す
    homeView?.classList.remove('math-full-width');
    app?.classList.remove('math-full-width');
    
    // 復習レッスン用のHTMLを生成
    if (homeView) {
      homeView.innerHTML = `
        <div class="review-lesson-container">
          <div class="review-lesson-header">
            <div class="review-lesson-info">
              <h1 class="review-lesson-title">
                <span class="review-icon">🎓</span>
                ${reviewLesson.title}
              </h1>
              <div class="review-lesson-meta">
                <span class="review-badge">復習レッスン</span>
                <span class="review-count">${questions.length}問</span>
                <span class="review-date">作成: ${new Date(reviewLesson.createdAt).toLocaleDateString()}</span>
              </div>
              <p class="review-lesson-description">
                間違えた問題を集めた復習レッスンです。満点を取ると自動的に削除されます。
              </p>
            </div>
            <div class="review-lesson-actions">
              <button class="btn-secondary review-back-btn" onclick="reviewSystem.goBackFromReview()">
                ← 戻る
              </button>
              <button class="btn-primary review-start-btn" onclick="reviewSystem.startReviewLesson('${reviewLesson.id}')">
                復習開始
              </button>
            </div>
          </div>
          
          <div class="review-questions-preview">
            <h3 class="preview-title">復習問題一覧</h3>
            <div class="questions-grid">
              ${questions.map((q, index) => `
                <div class="question-preview-card">
                  <div class="question-number">問${index + 1}</div>
                  <div class="question-text">${trunc(q.text || q.title || q.prompt || q.question || '問題文が見つかりません', 50)}</div>
                  <div class="question-source">${trunc(q.source || q.origin || '出典不明', 30)}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }
    
    console.log('✅ 復習レッスンHTML生成完了');
  }

  // 復習レッスンから戻る
  goBackFromReview() {
    console.log('🔙 復習レッスンから戻る');
    if (window.setHash) window.setHash('home');
  }

  // 復習レッスンを実際に開始
  startReviewLesson(reviewLessonId) {
    console.log('🚀 復習レッスン開始:', reviewLessonId);
    
    const reviewLesson = this.reviewLessons.find(rl => rl.id === reviewLessonId);
    if (!reviewLesson) {
      console.error('❌ 復習レッスンが見つかりません:', reviewLessonId);
      return;
    }
    
    // 復習レッスン用の問題セッションを開始
    this.startReviewQuestionSession(reviewLesson);
  }

  // 復習問題セッションを開始
  startReviewQuestionSession(reviewLesson) {
    console.log('📝 復習問題セッション開始:', reviewLesson.id);
    
    // 復習セッション状態を初期化
    const reviewSession = {
      reviewLessonId: reviewLesson.id,
      originalLessonId: reviewLesson.originalLessonId,
      questions: reviewLesson.questions.map(wq => wq.questionData),
      currentQuestionIndex: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      startTime: Date.now(),
      isReviewMode: true
    };
    
    // グローバル状態に保存
    this.currentReviewSession = reviewSession;
    window.currentReviewSession = reviewSession;
    
    // 最初の問題を表示
    this.displayReviewQuestion(reviewSession);
  }

  // 復習問題を表示
  displayReviewQuestion(reviewSession) {
    const homeView = document.getElementById('homeView');
    const currentQ = reviewSession.questions[reviewSession.currentQuestionIndex];
    
    if (!currentQ) {
      // 全問題完了
      this.completeReviewSession(reviewSession);
      return;
    }
    
    // 問題データの安全性チェック
    if (!currentQ.text && !currentQ.title && !currentQ.prompt && !currentQ.question) {
      console.warn('⚠️ 問題データに表示可能なテキストがありません:', currentQ);
      // 次の問題にスキップ
      reviewSession.currentQuestionIndex++;
      this.displayReviewQuestion(reviewSession);
      return;
    }
    
    // 選択肢の安全性チェック
    if (!Array.isArray(currentQ.choices) || currentQ.choices.length === 0) {
      console.warn('⚠️ 問題に選択肢がありません:', currentQ);
      // 次の問題にスキップ
      reviewSession.currentQuestionIndex++;
      this.displayReviewQuestion(reviewSession);
      return;
    }
    
    const progress = reviewSession.currentQuestionIndex + 1;
    const total = reviewSession.questions.length;
    
    if (homeView) {
      homeView.innerHTML = `
        <div class="review-question-container">
          <div class="review-question-header">
            <div class="review-progress">
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${(progress / total) * 100}%"></div>
              </div>
              <div class="progress-text">問題 ${progress} / ${total}</div>
            </div>
            <div class="review-stats">
              <span class="correct-count">正解: ${reviewSession.correctAnswers}</span>
              <span class="wrong-count">不正解: ${reviewSession.wrongAnswers}</span>
            </div>
          </div>
          
          <div class="question-content">
            <h2 class="question-text">${trunc(currentQ.text || currentQ.title || currentQ.prompt || currentQ.question || '問題文', 200)}</h2>
            <div class="choices-container">
              ${(currentQ.choices || []).map((choice, index) => `
                <button class="choice-btn" onclick="reviewSystem.selectReviewAnswer(${index})">
                  <span class="choice-label">${String.fromCharCode(65 + index)}</span>
                  <span class="choice-text">${trunc(choice || `選択肢${index + 1}`, 100)}</span>
                </button>
              `).join('')}
            </div>
          </div>
          
          <div class="question-footer">
            <div class="question-source">出典: ${trunc(currentQ.source || currentQ.origin || '不明', 40)}</div>
            <button class="btn-secondary" onclick="reviewSystem.exitReviewSession()">復習を終了</button>
          </div>
        </div>
      `;
    }
  }

  // 復習問題の回答を選択
  selectReviewAnswer(selectedIndex) {
    const session = this.currentReviewSession;
    if (!session) return;
    
    const currentQ = session.questions[session.currentQuestionIndex];
    const isCorrect = selectedIndex === currentQ.answer;
    
    console.log(`📝 復習問題回答: 問${session.currentQuestionIndex + 1}, 選択: ${selectedIndex}, 正解: ${currentQ.answer}, 結果: ${isCorrect ? '正解' : '不正解'}`);
    
    // 結果を記録
    if (isCorrect) {
      session.correctAnswers++;
      // 正解した場合、間違い問題リストから削除
      this.recordCorrectAnswer(session.originalLessonId, currentQ);
    } else {
      session.wrongAnswers++;
      // 不正解の場合、記録を更新（復習回数を増やす）
      this.updateWrongQuestionReviewCount(session.originalLessonId, currentQ);
    }
    
    // 回答結果を表示
    this.showReviewAnswerResult(isCorrect, currentQ, selectedIndex);
  }

  // 復習問題の回答結果を表示
  showReviewAnswerResult(isCorrect, question, selectedIndex) {
    // 安全性チェック
    const choices = question.choices || [];
    const correctAnswer = question.answer;
    const correctChoice = choices[correctAnswer] || '選択肢が見つかりません';
    
    const resultHTML = `
      <div class="answer-result ${isCorrect ? 'correct' : 'incorrect'}">
        <div class="result-icon">${isCorrect ? '✅' : '❌'}</div>
        <div class="result-text">${isCorrect ? '正解！' : '不正解'}</div>
        ${!isCorrect && correctAnswer != null ? `
          <div class="correct-answer">
            正解: ${String.fromCharCode(65 + correctAnswer)} ${trunc(correctChoice, 80)}
          </div>
        ` : ''}
        <button class="btn-primary next-question-btn" onclick="reviewSystem.proceedToNextReviewQuestion()">
          次の問題へ
        </button>
      </div>
    `;
    
    // 既存のコンテンツに結果を追加
    const container = document.querySelector('.review-question-container');
    if (container) {
      container.innerHTML += resultHTML;
    }
    
    // 選択肢ボタンを無効化
    const choiceBtns = document.querySelectorAll('.choice-btn');
    choiceBtns.forEach(btn => btn.disabled = true);
  }

  // 次の復習問題へ進む
  proceedToNextReviewQuestion() {
    const session = this.currentReviewSession;
    if (!session) return;
    
    session.currentQuestionIndex++;
    this.displayReviewQuestion(session);
  }

  // 復習セッションを完了
  completeReviewSession(reviewSession) {
    console.log('🎉 復習セッション完了:', reviewSession);
    
    const score = Math.round((reviewSession.correctAnswers / reviewSession.questions.length) * 100);
    const duration = Math.round((Date.now() - reviewSession.startTime) / 1000);
    
    const homeView = document.getElementById('homeView');
    if (homeView) {
      homeView.innerHTML = `
        <div class="review-complete-container">
          <div class="review-complete-header">
            <div class="complete-icon">${score === 100 ? '🎉' : '📊'}</div>
            <h1 class="complete-title">復習完了！</h1>
          </div>
          
          <div class="review-results">
            <div class="score-display">
              <div class="score-number">${score}%</div>
              <div class="score-label">正解率</div>
            </div>
            
            <div class="results-grid">
              <div class="result-item">
                <div class="result-value">${reviewSession.correctAnswers}</div>
                <div class="result-label">正解</div>
              </div>
              <div class="result-item">
                <div class="result-value">${reviewSession.wrongAnswers}</div>
                <div class="result-label">不正解</div>
              </div>
              <div class="result-item">
                <div class="result-value">${reviewSession.questions.length}</div>
                <div class="result-label">総問題数</div>
              </div>
              <div class="result-item">
                <div class="result-value">${duration}秒</div>
                <div class="result-label">所要時間</div>
              </div>
            </div>
            
            ${score === 100 ? `
              <div class="perfect-score-message">
                <h3>🌟 満点おめでとうございます！</h3>
                <p>この復習レッスンは自動的に削除されます。</p>
              </div>
            ` : `
              <div class="retry-message">
                <h3>📚 もう一度復習しませんか？</h3>
                <p>間違えた問題は引き続き復習できます。</p>
              </div>
            `}
          </div>
          
          <div class="review-actions">
            <button class="btn-secondary" onclick="reviewSystem.goBackFromReview()">ホームに戻る</button>
            ${score < 100 ? `<button class="btn-primary" onclick="reviewSystem.startReviewLesson('${reviewSession.reviewLessonId}')">再度復習</button>` : ''}
          </div>
        </div>
      `;
    }
    
    // 満点の場合、復習レッスンを削除
    if (score === 100) {
      this.removeReviewLesson(reviewSession.reviewLessonId);
    }
    
    // セッションをクリア
    this.currentReviewSession = null;
    window.currentReviewSession = null;
  }

  // 復習セッションを途中で終了
  exitReviewSession() {
    console.log('❌ 復習セッションを終了');
    if (confirm('復習を途中で終了しますか？進捗は保存されません。')) {
      this.currentReviewSession = null;
      window.currentReviewSession = null;
      if (window.setHash) window.setHash('home');
    }
  }

  // 間違い問題の復習回数を更新
  updateWrongQuestionReviewCount(lessonId, questionData) {
    const baseId = this.normalizeLessonId(lessonId);
    const key = `${baseId}_${questionData.qnum}`;
    
    const wrongQuestion = this.wrongQuestions.find(wq => 
      `${wq.lessonId}_${wq.questionId}` === key
    );
    
    if (wrongQuestion) {
      wrongQuestion.reviewCount = (wrongQuestion.reviewCount || 0) + 1;
      wrongQuestion.lastReviewAt = Date.now();
      
      // LocalStorage に保存
      this.saveWrongQuestionsToLocal();
      
      // Firebase に同期（ユーザーがログインしている場合）
      if (window.state?.user?.id) {
        this.saveWrongQuestionsToFirebase(window.state.user.id);
      }
      
      console.log(`📝 復習回数を更新: ${key} (${wrongQuestion.reviewCount}回目)`);
    }
  }

  // 復習レッスンを削除
  removeReviewLesson(reviewLessonId) {
    console.log('🗑️ 復習レッスンを削除:', reviewLessonId);
    
    const index = this.reviewLessons.findIndex(rl => rl.id === reviewLessonId);
    if (index !== -1) {
      this.reviewLessons.splice(index, 1);
      this.saveReviewLessons();
      console.log('✅ 復習レッスン削除完了');
    }
  }

  // 復習システムの状態を確認する関数
  getReviewSystemStatus() {
    const status = {
      wrongQuestionsCount: this.wrongQuestions.length,
      wrongQuestionsByLesson: {},
      reviewLessonsCount: this.reviewLessons.length,
      reviewLessons: this.reviewLessons.map(rl => ({
        id: rl.id,
        title: rl.title,
        originalLessonId: rl.originalLessonId,
        questionsCount: rl.questions.length,
        createdAt: new Date(rl.createdAt).toLocaleString()
      }))
    };
    
    // レッスン別の間違い数を集計
    this.wrongQuestions.forEach(wq => {
      if (!status.wrongQuestionsByLesson[wq.lessonId]) {
        status.wrongQuestionsByLesson[wq.lessonId] = 0;
      }
      status.wrongQuestionsByLesson[wq.lessonId]++;
    });
    
    console.table(status.wrongQuestionsByLesson);
    return status;
  }

  // テスト用関数
  testReviewSystem() {
    try {
      console.log('🧪 復習システムのテストを開始');
      
      // テスト用の間違い問題を生成（安全なデータ構造）
      const testLessonId = '4200_paleolithic_jomon_yayoi';
      const testQuestions = [
        { qnum: 1, text: '縄文時代の特徴は？', choices: ['狩猟採集', '農業', '工業', '商業'], answer: 0, source: 'テスト問題', title: '縄文時代' },
        { qnum: 2, text: '弥生時代の特徴は？', choices: ['狩猟採集', '稲作', '工業', '商業'], answer: 1, source: 'テスト問題', title: '弥生時代' },
        { qnum: 3, text: '旧石器時代の特徴は？', choices: ['石器使用', '金属使用', '農業', '商業'], answer: 0, source: 'テスト問題', title: '旧石器時代' },
        { qnum: 4, text: '縄文土器の特徴は？', choices: ['無文', '縄目文様', '絵画', '文字'], answer: 1, source: 'テスト問題', title: '縄文土器' },
        { qnum: 5, text: '弥生土器の特徴は？', choices: ['縄目文様', '薄手で実用的', '厚手', '装飾的'], answer: 1, source: 'テスト問題', title: '弥生土器' }
      ];
      
      // 間違い問題として記録
      testQuestions.forEach(q => {
        this.recordWrongAnswer(testLessonId, q, 'テスト回答');
      });
      
      console.log('✅ テスト用間違い問題を5問記録しました');
      console.log('📊 現在の間違い問題数:', this.wrongQuestions.length);
      console.log('📚 復習レッスン数:', this.reviewLessons.length);
      
      // 復習レッスン生成をチェック
      setTimeout(() => {
        try {
          this.checkReviewLessonGeneration(testLessonId);
          console.log('🎓 復習レッスン生成チェック完了');
          
          // ホーム画面を更新して復習レッスンを表示
          setTimeout(() => {
            try {
              if (window.renderHome) window.renderHome();
              console.log('🏠 ホーム画面を更新しました');
            } catch (error) {
              console.error('❌ ホーム画面更新エラー:', error);
            }
          }, 500);
        } catch (error) {
          console.error('❌ 復習レッスン生成エラー:', error);
        }
      }, 100);
    } catch (error) {
      console.error('❌ 復習システムテストエラー:', error);
    }
  }

  // 復習システムをリセット
  resetReviewSystem() {
    console.log('🔄 復習システムをリセット');
    this.wrongQuestions = [];
    this.reviewLessons = [];
    localStorage.removeItem(REVIEW_SYSTEM_CONFIG.STORAGE_KEY);
    localStorage.removeItem('reviewLessons');
    console.log('✅ 復習システムリセット完了');
    if (window.renderHome) window.renderHome();
  }
}

// 復習システムのインスタンスを作成してグローバルに公開
const reviewSystem = new ReviewSystem();

// グローバル関数として公開
window.reviewSystem = reviewSystem;
window.recordWrongAnswer = (lessonId, questionData, userAnswer) => reviewSystem.recordWrongAnswer(lessonId, questionData, userAnswer);
window.recordCorrectAnswer = (lessonId, questionData) => reviewSystem.recordCorrectAnswer(lessonId, questionData);
window.initializeReviewSystem = () => reviewSystem.initialize();
window.openReviewLesson = (reviewLessonId) => reviewSystem.openReviewLesson(reviewLessonId);
window.testReviewSystem = () => reviewSystem.testReviewSystem();
window.resetReviewSystem = () => reviewSystem.resetReviewSystem();
window.getReviewSystemStatus = () => reviewSystem.getReviewSystemStatus();

// 問題回答処理
window.handleQuestionAnswered = (messageData) => {
  console.log('📝 問題回答を処理中:', messageData);
  
  const {
    lessonId,
    questionData,
    userAnswer,
    correctAnswer,
    isCorrect,
    timestamp
  } = messageData;
  
  // レッスンIDが不明な場合は現在のレッスンから取得
  const actualLessonId = lessonId || (window.state?.current?.id);
  
  if (!actualLessonId) {
    console.warn('⚠️ レッスンIDが特定できません。間違い問題記録をスキップします。');
    return;
  }
  
  console.log('📊 問題回答詳細:', {
    actualLessonId,
    isCorrect,
    questionData: questionData ? '✅' : '❌',
    userAnswer,
    correctAnswer
  });
  
  // 間違えた場合のみ記録
  if (!isCorrect && questionData) {
    console.log('❌ 間違い問題として記録します');
    reviewSystem.recordWrongAnswer(actualLessonId, questionData, userAnswer);
    
    // 復習レッスン生成条件をチェック
    setTimeout(() => {
      reviewSystem.checkReviewLessonGeneration(reviewSystem.normalizeLessonId(actualLessonId));
    }, 100);
  } else if (isCorrect && questionData) {
    console.log('✅ 正解：復習リストから削除をチェック');
    reviewSystem.recordCorrectAnswer(actualLessonId, questionData);
  }
};

console.log('✅ 復習システムモジュール読み込み完了');

export { reviewSystem, ReviewSystem, REVIEW_SYSTEM_CONFIG };
