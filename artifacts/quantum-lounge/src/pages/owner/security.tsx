import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, ShieldAlert, ShieldOff, Lock, Unlock, AlertTriangle,
  Activity, Eye, XCircle, CheckCircle, Clock, WifiOff,
  RefreshCw, Terminal, Zap, Ban, Search, Settings2, Skull,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const BASE = "/api";

interface SecurityStats {
  totalAttempts24h: number;
  successfulLogins24h: number;
  failedLogins24h: number;
  uniqueSuspiciousIps: number;
  activeBlocks: number;
  flaggedIps: number;
}

interface LoginAttempt {
  id: number; ip: string; success: boolean;
  userAgent: string | null; attemptedAt: string;
}

interface SecurityEvent {
  id: number; eventType: string; ip: string | null;
  details: string | null; severity: string; createdAt: string;
}

interface BlockedIp {
  id: number; ip: string; reason: string; severity: string;
  autoBlocked: boolean; threatScore: number; blockedAt: string;
  blockCount: number; userAgent: string | null;
}

interface ThreatSignal {
  id: number; ip: string; failedLogins: number; rateLimitHits: number;
  pathScanCount: number; errorCount: number; totalRequests: number;
  threatScore: number; flagged: boolean; lastSeen: string;
}

interface DashboardData {
  state: {
    lockdownActive: boolean; loginFailStreak: number;
    threatScanEnabled: boolean; autoBlockEnabled: boolean; threatThreshold: number;
  };
  stats: SecurityStats;
  recentAttempts: LoginAttempt[];
  recentLogs: SecurityEvent[];
  blockedIps: BlockedIp[];
  topThreats: ThreatSignal[];
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "text-red-400 bg-red-950/30 border-red-800/50",
  high: "text-orange-400 bg-orange-950/30 border-orange-800/50",
  info: "text-cyan-400 bg-cyan-950/10 border-cyan-900/30",
};

const EVENT_ICONS: Record<string, typeof Shield> = {
  lockdown_activated: ShieldAlert, lockdown_lifted: Shield,
  login_failure: XCircle, login_success: CheckCircle,
  session_invalidated: WifiOff, rate_limit_hit: AlertTriangle,
  suspicious_activity: Eye, ip_auto_blocked: Ban,
  ip_manual_blocked: Ban, ip_unblocked: Unlock,
  brute_force_detected: Skull, path_scan_detected: Search,
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function ThreatBar({ score }: { score: number }) {
  const color = score >= 90 ? "bg-red-500" : score >= 75 ? "bg-orange-500" : score >= 50 ? "bg-yellow-500" : "bg-cyan-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-bold ${score >= 75 ? "text-red-400" : "text-muted-foreground"}`}>{score.toFixed(0)}</span>
    </div>
  );
}

type Tab = "overview" | "threats" | "blocked" | "attempts" | "log";

