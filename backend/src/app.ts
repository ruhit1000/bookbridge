import express from "express"
import cors from "cors"
import router from "./routes";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Home Route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Server is running"
    })
});

// API Routes
app.use("/api/v1", router);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Not Found"
    })
});

export default app;