import { z } from 'zod';

export const LoginSchema = z.object({
    email: z.string().email("Невірний формат Email"),
    password: z.string().min(6, "Пароль має бути мінімум 6 символів"),
});

export const CreateUserSchema = z.object({
    name: z.string().min(2, "Ім'я надто коротке"),
    email: z.string().email("Невірний формат Email").optional().or(z.literal('')),
    cardUid: z.string().min(4, "UID має бути мінімум 4 символи"),
});