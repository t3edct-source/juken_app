// netlify/functions/create-checkout-session.js
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
  try {
    const { productId, uid } = JSON.parse(event.body);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: PRICE_TABLE[productId],
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.URL}/?success=true&product=${productId}`,
      cancel_url: `${process.env.URL}/?canceled=true`,
      metadata: { uid, productId },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
