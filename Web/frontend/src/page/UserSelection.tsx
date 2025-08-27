import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/services';
import type { User } from '@/types';
import { Check, ArrowRight } from "lucide-react";

interface Toast {
    id: number;
    message: string;
    visible: boolean;
    showIcon: boolean;
}

const UserSelection: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<Toast | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const userList = await apiClient.getUsers();
            setUsers(userList);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const showToast = (message: string) => {
        const newToast = {
            id: Date.now(),
            message,
            visible: true,
            showIcon: false,
        };
        setToast(newToast);

        setTimeout(() => {
            setToast((prev) => (prev ? { ...prev, showIcon: true } : null));
        }, 200);
    };

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => {
                setToast((prev) => (prev ? { ...prev, visible: false, showIcon: false } : null));
                setTimeout(() => setToast(null), 500);
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const handleUserSelect = async () => {
        if (!selectedUser) return;

        setLoading(true);
        try {
            await apiClient.selectUser(selectedUser);
            // Persist current user and notify layout listeners
            try {
                localStorage.setItem("yaya_current_user", JSON.stringify(selectedUser));
                window.dispatchEvent(new CustomEvent('yaya:user-changed'));
            } catch (e) {}
            showToast(`Selected ${selectedUser.Name} successfully!`);
            // Navigate to dashboard after a short delay to show the toast
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
        } catch (error) {
            console.error('Error selecting user:', error);
            showToast("Error selecting user. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 h-screen w-screen overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: "url(/images/mybg.png)",
                }}
            />

            {/* Glassmorphic User Selection Component */}
            <div className="relative z-10 flex items-center justify-center h-full w-full p-4">
                <div className="w-full max-w-md">
                    <div className="p-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-gray-700 mb-2">YaYa Wallet Dashboard</h1>
                            <p className="text-gray-700/80 text-sm">Select a user to view transactions as the user</p>
                        </div>

                        {/* User Selection */}
                        <div className="space-y-1 mb-6">
                            {users.map((user, index) => (
                                <label
                                    key={index}
                                    className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ease-out cursor-pointer hover:bg-white/15 hover:scale-[1.02] ${selectedUser?.Account === user.Account ? "bg-white/20 shadow-md" : ""
                                        }`}
                                    onClick={() => setSelectedUser(user)}
                                >
                                    <div className="relative">
                                        <input
                                            type="radio"
                                            name="user"
                                            value={user.Account}
                                            checked={selectedUser?.Account === user.Account}
                                            onChange={() => setSelectedUser(user)}
                                            className="sr-only"
                                        />
                                        <div
                                            className={`w-5 h-5 rounded-full border-2 border-gray-700/40 transition-all duration-200 ${selectedUser?.Account === user.Account
                                                ? "bg-gray-700/30 border-gray-700/60"
                                                : "hover:border-gray-700/60"
                                                }`}
                                        >
                                            {selectedUser?.Account === user.Account && (
                                                <div className="w-2 h-2 bg-gray-700 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-start justify-start flex-1">

                                        <div className="font-medium text-gray-700 text-sm">{user.Name}</div>
                                        <div className="text-xs text-gray-700/70">@{user.Account}</div>

                                    </div>
                                </label>
                            ))}
                        </div>

                        {/* Continue Button */}
                        <button
                            onClick={handleUserSelect}
                            disabled={!selectedUser || loading}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 shadow-lg hover:bg-white/25 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 ease-out text-gray-700 font-medium text-sm"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-gray-700/30 border-t-gray-700 rounded-full animate-spin" />
                                    Loading...
                                </>
                            ) : (
                                <>
                                    Continue to Dashboard
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>

                    {/* Toast Notification */}
                    {toast && (
                        <div
                            className={`mt-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl transition-all duration-500 ease-out transform-gpu ${toast.visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-8 h-8 rounded-full bg-white/20 flex items-center justify-center transition-all duration-300 ease-out ${toast.showIcon ? "scale-100 rotate-0" : "scale-0 rotate-180"
                                        }`}
                                >
                                    <Check
                                        className={`w-4 h-4 text-gray-700 transition-all duration-200 delay-100 ${toast.showIcon ? "opacity-100 scale-100" : "opacity-0 scale-50"
                                            }`}
                                    />
                                </div>
                                <span
                                    className={`text-gray-700 font-medium text-sm transition-all duration-300 delay-75 ${toast.visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
                                        }`}
                                >
                                    {toast.message}
                                </span>
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 rounded-b-2xl overflow-hidden">
                                <div
                                    className="h-full bg-white/30"
                                    style={{
                                        width: toast.visible ? '0%' : '100%',
                                        transition: 'width 2.5s linear',
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserSelection;