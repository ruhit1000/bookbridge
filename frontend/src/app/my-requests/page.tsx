"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import { borrowRequestsApi } from "../../services/borrowRequestsApi";
import { BorrowRequest } from "../../types";
import { Loader2, Clock, CheckCircle, XCircle, ArrowLeftRight } from "lucide-react";
import Link from "next/link";

export default function MyRequestsPage() {
    const [requests, setRequests] = useState<BorrowRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchRequests = async () => {
        try {
            setIsLoading(true);
            const response = await borrowRequestsApi.getRequests("requester");
            setRequests(response.data);
        } catch (err) {
            console.error("Failed to fetch my requests:", err);
            setError("Failed to load your borrow requests.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleWithdraw = async (id: string) => {
        if (!confirm("Are you sure you want to withdraw this request?")) return;
        
        try {
            setActionLoading(id);
            await borrowRequestsApi.deleteRequest(id);
            await fetchRequests(); // Refresh the list
        } catch (err) {
            console.error("Failed to withdraw request", err);
            alert("Failed to withdraw request.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReturn = async (id: string) => {
        if (!confirm("Have you returned this book to the owner?")) return;
        
        try {
            setActionLoading(id);
            await borrowRequestsApi.updateRequestStatus(id, "RETURNED");
            await fetchRequests(); // Refresh the list
        } catch (err) {
            console.error("Failed to mark as returned", err);
            alert("Failed to mark as returned.");
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200"><Clock className="h-3 w-3" /> Pending</span>;
            case "APPROVED":
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200"><CheckCircle className="h-3 w-3" /> Approved (Borrowing)</span>;
            case "REJECTED":
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200"><XCircle className="h-3 w-3" /> Rejected</span>;
            case "RETURNED":
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"><ArrowLeftRight className="h-3 w-3" /> Returned</span>;
            default:
                return null;
        }
    };

    return (
        <ProtectedRoute>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Requests</h1>
                    <p className="text-gray-600 mt-1">Books you have requested to borrow from others.</p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center">
                        {error}
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 border-dashed shadow-sm">
                        <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No requests yet</h3>
                        <p className="text-gray-500 mb-6">You haven't requested to borrow any books.</p>
                        <Link 
                            href="/" 
                            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            Browse Available Books
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <ul className="divide-y divide-gray-100">
                            {requests.map((request) => (
                                <li key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-lg font-bold text-gray-900">
                                                    <Link href={`/books/${request.bookId}`} className="hover:text-blue-600 transition-colors">
                                                        {request.book?.title}
                                                    </Link>
                                                </h3>
                                                {getStatusBadge(request.status)}
                                            </div>
                                            <p className="text-sm text-gray-500 mb-2">
                                                Owner: <span className="font-medium text-gray-700">{request.book?.owner?.name}</span>
                                            </p>
                                            {request.message && (
                                                <p className="text-sm text-gray-600 italic border-l-2 border-gray-200 pl-3 py-1">
                                                    "{request.message}"
                                                </p>
                                            )}
                                        </div>
                                        
                                        <div className="flex flex-col gap-2 min-w-[120px]">
                                            {request.status === "PENDING" && (
                                                <button
                                                    onClick={() => handleWithdraw(request.id)}
                                                    disabled={actionLoading === request.id}
                                                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50 focus:outline-none transition-colors disabled:opacity-50"
                                                >
                                                    {actionLoading === request.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Withdraw"}
                                                </button>
                                            )}
                                            
                                            {request.status === "APPROVED" && (
                                                <button
                                                    onClick={() => handleReturn(request.id)}
                                                    disabled={actionLoading === request.id}
                                                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none transition-colors disabled:opacity-50"
                                                >
                                                    {actionLoading === request.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mark Returned"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-50 text-xs text-gray-400">
                                        Requested on {new Date(request.createdAt).toLocaleDateString()}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
