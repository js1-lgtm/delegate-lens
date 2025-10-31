import { useState } from "react";
import { CreditCard, Zap, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

export default function Pricing() {
  const [loading, setLoading] = useState<"subscription" | "lifetime" | null>(null);

  async function handleCheckout(type: "subscription" | "lifetime") {
    setLoading(type);
    try {
      const endpoint =
        type === "lifetime"
          ? "/api/create-lifetime-session"
          : "/api/create-subscription-session";
      
      const res = await fetch(endpoint, { method: "POST" });
      
      if (!res.ok) {
        throw new Error("Failed to create checkout session");
      }
      
      const { url } = await res.json();
      window.location.href = url;
    } catch (error) {
      console.error("Checkout error:", error);
      setLoading(null);
      alert("Unable to start checkout. Please try again or contact support.");
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <Link href="/">
            <a className="text-sm text-muted-foreground/95 hover:text-foreground transition-colors mb-4 inline-block" data-testid="link-back-home">
              ← Back to Dashboard
            </a>
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-4" role="heading" aria-level={1}>
            Choose Your Delegate Lens Plan
          </h1>
          <p className="text-lg text-muted-foreground/95 max-w-2xl mx-auto">
            Unlock calm, focused task delegation with either a flexible monthly subscription or lifetime access.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly Subscription Card */}
          <div className="bg-card border border-card-border rounded-xl p-8 hover-elevate transition-all duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-card-foreground">Monthly</h2>
                <p className="text-sm text-muted-foreground/95">Flexible subscription</p>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-card-foreground">£35</span>
                <span className="text-muted-foreground/95">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm text-muted-foreground/95">Full access to all features</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm text-muted-foreground/95">Cancel anytime</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm text-muted-foreground/95">Cognitive Trace metrics</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm text-muted-foreground/95">Focus & Presentation modes</span>
              </li>
            </ul>

            <button
              className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-lg hover-elevate active-elevate-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading !== null}
              onClick={() => handleCheckout("subscription")}
              data-testid="button-checkout-subscription"
            >
              {loading === "subscription" ? "Loading..." : "Start Monthly"}
            </button>
          </div>

          {/* Lifetime License Card */}
          <div className="bg-card border-2 border-primary/40 rounded-xl p-8 hover-elevate transition-all duration-200 relative">
            <div className="absolute -top-3 right-6 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
              BEST VALUE
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-card-foreground">Lifetime</h2>
                <p className="text-sm text-muted-foreground/95">One-time payment</p>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-card-foreground">£349</span>
                <span className="text-muted-foreground/95">forever</span>
              </div>
              <p className="text-xs text-muted-foreground/95 mt-2">Pay once, own it forever</p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm text-muted-foreground/95">All monthly features included</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm text-muted-foreground/95">Lifetime updates & support</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm text-muted-foreground/95">Priority feature requests</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm text-muted-foreground/95">No recurring charges ever</span>
              </li>
            </ul>

            <button
              className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-lg hover-elevate active-elevate-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading !== null}
              onClick={() => handleCheckout("lifetime")}
              data-testid="button-checkout-lifetime"
            >
              {loading === "lifetime" ? "Loading..." : "Buy Lifetime"}
            </button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground/95">
            Secure payment processing by Stripe · All prices in GBP
          </p>
        </div>
      </div>
    </div>
  );
}
