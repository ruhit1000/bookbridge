/**
 * AppError
 *
 * A custom error class used throughout the application to signal expected
 * failures (e.g. 404 Not Found, 401 Unauthorised, 409 Conflict).
 *
 * Throwing an AppError from any service function will be caught by the
 * global error handler in app.ts and converted into a structured JSON
 * response with the appropriate HTTP status code.
 */
export class AppError extends Error {
    public readonly statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;

        // Maintain correct prototype chain for instanceof checks
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = "AppError";
    }
}
