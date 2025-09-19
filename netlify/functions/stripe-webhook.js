// netlify/functions/stripe-webhook.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
initializeApp({ credential: cert(sa) });
const db = getFirestore();

exports.handler = async (event) => {
  const sig = event.headers["stripe-signature"];
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("signature error:", err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  if (stripeEvent.type === "checkout.session.completed") {
    const session = stripeEvent.data.object;
    const md = session.metadata || {};
    const uid = md.uid || md.userId;          // どちらでも拾えるように
    const productId = md.productId;

    if (!uid || !productId) {
      console.error("metadata missing", md);
      return { statusCode: 400, body: "Missing metadata (uid/productId)" };
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

  return { statusCode: 200, body: "success" };
};

// ← return の「外」に置く（必須）
exports.config = { bodyParser: false };