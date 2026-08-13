import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import { sendSuccess } from "../lib/response.js";

const router = Router();

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

// ─── Routes ────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/register
 * Register a new user account.
 * Body: { name, email, password }
 */
router.post("/register", async (req, res) => {
    const { name, email, password } = registerSchema.parse(req.body);

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

    sendSuccess(res, user, "Registration successful.", 201);
});

/**
 * POST /api/v1/auth/login
 * Authenticate and receive a JWT.
 * Body: { email, password }
 */
router.post("/login", async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);

    // Find non-deleted user by email
    const user = await prisma.user.findFirst({
        where: { email, isDeleted: false },
    });

    // Same message for "not found" and "wrong password" — prevents email enumeration
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

    sendSuccess(res, { token, user: safeUser }, "Login successful.");
});

export default router;
