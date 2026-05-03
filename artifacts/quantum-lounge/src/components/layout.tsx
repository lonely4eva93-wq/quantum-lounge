import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useGetAuthMe, useOwnerLogout, getGetAuthMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  LogOut, LayoutDashboard, Users, Grid, ListOrdered, Settings, Zap, ArrowRightLeft,
  MessageSquare, Home, Trophy, Menu, Crown, Calendar, Heart, Eye, Megaphone,
  Share2, Rocket, DollarSign, Lock, BarChart2,
} from "lucide-react";
import { Starfield } from "@/components/starfield";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from "@/components/ui/sheet";

export function OwnerLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const logout = useOwnerLogout({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAuthMeQueryKey() });
      },
    },
  });

  const navItems = [
    { href: "/owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/owner/analytics", label: "Analytics", icon: BarChart2 },
    { href: "/owner/revenue", label: "Revenue", icon: DollarSign },
    { href: "/owner/guests", label: "Guests", icon: Users },
    { href: "/owner/rooms", label: "Rooms", icon: Grid },
    { href: "/owner/events", label: "Events", icon: Calendar },
    { href: "/owner/vip", label: "VIP", icon: Crown },
    { href: "/owner/rentals", label: "Rentals", icon: Calendar },
    { href: "/owner/tips", label: "Tips", icon: Heart },
    { href: "/owner/sponsored", label: "Sponsored", icon: Megaphone },
    { href: "/owner/referrals", label: "Referrals", icon: Share2 },
    { href: "/owner/boosts", label: "Boosts", icon: Rocket },
    { href: "/owner/transactions", label: "Transactions", icon: ListOrdered },
    { href: "/owner/settings", label: "Settings", icon: Settings },
    { href: "/owner/security", label: "Security", icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="w-64 border-r border-border/50 bg-card/30 backdrop-blur-xl flex flex-col z-20 overflow-y-auto"
      >
        <div className="p-6 border-b border-border/50">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            <span className="font-display font-bold tracking-widest text-lg text-primary glow-text-primary uppercase">Control</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-md transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(0,243,255,0.15)]"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <button
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="flex items-center gap-3 px-4 py-3 rounded-md w-full text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Terminate Session</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
        <div className="relative z-10 p-8 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

export function PublicLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { data: auth } = useGetAuthMe();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Lobby", icon: Home },
    { href: "/rooms", label: "Rooms", icon: Grid },
    { href: "/leaderboard", label: "Rank", icon: Trophy },
    { href: "/stats", label: "Stats", icon: BarChart2 },
    { href: "/crypto", label: "XRP", icon: Zap },
    { href: "/messages", label: "Comms", icon: MessageSquare },
    { href: "/teleport", label: "Teleport", icon: ArrowRightLeft },
    { href: "/energy", label: "Energy", icon: Zap },
    { href: "/vip", label: "VIP", icon: Crown },
    { href: "/oracle", label: "Oracle", icon: Eye },
    { href: "/boost", label: "Boost", icon: Rocket },
    { href: "/referrals", label: "Refer", icon: Share2 },
    { href: "/premium-messages", label: "DM", icon: Lock },
    { href: "/events", label: "Events", icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Animated Starfield Background */}
      <Starfield />

      {/* Navbar */}
      <header className="border-b border-border/40 bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all">
                <Zap className="w-5 h-5 text-black" />
              </div>
              <span className="font-display font-bold tracking-[0.2em] text-xl glow-text-primary uppercase truncate max-w-[140px] sm:max-w-none">
                {auth?.loungeName || "Quantum Lounge"}
              </span>
            </div>
          </Link>

          {/* Desktop nav — scrollable if many items */}
          <nav className="hidden md:flex items-center gap-0.5 overflow-x-auto max-w-[600px]">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer whitespace-nowrap ${
                      isActive
                        ? "bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                        : "text-muted-foreground hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {auth?.isOwner ? (
              <Link href="/owner/dashboard">
                <div className="px-4 py-2 rounded border border-primary/50 text-primary text-sm font-bold uppercase tracking-wider hover:bg-primary/10 transition-colors cursor-pointer">
                  Control
                </div>
              </Link>
            ) : (
              <Link href="/owner">
                <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-white hover:border-white/50 transition-colors cursor-pointer">
                  <LayoutDashboard className="w-4 h-4" />
                </div>
              </Link>
            )}

            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  className="md:hidden flex items-center justify-center w-9 h-9 rounded border border-border/50 text-muted-foreground hover:text-white hover:border-primary/50 hover:bg-primary/10 transition-all duration-300"
                  aria-label="Open navigation menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-72 bg-background/95 backdrop-blur-xl border-r border-primary/20 p-0"
              >
                {/* Drawer header */}
                <div className="p-6 border-b border-border/40">
                  <SheetTitle className="sr-only">Navigation</SheetTitle>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.3)]">
                      <Zap className="w-5 h-5 text-black" />
                    </div>
                    <span className="font-display font-bold tracking-[0.2em] text-lg glow-text-primary uppercase">
                      {auth?.loungeName || "Quantum Lounge"}
                    </span>
                  </div>
                </div>

                {/* Drawer nav links */}
                <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
                  {navItems.map((item) => {
                    const isActive = location === item.href;
                    return (
                      <SheetClose asChild key={item.href}>
                        <Link href={item.href}>
                          <div
                            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-300 cursor-pointer ${
                              isActive
                                ? "bg-primary/15 text-primary border border-primary/30 shadow-[0_0_12px_rgba(0,243,255,0.12)]"
                                : "text-muted-foreground hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            <span className="font-medium tracking-wide">{item.label}</span>
                            {isActive && (
                              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(0,243,255,0.8)]" />
                            )}
                          </div>
                        </Link>
                      </SheetClose>
                    );
                  })}
                </nav>

                {/* Drawer footer */}
                {auth?.isOwner && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/40">
                    <SheetClose asChild>
                      <Link href="/owner/dashboard">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-md border border-primary/30 text-primary hover:bg-primary/10 transition-all duration-300 cursor-pointer">
                          <LayoutDashboard className="w-5 h-5" />
                          <span className="font-bold uppercase tracking-wider text-sm">Control Panel</span>
                        </div>
                      </Link>
                    </SheetClose>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        <motion.div
          key={location}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="h-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
