import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Results from "@/pages/results";
import Workout from "@/pages/workout";
import History from "@/pages/history";
import Stats from "@/pages/stats";
import Dashboard from "@/pages/dashboard";
import Calculator from "@/pages/calculator";
import Measurements from "@/pages/measurements";
import Goals from "@/pages/goals";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/results" component={Results} />
      <Route path="/workout" component={Workout} />
      <Route path="/history" component={History} />
      <Route path="/stats" component={Stats} />
      <Route path="/calculator" component={Calculator} />
      <Route path="/measurements" component={Measurements} />
      <Route path="/goals" component={Goals} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </WouterRouter>
  );
}

export default App;
