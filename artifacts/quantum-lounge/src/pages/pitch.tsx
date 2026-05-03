import { motion } from "framer-motion";
import {
  Zap, TrendingUp, Users, DollarSign, Globe, ArrowRightLeft,
  Star, Shield, Mail, CheckCircle, BarChart2, Crown, Rocket,
} from "lucide-react";
import { Card } from "@/components/ui/card";

const YEAR = new Date().getFullYear();
const DATE = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

const TIERS = [
  {
    name: "Seed Partner",
    investment: "$5,000 – $25,000",
    equity: "2% – 5%",
    revenue: "3% of monthly net revenue",
    xrp: "500 XRP bonus pool allocation",
    perks: ["Logo on Quantum Lounge splash screen", "Monthly revenue report", "XRP promotion co-branding", "Priority support channel"],
    color: "border-cyan-400/30 bg-cyan-400/5",
    badge: "text-cyan-400",
  },
  {
    name: "Growth Partner",
    investment: "$25,000 – $100,000",
    equity: "5% – 12%",
    revenue: "7% of monthly net revenue",
    xrp: "2,500 XRP bonus pool allocation",
    perks: ["Featured partner page on platform", "Weekly analytics access", "XRP new-user campaign co-ownership", "Joint press release", "Quarterly strategy call with William Brown"],
    color: "border-primary/40 bg-primary/5",
    badge: "text-primary",
    featured: true,
  },
  {
    name: "Strategic Partner",
    investment: "$100,000+",
    equity: "12% – 25%",
    revenue: "15% of monthly net revenue",
    xrp: "10,000+ XRP bonus pool allocation",
    perks: ["Board advisory seat", "Full real-time analytics dashboard", "XRP ecosystem integration priority", "Co-developed feature roadmap", "Monthly call + quarterly in-person", "Custom revenue share structure"],
    color: "border-fuchsia-400/30 bg-fuchsia-400/5",
    badge: "text-fuchsia-400",
  },
];

const METRICS = [
  { label: "Platform Launch", value: YEAR.toString(), icon: Rocket, color: "text-cyan-400" },
  { label: "Revenue Streams", value: "8 Active", icon: DollarSign, color: "text-green-400" },
  { label: "New User XRP Bonus", value: "Live", icon: Zap, color: "text-yellow-400" },
  { label: "Multi-Chain Ready", value: "XRPL + 3", icon: Globe, color: "text-fuchsia-400" },
  { label: "P2P Transfers", value: "Enabled", icon: ArrowRightLeft, color: "text-primary" },
  { label: "Learn-to-Earn", value: "In Platform", icon: Star, color: "text-orange-400" },
];

