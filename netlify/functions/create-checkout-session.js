// netlify/functions/create-checkout-session.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const PRICE_TABLE = {
  shakai_gakushu_5: "price_1S8aY2HzyxbrJMQOKjct926R", // ←控えたPrice IDに置き換える
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
      success_url: `${process.env.URL}/success`,
      cancel_url: `${process.env.URL}/cancel`,
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
