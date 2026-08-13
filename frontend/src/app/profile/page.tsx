"use client";

import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import { User as UserIcon, Mail, Calendar } from "lucide-react";

export default function ProfilePage() {
    const { user } = useAuth();

    return (
        <ProtectedRoute>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
                
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-8 py-10 border-b border-gray-100 flex flex-col items-center sm:flex-row sm:justify-start gap-6">
                        <div className="bg-blue-100 text-blue-700 h-24 w-24 rounded-full flex items-center justify-center text-3xl font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-center sm:text-left">
                            <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                            <p className="text-gray-500">Member of BookBridge</p>
                        </div>
                    </div>
                    
                    <div className="p-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-6">Account Information</h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-gray-50 p-3 rounded-xl">
                                    <UserIcon className="h-6 w-6 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Full Name</p>
                                    <p className="text-base text-gray-900 font-medium mt-1">{user?.name}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4">
                                <div className="bg-gray-50 p-3 rounded-xl">
                                    <Mail className="h-6 w-6 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Email Address</p>
                                    <p className="text-base text-gray-900 font-medium mt-1">{user?.email}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-gray-50 p-3 rounded-xl">
                                    <Calendar className="h-6 w-6 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Joined</p>
                                    <p className="text-base text-gray-900 font-medium mt-1">
                                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) : "Recently"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
