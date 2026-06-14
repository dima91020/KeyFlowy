"use server";

import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function setNewPassword(token: string, newPassword: string) {
    try {
        const existingToken = await prisma.passwordResetToken.findUnique({
            where: { token }
        });

        if (!existingToken) {
            return { error: "Invalid reset token." };
        }

        if (new Date(existingToken.expires) < new Date()) {
            return { error: "Token has expired. Please request a new one." };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { email: existingToken.email },
            data: { password: hashedPassword }
        });

        await prisma.passwordResetToken.delete({
            where: { id: existingToken.id }
        });

        return { success: "Password successfully changed!" };
    } catch (error: any) {
        console.error(error);
        return { error: `Server error: ${error.message}` };
    }
}