// CORS削除版: 同一オリジンのみ許可
// このバージョンは、フロントエンドが必ず同一オリジンから呼び出す場合に使用します。
// 最も安全ですが、外部からのアクセスは完全にブロックされます。

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const PRICE_TABLE = {
  rika_gakushu_4: "price_1S8xZZHzyxbrJMQOeoaqM3JU", // 小4理科
  shakai_gakushu_4: "price_1S8xYIHzyxbrJMQOB52QlIdr", // 小4社会
  rika_gakushu_5: "price_1S8xZxHzyxbrJMQOWQpTsRzD", // 小5理科
  shakai_gakushu_5: "price_1S8aY2HzyxbrJMQOKjct926R", // 小5社会
  rika_gakushu_6: "price_1S8xaIHzyxbrJMQOO3zKSz4I", // 小6理科
  shakai_gakushu_6: "price_1S8xYuHzyxbrJMQOKg7dBPI2", // 小6社会
};

exports.handler = async (event) => {
  // CORSヘッダーを削除（同一オリジンのみ許可）
  // OPTIONSリクエストへの対応も不要（ブラウザが自動的に処理）

  try {
    console.log('🔍 Function開始 - event:', {
      httpMethod: event.httpMethod,
      headers: {
        'content-type': event.headers['content-type'] || event.headers['Content-Type'],
        'user-agent': event.headers['user-agent'] || event.headers['User-Agent'],
      },
      body: event.body ? event.body.substring(0, 200) : 'empty'
    });

    // リクエストボディの検証
    if (!event.body) {
      console.error('❌ リクエストボディが空です');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'リクエストボディが必要です' }),
      };
    }

    const { productId, uid } = JSON.parse(event.body);
    console.log('📦 受信データ:', { productId, uid });

    // 必須パラメータの検証
    if (!productId || !uid) {
      console.error('❌ 必須パラメータが不足:', { productId: !!productId, uid: !!uid });
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'productId と uid が必要です' }),
      };
    }

    // Price IDの検証
    const priceId = PRICE_TABLE[productId];
    if (!priceId) {
      console.error('❌ 無効なproductId:', productId);
      console.error('利用可能なproductId:', Object.keys(PRICE_TABLE));
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `無効なproductId: ${productId}` }),
      };
    }

    console.log('✅ Price ID確認:', { productId, priceId });

    // 環境変数の確認
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY が設定されていません');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Stripe設定エラー' }),
      };
    }

    if (!process.env.URL) {
      console.error('❌ URL 環境変数が設定されていません');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'URL設定エラー' }),
      };
    }

    console.log('💳 Stripe Checkout セッション作成開始');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.URL}/?success=true&product=${productId}`,
      cancel_url: `${process.env.URL}/?canceled=true`,
      metadata: { uid, productId },
    });

    console.log('✅ Checkout セッション作成成功:', session.id);
    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error('❌ Function エラー:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: err.message,
        type: err.type || 'unknown_error'
      }),
    };
  }
};






