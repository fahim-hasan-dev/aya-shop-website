"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle } from "lucide-react";
import { userService } from "@/services/userService";
import { toast } from "sonner";

import { Suspense } from "react";

function PaymentSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const [status, setStatus] = useState("Processing your payment...");

    useEffect(() => {
        const updateAndRedirect = async () => {
            try {
                // Fetch the latest user info from the database
                const response = await userService.getMe();
                if (response.success && response.data) {
                    const user = response.data;
                    const business = user.business || {};
                    
                    // Update localStorage with fresh data (subscription status)
                    const localInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
                    const updatedUserInfo = {
                        ...localInfo,
                        subscribe: user.subscribe,
                        businessStatus: business.businessStatus || localInfo.businessStatus || "pending"
                    };
                    localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));

                    setStatus("Payment successful! Redirecting...");
                    
                    // Small delay for UX
                    setTimeout(() => {
                        router.push("/business");
                    }, 2000);
                }
            } catch (error) {
                toast.error("Failed to sync your account status. Please log in again.");
                router.push("/business");
            }
        };

        if (sessionId) {
            // Give the Stripe Webhook a tiny bit of time to update the DB before we fetch
            setTimeout(() => {
                updateAndRedirect();
            }, 2000);
        } else {
            router.push("/business");
        }
    }, [sessionId, router]);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center p-4 client-ui">
            <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center space-y-6">
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center relative">
                        <CheckCircle className="w-10 h-10 text-[#0A4D2E]" />
                        <div className="absolute inset-0 border-4 border-green-500/20 rounded-full animate-ping" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-black text-gray-900">Payment Successful</h1>
                    <p className="text-sm font-medium text-gray-500">{status}</p>
                </div>
                <div className="flex justify-center pt-4">
                    <Loader2 className="w-6 h-6 animate-spin text-[#0A4D2E]" />
                </div>
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center p-4">
                <Loader2 className="w-8 h-8 animate-spin text-[#0A4D2E]" />
            </div>
        }>
            <PaymentSuccessContent />
        </Suspense>
    );
}
