import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'

export default function TermsOfServicePage() {
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
                        <h1 className="text-2xl font-bold text-slate-900 mb-1">Terms of Service</h1>
                        <p className="text-xs text-slate-400">Last updated: May 2026</p>
                    </div>

                    <p>
                        By using the Access Control System, you agree to comply with facility security policies and operating procedures.
                    </p>

                    <div className="space-y-2">
                        <h2 className="text-base font-semibold text-slate-900">1. User Obligations</h2>
                        <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs">
                            <li>Physical RFID cards are personal and non-transferable.</li>
                            <li>Lost or compromised access badges must be reported immediately to deactivate privileges.</li>
                            <li>Tampering with readers, relays, or door sensors is strictly prohibited and logged as an intrusion event.</li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-base font-semibold text-slate-900">2. Administrator Rights</h2>
                        <p className="text-xs text-slate-600">
                            Administrators hold the ability to modify access permissions, configure door relays, and set expiration parameters on guest passes.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-base font-semibold text-slate-900">3. Audit Logging</h2>
                        <p className="text-xs text-slate-600">
                            Every badge swipe, remote unlock, and door event is logged with precise timestamps for compliance and security auditing.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}