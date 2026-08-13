import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import { sendSuccess } from "../lib/response.js";
import { authenticate } from "../lib/auth.js";

const router = Router();

const bookStatusValues = ["AVAILABLE", "BORROWED", "UNAVAILABLE"] as const;

const createBookSchema = z.object({
    title: z.string().min(1, "Title is required"),
    author: z.string().min(1, "Author is required"),
    description: z.string().optional(),
    condition: z.string().optional(),
    imageUrl: z.string().url().optional(),
    categoryId: z.string().min(1, "Category is required"),
});

const updateBookSchema = z.object({
    title: z.string().min(1, "Title is required").optional(),
    author: z.string().min(1, "Author is required").optional(),
    description: z.string().optional(),
    condition: z.string().optional(),
    imageUrl: z.string().url().optional(),
    categoryId: z.string().optional(),
    status: z.enum(bookStatusValues).optional(),
});

/**
 * POST /api/v1/books
 * List a new book (protected).
 * ownerId is taken from the authenticated user — never from the request body.
 * Body: { title, author, description?, condition?, imageUrl?, categoryId }
 */
router.post("/", authenticate, async (req, res) => {
    const { title, author, description, condition, imageUrl, categoryId } =
        createBookSchema.parse(req.body);

    const category = await prisma.category.findFirst({
        where: { id: categoryId, isDeleted: false },
    });
    if (!category) throw new AppError("Category not found.", 404);

    const book = await prisma.book.create({
        data: {
            title,
            author,
            description,
            condition,
            imageUrl,
            categoryId,
            ownerId: req.user!.id,
        },
        include: {
            owner: { select: { id: true, name: true, email: true } },
            category: { select: { id: true, name: true } },
        },
    });

    sendSuccess(res, book, "Book listed successfully.", 201);
});

/**
 * GET /api/v1/books
 * Get all available books (public).
 * Optional query param: ?status=AVAILABLE|BORROWED|UNAVAILABLE & search=keyword
 */
router.get("/", async (req, res) => {
    const { status, search } = req.query;

    const statusFilter = bookStatusValues.includes(status as (typeof bookStatusValues)[number])
        ? (status as (typeof bookStatusValues)[number])
        : undefined;

    const searchQuery = typeof search === "string" && search.trim().length > 0 ? search.trim() : undefined;

    const books = await prisma.book.findMany({
        where: {
            isDeleted: false,
            ...(statusFilter && { status: statusFilter }),
            ...(searchQuery && {
                OR: [
                    { title: { contains: searchQuery, mode: "insensitive" } },
                    { author: { contains: searchQuery, mode: "insensitive" } }
                ]
            }),
        },
        include: {
            owner: { select: { id: true, name: true, email: true } },
            category: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    sendSuccess(res, books, "Books retrieved successfully.");
});

/**
 * GET /api/v1/books/:id
 * Get a single book by ID with owner, category, and borrow requests (public).
 */
router.get("/:id", async (req, res) => {
    const book = await prisma.book.findFirst({
        where: { id: req.params.id as string, isDeleted: false },
        include: {
            owner: { select: { id: true, name: true, email: true } },
            category: { select: { id: true, name: true } },
            requests: {
                where: { isDeleted: false },
                select: {
                    id: true,
                    status: true,
                    message: true,
                    requesterId: true,
                    createdAt: true,
                },
                orderBy: { createdAt: "desc" },
            },
        },
    });

    if (!book) throw new AppError("Book not found.", 404);

    sendSuccess(res, book, "Book retrieved successfully.");
});

/**
 * PATCH /api/v1/books/:id
 * Update a book (protected — owner only).
 * Body: { title?, author?, description?, condition?, categoryId?, status? }
 */
router.patch("/:id", authenticate, async (req, res) => {
    const id = req.params.id as string;

    const book = await prisma.book.findFirst({
        where: { id, isDeleted: false },
    });
    if (!book) throw new AppError("Book not found.", 404);

    if (book.ownerId !== req.user!.id) {
        throw new AppError("You are not authorised to update this book.", 403);
    }

    const { title, author, description, condition, imageUrl, categoryId, status } =
        updateBookSchema.parse(req.body);

    if (categoryId && categoryId !== book.categoryId) {
        const category = await prisma.category.findFirst({
            where: { id: categoryId, isDeleted: false },
        });
        if (!category) throw new AppError("Category not found.", 404);
    }

    const updated = await prisma.book.update({
        where: { id },
        data: {
            ...(title && { title }),
            ...(author && { author }),
            ...(description !== undefined && { description }),
            ...(condition !== undefined && { condition }),
            ...(imageUrl !== undefined && { imageUrl }),
            ...(categoryId && { categoryId }),
            ...(status && { status }),
        },
        include: {
            owner: { select: { id: true, name: true, email: true } },
            category: { select: { id: true, name: true } },
        },
    });

    sendSuccess(res, updated, "Book updated successfully.");
});

/**
 * DELETE /api/v1/books/:id
 * Soft-delete a book (protected — owner only).
 */
router.delete("/:id", authenticate, async (req, res) => {
    const id = req.params.id as string;

    const book = await prisma.book.findFirst({
        where: { id, isDeleted: false },
    });
    if (!book) throw new AppError("Book not found.", 404);

    if (book.ownerId !== req.user!.id) {
        throw new AppError("You are not authorised to delete this book.", 403);
    }

    await prisma.book.update({
        where: { id },
        data: { isDeleted: true },
    });

    sendSuccess(res, null, "Book deleted successfully.");
});

export default router;
