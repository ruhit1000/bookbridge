/**
 * routes/index.ts — Central Route Registration
 *
 * This file is the single entry point for all BookBridge API routes.
 * It mounts each service's router under the appropriate path prefix.
 *
 * All endpoint logic lives inside the corresponding service file.
 * This file only imports and mounts.
 *
 * Full route map (relative to /api/v1):
 *
 *  AUTH
 *    POST   /auth/register          — Register a new user
 *    POST   /auth/login             — Login and receive JWT
 *
 *  USERS
 *    GET    /users                  — List all users (public)
 *    GET    /users/:id              — Get user by ID (public)
 *    PATCH  /users/:id              — Update own profile (protected)
 *    DELETE /users/:id              — Soft-delete own account (protected)
 *
 *  CATEGORIES
 *    POST   /categories             — Create category (protected)
 *    GET    /categories             — List all categories (public)
 *    GET    /categories/:id         — Get category + its books (public)
 *    PATCH  /categories/:id         — Update category (protected)
 *    DELETE /categories/:id         — Soft-delete category (protected)
 *
 *  BOOKS
 *    POST   /books                  — List a book (protected, ownerId from JWT)
 *    GET    /books                  — Browse books (public, ?status= filter)
 *    GET    /books/:id              — Get book detail (public)
 *    PATCH  /books/:id              — Update book (protected, owner only)
 *    DELETE /books/:id              — Soft-delete book (protected, owner only)
 *
 *  BORROW REQUESTS
 *    POST   /borrow-requests        — Request to borrow (protected)
 *    GET    /borrow-requests        — My requests (protected, ?role=requester|owner)
 *    GET    /borrow-requests/:id    — Get request detail (protected)
 *    PATCH  /borrow-requests/:id    — Approve/Reject/Return (protected)
 *    DELETE /borrow-requests/:id    — Withdraw request (protected, PENDING only)
 */

import { Router } from "express";
import auth from "../services/auth.js";
import users from "../services/users.js";
import categories from "../services/categories.js";
import books from "../services/books.js";
import borrowRequests from "../services/borrowRequests.js";

const router = Router();

router.use("/auth", auth);
router.use("/users", users);
router.use("/categories", categories);
router.use("/books", books);
router.use("/borrow-requests", borrowRequests);

export default router;