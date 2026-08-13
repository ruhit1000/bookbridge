"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import { booksApi } from "../../services/booksApi";
import { borrowRequestsApi } from "../../services/borrowRequestsApi";
import { Book, BorrowRequest } from "../../types";
import { Book as BookIcon, GitPullRequest, ArrowRightLeft, Loader2, Clock } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
    const { user } = useAuth();
    const [books, setBooks] = useState<Book[]>([]);
    const [requests, setRequests] = useState<BorrowRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // We fetch all books and filter to find ours
                const [booksRes, reqsRes] = await Promise.all([
                    booksApi.getBooks(),
                    borrowRequestsApi.getRequests() // Gets all requests for this user
                ]);

                const myBooks = booksRes.data.filter(b => b.ownerId === user?.id);
                setBooks(myBooks);
                setRequests(reqsRes.data);
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    if (isLoading) {
        return (
            <ProtectedRoute>
                <div className="flex justify-center items-center min-h-[60vh]">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
            </ProtectedRoute>
        );
    }

    const totalListed = books.length;
    const activeBorrowed = books.filter(b => b.status === "BORROWED").length;
    
    // Incoming requests (I am the owner)
    const incomingRequests = requests.filter(r => r.book.owner?.id === user?.id && r.status === "PENDING").length;
    
    // My requests (I am the requester)
    const myPendingRequests = requests.filter(r => r.requesterId === user?.id && r.status === "PENDING").length;

    const recentActivity = requests.slice(0, 5); // Just grab the 5 most recent requests

    return (
        <ProtectedRoute>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <Link href="/add-book" className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors">
                        Add New Book
                    </Link>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-500">Books Listed</h3>
                            <div className="bg-blue-50 p-2 rounded-lg"><BookIcon className="h-5 w-5 text-blue-600" /></div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{totalListed}</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-500">Actively Lent Out</h3>
                            <div className="bg-green-50 p-2 rounded-lg"><ArrowRightLeft className="h-5 w-5 text-green-600" /></div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{activeBorrowed}</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-500">Incoming Requests</h3>
                            <div className="bg-orange-50 p-2 rounded-lg"><GitPullRequest className="h-5 w-5 text-orange-600" /></div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{incomingRequests}</p>
                        {incomingRequests > 0 && (
                            <Link href="/incoming-requests" className="mt-3 block text-sm text-blue-600 font-medium hover:underline">Review requests →</Link>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-500">My Pending Borrows</h3>
                            <div className="bg-purple-50 p-2 rounded-lg"><Clock className="h-5 w-5 text-purple-600" /></div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{myPendingRequests}</p>
                    </div>
                </div>

                {/* Recent Activity */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        {recentActivity.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No recent activity found.
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {recentActivity.map(req => {
                                    const isMine = req.requesterId === user?.id;
                                    return (
                                        <li key={req.id} className="p-4 sm:px-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-full ${isMine ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'}`}>
                                                    {isMine ? <Clock className="h-5 w-5" /> : <GitPullRequest className="h-5 w-5" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {isMine 
                                                            ? `You requested to borrow "${req.book.title}"`
                                                            : `${req.requester?.name} wants to borrow "${req.book.title}"`}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        Status: <span className="font-semibold">{req.status}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {new Date(req.createdAt).toLocaleDateString()}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                        {recentActivity.length > 0 && (
                            <div className="bg-gray-50 p-4 border-t border-gray-100 text-center">
                                <Link href="/my-requests" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                    View all requests
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
