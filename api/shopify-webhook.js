const WATI_TOKEN = process.env.WATI_TOKEN;
const WATI_API_BASE = "https://live-mt-server.wati.io/465333/api/v1/sendTemplateMessage";

// Helper to send WhatsApp template message via WATI
async function sendWatiMessage(phone, templateName, templateData) {
  // WATI expects the POST data in the body as JSON, not in the URL!
  const body = {
    whatsappNumber: phone,
    template_name: templateName,
    broadcast_name: templateName, // Add broadcast_name, required by WATI!
    parameters: [
      { name: "product_image_url", value: templateData[0] }, // Map your template vars!
      { name: "1", value: templateData[1] },
      { name: "2", value: templateData[2] },
      { name: "3", value: templateData[3] },
      { name: "4", value: templateData[4] },
    ],
  };

  try {
    const response = await fetch(WATI_API_BASE, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WATI_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    console.log("WATI API response:", result);
    return result;
  } catch (err) {
    console.error("WATI fetch error:", err);
    return { success: false, error: err.message || err };
  }
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
  const name =
    customer.first_name ||
    (payload.billing_address && payload.billing_address.first_name) ||
    "";
  const orderId = payload.id || "";
  const amount = payload.total_price || "";
  const brand = "Gk Naturals";
  let productImageUrl = "";
  if (payload.line_items && payload.line_items.length > 0) {
    productImageUrl = payload.line_items[0].image_url || "";
  }

  if (!phone) {
    console.error("No phone number found in payload. WhatsApp message not sent.");
    return res.status(400).json({ message: "No phone number. WhatsApp not sent." });
  }

  console.log(
    `Order Confirmation: Send WhatsApp to ${phone} for order ${orderId} by ${name}, amount: ${amount}`
  );

  const watiResult = await sendWatiMessage(
    phone,
    "order_confirmation_v2",
    [productImageUrl, name, orderId, amount, brand]
  );

  // Some WATI API responses use `status: "success"` instead of success: true
  const isSuccess =
    watiResult.success === true ||
    watiResult.status === "success" ||
    (!watiResult.error && !watiResult.errors && watiResult.result !== false);

  if (!isSuccess) {
    console.error("WATI error:", watiResult);
    return res.status(500).json({ error: "Failed to send WhatsApp message", watiResult });
  }

  return res.status(200).json({ message: "Order confirmation webhook processed", watiResult });
}
