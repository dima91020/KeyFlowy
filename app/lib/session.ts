import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const DEFAULT_SECRET = 'default-jwt-secret-key-for-access-control-system-32'

function getEncodedKey() {
    const secret = process.env.JWT_SECRET || DEFAULT_SECRET
    return new TextEncoder().encode(secret)
}

export async function createSession(userId: string) {
    const key = getEncodedKey()
    const jwt = await new SignJWT({ sub: userId })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(key)

    const cookieStore = await cookies()
    cookieStore.set('session', jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    })
}

export async function verifySession() {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) return null

    try {
        const key = getEncodedKey()
        const { payload } = await jwtVerify(token, key, {
            algorithms: ['HS256'],
        })
        return payload.sub as string
    } catch {
        return null
    }
}

export async function deleteSession() {
    const cookieStore = await cookies()
    cookieStore.delete('session')
}