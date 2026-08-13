"use client";

import ProtectedRoute from "../../components/ProtectedRoute";
import BookForm from "../../components/BookForm";

export default function AddBookPage() {
    return (
        <ProtectedRoute>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">List a New Book</h1>
                    <p className="text-gray-600">Share your book with the community by providing the details below.</p>
                </div>
                
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                    <BookForm />
                </div>
            </div>
        </ProtectedRoute>
    );
}
