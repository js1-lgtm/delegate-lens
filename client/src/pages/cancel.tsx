import { XCircle } from "lucide-react";
import { Link } from "wouter";

export default function Cancel() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-muted/20 flex items-center justify-center">
            <XCircle className="w-12 h-12 text-muted-foreground" aria-hidden="true" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-4" role="heading" aria-level={1}>
          Payment Cancelled
        </h1>
        
        <p className="text-lg text-muted-foreground/95 mb-8">
          No charges were made. You can try again anytime you're ready.
        </p>

        <div className="space-y-3">
          <Link href="/pricing">
            <a 
              className="block w-full bg-primary text-primary-foreground font-medium py-3 rounded-lg hover-elevate active-elevate-2 transition-all duration-200"
              data-testid="link-try-again"
            >
              Try Again
            </a>
          </Link>
          
          <Link href="/">
            <a 
              className="block w-full text-foreground font-medium py-3 rounded-lg border border-border/30 hover-elevate active-elevate-2 transition-all duration-200"
              data-testid="link-dashboard"
            >
              Back to Dashboard
            </a>
          </Link>
        </div>

        <p className="text-sm text-muted-foreground/95 mt-8">
          Have questions? Contact our support team anytime.
        </p>
      </div>
    </div>
  );
}
