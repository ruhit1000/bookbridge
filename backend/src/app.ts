import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import router from "./routes/index.js";
import { AppError } from "./lib/errors.js";
import { PrismaClientKnownRequestError } from "./generated/prisma/internal/prismaNamespace.js";
import { ZodError } from "zod";

const app = express();

// ─── Middlewares ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ──────────────────────────────────────────────
app.get("/", (_req, res) => {
    res.json({
        success: true,
        message: "BookBridge server is running",
    });
});

// ─── API Routes ────────────────────────────────────────────────
app.use("/api/v1", router);

// ─── 404 Handler ───────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// ─── Global Error Handler ──────────────────────────────────────
// 4-argument signature required for Express to treat this as an
// error-handling middleware. Express 5 auto-forwards async errors here.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    // Known application error (thrown intentionally from services)
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
        return;
    }

    // Zod v4 validation error (.issues is the correct property in v4)
    if (err instanceof ZodError) {
        res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: err.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            })),
        });
        return;
    }

    // Prisma known request errors
    if (err instanceof PrismaClientKnownRequestError) {
        // P2002 — Unique constraint violation
        if ((err as PrismaClientKnownRequestError).code === "P2002") {
            res.status(409).json({
                success: false,
                message: "A record with that value already exists",
            });
            return;
        }

        // P2025 — Record not found
        if ((err as PrismaClientKnownRequestError).code === "P2025") {
            res.status(404).json({
                success: false,
                message: "Record not found",
            });
            return;
        }
    }

    // Unknown / unexpected error — never expose internals to the client
    console.error("[Unhandled Error]", err);
    res.status(500).json({
        success: false,
        message: "Internal server error",
    });
});

export default app;