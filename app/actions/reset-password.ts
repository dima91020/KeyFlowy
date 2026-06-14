"use server";

import { prisma } from '@/app/lib/prisma'
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function resetPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        return { error: "User not found." };
    }

    const token = crypto.randomUUID();
    const expires = new Date(new Date().getTime() + 3600 * 1000);

    await prisma.passwordResetToken.deleteMany({
        where: { email }
    });

    // Save the new token
    await prisma.passwordResetToken.create({
        data: {
            email,
            token,
            expires
        }
    });

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/new-password?token=${token}`;

    await resend.emails.send({
        from: "SecurePass <onboarding@resend.dev>",
        to: email,
        subject: "SecurePass Password Reset",
        html: `<p>Click <a href="${resetLink}">here</a> to set a new password.</p>`
    });

    return { success: "Password reset email sent!" };
}