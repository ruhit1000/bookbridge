import { api } from "./api";
import { BorrowRequest, ApiResponse, BorrowRequestStatus } from "../types";

export const borrowRequestsApi = {
    getRequests: async (role?: "requester" | "owner") => {
        const params = role ? { role } : {};
        const response = await api.get<ApiResponse<BorrowRequest[]>>("/borrow-requests", { params });
        return response.data;
    },
    getRequestById: async (id: string) => {
        const response = await api.get<ApiResponse<BorrowRequest>>(`/borrow-requests/${id}`);
        return response.data;
    },
    createRequest: async (data: { bookId: string; message?: string }) => {
        const response = await api.post<ApiResponse<BorrowRequest>>("/borrow-requests", data);
        return response.data;
    },
    updateRequestStatus: async (id: string, status: BorrowRequestStatus) => {
        const response = await api.patch<ApiResponse<BorrowRequest>>(`/borrow-requests/${id}`, { status });
        return response.data;
    },
    deleteRequest: async (id: string) => {
        const response = await api.delete<ApiResponse<null>>(`/borrow-requests/${id}`);
        return response.data;
    },
};
