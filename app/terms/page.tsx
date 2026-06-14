import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'

export default function TermsOfServicePage() {
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
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Terms of Service</h1>
                        <p className="text-sm text-dark-muted mb-8">Last updated: May 2026</p>

                        <p className="mb-4">
                            By using the Access Control System, you agree to comply with the following terms. These rules are designed to ensure the physical security of the facility and the integrity of the system.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white">1. User Responsibilities</h2>
                        <ul className="list-disc pl-5 space-y-2 text-dark-muted">
                            <li>You must not share your personal RFID access card with any other person.</li>
                            <li>You must not share your login credentials for the online dashboard.</li>
                            <li>If your access card is lost or stolen, you must immediately report it to the system administrator so it can be deactivated.</li>
                            <li>You must not attempt to bypass physical locks or manipulate hardware reading devices.</li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white">2. Administrator Privileges</h2>
                        <p>
                            System administrators have full authority to grant, modify, or revoke access permissions at any time. Administrators are responsible for maintaining the accuracy of user roles and ensuring that guest passes are strictly time-limited.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white">3. System Logs and Monitoring</h2>
                        <p>
                            You acknowledge that every entry and exit attempt using your card is logged by the system. This data is monitored by administrators to ensure facility security and verify compliance with access rules.
                        </p>
                    </div>

                    <div className="space-y-4 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl mt-8">
                        <h2 className="text-xl font-semibold text-yellow-500">4. Deployment and Liability</h2>
                        <p className="text-sm">
                            This platform was developed as a Bachelor Diploma Project at KPI. While the system has been thoroughly tested under simulated conditions and has proven to be highly functional and responsive, it is provided "as is" for enterprise deployment. We strongly recommend performing additional on-site testing and security evaluations prior to deploying the system in critical infrastructure or commercial facilities.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}