const WATI_TOKEN = process.env.WATI_TOKEN;
const WATI_API_BASE = "https://live-mt-server.wati.io/465333/api/v1/sendTemplateMessage";

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

  // ---- TEST MESSAGE SECTION ----
  // REMOVE this after testing!
  const watiResult = await sendWatiMessage(
    "917448748233", // India country code, without +
    "order_confirmation_v2",
    [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb", // dummy image url or ""
      "jai",      // name
      "123456",   // order id
      "32.70",    // amount
      "Gk Naturals" // brand
    ]
  );
  console.log("Order Confirmation WhatsApp result (test):", watiResult);

  return res.status(200).json({ message: "Test WhatsApp sent", watiResult });
}
