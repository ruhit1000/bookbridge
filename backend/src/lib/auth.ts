import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "./prisma.js";
import { AppError } from "./errors.js";

// ─── Type Augmentation ─────────────────────────────────────────
// Extend Express's Request interface so TypeScript knows about
// req.user on every protected route handler.
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                name: string;
                email: string;
            };
        }
    }
}

// ─── JWT Payload Shape ─────────────────────────────────────────
interface JwtPayload {
    userId: string;
}

// ─── Authenticate Middleware ───────────────────────────────────
/**
 * Verifies the Bearer JWT from the Authorization header.
 * On success, attaches the authenticated user to req.user.
 * Throws AppError(401) for any invalid or missing token.
 */
export const authenticate = async (
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError("Access denied. No token provided.", 401);
    }

    const token = authHeader.split(" ")[1];

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new AppError("Server configuration error.", 500);
    }

    let decoded: JwtPayload;

    try {
        decoded = jwt.verify(token, secret) as JwtPayload;
    } catch {
        throw new AppError("Invalid or expired token.", 401);
    }

    // Verify the user still exists and has not been soft-deleted
    const user = await prisma.user.findFirst({
        where: {
            id: decoded.userId,
            isDeleted: false,
        },
        select: {
            id: true,
            name: true,
            email: true,
        },
    });

    if (!user) {
        throw new AppError("User account not found or has been deleted.", 401);
    }

    req.user = user;
    next();
};
