import dotenv from "dotenv";
import app from "@/app";

dotenv.config();

import prisma from "@/lib/prisma";

const PORT = process.env.PORT || 8001;

const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

// Graceful shutdown
const shutdown = async () => {
    console.log("Shutting down gracefully...");
    server.close(() => {
        console.log("Closed out remaining connections.");
    });
    await prisma.$disconnect();
    process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);