import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import { sendSuccess } from "../lib/response.js";
import { authenticate } from "../lib/auth.js";

const router = Router();

// ─── Validation Schemas ────────────────────────────────────────

const createRequestSchema = z.object({
    bookId: z.string().min(1, "Book ID is required"),
    message: z.string().optional(),
});

const updateRequestSchema = z.object({
    status: z.enum(["APPROVED", "REJECTED", "RETURNED"], {
        message: "Status must be APPROVED, REJECTED, or RETURNED",
    }),
});

// ─── Shared Include (consistent borrow request shape) ──────────
const requestInclude = {
    book: {
        select: {
            id: true,
            title: true,
            author: true,
            status: true,
            condition: true,
            owner: { select: { id: true, name: true, email: true } },
        },
    },
    requester: { select: { id: true, name: true, email: true } },
} as const;

// ─── Routes ────────────────────────────────────────────────────

/**
 * POST /api/v1/borrow-requests
 * Request to borrow a book (protected).
 * Body: { bookId, message? }
 *
 * Rules:
 *  - Cannot request your own book
 *  - Book must be AVAILABLE
 */
router.post("/", authenticate, async (req, res) => {
    const { bookId, message } = createRequestSchema.parse(req.body);
    const requesterId = req.user!.id;

    const book = await prisma.book.findFirst({
        where: { id: bookId, isDeleted: false },
    });
    if (!book) throw new AppError("Book not found.", 404);

    // Rule 1: cannot borrow your own book
    if (book.ownerId === requesterId) {
        throw new AppError("You cannot request to borrow your own book.", 400);
    }

    // Rule 2: book must be available
    if (book.status !== "AVAILABLE") {
        throw new AppError(
            "This book is not available for borrowing.",
            400
        );
    }

    const request = await prisma.borrowRequest.create({
        data: { bookId, requesterId, message },
        include: requestInclude,
    });

    sendSuccess(res, request, "Borrow request submitted successfully.", 201);
});

/**
 * GET /api/v1/borrow-requests
 * Get all borrow requests relevant to the authenticated user (protected).
 * Returns requests the user made AND requests for books the user owns.
 * Optional query param: ?role=requester|owner
 */
router.get("/", authenticate, async (req, res) => {
    const userId = req.user!.id;
    const { role } = req.query;

    let where = {};

    if (role === "requester") {
        // Only requests I submitted
        where = { requesterId: userId, isDeleted: false };
    } else if (role === "owner") {
        // Only requests for books I own
        where = { isDeleted: false, book: { ownerId: userId } };
    } else {
        // All requests relevant to me (both sides)
        where = {
            isDeleted: false,
            OR: [
                { requesterId: userId },
                { book: { ownerId: userId } },
            ],
        };
    }

    const requests = await prisma.borrowRequest.findMany({
        where,
        include: requestInclude,
        orderBy: { createdAt: "desc" },
    });

    sendSuccess(res, requests, "Borrow requests retrieved successfully.");
});

/**
 * GET /api/v1/borrow-requests/:id
 * Get a single borrow request (protected).
 * Only accessible by the requester or the book owner.
 */
router.get("/:id", authenticate, async (req, res) => {
    const userId = req.user!.id;

    const request = await prisma.borrowRequest.findFirst({
        where: { id: req.params.id as string, isDeleted: false },
        include: requestInclude,
    });

    if (!request) throw new AppError("Borrow request not found.", 404);

    // Only the requester or the book owner can view this request
    const isRequester = request.requesterId === userId;
    const isOwner = request.book.owner.id === userId;

    if (!isRequester && !isOwner) {
        throw new AppError(
            "You are not authorised to view this borrow request.",
            403
        );
    }

    sendSuccess(res, request, "Borrow request retrieved successfully.");
});

/**
 * PATCH /api/v1/borrow-requests/:id
 * Update the status of a borrow request (protected).
 * Body: { status: "APPROVED" | "REJECTED" | "RETURNED" }
 *
 * Rules:
 *  - APPROVED / REJECTED → only the book owner, only when PENDING
 *      • On APPROVED: book status → BORROWED
 *  - RETURNED → only the original requester, only when APPROVED
 *      • On RETURNED: book status → AVAILABLE
 */
router.patch("/:id", authenticate, async (req, res) => {
    const userId = req.user!.id;
    const { status } = updateRequestSchema.parse(req.body);

    const request = await prisma.borrowRequest.findFirst({
        where: { id: req.params.id as string, isDeleted: false },
        include: {
            book: { select: { id: true, ownerId: true, status: true } },
        },
    });

    if (!request) throw new AppError("Borrow request not found.", 404);

    // ── APPROVE or REJECT ──────────────────────────────────────
    if (status === "APPROVED" || status === "REJECTED") {
        // Only the book owner can approve or reject
        if (request.book.ownerId !== userId) {
            throw new AppError(
                "Only the book owner can approve or reject borrow requests.",
                403
            );
        }

        // Can only act on PENDING requests
        if (request.status !== "PENDING") {
            throw new AppError(
                "Only pending requests can be approved or rejected.",
                400
            );
        }

        if (status === "APPROVED") {
            // Atomic: update request + book status together
            const [updated] = await prisma.$transaction([
                prisma.borrowRequest.update({
                    where: { id: request.id },
                    data: { status: "APPROVED" },
                    include: requestInclude,
                }),
                prisma.book.update({
                    where: { id: request.bookId },
                    data: { status: "BORROWED" },
                }),
            ]);
            return sendSuccess(res, updated, "Borrow request approved. Book is now BORROWED.");
        }

        // REJECTED — only update the request
        const updated = await prisma.borrowRequest.update({
            where: { id: request.id },
            data: { status: "REJECTED" },
            include: requestInclude,
        });
        return sendSuccess(res, updated, "Borrow request rejected.");
    }

    // ── RETURN ─────────────────────────────────────────────────
    if (status === "RETURNED") {
        // Only the original requester can mark as returned
        if (request.requesterId !== userId) {
            throw new AppError(
                "Only the borrower can mark a book as returned.",
                403
            );
        }

        // Can only return an APPROVED request
        if (request.status !== "APPROVED") {
            throw new AppError(
                "Only approved requests can be marked as returned.",
                400
            );
        }

        // Atomic: update request + book status together
        const [updated] = await prisma.$transaction([
            prisma.borrowRequest.update({
                where: { id: request.id },
                data: { status: "RETURNED" },
                include: requestInclude,
            }),
            prisma.book.update({
                where: { id: request.bookId },
                data: { status: "AVAILABLE" },
            }),
        ]);
        return sendSuccess(res, updated, "Book returned successfully. Book is now AVAILABLE.");
    }
});

/**
 * DELETE /api/v1/borrow-requests/:id
 * Soft-delete a borrow request (protected — requester only, PENDING only).
 */
router.delete("/:id", authenticate, async (req, res) => {
    const userId = req.user!.id;

    const request = await prisma.borrowRequest.findFirst({
        where: { id: req.params.id as string, isDeleted: false },
    });

    if (!request) throw new AppError("Borrow request not found.", 404);

    // Only the requester can delete their own request
    if (request.requesterId !== userId) {
        throw new AppError(
            "You are not authorised to delete this borrow request.",
            403
        );
    }

    // Only PENDING requests can be withdrawn
    if (request.status !== "PENDING") {
        throw new AppError(
            "Only pending borrow requests can be withdrawn.",
            400
        );
    }

    await prisma.borrowRequest.update({
        where: { id: request.id },
        data: { isDeleted: true },
    });

    sendSuccess(res, null, "Borrow request withdrawn successfully.");
});

export default router;
