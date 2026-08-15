import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-900 selection:text-white pb-20">
            <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <Shield className="text-slate-900 w-5 h-5" />
                        <span className="text-base font-bold tracking-tight text-slate-900">Smart ACS</span>
                    </div>
                    <Link
                        href="/"
                        className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5"
                    >
                        <ArrowLeft size={14} /> Back to Home
                    </Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 pt-12">
                <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-6 text-slate-700 leading-relaxed text-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-1">Privacy Policy</h1>
                        <p className="text-xs text-slate-400">Last updated: May 2026</p>
                    </div>

                    <p>
                        This Privacy Policy explains how our Access Control System collects, uses, and protects your personal information and physical telemetry data.
                    </p>

                    <div className="space-y-2">
                        <h2 className="text-base font-semibold text-slate-900">1. Data We Collect</h2>
                        <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs">
                            <li>Personal information (Name, Email Address, Job Title).</li>
                            <li>Authentication credentials (securely hashed with bcryptjs).</li>
                            <li>Hardware identifiers (assigned RFID Card UID).</li>
                            <li>Timestamped telemetry logs of physical entries, exits, and intrusion events.</li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-base font-semibold text-slate-900">2. How We Use Data</h2>
                        <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs">
                            <li>Validate entry permissions against door access whitelists.</li>
                            <li>Enforce Anti-Passback (APB) sequence validation.</li>
                            <li>Maintain verifiable security audit trails and work hours analytics.</li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-base font-semibold text-slate-900">3. Immutable Audit Trails</h2>
                        <p className="text-xs text-slate-600">
                            To ensure security audit integrity, access logs cannot be tampered with or deleted through the UI. Server-side log retention and archival policies should be configured by system administrators.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}