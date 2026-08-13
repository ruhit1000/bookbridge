import { Router } from "express";
import auth from "../services/auth.js";
import users from "../services/users.js";
import categories from "../services/categories.js";
import books from "../services/books.js";
import borrowRequests from "../services/borrowRequests.js";

const router = Router();

// ─── Mount Service Routers ─────────────────────────────────────
router.use("/auth", auth);
router.use("/users", users);
router.use("/categories", categories);
router.use("/books", books);
router.use("/borrow-requests", borrowRequests);

export default router;