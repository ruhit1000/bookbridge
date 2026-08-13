import { Router } from "express";
import { sendSuccess } from "../lib/response.js";
import * as authService from "../services/auth.js";

const router = Router();

// ═══════════════════════════════════════════════════════════════
// AUTH ROUTES — /api/v1/auth
// ═══════════════════════════════════════════════════════════════

/**
 * POST /api/v1/auth/register
 * Register a new user account.
 *
 * Body: { name, email, password }
 * Response: 201 + created user (no password)
 */
router.post("/auth/register", async (req, res) => {
    const user = await authService.register(req.body);
    sendSuccess(res, user, "Registration successful.", 201);
});

/**
 * POST /api/v1/auth/login
 * Authenticate and receive a JWT.
 *
 * Body: { email, password }
 * Response: 200 + { token, user }
 */
router.post("/auth/login", async (req, res) => {
    const result = await authService.login(req.body);
    sendSuccess(res, result, "Login successful.");
});

export default router;