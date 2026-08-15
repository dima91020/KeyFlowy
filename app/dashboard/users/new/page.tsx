'use client'

import { useActionState, useEffect, useState, useRef } from 'react'
import { createUserAction, UserState, getOnlineDevices, getAllAdminDevices, getCurrentUserId } from '../actions'
import {
    ChevronLeftIcon,
    ArrowDownTrayIcon,
    UserIcon,
    CreditCardIcon,
    WifiIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ClipboardDocumentIcon,
    CalendarIcon,
    ClockIcon,
    XMarkIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import clsx from 'clsx'
import { MultiSelect } from '@/app/ui/users/multi-select'
import { CustomSelect } from "@/app/ui/logs/custom-select"

type DeviceOption = {
    macAddress: string;
    name: string;
}

type AllDeviceOption = {
    id: string;
    name: string;
    isOnline: boolean;
}

interface Option {
    value: string;
    label: string;
}

const generateDateOptions = (): Option[] => {
    const opts: Option[] = []
    const today = new Date()
    for (let i = 0; i < 30; i++) {
        const d = new Date(today)
        d.setDate(today.getDate() + i)
        const val = d.toISOString().split('T')[0]
        const labelDate = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
        let label = `${d.toLocaleDateString('en-GB', { weekday: 'short' })}, ${labelDate}`
        if (i === 0) label = `Today, ${labelDate}`
        if (i === 1) label = `Tomorrow, ${labelDate}`
        opts.push({ value: val, label })
    }
    return opts
}

const generateTimeOptions = (): Option[] => {
    const opts: Option[] = []
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 30) {
            const val = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
            opts.push({ value: val, label: val })
        }
    }
    return opts
}

