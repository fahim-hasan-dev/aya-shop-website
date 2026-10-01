"use client";

import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentCancelPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center p-4 client-ui">
            <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center space-y-6">
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                        <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-black text-gray-900">Payment Cancelled</h1>
                    <p className="text-sm font-medium text-gray-500">
                        Your payment was cancelled and you haven't been charged. You can try again whenever you're ready.
                    </p>
                </div>
                <Button 
                    onClick={() => router.push("/business/subscription")}
                    className="w-full h-12 bg-gray-900 hover:bg-black text-white rounded-xl font-bold"
                >
                    Try Again
                </Button>
            </div>
        </div>
    );
}
