// api/shopify-webhook.js

export default function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
    const data = req.body;
    console.log("Shopify webhook data:", data);

    res.status(200).json({ message: "Webhook received" });
  }
  