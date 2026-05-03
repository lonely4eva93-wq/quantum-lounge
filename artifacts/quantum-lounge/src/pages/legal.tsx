import { motion } from "framer-motion";
import { Shield, Zap, Lock, FileText, User, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";

const YEAR = new Date().getFullYear();

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/20 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-2"
          >
            <Zap className="w-7 h-7 text-primary" />
            <span className="font-display tracking-widest text-primary text-xl">QUANTUM LOUNGE</span>
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight">Legal & Ownership</h1>
          <p className="text-muted-foreground mt-2">Terms, Privacy, Copyright & IP Notice</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        {/* Ownership Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 border-primary/30 bg-primary/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex items-start gap-4">
              <User className="w-10 h-10 text-primary flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-primary mb-1">Inventor & Sole Owner</h2>
                <p className="text-3xl font-display tracking-widest text-foreground">William Brown</p>
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                  All rights to the Quantum Lounge application — including the concept, codebase, brand identity,
                  user experience design, database schema, AI features, revenue systems, and all associated
                  intellectual property — are owned exclusively by <strong className="text-foreground">William Brown</strong>.
                </p>
                <p className="text-muted-foreground mt-2 text-sm">
                  © {YEAR} William Brown. All rights reserved.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Copyright */}
        <Section icon={FileText} title="Copyright Notice">
          <p>
            Quantum Lounge and all content within — including but not limited to source code, design assets,
            written text, database structures, algorithms, AI prompt systems, and audiovisual elements — are
            protected under applicable copyright law.
          </p>
          <p className="mt-3">
            <strong>Owner:</strong> William Brown<br />
            <strong>Year of Creation:</strong> {YEAR}<br />
            <strong>Application Name:</strong> Quantum Lounge<br />
            <strong>Copyright:</strong> © {YEAR} William Brown. All rights reserved.
          </p>
          <p className="mt-3">
            Unauthorized reproduction, distribution, modification, or commercial use of any part of this
            application without the express written permission of William Brown is strictly prohibited.
          </p>
        </Section>

        {/* Terms of Service */}
        <Section icon={Globe} title="Terms of Service">
          <p>By accessing or using Quantum Lounge, you agree to the following terms:</p>
          <ul className="mt-3 space-y-2 list-disc list-inside text-muted-foreground">
            <li>You must be 18 years of age or older to use this platform.</li>
            <li>All purchases (VIP memberships, Oracle readings, boosts, premium messages) are final and non-refundable unless required by applicable law.</li>
            <li>You agree not to attempt to gain unauthorized access to the system, scrape data, or engage in any activity that disrupts service.</li>
            <li>Quantum Lounge reserves the right to suspend or permanently ban any account engaging in fraudulent, abusive, or malicious behavior.</li>
            <li>The platform operator (William Brown) may modify these terms at any time. Continued use constitutes acceptance of updated terms.</li>
            <li>This service is provided "as is" without warranty of any kind, express or implied.</li>
          </ul>
        </Section>

        {/* Privacy Policy */}
        <Section icon={Lock} title="Privacy Policy">
          <p>Quantum Lounge collects and uses the following data:</p>
          <ul className="mt-3 space-y-2 list-disc list-inside text-muted-foreground">
            <li><strong className="text-foreground">Guest aliases & profiles</strong> — created by users, stored to enable lounge features.</li>
            <li><strong className="text-foreground">Messages</strong> — stored in encrypted form for the quantum messaging feature.</li>
            <li><strong className="text-foreground">Transaction records</strong> — purchases and revenue events stored for owner accounting.</li>
            <li><strong className="text-foreground">IP addresses</strong> — logged for security purposes, including threat detection and abuse prevention. Hostile IPs may be blocked.</li>
            <li><strong className="text-foreground">Session data</strong> — temporary browser session used for owner authentication only.</li>
          </ul>
          <p className="mt-4">
            We do not sell, rent, or share your personal data with third parties. Data is stored securely
            in a private PostgreSQL database and is accessible only to the platform owner, William Brown.
          </p>
          <p className="mt-3">
            To request deletion of your data, contact the platform owner directly.
          </p>
        </Section>

        {/* Security */}
        <Section icon={Shield} title="Security & Enforcement">
          <p>
            Quantum Lounge operates an active security system (Quantum Shield) that monitors all traffic
            in real time. The following activities are prohibited and will result in immediate IP-level blocking:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside text-muted-foreground">
            <li>Brute-force or credential-stuffing login attacks</li>
            <li>Automated endpoint scanning or probing</li>
            <li>Denial-of-service or high-volume request flooding</li>
            <li>Attempting to access, copy, or exfiltrate database records</li>
            <li>Any attempt to steal, leak, or snoop on proprietary code or user data</li>
          </ul>
          <p className="mt-4">
            William Brown reserves the right to pursue civil and criminal remedies against any individual
            or organization found engaging in unauthorized access, data theft, or intellectual property
            infringement related to Quantum Lounge.
          </p>
        </Section>

        {/* IP Notice */}
        <Section icon={Zap} title="Intellectual Property">
          <p>
            The following are proprietary inventions of William Brown and may not be reproduced or
            used without explicit written permission:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside text-muted-foreground">
            <li>The "Quantum Lounge" brand name and visual identity</li>
            <li>The quantum-frequency room system and energy-level mechanics</li>
            <li>The Quantum Hive Mind AI consciousness feature</li>
            <li>The Quantum Oracle AI reading system</li>
            <li>The Quantum Shield IP threat detection and kill-switch system</li>
            <li>All 8 integrated revenue stream mechanics as a combined system</li>
            <li>The quantum particle field visualizer and associated UI designs</li>
          </ul>
        </Section>

        <p className="text-center text-muted-foreground/50 text-xs pb-6">
          Quantum Lounge — Invented & owned by William Brown — © {YEAR} — All rights reserved.
        </p>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <Card className="p-6 border-border/50 bg-card/30">
        <div className="flex items-center gap-3 mb-4">
          <Icon className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold tracking-wide">{title}</h2>
        </div>
        <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
      </Card>
    </motion.div>
  );
}
