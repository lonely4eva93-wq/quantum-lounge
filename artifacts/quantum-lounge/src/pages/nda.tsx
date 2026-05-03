import { motion } from "framer-motion";
import { Shield, FileText, Zap, AlertTriangle, Lock, Scale, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

const YEAR = new Date().getFullYear();
const EXPIRY_YEAR = YEAR + 5;
const EFFECTIVE_DATE = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

export default function NdaPage() {
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
            <span>5-Year NDA · Effective {EFFECTIVE_DATE}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        {/* Title Block */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-8 border-primary/30 bg-primary/5 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,243,255,0.04),transparent_70%)]" />
            <div className="relative">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <Scale className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h1 className="text-3xl font-display tracking-widest text-foreground mb-2">
                NON-DISCLOSURE AGREEMENT
              </h1>
              <p className="text-primary font-semibold tracking-wide">FIVE (5) YEAR TERM</p>
              <p className="text-muted-foreground text-sm mt-3">
                Quantum Lounge · Proprietary &amp; Confidential
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
                <span><strong className="text-foreground">Owner:</strong> William Brown</span>
                <span><strong className="text-foreground">Effective:</strong> {EFFECTIVE_DATE}</span>
                <span><strong className="text-foreground">Expires:</strong> {EXPIRY_YEAR} (unless terminated earlier)</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Warning Banner */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="flex items-start gap-3 bg-yellow-950/30 border border-yellow-800/50 rounded-xl p-4">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-200/80">
              <strong className="text-yellow-300">LEGALLY BINDING DOCUMENT.</strong> Any individual who accesses, uses, contributes to, works on, or is otherwise associated with Quantum Lounge in any capacity — as an employee, contractor, partner, consultant, or associate — is bound by the terms of this Non-Disclosure Agreement. Violation of any provision herein may result in civil litigation, injunctive relief, and/or criminal proceedings to the fullest extent permitted by applicable law.
            </p>
          </div>
        </motion.div>

        {/* NDA Body */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-5">

          <NdaSection number="1" title="Parties">
            <p>
              This Non-Disclosure Agreement ("<strong>Agreement</strong>") is entered into as of <strong>{EFFECTIVE_DATE}</strong> ("<strong>Effective Date</strong>") by and between:
            </p>
            <ul className="mt-3 space-y-2">
              <li><strong className="text-foreground">Disclosing Party:</strong> William Brown, sole inventor and owner of Quantum Lounge, including all associated intellectual property, software, systems, revenue models, and business operations (hereinafter "<strong>Owner</strong>" or "<strong>Disclosing Party</strong>").</li>
              <li><strong className="text-foreground">Receiving Party:</strong> Any individual or entity — including but not limited to employees, contractors, contract employees, freelancers, consultants, advisors, partners, associates, or any person granted access to Quantum Lounge systems, source code, data, business information, or operations in any capacity (hereinafter "<strong>Recipient</strong>" or "<strong>Receiving Party</strong>").</li>
            </ul>
          </NdaSection>

          <NdaSection number="2" title="Definition of Confidential Information">
            <p>
              "<strong>Confidential Information</strong>" means any and all non-public information, in any form or medium (oral, written, electronic, or otherwise), that is disclosed or made accessible by the Disclosing Party and relates to Quantum Lounge, including but not limited to:
            </p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside text-muted-foreground">
              <li>Source code, software architecture, algorithms, databases, and technical documentation</li>
              <li>Business strategies, revenue models, financial data, pricing structures, and projections</li>
              <li>User data, guest information, transaction records, and behavioral analytics</li>
              <li>AI systems, prompts, training data, and machine learning implementations</li>
              <li>Security systems, authentication methods, kill-switch mechanisms, and threat detection logic</li>
              <li>Intellectual property, inventions, designs, branding, and trade secrets</li>
              <li>Third-party integrations, API keys, credentials, and vendor relationships</li>
              <li>Product roadmaps, unreleased features, and development plans</li>
              <li>The identity, contact information, or role of any employee, contractor, or associate of the Owner</li>
              <li>Any information regarding the Owner's personal or professional activities related to Quantum Lounge</li>
              <li>Any other information designated as confidential or that a reasonable person would understand to be confidential given the nature of the disclosure</li>
            </ul>
          </NdaSection>

          <NdaSection number="3" title="Obligations of the Receiving Party">
            <p>The Receiving Party agrees to:</p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside text-muted-foreground">
              <li>Hold all Confidential Information in strict confidence and not disclose it to any third party without the express prior written consent of William Brown</li>
              <li>Use Confidential Information solely for the purpose of fulfilling their authorized role in connection with Quantum Lounge</li>
              <li>Not copy, reproduce, reverse-engineer, decompile, or otherwise exploit any Confidential Information beyond what is strictly necessary for their authorized role</li>
              <li>Promptly notify William Brown in writing upon becoming aware of any actual or suspected unauthorized disclosure or use of Confidential Information</li>
              <li>Not use any Confidential Information to compete with, undermine, replicate, or otherwise act against the interests of Quantum Lounge or William Brown</li>
              <li>Return or permanently destroy all materials containing Confidential Information upon request or upon termination of their engagement, whichever occurs first</li>
            </ul>
          </NdaSection>

          <NdaSection number="4" title="Non-Disclosure — During and After Engagement">
            <p>
              The confidentiality obligations set forth in this Agreement apply:
            </p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside text-muted-foreground">
              <li><strong className="text-foreground">During Engagement:</strong> From the Effective Date through the duration of any employment, contract, or association with Quantum Lounge.</li>
              <li><strong className="text-foreground">After Engagement:</strong> For a period of <strong className="text-foreground">five (5) years</strong> following the termination or conclusion of any such engagement, regardless of the reason for termination.</li>
            </ul>
            <p className="mt-3">
              The Receiving Party expressly agrees that the five-year post-engagement period is reasonable and necessary to protect the legitimate business interests of the Owner.
            </p>
          </NdaSection>

          <NdaSection number="5" title="Non-Liability &amp; Indemnification">
            <p>
              The Receiving Party agrees that:
            </p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside text-muted-foreground">
              <li>William Brown and Quantum Lounge shall not be held liable for any claims, damages, or losses arising from the Receiving Party's use of information provided during their engagement, except where directly caused by the Owner's gross negligence or willful misconduct</li>
              <li>The Receiving Party shall indemnify, defend, and hold harmless William Brown, Quantum Lounge, and any affiliated entities or associates from and against any claims, suits, damages, costs, and expenses — including reasonable legal fees — arising from any breach of this Agreement by the Receiving Party</li>
              <li>The Receiving Party shall not hold William Brown or any associate of Quantum Lounge liable for decisions made in the ordinary course of business operations</li>
              <li>No claim of any kind shall be made against William Brown related to proprietary business decisions, technology choices, or operational changes made at the Owner's sole discretion</li>
            </ul>
          </NdaSection>

          <NdaSection number="6" title="Exclusions">
            <p>This Agreement does not apply to information that the Receiving Party can demonstrate:</p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside text-muted-foreground">
              <li>Was already known to the Receiving Party prior to disclosure, without restriction</li>
              <li>Is or becomes publicly available through no fault or act of the Receiving Party</li>
              <li>Is independently developed by the Receiving Party without use of Confidential Information</li>
              <li>Is required to be disclosed by applicable law or valid court order — provided the Receiving Party gives William Brown prompt written notice before such disclosure and cooperates to seek a protective order</li>
            </ul>
          </NdaSection>

          <NdaSection number="7" title="Intellectual Property Ownership">
            <p>
              Nothing in this Agreement grants the Receiving Party any ownership, license, or rights to any Confidential Information or intellectual property of Quantum Lounge or William Brown. All Confidential Information remains the exclusive property of William Brown at all times.
            </p>
            <p className="mt-3">
              Any work product, inventions, improvements, or developments created by the Receiving Party in connection with Quantum Lounge during the term of their engagement shall be considered works made for hire and shall be the exclusive property of William Brown, to the fullest extent permitted by law.
            </p>
          </NdaSection>

          <NdaSection number="8" title="Remedies &amp; Legal Consequences">
            <p>
              The Receiving Party acknowledges that:
            </p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside text-muted-foreground">
              <li>Any breach or threatened breach of this Agreement would cause immediate and irreparable harm to William Brown and Quantum Lounge, for which monetary damages alone would be an inadequate remedy</li>
              <li>William Brown shall be entitled to seek equitable relief — including injunctions, restraining orders, and specific performance — without posting bond or proving actual damages, in addition to all other remedies available at law or in equity</li>
              <li>The Receiving Party shall be liable for all costs, legal fees, and damages arising from any unauthorized disclosure, misappropriation, or breach of this Agreement</li>
              <li>Violations may be pursued to the <strong className="text-foreground">fullest extent of applicable civil and criminal law</strong>, including but not limited to claims under trade secret law, computer fraud statutes, intellectual property law, and breach of contract</li>
              <li>No waiver of any provision of this Agreement shall constitute a waiver of any other provision or any subsequent breach</li>
            </ul>
          </NdaSection>

          <NdaSection number="9" title="Term">
            <p>
              This Agreement is effective from <strong className="text-foreground">{EFFECTIVE_DATE}</strong> and shall remain in full force and effect for a period of <strong className="text-foreground">five (5) years</strong>, expiring no earlier than <strong className="text-foreground">{EXPIRY_YEAR}</strong>, unless earlier terminated by mutual written agreement of both parties or by William Brown at his sole discretion.
            </p>
            <p className="mt-3">
              Termination of this Agreement shall not relieve the Receiving Party of any obligation with respect to Confidential Information disclosed prior to the date of termination. Obligations related to Confidential Information shall survive termination of this Agreement.
            </p>
          </NdaSection>

          <NdaSection number="10" title="Governing Law &amp; Jurisdiction">
            <p>
              This Agreement shall be governed by and construed in accordance with the laws of the jurisdiction in which William Brown resides at the time of enforcement, without regard to conflict-of-law principles. Any disputes arising under this Agreement shall be resolved exclusively in the courts of that jurisdiction, and the Receiving Party consents to personal jurisdiction therein.
            </p>
          </NdaSection>

          <NdaSection number="11" title="Entire Agreement &amp; Severability">
            <p>
              This Agreement constitutes the entire agreement between the parties with respect to its subject matter and supersedes all prior negotiations, representations, warranties, and understandings. If any provision of this Agreement is found to be invalid or unenforceable, it shall be modified to the minimum extent necessary to make it enforceable, and the remaining provisions shall continue in full force and effect.
            </p>
          </NdaSection>

          <NdaSection number="12" title="Acceptance">
            <p>
              By accessing, using, or working on any part of Quantum Lounge — in any capacity — the Receiving Party acknowledges that they have read, understood, and agree to be legally bound by the terms of this Non-Disclosure Agreement.
            </p>
          </NdaSection>
        </motion.div>

        {/* Signature Block */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card className="p-8 border-border/50 bg-card/30">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Disclosing Party</p>
                <div className="border-b border-foreground/30 pb-2 mb-2">
                  <p className="text-xl font-display tracking-wide text-primary">William Brown</p>
                </div>
                <p className="text-sm text-muted-foreground">Inventor &amp; Sole Owner, Quantum Lounge</p>
                <p className="text-xs text-muted-foreground mt-1">© {YEAR} William Brown. All rights reserved.</p>
                <p className="text-xs text-muted-foreground mt-3">{EFFECTIVE_DATE}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Receiving Party</p>
                <div className="border-b border-border/50 pb-2 mb-2 h-8" />
                <p className="text-sm text-muted-foreground">Name (print): ________________________________</p>
                <p className="text-sm text-muted-foreground mt-2">Title/Role: ___________________________________</p>
                <p className="text-sm text-muted-foreground mt-2">Date: ________________________________________</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <p className="text-center text-muted-foreground/40 text-xs pb-6">
          Quantum Lounge NDA · Owned by William Brown · Effective {EFFECTIVE_DATE} · Valid through {EXPIRY_YEAR} · Legally Binding · All Rights Reserved
        </p>
      </div>
    </div>
  );
}

function NdaSection({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <Card className="p-6 border-border/40 bg-card/20">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold">
          {number}
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold tracking-widest uppercase text-foreground mb-3">
            {title}
          </h2>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
            {children}
          </div>
        </div>
      </div>
    </Card>
  );
}
