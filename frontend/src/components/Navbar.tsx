"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { BookOpen, User, LogOut } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-2 group">
                            <BookOpen className="h-6 w-6 text-blue-600 group-hover:text-blue-700 transition-colors" />
                            <span className="text-xl font-bold text-gray-900 tracking-tight">BookBridge</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <span className="hidden sm:block">{user?.name}</span>
                                    <div className="bg-gray-100 p-1.5 rounded-full">
                                        <User className="h-5 w-5" />
                                    </div>
                                </button>

                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 flex flex-col overflow-hidden">
                                        <Link
                                            href="/dashboard"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            href="/my-books"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            My Books
                                        </Link>
                                        <Link
                                            href="/my-requests"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            My Requests
                                        </Link>
                                        <div className="h-px bg-gray-100 my-1"></div>
                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                logout();
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/login"
                                    className="text-gray-600 hover:text-gray-900 font-medium px-3 py-2 transition-colors"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/register"
                                    className="bg-blue-600 text-white font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
