'use client'

import { useActionState, useEffect, useState, useRef } from 'react'
import { createUserAction, UserState, getOnlineDevices, getAllAdminDevices, getCurrentUserId } from '../actions'
import {
    ChevronLeftIcon,
    ArrowDownTrayIcon,
    UserIcon,
    BriefcaseIcon,
    CreditCardIcon,
    WifiIcon,
    ArrowPathIcon,
    CpuChipIcon,
    EnvelopeIcon,
    MapPinIcon,
    CheckCircleIcon,
    ClipboardDocumentIcon,
    LockOpenIcon,
    CalendarIcon,
    ShieldCheckIcon,
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

    const autofillFix = "[&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]";

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

        ws.onopen = () => console.log('Frontend connected to WS');

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
            } catch (e) {
                console.log('Non-JSON message');
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
            alert("No device selected! Please select a scanner.");
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

                const commandMsg = {
                    type: 'COMMAND',
                    target: selectedDeviceMac,
                    command: 'START_SCAN',
                    userId: currentUserId
                };

                socketRef.current.send(JSON.stringify(commandMsg));

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
            const text = `SecurePass Portal Access\nLogin: ${state.credentials.email}\nPassword: ${state.credentials.password}`
            navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 3000)
        }
    }

    if (state.success) {
        return (
            <div className="p-6 max-w-2xl mx-auto space-y-6">
                <div className="text-center mb-8 pt-8">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                        <CheckCircleIcon className="w-10 h-10 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {role === 'GUEST' ? 'Guest Pass Created!' : 'Employee Created!'}
                    </h1>
                    <p className="text-dark-muted">
                        {role === 'GUEST' ? 'The access card is now ready to use.' : 'Please securely send these login details to the new employee.'}
                    </p>
                </div>

                {state.credentials && role === 'USER' && (
                    <div className="bg-dark-800 border border-dark-700 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="space-y-6 relative z-10">
                            <div>
                                <p className="text-xs text-dark-muted uppercase tracking-wider mb-2">Login (Email)</p>
                                <div className="bg-dark-900 border border-dark-700 rounded-xl p-4 text-white font-mono flex justify-between items-center">
                                    {state.credentials.email}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-dark-muted uppercase tracking-wider mb-2">Temporary Password</p>
                                <div className="bg-dark-900 border border-dark-700 rounded-xl p-4 text-primary font-mono text-xl tracking-widest text-center">
                                    {state.credentials.password}
                                </div>
                            </div>

                            <button
                                onClick={copyCredentials}
                                className={clsx(
                                    "w-full py-4 rounded-xl transition-all flex items-center justify-center gap-2 border shadow-lg",
                                    copied
                                        ? "bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/20"
                                        : "bg-primary hover:bg-blue-600 text-white border-blue-500 shadow-blue-500/20"
                                )}
                            >
                                {copied ? <CheckCircleIcon className="w-5 h-5" /> : <ClipboardDocumentIcon className="w-5 h-5" />}
                                {copied ? 'Copied to Clipboard!' : 'Copy Credentials'}
                            </button>
                        </div>
                    </div>
                )}

                <div className="text-center pt-4">
                    <Link href="/dashboard/users" className="text-dark-muted hover:text-white transition-colors border-b border-transparent hover:border-white pb-1">
                        Return to Users List
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <Link
                href="/dashboard/users"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-dark-muted hover:text-white mb-6 transition-colors"
            >
                <ChevronLeftIcon className="w-4 h-4" />
                <span>Back to Users</span>
            </Link>

            <div className="bg-dark-800 border border-dark-700 rounded-3xl p-8 shadow-xl relative">
                <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <UserIcon className="w-32 h-32" />
                    </div>
                </div>

                <div className="mb-8 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Create Profile</h1>
                        <p className="text-dark-muted mt-1">Register a person and assign an access card.</p>
                    </div>

                    <div className="flex bg-dark-900 p-1 rounded-xl border border-dark-700">
                        <button
                            type="button"
                            onClick={() => setRole('USER')}
                            className={clsx(
                                "px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2",
                                role === 'USER' ? "bg-dark-700 text-white shadow-sm" : "text-dark-muted hover:text-gray-300"
                            )}
                        >
                            <UserIcon className="w-4 h-4" /> Employee
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('GUEST')}
                            className={clsx(
                                "px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2",
                                role === 'GUEST' ? "bg-dark-700 text-white shadow-sm" : "text-dark-muted hover:text-gray-300"
                            )}
                        >
                            <ShieldCheckIcon className="w-4 h-4" /> Guest
                        </button>
                    </div>
                </div>

                <form action={action} className="space-y-6 relative z-10">
                    <input type="hidden" name="role" value={role} />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-sm text-gray-300 ml-1">Full Name</label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-3.5 text-dark-muted w-5 h-5" />
                                <input
                                    name="name"
                                    defaultValue={state.inputs?.name as string}
                                    placeholder="John Doe"
                                    className={clsx(
                                        "w-full bg-dark-900 border rounded-xl pl-10 pr-4 py-3 outline-none focus:border-primary transition-colors text-white",
                                        autofillFix,
                                        state.errors?.name ? "border-red-500" : "border-dark-700"
                                    )}
                                />
                            </div>
                            {state.errors?.name && <p className="text-red-400 text-xs ml-1">{state.errors.name[0]}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm text-gray-300 ml-1">
                                {role === 'USER' ? 'Job Title' : 'Note / Company'}
                            </label>
                            <div className="relative">
                                <BriefcaseIcon className="absolute left-3 top-3.5 text-dark-muted w-5 h-5" />
                                <input
                                    name="jobTitle"
                                    defaultValue={state.inputs?.jobTitle as string}
                                    placeholder={role === 'USER' ? "Developer" : "Visiting for maintenance"}
                                    className={clsx(
                                        "w-full bg-dark-900 border border-dark-700 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-primary transition-colors text-white",
                                        autofillFix
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {role === 'USER' && (
                        <div className="space-y-1.5">
                            <label className="text-sm text-gray-300 ml-1">Email Address <span className="text-red-400">*</span></label>
                            <div className="relative">
                                <EnvelopeIcon className="absolute left-3 top-3.5 text-dark-muted w-5 h-5" />
                                <input
                                    name="email"
                                    type="email"
                                    defaultValue={state.inputs?.email as string}
                                    placeholder="Used for employee login portal"
                                    className={clsx(
                                        "w-full bg-dark-900 border rounded-xl pl-10 pr-4 py-3 outline-none focus:border-primary transition-colors text-white",
                                        autofillFix,
                                        state.errors?.email ? "border-red-500" : "border-dark-700"
                                    )}
                                />
                            </div>
                            {state.errors?.email && <p className="text-red-400 text-xs ml-1">{state.errors.email[0]}</p>}
                        </div>
                    )}

                    {role === 'GUEST' && (
                        <div className="pt-2">
                            <h3 className="text-sm text-white flex items-center gap-2 mb-3 ml-1">
                                <ClockIcon className="text-yellow-500 w-4 h-4" /> Time Restrictions
                            </h3>

                            <div className="grid grid-cols-1 gap-5 bg-dark-900/50 p-5 rounded-2xl border border-dark-700/50">
                                <div className="space-y-2">
                                    <label className="text-xs text-dark-muted flex items-center gap-1.5">
                                        Valid From
                                    </label>
                                    <div className="grid grid-cols-[1fr_105px] gap-2">
                                        <CustomSelect
                                            name="validFromDate"
                                            options={dateOptions}
                                            defaultValue={state.inputs?.validFromDate as string || dateOptions[0].value}
                                            icon={<CalendarIcon className="w-4 h-4" />}
                                        />
                                        <CustomSelect
                                            name="validFromTime"
                                            options={timeOptions}
                                            defaultValue={state.inputs?.validFromTime as string || '09:00'}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-dark-muted flex items-center gap-1.5">
                                        Valid Until
                                    </label>
                                    <div className="grid grid-cols-[1fr_105px] gap-2">
                                        <CustomSelect
                                            name="validUntilDate"
                                            options={dateOptions}
                                            defaultValue={state.inputs?.validUntilDate as string || dateOptions[1].value}
                                            icon={<CalendarIcon className="w-4 h-4" />}
                                        />
                                        <CustomSelect
                                            name="validUntilTime"
                                            options={timeOptions}
                                            defaultValue={state.inputs?.validUntilTime as string || '18:00'}
                                        />
                                    </div>
                                    {state.errors?.validUntilTime && <p className="text-red-400 text-xs">{state.errors.validUntilTime[0]}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-4 border-t border-dark-700 space-y-4">
                        <div className="p-4 bg-dark-900/50 rounded-xl border border-dark-700/50 space-y-3">
                            <label className="text-sm text-gray-300 flex items-center gap-2">
                                <CpuChipIcon className="text-primary w-4 h-4" />
                                Select Scanner Device
                            </label>

                            {devices.length > 0 ? (
                                <CustomSelect
                                    options={devices.map(d => ({ value: d.macAddress, label: `${d.name} (Online)` }))}
                                    defaultValue={selectedDeviceMac || devices[0].macAddress}
                                    onChange={setSelectedDeviceMac}
                                    icon={<WifiIcon className="w-4 h-4" />}
                                />
                            ) : (
                                <div className="text-sm text-yellow-500/80 bg-yellow-500/10 px-4 py-3 rounded-xl border border-yellow-500/20 flex items-center gap-2">
                                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                    Searching for online devices...
                                </div>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm text-gray-300 ml-1">Access Card UID</label>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <CreditCardIcon className="absolute left-3 top-3.5 text-dark-muted w-5 h-5" />
                                    <input
                                        name="cardUid"
                                        id="cardUidInput"
                                        defaultValue={scannedUid || (state.inputs?.cardUid as string)}
                                        placeholder={isScanning ? "Waiting for scan..." : "Scan or enter manually"}
                                        className={clsx(
                                            "w-full bg-dark-900 border rounded-xl pl-10 pr-4 py-3 transition-all outline-none font-mono tracking-wider uppercase text-white",
                                            autofillFix,
                                            state.errors?.cardUid ? "border-red-500" : "border-dark-700 focus:border-primary",
                                            isScanning && "border-yellow-500/50 bg-yellow-500/5"
                                        )}
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={handleScan}
                                    disabled={devices.length === 0}
                                    className={clsx(
                                        "px-6 rounded-xl flex items-center gap-2 transition-all border",
                                        isScanning
                                            ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20"
                                            : devices.length === 0
                                                ? "bg-dark-700 text-dark-muted border-dark-600 cursor-not-allowed"
                                                : "bg-primary/20 hover:bg-primary/30 text-primary border-primary/30"
                                    )}
                                >
                                    {isScanning ? <XMarkIcon className="w-5 h-5" /> : <WifiIcon className="w-5 h-5" />}
                                    <span className="hidden sm:inline">
                                        {isScanning ? 'Cancel' : 'Scan'}
                                    </span>
                                </button>
                            </div>
                            {state.errors?.cardUid && <p className="text-red-400 text-xs ml-1">{state.errors.cardUid[0]}</p>}
                        </div>
                    </div>

                    {role === 'USER' && (
                        <div className="flex items-center justify-between bg-dark-900 p-4 rounded-xl border border-dark-700">
                            <div>
                                <h3 className="text-white flex items-center gap-2 text-sm">
                                    <MapPinIcon className="w-4 h-4 text-blue-400" />
                                    Initial Location Status
                                </h3>
                                <p className="text-sm text-dark-muted">
                                    Auto-detects based on the reader used during scan.
                                </p>
                            </div>

                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="isInside" id="isInsideCheckbox" defaultChecked={false} className="sr-only peer" />
                                <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                            </label>
                        </div>
                    )}

                    <div className="space-y-1.5 pt-4 border-t border-dark-700">
                        <label className="text-sm text-gray-300 ml-1">Assign Access Points (Doors)</label>
                        <MultiSelect
                            name="deviceIds"
                            placeholder="Select allowed doors..."
                            icon={<LockOpenIcon className="w-5 h-5" />}
                            options={allDevices.map(d => ({
                                value: d.id,
                                label: `${d.name} ${!d.isOnline ? '(Offline)' : ''}`
                            }))}
                        />
                        {state.errors?.deviceIds && <p className="text-red-400 text-xs ml-1">{state.errors.deviceIds[0]}</p>}
                    </div>

                    {state.message && !state.success && (
                        <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                            {state.message}
                        </div>
                    )}

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={isPending || isScanning}
                            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50 w-full sm:w-auto justify-center"
                        >
                            {isPending ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <ArrowDownTrayIcon className="w-5 h-5" />}
                            {isPending ? 'Saving...' : (role === 'USER' ? 'Create Employee' : 'Create Guest Pass')}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}