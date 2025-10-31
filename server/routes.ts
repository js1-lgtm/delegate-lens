import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Stripe from "stripe";

// Integration: blueprint:javascript_stripe - Stripe payment processing
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Warning: STRIPE_SECRET_KEY not set. Stripe endpoints will fail.');
}

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-10-29.clover",
    })
  : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Stripe Checkout Sessions - Monthly Subscription (£35/mo)
  app.post("/api/create-subscription-session", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    try {
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
        success_url: `${req.headers.origin || 'http://localhost:5000'}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin || 'http://localhost:5000'}/cancel`,
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
        success_url: `${req.headers.origin || 'http://localhost:5000'}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin || 'http://localhost:5000'}/cancel`,
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
