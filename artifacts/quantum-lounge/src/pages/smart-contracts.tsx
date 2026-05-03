import { motion } from "framer-motion";
import { Shield, FileText, Zap, AlertTriangle, Lock, Scale, Clock, Code2, ArrowRightLeft, Users, DollarSign, Globe, Star } from "lucide-react";
import { Card } from "@/components/ui/card";

const YEAR = new Date().getFullYear();
const EFFECTIVE_DATE = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

export default function SmartContractsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/20 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-primary" />
            <span className="font-display tracking-widest text-primary text-sm">QUANTUM LOUNGE</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>Smart Contract Registry · Effective {EFFECTIVE_DATE}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        {/* Title Block */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-8 border-primary/30 bg-primary/5 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,243,255,0.05),transparent_70%)]" />
            <div className="relative">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <Code2 className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h1 className="text-3xl font-display tracking-widest text-foreground mb-2">
                SMART CONTRACT REGISTRY
              </h1>
              <p className="text-primary font-semibold tracking-wide">QUANTUM LOUNGE · MULTI-CHAIN FRAMEWORK</p>
              <p className="text-muted-foreground text-sm mt-3">
                Proprietary &amp; Confidential · All Rights Reserved
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
                <span><strong className="text-foreground">Author &amp; Owner:</strong> William Brown</span>
                <span><strong className="text-foreground">Effective:</strong> {EFFECTIVE_DATE}</span>
                <span><strong className="text-foreground">Jurisdiction:</strong> Owner's Governing Jurisdiction</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Warning Banner */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="flex items-start gap-3 bg-yellow-950/30 border border-yellow-800/50 rounded-xl p-4">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-200/80">
              <strong className="text-yellow-300">LEGALLY BINDING.</strong> These Smart Contract terms govern all on-platform transactions, promotions, revenue distributions, and peer-to-peer transfers within Quantum Lounge. All contracts are authored by and the exclusive intellectual property of <strong className="text-yellow-300">William Brown</strong>. No portion may be reproduced, modified, or deployed without express written consent of the Owner.
            </p>
          </div>
        </motion.div>

        {/* Contract Index */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}>
          <Card className="p-5 border-border/40 bg-card/20">
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" /> Contract Index
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                { num: "SC-001", title: "Ownership & IP Declaration", icon: Shield },
                { num: "SC-002", title: "Revenue Share Contract", icon: DollarSign },
                { num: "SC-003", title: "New User XRP Promotion", icon: Star },
                { num: "SC-004", title: "Peer-to-Peer Transfer Contract", icon: ArrowRightLeft },
                { num: "SC-005", title: "Multi-Chain Framework", icon: Globe },
                { num: "SC-006", title: "Platform Fee & Royalty Contract", icon: Code2 },
                { num: "SC-007", title: "User Account Terms (Crypto)", icon: Users },
                { num: "SC-008", title: "Liability & Indemnification", icon: Lock },
              ].map((item) => (
                <div key={item.num} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/3 border border-white/5">
                  <item.icon className="w-4 h-4 text-primary/60 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-mono text-primary/70">{item.num}</div>
                    <div className="text-sm text-foreground">{item.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Contract Bodies */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-5">

          <ContractSection code="SC-001" title="Ownership & Intellectual Property Declaration" icon={Shield}>
            <p>
              All smart contracts, logic systems, revenue models, promotional frameworks, and cryptographic distribution mechanisms deployed within or in association with <strong className="text-foreground">Quantum Lounge</strong> are the sole intellectual property of <strong className="text-foreground">William Brown</strong> ("<strong>Owner</strong>"), as the original inventor and author of the Quantum Lounge platform.
            </p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside text-muted-foreground">
              <li>All smart contract code, logic, schemas, and associated documentation are protected under applicable intellectual property, trade secret, and copyright law</li>
              <li>No third party may deploy, copy, fork, modify, or commercially exploit any contract herein without the express written authorization of William Brown</li>
              <li>Any derivative work or integration built upon these contracts, whether on-chain or off-chain, remains the property of William Brown unless a separate written license agreement has been executed</li>
              <li>The Quantum Lounge brand, name, logo, and associated marks in connection with these contracts are owned exclusively by William Brown</li>
            </ul>
            <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs font-mono text-primary">
              AUTHOR: William Brown · © {YEAR} · All Rights Reserved · Quantum Lounge
            </div>
          </ContractSection>

          <ContractSection code="SC-002" title="Revenue Share Contract" icon={DollarSign}>
            <p>
              This contract governs the distribution of platform revenue generated through all transactions occurring within Quantum Lounge, including but not limited to: house fees, energy upgrades, VIP memberships, room rentals, oracle readings, peer-to-peer tips, leaderboard boosts, premium messages, and sponsorships.
            </p>
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground mt-4 mb-2">Revenue Allocation</h3>
            <div className="space-y-2">
              {[
                { party: "William Brown (Platform Owner)", share: "Primary", note: "All net platform revenue flows to the Owner after operational costs" },
                { party: "Transaction Reserve Pool", share: "Configurable %", note: "Owner-defined reserve maintained for promotional rewards and bonus distributions" },
                { party: "XRP Promotion Fund", share: "Configurable %", note: "Portion earmarked for new user XRP bonuses and learn-to-earn promotions" },
                { party: "Network / Gas Fees", share: "Actual cost", note: "On-chain transaction costs deducted at point of settlement" },
              ].map((row) => (
                <div key={row.party} className="flex items-start gap-3 p-3 rounded-lg bg-white/3 border border-white/5">
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-foreground">{row.party}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{row.note}</div>
                  </div>
                  <div className="text-sm font-bold text-primary flex-shrink-0">{row.share}</div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-muted-foreground">
              Revenue share percentages are set exclusively by William Brown and may be adjusted at any time at the Owner's sole discretion. Any changes take effect immediately upon platform update and do not require prior notice to users.
            </p>
          </ContractSection>

          <ContractSection code="SC-003" title="New User XRP Promotion Contract" icon={Star}>
            <p>
              Quantum Lounge may, at the sole discretion of William Brown, offer promotional XRP credits or token bonuses to newly registered users as part of an onboarding incentive program ("<strong>New User XRP Promotion</strong>").
            </p>
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground mt-4 mb-2">Promotion Terms</h3>
            <ul className="space-y-1.5 list-disc list-inside text-muted-foreground">
              <li>New users who create a Quantum Lounge account may be eligible to receive a small promotional XRP credit upon account creation and completion of eligibility requirements</li>
              <li>Promotional XRP amounts are determined solely by William Brown and may vary by campaign, region, or time period</li>
              <li>XRP credits issued under this promotion are subject to a holding period before withdrawal or transfer, as specified in the applicable campaign terms</li>
              <li>Eligibility requires: valid account creation, compliance with KYC/identity requirements where applicable, and adherence to these terms and the Quantum Lounge Terms of Service</li>
              <li>Promotional XRP is not transferable to other users unless explicitly permitted by a separate promotion campaign authorized by William Brown</li>
              <li>Quantum Lounge and William Brown reserve the right to revoke promotional credits at any time if abuse, fraud, or terms violations are detected</li>
              <li>This promotion does not constitute an investment product, financial advice, or a guarantee of any returns</li>
            </ul>
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground mt-4 mb-2">Learn-to-Earn Integration</h3>
            <p className="text-muted-foreground">
              As part of the Quantum Lounge multi-chain education framework, users may earn additional XRP credits by completing educational modules, quizzes, or guided experiences related to blockchain, XRP, and decentralized finance. Earned credits are tracked on-platform and subject to the same withdrawal terms as promotional credits.
            </p>
            <div className="mt-3 p-3 rounded-lg bg-yellow-950/30 border border-yellow-800/40 text-xs text-yellow-200/70">
              <strong className="text-yellow-300">Regulatory Notice:</strong> Promotional XRP distributions may be subject to local regulatory requirements. Users are responsible for understanding and complying with applicable tax and financial regulations in their jurisdiction. Quantum Lounge and William Brown make no representations as to the tax treatment of promotional XRP rewards.
            </div>
          </ContractSection>

          <ContractSection code="SC-004" title="Peer-to-Peer Transfer Contract" icon={ArrowRightLeft}>
            <p>
              This contract governs all peer-to-peer ("<strong>P2P</strong>") transfers of credits, tips, or digital assets between registered Quantum Lounge users on the platform.
            </p>
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground mt-4 mb-2">Transfer Rules</h3>
            <ul className="space-y-1.5 list-disc list-inside text-muted-foreground">
              <li>Users may transfer in-platform credits to other registered users subject to platform transfer limits set by William Brown</li>
              <li>All P2P transfers are final and non-reversible once confirmed on the platform</li>
              <li>A platform fee, set at the Owner's discretion, may be deducted from each P2P transfer and allocated to the Revenue Share pool</li>
              <li>P2P transfers may not be used for prohibited activities including money laundering, fraud, or circumvention of platform terms</li>
              <li>William Brown reserves the right to freeze, reverse, or investigate any P2P transfer suspected of violating these terms or applicable law</li>
              <li>Minimum and maximum transfer amounts are set by the platform and subject to change without notice</li>
              <li>Users sending XRP or other digital assets via P2P transfers are solely responsible for ensuring the accuracy of recipient wallet addresses</li>
            </ul>
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground mt-4 mb-2">Platform Cut</h3>
            <p className="text-muted-foreground">
              On every P2P transaction, Quantum Lounge retains a platform fee as specified in the current fee schedule maintained by William Brown. This fee contributes to operational costs, the XRP promotion fund, and platform revenue. The current fee schedule is available in the owner dashboard and may be updated at any time.
            </p>
          </ContractSection>

          <ContractSection code="SC-005" title="Multi-Chain Framework" icon={Globe}>
            <p>
              Quantum Lounge operates a multi-chain compatible credit and rewards framework, with primary support for the <strong className="text-foreground">XRP Ledger (XRPL)</strong> and planned interoperability with other compatible blockchain networks.
            </p>
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground mt-4 mb-2">Supported Networks</h3>
            <div className="space-y-2">
              {[
                { chain: "XRP Ledger (XRPL)", status: "Primary", note: "Native XRP distribution, P2P transfers, and promotional rewards" },
                { chain: "Ethereum (ETH)", status: "Planned", note: "ERC-20 token compatibility and smart contract deployment" },
                { chain: "Solana (SOL)", status: "Planned", note: "High-throughput P2P transfers and NFT badge integration" },
                { chain: "Polygon (MATIC)", status: "Planned", note: "Low-fee layer-2 transactions and reward distributions" },
              ].map((c) => (
                <div key={c.chain} className="flex items-start gap-3 p-3 rounded-lg bg-white/3 border border-white/5">
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-foreground">{c.chain}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{c.note}</div>
                  </div>
                  <div className={`text-xs font-mono px-2 py-0.5 rounded-full border flex-shrink-0 ${
                    c.status === "Primary"
                      ? "text-green-400 border-green-400/30 bg-green-400/10"
                      : "text-muted-foreground border-white/10 bg-white/5"
                  }`}>{c.status}</div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-muted-foreground">
              All multi-chain integrations are deployed, managed, and governed exclusively by William Brown. Chain support may be added, modified, or removed at any time at the Owner's sole discretion. Users interacting with on-chain contracts do so at their own risk and are responsible for applicable network fees.
            </p>
          </ContractSection>

          <ContractSection code="SC-006" title="Platform Fee & Royalty Contract" icon={Code2}>
            <p>
              William Brown is entitled to a royalty and platform fee from all economic activity occurring within Quantum Lounge, whether on-chain or off-chain. This includes but is not limited to:
            </p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside text-muted-foreground">
              <li><strong className="text-foreground">Transaction Royalty:</strong> A percentage of every purchase, tip, upgrade, membership, and P2P transfer</li>
              <li><strong className="text-foreground">NFT Badge Royalty:</strong> A royalty on any secondary sales or transfers of Quantum Lounge achievement badges or digital collectibles</li>
              <li><strong className="text-foreground">Sponsored Room Fee:</strong> A recurring fee on all sponsored room arrangements</li>
              <li><strong className="text-foreground">On-Chain Settlement Fee:</strong> A fee on all on-chain withdrawal or settlement transactions</li>
              <li><strong className="text-foreground">API Integration Fee:</strong> A fee on any third-party applications integrating with Quantum Lounge APIs or smart contracts</li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              All fees flow directly to William Brown as the Platform Owner. Fee rates are set, adjusted, and enforced by the Owner without obligation to provide advance notice to users.
            </p>
          </ContractSection>

          <ContractSection code="SC-007" title="User Account Terms (Crypto)" icon={Users}>
            <p>
              By creating a Quantum Lounge account and participating in any crypto, XRP, or digital asset feature, users expressly agree to the following:
            </p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside text-muted-foreground">
              <li>Users are solely responsible for the security of their own wallet addresses, private keys, and seed phrases — Quantum Lounge and William Brown will never ask for private keys</li>
              <li>Users acknowledge that digital asset values fluctuate and that any XRP or other crypto credited or earned on the platform may change in market value</li>
              <li>Users must be of legal age in their jurisdiction to participate in digital asset transactions</li>
              <li>Users who provide false identity information to claim promotional rewards will have their accounts terminated and credits forfeited</li>
              <li>New user account terms are incorporated by reference into these smart contract terms and have equal legal weight</li>
              <li>Quantum Lounge reserves the right to implement KYC (Know Your Customer) verification for withdrawals exceeding specified thresholds, as required by applicable regulation</li>
              <li>Accounts found to be in breach of these terms may be suspended, credits forfeited, and legal action pursued by William Brown at his sole discretion</li>
            </ul>
          </ContractSection>

          <ContractSection code="SC-008" title="Liability & Indemnification" icon={Lock}>
            <p>
              To the maximum extent permitted by applicable law:
            </p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside text-muted-foreground">
              <li><strong className="text-foreground">No Financial Guarantees:</strong> William Brown and Quantum Lounge make no representations or warranties regarding the value, liquidity, or future price of any digital asset distributed or credited through the platform</li>
              <li><strong className="text-foreground">No Investment Advice:</strong> Nothing in these smart contract terms or on the Quantum Lounge platform constitutes financial, investment, tax, or legal advice</li>
              <li><strong className="text-foreground">Limitation of Liability:</strong> William Brown's maximum liability to any user arising from or related to these smart contracts shall not exceed the total fees paid by that user to the platform in the preceding 90 days</li>
              <li><strong className="text-foreground">Blockchain Risk:</strong> Users acknowledge the inherent risks of blockchain technology including but not limited to network failures, smart contract bugs, regulatory changes, and loss of access — Quantum Lounge is not liable for these risks</li>
              <li><strong className="text-foreground">Indemnification:</strong> Users agree to indemnify, defend, and hold harmless William Brown, Quantum Lounge, and all affiliates from any claims, losses, or expenses arising from the user's violation of these terms or applicable law</li>
              <li><strong className="text-foreground">Force Majeure:</strong> Quantum Lounge is not liable for failure to perform obligations due to circumstances beyond reasonable control including regulatory actions, network outages, or acts of god</li>
            </ul>
          </ContractSection>

        </motion.div>

        {/* Execution Block */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card className="p-8 border-border/50 bg-card/30">
            <div className="text-xs text-muted-foreground uppercase tracking-widest mb-5 flex items-center gap-2">
              <Scale className="w-3.5 h-3.5" /> Contract Execution
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Contract Author &amp; Owner</p>
                <div className="border-b border-primary/40 pb-2 mb-2">
                  <p className="text-2xl font-display tracking-wide text-primary">William Brown</p>
                </div>
                <p className="text-sm text-muted-foreground">Inventor, Author &amp; Sole Owner</p>
                <p className="text-sm text-muted-foreground">Quantum Lounge · Multi-Chain Platform</p>
                <p className="text-xs text-muted-foreground mt-2">© {YEAR} William Brown. All rights reserved.</p>
                <p className="text-xs text-muted-foreground mt-1">Effective: {EFFECTIVE_DATE}</p>
              </div>
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Registered Contracts</p>
                {["SC-001", "SC-002", "SC-003", "SC-004", "SC-005", "SC-006", "SC-007", "SC-008"].map((code) => (
                  <div key={code} className="flex items-center gap-2 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                    <span className="font-mono text-primary">{code}</span>
                    <span className="text-muted-foreground/50">— Active</span>
                    <span className="ml-auto text-muted-foreground/30">{EFFECTIVE_DATE}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Governing law */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          <Card className="p-5 border-border/40 bg-card/20">
            <div className="text-xs font-bold uppercase tracking-widest text-foreground mb-2">Governing Law &amp; Disputes</div>
            <p className="text-sm text-muted-foreground">
              These Smart Contract terms are governed by the laws of the jurisdiction in which William Brown resides at the time of enforcement. Any disputes shall be resolved exclusively by William Brown or in the courts of that jurisdiction. Users waive any right to class action proceedings in connection with these terms. These terms supersede any prior agreements and may be updated by William Brown at any time, with updates effective immediately upon posting.
            </p>
          </Card>
        </motion.div>

        <p className="text-center text-muted-foreground/40 text-xs pb-6">
          Quantum Lounge Smart Contract Registry · Author: William Brown · Effective {EFFECTIVE_DATE} · Legally Binding · All Rights Reserved · © {YEAR}
        </p>
      </div>
    </div>
  );
}

function ContractSection({
  code,
  title,
  icon: Icon,
  children,
}: {
  code: string;
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-6 border-border/40 bg-card/20">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div className="text-center mt-1 text-[10px] font-mono text-primary/50">{code}</div>
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold tracking-widest uppercase text-foreground mb-3">{title}</h2>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
        </div>
      </div>
    </Card>
  );
}
