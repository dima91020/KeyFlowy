import { LockClosedIcon } from '@heroicons/react/24/outline'
import NewPasswordForm from './form'
import { redirect } from "next/navigation"

export default async function NewPasswordPage({
    searchParams,
}: {
    searchParams: Promise<{ token?: string }>
}) {
    const params = await searchParams;

    if (!params.token) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm relative z-10">
                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-4 text-white shadow-sm">
                        <LockClosedIcon className="w-6 h-6" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900">Set New Password</h1>
                    <p className="text-xs text-slate-500 mt-1">Enter your new secure password below.</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <NewPasswordForm token={params.token} />
                </div>
            </div>
        </div>
    );
}