// 改善版: オリジン検証を追加したバージョン
// このファイルは参考実装です。実際の実装前に環境変数やドメインを確認してください。

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const PRICE_TABLE = {
  rika_gakushu_4: "price_1S8xZZHzyxbrJMQOeoaqM3JU", // 小4理科
  shakai_gakushu_4: "price_1S8xYIHzyxbrJMQOB52QlIdr", // 小4社会
  rika_gakushu_5: "price_1S8xZxHzyxbrJMQOWQpTsRzD", // 小5理科
  shakai_gakushu_5: "price_1S8aY2HzyxbrJMQOKjct926R", // 小5社会
  rika_gakushu_6: "price_1S8xaIHzyxbrJMQOO3zKSz4I", // 小6理科
  shakai_gakushu_6: "price_1S8xYuHzyxbrJMQOKg7dBPI2", // 小6社会
};

// 許可するオリジンのリスト
// 環境変数から取得するか、直接指定
const getAllowedOrigins = () => {
  // 環境変数から取得（推奨）
  if (process.env.ALLOWED_ORIGINS) {
    return process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
  }
  
  // デフォルト値（実際のドメインに置き換える）
  return [
    'https://your-site.netlify.app',
    'https://www.your-site.netlify.app',
    // 開発環境用（本番では削除または環境変数で管理）
    'http://localhost:8888',
    'http://127.0.0.1:8888',
  ];
};

// オリジンの検証
const isAllowedOrigin = (origin, allowedOrigins) => {
  if (!origin) {
    // オリジンがない場合（同一オリジンからのリクエスト）は許可
    return true;
  }
  return allowedOrigins.includes(origin);
};

exports.handler = async (event) => {
  const allowedOrigins = getAllowedOrigins();
  const origin = event.headers.origin || event.headers.Origin || '';
  const isAllowed = isAllowedOrigin(origin, allowedOrigins);
  
  // CORSヘッダーを設定
  const headers = {
    'Access-Control-Allow-Origin': isAllowed ? (origin || allowedOrigins[0]) : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // OPTIONSリクエスト（プリフライト）への対応
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // オリジンが許可されていない場合（同一オリジンでない場合のみチェック）
  if (origin && !isAllowed) {
    console.warn('⚠️ 許可されていないオリジンからのアクセス:', {
      origin,
      allowedOrigins,
      referer: event.headers.referer || event.headers.Referer,
      ip: event.headers['x-forwarded-for'] || event.requestContext?.identity?.sourceIp,
    });
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ 
        error: 'Origin not allowed',
        message: 'このリクエストは許可されていないオリジンから送信されました。'
      }),
    };
  }

  try {
    console.log('🔍 Function開始 - event:', {
      httpMethod: event.httpMethod,
      origin: origin || 'same-origin',
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
        headers,
        body: JSON.stringify({ error: 'リクエストボディが必要です' }),
      };
    }

    const { productId, uid } = JSON.parse(event.body);
    console.log('📦 受信データ:', { productId, uid, origin: origin || 'same-origin' });

    // 必須パラメータの検証
    if (!productId || !uid) {
      console.error('❌ 必須パラメータが不足:', { productId: !!productId, uid: !!uid });
      return {
        statusCode: 400,
        headers,
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
        headers,
        body: JSON.stringify({ error: `無効なproductId: ${productId}` }),
      };
    }

    console.log('✅ Price ID確認:', { productId, priceId });

    // 環境変数の確認
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY が設定されていません');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Stripe設定エラー' }),
      };
    }

    if (!process.env.URL) {
      console.error('❌ URL 環境変数が設定されていません');
      return {
        statusCode: 500,
        headers,
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
      headers,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error('❌ Function エラー:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: err.message,
        type: err.type || 'unknown_error'
      }),
    };
  }
};

