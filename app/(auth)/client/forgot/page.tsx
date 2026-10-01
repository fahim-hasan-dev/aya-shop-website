"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { authService } from "@/services/authService";

export default function ClientForgotPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setIsLoading(true);
        try {
            const response = await authService.forgetPassword({ email: email.trim() });
            if (response.success) {
                toast.success(response.message || "OTP code sent to your email!");
                router.push(`/otp?email=${encodeURIComponent(email.trim())}&purpose=resetPassword`);
            } else {
                toast.error(response.message || "Failed to send reset code.");
            }
        } catch (error: any) {
            console.error("Forgot Password error:", error);
            toast.error(error.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-[450px] space-y-8">
                <div className="flex items-center">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                        type="button"
                    >
                        <ChevronLeft className="w-6 h-6 text-gray-900" />
                    </button>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Forgot Password</h1>
                    <p className="text-gray-500 font-medium text-lg">Password Recovery</p>
                    <p className="text-sm text-gray-400">Enter your registered email address to receive password reset OTP instructions.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-14 rounded-xl border-gray-100 bg-gray-50 focus:bg-white transition-all"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-6 pt-2">
                        <Button
                            type="submit"
                            className="w-full h-16 rounded-2xl bg-[#0A5C36] hover:bg-[#0d7344] text-white text-xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.97] shadow-xl shadow-green-900/10 cursor-pointer"
                            disabled={isLoading}
                        >
                            {isLoading ? "Sending OTP..." : "Send Verification OTP"}
                            <Send className="w-5 h-5" />
                        </Button>

                        <p className="text-center text-gray-500 font-medium">
                            Remember your password? <Link href="/client/login" className="text-[#0A5C36] font-bold hover:underline">Sign In</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
