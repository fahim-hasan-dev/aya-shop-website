"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { authService } from "@/services/authService";

export default function BusinessLoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await authService.login(formData, 'business');
            if (response.success) {
                toast.success(response.message || "Login successful!");
                const userInfo = response.data?.userInfo || JSON.parse(localStorage.getItem('userInfo') || '{}');
                const status = userInfo?.businessStatus;
                const subscribe = userInfo?.subscribe;
                
                if (!status) {
                    toast.info("Please set up your business profile information.");
                    router.push("/business/profile");
                } else if (!subscribe) {
                    toast.info("Please subscribe to a plan to continue.");
                    router.push("/business/subscription");
                } else if (status === "pending") {
                    toast.info("Your account is pending admin approval.");
                    // router.push("/business/pending-approval"); // or wherever the pending screen is
                    router.push("/business/profile"); // fallback for now
                } else {
                    router.push("/business");
                }
            } else {
                toast.error(response.message || "Login failed");
            }
        } catch (error: any) {
            toast.error(error.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-[450px] space-y-12">
                <div className="flex items-center">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6 text-gray-900" />
                    </button>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Business Login</h1>
                    <p className="text-gray-500 font-medium text-lg">Welcome back to AYA Shop</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="h-14 rounded-xl border-gray-100 bg-gray-50 focus:bg-white transition-all"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
                            <Link href="/business/forgot" className="text-[12px] font-bold text-[#0A5C36] hover:underline">
                                Forgot Password?
                            </Link>
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="h-14 rounded-xl border-gray-100 bg-gray-50 focus:bg-white transition-all pr-12"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6 pt-4">
                        <Button
                            type="submit"
                            className="w-full h-16 rounded-2xl bg-[#0A5C36] hover:bg-[#0d7344] text-white text-xl font-bold transition-all active:scale-[0.97] shadow-xl shadow-green-900/10"
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing in..." : "Sign In"}
                        </Button>

                        <p className="text-center text-gray-500 font-medium">
                            Don&apos;t have an account? <Link href="/business/signup" className="text-[#0A5C36] font-bold hover:underline">Sign Up</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
