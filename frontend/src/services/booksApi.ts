import { api } from "./api";
import { Book, ApiResponse, BookStatus } from "../types";

export const booksApi = {
    getBooks: async (status?: BookStatus, search?: string) => {
        const params: any = {};
        if (status) params.status = status;
        if (search) params.search = search;
        const response = await api.get<ApiResponse<Book[]>>("/books", { params });
        return response.data;
    },
    getBookById: async (id: string) => {
        const response = await api.get<ApiResponse<Book>>(`/books/${id}`);
        return response.data;
    },
    createBook: async (data: { title: string; author: string; description?: string; condition?: string; imageUrl?: string; categoryId: string }) => {
        const response = await api.post<ApiResponse<Book>>("/books", data);
        return response.data;
    },
    updateBook: async (id: string, data: Partial<{ title: string; author: string; description: string; condition: string; imageUrl: string; categoryId: string; status: BookStatus }>) => {
        const response = await api.patch<ApiResponse<Book>>(`/books/${id}`, data);
        return response.data;
    },
    deleteBook: async (id: string) => {
        const response = await api.delete<ApiResponse<null>>(`/books/${id}`);
        return response.data;
    },
};
