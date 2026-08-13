"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { booksApi } from "../services/booksApi";
import { categoriesApi } from "../services/categoriesApi";
import { Book, Category, BookStatus } from "../types";
import { Loader2 } from "lucide-react";

interface BookFormProps {
    initialData?: Book;
    isEditing?: boolean;
}

export default function BookForm({ initialData, isEditing = false }: BookFormProps) {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    
    const [title, setTitle] = useState(initialData?.title || "");
    const [author, setAuthor] = useState(initialData?.author || "");
    const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
    const [condition, setCondition] = useState(initialData?.condition || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [status, setStatus] = useState<BookStatus>(initialData?.status || "AVAILABLE");
    
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingCategories, setIsFetchingCategories] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await categoriesApi.getCategories();
                setCategories(res.data);
                // Pre-select first category if none is selected
                if (!initialData?.categoryId && res.data.length > 0) {
                    setCategoryId(res.data[0].id);
                }
            } catch (err) {
                console.error("Failed to load categories", err);
                setError("Failed to load categories.");
            } finally {
                setIsFetchingCategories(false);
            }
        };

        fetchCategories();
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (isEditing && initialData) {
                await booksApi.updateBook(initialData.id, {
                    title,
                    author,
                    categoryId,
                    condition: condition || undefined,
                    description: description || undefined,
                    status
                });
                router.push(`/books/${initialData.id}`);
            } else {
                const res = await booksApi.createBook({
                    title,
                    author,
                    categoryId,
                    condition: condition || undefined,
                    description: description || undefined
                });
                router.push(`/books/${res.data.id}`);
            }
        } catch (err: any) {
            console.error("Failed to save book", err);
            setError(err.response?.data?.message || "Failed to save book.");
            setIsLoading(false);
        }
    };

    if (isFetchingCategories) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Book Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-2 block w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                        placeholder="e.g. The Great Gatsby"
                    />
                </div>

                <div>
                    <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                        Author
                    </label>
                    <input
                        type="text"
                        id="author"
                        required
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="mt-2 block w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                        placeholder="e.g. F. Scott Fitzgerald"
                    />
                </div>

                <div>
                    <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                        Category
                    </label>
                    <select
                        id="categoryId"
                        required
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="mt-2 block w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm bg-white"
                    >
                        <option value="" disabled>Select a category...</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
                        Condition
                    </label>
                    <input
                        type="text"
                        id="condition"
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                        className="mt-2 block w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                        placeholder="e.g. Like New, Good, Fair"
                    />
                </div>

                {isEditing && (
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                            Availability Status
                        </label>
                        <select
                            id="status"
                            required
                            value={status}
                            onChange={(e) => setStatus(e.target.value as BookStatus)}
                            className="mt-2 block w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm bg-white"
                        >
                            <option value="AVAILABLE">Available</option>
                            <option value="UNAVAILABLE">Unavailable (Hide from listings)</option>
                            <option value="BORROWED" disabled>Borrowed (Managed automatically)</option>
                        </select>
                    </div>
                )}

                <div className="sm:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description (Optional)
                    </label>
                    <textarea
                        id="description"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-2 block w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                        placeholder="Provide some details about the book..."
                    />
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="bg-white px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors mr-4"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 px-6 py-2.5 rounded-xl text-white font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isEditing ? "Save Changes" : "List Book"}
                </button>
            </div>
        </form>
    );
}
