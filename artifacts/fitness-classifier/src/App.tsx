import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore } from "@/lib/auth-store";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
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

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const [, setLocation] = useLocation();
  const token = useAuthStore(s => s.token);
  if (!token) {
    setTimeout(() => setLocation("/login"), 0);
    return null;
  }
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/" component={() => <ProtectedRoute component={Home} />} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/results" component={() => <ProtectedRoute component={Results} />} />
      <Route path="/workout" component={() => <ProtectedRoute component={Workout} />} />
      <Route path="/history" component={() => <ProtectedRoute component={History} />} />
      <Route path="/stats" component={() => <ProtectedRoute component={Stats} />} />
      <Route path="/calculator" component={() => <ProtectedRoute component={Calculator} />} />
      <Route path="/measurements" component={() => <ProtectedRoute component={Measurements} />} />
      <Route path="/goals" component={() => <ProtectedRoute component={Goals} />} />
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
