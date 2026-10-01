"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  Search, 
  Grid, 
  MessageSquare, 
  User, 
  Calendar, 
  Bell, 
  LogOut, 
  Sparkles, 
  ChevronRight,
  Menu,
  X,
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const authed = authService.isAuthenticated();
        setIsLoggedIn(authed);
        if (authed) {
            try {
                const info = localStorage.getItem("userInfo");
                if (info) setUser(JSON.parse(info));
            } catch (e) {
                console.error(e);
            }
        }
    }, [pathname]);

    const handleLogout = () => {
        authService.logout();
    };

    const navLinks = [
        { label: "Home", href: "/home" },
        { label: "Explore Services", href: "/listings" },
        { label: "Bookings", href: "/bookings" },
    ];

    const mobileNavItems = [
        { icon: Home, label: "Home", href: "/home" },
        { icon: Grid, label: "Services", href: "/listings" },
        { icon: Calendar, label: "Bookings", href: "/bookings" },
        { icon: User, label: "Profile", href: "/profile" },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans antialiased text-slate-800">
            {/* Top Navbar Header */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
                    {/* Brand Logo */}
                    <Link href="/home" className="flex items-center gap-3 group">
                        <div className="w-11 h-11 bg-gradient-to-tr from-[#064E3B] to-[#0A5C36] rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/20 group-hover:scale-105 transition-transform">
                            <Sparkles className="w-6 h-6 text-emerald-300" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tight text-slate-900 leading-none group-hover:text-[#0A5C36] transition-colors">
                                AYA <span className="text-[#0A5C36]">Shop</span>
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800/60 mt-0.5">
                                Verified Services
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                                        isActive
                                            ? "bg-white text-[#0A5C36] shadow-sm"
                                            : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Desktop Auth / User Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        {isLoggedIn ? (
                            <div className="flex items-center gap-3">
                                <Link href="/messages" className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-600 hover:text-[#0A5C36] hover:bg-emerald-50/50 transition-all group relative">
                                    <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 rounded-full" />
                                </Link>
                                <Link href="/bookings" className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-600 hover:text-[#0A5C36] hover:bg-emerald-50/50 transition-all group">
                                    <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </Link>
                                <Link href="/notifications" className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-600 hover:text-[#0A5C36] hover:bg-emerald-50/50 transition-all group">
                                    <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </Link>
                                
                                <div className="h-8 w-[1px] bg-slate-200 mx-1" />

                                <Link href="/profile" className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl hover:bg-slate-100/80 border border-transparent hover:border-slate-200 transition-all group">
                                    <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center text-[#0A5C36] font-extrabold text-sm border border-emerald-200">
                                        {user?.fullName ? user.fullName[0].toUpperCase() : <User className="w-5 h-5" />}
                                    </div>
                                    <span className="text-sm font-bold text-slate-800 group-hover:text-[#0A5C36] max-w-[120px] truncate">
                                        {user?.fullName || "Account"}
                                    </span>
                                </Link>

                                {user?.role === "business" && (
                                    <Link href="/business">
                                        <Button className="h-10 px-5 rounded-xl bg-[#0A5C36] hover:bg-[#064E3B] text-white font-bold text-xs shadow-md shadow-emerald-900/20 active:scale-95 transition-all flex items-center gap-2">
                                            <Sparkles className="w-4 h-4" />
                                            Dashboard
                                        </Button>
                                    </Link>
                                )}

                                <button
                                    onClick={handleLogout}
                                    title="Log Out"
                                    className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link href="/client/login">
                                    <Button variant="ghost" className="h-11 px-5 rounded-2xl font-bold text-slate-700 hover:text-[#0A5C36] hover:bg-emerald-50/60 cursor-pointer">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/auth">
                                    <Button className="h-11 px-6 rounded-2xl bg-[#0A5C36] hover:bg-[#064E3B] text-white font-bold shadow-lg shadow-emerald-900/20 active:scale-95 transition-all cursor-pointer">
                                        Get Started
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Hamburger Toggle */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-3 bg-slate-100 text-slate-700 rounded-2xl focus:outline-none"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Drawer Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-b border-slate-100 px-6 py-6 space-y-4 animate-in slide-in-from-top duration-300">
                        <div className="flex flex-col gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`px-4 py-3 rounded-xl font-bold text-base ${
                                        pathname === link.href
                                            ? "bg-[#0A5C36] text-white"
                                            : "text-slate-700 hover:bg-slate-50"
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                        <div className="pt-4 border-t border-slate-100">
                            {isLoggedIn ? (
                                <div className="space-y-2">
                                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl font-bold text-slate-700 hover:bg-slate-50">
                                        <User className="w-5 h-5 text-[#0A5C36]" /> My Profile
                                    </Link>
                                    <Link href="/bookings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl font-bold text-slate-700 hover:bg-slate-50">
                                        <Calendar className="w-5 h-5 text-[#0A5C36]" /> Bookings
                                    </Link>
                                    
                                    {user?.role === "business" && (
                                        <Link href="/business" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl font-bold text-[#0A5C36] bg-emerald-50 hover:bg-emerald-100">
                                            <Sparkles className="w-5 h-5" /> Dashboard
                                        </Link>
                                    )}

                                    <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-xl font-bold text-red-600 hover:bg-red-50">
                                        <LogOut className="w-5 h-5" /> Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <Link href="/client/login" onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="outline" className="w-full h-12 rounded-xl font-bold border-slate-200">
                                            Sign In
                                        </Button>
                                    </Link>
                                    <Link href="/client/signup" onClick={() => setMobileMenuOpen(false)}>
                                        <Button className="w-full h-12 rounded-xl bg-[#0A5C36] text-white font-bold">
                                            Register
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-28 md:pb-16">
                {children}
            </main>

            {/* Bottom Mobile Floating Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 px-6 py-3 flex justify-around items-center z-50 md:hidden shadow-lg">
                {mobileNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 transition-all ${
                                isActive ? "text-[#0A5C36] scale-105" : "text-slate-400"
                            }`}
                        >
                            <Icon className="w-6 h-6" />
                            <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Rich Global Footer */}
            <footer className="bg-slate-900 text-slate-300 pt-16 pb-24 md:pb-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
                        {/* Brand Column */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#0A5C36] rounded-2xl flex items-center justify-center text-white font-black text-xl">
                                    A
                                </div>
                                <span className="text-2xl font-black text-white tracking-tight">AYA Shop</span>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed max-w-sm font-medium">
                                Connecting homeowners and businesses with background-checked, verified local service professionals instantly.
                            </p>
                            <div className="space-y-3 text-xs text-slate-400 font-bold">
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-4 h-4 text-emerald-400" /> Barcelona, Spain
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-emerald-400" /> +34 900 123 456
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-emerald-400" /> support@ayashop.com
                                </div>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-black text-white uppercase tracking-wider">Explore</h4>
                            <ul className="space-y-2.5 text-sm font-medium text-slate-400">
                                <li><Link href="/home" className="hover:text-emerald-400 transition-colors">Home Page</Link></li>
                                <li><Link href="/listings" className="hover:text-emerald-400 transition-colors">All Service Listings</Link></li>
                                <li><Link href="/search" className="hover:text-emerald-400 transition-colors">Search & Filter</Link></li>
                                <li><Link href="/client/login" className="hover:text-emerald-400 transition-colors">Client Portal</Link></li>
                            </ul>
                        </div>

                        {/* Popular Categories */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-black text-white uppercase tracking-wider">Services</h4>
                            <ul className="space-y-2.5 text-sm font-medium text-slate-400">
                                <li><Link href="/listings" className="hover:text-emerald-400 transition-colors">Business Services</Link></li>
                                <li><Link href="/listings" className="hover:text-emerald-400 transition-colors">Home Cleaning</Link></li>
                                <li><Link href="/listings" className="hover:text-emerald-400 transition-colors">Plumbing & Repairs</Link></li>
                                <li><Link href="/listings" className="hover:text-emerald-400 transition-colors">Beauty & Wellness</Link></li>
                            </ul>
                        </div>

                        {/* For Providers */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-black text-white uppercase tracking-wider">For Businesses</h4>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                Are you a service provider? List your business today to reach thousands of new customers.
                            </p>
                            <Link href="/auth" className="inline-block">
                                <Button className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30">
                                    Become a Provider
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-800/80 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-500">
                        <p>© {new Date().getFullYear()} AYA Shop Services. All rights reserved.</p>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-slate-300 transition-colors">Cookie Settings</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

