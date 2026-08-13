import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import router from "./routes/index.js";
import { AppError } from "./lib/errors.js";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(cors({
    origin: FRONTEND_URL,
    credentials: true,
}));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { success: false, message: "Too many requests, please try again later." }
});
app.use("/api/v1", limiter);

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

app.get("/", (_req, res) => {
    res.json({
        success: true,
        message: "BookBridge server is running",
    });
});

app.use("/api/v1", router);

app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// 4-argument signature required for Express to treat this as an
// error-handling middleware. Express 5 auto-forwards async errors here.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
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

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            res.status(409).json({
                success: false,
                message: "A record with that value already exists",
            });
            return;
        }

        if (err.code === "P2025") {
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