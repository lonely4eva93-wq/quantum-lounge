import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BarChart2, TrendingUp, Users, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface AnalyticsSummary {
  dailyVisitors: { day: string; visitors: number }[];
  dailyRevenue: { day: string; revenue: number }[];
  energyDistribution: { name: string; value: number }[];
  totalGuests: number;
  activeGuests: number;
  totalRevenue: number;
  weekRevenue: number;
  weekVisitors: number;
}

const PIE_COLORS = ["#6b7280", "#f59e0b", "#00f3ff", "#bf00ff"];

const CHART_STYLE = {
  tooltip: { backgroundColor: "#0a0a0f", border: "1px solid rgba(0,243,255,0.2)", borderRadius: 8, color: "#fff" },
  grid: "rgba(255,255,255,0.05)",
};

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <Card className="p-5 bg-card/40 border-primary/20">
      <div className="flex items-start justify-between mb-2">
        <Icon className="w-5 h-5 text-primary/60" />
      </div>
      <div className="text-2xl font-display font-bold text-white">{value}</div>
      <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mt-1">{label}</div>
      {sub && <div className="text-xs font-mono text-primary/60 mt-0.5">{sub}</div>}
    </Card>
  );
}

export default function OwnerAnalytics() {
  const { data, isLoading } = useQuery<AnalyticsSummary>({
    queryKey: ["analytics-summary"],
    queryFn: async () => {
      const res = await fetch("/api/analytics/summary");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 60_000,
  });

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-display font-bold uppercase tracking-widest text-white flex items-center gap-3">
          <BarChart2 className="w-7 h-7 text-primary" /> Analytics
        </h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">7-day performance overview</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Total Guests" value={String(data?.totalGuests ?? 0)} sub={`${data?.activeGuests ?? 0} active now`} />
            <StatCard icon={TrendingUp} label="This Week" value={String(data?.weekVisitors ?? 0)} sub="new visitors" />
            <StatCard icon={DollarSign} label="Total Revenue" value={`$${(data?.totalRevenue ?? 0).toFixed(2)}`} />
            <StatCard icon={DollarSign} label="This Week" value={`$${(data?.weekRevenue ?? 0).toFixed(2)}`} sub="revenue" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-card/40 border-primary/20">
              <h2 className="text-sm font-mono uppercase tracking-widest text-primary mb-6">Daily Visitors (7d)</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data?.dailyVisitors ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} />
                  <XAxis dataKey="day" tick={{ fill: "#6b7280", fontSize: 11, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 11, fontFamily: "monospace" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={CHART_STYLE.tooltip} />
                  <Line type="monotone" dataKey="visitors" stroke="#00f3ff" strokeWidth={2} dot={{ fill: "#00f3ff", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 bg-card/40 border-primary/20">
              <h2 className="text-sm font-mono uppercase tracking-widest text-secondary mb-6">Daily Revenue (7d)</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data?.dailyRevenue ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} />
                  <XAxis dataKey="day" tick={{ fill: "#6b7280", fontSize: 11, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 11, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={CHART_STYLE.tooltip} formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]} />
                  <Bar dataKey="revenue" fill="#bf00ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 bg-card/40 border-primary/20">
              <h2 className="text-sm font-mono uppercase tracking-widest text-accent mb-6">Energy Distribution</h2>
              {(data?.energyDistribution?.length ?? 0) === 0 ? (
                <div className="h-48 flex items-center justify-center text-muted-foreground font-mono text-sm">No guest data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={data?.energyDistribution ?? []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {data?.energyDistribution?.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={CHART_STYLE.tooltip} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card className="p-6 bg-card/40 border-primary/20 flex flex-col justify-center items-center text-center">
              <div className="text-5xl font-display font-bold text-white mb-2">
                {data?.weekVisitors ?? 0}
              </div>
              <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">visitors this week</div>
              <div className="text-3xl font-display font-bold text-primary">
                ${(data?.weekRevenue ?? 0).toFixed(2)}
              </div>
              <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">revenue this week</div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
