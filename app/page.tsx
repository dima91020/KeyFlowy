import Link from 'next/link'
import { prisma } from '@/app/lib/prisma'
import { verifySession } from '@/app/lib/session'
import {
    ShieldCheckIcon,
    ChevronRightIcon,
    SignalIcon,
    ComputerDesktopIcon,
    CpuChipIcon,
    LockClosedIcon,
    CreditCardIcon,
    CheckCircleIcon,
    EyeIcon,
    WrenchScrewdriverIcon,
    UserPlusIcon,
    ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
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
        <div className="min-h-screen bg-dark-900 text-white flex flex-col font-sans overflow-x-hidden selection:bg-primary/30">

            <header className="border-b border-dark-700/50 bg-dark-900/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <ShieldCheckIcon className="text-white w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <span className="text-lg md:text-xl font-semibold tracking-tight">ACS</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <nav className="hidden md:flex gap-6 text-sm font-medium text-dark-muted">
                            <Link href="#components" className="hover:text-white transition-colors">Components</Link>
                            <Link href="#how-it-works" className="hover:text-white transition-colors">Workflow</Link>
                            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
                        </nav>

                        {isLoggedIn ? (
                            <Link
                                href="/dashboard"
                                className="px-4 py-2 md:px-6 md:py-2.5 rounded-lg md:rounded-xl font-medium transition-all shadow-lg flex items-center gap-2 text-sm md:text-base bg-dark-800 border border-dark-700 hover:bg-dark-700 text-white"
                            >
                                Dashboard <ChevronRightIcon className="w-4 h-4" />
                            </Link>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-sm font-medium text-dark-muted hover:text-white transition-colors hidden sm:block"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-4 py-2 md:px-5 md:py-2.5 rounded-lg md:rounded-xl font-medium transition-all shadow-lg flex items-center gap-2 text-sm md:text-base bg-primary hover:bg-primary-hover text-white shadow-blue-500/20"
                                >
                                    Registration
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 flex items-center min-h-[calc(100vh-80px)] relative py-12 md:py-0">
                <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-blue-600/5 blur-[80px] md:blur-[120px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">

                    <div className="space-y-6 md:space-y-8 animate-fade-in-up text-left">

                        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight tracking-tight text-white mb-6">
                            Access Control <br/>
                            <span className="text-primary">System</span>
                        </h1>

                        <p className="text-lg md:text-xl text-dark-muted max-w-lg leading-relaxed mb-8">
                            A centralized and easy-to-use platform for secure facility management. Connect your smart locks, easily manage user permissions, and monitor all access events instantly from anywhere in the world.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            {isLoggedIn ? (
                                <Link
                                    href="/dashboard"
                                    className="bg-primary hover:bg-primary-hover text-white text-lg px-8 py-4 rounded-xl font-semibold transition-all shadow-xl shadow-blue-500/25 text-center sm:text-left flex items-center justify-center gap-2"
                                >
                                    Go to Dashboard <ChevronRightIcon className="w-5 h-5" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/register"
                                        className="bg-primary hover:bg-blue-600 text-white text-lg px-8 py-4 rounded-xl font-semibold transition-all shadow-xl shadow-blue-500/25 text-center flex items-center justify-center gap-2"
                                    >
                                        <UserPlusIcon className="w-5 h-5" /> Registration
                                    </Link>
                                    <Link
                                        href="/login"
                                        className="bg-dark-800 hover:bg-dark-700 text-white border border-dark-700 text-lg px-8 py-4 rounded-xl font-semibold transition-all text-center flex items-center justify-center gap-2"
                                    >
                                        <ArrowRightOnRectangleIcon className="w-5 h-5" /> Login
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="relative group perspective-1000 flex justify-center lg:justify-end mt-8 lg:mt-0">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2rem] blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>

                        <div className="relative bg-dark-800 ring-1 ring-white/10 rounded-[2rem] aspect-[4/3] flex items-center justify-center overflow-hidden shadow-2xl w-full max-w-[340px] md:max-w-none">

                            <div className="relative w-40 h-56 md:w-48 md:h-64 lg:scale-125 bg-gradient-to-br from-gray-800 to-black rounded-3xl border border-gray-700 shadow-2xl flex flex-col items-center p-4 md:p-6 transform rotate-y-12 rotate-x-6 transition-transform duration-500 group-hover:rotate-0">

                                <div className="w-full h-24 md:h-32 rounded-xl bg-gray-900/50 border border-gray-800 flex items-center justify-center relative overflow-hidden mb-6 md:mb-8">
                                    <SignalIcon className="text-gray-600 w-12 h-12 md:w-16 md:h-16 opacity-50" />
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

                <ScrollDownButton scrollToID={"components"} />
            </main>

            <section id="components" className="bg-dark-900 pt-16 pb-12 relative border-t border-dark-800">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-left md:text-center mb-12">
                        <h2 className="text-3xl font-semibold mb-4">System Architecture</h2>
                        <p className="text-dark-muted max-w-2xl mx-auto">A fully integrated ecosystem combining a convenient management panel, reliable smart reading devices, and physical security mechanisms.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-dark-800/50 border border-dark-700 p-8 rounded-2xl flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
                                <ComputerDesktopIcon className="text-blue-400 w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Online Control Panel</h3>
                            <p className="text-dark-muted text-sm leading-relaxed">A secure and user-friendly online dashboard. Here, administrators can easily add or remove employees, set up specific access rules for different doors, and view a live history of who entered where.</p>
                        </div>

                        <div className="bg-dark-800/50 border border-dark-700 p-8 rounded-2xl flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20">
                                <CpuChipIcon className="text-purple-400 w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Intelligent Readers</h3>
                            <p className="text-dark-muted text-sm leading-relaxed">Smart reading devices installed near your doors. When a person presents their card, these devices instantly process the information and securely ask the main system for permission to open the door.</p>
                        </div>

                        <div className="bg-dark-800/50 border border-dark-700 p-8 rounded-2xl flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 border border-green-500/20">
                                <LockClosedIcon className="text-green-400 w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Physical Barriers</h3>
                            <p className="text-dark-muted text-sm leading-relaxed">The actual physical security mechanisms like electronic locks on office doors, turnstiles at the main entrance, or parking gates. They automatically unlock only when a valid card is presented.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="how-it-works" className="bg-dark-800/30 pt-16 pb-12 md:pt-24 border-t border-dark-700/50 relative">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-left md:text-center mb-10 md:mb-16">
                        <h2 className="text-3xl font-semibold mb-4">Interaction Workflow</h2>
                        <p className="text-dark-muted">A fast and completely seamless verification process that takes less than a second.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 md:gap-8 relative">
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 border-t-2 border-dashed border-dark-700 -z-10"></div>

                        <div className="bg-dark-900 rounded-2xl border border-dark-700 overflow-hidden hover:border-blue-500/50 transition-colors group shadow-lg">
                            <div className="h-48 bg-gradient-to-b from-dark-800 to-dark-900 relative flex items-center justify-center border-b border-dark-700">
                                <div className="w-24 h-32 bg-gray-800 rounded-lg border border-gray-600 shadow-xl relative z-10 flex flex-col items-center justify-center">
                                    <CreditCardIcon className="text-gray-600/50 w-8 h-8" />
                                </div>
                                <div className="absolute z-20 w-16 h-10 bg-white rounded shadow-lg border-2 border-blue-500 flex items-center justify-center group-hover:translate-y-0 group-hover:scale-90 transition-all duration-700 -translate-y-12 rotate-12 group-hover:rotate-0">
                                    <div className="w-12 h-1 bg-gray-200 rounded-full"></div>
                                </div>
                            </div>
                            <div className="p-6 md:p-8">
                                <div className="text-blue-400 font-mono text-xs mb-2 font-medium">STEP 01</div>
                                <h3 className="text-xl font-semibold mb-2">Setup & Assign</h3>
                                <p className="text-dark-muted text-sm leading-relaxed">First, the system administrator uses the online dashboard to register a new person and assign them a unique personal card. You can give permanent access to regular employees or create temporary passes for guests.</p>
                            </div>
                        </div>

                        <div className="bg-dark-900 rounded-2xl border border-dark-700 overflow-hidden hover:border-purple-500/50 transition-colors group shadow-lg">
                            <div className="h-48 bg-gradient-to-b from-dark-800 to-dark-900 relative flex items-center justify-center border-b border-dark-700">
                                <div className="w-24 h-32 bg-gray-800 rounded-lg border border-gray-600 shadow-xl relative z-10 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping"></div>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-40 h-40 border border-dashed border-purple-500/30 rounded-full animate-[spin_3s_linear_infinite]"></div>
                                </div>
                            </div>
                            <div className="p-6 md:p-8">
                                <div className="text-purple-400 font-mono text-xs mb-2 font-medium">STEP 02</div>
                                <h3 className="text-xl font-semibold mb-2">Instant Validation</h3>
                                <p className="text-dark-muted text-sm leading-relaxed">When a person wants to enter, they tap their card on the door reader. The reader instantly sends a secure request to the central server to check if this person is allowed to enter this exact door right now.</p>
                            </div>
                        </div>

                        <div className="bg-dark-900 rounded-2xl border border-dark-700 overflow-hidden hover:border-green-500/50 transition-colors group shadow-lg">
                            <div className="h-48 bg-gradient-to-b from-dark-800 to-dark-900 relative flex items-center justify-center border-b border-dark-700">
                                <div className="w-24 h-32 bg-gray-800 rounded-lg border border-gray-600 shadow-xl relative z-10 flex flex-col items-center justify-center group-hover:shadow-[0_0_30px_rgba(34,197,94,0.2)] transition-shadow">
                                    <div className="w-16 h-16 bg-black/20 rounded flex items-center justify-center">
                                        <CheckCircleIcon className="text-green-500 w-8 h-8 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                                    </div>
                                    <div className="w-full mt-4 flex justify-center">
                                        <div className="w-3 h-3 bg-green-600 rounded-full group-hover:bg-green-400 group-hover:shadow-[0_0_10px_#4ade80] transition-colors"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 md:p-8">
                                <div className="text-green-400 font-mono text-xs mb-2 font-medium">STEP 03</div>
                                <h3 className="text-xl font-semibold mb-2">Access Granted</h3>
                                <p className="text-dark-muted text-sm leading-relaxed">If the system approves the request, it immediately sends a signal back to unlock the door. At the exact same moment, the central dashboard records this event to keep your building secure.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-1/2 w-0.5 h-24 bg-gradient-to-b from-dark-700 to-blue-500/50 -translate-x-1/2 z-0 hidden md:block"></div>
            </section>

            <section id="features" className="bg-dark-900 pt-12 pb-24 relative overflow-hidden">
                <div className="max-w-5xl mx-auto px-6 relative z-10">

                    <div className="text-left md:text-center mb-12 md:mb-20">
                        <h2 className="text-3xl font-semibold mb-4">Core Capabilities</h2>
                        <p className="text-dark-muted">Advanced yet easy-to-use tools designed for absolute control and security.</p>
                    </div>

                    <div className="relative">

                        <div className="md:hidden space-y-6">
                            <div className="bg-dark-800 border border-dark-700 p-6 rounded-xl shadow-lg">
                                <div className="w-12 h-12 bg-dark-900 rounded-lg flex items-center justify-center mb-4 border border-dark-700">
                                    <EyeIcon className="text-blue-400 w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-white">Live Monitoring</h3>
                                <p className="text-dark-muted leading-relaxed text-sm">Keep a close eye on your entire building security. Our live dashboard automatically updates the moment someone opens a door or if a reader loses power, ensuring you are always aware of the situation.</p>
                            </div>

                            <div className="bg-dark-800 border border-dark-700 p-6 rounded-xl shadow-lg">
                                <div className="w-12 h-12 bg-dark-900 rounded-lg flex items-center justify-center mb-4 border border-dark-700">
                                    <ShieldCheckIcon className="text-purple-400 w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-white">Flexible Access Rules</h3>
                                <p className="text-dark-muted leading-relaxed text-sm">Create specific security policies for your organization. Restrict certain employees to only enter during working hours, block access to sensitive areas, and automatically prevent people from sharing their cards.</p>
                            </div>

                            <div className="bg-dark-800 border border-dark-700 p-6 rounded-xl shadow-lg">
                                <div className="w-12 h-12 bg-dark-900 rounded-lg flex items-center justify-center mb-4 border border-dark-700">
                                    <WrenchScrewdriverIcon className="text-green-400 w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-white">Remote Management</h3>
                                <p className="text-dark-muted leading-relaxed text-sm">Manage your physical security infrastructure without leaving your desk. If a door lock needs to stay open longer for deliveries, you can change these settings remotely with just a few clicks.</p>
                            </div>
                        </div>

                        <div className="hidden md:block relative">
                            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-transparent -translate-x-1/2"></div>

                            <div className="space-y-24">
                                <div className="relative flex items-center justify-between group">
                                    <div className="absolute left-1/2 w-4 h-4 rounded-full bg-dark-900 border-2 border-blue-500 -translate-x-1/2 z-10 shadow-[0_0_10px_#3b82f6]"></div>
                                    <div className="w-1/2 pr-12 text-right flex flex-col items-end">
                                        <div className="w-14 h-14 bg-dark-800 rounded-xl flex items-center justify-center mb-4 border border-dark-700 group-hover:border-blue-500/50 transition-colors shadow-lg">
                                            <EyeIcon className="text-blue-400 w-7 h-7" />
                                        </div>
                                        <h3 className="text-2xl font-semibold mb-3 text-white">Live Monitoring</h3>
                                        <p className="text-dark-muted leading-relaxed">Keep a close eye on your entire building security. Our live dashboard automatically updates the moment someone opens a door or if a reader loses power, ensuring you are always aware of the situation.</p>
                                    </div>
                                    <div className="w-1/2"></div>
                                </div>

                                <div className="relative flex items-center justify-between group">
                                    <div className="absolute left-1/2 w-4 h-4 rounded-full bg-dark-900 border-2 border-purple-500 -translate-x-1/2 z-10 shadow-[0_0_10px_#a855f7]"></div>
                                    <div className="w-1/2"></div>
                                    <div className="w-1/2 pl-12 text-left flex flex-col items-start">
                                        <div className="w-14 h-14 bg-dark-800 rounded-xl flex items-center justify-center mb-4 border border-dark-700 group-hover:border-purple-500/50 transition-colors shadow-lg">
                                            <ShieldCheckIcon className="text-purple-400 w-7 h-7" />
                                        </div>
                                        <h3 className="text-2xl font-semibold mb-3 text-white">Flexible Access Rules</h3>
                                        <p className="text-dark-muted leading-relaxed">Create specific security policies for your organization. Restrict certain employees to only enter during working hours, block access to sensitive areas, and automatically prevent people from sharing their cards.</p>
                                    </div>
                                </div>

                                <div className="relative flex items-center justify-between group">
                                    <div className="absolute left-1/2 w-4 h-4 rounded-full bg-dark-900 border-2 border-green-500 -translate-x-1/2 z-10 shadow-[0_0_10px_#22c55e]"></div>
                                    <div className="w-1/2 pr-12 text-right flex flex-col items-end">
                                        <div className="w-14 h-14 bg-dark-800 rounded-xl flex items-center justify-center mb-4 border border-dark-700 group-hover:border-green-500/50 transition-colors shadow-lg">
                                            <WrenchScrewdriverIcon className="text-green-400 w-7 h-7" />
                                        </div>
                                        <h3 className="text-2xl font-semibold mb-3 text-white">Remote Management</h3>
                                        <p className="text-dark-muted leading-relaxed">Manage your physical security infrastructure without leaving your desk. If a door lock needs to stay open longer for deliveries, you can change these settings remotely with just a few clicks.</p>
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
                        <ShieldCheckIcon className="text-primary w-6 h-6" />
                        <span className="font-semibold text-lg">Access Control System</span>
                    </div>

                    <div className="text-dark-muted text-sm flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link href="https://github.com/dima91020/diploma-access-control" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Documentation</Link>
                    </div>

                    <div className="text-dark-muted text-sm text-center md:text-right">
                        © 2026 Access Control System. All rights reserved.
                        <br/>
                        Developed by <span className="text-white font-medium">Dmytro Vereshko</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}