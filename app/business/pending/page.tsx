"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { toast } from "sonner";

export default function BusinessPendingPage() {
    const router = useRouter();

    useEffect(() => {
        // Function to check status
        const checkStatus = async () => {
            try {
                const response = await userService.getMe();
                if (response.success && response.data) {
                    const user = response.data;
                    const business = user.business || {};
                    const newStatus = business.businessStatus;
                    
                    const localInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
                    
                    if (localInfo.businessStatus !== newStatus) {
                        // Status has changed! Update localStorage
                        const updatedUserInfo = {
                            ...localInfo,
                            businessStatus: newStatus,
                            subscribe: user.subscribe
                        };
                        localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));

                        if (newStatus === "approved") {
                            toast.success("Your business has been approved!");
                            router.push("/business");
                        } else if (newStatus === "rejected") {
                            toast.error("Your business application was rejected. Please review.");
                            router.push("/business/profile");
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to check status:", error);
            }
        };

        // Check immediately on mount
        checkStatus();

        // Then poll every 10 seconds
        const intervalId = setInterval(checkStatus, 10000);

        return () => clearInterval(intervalId);
    }, [router]);

    const handleLogout = () => {
        authService.logout();
        router.push("/auth");
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center p-4 client-ui">
            <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center space-y-6">
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center relative">
                        <Clock className="w-10 h-10 text-yellow-600" />
                    </div>
                </div>
                <div className="space-y-4">
                    <h1 className="text-2xl font-black text-gray-900">Under Review</h1>
                    <p className="text-sm font-medium text-gray-500 leading-relaxed">
                        Your profile and subscription have been successfully submitted! Our administrative team is currently reviewing your application.
                    </p>
                    <p className="text-xs font-bold text-yellow-600 bg-yellow-50 p-3 rounded-xl border border-yellow-100 flex items-center justify-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Checking for approval automatically...
                    </p>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                    <Button 
                        onClick={handleLogout}
                        variant="ghost"
                        className="w-full text-gray-500 hover:text-gray-900 font-bold flex items-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Log out for now
                    </Button>
                </div>
            </div>
        </div>
    );
}
