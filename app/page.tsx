import Link from 'next/link'
import { prisma } from '@/app/lib/prisma'
import { verifySession } from '@/app/lib/session'
import {
    ChevronRightIcon,
    ArrowRightOnRectangleIcon,
    UserPlusIcon,
    ShieldCheckIcon,
    CpuChipIcon,
    ComputerDesktopIcon,
    LockClosedIcon,
    ChartBarIcon,
    ClockIcon,
    KeyIcon,
    CircleStackIcon,
    EyeIcon,
    WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'
import { Badge } from '@/app/ui/badge'
import React from "react";
import ScrollDownButton from "@/app/ui/app/scroll-down-button";

export default async function LandingPage() {
    const userId = await verifySession();
    let isLoggedIn = false;

    if (userId) {
        const userExists = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true }
        });
        isLoggedIn = !!userExists;
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
            {/* Header */}
            <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                            <ShieldCheckIcon className="w-5 h-5" />
                        </div>
                        <span className="text-base font-bold tracking-tight text-slate-900">KeyFlowy</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <nav className="hidden md:flex gap-6 text-xs font-medium text-slate-600">
                            <Link href="#components" className="hover:text-slate-900 transition-colors">Architecture</Link>
                            <Link href="#how-it-works" className="hover:text-slate-900 transition-colors">Workflow</Link>
                            <Link href="#features" className="hover:text-slate-900 transition-colors">Features</Link>
                        </nav>

                        {isLoggedIn ? (
                            <Link
                                href="/dashboard"
                                className="px-4 py-2 rounded-lg font-medium transition-colors text-xs bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 shadow-sm"
                            >
                                Dashboard <ChevronRightIcon className="w-3.5 h-3.5" />
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/login"
                                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-3.5 py-1.5 rounded-lg font-medium transition-colors text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex items-center py-16 md:py-24 border-b border-slate-200 bg-white">
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6 text-left">
                        <Badge variant="neutral" dot>
                            PACS & IoT Telemetry Architecture
                        </Badge>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
                            Access Control & Security Platform
                        </h1>

                        <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                            A centralized platform for physical facility access control. Configure hardware relays, manage personnel schedules, enforce Anti-Passback policies, and monitor real-time entry logs.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            {isLoggedIn ? (
                                <Link
                                    href="/dashboard"
                                    className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm text-center flex items-center justify-center gap-2"
                                >
                                    Open Dashboard <ChevronRightIcon className="w-4 h-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/register"
                                        className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm text-center flex items-center justify-center gap-2"
                                    >
                                        <UserPlusIcon className="w-4 h-4" /> Register Organization
                                    </Link>
                                    <Link
                                        href="/login"
                                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors text-center flex items-center justify-center gap-2"
                                    >
                                        <ArrowRightOnRectangleIcon className="w-4 h-4" /> Sign In
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Gateway Status</span>
                            <Badge variant="success" dot pulse>
                                WebSocket Active
                            </Badge>
                        </div>

                        <div className="space-y-2 text-xs">
                            <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                                <span className="font-semibold text-slate-800">Main Entrance Turnstile (ESP32)</span>
                                <span className="text-slate-500 font-mono">24:0A:C4:00:01:10</span>
                            </div>
                            <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                                <span className="font-semibold text-slate-800">Server Room Door (Relay NC)</span>
                                <span className="text-slate-500 font-mono">24:0A:C4:00:02:20</span>
                            </div>
                            <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                                <span className="font-semibold text-slate-800">Executive Office (Relay NO)</span>
                                <span className="text-slate-500 font-mono">24:0A:C4:00:03:30</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* System Architecture */}
            <section id="components" className="py-16 bg-slate-50 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-10 text-left md:text-center">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Architecture</h2>
                        <p className="text-slate-500 text-sm mt-1 max-w-xl mx-auto">Hardware, gateway, and cloud management layers designed for reliability.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4 text-slate-700">
                                <ComputerDesktopIcon className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-semibold text-slate-900 mb-2">Central Management UI</h3>
                            <p className="text-slate-600 text-xs leading-relaxed">Web portal for role-based access, device provisioning, real-time telemetry, and CSV audit logs.</p>
                        </div>

                        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4 text-slate-700">
                                <CpuChipIcon className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-semibold text-slate-900 mb-2">ESP32 Dual I2C Controller</h3>
                            <p className="text-slate-600 text-xs leading-relaxed">Dedicated microcontrollers interfacing dual PN532 NFC readers with independent entry/exit hardware buses.</p>
                        </div>

                        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4 text-slate-700">
                                <LockClosedIcon className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-semibold text-slate-900 mb-2">Relay Actuators & Sensors</h3>
                            <p className="text-slate-600 text-xs leading-relaxed">Physical electro-mechanical lock relays (NO/NC) and magnetic reed door status sensors with intrusion alarms.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Workflow */}
            <section id="how-it-works" className="py-16 bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-10 text-left md:text-center">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Access Verification Flow</h2>
                        <p className="text-slate-500 text-sm mt-1">Sub-second authorization and audit cycle.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
                            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">Step 01</span>
                            <h3 className="text-base font-semibold text-slate-900 mt-1 mb-2">Badge Tap</h3>
                            <p className="text-slate-600 text-xs leading-relaxed">User scans MIFARE / NFC card on the ESP32 terminal. The UID is captured via I2C.</p>
                        </div>

                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
                            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">Step 02</span>
                            <h3 className="text-base font-semibold text-slate-900 mt-1 mb-2">Engine Verification</h3>
                            <p className="text-slate-600 text-xs leading-relaxed">The server checks whitelist permissions, Anti-Passback state, and guest validity time window.</p>
                        </div>

                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
                            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">Step 03</span>
                            <h3 className="text-base font-semibold text-slate-900 mt-1 mb-2">Relay & Audit</h3>
                            <p className="text-slate-600 text-xs leading-relaxed">Access command triggers the relay for configured seconds and registers an immutable timestamped log.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-16 bg-slate-50">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="mb-10 text-left md:text-center">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Capabilities</h2>
                        <p className="text-slate-500 text-sm mt-1">Built with production security standards.</p>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-6">
                        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-2">
                            <EyeIcon className="w-5 h-5 text-slate-700" />
                            <h3 className="font-semibold text-slate-900 text-sm">Real-time Telemetry</h3>
                            <p className="text-slate-600 text-xs leading-relaxed">Instant live update of door states, intrusion alerts, and active controller health.</p>
                        </div>

                        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-2">
                            <ShieldCheckIcon className="w-5 h-5 text-slate-700" />
                            <h3 className="font-semibold text-slate-900 text-sm">Anti-Passback Protection</h3>
                            <p className="text-slate-600 text-xs leading-relaxed">Enforces sequential entry/exit tracking to prevent badge passback misuse.</p>
                        </div>

                        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-2">
                            <WrenchScrewdriverIcon className="w-5 h-5 text-slate-700" />
                            <h3 className="font-semibold text-slate-900 text-sm">Remote Management</h3>
                            <p className="text-slate-600 text-xs leading-relaxed">Remote manual door unlock and over-the-air relay duration configuration.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white py-8">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-2 text-slate-900 font-semibold">
                        <ShieldCheckIcon className="w-4 h-4 text-slate-900" />
                        <span>KeyFlowy Platform</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
                    </div>

                    <p>© 2026 KeyFlowy. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}