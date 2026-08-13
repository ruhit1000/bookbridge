import { api } from "./api";
import { Category, ApiResponse } from "../types";

// Note: GET /categories/:id includes books, we can cast it if needed later
export const categoriesApi = {
    getCategories: async () => {
        const response = await api.get<ApiResponse<Category[]>>("/categories");
        return response.data;
    },
    getCategoryById: async (id: string) => {
        const response = await api.get<ApiResponse<Category & { books: any[] }>>(`/categories/${id}`);
        return response.data;
    },
};
