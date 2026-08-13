import { api } from "./api";
import { User, ApiResponse } from "../types";

export const usersApi = {
    getUsers: async () => {
        const response = await api.get<ApiResponse<User[]>>("/users");
        return response.data;
    },
    getUserById: async (id: string) => {
        const response = await api.get<ApiResponse<User>>(`/users/${id}`);
        return response.data;
    },
    updateUser: async (id: string, data: { name?: string; email?: string }) => {
        const response = await api.patch<ApiResponse<User>>(`/users/${id}`, data);
        return response.data;
    },
    deleteUser: async (id: string) => {
        const response = await api.delete<ApiResponse<null>>(`/users/${id}`);
        return response.data;
    },
};
