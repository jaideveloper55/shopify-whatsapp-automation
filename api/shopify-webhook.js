const WATI_TOKEN = process.env.WATI_TOKEN;
const WATI_API_BASE = "https://live-mt-server.wati.io/465333/api/v1/sendTemplateMessage";

async function sendWatiMessage(phone, templateName, templateData) {
    const body = {
      whatsappNumber: phone,
      template_name: templateName,
      broadcast_name: templateName,
      parameters: [
        { name: "product_image_url", value: templateData[0] },
        { name: "1", value: templateData[1] },
        { name: "2", value: templateData[2] },
        { name: "3", value: templateData[3] },
        { name: "4", value: templateData[4] },
      ]
    };
  
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
  }
  
