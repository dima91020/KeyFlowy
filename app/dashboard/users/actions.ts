'use server'

import { prisma } from '@/app/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { verifySession } from '@/app/lib/session'
import { hash } from 'bcrypt'
import { randomBytes } from 'crypto'

export type UserState = {
    message?: string | null;
    success?: boolean;
    credentials?: {
        email: string;
        password: string;
    };
    errors?: {
        role?: string[];
        name?: string[];
        email?: string[];
        jobTitle?: string[];
        cardUid?: string[];
        isActive?: string[];
        deviceIds?: string[];
        validFromDate?: string[];
        validFromTime?: string[];
        validUntilDate?: string[];
        validUntilTime?: string[];
    };
    inputs?: {
        role?: string | null;
        name?: string | null;
        email?: string | null;
        jobTitle?: string | null;
        cardUid?: string | null;
        validFromDate?: string | null;
        validFromTime?: string | null;
        validUntilDate?: string | null;
        validUntilTime?: string | null;
    };
}

const emptyStringToNull = z.union([z.string(), z.null(), z.undefined()])
    .transform((val) => (!val || val.trim() === "") ? null : val.trim());

const updateUserSchema = z.object({
    id: z.string(),
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.union([
        emptyStringToNull.pipe(z.string().email("Invalid email").nullable()),
        z.null(),
        z.undefined()
    ]).optional(),
    jobTitle: emptyStringToNull,
    cardUid: emptyStringToNull,
    isActive: z.string().nullable().optional(),
    validFromDate: z.string().nullable().optional(),
    validFromTime: z.string().nullable().optional(),
    validUntilDate: z.string().nullable().optional(),
    validUntilTime: z.string().nullable().optional(),
});

const createUserSchema = z.object({
    role: z.enum(['USER', 'GUEST']),
    name: z.string().min(2, "Name must be at least 2 characters"),
    jobTitle: emptyStringToNull,
    email: z.union([
        emptyStringToNull.pipe(z.string().email("Invalid email").nullable()),
        z.null(),
        z.undefined()
    ]).optional(),
    cardUid: emptyStringToNull,
    isInside: z.boolean(),
    deviceIds: z.array(z.string()).min(1, "Select at least one access point"),
    validFromDate: z.string().nullable().optional(),
    validFromTime: z.string().nullable().optional(),
    validUntilDate: z.string().nullable().optional(),
    validUntilTime: z.string().nullable().optional(),
});

const getString = (formData: FormData, key: string) => {
    const val = formData.get(key);
    return val !== null ? String(val) : null;
};

export async function getCurrentUserId() {
    return await verifySession()
}

export async function createUserAction(prevState: UserState, formData: FormData): Promise<UserState> {
    const adminId = await verifySession();
    if (!adminId) return { message: "Unauthorized" };

    const rawData = {
        role: getString(formData, 'role') || '',
        name: getString(formData, 'name') || '',
        jobTitle: getString(formData, 'jobTitle'),
        email: getString(formData, 'email'),
        cardUid: getString(formData, 'cardUid'),
        isInside: formData.get('isInside') === 'on' || formData.get('isInside') === 'true',
        deviceIds: formData.getAll('deviceIds') as string[],
        validFromDate: getString(formData, 'validFromDate'),
        validFromTime: getString(formData, 'validFromTime'),
        validUntilDate: getString(formData, 'validUntilDate'),
        validUntilTime: getString(formData, 'validUntilTime'),
    }

    const validated = createUserSchema.safeParse(rawData);

    if (!validated.success) {
        return {
            message: "Validation failed.",
            errors: validated.error.flatten().fieldErrors,
            inputs: rawData,
        };
    }

    const data = validated.data;

    if (data.role === 'USER') {
        if (!data.email) {
            return { errors: { email: ["Valid email is required for employees"] }, message: 'Validation failed.', inputs: rawData }
        }
    }

    let validFrom = null;
    let validUntil = null;

    if (data.role === 'GUEST') {
        if (!data.validFromDate || !data.validUntilDate || !data.validFromTime || !data.validUntilTime) {
            return { message: 'Dates and times are required for guests.', inputs: rawData }
        }
        validFrom = new Date(`${data.validFromDate}T${data.validFromTime}`);
        validUntil = new Date(`${data.validUntilDate}T${data.validUntilTime}`);

        if (validUntil <= validFrom) {
            return { errors: { validUntilTime: ["End time must be after start time."] }, message: 'Invalid time range.', inputs: rawData }
        }
    }

    try {
        if (data.role === 'USER') {
            const generatedPassword = randomBytes(4).toString('hex');
            const hashedPassword = await hash(generatedPassword, 10);

            await prisma.user.create({
                data: {
                    name: data.name,
                    email: data.email as string,
                    password: hashedPassword,
                    jobTitle: data.jobTitle,
                    cardUid: data.cardUid,
                    role: 'USER',
                    adminId: adminId,
                    isActive: true,
                    isInside: data.isInside,
                    allowedDevices: {
                        connect: data.deviceIds.map(id => ({ id }))
                    }
                },
            });

            revalidatePath('/dashboard/users');
            return {
                success: true,
                credentials: { email: data.email as string, password: generatedPassword }
            };
        } else {
            await prisma.user.create({
                data: {
                    name: data.name,
                    role: 'GUEST',
                    jobTitle: data.jobTitle || 'Guest',
                    cardUid: data.cardUid,
                    adminId: adminId,
                    isInside: false,
                    isActive: true,
                    validFrom,
                    validUntil,
                    allowedDevices: {
                        connect: data.deviceIds.map(id => ({ id }))
                    }
                }
            });

            revalidatePath('/dashboard/users');
            return { success: true };
        }

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            const target = String(error.meta?.target || '');
            if (target.includes('cardUid')) {
                return { message: "UID already taken.", inputs: rawData, errors: { cardUid: ["UID already assigned"] } }
            }
            if (target.includes('email')) {
                return { message: "Email already registered.", inputs: rawData, errors: { email: ["Email already taken"] } }
            }
        }
        return { message: "Database Error: Failed to create user.", inputs: rawData }
    }
}