export default function SecurityPage() {
  const { toast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [processing, setProcessing] = useState(false);

  // Lockdown controls
  const [confirmingLockdown, setConfirmingLockdown] = useState(false);
  const [lockdownPassword, setLockdownPassword] = useState("");
  const [lockdownReason, setLockdownReason] = useState("");
  const [disarmCode, setDisarmCode] = useState("");

  // IP block manual
  const [manualIp, setManualIp] = useState("");
  const [manualReason, setManualReason] = useState("");

  // Settings
  const [threshold, setThreshold] = useState(75);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/security/dashboard`);
      if (!res.ok) throw new Error("Unauthorized");
      const json: DashboardData = await res.json();
      setData(json);
      setThreshold(json.state?.threatThreshold ?? 75);
    } catch (e: any) {
      toast({ title: "Access denied", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const iv = setInterval(fetchDashboard, 20000);
    return () => clearInterval(iv);
  }, []);

  const runScan = async () => {
    setScanning(true);
    try {
      const res = await fetch(`${BASE}/security/scan`, { method: "POST" });
      const body = await res.json();
      toast({ title: "Threat Sweep Complete", description: body.message });
      fetchDashboard();
    } catch {
      toast({ title: "Scan failed", variant: "destructive" });
    } finally {
      setScanning(false);
    }
  };

  const activateLockdown = async () => {
    setProcessing(true);
    try {
      const res = await fetch(`${BASE}/security/lockdown`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: lockdownPassword, reason: lockdownReason || "Manual lockdown" }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      toast({ title: "🔴 LOCKDOWN ACTIVE", description: body.message });
      setConfirmingLockdown(false); setLockdownPassword(""); setLockdownReason("");
      fetchDashboard();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setProcessing(false); }
  };

  const liftLockdown = async () => {
    setProcessing(true);
    try {
      const res = await fetch(`${BASE}/security/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: disarmCode }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      toast({ title: "✅ Lockdown Lifted", description: body.message });
      setDisarmCode(""); fetchDashboard();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setProcessing(false); }
  };

  const blockIp = async () => {
    if (!manualIp) return;
    try {
      const res = await fetch(`${BASE}/security/block-ip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: manualIp, reason: manualReason || "Manual block" }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      toast({ title: "IP Blocked", description: body.message });
      setManualIp(""); setManualReason(""); fetchDashboard();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const unblockIp = async (ip: string) => {
    try {
      const res = await fetch(`${BASE}/security/unblock-ip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      toast({ title: "IP Unblocked", description: body.message });
      fetchDashboard();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const saveThreshold = async () => {
    try {
      await fetch(`${BASE}/security/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threatThreshold: threshold }),
      });
      toast({ title: "Threshold saved", description: `Auto-block at ${threshold}/100` });
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    }
  };

  const isLocked = data?.state?.lockdownActive ?? false;
  const tabs: { key: Tab; label: string; icon: typeof Shield }[] = [
    { key: "overview", label: "Overview", icon: Activity },
    { key: "threats", label: `Threats (${data?.topThreats?.length ?? 0})`, icon: AlertTriangle },
    { key: "blocked", label: `Blocked (${data?.stats?.activeBlocks ?? 0})`, icon: Ban },
    { key: "attempts", label: "Logins", icon: Lock },
    { key: "log", label: "Event Log", icon: Terminal },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Shield className={`w-8 h-8 ${isLocked ? "text-red-400 animate-pulse" : "text-primary"}`} />
          <div>
            <h1 className="text-2xl font-display tracking-widest text-foreground">QUANTUM SHIELD</h1>
            <p className="text-xs text-muted-foreground tracking-widest">ACTIVE IP SWEEP · THREAT DETECTION · KILL SWITCH</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={runScan} disabled={scanning}>
            <Search className={`w-4 h-4 mr-2 ${scanning ? "animate-spin" : ""}`} />
            {scanning ? "Sweeping..." : "Run IP Sweep"}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchDashboard} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* LOCKDOWN BANNER */}
      <AnimatePresence>
        {isLocked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="relative overflow-hidden rounded-xl border-2 border-red-500 bg-red-950/40 p-6"
          >
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(255,0,0,0.04),rgba(255,0,0,0.04)_10px,transparent_10px,transparent_20px)]" />
            <div className="relative flex flex-wrap items-center gap-4">
              <ShieldAlert className="w-12 h-12 text-red-400 animate-pulse flex-shrink-0" />
              <div className="flex-1 min-w-[200px]">
                <h2 className="text-xl font-display tracking-widest text-red-400">⚠ QUANTUM LOCKDOWN ACTIVE</h2>
                <p className="text-red-300/70 text-sm mt-1">All public API access is blocked. Enter disarm code to restore.</p>
              </div>
              <div className="flex flex-col gap-2 min-w-[220px]">
                <Input type="password" placeholder="Enter disarm code" value={disarmCode}
                  onChange={(e) => setDisarmCode(e.target.value)}
                  className="h-9 bg-black/40 border-red-800 text-sm" />
                <Button onClick={liftLockdown} disabled={!disarmCode || processing}
                  className="bg-green-700 hover:bg-green-600 text-white h-9 gap-2">
                  <Unlock className="w-4 h-4" /> DISARM SYSTEM
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stat Cards */}
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          {[
            { label: "Logins (24h)", value: data.stats.totalAttempts24h, color: "text-cyan-400" },
            { label: "Successful", value: data.stats.successfulLogins24h, color: "text-green-400" },
            { label: "Failed", value: data.stats.failedLogins24h, color: "text-orange-400" },
            { label: "Suspicious IPs", value: data.stats.uniqueSuspiciousIps, color: "text-yellow-400" },
            { label: "Flagged", value: data.stats.flaggedIps, color: "text-orange-500" },
            { label: "Blocked", value: data.stats.activeBlocks, color: "text-red-400" },
          ].map((s) => (
            <Card key={s.label} className="p-3 bg-card/40 border-border/50 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{s.label}</div>
            </Card>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Left column — Controls */}
        <div className="space-y-4">
          {/* Threat Settings */}
          <Card className="p-4 border-border/50 bg-card/30">
            <h3 className="text-xs font-display tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
              <Settings2 className="w-3.5 h-3.5" /> AUTO-BLOCK THRESHOLD
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Threat score to auto-block</span>
                <span className="text-primary font-bold">{threshold}/100</span>
              </div>
              <input type="range" min={30} max={100} step={5} value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full accent-cyan-400" />
              <Button size="sm" variant="outline" className="w-full text-xs h-8" onClick={saveThreshold}>
                Save Threshold
              </Button>
            </div>
          </Card>

          {/* Manual Block */}
          <Card className="p-4 border-border/50 bg-card/30">
            <h3 className="text-xs font-display tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
              <Ban className="w-3.5 h-3.5" /> MANUAL IP BLOCK
            </h3>
            <div className="space-y-2">
              <Input placeholder="IP address" value={manualIp} onChange={(e) => setManualIp(e.target.value)}
                className="h-8 text-sm bg-black/30" />
              <Input placeholder="Reason (optional)" value={manualReason} onChange={(e) => setManualReason(e.target.value)}
                className="h-8 text-sm bg-black/30" />
              <Button size="sm" onClick={blockIp} disabled={!manualIp}
                className="w-full h-8 bg-orange-800 hover:bg-orange-700 text-white text-xs gap-1.5">
                <Ban className="w-3.5 h-3.5" /> Block IP Now
              </Button>
            </div>
          </Card>

          {/* KILL SWITCH */}
          <Card className={`p-4 border-2 ${isLocked ? "border-red-500/60 bg-red-950/20" : "border-border/50 bg-card/30"}`}>
            <h3 className="text-xs font-display tracking-widest text-red-400 mb-1 flex items-center gap-2">
              <ShieldOff className="w-3.5 h-3.5" /> KILL SWITCH
            </h3>
            <p className="text-[10px] text-muted-foreground mb-3">Last resort — blocks ALL public API access. Disarm with your secret code.</p>

            {!isLocked && !confirmingLockdown && (
              <Button variant="destructive" className="w-full h-8 text-xs gap-2 bg-red-900/60 hover:bg-red-800 border border-red-700"
                onClick={() => setConfirmingLockdown(true)}>
                <Skull className="w-3.5 h-3.5" /> ACTIVATE LOCKDOWN
              </Button>
            )}

            {!isLocked && confirmingLockdown && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                <div className="bg-red-950/40 border border-red-800/50 rounded p-2 text-[10px] text-red-300">
                  ⚠ Blocks ALL guests immediately. Only your disarm code unlocks it.
                </div>
                <Input placeholder="Reason (optional)" value={lockdownReason} onChange={(e) => setLockdownReason(e.target.value)} className="h-8 text-xs bg-black/40" />
                <Input type="password" placeholder="Owner password to confirm" value={lockdownPassword} onChange={(e) => setLockdownPassword(e.target.value)} className="h-8 text-xs bg-black/40 border-red-800" />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => { setConfirmingLockdown(false); setLockdownPassword(""); }}>Cancel</Button>
                  <Button size="sm" className="flex-1 h-8 text-xs bg-red-700 hover:bg-red-600 text-white"
                    onClick={activateLockdown} disabled={!lockdownPassword || processing}>
                    {processing ? "Locking..." : "CONFIRM"}
                  </Button>
                </div>
              </motion.div>
            )}

            {isLocked && (
              <div className="text-center py-2">
                <Zap className="w-8 h-8 text-red-400 mx-auto animate-pulse mb-1" />
                <p className="text-red-400 text-xs font-bold">SYSTEM LOCKED DOWN</p>
                <p className="text-[10px] text-muted-foreground mt-1">Use disarm code in the banner above</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right — Tabbed panels */}
        <div className="lg:col-span-3 space-y-3">
          {/* Tabs */}
          <div className="flex gap-1 bg-card/30 rounded-lg p-1 border border-border/30 flex-wrap">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-semibold tracking-wider uppercase transition-all ${
                  tab === t.key ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground"
                }`}>
                <t.icon className="w-3 h-3" /> {t.label}
              </button>
            ))}
          </div>

          <Card className="border-border/50 bg-card/30 max-h-[560px] overflow-y-auto">
            {/* OVERVIEW TAB */}
            {tab === "overview" && data && (
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-2 h-2 rounded-full ${isLocked ? "bg-red-400 animate-pulse" : "bg-green-400"}`} />
                  <span className="text-sm font-medium">
                    System: {isLocked ? <span className="text-red-400 font-bold">LOCKED DOWN</span> : <span className="text-green-400">ONLINE & PROTECTED</span>}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    Auto-block: {data.state.autoBlockEnabled ? <span className="text-green-400">ON</span> : <span className="text-red-400">OFF</span>}
                    {" | "}Threshold: <span className="text-primary">{data.state.threatThreshold}/100</span>
                  </span>
                </div>
                {data.recentLogs.slice(0, 20).map((log) => {
                  const Icon = EVENT_ICONS[log.eventType] ?? Terminal;
                  const cls = SEVERITY_COLORS[log.severity] ?? SEVERITY_COLORS.info;
                  return (
                    <div key={log.id} className={`flex items-start gap-3 p-2.5 rounded-lg border text-xs ${cls}`}>
                      <Icon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold uppercase tracking-wide">{log.eventType.replace(/_/g, " ")}</span>
                        {log.details && <span className="text-muted-foreground ml-2">{log.details}</span>}
                        {log.ip && <span className="text-muted-foreground/50 ml-2">· {log.ip}</span>}
                      </div>
                      <span className="text-muted-foreground/40 whitespace-nowrap">{timeAgo(log.createdAt)}</span>
                    </div>
                  );
                })}
                {!data.recentLogs.length && <div className="text-center py-8 text-muted-foreground text-sm">No events yet</div>}
              </div>
            )}

            {/* THREATS TAB */}
            {tab === "threats" && data && (
              <div className="divide-y divide-border/30">
                {data.topThreats.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground text-sm">
                    <Shield className="w-8 h-8 mx-auto mb-2 text-green-400" />
                    No flagged IPs — system is clean
                  </div>
                )}
                {data.topThreats.map((t) => (
                  <div key={t.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono text-sm text-foreground">{t.ip}</span>
                        <span className="ml-2 text-[10px] bg-orange-950/40 text-orange-400 border border-orange-800/40 rounded px-1.5 py-0.5">FLAGGED</span>
                      </div>
                      <Button size="sm" variant="destructive" className="h-7 text-xs px-3"
                        onClick={async () => {
                          await fetch(`${BASE}/security/block-ip`, {
                            method: "POST", headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ ip: t.ip, reason: "Manual block from threat sweep" }),
                          });
                          toast({ title: "Blocked", description: t.ip });
                          fetchDashboard();
                        }}>
                        <Ban className="w-3 h-3 mr-1" /> Block
                      </Button>
                    </div>
                    <ThreatBar score={t.threatScore} />
                    <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                      <div><span className="text-red-400 font-bold">{t.failedLogins}</span> failed logins</div>
                      <div><span className="text-orange-400 font-bold">{t.rateLimitHits}</span> rate limits</div>
                      <div><span className="text-yellow-400 font-bold">{t.pathScanCount}</span> scans</div>
                      <div><span className="text-cyan-400 font-bold">{t.errorCount}</span> errors</div>
                    </div>
                    <div className="text-[10px] text-muted-foreground/50">Last seen: {timeAgo(t.lastSeen)} · {t.totalRequests} total requests</div>
                  </div>
                ))}
              </div>
            )}

            {/* BLOCKED IPs TAB */}
            {tab === "blocked" && data && (
              <div className="divide-y divide-border/30">
                {data.blockedIps.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground text-sm">No IPs currently blocked</div>
                )}
                {data.blockedIps.map((b) => (
                  <div key={b.id} className="flex items-start gap-3 p-4">
                    <Ban className={`w-4 h-4 flex-shrink-0 mt-0.5 ${b.severity === "critical" ? "text-red-400" : "text-orange-400"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm text-foreground">{b.ip}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold uppercase ${SEVERITY_COLORS[b.severity] ?? SEVERITY_COLORS.info}`}>{b.severity}</span>
                        {b.autoBlocked && <span className="text-[10px] text-muted-foreground">auto-blocked</span>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{b.reason}</div>
                      <ThreatBar score={b.threatScore} />
                      <div className="text-[10px] text-muted-foreground/50 mt-1">
                        Blocked {timeAgo(b.blockedAt)} · {b.blockCount}× blocked
                        {b.userAgent && <span> · {b.userAgent.slice(0, 50)}</span>}
                      </div>
                    </div>
                    <Button size="sm" variant="outline"
                      className="h-7 text-xs px-3 border-green-800/50 text-green-400 hover:bg-green-950/30"
                      onClick={() => unblockIp(b.ip)}>
                      <Unlock className="w-3 h-3 mr-1" /> Unblock
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* LOGIN ATTEMPTS TAB */}
            {tab === "attempts" && data && (
              <div className="divide-y divide-border/30">
                {data.recentAttempts.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 px-4 py-3 text-xs">
                    {a.success
                      ? <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold ${a.success ? "text-green-400" : "text-red-400"}`}>
                        {a.success ? "Login Success" : "Login Failed"}
                      </div>
                      <div className="text-muted-foreground font-mono">{a.ip}</div>
                      {a.userAgent && <div className="text-muted-foreground/50 truncate">{a.userAgent.slice(0, 70)}</div>}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="text-muted-foreground/50 whitespace-nowrap">
                        <Clock className="w-3 h-3 inline mr-1" />{timeAgo(a.attemptedAt)}
                      </div>
                      {!a.success && (
                        <Button size="sm" variant="ghost" className="h-6 text-[10px] text-red-400 hover:bg-red-950/30 px-2"
                          onClick={() => {
                            setManualIp(a.ip);
                            setManualReason("Repeated login failures");
                            setTab("overview");
                          }}>
                          Block IP
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {!data.recentAttempts.length && <div className="text-center py-8 text-muted-foreground text-sm">No login attempts in 24h</div>}
              </div>
            )}

            {/* EVENT LOG TAB */}
            {tab === "log" && data && (
              <div className="divide-y divide-border/30">
                {data.recentLogs.map((log) => {
                  const Icon = EVENT_ICONS[log.eventType] ?? Terminal;
                  return (
                    <div key={log.id} className="flex items-start gap-3 px-4 py-3 text-xs">
                      <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${log.severity === "critical" ? "text-red-400" : log.severity === "high" ? "text-orange-400" : "text-cyan-400"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground uppercase tracking-wide">{log.eventType.replace(/_/g, " ")}</div>
                        {log.details && <div className="text-muted-foreground mt-0.5">{log.details}</div>}
                        {log.ip && <div className="text-muted-foreground/50 mt-0.5 font-mono">{log.ip}</div>}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${SEVERITY_COLORS[log.severity] ?? SEVERITY_COLORS.info}`}>{log.severity}</span>
                        <span className="text-muted-foreground/40">{timeAgo(log.createdAt)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
