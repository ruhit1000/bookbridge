import axios from "axios";

// Read base URL from environment, fallback for safety
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
    console.warn("NEXT_PUBLIC_API_URL is not defined! API calls may fail.");
}

export const api = axios.create({
    baseURL: BASE_URL || "/api/v1", // Fallback to relative if not defined, though it's expected to be defined.
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor: Attach JWT token if it exists
api.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle global errors (optional: redirect on 401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Example: If unauthorized, we could trigger a logout event here
        if (error.response?.status === 401) {
            if (typeof window !== "undefined") {
                // We'll manage logout cleanly via Context, but clearing token here is an option
                // localStorage.removeItem("token");
            }
        }
        return Promise.reject(error);
    }
);
