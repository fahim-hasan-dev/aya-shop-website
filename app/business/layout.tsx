"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
    LayoutGrid,
    BarChart3,
    MessageSquare,
    PlusSquare,
    UserCircle,
    Home,
    LogOut,
    Settings
} from "lucide-react";
import { authService } from "@/services/authService";

export default function BusinessLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [userInfo, setUserInfo] = useState<any>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const infoStr = localStorage.getItem("userInfo");
        if (infoStr) {
            const parsedInfo = JSON.parse(infoStr);
            setUserInfo(parsedInfo);
            
            const status = parsedInfo.businessStatus;
            const subscribe = parsedInfo.subscribe;
            
            // Allowed routes for onboarding/pending providers
            const allowedPendingRoutes = ["/business/profile", "/business/subscription", "/business/pending"];
            
            if (status !== "approved") {
                if (!allowedPendingRoutes.some(route => pathname.startsWith(route))) {
                    if (!status) {
                        router.push("/business/profile");
                    } else if (!subscribe) {
                        router.push("/business/subscription");
                    } else {
                        // Pending or rejected approval fallback
                        router.push(status === "rejected" ? "/business/profile" : "/business/pending");
                    }
                } else {
                    // Logic to prevent staying on wrong pending route
                    if (pathname.startsWith("/business/profile") && status === "pending" && subscribe) {
                        // If they are pending and subscribed, force them to pending page so they don't sit on the onboarding form
                        router.push("/business/pending");
                    }
                    if (pathname.startsWith("/business/subscription") && subscribe) {
                        // If they are already subscribed, push them to the appropriate next step
                        router.push(status === "rejected" ? "/business/profile" : "/business/pending");
                    }
                }
            }
        }
    }, [pathname, router]);

    const handleLogout = () => {
        authService.logout();
        router.push("/auth");
    };

    const navItems = [
        { icon: LayoutGrid, label: "Overview", href: "/business" },
        { icon: PlusSquare, label: "Listing", href: "/business/listings" },
        { icon: BarChart3, label: "Analytics", href: "/business/analytics" },
        { icon: MessageSquare, label: "Message", href: "/business/messages" },
        { icon: Settings, label: "Settings", href: "/business/settings" },
    ];

    if (!isMounted) return null;

    const isApproved = userInfo?.businessStatus === 'approved';

    return (
        <div className="client-ui min-h-screen bg-gray-50 flex flex-col">
            {isApproved && (
                <nav className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[280px] bg-[#0A4D2E] text-white flex-col py-10 px-6 gap-10 z-50">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg border border-white/10 backdrop-blur-sm">
                            <Home className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <span className="text-xl font-black text-white tracking-tight leading-tight block">Business Hub</span>
                            <span className="text-[10px] font-bold text-white/60">Aya Services</span>
                        </div>
                    </div>

                    <div className="flex-1 space-y-2 mt-4">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[2px] px-4 mb-4">Main Menu</p>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || (item.href !== "/business" && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 font-bold ${isActive
                                        ? "bg-white text-[#0A4D2E] shadow-xl shadow-black/10"
                                        : "text-white/60 hover:bg-white/10 hover:text-white"
                                        }`}
                                >
                                    <Icon className="w-6 h-6" />
                                    <span className="text-lg">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="px-2 space-y-2">
                        <Link href="/business/profile" className="flex items-center gap-4 px-4 py-4 rounded-2xl text-white/60 hover:bg-white/10 hover:text-white transition-all font-bold">
                            <UserCircle className="w-6 h-6" />
                            <span className="text-lg">Profile</span>
                        </Link>
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-white/60 hover:bg-red-500/10 hover:text-red-400 transition-all font-bold text-left"
                        >
                            <LogOut className="w-6 h-6" />
                            <span className="text-lg">Log out</span>
                        </button>
                    </div>
                </nav>
            )}

            <main className={`flex-1 pb-20 lg:pb-0 ${isApproved ? 'lg:pl-[280px]' : ''}`}>
                <div className="w-full max-w-7xl mx-auto min-h-screen">
                    {children}
                </div>
            </main>

            {isApproved && (
                <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 lg:hidden shadow-2xl">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || (item.href !== "/business" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex flex-col items-center gap-1 transition-colors relative ${isActive ? "text-[#0A4D2E]" : "text-gray-400"}`}
                            >
                                {isActive && (
                                    <div className="w-1 bg-[#0A4D2E] h-1 rounded-full absolute -top-3" />
                                )}
                                <div className={`p-1.5 rounded-xl transition-all ${isActive ? "bg-[#0A4D2E]/10" : "hover:bg-gray-50"}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            )}
        </div>
    );
}

