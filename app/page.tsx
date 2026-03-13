import Link from 'next/link'
import { prisma } from '@/app/lib/prisma'
import { verifySession } from '@/app/lib/session'
import {
    Shield,
    ChevronRight,
    Wifi,
    Radio,
    Lock,
    Zap,
    Globe,
    CheckCircle2
} from 'lucide-react'
import React from "react";
import ScrollDownButton from "@/app/ui/app/scroll-down-button";

export default async function LandingPage() {
    const userCount = await prisma.user.count();
    const isSystemEmpty = userCount === 0;

    const userId = await verifySession();
    let isLoggedIn = false;

    if (userId && !isSystemEmpty) {
        const userExists = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true }
        });
        isLoggedIn = !!userExists;
    }

    let mainButtonLink = '/login';
    let mainButtonText = 'Sign In';

    if (isSystemEmpty) {
        mainButtonLink = '/setup';
        mainButtonText = 'Start Setup';
    } else if (isLoggedIn) {
        mainButtonLink = '/dashboard';
        mainButtonText = 'Dashboard';
    }

    const renderMainButton = (className: string) => (
        <Link
            href={mainButtonLink}
            className={className}
        >
            {mainButtonText}
            {isLoggedIn && <ChevronRight size={16} />}
        </Link>
    );

    return (
        <div className="min-h-screen bg-dark-900 text-white flex flex-col font-sans overflow-x-hidden selection:bg-primary/30">

            <header className="border-b border-dark-700/50 bg-dark-900/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Shield className="text-white w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <span className="text-lg md:text-xl font-bold tracking-tight">SecurePass ACS</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <nav className="hidden md:flex gap-6 text-sm font-medium text-dark-muted">
                            <Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
                            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
                        </nav>

                        {renderMainButton(`px-4 py-2 md:px-6 md:py-2.5 rounded-lg md:rounded-xl font-medium transition-all shadow-lg flex items-center gap-2 text-sm md:text-base ${
                            isLoggedIn
                                ? 'bg-dark-800 border border-dark-700 hover:bg-dark-700 text-white'
                                : 'bg-primary hover:bg-primary-hover text-white shadow-blue-500/20'
                        }`)}
                    </div>
                </div>
            </header>

            <main className="flex-1 flex items-center min-h-[calc(100vh-80px)] relative py-12 md:py-0">
                <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-blue-600/5 blur-[80px] md:blur-[120px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">

                    <div className="space-y-6 md:space-y-8 animate-fade-in-up text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs md:text-sm font-medium">
                            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                            Diploma Project 2026
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
                            Hardware <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                                Security
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-dark-muted max-w-lg leading-relaxed">
                            Advanced Access Control System powered by ESP32 microcontrollers and Next.js cloud infrastructure.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            {renderMainButton("bg-primary hover:bg-primary-hover text-white text-lg px-8 py-4 rounded-xl font-bold transition-all shadow-xl shadow-blue-500/25 text-center sm:text-left flex items-center justify-center gap-2")}
                        </div>
                    </div>

                    <div className="relative group perspective-1000 flex justify-center lg:justify-end mt-8 lg:mt-0">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2rem] blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>

                        <div className="relative bg-dark-800 ring-1 ring-white/10 rounded-[2rem] aspect-[4/3] flex items-center justify-center overflow-hidden shadow-2xl w-full max-w-[340px] md:max-w-none">

                            <div className="relative w-40 h-56 md:w-48 md:h-64 lg:scale-125 bg-gradient-to-br from-gray-800 to-black rounded-3xl border border-gray-700 shadow-2xl flex flex-col items-center p-4 md:p-6 transform rotate-y-12 rotate-x-6 transition-transform duration-500 group-hover:rotate-0">

                                <div className="w-full h-24 md:h-32 rounded-xl bg-gray-900/50 border border-gray-800 flex items-center justify-center relative overflow-hidden mb-6 md:mb-8">
                                    <Radio className="text-gray-600 w-12 h-12 md:w-16 md:h-16 opacity-50" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent"></div>
                                </div>

                                <div className="mt-auto flex gap-3 md:gap-4 w-full justify-center bg-black/40 p-2 md:p-3 rounded-full border border-white/5">
                                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500/30 border border-red-500/50"></div>
                                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500/30 border border-yellow-500/50"></div>
                                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e] border border-green-500"></div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <ScrollDownButton scrollToID={"how-it-works"} />
            </main>

            <section id="how-it-works" className="bg-dark-800/30 pt-16 pb-12 md:pt-24 border-t border-dark-700/50 relative">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-left md:text-center mb-10 md:mb-16">
                        <h2 className="text-3xl font-bold mb-4">How it Works</h2>
                        <p className="text-dark-muted">Simple interaction workflow.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 md:gap-8 relative">
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 border-t-2 border-dashed border-dark-700 -z-10"></div>

                        <div className="bg-dark-900 rounded-2xl border border-dark-700 overflow-hidden hover:border-blue-500/50 transition-colors group">
                            <div className="h-48 bg-gradient-to-b from-dark-800 to-dark-900 relative flex items-center justify-center border-b border-dark-700">
                                <div className="w-24 h-32 bg-gray-800 rounded-lg border border-gray-600 shadow-xl relative z-10 flex flex-col items-center justify-center">
                                    <Wifi className="text-gray-600/50 w-8 h-8" />
                                </div>
                                <div className="absolute z-20 w-16 h-10 bg-white rounded shadow-lg border-2 border-blue-500 flex items-center justify-center group-hover:translate-y-0 group-hover:scale-90 transition-all duration-700 -translate-y-12 rotate-12 group-hover:rotate-0">
                                    <div className="w-12 h-1 bg-gray-200 rounded-full"></div>
                                </div>
                            </div>
                            <div className="p-6 md:p-8">
                                <div className="text-blue-400 font-mono text-xs mb-2">STEP 01</div>
                                <h3 className="text-xl font-bold mb-2">Scan Card</h3>
                                <p className="text-dark-muted text-sm">User presents the RFID card to the device reader.</p>
                            </div>
                        </div>

                        <div className="bg-dark-900 rounded-2xl border border-dark-700 overflow-hidden hover:border-purple-500/50 transition-colors group">
                            <div className="h-48 bg-gradient-to-b from-dark-800 to-dark-900 relative flex items-center justify-center border-b border-dark-700">
                                <div className="w-24 h-32 bg-gray-800 rounded-lg border border-gray-600 shadow-xl relative z-10 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping"></div>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-40 h-40 border border-dashed border-purple-500/30 rounded-full animate-[spin_3s_linear_infinite]"></div>
                                </div>
                            </div>
                            <div className="p-6 md:p-8">
                                <div className="text-purple-400 font-mono text-xs mb-2">STEP 02</div>
                                <h3 className="text-xl font-bold mb-2">Processing</h3>
                                <p className="text-dark-muted text-sm">Device sends UID to server. Server checks database permissions.</p>
                            </div>
                        </div>

                        <div className="bg-dark-900 rounded-2xl border border-dark-700 overflow-hidden hover:border-green-500/50 transition-colors group">
                            <div className="h-48 bg-gradient-to-b from-dark-800 to-dark-900 relative flex items-center justify-center border-b border-dark-700">
                                <div className="w-24 h-32 bg-gray-800 rounded-lg border border-gray-600 shadow-xl relative z-10 flex flex-col items-center justify-center group-hover:shadow-[0_0_30px_rgba(34,197,94,0.2)] transition-shadow">
                                    <div className="w-16 h-16 bg-black/20 rounded flex items-center justify-center">
                                        <CheckCircle2 className="text-green-500 w-8 h-8 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                                    </div>
                                    <div className="w-full mt-4 flex justify-center">
                                        <div className="w-3 h-3 bg-green-600 rounded-full group-hover:bg-green-400 group-hover:shadow-[0_0_10px_#4ade80] transition-colors"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 md:p-8">
                                <div className="text-green-400 font-mono text-xs mb-2">STEP 03</div>
                                <h3 className="text-xl font-bold mb-2">Access Granted</h3>
                                <p className="text-dark-muted text-sm">If approved, the door unlocks and the event is logged.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-1/2 w-0.5 h-24 bg-gradient-to-b from-dark-700 to-blue-500/50 -translate-x-1/2 z-0 hidden md:block"></div>
            </section>

            <section id="features" className="bg-dark-900 pt-12 pb-24 relative overflow-hidden">
                <div className="max-w-5xl mx-auto px-6 relative z-10">

                    <div className="text-left md:text-center mb-12 md:mb-20">
                        <h2 className="text-3xl font-bold mb-4">Key Features</h2>
                        <p className="text-dark-muted">Built for security and performance.</p>
                    </div>

                    <div className="relative">

                        <div className="md:hidden space-y-6">
                            <div className="bg-dark-800 border border-dark-700 p-6 rounded-xl shadow-lg">
                                <div className="w-12 h-12 bg-dark-900 rounded-lg flex items-center justify-center mb-4 border border-dark-700">
                                    <Lock className="text-blue-400" size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-white">Secure Encryption</h3>
                                <p className="text-dark-muted leading-relaxed text-sm">AES-128 encryption ensures that card data cannot be intercepted or cloned during transmission between ESP32 and Server.</p>
                            </div>

                            <div className="bg-dark-800 border border-dark-700 p-6 rounded-xl shadow-lg">
                                <div className="w-12 h-12 bg-dark-900 rounded-lg flex items-center justify-center mb-4 border border-dark-700">
                                    <Zap className="text-purple-400" size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-white">Instant Response</h3>
                                <p className="text-dark-muted leading-relaxed text-sm">Optimized WebSocket connection provides less than 200ms response time for locking mechanisms, ensuring no delay at the door.</p>
                            </div>

                            <div className="bg-dark-800 border border-dark-700 p-6 rounded-xl shadow-lg">
                                <div className="w-12 h-12 bg-dark-900 rounded-lg flex items-center justify-center mb-4 border border-dark-700">
                                    <Globe className="text-green-400" size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-white">Global Access</h3>
                                <p className="text-dark-muted leading-relaxed text-sm">Manage your secure facility from anywhere in the world using our cloud dashboard. Revoke access instantly.</p>
                            </div>
                        </div>

                        <div className="hidden md:block relative">
                            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-transparent -translate-x-1/2"></div>

                            <div className="space-y-24">
                                <div className="relative flex items-center justify-between group">
                                    <div className="absolute left-1/2 w-4 h-4 rounded-full bg-dark-900 border-2 border-blue-500 -translate-x-1/2 z-10 shadow-[0_0_10px_#3b82f6]"></div>
                                    <div className="w-1/2 pr-12 text-right flex flex-col items-end">
                                        <div className="w-14 h-14 bg-dark-800 rounded-xl flex items-center justify-center mb-4 border border-dark-700 group-hover:border-blue-500/50 transition-colors shadow-lg">
                                            <Lock className="text-blue-400" size={28} />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-3 text-white">Secure Encryption</h3>
                                        <p className="text-dark-muted leading-relaxed">AES-128 encryption ensures that card data cannot be intercepted or cloned during transmission between ESP32 and Server.</p>
                                    </div>
                                    <div className="w-1/2"></div>
                                </div>

                                <div className="relative flex items-center justify-between group">
                                    <div className="absolute left-1/2 w-4 h-4 rounded-full bg-dark-900 border-2 border-purple-500 -translate-x-1/2 z-10 shadow-[0_0_10px_#a855f7]"></div>
                                    <div className="w-1/2"></div>
                                    <div className="w-1/2 pl-12 text-left flex flex-col items-start">
                                        <div className="w-14 h-14 bg-dark-800 rounded-xl flex items-center justify-center mb-4 border border-dark-700 group-hover:border-purple-500/50 transition-colors shadow-lg">
                                            <Zap className="text-purple-400" size={28} />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-3 text-white">Instant Response</h3>
                                        <p className="text-dark-muted leading-relaxed">Optimized WebSocket connection provides less than 200ms response time for locking mechanisms, ensuring no delay at the door.</p>
                                    </div>
                                </div>

                                <div className="relative flex items-center justify-between group">
                                    <div className="absolute left-1/2 w-4 h-4 rounded-full bg-dark-900 border-2 border-green-500 -translate-x-1/2 z-10 shadow-[0_0_10px_#22c55e]"></div>
                                    <div className="w-1/2 pr-12 text-right flex flex-col items-end">
                                        <div className="w-14 h-14 bg-dark-800 rounded-xl flex items-center justify-center mb-4 border border-dark-700 group-hover:border-green-500/50 transition-colors shadow-lg">
                                            <Globe className="text-green-400" size={28} />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-3 text-white">Global Access</h3>
                                        <p className="text-dark-muted leading-relaxed">Manage your secure facility from anywhere in the world using our cloud dashboard. Revoke access instantly.</p>
                                    </div>
                                    <div className="w-1/2"></div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            <footer className="border-t border-dark-700 bg-dark-900 py-12 relative z-20">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">

                    <div className="flex items-center gap-2">
                        <Shield className="text-primary w-6 h-6" />
                        <span className="font-bold text-lg">SecurePass ACS</span>
                    </div>

                    <div className="text-dark-muted text-sm flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
                        <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link href="#" className="hover:text-white transition-colors">Documentation</Link>
                    </div>

                    <div className="text-dark-muted text-sm text-center md:text-right">
                        © 2026 Diploma Project. All rights reserved.
                        <br/>
                        Developed by <b className="text-white">Dmytro Vereshko</b>
                    </div>
                </div>
            </footer>
        </div>
    )
}