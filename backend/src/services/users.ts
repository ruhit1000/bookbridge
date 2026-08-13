import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import { sendSuccess } from "../lib/response.js";
import { authenticate } from "../lib/auth.js";

const router = Router();

const userSelect = {
    id: true,
    name: true,
    email: true,
    isDeleted: true,
    createdAt: true,
    updatedAt: true,
} as const;

const updateUserSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    email: z.email("Invalid email address").optional(),
});

/**
 * GET /api/v1/users
 * Get all active users (public).
 */
router.get("/", async (_req, res) => {
    const users = await prisma.user.findMany({
        where: { isDeleted: false },
        select: userSelect,
        orderBy: { createdAt: "desc" },
    });
    sendSuccess(res, users, "Users retrieved successfully.");
});

/**
 * GET /api/v1/users/:id
 * Get a single user by ID (public).
 */
router.get("/:id", async (req, res) => {
    const user = await prisma.user.findFirst({
        where: { id: req.params.id as string, isDeleted: false },
        select: userSelect,
    });
    if (!user) throw new AppError("User not found.", 404);
    sendSuccess(res, user, "User retrieved successfully.");
});

/**
 * PATCH /api/v1/users/:id
 * Update own user profile (protected).
 * Body: { name?, email? }
 */
router.patch("/:id", authenticate, async (req, res) => {
    const id = req.params.id as string;
    const requesterId = req.user!.id;

    if (id !== requesterId) {
        throw new AppError("You are not authorised to update this account.", 403);
    }

    const existing = await prisma.user.findFirst({
        where: { id, isDeleted: false },
    });
    if (!existing) throw new AppError("User not found.", 404);

    const { name, email } = updateUserSchema.parse(req.body);

    if (email && email !== existing.email) {
        const taken = await prisma.user.findUnique({ where: { email } });
        if (taken) throw new AppError("An account with this email already exists.", 409);
    }

    const updated = await prisma.user.update({
        where: { id },
        data: {
            ...(name && { name }),
            ...(email && { email }),
        },
        select: userSelect,
    });

    sendSuccess(res, updated, "User updated successfully.");
});

/**
 * DELETE /api/v1/users/:id
 * Soft-delete own user account (protected).
 */
router.delete("/:id", authenticate, async (req, res) => {
    const id = req.params.id as string;
    const requesterId = req.user!.id;

    if (id !== requesterId) {
        throw new AppError("You are not authorised to delete this account.", 403);
    }

    const existing = await prisma.user.findFirst({
        where: { id, isDeleted: false },
    });
    if (!existing) throw new AppError("User not found.", 404);

    await prisma.user.update({
        where: { id },
        data: { isDeleted: true },
    });

    sendSuccess(res, null, "User deleted successfully.");
});

export default router;
