'use client'

import { useActionState, useEffect, useState, useRef } from 'react'
import { createUserAction, UserState, getOnlineDevices } from '../actions'
import { ArrowLeft, Save, User, Briefcase, CreditCard, Wifi, Loader2, Router, Mail, MapPin } from 'lucide-react'
import Link from 'next/link'
import clsx from 'clsx'

type DeviceOption = {
    macAddress: string;
    name: string;
}

export default function NewUserPage() {
    const initialState: UserState = { message: null, errors: {}, inputs: {} }
    const [state, action, isPending] = useActionState(createUserAction, initialState)

    const [isScanning, setIsScanning] = useState(false)
    const [scannedUid, setScannedUid] = useState('')
    const [devices, setDevices] = useState<DeviceOption[]>([])
    const [selectedDeviceMac, setSelectedDeviceMac] = useState<string>('')

    const socketRef = useRef<WebSocket | null>(null)

    useEffect(() => {
        getOnlineDevices().then((list) => {
            setDevices(list);
            if (list.length > 0) {
                setSelectedDeviceMac(list[0].macAddress);
            }
        });
    }, []);

    useEffect(() => {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => console.log('Frontend connected to WS');

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);

                if (msg.type === 'EVENT' && msg.payload?.startsWith('UID:')) {
                    if (msg.mac === selectedDeviceMac || !selectedDeviceMac) {
                        const uid = msg.payload.replace('UID:', '');
                        setScannedUid(uid);
                        setIsScanning(false);

                        const input = document.getElementById('cardUidInput') as HTMLInputElement;
                        if (input) input.value = uid;

                        // АВТОМАТИЧНЕ ВИЗНАЧЕННЯ ЛОКАЦІЇ
                        const isInsideCheckbox = document.getElementById('isInsideCheckbox') as HTMLInputElement;
                        if (isInsideCheckbox) {
                            // Якщо сканували на EXIT (внутрішній датчик), людина всередині
                            isInsideCheckbox.checked = (msg.direction === 'EXIT');
                        }
                    }
                }
            } catch (e) {
                console.log('Non-JSON message');
            }
        };

        socketRef.current = ws;
        return () => ws.close();
    }, [selectedDeviceMac]);

    const handleScan = () => {
        if (!selectedDeviceMac) {
            alert("No device selected! Please select a scanner.");
            return;
        }

        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            setIsScanning(true);
            setScannedUid('');

            const commandMsg = {
                type: 'COMMAND',
                target: selectedDeviceMac,
                command: 'START_SCAN'
            };

            socketRef.current.send(JSON.stringify(commandMsg));
        } else {
            alert("WS Disconnected");
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">

            <Link href="/dashboard/users" className="inline-flex items-center text-dark-muted hover:text-white mb-6 transition-colors">
                <ArrowLeft size={20} className="mr-2" />
                Back to Users
            </Link>

            <div className="bg-dark-800 border border-dark-700 rounded-2xl p-8 shadow-xl">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white">Add New Employee</h1>
                    <p className="text-dark-muted mt-1">Register a new person and assign an access card.</p>
                </div>

                <form action={action} className="space-y-6">

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 text-dark-muted" size={18} />
                            <input
                                name="name"
                                defaultValue={state.inputs?.name}
                                placeholder="John Doe"
                                className={clsx("w-full bg-dark-900 border rounded-xl pl-10 pr-4 py-3 outline-none focus:border-primary", state.errors?.name ? "border-red-500" : "border-dark-700")}
                            />
                        </div>
                        {state.errors?.name && <p className="text-red-400 text-xs ml-1">{state.errors.name[0]}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Job Title</label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-3.5 text-dark-muted" size={18} />
                            <input
                                name="jobTitle"
                                defaultValue={state.inputs?.jobTitle}
                                placeholder="Developer"
                                className="w-full bg-dark-900 border border-dark-700 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-primary"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 text-dark-muted" size={18} />
                            <input
                                name="email"
                                type="email"
                                defaultValue={state.inputs?.email}
                                placeholder="john.doe@company.com"
                                className={clsx("w-full bg-dark-900 border rounded-xl pl-10 pr-4 py-3 outline-none focus:border-primary", state.errors?.email ? "border-red-500" : "border-dark-700")}
                            />
                        </div>
                        {state.errors?.email && <p className="text-red-400 text-xs ml-1">{state.errors.email[0]}</p>}
                    </div>

                    <div className="p-4 bg-dark-900/50 rounded-xl border border-dark-700/50 space-y-3">
                        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                            <Router size={16} className="text-primary" />
                            Select Scanner Device
                        </label>

                        {devices.length > 0 ? (
                            <select
                                value={selectedDeviceMac}
                                onChange={(e) => setSelectedDeviceMac(e.target.value)}
                                className="w-full bg-dark-800 border border-dark-600 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-primary transition-all"
                            >
                                {devices.map(device => (
                                    <option key={device.macAddress} value={device.macAddress}>
                                        {device.name} (Online)
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className="text-sm text-yellow-500/80 bg-yellow-500/10 px-3 py-2 rounded-lg flex items-center gap-2">
                                <Loader2 size={14} className="animate-spin" />
                                Searching for online devices...
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Access Card UID</label>
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <CreditCard className="absolute left-3 top-3.5 text-dark-muted" size={18} />
                                <input
                                    name="cardUid"
                                    id="cardUidInput"
                                    defaultValue={scannedUid || state.inputs?.cardUid}
                                    placeholder={isScanning ? "Waiting for scan..." : "Scan or enter manually"}
                                    className={clsx(
                                        "w-full bg-dark-900 border rounded-xl pl-10 pr-4 py-3 transition-all outline-none font-mono tracking-wider",
                                        state.errors?.cardUid ? "border-red-500" : "border-dark-700 focus:border-primary",
                                        isScanning && "animate-pulse border-primary text-primary"
                                    )}
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleScan}
                                disabled={isScanning || devices.length === 0}
                                className={clsx(
                                    "px-4 rounded-xl flex items-center gap-2 transition-all active:scale-95 border",
                                    isScanning
                                        ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30 cursor-wait"
                                        : devices.length === 0
                                            ? "bg-dark-700 text-dark-muted border-dark-600 cursor-not-allowed"
                                            : "bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border-purple-500/30"
                                )}
                            >
                                {isScanning ? <Loader2 size={20} className="animate-spin" /> : <Wifi size={20} />}
                                <span className="hidden sm:inline font-medium">
                                    {isScanning ? 'Scanning...' : 'Scan'}
                                </span>
                            </button>
                        </div>
                        {state.errors?.cardUid && <p className="text-red-400 text-xs ml-1">{state.errors.cardUid[0]}</p>}
                    </div>

                    <div className="flex items-center justify-between bg-dark-900 p-4 rounded-xl border border-dark-700">
                        <div>
                            <h3 className="text-white font-medium flex items-center gap-2">
                                <MapPin size={16} className="text-blue-400" />
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

                    {state.message && (
                        <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                            {state.message}
                        </div>
                    )}

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={isPending || isScanning}
                            className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {isPending ? 'Saving...' : 'Create Employee'}
                            {!isPending && <Save size={18} />}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}