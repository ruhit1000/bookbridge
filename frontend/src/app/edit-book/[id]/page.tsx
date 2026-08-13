"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "../../../components/ProtectedRoute";
import BookForm from "../../../components/BookForm";
import { booksApi } from "../../../services/booksApi";
import { Book } from "../../../types";
import { Loader2 } from "lucide-react";

export default function EditBookPage() {
    const params = useParams();
    const bookId = params.id as string;
    
    const [book, setBook] = useState<Book | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const response = await booksApi.getBookById(bookId);
                setBook(response.data);
            } catch (err) {
                console.error("Failed to load book", err);
                setError("Failed to load book details. It may have been deleted.");
            } finally {
                setIsLoading(false);
            }
        };

        if (bookId) fetchBook();
    }, [bookId]);

    return (
        <ProtectedRoute>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Book Details</h1>
                    <p className="text-gray-600">Update the information for your listed book.</p>
                </div>
                
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                    {isLoading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                        </div>
                    ) : error || !book ? (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">
                            {error || "Book not found"}
                        </div>
                    ) : (
                        <BookForm initialData={book} isEditing={true} />
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
