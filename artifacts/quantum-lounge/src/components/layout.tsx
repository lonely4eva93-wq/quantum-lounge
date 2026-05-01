import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useGetAuthMe, useOwnerLogout, getGetAuthMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, LayoutDashboard, Users, Grid, ListOrdered, Settings, Zap, ArrowRightLeft, MessageSquare, Home } from "lucide-react";

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
    { href: "/owner/guests", label: "Guests", icon: Users },
    { href: "/owner/rooms", label: "Rooms", icon: Grid },
    { href: "/owner/transactions", label: "Transactions", icon: ListOrdered },
    { href: "/owner/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="w-64 border-r border-border/50 bg-card/30 backdrop-blur-xl flex flex-col z-20"
      >
        <div className="p-6 border-b border-border/50">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            <span className="font-display font-bold tracking-widest text-lg text-primary glow-text-primary uppercase">Control</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(0,243,255,0.15)]"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
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

  const navItems = [
    { href: "/", label: "Lobby", icon: Home },
    { href: "/rooms", label: "Rooms", icon: Grid },
    { href: "/messages", label: "Comms", icon: MessageSquare },
    { href: "/teleport", label: "Teleport", icon: ArrowRightLeft },
    { href: "/energy", label: "Energy", icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      {/* Navbar */}
      <header className="border-b border-border/40 bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all">
                <Zap className="w-5 h-5 text-black" />
              </div>
              <span className="font-display font-bold tracking-[0.2em] text-xl glow-text-primary uppercase">
                {auth?.loungeName || "Quantum Lounge"}
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer ${
                      isActive
                        ? "bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                        : "text-muted-foreground hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
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
