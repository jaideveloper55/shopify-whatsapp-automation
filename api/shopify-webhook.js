const WATI_TOKEN = process.env.WATI_TOKEN;
const WATI_API_BASE =
  "https://live-mt-server.wati.io/465333/api/v1/sendTemplateMessage";

// Helper to send WhatsApp template message via WATI
async function sendWatiMessage(phone, templateName, templateData) {
  const url = `${WATI_API_BASE}?whatsappNumber=${phone}&template_name=${templateName}&template_data=${encodeURIComponent(
    JSON.stringify(templateData)
  )}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WATI_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
  const result = await response.json();
  console.log("WATI API response:", result);
  return result;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const eventType = req.headers["x-shopify-topic"];
  const payload = req.body;
  console.log("Shopify Webhook Received:", eventType, payload);

  try {
    // --- Order Confirmation
    if (eventType === "orders/create") {
      const order = payload;
      const customer = order.customer || {};
      const phoneRaw =
        customer.phone ||
        (customer.default_address && customer.default_address.phone) ||
        (order.billing_address && order.billing_address.phone) ||
        (order.shipping_address && order.shipping_address.phone) ||
        "";
      const phone = phoneRaw.replace(/^\+/, "");
      const name =
        customer.first_name ||
        (order.billing_address && order.billing_address.first_name) ||
        "";
      const orderId = order.id || "";
      const amount = order.total_price || "";
      const brand = "Gk Naturals";

      // Try to get the first product image from line_items (Shopify may not always send it)
      let productImageUrl = "";
      if (order.line_items && order.line_items.length > 0) {
        productImageUrl = order.line_items[0].image_url || ""; // If not present, leave as ""
      }

      // Adjust argument order as per your WATI template variables
      const watiResult = await sendWatiMessage(phone, "order_confirmation_v2", [
        productImageUrl,
        name,
        orderId,
        amount,
        brand,
      ]);
      console.log("Order Confirmation WhatsApp result:", watiResult);

      return res
        .status(200)
        .json({ message: "Order confirmation webhook processed" });
    }

    // --- Abandoned Cart
    if (eventType === "checkouts/update") {
      const checkout = payload;
      const email = checkout.email || "";
      const phoneRaw =
        checkout.phone || (checkout.customer && checkout.customer.phone) || "";
      const phone = phoneRaw.replace(/^\+/, "");
      const name = (checkout.customer && checkout.customer.first_name) || "";
      const brand = "Gk Naturals";

      // Abandoned cart template (assumes no image)
      const watiResult = await sendWatiMessage(phone, "abandoned_cart_v2", [
        name,
        brand,
      ]);
      console.log("Abandoned Cart WhatsApp result:", watiResult);

      return res
        .status(200)
        .json({ message: "Abandoned cart webhook processed" });
    }
  } catch (err) {
    console.error("Failed to send WhatsApp:", err);
    return res.status(500).json({ error: "Failed to send WhatsApp message" });
  }

  return res.status(200).json({ message: "Webhook received, event ignored." });
}

