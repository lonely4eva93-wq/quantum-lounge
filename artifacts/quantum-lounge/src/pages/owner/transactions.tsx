import { useListTransactions } from "@workspace/api-client-react";
import { format } from "date-fns";
import { ListOrdered, Banknote, Zap, Home } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function OwnerTransactions() {
  const { data: transactions, isLoading } = useListTransactions();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold uppercase tracking-widest text-white mb-2 flex items-center gap-3">
            <ListOrdered className="w-8 h-8 text-primary" /> Ledger
          </h1>
          <p className="text-muted-foreground font-mono">Immutable record of all energy and credit exchanges.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-12 text-primary/50 font-mono animate-pulse">
            Decrypting ledger blocks...
          </div>
        ) : transactions?.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-primary/20 rounded-2xl bg-primary/5">
            <Banknote className="w-12 h-12 text-primary/30 mx-auto mb-4" />
            <p className="text-primary/70 font-mono uppercase tracking-widest">Ledger is empty.</p>
          </div>
        ) : (
          transactions?.map((tx, idx) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="p-4 bg-card/40 border-border/50 backdrop-blur-md flex items-center justify-between hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl border ${
                    tx.type === 'house_fee' ? 'bg-primary/10 border-primary/30 text-primary' :
                    tx.type === 'energy_upgrade' ? 'bg-accent/10 border-accent/30 text-accent' :
                    'bg-destructive/10 border-destructive/30 text-destructive'
                  }`}>
                    {tx.type === 'house_fee' ? <Home className="w-5 h-5" /> :
                     tx.type === 'energy_upgrade' ? <Zap className="w-5 h-5" /> :
                     <Banknote className="w-5 h-5" />}
                  </div>
                  
                  <div>
                    <div className="font-bold text-white font-display tracking-wider mb-1">
                      {tx.type === 'house_fee' ? 'Entry Fee' :
                       tx.type === 'energy_upgrade' ? 'Energy Modification' :
                       'Fund Extraction'}
                    </div>
                    <div className="text-xs font-mono text-muted-foreground">
                      {tx.description}
                      {tx.guestName && <span className="ml-2 px-2 py-0.5 rounded bg-white/5 border border-white/10">Entity: {tx.guestName}</span>}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-xl font-display font-bold tracking-widest ${
                    tx.type === 'cashout' ? 'text-destructive' : 'text-white'
                  }`}>
                    {tx.type === 'cashout' ? '-' : '+'}¤{tx.amount.toFixed(2)}
                  </div>
                  <div className="text-xs font-mono text-muted-foreground mt-1">
                    {format(new Date(tx.createdAt), "MMM d, HH:mm:ss")}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
