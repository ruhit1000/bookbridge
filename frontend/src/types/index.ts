export type BookStatus = "AVAILABLE" | "BORROWED" | "UNAVAILABLE";
export type BorrowRequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "RETURNED";

export interface User {
    id: string;
    name: string;
    email: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Category {
    id: string;
    name: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Book {
    id: string;
    title: string;
    author: string;
    description?: string | null;
    condition?: string | null;
    status: BookStatus;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    ownerId: string;
    categoryId: string;
    owner: Partial<User>; // Based on include
    category: Partial<Category>; // Based on include
}

export interface BorrowRequest {
    id: string;
    status: BorrowRequestStatus;
    message?: string | null;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    bookId: string;
    requesterId: string;
    book: Partial<Book> & { owner?: Partial<User> }; // Nested include from backend
    requester: Partial<User>; // Based on include
}

// ─── Common Response Wrappers ───

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface ApiErrorResponse {
    success: boolean;
    message: string;
    errors?: Array<{ field: string; message: string }>;
}
