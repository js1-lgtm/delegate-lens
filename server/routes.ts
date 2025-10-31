import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Stripe from "stripe";

// Integration: blueprint:javascript_stripe - Stripe payment processing
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Warning: STRIPE_SECRET_KEY not set. Stripe endpoints will fail.');
}

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Get base URL from environment or use Replit domain
  const getBaseUrl = () => {
    if (process.env.REPLIT_DOMAINS) {
      const domains = process.env.REPLIT_DOMAINS.split(',');
      return `https://${domains[0]}`;
    }
    return 'http://localhost:5000';
  };

  // Stripe Checkout Sessions - Monthly Subscription (£35/mo)
  app.post("/api/create-subscription-session", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    try {
      const baseUrl = getBaseUrl();
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "gbp",
              product_data: { 
                name: "Delegate Lens Monthly Subscription",
                description: "Access to Delegate Lens task delegation dashboard"
              },
              unit_amount: 3500, // £35.00
              recurring: { interval: "month" },
            },
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/cancel`,
      });
      
      res.json({ url: session.url });
    } catch (err: any) {
      console.error("Stripe subscription session error:", err);
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  // Stripe Checkout Sessions - Lifetime License (£349 one-time)
  app.post("/api/create-lifetime-session", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    try {
      const baseUrl = getBaseUrl();
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "gbp",
              product_data: { 
                name: "Delegate Lens Lifetime License",
                description: "Lifetime access to Delegate Lens with all future updates"
              },
              unit_amount: 34900, // £349.00
            },
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/cancel`,
      });
      
      res.json({ url: session.url });
    } catch (err: any) {
      console.error("Stripe lifetime session error:", err);
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
