"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { authService } from "@/services/authService";

function OTPVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const purpose = searchParams.get("purpose") || "createAccount";

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }

    setOtp(newOtp);
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      toast.error("Please enter all 6 digits of the OTP code");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.verifyAccount({
        email: email.trim(),
        oneTimeCode: otpCode,
      });

      if (response.success) {
        toast.success(response.message || "OTP verified successfully!");
        if (purpose === "resetPassword") {
          const token = response.data?.token || response.data?.accessToken || "";
          router.push(`/reset?token=${encodeURIComponent(token)}`);
        } else {
          const userInfo = response.data?.userInfo || JSON.parse(localStorage.getItem('userInfo') || '{}');
          const role = (localStorage.getItem("userRole") || userInfo?.role || "").toLowerCase();
          
          if (role === "business") {
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
                router.push("/business/profile");
            } else {
                router.push("/business");
            }
          } else {
            router.push("/home");
          }
        }
      } else {
        toast.error(response.message || "Invalid OTP code");
      }
    } catch (error: any) {
      console.error("OTP Verification error:", error);
      toast.error(error.message || "Invalid OTP code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("No email specified for resending code.");
      return;
    }

    setIsResending(true);

    try {
      const response = await authService.resendOtp({
        email: email.trim(),
        authType: purpose === "resetPassword" ? "resetPassword" : "createAccount",
      });

      if (response.success) {
        toast.success(response.message || "OTP code has been resent to your email!");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        toast.error(response.message || "Failed to resend OTP.");
      }
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      toast.error(error.message || "Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[480px] bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl space-y-8">
        {/* Top Navigation & Icon */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-[#0A5C36] hover:bg-emerald-50 transition-all cursor-pointer"
            type="button"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#0A5C36]">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            OTP Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            Enter the 6-digit verification code sent to{" "}
            <span className="font-bold text-slate-900 block sm:inline">{email || "your email"}</span>
          </p>
        </div>

        {/* OTP Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-11 h-13 sm:w-14 sm:h-14 text-center text-xl font-black rounded-xl border-2 border-slate-200/90 bg-slate-50 focus:border-[#0A5C36] focus:bg-white focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-200 text-slate-900 shadow-xs"
                disabled={isLoading}
                required
              />
            ))}
          </div>

          <div className="space-y-4">
            <Button
              type="submit"
              className="w-full h-13 rounded-xl bg-[#0A5C36] hover:bg-[#064E3B] text-white text-base font-bold transition-all shadow-md shadow-emerald-950/20 disabled:opacity-50 cursor-pointer"
              disabled={isLoading || otp.some(d => !d)}
            >
              {isLoading ? "Verifying Code..." : "Verify OTP Code"}
            </Button>

            <div className="text-center text-xs font-semibold text-slate-500 pt-1">
              Didn't receive code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="text-[#0A5C36] hover:underline font-bold disabled:opacity-50 cursor-pointer ml-1"
              >
                {isResending ? "Sending OTP..." : "Resend Code"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OTPVerifyPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500">Loading...</div>}>
      <OTPVerifyContent />
    </Suspense>
  );
}