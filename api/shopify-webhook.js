// /api/shopify-webhook.js

export default async function handler(req, res) {
  // 1. Only accept POST (Shopify sends webhooks as POST)
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 2. Get Shopify event type from header
  const eventType = req.headers["x-shopify-topic"]; // e.g. 'orders/create' or 'checkouts/update'
  const payload = req.body;

  // 3. Log payload for debug/demo
  console.log("Shopify Webhook Received:", eventType, payload);

  // 4. Handle Order Confirmation Webhook
  if (eventType === "orders/create") {
    const order = payload;
    const customer = order.customer || {};
    const phone = customer.phone || (customer.default_address && customer.default_address.phone) || "";
    const name = customer.first_name || "";
    const orderId = order.id || "";
    const amount = order.total_price || "";

    // -- Demo log (replace with WhatsApp API call)
    console.log(`Order Confirmation: Send WhatsApp to ${phone} for order ${orderId} by ${name}, amount: ${amount}`);
    // TODO: Call WhatsApp API here

    return res.status(200).json({ message: "Order confirmation webhook processed" });
  }

  // 5. Handle Abandoned Cart Webhook
  if (eventType === "checkouts/update") {
    const checkout = payload;
    const email = checkout.email || "";
    const phone = checkout.phone || "";
    const name = checkout.customer && checkout.customer.first_name;
    const cartToken = checkout.token || "";

    // -- Demo log (replace with WhatsApp API call)
    console.log(`Abandoned Cart: Send WhatsApp to ${phone || email} for cart ${cartToken} by ${name}`);
    // TODO: Call WhatsApp API here

    return res.status(200).json({ message: "Abandoned cart webhook processed" });
  }

  // 6. Unknown webhook type
  return res.status(200).json({ message: "Webhook received, event ignored." });
}
