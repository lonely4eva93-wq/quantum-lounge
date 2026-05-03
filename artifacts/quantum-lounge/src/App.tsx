import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useGetAuthMe } from "@workspace/api-client-react";
import NotFound from "@/pages/not-found";
import { ErrorBoundary } from "@/components/error-boundary";

import { PublicLayout, OwnerLayout } from "@/components/layout";

// Public Pages
import Home from "@/pages/home";
import Rooms from "@/pages/rooms";
import Messages from "@/pages/messages";
import Teleport from "@/pages/teleport";
import Energy from "@/pages/energy";
import Leaderboard from "@/pages/leaderboard";
import Vip from "@/pages/vip";
import Oracle from "@/pages/oracle";
import Boost from "@/pages/boost";
import Referrals from "@/pages/referrals";
import PremiumMessages from "@/pages/premium-messages";
import Events from "@/pages/events";
import GuestProfilePage from "@/pages/guest-profile-page";
import StatsPage from "@/pages/stats";

// Owner Pages
import OwnerLogin from "@/pages/owner/login";
import Dashboard from "@/pages/owner/dashboard";
import OwnerGuests from "@/pages/owner/guests";
import OwnerRooms from "@/pages/owner/rooms";
import OwnerTransactions from "@/pages/owner/transactions";
import OwnerSettings from "@/pages/owner/settings";
import OwnerRevenue from "@/pages/owner/revenue";
import OwnerVip from "@/pages/owner/vip";
import OwnerRentals from "@/pages/owner/rentals";
import OwnerTips from "@/pages/owner/tips";
import OwnerSponsored from "@/pages/owner/sponsored";
import OwnerReferrals from "@/pages/owner/referrals";
import OwnerBoosts from "@/pages/owner/boosts";
import OwnerAnalytics from "@/pages/owner/analytics";
import OwnerEventsPage from "@/pages/owner/owner-events";
import OwnerSecurity from "@/pages/owner/security";
import LegalPage from "@/pages/legal";
import NdaPage from "@/pages/nda";
import SmartContractsPage from "@/pages/smart-contracts";
import PitchPage from "@/pages/pitch";
import CryptoPage from "@/pages/crypto";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
    },
  },
});

function ProtectedRoute({ component: Component }: { component: any }) {
  const { data: auth, isLoading } = useGetAuthMe();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-t-2 border-primary border-r-2 animate-spin"></div>
      </div>
    );
  }

  if (!auth?.isOwner) {
    return <Redirect to="/owner" />;
  }

  return (
    <OwnerLayout>
      <ErrorBoundary>
        <Component />
      </ErrorBoundary>
    </OwnerLayout>
  );
}

function PublicRoute({ component: Component }: { component: any }) {
  return (
    <PublicLayout>
      <ErrorBoundary>
        <Component />
      </ErrorBoundary>
    </PublicLayout>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={() => <PublicRoute component={Home} />} />
      <Route path="/rooms" component={() => <PublicRoute component={Rooms} />} />
      <Route path="/leaderboard" component={() => <PublicRoute component={Leaderboard} />} />
      <Route path="/messages" component={() => <PublicRoute component={Messages} />} />
      <Route path="/teleport" component={() => <PublicRoute component={Teleport} />} />
      <Route path="/energy" component={() => <PublicRoute component={Energy} />} />
      <Route path="/vip" component={() => <PublicRoute component={Vip} />} />
      <Route path="/oracle" component={() => <PublicRoute component={Oracle} />} />
      <Route path="/boost" component={() => <PublicRoute component={Boost} />} />
      <Route path="/referrals" component={() => <PublicRoute component={Referrals} />} />
      <Route path="/premium-messages" component={() => <PublicRoute component={PremiumMessages} />} />
      <Route path="/events" component={() => <PublicRoute component={Events} />} />
      <Route path="/guest/:id" component={() => <PublicRoute component={GuestProfilePage} />} />
      <Route path="/stats" component={() => <PublicRoute component={StatsPage} />} />

      {/* Owner Auth */}
      <Route path="/owner" component={OwnerLogin} />

      {/* Owner Protected Routes */}
      <Route path="/owner/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/owner/guests" component={() => <ProtectedRoute component={OwnerGuests} />} />
      <Route path="/owner/rooms" component={() => <ProtectedRoute component={OwnerRooms} />} />
      <Route path="/owner/transactions" component={() => <ProtectedRoute component={OwnerTransactions} />} />
      <Route path="/owner/settings" component={() => <ProtectedRoute component={OwnerSettings} />} />
      <Route path="/owner/revenue" component={() => <ProtectedRoute component={OwnerRevenue} />} />
      <Route path="/owner/vip" component={() => <ProtectedRoute component={OwnerVip} />} />
      <Route path="/owner/rentals" component={() => <ProtectedRoute component={OwnerRentals} />} />
      <Route path="/owner/tips" component={() => <ProtectedRoute component={OwnerTips} />} />
      <Route path="/owner/sponsored" component={() => <ProtectedRoute component={OwnerSponsored} />} />
      <Route path="/owner/referrals" component={() => <ProtectedRoute component={OwnerReferrals} />} />
      <Route path="/owner/boosts" component={() => <ProtectedRoute component={OwnerBoosts} />} />
      <Route path="/owner/analytics" component={() => <ProtectedRoute component={OwnerAnalytics} />} />
      <Route path="/owner/events" component={() => <ProtectedRoute component={OwnerEventsPage} />} />
      <Route path="/owner/security" component={() => <ProtectedRoute component={OwnerSecurity} />} />

      <Route path="/legal" component={LegalPage} />
      <Route path="/nda" component={NdaPage} />
      <Route path="/smart-contracts" component={SmartContractsPage} />
      <Route path="/crypto" component={() => <PublicRoute component={CryptoPage} />} />
      <Route path="/pitch" component={PitchPage} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
