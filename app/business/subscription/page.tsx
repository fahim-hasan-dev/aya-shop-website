"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { planService, PlanData } from "@/services/planService";
import { toast } from "sonner";

export default function SubscriptionPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [plans, setPlans] = useState<PlanData[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<PlanData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await planService.getPlans();
                if (response.success && response.data) {
                    setPlans(response.data.plans || []);
                }
            } catch (error: any) {
                toast.error(error.message || "Failed to load subscription plans.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const handlePlanSelect = (plan: PlanData) => {
        setSelectedPlan(plan);
        setStep(2);
    };

    const handleCheckout = async () => {
        if (!selectedPlan?._id) return;
        setIsCheckoutLoading(true);
        try {
            const response = await planService.createCheckoutSession(selectedPlan._id);
            if (response && response.url) {
                window.location.href = response.url;
            } else {
                toast.error("Failed to initiate checkout session.");
                setIsCheckoutLoading(false);
            }
        } catch (error: any) {
            toast.error(error.message || "An error occurred during checkout.");
            setIsCheckoutLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-50/50 client-ui items-center justify-center p-4">
                <Loader2 className="w-10 h-10 animate-spin text-[#0A4D2E]" />
                <p className="mt-4 font-bold text-sm text-[#0A4D2E] tracking-wide">Loading Plans...</p>
            </div>
        );
    }

    if (step === 1) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-50/50 client-ui">
                {/* Header Navbar */}
                <header className="px-4 py-4 md:px-8 md:py-6 flex items-center bg-transparent relative z-10">
                    <button 
                        onClick={() => router.push("/business")} 
                        className="p-2 hover:bg-gray-200/50 rounded-xl transition-all text-gray-700 flex items-center gap-2"
                    >
                        <ChevronLeft className="w-6 h-6" />
                        <span className="text-sm font-bold hidden sm:inline">Back</span>
                    </button>
                </header>

                {/* Main Content */}
                <div className="flex-1 px-4 py-8 md:py-12 flex flex-col justify-center">
                    <div className="max-w-6xl mx-auto w-full space-y-12 md:space-y-16">
                        {/* Title Section */}
                        <div className="text-center max-w-2xl mx-auto space-y-4">
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Choose Your Plan</h2>
                            <p className="text-lg text-gray-500 font-medium leading-relaxed px-4">
                                Simple, transparent pricing. Showcase your services, reach more customers, and grow your revenue.
                            </p>
                        </div>

                        {/* Plans Grid */}
                        {plans.length === 0 ? (
                            <div className="text-center text-gray-500 font-medium py-16 bg-white rounded-3xl border border-gray-200/60 shadow-sm max-w-2xl mx-auto">
                                No active plans available at the moment.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto items-center justify-center">
                                {plans.map((plan) => (
                                    <div 
                                        key={plan._id} 
                                        className="bg-white rounded-[24px] border border-gray-200 p-8 md:p-10 shadow-sm hover:shadow-xl hover:border-[#0A4D2E]/50 transition-all duration-300 flex flex-col relative group h-full"
                                    >
                                        <div className="space-y-3 mb-8">
                                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#0A4D2E] transition-colors">{plan.title}</h3>
                                            <p className="text-sm text-gray-500 min-h-[40px] leading-relaxed">{plan.description}</p>
                                            <div className="flex items-baseline gap-1 mt-6">
                                                <span className="text-5xl font-black text-gray-900">${plan.price}</span>
                                                <span className="text-sm font-semibold text-gray-400">/{plan.duration}</span>
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">What's included</p>
                                            <ul className="space-y-4">
                                                {plan.features?.map((feature, index) => (
                                                    <li key={index} className="flex items-start gap-3">
                                                        <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
                                                            <Check className="w-3.5 h-3.5 text-[#0A4D2E]" />
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-700 leading-tight">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <Button
                                            onClick={() => handlePlanSelect(plan)}
                                            className="w-full h-12 rounded-xl text-base font-bold transition-all mt-8 bg-gray-50 text-gray-900 hover:bg-[#0A4D2E] hover:text-white border border-gray-200 hover:border-transparent group-hover:bg-[#0A4D2E] group-hover:text-white group-hover:shadow-md group-hover:shadow-[#0A4D2E]/20"
                                        >
                                            Choose Plan
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Step 2: Confirmation
    if (!selectedPlan) return null;

    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50 client-ui">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 md:px-8 h-20 flex items-center gap-4 shadow-sm">
                <button
                    onClick={() => setStep(1)}
                    className="p-2.5 hover:bg-gray-50 rounded-xl transition-colors text-gray-700 flex items-center gap-2 font-semibold text-sm"
                >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="hidden sm:inline">Back to Plans</span>
                </button>
                <h1 className="text-xl font-bold text-gray-900 absolute left-1/2 -translate-x-1/2">
                    Payment Details
                </h1>
            </header>

            <div className="max-w-3xl mx-auto w-full p-4 sm:p-6 md:p-8 pb-24 space-y-8">
                {/* Selection Summary */}
                <div className="bg-gradient-to-br from-[#0A4D2E] to-[#0d7344] rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden text-white">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-2">
                            <h2 className="text-sm font-bold text-white/70 uppercase tracking-widest">Selected Plan</h2>
                            <h3 className="text-3xl font-extrabold">{selectedPlan.title}</h3>
                            <p className="text-white/80 font-medium max-w-md">{selectedPlan.description}</p>
                        </div>
                        <div className="text-left md:text-right">
                            <div className="text-5xl font-black">${selectedPlan.price}</div>
                            <p className="text-sm font-bold text-white/70 mt-1 uppercase tracking-wider">Per {selectedPlan.duration}</p>
                        </div>
                    </div>
                </div>

                {/* Plan Details Info */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Secure Checkout</h3>
                            <p className="text-xs font-medium text-gray-500">Your payment is processed securely via Stripe.</p>
                        </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-center py-3 border-b border-gray-50">
                            <span className="text-sm font-semibold text-gray-500">Billing Cycle</span>
                            <span className="text-base font-bold text-gray-900 capitalize">{selectedPlan.paymentType}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-50">
                            <span className="text-sm font-semibold text-gray-500">Total Amount</span>
                            <span className="text-xl font-black text-[#0A4D2E]">${selectedPlan.price}</span>
                        </div>
                    </div>

                    <Button
                        onClick={handleCheckout}
                        disabled={isCheckoutLoading}
                        className="w-full h-14 bg-[#0A4D2E] hover:bg-[#083c24] text-white rounded-2xl text-lg font-bold shadow-lg shadow-green-900/20 transition-all flex items-center justify-center gap-2"
                    >
                        {isCheckoutLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Initiating Secure Checkout...</span>
                            </>
                        ) : (
                            <>
                                <span>Proceed to Payment</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