export default function PitchPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/20 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-primary" />
            <span className="font-display tracking-widest text-primary text-sm">QUANTUM LOUNGE</span>
          </div>
          <div className="text-xs text-muted-foreground font-mono">CONFIDENTIAL · {DATE}</div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-10 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-fuchsia-900/10 relative overflow-hidden text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,243,255,0.07),transparent_60%)]" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono uppercase tracking-widest mb-6">
                <Zap className="w-3 h-3" /> XRP Partnership &amp; Investment Proposal
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-widest text-foreground uppercase mb-4">
                Quantum Lounge
              </h1>
              <p className="text-xl text-primary font-display tracking-wide mb-2">
                The Future of Immersive Social Commerce on XRP
              </p>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm leading-relaxed">
                An immersive, multi-revenue digital social platform purpose-built to drive XRP adoption, awareness, and peer-to-peer transaction volume — combining entertainment, community, and blockchain in one seamless experience.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground">
                  <strong className="text-foreground">Author &amp; Owner:</strong> William Brown
                </span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground">
                  <strong className="text-foreground">Platform:</strong> Quantum Lounge
                </span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground">
                  <strong className="text-foreground">Primary Chain:</strong> XRP Ledger (XRPL)
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* The Opportunity */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <SectionHeader icon={TrendingUp} label="The Opportunity" />
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <Card className="p-6 border-border/50 bg-card/30">
              <h3 className="font-display tracking-wider text-foreground text-lg mb-3">Why XRP?</h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {[
                  "XRP Ledger settles transactions in 3–5 seconds with near-zero fees — ideal for high-frequency micro-transactions in a social platform",
                  "The XRP ecosystem lacks consumer-facing entertainment and social engagement platforms — Quantum Lounge fills this gap directly",
                  "New user XRP bonuses create a natural on-ramp for crypto-curious users, growing the XRP holder base organically",
                  "P2P tipping, leaderboard rewards, and oracle payments drive real on-chain volume without speculative trading",
                  "Learn-to-earn modules educate users on XRPL, creating informed holders and long-term ecosystem participants",
                ].map((p, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-6 border-border/50 bg-card/30">
              <h3 className="font-display tracking-wider text-foreground text-lg mb-3">Market Position</h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {[
                  "No direct competitor combines immersive social nightclub experience with XRP-native payments and rewards",
                  "Global social gaming and entertainment market projected to exceed $300B by 2026",
                  "Crypto-integrated social platforms command 3–5× higher user lifetime value vs. traditional platforms",
                  "8 active revenue streams operating from day one — diversified, resilient, and scaling",
                  "Platform designed for viral growth: referral bonuses, shareable guest profiles, leaderboard dynamics",
                ].map((p, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </motion.div>

        {/* Platform metrics */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}>
          <SectionHeader icon={BarChart2} label="Platform At a Glance" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {METRICS.map((m) => (
              <Card key={m.label} className="p-5 border-border/50 bg-card/30">
                <m.icon className={`w-5 h-5 ${m.color} mb-3`} />
                <div className={`text-2xl font-display font-bold ${m.color}`}>{m.value}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">{m.label}</div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Revenue streams */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.14 }}>
          <SectionHeader icon={DollarSign} label="8 Active Revenue Streams" />
          <Card className="mt-4 border-border/50 bg-card/30">
            <div className="divide-y divide-border/30">
              {[
                { stream: "House Entry Fee", model: "Per check-in flat fee from every new guest", xrp: "Payable in XRP credits" },
                { stream: "VIP Memberships", model: "Recurring monthly subscription — enhanced access", xrp: "XRP cashback on membership" },
                { stream: "Room Rentals", model: "Hosts pay to open and run private frequency rooms", xrp: "XRP deposit + rental fee" },
                { stream: "P2P Tips", model: "Platform takes % on every guest-to-guest tip", xrp: "Fully XRP-native" },
                { stream: "Oracle AI Readings", model: "Pay-per-use AI cosmic oracle consultations", xrp: "XRP micro-payment model" },
                { stream: "Leaderboard Boosts", model: "Pay to boost rank visibility on the leaderboard", xrp: "XRP boost credits" },
                { stream: "Premium DMs", model: "Pay-to-send encrypted priority messages", xrp: "XRP-denominated send fee" },
                { stream: "Sponsorships", model: "Brand-sponsored rooms with audience exposure", xrp: "XRP sponsorship settlement" },
              ].map((r) => (
                <div key={r.stream} className="flex items-center gap-4 px-5 py-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  <div className="flex-1">
                    <span className="font-semibold text-foreground">{r.stream}</span>
                    <span className="text-muted-foreground ml-2">— {r.model}</span>
                  </div>
                  <div className="text-xs font-mono text-cyan-400 flex-shrink-0">{r.xrp}</div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* XRP Integration Roadmap */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.16 }}>
          <SectionHeader icon={Globe} label="XRP Integration Roadmap" />
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            {[
              {
                phase: "Phase 1 — Live Now",
                color: "border-green-400/30 bg-green-400/5",
                badge: "text-green-400",
                items: ["In-app XRP credit system", "New user XRP bonus (onboarding)", "P2P XRP credit transfers", "Revenue tracked in XRP equivalent", "Smart contract documentation"],
              },
              {
                phase: "Phase 2 — Q3 " + YEAR,
                color: "border-yellow-400/30 bg-yellow-400/5",
                badge: "text-yellow-400",
                items: ["XRPL wallet connect (real withdrawals)", "On-chain tip settlement", "XRP payment gateway for VIP/Oracle", "Learn-to-earn quiz modules", "XRP price ticker in platform"],
              },
              {
                phase: "Phase 3 — Q4 " + YEAR,
                color: "border-fuchsia-400/30 bg-fuchsia-400/5",
                badge: "text-fuchsia-400",
                items: ["Multi-chain expansion (ETH, SOL, MATIC)", "NFT achievement badge minting on XRPL", "Decentralized room governance", "XRP liquidity pool integration", "Cross-platform XRP loyalty program"],
              },
            ].map((p) => (
              <Card key={p.phase} className={`p-5 border ${p.color}`}>
                <div className={`text-xs font-mono font-bold uppercase tracking-widest ${p.badge} mb-3`}>{p.phase}</div>
                <ul className="space-y-1.5">
                  {p.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle className={`w-3 h-3 ${p.badge} flex-shrink-0 mt-0.5`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Investment Tiers */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}>
          <SectionHeader icon={Crown} label="Partnership & Investment Tiers" />
          <div className="grid md:grid-cols-3 gap-5 mt-4">
            {TIERS.map((tier) => (
              <Card key={tier.name} className={`p-6 border ${tier.color} relative ${tier.featured ? "ring-1 ring-primary/40" : ""}`}>
                {tier.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-black text-[10px] font-bold uppercase tracking-widest">
                    Recommended
                  </div>
                )}
                <div className={`text-xs font-mono uppercase tracking-widest ${tier.badge} mb-1`}>
                  {tier.name}
                </div>
                <div className="text-xl font-display font-bold text-foreground mb-4">{tier.investment}</div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Equity</span>
                    <span className={`font-bold ${tier.badge}`}>{tier.equity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Revenue Share</span>
                    <span className={`font-bold ${tier.badge}`}>{tier.revenue}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">XRP Pool</span>
                    <span className="font-bold text-cyan-400 text-xs">{tier.xrp}</span>
                  </div>
                </div>
                <div className="border-t border-white/5 pt-3">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Includes</div>
                  <ul className="space-y-1.5">
                    {tier.perks.map((p) => (
                      <li key={p} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle className={`w-3 h-3 ${tier.badge} flex-shrink-0 mt-0.5`} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
          <p className="text-xs text-muted-foreground/50 text-center mt-3">
            All equity and revenue share terms are negotiable. Final terms set by William Brown. Custom structures available for strategic partners.
          </p>
        </motion.div>

        {/* Traffic & Awareness Strategy */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <SectionHeader icon={Users} label="Traffic & Awareness Strategy" />
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <Card className="p-6 border-border/50 bg-card/30">
              <h3 className="font-display tracking-wider text-foreground mb-3 text-base">User Acquisition</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  "Referral programme: existing users earn XRP credits for every new guest they bring in",
                  "New user XRP bonus prominently promoted across social channels — free XRP as entry hook",
                  "Leaderboard rankings shareable to Twitter/X — organic viral loop",
                  "Shareable guest profile cards with energy level, badges, and XRP balance",
                  "Influencer partnership programme — XRP-native content creators as platform ambassadors",
                  "SEO-optimised events pages driving search traffic to the platform",
                ].map((p, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-6 border-border/50 bg-card/30">
              <h3 className="font-display tracking-wider text-foreground mb-3 text-base">XRP Ecosystem Awareness</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  "Co-marketing with Ripple ecosystem partners — joint announcements to their user bases",
                  "XRPL Foundation grant application support for learn-to-earn educational modules",
                  "Presence at XRP community events, AMAs, and Twitter/X Spaces",
                  "Platform stats page publicly shows XRP volume, active users, and transaction count",
                  "Quantum Lounge as a reference implementation for XRPL social commerce use case",
                  "Partner logo and attribution on all XRP-related promotional materials",
                ].map((p, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </motion.div>

        {/* Growth Projections */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }}>
          <SectionHeader icon={TrendingUp} label="Growth Projections" />
          <Card className="mt-4 border-border/50 bg-card/30">
            <div className="divide-y divide-border/30">
              {[
                { period: "Month 1–3", guests: "500–2,000", txns: "5,000–20,000", xrp: "10,000 XRP in circulation", rev: "$15K–$45K" },
                { period: "Month 4–6", guests: "2,000–8,000", txns: "30,000–100,000", xrp: "75,000 XRP in circulation", rev: "$45K–$150K" },
                { period: "Month 7–12", guests: "8,000–25,000", txns: "150,000–500,000", xrp: "300,000 XRP in circulation", rev: "$150K–$500K" },
                { period: "Year 2", guests: "25,000–100,000", txns: "1M+", xrp: "1M+ XRP in circulation", rev: "$500K–$2M+" },
              ].map((row) => (
                <div key={row.period} className="grid grid-cols-5 gap-4 px-5 py-3 text-sm items-center">
                  <div className="font-mono text-xs text-primary">{row.period}</div>
                  <div className="text-center">
                    <div className="text-foreground font-semibold">{row.guests}</div>
                    <div className="text-[10px] text-muted-foreground">Guests</div>
                  </div>
                  <div className="text-center">
                    <div className="text-foreground font-semibold">{row.txns}</div>
                    <div className="text-[10px] text-muted-foreground">Transactions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-cyan-400 font-semibold text-xs">{row.xrp}</div>
                    <div className="text-[10px] text-muted-foreground">XRP Volume</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-400 font-semibold">{row.rev}</div>
                    <div className="text-[10px] text-muted-foreground">Est. Revenue</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 bg-white/2 border-t border-border/30">
              <p className="text-[10px] text-muted-foreground/50">Projections are illustrative estimates based on comparable platform growth metrics. Not a guarantee of returns.</p>
            </div>
          </Card>
        </motion.div>

        {/* The Email Draft */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.24 }}>
          <SectionHeader icon={Mail} label="Pitch Email — Ready to Send" />
          <Card className="mt-4 border-primary/20 bg-card/30 overflow-hidden">
            <div className="bg-white/3 border-b border-border/40 px-6 py-3 flex items-center gap-3">
              <Mail className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono text-muted-foreground">DRAFT — Quantum Lounge XRP Partnership Proposal</span>
            </div>
            <div className="p-6 font-mono text-sm text-muted-foreground leading-7 whitespace-pre-line">
{`To: [Partner / Investor Name]
From: William Brown — Founder & Owner, Quantum Lounge
Subject: XRP Partnership Opportunity — Quantum Lounge: Driving Real Social Volume on XRPL

───────────────────────────────────────────────────────

Dear [Name],

I hope this finds you well. My name is William Brown, and I am the sole inventor and owner of Quantum Lounge — an immersive, multi-revenue social platform built natively on XRP Ledger infrastructure.

I am reaching out because I believe there is a compelling and mutually beneficial opportunity to partner with you/your organisation to accelerate XRP adoption, drive real transaction volume on XRPL, and create meaningful engagement at the consumer level.

───────────────────────────────────────────────────────
WHAT IS QUANTUM LOUNGE?
───────────────────────────────────────────────────────

Quantum Lounge is a live, fully operational digital social nightclub experience where users:

  • Check in as "guests," claim a Quantum Bio, and set their energy level
  • Tip one another, compete on leaderboards, and teleport between frequency rooms
  • Pay for VIP access, Oracle AI readings, premium DMs, and room sponsorships
  • Earn, spend, and transfer XRP credits in a fun, frictionless social context

We operate 8 distinct revenue streams generating income from day one, with a technology stack purpose-built for XRP integration — real-time P2P transfers, new user XRP bonus programmes, learn-to-earn modules, and multi-chain expansion roadmap.

───────────────────────────────────────────────────────
WHY THIS MATTERS FOR XRP
───────────────────────────────────────────────────────

The XRP ecosystem has an infrastructure and liquidity story that is compelling to sophisticated investors. What it has historically lacked is a consumer-facing entertainment platform that makes XRP approachable, rewarding, and fun for everyday users.

Quantum Lounge solves this. Every new user we onboard becomes a new XRP wallet holder. Every tip, boost, oracle reading, and premium message is a micro-transaction on XRPL. Every referral drives organic growth into the ecosystem.

This is not speculative. Users come for the entertainment. They stay for the community. They transact in XRP because it is seamless and rewarding.

───────────────────────────────────────────────────────
PARTNERSHIP OPPORTUNITY
───────────────────────────────────────────────────────

I am offering a range of partnership structures depending on your appetite:

  Seed Partner      $5K–$25K      2–5% equity    3% monthly revenue share
  Growth Partner    $25K–$100K    5–12% equity   7% monthly revenue share
  Strategic Partner $100K+        12–25% equity  15% monthly revenue share + advisory seat

All tiers include XRP bonus pool allocation, co-branding rights on new user XRP campaigns, and access to platform analytics. Custom structures are available for ecosystem-level partnerships.

In addition to direct investment, I am open to discussing:

  • XRP grant / ecosystem fund support
  • Technical integration partnerships (XRPL validator nodes, liquidity provision)
  • Marketing co-investment and joint campaigns
  • Traffic-sharing and cross-promotional arrangements

───────────────────────────────────────────────────────
PROJECTED IMPACT
───────────────────────────────────────────────────────

  Year 1 Target:  25,000+ registered guests
                  500,000+ on-platform transactions
                  300,000+ XRP in active circulation
                  $150K–$500K platform revenue

  Year 2 Target:  100,000+ guests
                  1M+ transactions
                  1M+ XRP in circulation
                  $500K–$2M+ revenue

───────────────────────────────────────────────────────
NEXT STEPS
───────────────────────────────────────────────────────

I would welcome a 30-minute introductory call at your convenience to walk through the platform live, discuss partnership terms, and explore how we can build something significant together for the XRP ecosystem.

All intellectual property, contracts, and platform rights are held exclusively by William Brown. Formal partnership agreements are available for review upon expression of interest.

Thank you sincerely for your time and consideration. I look forward to the possibility of working together.

Warmly,

William Brown
Founder & Sole Owner — Quantum Lounge
© ${YEAR} William Brown. All Rights Reserved.

[Your Email Address]
[Your Phone / Preferred Contact]
[Platform URL]

───────────────────────────────────────────────────────
CONFIDENTIAL: This communication and its contents are the intellectual property of William Brown and Quantum Lounge. Not for distribution without express written consent.`}
            </div>
          </Card>
        </motion.div>

        {/* Ownership Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.26 }}>
          <Card className="p-6 border-border/50 bg-card/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Document Ownership</span>
              </div>
              <div className="text-xl font-display text-primary">William Brown</div>
              <div className="text-sm text-muted-foreground">Sole Inventor &amp; Owner · Quantum Lounge</div>
            </div>
            <div className="text-right text-xs text-muted-foreground space-y-1">
              <div>© {YEAR} William Brown. All rights reserved.</div>
              <div>Effective: {DATE}</div>
              <div className="text-muted-foreground/40">CONFIDENTIAL — NOT FOR PUBLIC DISTRIBUTION</div>
            </div>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-primary" />
      <h2 className="text-sm font-display tracking-widest text-muted-foreground uppercase">{label}</h2>
      <div className="flex-1 h-px bg-border/40" />
    </div>
  );
}
