import { api } from "./api";
import { User, ApiResponse } from "../types";

export interface LoginResponse {
    token: string;
    user: User;
}

export const authApi = {
    login: async (credentials: { email: string; password: string }) => {
        const response = await api.post<ApiResponse<LoginResponse>>("/auth/login", credentials);
        return response.data;
    },
    register: async (data: { name: string; email: string; password: string }) => {
        const response = await api.post<ApiResponse<User>>("/auth/register", data);
        return response.data;
    },
};
