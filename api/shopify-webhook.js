// api/shopify-webhook.js
// Shopify llama a esta URL automáticamente cada vez que se paga un pedido.
// Esta función agrega el email del comprador a la tabla "compradores" de Supabase,
// dándole acceso automático a la app. No requiere ningún servicio de email.

import crypto from "crypto";

export const config = {
  api: { bodyParser: false },
};

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).send("Method not allowed");
    return;
  }

  try {
    const rawBody = await readRawBody(req);

    // Verificamos que el pedido realmente viene de Shopify (no de cualquiera)
    const hmacHeader = req.headers["x-shopify-hmac-sha256"];
    const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
    const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("base64");

    if (digest !== hmacHeader) {
      res.status(401).send("Firma inválida");
      return;
    }

    const order = JSON.parse(rawBody.toString("utf8"));
    const email = (order.email || order.contact_email || order.customer?.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      res.status(200).json({ ok: true, skipped: "sin email en el pedido" });
      return;
    }

    // Agregamos (o actualizamos) el comprador en Supabase usando la clave
    // secreta de servidor, que nunca se expone al navegador.
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const resp = await fetch(`${supabaseUrl}/rest/v1/compradores`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify([{ email }]),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("Error insertando en Supabase:", text);
      res.status(500).json({ ok: false });
      return;
    }

    res.status(200).json({ ok: true, email });
  } catch (err) {
    console.error("Error en el webhook:", err);
    res.status(500).json({ ok: false });
  }
}
