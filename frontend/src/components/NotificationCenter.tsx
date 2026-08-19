import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, RefreshCw, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface NotificationItem {
    id: string;
    type: 'reassessment' | 'batch_complete' | 'feedback_ready' | 'system_error' | 'info';
    title: string;
    message: string;
    link?: string;
    is_read: number;
    created_at: string;
}

export const NotificationCenter: React.FC = () => {
    const { token } = useAuth();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const [listRes, countRes] = await Promise.all([
                axios.get('/api/notifications', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/notifications/unread-count', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setNotifications(listRes.data.notifications || []);
            setUnreadCount(countRes.data.unreadCount || 0);
        } catch (err) {
            console.error("Failed to load notifications:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 15 seconds
        const interval = setInterval(fetchNotifications, 15000);
        return () => clearInterval(interval);
    }, [token]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await axios.put(`/api/notifications/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to mark notification read:", err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put('/api/notifications/read-all', {}, { headers: { Authorization: `Bearer ${token}` } });
            setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to mark all read:", err);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'batch_complete': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
            case 'reassessment': return <AlertCircle className="w-5 h-5 text-amber-500" />;
            case 'system_error': return <AlertCircle className="w-5 h-5 text-rose-500" />;
            case 'feedback_ready': return <CheckCircle className="w-5 h-5 text-indigo-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon Trigger */}
            <button
                onClick={() => { setIsOpen(!isOpen); if (!isOpen) fetchNotifications(); }}
                className="relative p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
                title="Notifications"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-rose-600 rounded-full animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in duration-200">
                    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-900 to-indigo-800 text-white">
                        <div className="flex items-center space-x-2">
                            <Bell className="w-5 h-5" />
                            <h3 className="font-semibold text-sm">Notification Center</h3>
                            {unreadCount > 0 && (
                                <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                    {unreadCount} New
                                </span>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={fetchNotifications}
                                className="text-indigo-200 hover:text-white transition-colors"
                                title="Refresh"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-indigo-200 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {unreadCount > 0 && (
                        <div className="px-4 py-1.5 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center text-xs">
                            <span className="text-indigo-700 font-medium">Unread updates waiting</span>
                            <button
                                onClick={markAllAsRead}
                                className="text-indigo-600 hover:text-indigo-900 font-bold underline"
                            >
                                Mark all as read
                            </button>
                        </div>
                    )}

                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                        {notifications.length === 0 ? (
                            <div className="py-8 text-center text-gray-500 text-sm">
                                <Bell className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                                No notifications yet.
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    onClick={() => {
                                        if (!n.is_read) markAsRead(n.id);
                                        if (n.link) window.location.href = n.link;
                                    }}
                                    className={`p-3.5 flex items-start space-x-3 cursor-pointer transition-colors ${
                                        n.is_read ? 'bg-white hover:bg-gray-50' : 'bg-indigo-50/40 hover:bg-indigo-50/80 font-medium'
                                    }`}
                                >
                                    <div className="mt-0.5 flex-shrink-0">{getIcon(n.type)}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline">
                                            <p className={`text-xs font-semibold ${n.is_read ? 'text-gray-800' : 'text-indigo-900'}`}>
                                                {n.title}
                                            </p>
                                            <span className="text-[10px] text-gray-400">
                                                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{n.message}</p>
                                    </div>
                                    {!n.is_read && (
                                        <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
