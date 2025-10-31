import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Stripe from "stripe";
import nodemailer from "nodemailer";

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

// Email configuration - Create transporter if email credentials are available
const createEmailTransporter = () => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Warning: Email credentials not set. Confirmation emails will not be sent.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '465'),
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const emailTransporter = createEmailTransporter();

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
        metadata: {
          plan: "standard",
          plan_name: "Delegate Lens Standard Monthly"
        }
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
        metadata: {
          plan: "pro",
          plan_name: "Delegate Lens Pro Monthly"
        }
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
        metadata: {
          plan: "lifetime",
          plan_name: "Delegate Lens Lifetime License"
        }
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
        
        // Send confirmation email
        const customerEmail = session.customer_details?.email || session.customer_email;
        if (customerEmail && emailTransporter) {
          try {
            // Determine product name from metadata (robust against price changes, taxes, coupons)
            let productName = session.metadata?.plan_name || "Delegate Lens Access";
            const planType = session.metadata?.plan || "unknown";

            await emailTransporter.sendMail({
              from: `"Delegate Lens" <${process.env.EMAIL_USER}>`,
              to: customerEmail,
              subject: "Welcome to Delegate Lens - Your Access is Confirmed",
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Welcome to Delegate Lens</h1>
                  </div>
                  
                  <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                    <p style="font-size: 16px; margin-bottom: 20px;">Thank you for your purchase of <strong>${productName}</strong>.</p>
                    
                    <p style="font-size: 16px; margin-bottom: 20px;">You now have access to your Delegate Lens dashboard, designed for cognitive clarity and focused task delegation.</p>
                    
                    <div style="background: #f9fafb; border-left: 4px solid #667eea; padding: 16px; margin: 30px 0; border-radius: 4px;">
                      <p style="margin: 0; font-size: 14px; color: #4b5563;">
                        <strong>Next Steps:</strong><br>
                        Access your dashboard at: <a href="${getBaseUrl()}" style="color: #667eea; text-decoration: none;">${getBaseUrl()}</a>
                      </p>
                    </div>
                    
                    <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                      This is an automated confirmation email. If you have any questions or need assistance, please don't hesitate to reach out.
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                    
                    <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
                      © ${new Date().getFullYear()} Delegate Lens. All rights reserved.
                    </p>
                  </div>
                </body>
                </html>
              `,
            });
            
            console.log("📧 Confirmation email sent to:", customerEmail);
          } catch (mailErr: any) {
            console.error("❌ Email send error:", mailErr.message);
          }
        } else if (!emailTransporter) {
          console.log("⚠️ Email transporter not configured, skipping confirmation email");
        }
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