export async function getAllAdminDevices() {
    try {
        const adminId = await verifySession();
        if (!adminId) return [];

        const devices = await prisma.device.findMany({
            where: { adminId: adminId },
            select: { id: true, name: true, isOnline: true, lastSeen: true },
            orderBy: { name: 'asc' }
        });

        const sixtyFiveSecondsAgo = new Date(Date.now() - 65000);

        return devices.map(d => ({
            id: d.id,
            name: d.name,
            isOnline: d.isOnline && d.lastSeen >= sixtyFiveSecondsAgo
        }));

    } catch (error) {
        return []
    }
}

export async function updateUser(prevState: UserState, formData: FormData): Promise<UserState> {
    const currentUserId = await verifySession();
    if (!currentUserId) return { message: "Unauthorized" };

    const rawIsActive = formData.get('isActive');
    let isActiveBool = rawIsActive === 'on';

    const rawIsInside = formData.get('isInside');
    const isInsideBool = rawIsInside === 'on';

    const rawData = {
        id: getString(formData, 'id') || '',
        name: getString(formData, 'name') || '',
        email: getString(formData, 'email'),
        jobTitle: getString(formData, 'jobTitle'),
        cardUid: getString(formData, 'cardUid'),
        validFromDate: getString(formData, 'validFromDate'),
        validFromTime: getString(formData, 'validFromTime'),
        validUntilDate: getString(formData, 'validUntilDate'),
        validUntilTime: getString(formData, 'validUntilTime'),
    }

    if (rawData.id === currentUserId) {
        isActiveBool = true;
    }

    const validated = updateUserSchema.safeParse(rawData)

    if (!validated.success) {
        return {
            message: "Validation failed",
            errors: validated.error.flatten().fieldErrors
        }
    }

    const { id, name, email, jobTitle, cardUid, validFromDate, validFromTime, validUntilDate, validUntilTime } = validated.data

    let validFrom = null;
    let validUntil = null;

    if (validFromDate && validFromTime) {
        validFrom = new Date(`${validFromDate}T${validFromTime}`);
    }

    if (validUntilDate && validUntilTime) {
        validUntil = new Date(`${validUntilDate}T${validUntilTime}`);
    }

    try {
        const result = await prisma.user.updateMany({
            where: {
                id: id,
                OR: [
                    { adminId: currentUserId },
                    { id: currentUserId }
                ]
            },
            data: {
                name,
                email: email || null,
                jobTitle,
                cardUid: cardUid || null,
                isActive: isActiveBool,
                isInside: isInsideBool,
                ...(validFrom && { validFrom }),
                ...(validUntil && { validUntil }),
            }
        })

        if (result.count === 0) {
            return { message: 'User not found or access denied.' }
        }
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            const target = String(error.meta?.target || '');
            if (target.includes('email')) {
                return { message: "Email already in use.", errors: { email: ["Email already taken"] } }
            }
            if (target.includes('cardUid')) {
                return { message: "UID already assigned.", errors: { cardUid: ["UID already taken"] } }
            }
        }
        return { message: 'Database Error: Failed to update user.' }
    }

    revalidatePath('/dashboard/users')
    redirect('/dashboard/users')
}

export async function deleteUserAction(formData: FormData) {
    const userId = formData.get('id') as string;
    const currentUserId = await verifySession();

    if (!userId || !currentUserId) return;

    if (userId === currentUserId) {
        return
    }

    try {
        await prisma.user.deleteMany({
            where: {
                id: userId,
                adminId: currentUserId
            }
        })
        revalidatePath('/dashboard/users')
    } catch (e) {
        return
    }
}

export async function getOnlineDevices() {
    try {
        const adminId = await verifySession();
        if (!adminId) return [];

        const sixtyFiveSecondsAgo = new Date(Date.now() - 65000);

        return await prisma.device.findMany({
            where: {
                isOnline: true,
                adminId: adminId,
                lastSeen: {
                    gte: sixtyFiveSecondsAgo
                }
            },
            select: { macAddress: true, name: true },
            orderBy: { lastSeen: 'desc' }
        })
    } catch (error) {
        return []
    }
}