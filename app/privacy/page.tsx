import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-dark-900 text-white font-sans selection:bg-primary/30 pb-20">
            <header className="border-b border-dark-700/50 bg-dark-900/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="text-primary w-6 h-6" />
                        <span className="text-lg font-semibold tracking-tight">Access Control System</span>
                    </div>
                    <Link
                        href="/"
                        className="text-sm font-medium text-dark-muted hover:text-white transition-colors flex items-center gap-2"
                    >
                        <ArrowLeft size={16} /> Back to Home
                    </Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 pt-12 md:pt-20">
                <div className="space-y-8 text-gray-300 leading-relaxed">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Privacy Policy</h1>
                        <p className="text-sm text-dark-muted mb-8">Last updated: May 2026</p>

                        <p className="mb-4">
                            This Privacy Policy explains how our Access Control System collects, uses, and protects your personal information. As a security platform, we take the confidentiality of your data seriously.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white">1. Data We Collect</h2>
                        <p>To provide access control services, we collect the following types of information:</p>
                        <ul className="list-disc pl-5 space-y-2 text-dark-muted">
                            <li>Personal details provided during registration (Name, Email Address, Job Title).</li>
                            <li>Authentication credentials (securely hashed passwords).</li>
                            <li>Hardware identifiers (RFID Card UID assigned to you).</li>
                            <li>System usage data, including timestamps of when and where you access specific doors or zones.</li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white">2. How We Use Your Data</h2>
                        <p>The collected data is used exclusively for the core functions of the system:</p>
                        <ul className="list-disc pl-5 space-y-2 text-dark-muted">
                            <li>To verify your identity and grant or deny access to physical locations.</li>
                            <li>To maintain an accurate log of entry and exit events for administrative and security audits.</li>
                            <li>To prevent unauthorized access and enforce anti-passback rules.</li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white">3. Data Security</h2>
                        <p>
                            We implement strict security measures to protect your data. All communication between hardware terminals and the central server is encrypted. Passwords are never stored in plain text, and your physical access history is accessible only to authorized administrators.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white">4. Data Retention and Immutable Logs</h2>
                        <p>
                            To ensure the absolute integrity of the security audit trail, manual deletion of access logs through the user interface is intentionally restricted by design. This guarantees a tamper-proof history of facility access events.
                        </p>
                        <p>
                            For long-term storage and database optimization in production environments, system administrators are advised to configure server-level Data Retention Policies (such as cron jobs or database partitioning) to automatically archive older logs according to their organization's specific compliance requirements.
                        </p>
                    </div>

                    <div className="space-y-4 p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl mt-8">
                        <h2 className="text-xl font-semibold text-blue-400">Project Status & Reliability</h2>
                        <p className="text-sm">
                            This system was developed as a Bachelor Diploma Project at the National Technical University of Ukraine "Igor Sikorsky Kyiv Polytechnic Institute". It has undergone rigorous testing and demonstrates high reliability, stability, and strict data protection standards. However, as with any security solution, we strongly advise conducting additional independent audits before integrating it into a live enterprise environment.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}