import { prisma } from '@/app/lib/prisma'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { LoginSchema } from '@/app/lib/schemas'
import { Lock, Mail } from 'lucide-react'

export default function LoginPage() {

    async function login(formData: FormData) {
        'use server'

        const rawData = {
            email: formData.get('email'),
            password: formData.get('password'),
        }

        const result = LoginSchema.safeParse(rawData);

        if (!result.success) {
            console.log(result.error.flatten());
            return;
        }

        const { email, password } = result.data;

        const user = await prisma.user.findUnique({ where: { email } })

        if (!user || !await bcrypt.compare(password, user.password)) {
            return
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-diploma-key')
        const token = await new SignJWT({ userId: user.id, role: user.role })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('24h')
            .sign(secret);

        (await cookies()).set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24,
            path: '/',
        })

        redirect('/dashboard')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-900 text-dark-text p-4">
            <div className="bg-dark-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-dark-700">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">SecurePass ACS</h1>
                    <p className="text-dark-muted">Введіть свої дані для входу</p>
                </div>

                <form action={login} className="space-y-6">

                    <div>
                        <label className="block text-sm font-medium text-dark-muted mb-2">Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-dark-muted" />
                            </div>
                            <input
                                name="email"
                                type="email"
                                placeholder="admin@company.com"
                                className="block w-full pl-10 pr-3 py-3 bg-dark-900 border border-dark-700 rounded-xl text-white placeholder-dark-muted focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-muted mb-2">Пароль</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-dark-muted" />
                            </div>
                            <input
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                className="block w-full pl-10 pr-3 py-3 bg-dark-900 border border-dark-700 rounded-xl text-white placeholder-dark-muted focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/20"
                    >
                        Увійти в систему
                    </button>
                </form>
            </div>
        </div>
    )
}