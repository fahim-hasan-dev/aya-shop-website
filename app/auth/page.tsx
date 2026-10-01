"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Briefcase,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck
} from "lucide-react";

export default function AuthChoicePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-12">
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column - Branding */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-[#064E3B] to-[#0A5C36] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <Link href="/home" className="inline-flex items-center gap-3 group">
              <div className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                <Sparkles className="w-6 h-6 text-amber-300" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                AYA <span className="text-emerald-300">Shop</span>
              </span>
            </Link>

            <div className="space-y-2 pt-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
                Account Type
              </span>
              <h2 className="text-3xl font-black leading-tight tracking-tight">
                Select Your Role
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
                Choose how you want to join AYA Shop today to create your account.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-8">
            <Link
              href="/home"
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-200 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>

        {/* Right Column - Pure Role Selection Cards */}
        <div className="lg:col-span-7 p-6 sm:p-10 space-y-6 flex flex-col justify-center">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Create an Account
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              Click on your role to register as a Customer or Business Owner
            </p>
          </div>

          {/* Simple Role Cards */}
          <div className="space-y-4">
            {/* Client Role Card */}
            <button
              onClick={() => router.push("/client/signup")}
              className="w-full text-left p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-[#0A5C36] hover:bg-emerald-50/40 hover:shadow-lg transition-all duration-300 group cursor-pointer flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 text-[#0A5C36] border border-emerald-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0A5C36] transition-colors">
                    Client / Customer
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Book verified experts for home, cleaning & repairs
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-[#0A5C36] group-hover:text-white text-slate-400 flex items-center justify-center transition-all shrink-0">
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>

            {/* Business Role Card */}
            <button
              onClick={() => router.push("/business/signup")}
              className="w-full text-left p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-[#0A5C36] hover:bg-emerald-50/40 hover:shadow-lg transition-all duration-300 group cursor-pointer flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100/70 text-amber-800 border border-amber-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0A5C36] transition-colors">
                    Business Provider
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Register business, offer services & get bookings
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-[#0A5C36] group-hover:text-white text-slate-400 flex items-center justify-center transition-all shrink-0">
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          </div>

          {/* Common Sign In Link */}
          <div className="pt-4 border-t border-slate-100 text-center space-y-3">
            <p className="text-xs font-semibold text-slate-500">
              Already have an account?{" "}
              <Link href="/client/login" className="text-[#0A5C36] font-bold hover:underline">
                Sign In Here
              </Link>
            </p>

            <div>
              <button
                onClick={() => router.push("/login")}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Admin Management Portal</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
