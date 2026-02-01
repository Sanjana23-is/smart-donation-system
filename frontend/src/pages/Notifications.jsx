import React, { useEffect, useState } from "react";
import api from "../api";
import { Bell, CheckCircle, Clock, Info, Check, XCircle } from "lucide-react";

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    async function fetchNotifications() {
        try {
            // ✅ Fetch from new endpoint
            const res = await api.get("/notifications/my");
            setNotifications(res.data);
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        } finally {
            setLoading(false);
        }
    }

    async function markAsRead(id) {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications((prev) =>
                prev.map((n) => (n.notificationId === id ? { ...n, isRead: 1 } : n))
            );
        } catch (err) {
            console.error("Failed to mark as read:", err);
        }
    }

    function getIcon(type) {
        if (type === "approved") return <Check className="w-5 h-5 text-green-600" />;
        if (type === "rejected") return <XCircle className="w-5 h-5 text-red-600" />;
        return <Info className="w-5 h-5 text-blue-600" />;
    }

    function getBorderColor(type) {
        if (type === "approved") return "border-green-200 bg-green-50";
        if (type === "rejected") return "border-red-200 bg-red-50";
        return "border-blue-100 bg-white";
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="flex items-center gap-3 mb-8">
                <Bell className="w-8 h-8 text-blue-600" />
                <h2 className="text-3xl font-bold text-gray-800">My Notifications</h2>
            </div>

            {loading ? (
                <p className="text-gray-500">Loading notifications...</p>
            ) : notifications.length === 0 ? (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                    <p className="text-gray-500 text-lg">You have no notifications yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((n) => {
                        const isRead = n.isRead === 1 || n.isRead === true;
                        return (
                            <div
                                key={n.notificationId}
                                className={`p-6 rounded-xl border transition-all duration-300 ${isRead
                                        ? "bg-gray-50 border-gray-200 opacity-75"
                                        : `${getBorderColor(n.type)} shadow-md transform hover:-translate-y-1`
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-4">
                                        <div className={`mt-1 p-2 rounded-full bg-white shadow-sm`}>
                                            {getIcon(n.type)}
                                        </div>
                                        <div>
                                            <h3
                                                className={`text-lg font-semibold mb-1 ${isRead ? "text-gray-700" : "text-gray-900"
                                                    }`}
                                            >
                                                {n.title}
                                            </h3>
                                            <p className="text-gray-600 leading-relaxed">{n.message}</p>

                                            <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                                                <Clock className="w-3 h-3" />
                                                <span>{new Date(n.createdAt).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {!isRead && (
                                        <button
                                            onClick={() => markAsRead(n.notificationId)}
                                            className="ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                            title="Mark as read"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
}
