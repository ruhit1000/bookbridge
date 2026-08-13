"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { booksApi } from "../services/booksApi";
import { Book } from "../types";
import BookCard from "../components/BookCard";
import { Search, Loader2, Book as BookIcon } from "lucide-react";

export default function Home() {
    const [books, setBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                setIsLoading(true);
                const response = await booksApi.getBooks("AVAILABLE", debouncedSearch);
                setBooks(response.data);
            } catch (err) {
                console.error("Failed to fetch books:", err);
                setError("Failed to load available books. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchBooks();
    }, [debouncedSearch]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Hero Section */}
            <div className="relative w-full h-[300px] sm:h-[400px] rounded-3xl overflow-hidden mb-12 shadow-sm">
                <Image
                    src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000"
                    alt="Library Banner"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-6 text-center">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-4 drop-shadow-md">
                        Share books with your community
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-100 max-w-2xl mx-auto drop-shadow-md">
                        Discover books people are willing to lend, or list your own library to share with others.
                    </p>
                </div>
            </div>
            
            {/* Search Section */}
            <div className="max-w-2xl mx-auto mb-16 px-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base shadow-sm transition-shadow hover:shadow-md"
                        placeholder="Search books by title or author..."
                    />
                </div>
            </div>

            {/* Books Grid */}
            <div>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Available to Borrow</h2>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">
                        {error}
                    </div>
                ) : books.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 border-dashed">
                        <BookIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No books available</h3>
                        <p className="text-gray-500">Check back later or be the first to list a book!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {books.map((book) => (
                            <BookCard key={book.id} book={book} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
