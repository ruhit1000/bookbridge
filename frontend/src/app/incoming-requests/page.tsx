"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import { borrowRequestsApi } from "../../services/borrowRequestsApi";
import { BorrowRequest } from "../../types";
import { Loader2, GitPullRequest, Check, X } from "lucide-react";
import Link from "next/link";

export default function IncomingRequestsPage() {
    const [requests, setRequests] = useState<BorrowRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchRequests = async () => {
        try {
            setIsLoading(true);
            const response = await borrowRequestsApi.getRequests("owner");
            setRequests(response.data);
        } catch (err) {
            console.error("Failed to fetch incoming requests:", err);
            setError("Failed to load incoming requests.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (id: string, action: "APPROVED" | "REJECTED") => {
        try {
            setActionLoading(id);
            await borrowRequestsApi.updateRequestStatus(id, action);
            await fetchRequests(); // Refresh the list
        } catch (err) {
            console.error(`Failed to ${action} request`, err);
            alert(`Failed to update request.`);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <ProtectedRoute>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Incoming Requests</h1>
                    <p className="text-gray-600 mt-1">Review requests from others wanting to borrow your books.</p>
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
                            <GitPullRequest className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No incoming requests</h3>
                        <p className="text-gray-500 mb-6">Nobody has requested to borrow your books yet.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <ul className="divide-y divide-gray-100">
                            {requests.map((request) => (
                                <li key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    request.status === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                                                    request.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                    request.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {request.status}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(request.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                                                <span className="text-gray-500 font-medium">Request for: </span>
                                                <Link href={`/books/${request.bookId}`} className="hover:text-blue-600 transition-colors">
                                                    {request.book?.title}
                                                </Link>
                                            </h3>
                                            
                                            <div className="bg-gray-50 p-4 rounded-xl mt-3 border border-gray-100">
                                                <p className="text-sm text-gray-900 font-medium mb-1">
                                                    Requester: {request.requester?.name}
                                                </p>
                                                {request.message ? (
                                                    <p className="text-sm text-gray-600 italic">"{request.message}"</p>
                                                ) : (
                                                    <p className="text-sm text-gray-400 italic">No message provided.</p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col sm:flex-row gap-3 md:min-w-[200px] shrink-0 justify-end">
                                            {request.status === "PENDING" && (
                                                <>
                                                    <button
                                                        onClick={() => handleAction(request.id, "REJECTED")}
                                                        disabled={actionLoading === request.id}
                                                        className="inline-flex justify-center items-center px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200 focus:outline-none transition-colors disabled:opacity-50"
                                                    >
                                                        {actionLoading === request.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><X className="h-4 w-4 mr-1.5"/> Reject</>}
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(request.id, "APPROVED")}
                                                        disabled={actionLoading === request.id}
                                                        className="inline-flex justify-center items-center px-4 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors disabled:opacity-50"
                                                    >
                                                        {actionLoading === request.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-1.5"/> Approve</>}
                                                    </button>
                                                </>
                                            )}
                                        </div>
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
