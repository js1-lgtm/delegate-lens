import { useState } from "react";
import { Link } from "wouter";

export default function Pricing() {
  const [loading, setLoading] = useState(false);

  async function handleCheckout(type: "standard" | "pro" | "lifetime") {
    setLoading(true);
    try {
      const endpointMap = {
        standard: "/api/create-standard-session",
        pro: "/api/create-pro-session",
        lifetime: "/api/create-lifetime-session",
      };
      const res = await fetch(endpointMap[type], { method: "POST" });
      
      if (!res.ok) {
        throw new Error("Failed to create checkout session");
      }
      
      const { url } = await res.json();
      window.location.href = url;
    } catch (error) {
      console.error("Checkout error:", error);
      setLoading(false);
      alert("Unable to start checkout. Please try again or contact support.");
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <Link href="/">
            <a className="text-sm text-muted-foreground/95 hover:text-foreground transition-colors mb-4 inline-block" data-testid="link-back-home">
              ← Back to Dashboard
            </a>
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-4" role="heading" aria-level={1}>
            Access Delegate Lens
          </h1>
          <p className="text-lg text-muted-foreground/95 max-w-2xl mx-auto">
            Choose the plan that fits your workflow
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          <div className="bg-card border border-card-border shadow-sm rounded-xl p-6 w-72 hover-elevate transition-all duration-200">
            <h2 className="text-2xl font-semibold text-card-foreground mb-2">Standard</h2>
            <p className="text-muted-foreground/95 mb-4">Essential executive dashboard</p>
            <p className="text-3xl font-bold text-card-foreground mb-6">
              $45<span className="text-base font-normal text-muted-foreground/95">/mo</span>
            </p>
            <button
              onClick={() => handleCheckout("standard")}
              disabled={loading}
              className="bg-foreground text-background px-6 py-3 rounded-lg w-full font-medium hover-elevate active-elevate-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-checkout-standard"
            >
              Start Standard
            </button>
          </div>

          <div className="bg-card border-2 border-primary shadow-lg rounded-xl p-6 w-72 hover-elevate transition-all duration-200 relative">
            <div className="absolute -top-3 right-6 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
              POPULAR
            </div>
            <h2 className="text-2xl font-semibold text-primary mb-2">Pro</h2>
            <p className="text-muted-foreground/95 mb-4">Priority access + analytics suite</p>
            <p className="text-3xl font-bold text-card-foreground mb-6">
              $89<span className="text-base font-normal text-muted-foreground/95">/mo</span>
            </p>
            <button
              onClick={() => handleCheckout("pro")}
              disabled={loading}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg w-full font-medium hover-elevate active-elevate-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-checkout-pro"
            >
              Upgrade to Pro
            </button>
          </div>

          <div className="bg-card border border-card-border shadow-sm rounded-xl p-6 w-72 hover-elevate transition-all duration-200">
            <h2 className="text-2xl font-semibold text-card-foreground mb-2">Lifetime</h2>
            <p className="text-muted-foreground/95 mb-4">Lifetime access, one-time payment</p>
            <p className="text-3xl font-bold text-card-foreground mb-6">
              $445<span className="text-base font-normal text-muted-foreground/95"> one-time</span>
            </p>
            <button
              onClick={() => handleCheckout("lifetime")}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-3 rounded-lg w-full font-medium hover-elevate active-elevate-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-checkout-lifetime"
            >
              Buy Lifetime
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