export default function NewUserPage() {
    const initialState: UserState = { message: null, errors: {}, inputs: {} }
    const [state, action, isPending] = useActionState(createUserAction, initialState)

    const [role, setRole] = useState<'USER' | 'GUEST'>('USER')
    const [isScanning, setIsScanning] = useState(false)
    const [scannedUid, setScannedUid] = useState('')
    const [devices, setDevices] = useState<DeviceOption[]>([])
    const [allDevices, setAllDevices] = useState<AllDeviceOption[]>([])
    const [selectedDeviceMac, setSelectedDeviceMac] = useState<string>('')
    const [copied, setCopied] = useState(false)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)

    const dateOptions = generateDateOptions()
    const timeOptions = generateTimeOptions()

    const socketRef = useRef<WebSocket | null>(null)
    const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        getCurrentUserId().then(id => setCurrentUserId(id));

        getOnlineDevices().then((list) => {
            setDevices(list);
            if (list.length > 0) {
                setSelectedDeviceMac(list[0].macAddress);
            }
        });

        getAllAdminDevices().then((list) => {
            setAllDevices(list);
        });
    }, []);

    useEffect(() => {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'
        const ws = new WebSocket(wsUrl);

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);

                if (msg.type === 'DEVICE_STATUS') {
                    getOnlineDevices().then((list) => {
                        setDevices(list);
                        setSelectedDeviceMac(prev => {
                            if (list.find(d => d.macAddress === prev)) return prev;
                            return list.length > 0 ? list[0].macAddress : '';
                        });
                    });

                    getAllAdminDevices().then((list) => {
                        setAllDevices(list);
                    });
                }

                if (msg.type === 'EVENT' && msg.payload?.startsWith('UID:')) {
                    if (msg.mac === selectedDeviceMac || !selectedDeviceMac) {
                        const uid = msg.payload.replace('UID:', '');
                        setScannedUid(uid);

                        setIsScanning(false);
                        if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);

                        const isInsideCheckbox = document.getElementById('isInsideCheckbox') as HTMLInputElement;
                        if (isInsideCheckbox) {
                            isInsideCheckbox.checked = (msg.direction === 'EXIT');
                        }
                    }
                }
            } catch {
                // Ignore malformed WS packets
            }
        };

        socketRef.current = ws;
        return () => {
            ws.close();
            if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
        };
    }, [selectedDeviceMac]);

    const handleScan = () => {
        if (!selectedDeviceMac) {
            alert("No device selected! Please select an online scanner.");
            return;
        }

        if (!currentUserId) {
            alert("Authorization error. Please refresh the page.");
            return;
        }

        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            if (isScanning) {
                setIsScanning(false);
                if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);

                socketRef.current.send(JSON.stringify({
                    type: 'COMMAND',
                    target: selectedDeviceMac,
                    command: 'CANCEL_SCAN',
                    userId: currentUserId
                }));
            } else {
                setIsScanning(true);
                setScannedUid('');

                socketRef.current.send(JSON.stringify({
                    type: 'COMMAND',
                    target: selectedDeviceMac,
                    command: 'START_SCAN',
                    userId: currentUserId
                }));

                scanTimeoutRef.current = setTimeout(() => {
                    setIsScanning(false);
                }, 15000);
            }
        } else {
            alert("WS Disconnected");
        }
    };

    const copyCredentials = () => {
        if (state.credentials) {
            const text = `Smart ACS Portal Access\nLogin: ${state.credentials.email}\nPassword: ${state.credentials.password}`
            navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 3000)
        }
    }

    if (state.success) {
        return (
            <div className="p-6 md:p-8 max-w-xl mx-auto space-y-6">
                <div className="text-center pt-6">
                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                        <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 mb-1">
                        {role === 'GUEST' ? 'Guest Pass Created' : 'Employee Registered'}
                    </h1>
                    <p className="text-xs text-slate-500">
                        {role === 'GUEST' ? 'The card is active for the configured time window.' : 'Provide the generated credentials to the employee.'}
                    </p>
                </div>

                {state.credentials && role === 'USER' && (
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                        <div>
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Email</span>
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 font-mono text-xs mt-1">
                                {state.credentials.email}
                            </div>
                        </div>
                        <div>
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Temporary Password</span>
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 font-mono text-base tracking-widest text-center font-bold mt-1">
                                {state.credentials.password}
                            </div>
                        </div>

                        <button
                            onClick={copyCredentials}
                            className="w-full py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium"
                        >
                            {copied ? <CheckCircleIcon className="w-4 h-4" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
                            {copied ? 'Copied to Clipboard!' : 'Copy Credentials'}
                        </button>
                    </div>
                )}

                <div className="text-center pt-2">
                    <Link href="/dashboard/users" className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        ← Return to Users List
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 md:p-8 max-w-xl mx-auto space-y-6">
            <Link
                href="/dashboard/users"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
                <ChevronLeftIcon className="w-3.5 h-3.5" /> Back to Users
            </Link>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between pb-5 mb-5 border-b border-slate-100">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">New User</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Register a person and bind an RFID pass.</p>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setRole('USER')}
                            className={clsx(
                                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                                role === 'USER' ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                            )}
                        >
                            Employee
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('GUEST')}
                            className={clsx(
                                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                                role === 'GUEST' ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                            )}
                        >
                            Guest
                        </button>
                    </div>
                </div>

                <form action={action} className="space-y-4">
                    <input type="hidden" name="role" value={role} />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700">Full Name</label>
                            <input
                                name="name"
                                defaultValue={state.inputs?.name as string}
                                placeholder="John Doe"
                                className={clsx(
                                    "w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:bg-white focus:border-slate-900 transition-colors",
                                    state.errors?.name ? "border-rose-400" : "border-slate-200"
                                )}
                            />
                            {state.errors?.name && <p className="text-rose-600 text-xs">{state.errors.name[0]}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700">
                                {role === 'USER' ? 'Job Title' : 'Note / Organization'}
                            </label>
                            <input
                                name="jobTitle"
                                defaultValue={state.inputs?.jobTitle as string}
                                placeholder={role === 'USER' ? "Software Engineer" : "Client Meeting"}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:bg-white focus:border-slate-900 transition-colors"
                            />
                        </div>
                    </div>

                    {role === 'USER' && (
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700">Email Address <span className="text-rose-500">*</span></label>
                            <input
                                name="email"
                                type="email"
                                defaultValue={state.inputs?.email as string}
                                placeholder="name@company.com"
                                className={clsx(
                                    "w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:bg-white focus:border-slate-900 transition-colors",
                                    state.errors?.email ? "border-rose-400" : "border-slate-200"
                                )}
                            />
                            {state.errors?.email && <p className="text-rose-600 text-xs">{state.errors.email[0]}</p>}
                        </div>
                    )}

                    {role === 'GUEST' && (
                        <div className="pt-2">
                            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-2">
                                <ClockIcon className="w-4 h-4 text-slate-400" /> Pass Validity Window
                            </label>

                            <div className="grid grid-cols-1 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                <div className="space-y-1">
                                    <span className="text-[11px] font-medium text-slate-500">Valid From</span>
                                    <div className="grid grid-cols-[1fr_95px] gap-2">
                                        <CustomSelect
                                            name="validFromDate"
                                            options={dateOptions}
                                            defaultValue={state.inputs?.validFromDate as string || dateOptions[0].value}
                                            icon={<CalendarIcon className="w-3.5 h-3.5" />}
                                        />
                                        <CustomSelect
                                            name="validFromTime"
                                            options={timeOptions}
                                            defaultValue={state.inputs?.validFromTime as string || '09:00'}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[11px] font-medium text-slate-500">Valid Until</span>
                                    <div className="grid grid-cols-[1fr_95px] gap-2">
                                        <CustomSelect
                                            name="validUntilDate"
                                            options={dateOptions}
                                            defaultValue={state.inputs?.validUntilDate as string || dateOptions[1].value}
                                            icon={<CalendarIcon className="w-3.5 h-3.5" />}
                                        />
                                        <CustomSelect
                                            name="validUntilTime"
                                            options={timeOptions}
                                            defaultValue={state.inputs?.validUntilTime as string || '18:00'}
                                        />
                                    </div>
                                    {state.errors?.validUntilTime && <p className="text-rose-600 text-xs">{state.errors.validUntilTime[0]}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-3 border-t border-slate-100 space-y-3">
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">Live Hardware Scanner</label>
                            {devices.length > 0 ? (
                                <CustomSelect
                                    options={devices.map(d => ({ value: d.macAddress, label: `${d.name} (Online)` }))}
                                    defaultValue={selectedDeviceMac || devices[0].macAddress}
                                    onChange={setSelectedDeviceMac}
                                    icon={<WifiIcon className="w-3.5 h-3.5" />}
                                />
                            ) : (
                                <div className="text-xs text-slate-500 bg-white px-3 py-2 rounded-lg border border-slate-200 flex items-center gap-2">
                                    <ArrowPathIcon className="w-3.5 h-3.5 animate-spin text-slate-400" />
                                    No online reader nodes found. You can still enter the UID manually.
                                </div>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700">Access Card UID</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <CreditCardIcon className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                                    <input
                                        name="cardUid"
                                        id="cardUidInput"
                                        defaultValue={scannedUid || (state.inputs?.cardUid as string)}
                                        placeholder={isScanning ? "Tap card on reader..." : "e.g. 1A2B3C4D"}
                                        className={clsx(
                                            "w-full bg-slate-50 border rounded-lg pl-9 pr-3 py-2 text-xs font-mono uppercase tracking-wider text-slate-900 outline-none focus:bg-white focus:border-slate-900 transition-colors",
                                            state.errors?.cardUid ? "border-rose-400" : "border-slate-200",
                                            isScanning && "border-amber-400 bg-amber-50"
                                        )}
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={handleScan}
                                    disabled={devices.length === 0}
                                    className={clsx(
                                        "px-4 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border",
                                        isScanning
                                            ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"
                                            : devices.length === 0
                                                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                                : "bg-slate-900 hover:bg-slate-800 text-white border-slate-900"
                                    )}
                                >
                                    {isScanning ? <XMarkIcon className="w-4 h-4" /> : <WifiIcon className="w-4 h-4" />}
                                    <span>{isScanning ? 'Cancel' : 'Scan'}</span>
                                </button>
                            </div>
                            {state.errors?.cardUid && <p className="text-rose-600 text-xs">{state.errors.cardUid[0]}</p>}
                        </div>
                    </div>

                    <div className="space-y-1 pt-3 border-t border-slate-100">
                        <label className="text-xs font-semibold text-slate-700">Assign Permitted Access Points</label>
                        <MultiSelect
                            name="deviceIds"
                            placeholder="Select permitted doors..."
                            options={allDevices.map(d => ({
                                value: d.id,
                                label: `${d.name} ${!d.isOnline ? '(Offline)' : ''}`
                            }))}
                        />
                        {state.errors?.deviceIds && <p className="text-rose-600 text-xs">{state.errors.deviceIds[0]}</p>}
                    </div>

                    {state.message && !state.success && (
                        <div className="text-rose-700 text-xs bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                            {state.message}
                        </div>
                    )}

                    <div className="pt-3 flex justify-end gap-3">
                        <Link
                            href="/dashboard/users"
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isPending || isScanning}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        >
                            {isPending ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <ArrowDownTrayIcon className="w-3.5 h-3.5" />}
                            {isPending ? 'Saving...' : (role === 'USER' ? 'Save Employee' : 'Save Guest Pass')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}