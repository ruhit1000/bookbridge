import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import { sendSuccess } from "../lib/response.js";
import { authenticate } from "../lib/auth.js";

const router = Router();

// ─── Validation Schemas ────────────────────────────────────────

const createCategorySchema = z.object({
    name: z.string().min(1, "Category name is required").max(100, "Name too long"),
});

const updateCategorySchema = z.object({
    name: z.string().min(1, "Category name is required").max(100, "Name too long").optional(),
});

// ─── Routes ────────────────────────────────────────────────────

/**
 * POST /api/v1/categories
 * Create a new category (protected).
 * Body: { name }
 */
router.post("/", authenticate, async (req, res) => {
    const { name } = createCategorySchema.parse(req.body);

    // Reject duplicate category names
    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) {
        throw new AppError("A category with this name already exists.", 409);
    }

    const category = await prisma.category.create({
        data: { name },
    });

    sendSuccess(res, category, "Category created successfully.", 201);
});

/**
 * GET /api/v1/categories
 * Get all active categories (public).
 */
router.get("/", async (_req, res) => {
    const categories = await prisma.category.findMany({
        where: { isDeleted: false },
        orderBy: { name: "asc" },
    });
    sendSuccess(res, categories, "Categories retrieved successfully.");
});

/**
 * GET /api/v1/categories/:id
 * Get a single category by ID (public).
 */
router.get("/:id", async (req, res) => {
    const category = await prisma.category.findFirst({
        where: { id: req.params.id as string, isDeleted: false },
        include: {
            // Include non-deleted books belonging to this category
            books: {
                where: { isDeleted: false },
                select: {
                    id: true,
                    title: true,
                    author: true,
                    status: true,
                    condition: true,
                    createdAt: true,
                },
                orderBy: { createdAt: "desc" },
            },
        },
    });

    if (!category) throw new AppError("Category not found.", 404);

    sendSuccess(res, category, "Category retrieved successfully.");
});

/**
 * PATCH /api/v1/categories/:id
 * Update a category's name (protected).
 * Body: { name? }
 */
router.patch("/:id", authenticate, async (req, res) => {
    const id = req.params.id as string;

    const existing = await prisma.category.findFirst({
        where: { id, isDeleted: false },
    });
    if (!existing) throw new AppError("Category not found.", 404);

    const { name } = updateCategorySchema.parse(req.body);

    // If renaming, ensure new name is not already taken
    if (name && name !== existing.name) {
        const taken = await prisma.category.findUnique({ where: { name } });
        if (taken) throw new AppError("A category with this name already exists.", 409);
    }

    const updated = await prisma.category.update({
        where: { id },
        data: { ...(name && { name }) },
    });

    sendSuccess(res, updated, "Category updated successfully.");
});

/**
 * DELETE /api/v1/categories/:id
 * Soft-delete a category (protected).
 */
router.delete("/:id", authenticate, async (req, res) => {
    const id = req.params.id as string;

    const existing = await prisma.category.findFirst({
        where: { id, isDeleted: false },
    });
    if (!existing) throw new AppError("Category not found.", 404);

    await prisma.category.update({
        where: { id },
        data: { isDeleted: true },
    });

    sendSuccess(res, null, "Category deleted successfully.");
});

export default router;
