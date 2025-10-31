import { CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

export default function Success() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" aria-hidden="true" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-4" role="heading" aria-level={1}>
          Payment Successful!
        </h1>
        
        <p className="text-lg text-muted-foreground/95 mb-8">
          Thank you for subscribing to Delegate Lens. Your payment has been processed successfully.
        </p>

        {sessionId && (
          <div className="bg-muted/20 border border-border/30 rounded-lg p-4 mb-8">
            <p className="text-xs text-muted-foreground/95 mb-1">Confirmation ID</p>
            <p className="text-sm font-mono text-foreground break-all" data-testid="text-session-id">
              {sessionId}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Link href="/">
            <a 
              className="block w-full bg-primary text-primary-foreground font-medium py-3 rounded-lg hover-elevate active-elevate-2 transition-all duration-200"
              data-testid="link-dashboard"
            >
              Go to Dashboard
            </a>
          </Link>
          
          <p className="text-sm text-muted-foreground/95">
            A confirmation email has been sent to your inbox.
          </p>
        </div>
      </div>
    </div>
  );
}
