const WATI_TOKEN = process.env.WATI_TOKEN;
const WATI_API_BASE = "https://live-mt-server.wati.io/465333/api/v1/sendTemplateMessage";

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

  const payload = req.body;
  const customer = payload.customer || {};
  const phoneRaw =
    customer.phone ||
    (customer.default_address && customer.default_address.phone) ||
    (payload.billing_address && payload.billing_address.phone) ||
    (payload.shipping_address && payload.shipping_address.phone) ||
    "";
  const phone = phoneRaw.replace(/^\+/, "");
  const name = customer.first_name || (payload.billing_address && payload.billing_address.first_name) || "";
  const orderId = payload.id || "";
  const amount = payload.total_price || "";
  const brand = "Gk Naturals";
  let productImageUrl = "";
  if (payload.line_items && payload.line_items.length > 0) {
    productImageUrl = payload.line_items[0].image_url || "";
  }

  if (!phone) {
    console.warn("No phone number found in payload. WhatsApp message not sent.");
    return res.status(200).json({ message: "No phone number. WhatsApp not sent." });
  }

  console.log(
    `Order Confirmation: Send WhatsApp to ${phone} for order ${orderId} by ${name}, amount: ${amount}`
  );

  const watiResult = await sendWatiMessage(
    phone,
    "order_confirmation_v2",
    [productImageUrl, name, orderId, amount, brand]
  );

  if (!watiResult.success) {
    console.error("WATI error:", watiResult);
  }

  return res.status(200).json({ message: "Order confirmation webhook processed", watiResult });
}
