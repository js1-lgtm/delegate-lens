import { Route, Switch } from "wouter";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import Dashboard from "./pages/Dashboard";
import Pricing from "./pages/Pricing";
import Success from "./pages/Success";
import Cancel from "./pages/Cancel";

export default function App() {
  return (
    <>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/success" component={Success} />
        <Route path="/cancel" component={Cancel} />
        <Route>
          {() => (
            <div className="min-h-screen bg-background flex items-center justify-center px-6">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-foreground mb-4">404 - Page Not Found</h1>
                <p className="text-muted-foreground/95 mb-6">The page you're looking for doesn't exist.</p>
                <a 
                  href="/" 
                  className="inline-block bg-primary text-primary-foreground font-medium px-6 py-3 rounded-lg hover-elevate active-elevate-2 transition-all duration-200"
                >
                  Go to Dashboard
                </a>
              </div>
            </div>
          )}
        </Route>
      </Switch>
      <SpeedInsights />
      <Analytics />
    </>
  );
}
