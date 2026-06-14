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
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
            <div className="w-full max-w-sm relative z-10">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-dark-800 border border-dark-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <LockClosedIcon className="text-primary w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-semibold text-white mb-2">Create New Password</h1>
                    <p className="text-dark-muted text-sm">Enter your new strong password below.</p>
                </div>

                <div className="bg-dark-800 border border-dark-700 rounded-2xl p-8 shadow-xl">
                    <NewPasswordForm token={params.token} />
                </div>
            </div>
        </div>
    );
}