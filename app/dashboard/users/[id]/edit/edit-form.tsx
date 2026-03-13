'use client'

import { updateUser, UserState } from '../../actions'
import { useActionState } from 'react'
import { User, Mail, CreditCard, Briefcase, Save, Loader2, Lock, MapPin } from 'lucide-react' // Додав MapPin
import clsx from 'clsx'

type EditFormProps = {
    user: {
        id: string
        name: string | null
        email: string | null
        jobTitle: string | null
        cardUid: string | null
        isActive: boolean
        isInside: boolean // <--- ДОДАНО НОВЕ ПОЛЕ
    },
    currentUserId: string | null | undefined
}

export function EditUserForm({ user, currentUserId }: EditFormProps) {
    const initialState: UserState = { message: null, errors: {} }
    const [state, action, isPending] = useActionState(updateUser, initialState)

    // Перевірка: чи це сам адмін?
    const isSelf = user.id === currentUserId;

    return (
        <form action={action} className="space-y-6">
            <input type="hidden" name="id" value={user.id} />

            {/* ... Name/Job ... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm text-dark-muted flex items-center gap-2"><User size={16}/> Full Name</label>
                    <input name="name" defaultValue={user.name || ''} className={clsx("w-full bg-dark-900 border rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-colors", state.errors?.name ? "border-red-500" : "border-dark-700")} />
                    {state.errors?.name && <p className="text-xs text-red-400">{state.errors.name[0]}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-sm text-dark-muted flex items-center gap-2"><Briefcase size={16}/> Job Title</label>
                    <input name="jobTitle" defaultValue={user.jobTitle || ''} className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-white focus:border-primary outline-none" />
                </div>
            </div>

            {/* ... Email ... */}
            <div className="space-y-2">
                <label className="text-sm text-dark-muted flex items-center gap-2"><Mail size={16}/> Email Address</label>
                <input name="email" type="email" defaultValue={user.email || ''} className={clsx("w-full bg-dark-900 border rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-colors", state.errors?.email ? "border-red-500" : "border-dark-700")} />
                {state.errors?.email && <p className="text-xs text-red-400">{state.errors.email[0]}</p>}
            </div>

            {/* ... Card UID ... */}
            <div className="space-y-2">
                <label className="text-sm text-dark-muted flex items-center gap-2"><CreditCard size={16}/> RFID Card UID</label>
                <input name="cardUid" defaultValue={user.cardUid || ''} placeholder="Scanned UID will appear here..." className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-white font-mono focus:border-primary outline-none" />
                <p className="text-xs text-dark-muted">Use the &quot;Scan&quot; function on the Add User page to find new card UIDs.</p>
            </div>

            <hr className="border-dark-700" />

            <div className="space-y-4">
                {/* --- БЛОК ACTIVE --- */}
                <div className={clsx(
                    "flex items-center justify-between bg-dark-900 p-4 rounded-xl border transition-colors",
                    isSelf ? "border-yellow-500/20 opacity-80" : "border-dark-700"
                )}>
                    <div>
                        <h3 className="text-white font-medium flex items-center gap-2">
                            Account Status
                            {isSelf && <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded border border-yellow-500/20 uppercase font-bold">Protected</span>}
                        </h3>
                        <p className="text-sm text-dark-muted">
                            {isSelf
                                ? "You cannot block your own account."
                                : "Disable to block access without deleting data."}
                        </p>
                    </div>

                    {isSelf ? (
                        <Lock className="text-dark-muted" size={24} />
                    ) : (
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="isActive" defaultChecked={user.isActive} className="sr-only peer" />
                            <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    )}
                </div>

                {/* --- НОВИЙ БЛОК ANTI-PASSBACK (IS INSIDE) --- */}
                <div className="flex items-center justify-between bg-dark-900 p-4 rounded-xl border border-dark-700">
                    <div>
                        <h3 className="text-white font-medium flex items-center gap-2">
                            <MapPin size={16} className="text-blue-400" />
                            Location Status (Anti-passback)
                        </h3>
                        <p className="text-sm text-dark-muted">
                            Manual override. Turn off if the user left without scanning their card.
                        </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="isInside" defaultChecked={user.isInside} className="sr-only peer" />
                        <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                </div>
            </div>

            {state.message && (
                <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    {state.message}
                </div>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-70"
            >
                {isPending ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {isPending ? 'Saving...' : 'Save Changes'}
            </button>
        </form>
    )
}