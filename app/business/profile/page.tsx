"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    ChevronLeft,
    Mail,
    Phone,
    Globe,
    MapPin,
    User,
    Building2,
    Camera,
    Check,
    Loader2,
    Briefcase,
    Calendar,
    LogOut,
    Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { userService } from "@/services/userService";
import { authService } from "@/services/authService";
import { toast } from "sonner";

export default function BusinessProfilePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [userData, setUserData] = useState<any>(null);
    const [formValues, setFormValues] = useState({
        fullName: "",
        phone: "",
        businessName: "",
        yearsInBusiness: "",
        description: "",
        website: "",
        address: "",
        city: "",
        state: "",
        zipCode: ""
    });

    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "";

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await userService.getMe();
            if (response.success && response.data) {
                const user = response.data;
                const business = user.business || {};
                setUserData(user);
                setFormValues({
                    fullName: user.fullName || "",
                    phone: user.phone || "",
                    businessName: business.businessName || "",
                    yearsInBusiness: business.yearsInBusiness ? String(business.yearsInBusiness) : "",
                    description: business.description || "",
                    website: business.website || "",
                    address: business.address || "",
                    city: business.city || "",
                    state: business.state || "",
                    zipCode: business.zipCode || ""
                });
            }
        } catch (error: any) {
            toast.error(error?.message || "Failed to load profile data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedLogo(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formValues.fullName.trim()) {
            toast.error("Full name is required");
            return;
        }
        if (!formValues.businessName.trim()) {
            toast.error("Business name is required");
            return;
        }

        setIsSaving(true);
        try {
            // 1. Update User Profile (fullName, phone, image)
            const userFormData = new FormData();
            userFormData.append("fullName", formValues.fullName);
            if (formValues.phone) {
                userFormData.append("phone", formValues.phone);
            }
            if (selectedImage) {
                userFormData.append("image", selectedImage);
            }

            // 2. Update Business Profile (data, logo)
            const businessFormData = new FormData();
            const businessData = {
                businessName: formValues.businessName,
                description: formValues.description,
                yearsInBusiness: formValues.yearsInBusiness ? Number(formValues.yearsInBusiness) : undefined,
                address: formValues.address,
                city: formValues.city,
                state: formValues.state,
                zipCode: formValues.zipCode,
                website: formValues.website
            };
            businessFormData.append("data", JSON.stringify(businessData));
            if (selectedLogo) {
                businessFormData.append("logo", selectedLogo);
            }

            const [userResponse, businessResponse] = await Promise.all([
                userService.updateProfile(userFormData),
                userService.updateBusinessProfile(businessFormData)
            ]);

            if (userResponse.success && businessResponse.success) {
                toast.success("Business profile saved successfully!");
                
                // Sync localStorage
                const localInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
                const updatedBusiness = businessResponse.data?.business || localInfo.business || {};
                const updatedUserInfo = {
                    ...localInfo,
                    name: userResponse.data?.fullName || formValues.fullName,
                    businessStatus: updatedBusiness.businessStatus || localInfo.businessStatus || "pending"
                };
                localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));

                // Refresh profile
                await fetchProfile();

                // Check where to go next based on subscription status
                if (!localInfo.subscribe) {
                    router.push("/business/subscription");
                } else {
                    // If they already subscribed (e.g. they are resubmitting a rejected application)
                    router.push("/business/pending");
                }
            } else {
                toast.error("Failed to save some information. Please try again.");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        authService.logout();
        router.push("/auth");
    };

    if (isLoading) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-50/50 client-ui items-center justify-center p-4">
                <Loader2 className="w-10 h-10 animate-spin text-[#0A4D2E]" />
                <p className="mt-4 font-bold text-sm text-[#0A4D2E] tracking-wide">Loading Business Profile...</p>
            </div>
        );
    }

    const business = userData?.business || {};

    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50 pb-20 client-ui">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 md:px-8 h-16 md:h-20 flex items-center justify-between shadow-sm">
                <button
                    type="button"
                    onClick={() => {
                        if (window.history.length > 1) {
                            router.back();
                        } else {
                            router.push("/business");
                        }
                    }}
                    className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors text-gray-700 flex items-center gap-2 font-semibold text-sm"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                    <span className="hidden sm:inline">Back</span>
                </button>
                <h1 className="text-lg md:text-xl font-bold text-gray-900 text-center">
                    Business Onboarding & Profile
                </h1>
                <button
                    type="button"
                    onClick={handleLogout}
                    className="p-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors text-xs font-semibold flex items-center gap-1.5"
                    title="Log Out"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Log Out</span>
                </button>
            </header>

            <form onSubmit={handleSave} className="max-w-4xl mx-auto w-full p-4 sm:p-6 md:p-8 space-y-6">
                
                {business?.businessStatus === "rejected" && (
                    <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-red-100 rounded-xl shrink-0">
                                <span className="w-6 h-6 text-red-600 block flex items-center justify-center font-bold text-lg">!</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-red-900">Application Rejected</h3>
                                <p className="text-red-700 text-sm mt-1 mb-3">
                                    Your business application was reviewed but could not be approved. Please review the reason below, update your details, and resubmit.
                                </p>
                                <div className="bg-white/60 p-4 rounded-xl border border-red-100">
                                    <span className="text-xs font-bold uppercase tracking-wider text-red-600 mb-1 block">Reason for Rejection</span>
                                    <p className="text-gray-800 font-medium">{business?.rejectedReason || "No specific reason provided. Please ensure all details are accurate."}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Onboarding Header Banner */}
                <div className="bg-[#0A4D2E] text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-extrabold tracking-tight">Setup Your Business Profile</h2>
                        <p className="text-white/80 text-xs sm:text-sm mt-1 leading-relaxed">
                            Fill out your business details below to complete onboarding and launch your services.
                        </p>
                    </div>
                </div>

                {/* Media Section: Avatar & Logo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Owner Photo */}
                    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <User className="w-4 h-4 text-[#0A4D2E]" /> Owner Profile Photo
                            </span>
                            <span className="text-[11px] text-gray-400 font-medium">Click photo to update</span>
                        </div>
                        <div className="flex items-center gap-5">
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-20 h-20 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center relative overflow-hidden group cursor-pointer shrink-0 shadow-inner"
                            >
                                {imagePreview ? (
                                    <Image src={imagePreview} alt="Profile Preview" fill className="object-cover" />
                                ) : userData?.image ? (
                                    <Image src={`${baseUrl}${userData.image}`} alt="Profile" fill className="object-cover" unoptimized />
                                ) : (
                                    <User className="w-8 h-8 text-gray-400" />
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Camera className="w-5 h-5 text-white" />
                                </div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-xs font-semibold text-gray-700">Upload Owner Photo</p>
                                <p className="text-[11px] text-gray-400 leading-normal">PNG or JPG. Max size 5MB.</p>
                                <Button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs font-semibold border-gray-200 text-gray-700 hover:bg-gray-50 mt-1"
                                >
                                    Choose Photo
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Business Logo */}
                    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-[#0A4D2E]" /> Official Business Logo
                            </span>
                            <span className="text-[11px] text-gray-400 font-medium">Click logo to update</span>
                        </div>
                        <div className="flex items-center gap-5">
                            <div 
                                onClick={() => logoInputRef.current?.click()}
                                className="w-20 h-20 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center relative overflow-hidden group cursor-pointer shrink-0 shadow-inner"
                            >
                                {logoPreview ? (
                                    <Image src={logoPreview} alt="Logo Preview" fill className="object-cover" />
                                ) : business?.logo ? (
                                    <Image src={`${baseUrl}${business.logo}`} alt="Logo" fill className="object-cover" unoptimized />
                                ) : (
                                    <Building2 className="w-8 h-8 text-gray-400" />
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Camera className="w-5 h-5 text-white" />
                                </div>
                                <input 
                                    type="file" 
                                    ref={logoInputRef} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-xs font-semibold text-gray-700">Upload Business Brand Logo</p>
                                <p className="text-[11px] text-gray-400 leading-normal">Visible on your public listings.</p>
                                <Button 
                                    type="button"
                                    onClick={() => logoInputRef.current?.click()}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs font-semibold border-gray-200 text-gray-700 hover:bg-gray-50 mt-1"
                                >
                                    Choose Logo
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 1: Account & Owner Details */}
                <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-sm space-y-4">
                    <div className="border-b border-gray-100 pb-3">
                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <User className="w-4 h-4 text-[#0A4D2E]" /> Account & Personal Information
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {/* Email - Read-Only */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-gray-400" />
                                Email Address <span className="text-[10px] text-gray-400 font-normal">(Read-only)</span>
                            </label>
                            <div className="relative">
                                <Input
                                    type="email"
                                    value={userData?.email || ""}
                                    readOnly
                                    disabled
                                    className="rounded-xl border-gray-200 bg-gray-100/80 text-gray-600 font-medium h-11 cursor-not-allowed pr-10"
                                />
                                <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>

                        {/* Full Name - Editable */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-700">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                placeholder="Enter your full name"
                                value={formValues.fullName}
                                onChange={(e) => setFormValues({ ...formValues, fullName: e.target.value })}
                                required
                                className="rounded-xl border-gray-300 focus:border-[#0A4D2E] focus:ring-[#0A4D2E]/20 h-11 font-medium text-gray-900"
                            />
                        </div>

                        {/* Phone Number - Editable */}
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-gray-400" />
                                Phone Number
                            </label>
                            <Input
                                type="text"
                                placeholder="e.g. +1 (555) 000-0000"
                                value={formValues.phone}
                                onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })}
                                className="rounded-xl border-gray-300 focus:border-[#0A4D2E] focus:ring-[#0A4D2E]/20 h-11 font-medium text-gray-900"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Business Profile Details */}
                <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-sm space-y-4">
                    <div className="border-b border-gray-100 pb-3">
                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-[#0A4D2E]" /> Business Details
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {/* Business Name */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-700">
                                Business Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                placeholder="e.g. Acme Services LLC"
                                value={formValues.businessName}
                                onChange={(e) => setFormValues({ ...formValues, businessName: e.target.value })}
                                required
                                className="rounded-xl border-gray-300 focus:border-[#0A4D2E] focus:ring-[#0A4D2E]/20 h-11 font-medium text-gray-900"
                            />
                        </div>

                        {/* Years in Business */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                Years in Business
                            </label>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                placeholder="e.g. 5"
                                value={formValues.yearsInBusiness}
                                onChange={(e) => setFormValues({ ...formValues, yearsInBusiness: e.target.value })}
                                className="rounded-xl border-gray-300 focus:border-[#0A4D2E] focus:ring-[#0A4D2E]/20 h-11 font-medium text-gray-900"
                            />
                        </div>

                        {/* Business Description */}
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-semibold text-gray-700">
                                Business Description
                            </label>
                            <Textarea
                                rows={4}
                                placeholder="Describe the services you offer, your expertise, and team..."
                                value={formValues.description}
                                onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                                className="rounded-xl border-gray-300 focus:border-[#0A4D2E] focus:ring-[#0A4D2E]/20 font-normal text-gray-900 text-sm leading-relaxed"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 3: Location & Online Presence */}
                <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-sm space-y-4">
                    <div className="border-b border-gray-100 pb-3">
                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#0A4D2E]" /> Location & Website
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {/* Address */}
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-semibold text-gray-700">
                                Street Address
                            </label>
                            <Input
                                type="text"
                                placeholder="e.g. 123 Business Way, Suite 100"
                                value={formValues.address}
                                onChange={(e) => setFormValues({ ...formValues, address: e.target.value })}
                                className="rounded-xl border-gray-300 focus:border-[#0A4D2E] focus:ring-[#0A4D2E]/20 h-11 font-medium text-gray-900"
                            />
                        </div>

                        {/* City */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-700">City</label>
                            <Input
                                type="text"
                                placeholder="City name"
                                value={formValues.city}
                                onChange={(e) => setFormValues({ ...formValues, city: e.target.value })}
                                className="rounded-xl border-gray-300 focus:border-[#0A4D2E] focus:ring-[#0A4D2E]/20 h-11 font-medium text-gray-900"
                            />
                        </div>

                        {/* State & Zip Code */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700">State</label>
                                <Input
                                    type="text"
                                    placeholder="State/Region"
                                    value={formValues.state}
                                    onChange={(e) => setFormValues({ ...formValues, state: e.target.value })}
                                    className="rounded-xl border-gray-300 focus:border-[#0A4D2E] focus:ring-[#0A4D2E]/20 h-11 font-medium text-gray-900"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700">Zip Code</label>
                                <Input
                                    type="text"
                                    placeholder="Zip / Postal"
                                    value={formValues.zipCode}
                                    onChange={(e) => setFormValues({ ...formValues, zipCode: e.target.value })}
                                    className="rounded-xl border-gray-300 focus:border-[#0A4D2E] focus:ring-[#0A4D2E]/20 h-11 font-medium text-gray-900"
                                />
                            </div>
                        </div>

                        {/* Website */}
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                                <Globe className="w-3.5 h-3.5 text-gray-400" />
                                Business Website
                            </label>
                            <Input
                                type="url"
                                placeholder="https://www.yourbusiness.com"
                                value={formValues.website}
                                onChange={(e) => setFormValues({ ...formValues, website: e.target.value })}
                                className="rounded-xl border-gray-300 focus:border-[#0A4D2E] focus:ring-[#0A4D2E]/20 h-11 font-medium text-gray-900"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                    <Button
                        type="submit"
                        disabled={isSaving}
                        className="w-full bg-[#0A4D2E] hover:bg-[#083c24] text-white h-14 rounded-2xl text-base font-bold shadow-lg shadow-green-900/15 transition-all flex items-center justify-center gap-2 disabled:opacity-75"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Saving Profile...</span>
                            </>
                        ) : (
                            <>
                                <Check className="w-5 h-5" />
                                <span>Save & Continue</span>
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
