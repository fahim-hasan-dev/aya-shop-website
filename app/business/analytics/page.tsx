"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Home,
    Bell,
    UserCircle,
    TrendingUp,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { metaService } from "@/services/metaService";
import { notificationService } from "@/services/notificationService";

export default function BusinessAnalyticsPage() {
    const router = useRouter();
    const [unreadNotifCount, setUnreadNotifCount] = useState(0);
    const [analytics, setAnalytics] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const [notifRes, analyticsRes] = await Promise.all([
                    notificationService.getUnreadCount().catch(() => ({ success: false, data: { unreadCount: 0 } })),
                    metaService.getProviderAnalytics().catch(() => ({ success: false, data: null }))
                ]);

                if (notifRes.success) {
                    setUnreadNotifCount(notifRes.data?.unreadCount || 0);
                }
                if (analyticsRes.success) {
                    setAnalytics(analyticsRes.data);
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    // Derived states
    const weeklyStats = analytics?.last7Days || [];
    const maxViews = Math.max(...weeklyStats.map((s: any) => s.views), 1);
    const maxBookings = Math.max(...weeklyStats.map((s: any) => s.bookings), 1);

    const packages = analytics?.packagePerformance || [];
    const conversionRate = analytics?.conversionRate || 0;

    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50 pb-24 client-ui">
            {/* Header */}
            <div className="bg-[#0A4D2E] text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <Home className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold leading-tight">Business Hub</h1>
                        <p className="text-xs text-white/70">Manage your business</p>
                    </div>
                </div>
                <div className="flex items-center gap-5">
                    <Link href="/business/notifications" className="relative">
                        <Bell className="w-6 h-6" />
                        {unreadNotifCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0A4D2E]" />
                        )}
                    </Link>
                    <Link href="/business/profile" className="flex flex-col items-center gap-0.5">
                        <UserCircle className="w-6 h-6" />
                        <span className="text-[10px]">Profile</span>
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto w-full px-5 py-6 md:py-10 space-y-8 md:space-y-12">
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Performance Analytics</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Last 7 Days Chart */}
                    <div className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm space-y-8">
                        <h3 className="text-xl font-black text-gray-900">Last 7 Days Activity</h3>
                        <div className="space-y-6">
                            {weeklyStats.map((stat: any) => (
                                <div key={stat.date} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-black text-gray-400 uppercase tracking-widest">{stat.date}</span>
                                        <span className="text-xs font-bold text-[#0A4D2E] bg-green-50 px-3 py-1 rounded-lg">
                                            {stat.views} views • {stat.bookings} bookings
                                        </span>
                                    </div>
                                    <div className="flex gap-1 h-3 relative">
                                        <div
                                            className="h-full bg-green-100 rounded-full"
                                            style={{ width: `${maxViews > 0 ? (stat.views / maxViews) * 100 : 0}%` }}
                                        />
                                        <div
                                            className="h-full bg-[#0A4D2E] rounded-full absolute left-0"
                                            style={{ width: `${maxBookings > 0 ? (stat.bookings / maxBookings) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Conversion Rate Card */}
                        <div className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-sm text-center space-y-6 flex flex-col justify-center">
                            <h3 className="text-lg font-black text-gray-400 uppercase tracking-widest">Global Conversion Rate</h3>
                            <div className="space-y-2">
                                <p className="text-6xl font-black text-[#0A4D2E]">{conversionRate}%</p>
                                <p className="text-sm font-bold text-gray-400">Visitor-to-Customer conversion</p>
                            </div>
                            <div className="h-4 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100 p-1">
                                <div className="h-full bg-[#0A4D2E] rounded-full shadow-lg shadow-green-900/20" style={{ width: `${conversionRate > 100 ? 100 : conversionRate}%` }} />
                            </div>
                        </div>

                        {/* Package Performance */}
                        <div className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-gray-900">Top Packages</h3>
                                <TrendingUp className="w-6 h-6 text-[#0A4D2E]" />
                            </div>
                            <div className="space-y-4">
                                {packages.length > 0 ? packages.map((pkg: any, index: number) => (
                                    <div key={index} className="flex items-center gap-5 p-5 rounded-[28px] bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-100 transition-all">
                                        <div className="w-12 h-12 rounded-2xl bg-[#0A4D2E] flex items-center justify-center text-white text-lg font-black shadow-lg shadow-green-900/10 shrink-0">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-gray-900 truncate text-base">{pkg.name}</p>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{pkg.bookings} successful bookings</p>
                                        </div>
                                        <div className="text-lg font-black text-[#0A4D2E] bg-white px-4 py-2 rounded-xl shadow-sm">
                                            ${pkg.revenue}
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-center text-gray-400 font-bold py-4">No package data available</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}


