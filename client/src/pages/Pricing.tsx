import { useState } from "react";
import { CreditCard, Zap, Star, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

export default function Pricing() {
  const [loading, setLoading] = useState<"standard" | "pro" | "lifetime" | null>(null);

  async function handleCheckout(type: "standard" | "pro" | "lifetime") {
    setLoading(type);
    try {
      const endpoint =
        type === "lifetime"
          ? "/api/create-lifetime-session"
          : type === "pro"
          ? "/api/create-pro-session"
          : "/api/create-standard-session";
      
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
      <div className="max-w-7xl w-full">
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
            Unlock calm, focused task delegation with flexible pricing to match your needs.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Standard Plan */}
          <div className="bg-card border border-card-border rounded-xl p-8 hover-elevate transition-all duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-card-foreground">Standard</h2>
                <p className="text-sm text-muted-foreground/95">For individuals</p>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-card-foreground">$45</span>
                <span className="text-muted-foreground/95">/month</span>
              </div>
              <p className="text-xs text-muted-foreground/95 mt-1">Billed as £35/mo</p>
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
              onClick={() => handleCheckout("standard")}
              data-testid="button-checkout-standard"
            >
              {loading === "standard" ? "Loading..." : "Start Standard"}
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-card border-2 border-primary/40 rounded-xl p-8 hover-elevate transition-all duration-200 relative">
            <div className="absolute -top-3 right-6 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
              POPULAR
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Star className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-card-foreground">Pro</h2>
                <p className="text-sm text-muted-foreground/95">For power users</p>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-card-foreground">$89</span>
                <span className="text-muted-foreground/95">/month</span>
              </div>
              <p className="text-xs text-muted-foreground/95 mt-1">Billed as £69/mo</p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm text-muted-foreground/95">Everything in Standard</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm text-muted-foreground/95">Advanced analytics</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm text-muted-foreground/95">Priority support</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm text-muted-foreground/95">Early access to new features</span>
              </li>
            </ul>

            <button
              className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-lg hover-elevate active-elevate-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading !== null}
              onClick={() => handleCheckout("pro")}
              data-testid="button-checkout-pro"
            >
              {loading === "pro" ? "Loading..." : "Start Pro"}
            </button>
          </div>

          {/* Lifetime License */}
          <div className="bg-card border border-card-border rounded-xl p-8 hover-elevate transition-all duration-200">
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
                <span className="text-4xl font-bold text-card-foreground">$445</span>
                <span className="text-muted-foreground/95">forever</span>
              </div>
              <p className="text-xs text-muted-foreground/95 mt-1">Billed as £349 once</p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm text-muted-foreground/95">Everything in Pro</span>
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
            Secure payment processing by Stripe · Prices displayed in USD, charged in GBP
          </p>
        </div>
      </div>
    </div>
  );
}
