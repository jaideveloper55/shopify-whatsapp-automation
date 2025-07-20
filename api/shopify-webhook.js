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
  const watiResult = await sendWatiMessage(
    "917448748233", // <- hardcoded phone
    "order_confirmation_v2",
    [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
      "jai",
      "123456",
      "32.70",
      "Gk Naturals"
    ]
  );
  console.log("WATI API response:", watiResult);
  return res.status(200).json({ message: "Test WhatsApp sent", watiResult });
}
