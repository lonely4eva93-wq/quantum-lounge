import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useOwnerLogin, getGetAuthMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Zap, Lock, TerminalSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function OwnerLogin() {
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const login = useOwnerLogin({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAuthMeQueryKey() });
        setLocation("/owner/dashboard");
        toast({
          title: "Access Granted",
          description: "Quantum control interface unlocked.",
        });
      },
      onError: () => {
        toast({
          title: "Access Denied",
          description: "Invalid quantum signature.",
          variant: "destructive",
        });
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ data: { password } });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-8 rounded-2xl bg-card/30 backdrop-blur-xl border border-primary/20 shadow-[0_0_50px_rgba(0,243,255,0.1)]"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full border-t-2 border-primary border-r-2 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(0,243,255,0.3)]"
          >
            <Zap className="w-8 h-8 text-primary glow-text-primary" />
          </motion.div>
          <h1 className="text-3xl font-display font-bold uppercase tracking-widest text-white mb-2">Control Node</h1>
          <p className="text-primary/70 font-mono text-sm tracking-wider uppercase">Restricted Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-primary/50" />
            </div>
            <Input
              type="password"
              placeholder="Enter Access Code..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/50 border-primary/30 text-white pl-10 focus:border-primary focus:ring-primary/50 font-mono"
            />
          </div>

          <Button
            type="submit"
            disabled={login.isPending || !password}
            className="w-full bg-primary/20 text-primary border border-primary hover:bg-primary/30 hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all font-display uppercase tracking-widest"
          >
            {login.isPending ? (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex items-center gap-2"
              >
                <TerminalSquare className="w-4 h-4" /> Verifying...
              </motion.div>
            ) : (
              "Initialize Session"
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
