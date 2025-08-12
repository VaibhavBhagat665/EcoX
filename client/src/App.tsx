import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { Home } from "@/pages/Home";
import { Tokens } from "@/pages/Tokens";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { initializeBuilder } from "@/lib/builder";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/tokens" component={Tokens} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize Builder.io on app start
  useEffect(() => {
    initializeBuilder();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="min-h-screen gradient-bg">
            <Toaster />
            <Router />
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
