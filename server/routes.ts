import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Stripe from "stripe";

// Integration: blueprint:javascript_stripe - Stripe payment processing
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Warning: STRIPE_SECRET_KEY not set. Stripe endpoints will fail.');
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  console.warn('Warning: STRIPE_WEBHOOK_SECRET not set. Webhook signature verification will fail.');
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

  // Stripe Checkout Sessions - Standard Plan (£35/mo, displayed as ~$45 USD)
  app.post("/api/create-standard-session", async (req, res) => {
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
                name: "Delegate Lens Standard Monthly",
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
      console.error("Stripe standard session error:", err);
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  // Stripe Checkout Sessions - Pro Plan (£69/mo, displayed as ~$89 USD)
  app.post("/api/create-pro-session", async (req, res) => {
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
                name: "Delegate Lens Pro Monthly",
                description: "Advanced features for power users"
              },
              unit_amount: 6900, // £69.00
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
      console.error("Stripe pro session error:", err);
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  // Stripe Checkout Sessions - Lifetime License (£349 one-time, displayed as ~$445 USD)
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

  // Stripe Webhook - Handle payment events
  app.post("/api/webhook", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(500).json({ error: "Webhook secret not configured" });
    }

    const sig = req.headers["stripe-signature"];
    
    if (!sig) {
      return res.status(400).json({ error: "Missing stripe-signature header" });
    }

    let event;
    try {
      // Use rawBody captured by express.json verify callback in server/index.ts
      event = stripe.webhooks.constructEvent(
        req.rawBody as Buffer,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        console.log("✅ Payment success:", {
          sessionId: session.id,
          customerEmail: session.customer_email,
          amountTotal: session.amount_total,
          mode: session.mode,
        });
        // Future: save customer info, send onboarding email, grant access
        break;

      case "customer.subscription.created":
        console.log("📝 Subscription created:", event.data.object.id);
        break;

      case "customer.subscription.updated":
        console.log("🔄 Subscription updated:", event.data.object.id);
        break;

      case "customer.subscription.deleted":
        console.log("❌ Subscription cancelled:", event.data.object.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  });

  const httpServer = createServer(app);

  return httpServer;
}
