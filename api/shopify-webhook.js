const WATI_TOKEN = process.env.WATI_TOKEN;
const WATI_API_BASE =
  "https://live-mt-server.wati.io/465333/api/v1/sendTemplateMessage";

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
    if (eventType === "orders/create") {
      const order = payload;
      const customer = order.customer || {};
      const phoneRaw =
        customer.phone ||
        (customer.default_address && customer.default_address.phone) ||
        "";
      const phone = phoneRaw.replace(/^\+/, "");
      const name = customer.first_name || "";
      const orderId = order.id || "";
      const amount = order.total_price || "";
      const brand = "Gk Naturals";

      const watiResult = await sendWatiMessage(phone, "order_confirmation_v2", [
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

    if (eventType === "checkouts/update") {
      const checkout = payload;
      const email = checkout.email || "";
      const phoneRaw = checkout.phone || "";
      const phone = phoneRaw.replace(/^\+/, "");
      const name = (checkout.customer && checkout.customer.first_name) || "";
      const brand = "Gk Naturals";

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
