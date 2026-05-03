import { motion } from "framer-motion";
import { Link } from "wouter";
import { Zap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center relative z-10 p-8"
      >
        <div className="w-24 h-24 rounded-full border-2 border-primary/50 bg-primary/10 flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(0,243,255,0.2)]">
          <Zap className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-8xl font-display font-bold text-primary glow-text-primary mb-4">404</h1>
        <h2 className="text-3xl font-display font-bold uppercase tracking-widest text-white mb-4">
          Void Detected
        </h2>
        <p className="text-muted-foreground font-mono mb-8 max-w-sm mx-auto">
          This dimensional coordinate does not exist. The particle you seek has collapsed.
        </p>
        <Link href="/">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded border border-primary/50 text-primary font-display uppercase tracking-widest hover:bg-primary/10 transition-colors cursor-pointer">
            <Zap className="w-4 h-4" />
            Return to Lobby
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
