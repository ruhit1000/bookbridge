"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { booksApi } from "../../../services/booksApi";
import { borrowRequestsApi } from "../../../services/borrowRequestsApi";
import { Book } from "../../../types";
import { useAuth } from "../../../context/AuthContext";
import { Loader2, Book as BookIcon, ChevronLeft, User as UserIcon, Tag, AlignLeft } from "lucide-react";
import Link from "next/link";
import { Modal, Button } from "@heroui/react";

export default function BookDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const bookId = params.id as string;
    
    const { user, isAuthenticated } = useAuth();
    
    const [book, setBook] = useState<Book | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [isRequesting, setIsRequesting] = useState(false);
    const [requestMessage, setRequestMessage] = useState("");
    const [requestSuccess, setRequestSuccess] = useState(false);

    useEffect(() => {
        const fetchBook = async () => {
            try {
                setIsLoading(true);
                const response = await booksApi.getBookById(bookId);
                setBook(response.data);
            } catch (err: any) {
                console.error("Failed to fetch book:", err);
                setError(err.response?.data?.message || "Failed to load book details.");
            } finally {
                setIsLoading(false);
            }
        };

        if (bookId) fetchBook();
    }, [bookId]);

    const handleRequestBorrow = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsRequesting(true);
        setError(null);
        
        try {
            await borrowRequestsApi.createRequest({
                bookId,
                message: requestMessage.trim() || undefined
            });
            setRequestSuccess(true);
        } catch (err: any) {
            console.error("Failed to request borrow:", err);
            setError(err.response?.data?.message || "Failed to submit request.");
        } finally {
            setIsRequesting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (error || !book) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-12">
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center">
                    <h3 className="text-lg font-medium mb-2">Book Not Found</h3>
                    <p>{error}</p>
                    <Link href="/" className="inline-block mt-4 text-red-700 hover:underline">
                        Return home
                    </Link>
                </div>
            </div>
        );
    }

    const isOwner = isAuthenticated && user?.id === book.ownerId;
    const isAvailable = book.status === "AVAILABLE";

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-8">
                <ChevronLeft className="h-4 w-4" />
                <span>Back to books</span>
            </Link>

            {requestSuccess && (
                <div className="mb-8 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl flex items-center justify-between shadow-sm">
                    <p className="font-medium">Borrow request sent successfully! The owner will review it.</p>
                    <Link href="/my-requests" className="text-green-800 hover:underline text-sm font-medium">
                        View requests
                    </Link>
                </div>
            )}

            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
                {/* Left side: Book Cover Placeholder */}
                <div className="w-full md:w-1/3 bg-gray-50 flex flex-col items-center justify-center p-12 border-b md:border-b-0 md:border-r border-gray-200 min-h-[300px]">
                    <BookIcon className="h-20 w-20 text-gray-300 mb-6" strokeWidth={1} />
                    <span className="text-sm font-medium text-gray-400 uppercase tracking-widest text-center px-4">
                        {book.category?.name || "Uncategorized"}
                    </span>
                </div>

                {/* Right side: Details */}
                <div className="w-full md:w-2/3 p-8 sm:p-10 flex flex-col">
                    <div className="mb-6 flex flex-wrap gap-3 items-start justify-between">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-serif font-medium text-gray-900 mb-2 leading-tight">
                                {book.title}
                            </h1>
                            <p className="text-lg text-gray-500 font-medium">by {book.author}</p>
                        </div>
                        
                        <div>
                            {isAvailable ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                                    Available to Borrow
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                    Currently {book.status.toLowerCase()}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 py-6 border-y border-gray-100">
                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="bg-gray-100 p-2 rounded-lg text-gray-500">
                                <UserIcon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Owner</p>
                                <p className="font-medium">{book.owner?.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="bg-gray-100 p-2 rounded-lg text-gray-500">
                                <Tag className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Condition</p>
                                <p className="font-medium">{book.condition || "Not specified"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-10 flex-grow">
                        <div className="flex items-center gap-2 mb-3 text-gray-900 font-semibold">
                            <AlignLeft className="h-5 w-5 text-gray-400" />
                            <h3>Description</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {book.description || "No description provided."}
                        </p>
                    </div>

                    {/* Action Area */}
                    <div className="mt-auto pt-6">
                        {!isAuthenticated ? (
                            <Link 
                                href={`/login?redirect=/books/${book.id}`}
                                className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors"
                            >
                                Login to Borrow
                            </Link>
                        ) : isOwner ? (
                            <Link 
                                href={`/edit-book/${book.id}`}
                                className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-gray-300 rounded-xl shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                Edit Book
                            </Link>
                        ) : !isAvailable ? (
                            <button 
                                disabled
                                className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-base font-medium text-gray-500 bg-gray-100 cursor-not-allowed"
                            >
                                Book is not available
                            </button>
                        ) : (
                            <Modal>
                                <Modal.Trigger>
                                    <Button className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                                        Request to Borrow
                                    </Button>
                                </Modal.Trigger>
                                <Modal.Backdrop className="fixed inset-0 bg-black/50 z-40" />
                                <Modal.Container placement="center">
                                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                                        <Modal.Dialog className="bg-white rounded-2xl shadow-xl overflow-hidden p-6 max-w-lg w-full relative outline-none">
                                        {({ close }) => (
                                            <form onSubmit={async (e) => {
                                                await handleRequestBorrow(e);
                                                close();
                                            }}>
                                                <Modal.Header>
                                                    <Modal.Heading className="text-xl font-bold text-gray-900 mb-2">
                                                        Request to Borrow
                                                    </Modal.Heading>
                                                </Modal.Header>
                                                <Modal.Body className="mb-6">
                                                    <p className="text-sm text-gray-500 mb-4">
                                                        You are requesting to borrow <span className="font-semibold text-gray-700">{book.title}</span> from {book.owner?.name}.
                                                    </p>
                                                    
                                                    <div className="w-full">
                                                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                                            Message for the owner (optional)
                                                        </label>
                                                        <textarea
                                                            id="message"
                                                            rows={4}
                                                            value={requestMessage}
                                                            onChange={(e) => setRequestMessage(e.target.value)}
                                                            className="block w-full border border-gray-300 rounded-xl shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                            placeholder="E.g., I promise to take good care of it and return it in a week!"
                                                        />
                                                    </div>
                                                </Modal.Body>
                                                <Modal.Footer className="flex justify-end gap-3 border-t border-gray-100 pt-4 mt-4">
                                                    <button
                                                        type="button"
                                                        onClick={close}
                                                        className="inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={isRequesting}
                                                        className="inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none disabled:opacity-50 transition-colors"
                                                    >
                                                        {isRequesting ? (
                                                            <span className="flex items-center gap-2">
                                                                <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                                                            </span>
                                                        ) : "Send Request"}
                                                    </button>
                                                </Modal.Footer>
                                            </form>
                                        )}
                                        </Modal.Dialog>
                                    </div>
                                </Modal.Container>
                            </Modal>
                        )}
                    </div>
                </div>
            </div>


        </div>
    );
}
