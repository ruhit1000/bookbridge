"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import { booksApi } from "../../services/booksApi";
import { Book } from "../../types";
import BookCard from "../../components/BookCard";
import { Loader2, Plus } from "lucide-react";
import Link from "next/link";

export default function MyBooksPage() {
    const { user } = useAuth();
    const [books, setBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMyBooks = async () => {
            try {
                setIsLoading(true);
                const response = await booksApi.getBooks();
                // Filter locally as GET /books doesn't filter by ownerId
                setBooks(response.data.filter(b => b.ownerId === user?.id));
            } catch (err) {
                console.error("Failed to fetch my books:", err);
                setError("Failed to load your books.");
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchMyBooks();
        }
    }, [user]);

    return (
        <ProtectedRoute>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Library</h1>
                        <p className="text-gray-600 mt-1">Manage the books you are sharing with the community.</p>
                    </div>
                    <Link 
                        href="/add-book" 
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus className="h-5 w-5" />
                        List a Book
                    </Link>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center">
                        {error}
                    </div>
                ) : books.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 border-dashed shadow-sm">
                        <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Plus className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">Your library is empty</h3>
                        <p className="text-gray-500 mb-6">Start sharing your favorite books with others.</p>
                        <Link 
                            href="/add-book" 
                            className="bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        >
                            Add Your First Book
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {books.map((book) => (
                            <div key={book.id} className="relative group h-full">
                                <BookCard book={book} />
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link 
                                        href={`/edit-book/${book.id}`}
                                        className="bg-white text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium shadow-md hover:bg-gray-50 border border-gray-200"
                                    >
                                        Edit
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
