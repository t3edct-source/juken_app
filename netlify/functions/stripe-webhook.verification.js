// 検証用: 現在の実装に診断ログを追加したバージョン
// このファイルは実際のwebhook関数の動作を確認するためのものです
// 本番環境にはデプロイせず、ローカルテストや一時的な診断に使用してください

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
initializeApp({ credential: cert(sa) });
const db = getFirestore();

exports.handler = async (event) => {
  // ===== 診断情報のログ出力 =====
  console.log("=== Webhook 診断情報 ===");
  console.log("event.isBase64Encoded:", event.isBase64Encoded);
  console.log("event.body type:", typeof event.body);
  console.log("event.body length:", event.body ? event.body.length : 0);
  console.log("event.body preview (first 200 chars):", 
    event.body ? event.body.substring(0, 200) : "empty");
  
  const contentType = event.headers["content-type"] || event.headers["Content-Type"];
  console.log("Content-Type:", contentType);
  
  const sig = event.headers["stripe-signature"];
  console.log("stripe-signature present:", !!sig);
  console.log("stripe-signature preview:", sig ? sig.substring(0, 50) + "..." : "missing");
  console.log("========================");
  
  // ===== 生のボディを取得 =====
  let rawBody = event.body;
  
  // Base64 エンコードされている場合の処理（検証用）
  if (event.isBase64Encoded) {
    console.log("⚠️ Base64 エンコードが検出されました。デコードを実行します。");
    try {
      rawBody = Buffer.from(event.body, 'base64').toString('utf8');
      console.log("✅ Base64 デコード成功");
      console.log("デコード後の body length:", rawBody.length);
    } catch (err) {
      console.error("❌ Base64 デコードエラー:", err.message);
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: "Base64 decode failed" }) 
      };
    }
  } else {
    console.log("ℹ️ Base64 エンコードされていません。body をそのまま使用します。");
  }
  
  // body が文字列でない場合のチェック
  if (typeof rawBody !== 'string') {
    console.error("❌ Body is not a string. Type:", typeof rawBody);
    console.error("Body value:", rawBody);
    return { 
      statusCode: 400, 
      body: JSON.stringify({ 
        error: "Invalid body format",
        bodyType: typeof rawBody,
        isBase64Encoded: event.isBase64Encoded
      }) 
    };
  }
  
  // ===== Stripe 署名検証 =====
  let stripeEvent;
  try {
    console.log("🔐 Stripe 署名検証を開始...");
    stripeEvent = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("✅ 署名検証成功");
    console.log("Event type:", stripeEvent.type);
  } catch (err) {
    console.error("❌ 署名検証エラー:", err.message);
    console.error("Error details:", {
      message: err.message,
      bodyType: typeof rawBody,
      bodyLength: rawBody ? rawBody.length : 0,
      isBase64Encoded: event.isBase64Encoded,
      hasSignature: !!sig
    });
    return { 
      statusCode: 400, 
      body: JSON.stringify({ 
        error: `Webhook Error: ${err.message}`,
        details: {
          bodyType: typeof rawBody,
          isBase64Encoded: event.isBase64Encoded
        }
      }) 
    };
  }

  // ===== イベント処理 =====
  if (stripeEvent.type === "checkout.session.completed") {
    const session = stripeEvent.data.object;
    const md = session.metadata || {};
    const uid = md.uid || md.userId;
    const productId = md.productId;

    if (!uid || !productId) {
      console.error("metadata missing", md);
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: "Missing metadata (uid/productId)" }) 
      };
    }

    console.log("✅ write entitlement", { uid, productId, sessionId: session.id });

    await db
      .collection("users")
      .doc(uid)
      .collection("entitlements")
      .doc(productId)
      .set({
        active: true,
        purchasedAt: FieldValue.serverTimestamp(),
        sessionId: session.id,
      }, { merge: true });
  }

  return { statusCode: 200, body: JSON.stringify({ success: true }) };
};

// ← return の「外」に置く（必須）
exports.config = { bodyParser: false };






