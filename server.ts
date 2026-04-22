import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Stripe lazily
  let stripe: Stripe | null = null;
  const getStripe = () => {
    if (!stripe) {
      const key = process.env.STRIPE_SECRET_KEY;
      if (!key) {
        throw new Error("STRIPE_SECRET_KEY is required for payments");
      }
      stripe = new Stripe(key);
    }
    return stripe;
  };

  // Initialize Gemini AI lazily
  let genAI: any = null;
  const getGemini = async () => {
    if (!genAI) {
      const { GoogleGenAI } = await import("@google/genai");
      const key = process.env.GEMINI_API_KEY;
      if (!key) {
        throw new Error("GEMINI_API_KEY is required for AI features");
      }
      genAI = new GoogleGenAI({ apiKey: key });
    }
    return genAI;
  };

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // AI Proxy Endpoints
  app.post("/api/ai/layout", async (req, res) => {
    try {
      const { prompt, style, schema } = req.body;
      const ai = await getGemini();
      
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview", 
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: schema
        }
      });

      const responseText = result.text;
      if (!responseText) throw new Error("Empty AI response");
      res.json(JSON.parse(responseText.replace(/```json\n?|```/g, '').trim()));
    } catch (error: any) {
      console.error("AI Layout Proxy Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/interior", async (req, res) => {
    try {
      const { image, prompt, schema } = req.body;
      const ai = await getGemini();

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { mimeType: "image/jpeg", data: image } },
              { text: prompt }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: schema
        }
      });

      const responseText = result.text;
      if (!responseText) throw new Error("Empty AI response");
      res.json(JSON.parse(responseText.replace(/```json\n?|```/g, '').trim()));
    } catch (error: any) {
      console.error("AI Interior Proxy Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, systemInstruction } = req.body;
      const ai = await getGemini();

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: matchMessage(message),
        config: {
          systemInstruction: systemInstruction
        }
      });

      res.json({ text: result.text });
    } catch (error: any) {
      console.error("AI Chat Proxy Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  function matchMessage(message: string | any[]) {
    if (typeof message === 'string') return [{ role: 'user', parts: [{ text: message }] }];
    return message;
  }

  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, currency = 'usd', planId } = req.body;
      
      const stripeClient = getStripe();
      const paymentIntent = await stripeClient.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects cents
        currency,
        metadata: { planId },
        automatic_payment_methods: { enabled: true },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Stripe Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
