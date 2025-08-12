import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Home } from "@/pages/Home";
import { Tokens } from "@/pages/Tokens";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { initializeBuilder } from "@/lib/builder";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
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
      <TooltipProvider>
        <div className="min-h-screen gradient-bg">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
