import { Response } from "express";

/**
 * sendSuccess
 *
 * Sends a consistent success response across all endpoints.
 *
 * Shape:
 * {
 *   "success": true,
 *   "message": "...",
 *   "data": <payload>
 * }
 */
export const sendSuccess = <T>(
    res: Response,
    data: T,
    message: string = "Success",
    statusCode: number = 200
): void => {
    res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

/**
 * sendError
 *
 * Sends a consistent error response across all endpoints.
 *
 * Shape:
 * {
 *   "success": false,
 *   "message": "...",
 *   "errors": <optional detail>
 * }
 */
export const sendError = (
    res: Response,
    message: string = "Something went wrong",
    statusCode: number = 500,
    errors?: unknown
): void => {
    const body: Record<string, unknown> = {
        success: false,
        message,
    };

    if (errors !== undefined) {
        body.errors = errors;
    }

    res.status(statusCode).json(body);
};
