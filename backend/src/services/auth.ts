import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";

// ─── Validation Schemas ────────────────────────────────────────

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

// ─── Service Functions ─────────────────────────────────────────

/**
 * Register a new user.
 * Validates input → checks duplicate email → hashes password → creates user.
 * Returns the created user without the password field.
 */
export const register = async (body: unknown) => {
    const { name, email, password } = registerSchema.parse(body);

    // Reject duplicate emails (including soft-deleted accounts)
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        throw new AppError("An account with this email already exists.", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: { name, email, password: hashedPassword },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return user;
};

/**
 * Login an existing user.
 * Validates input → finds user → verifies password → signs JWT.
 * Returns { token, user } without the password field.
 */
export const login = async (body: unknown) => {
    const { email, password } = loginSchema.parse(body);

    // Find non-deleted user
    const user = await prisma.user.findFirst({
        where: { email, isDeleted: false },
    });

    // Return the same message for both "not found" and "wrong password"
    // to avoid leaking which emails are registered
    if (!user) {
        throw new AppError("Invalid email or password.", 401);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        throw new AppError("Invalid email or password.", 401);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new AppError("Server configuration error.", 500);
    }

    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: "7d" });

    // Strip password before returning
    const { password: _pw, ...safeUser } = user;

    return { token, user: safeUser };
};
