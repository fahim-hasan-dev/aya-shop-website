"use client";

import { useState, useEffect } from "react";
import { userService } from "@/services/userService";
import { User, Mail, Phone, ShieldCheck, Calendar, Camera, Save, LogOut, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";
import { authService } from "@/services/authService";

import { useRef } from "react";
import { fileService } from "@/services/fileService";

export default function ProfilePage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        image: ""
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await userService.getMe();
                if (response.success) {
                    setProfile(response.data);
                    setFormData({
                        fullName: response.data.fullName || "",
                        phone: response.data.phone || "",
                        image: response.data.image || ""
                    });
                }
            } catch (error: any) {
                console.error("Error fetching profile:", error);
                toast.error("Failed to load profile");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setIsEditing(true); // Auto enable edit mode to show save button
    };

    const handleUpdate = async () => {
        setIsUpdating(true);
        try {
            const formDataObj = new FormData();
            formDataObj.append("data", JSON.stringify(formData));
            
            if (selectedImageFile) {
                formDataObj.append("image", selectedImageFile);
            }

            const response = await userService.updateProfile(formDataObj);
            if (response.success) {
                setProfile(response.data);
                setFormData({
                    fullName: response.data.fullName || "",
                    phone: response.data.phone || "",
                    image: response.data.image || ""
                });
                setSelectedImageFile(null);
                setImagePreview(null);
                setIsEditing(false);
                toast.success("Profile updated successfully");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleLogout = () => {
        authService.logout();
        router.push("/auth");
        toast.success("Logged out successfully");
    };

    if (isLoading) {
        return <div className="max-w-xl mx-auto py-20 text-center animate-pulse font-black text-[#0A5C36] uppercase tracking-widest">Loading Profile...</div>;
    }

    return (
        <div className="max-w-xl mx-auto py-12 px-6 min-h-screen">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
            />
            {/* Header */}
            <header className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all shadow-sm">
                        <ChevronLeft className="w-6 h-6 text-gray-900" />
                    </button>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Profile</h1>
                </div>
                <button onClick={handleLogout} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all">
                    <LogOut className="w-6 h-6" />
                </button>
            </header>

            <div className="space-y-8">
                {/* Profile Card */}
                <div className="bg-white border border-gray-100 rounded-[50px] p-8 md:p-10 shadow-2xl shadow-green-900/5 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-32 bg-[#0A5C36]/5 -z-10" />

                    <div className="relative inline-block mb-6 group">
                        <div className={`w-32 h-32 rounded-[40px] bg-gray-100 border-4 border-white overflow-hidden shadow-xl flex items-center justify-center transition-opacity`}>
                            {imagePreview || formData.image ? (
                                <img src={imagePreview || (formData.image.startsWith('http') ? formData.image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${formData.image}`)} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-12 h-12 text-gray-300" />
                            )}
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUpdating}
                            className="absolute bottom-1 right-1 p-2.5 bg-[#0A5C36] text-white rounded-xl shadow-lg hover:scale-110 transition-all disabled:opacity-50 disabled:scale-100"
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-gray-900">{profile.fullName}</h2>
                        <div className="flex items-center justify-center gap-2 text-sm font-bold text-gray-400">
                            <ShieldCheck className="w-4 h-4 text-blue-500" />
                            <span className="uppercase tracking-widest">{profile.role}</span>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="bg-white border border-gray-100 rounded-[50px] p-8 md:p-10 shadow-sm space-y-8">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Personal Information</h3>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="text-xs font-black text-[#0A5C36] uppercase tracking-widest hover:underline"
                        >
                            {isEditing ? "Cancel" : "Edit Details"}
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <User className="w-3 h-3 text-[#0A5C36]" /> Full Name
                            </label>
                            <Input
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                disabled={!isEditing || isUpdating}
                                className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold px-6 focus:bg-white disabled:opacity-100 disabled:text-gray-900"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Mail className="w-3 h-3 text-[#0A5C36]" /> Email Address
                            </label>
                            <Input
                                value={profile.email}
                                disabled
                                className="h-14 rounded-2xl border-gray-100 bg-gray-50/10 font-bold px-6 opacity-50 cursor-not-allowed"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Phone className="w-3 h-3 text-[#0A5C36]" /> Phone Number
                            </label>
                            <Input
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                disabled={!isEditing || isUpdating}
                                className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold px-6 focus:bg-white disabled:opacity-100 disabled:text-gray-900"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Calendar className="w-3 h-3 text-[#0A5C36]" /> Member Since
                            </label>
                            <div className="h-14 rounded-2xl border border-gray-50 bg-gray-50/30 font-bold px-6 flex items-center text-gray-500">
                                {format(new Date(profile.createdAt), "MMMM yyyy")}
                            </div>
                        </div>
                    </div>

                    {isEditing && (
                        <Button
                            onClick={handleUpdate}
                            disabled={isUpdating}
                            className="w-full h-14 bg-[#0A5C36] hover:bg-[#084a2c] rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-green-900/10 gap-2"
                        >
                            <Save className="w-5 h-5" />
                            {isUpdating ? "Saving..." : "Save Changes"}
                        </Button>
                    )}
                </div>

                {/* Additional Links */}
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => router.push("/bookings")} className="p-6 bg-white border border-gray-100 rounded-3xl text-center space-y-2 hover:border-[#0A5C36]/30 transition-all shadow-sm">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mx-auto">
                            <Calendar className="w-5 h-5 text-[#0A5C36]" />
                        </div>
                        <p className="text-xs font-black text-gray-900 uppercase tracking-widest">My Bookings</p>
                    </button>
                    <button className="p-6 bg-white border border-gray-100 rounded-3xl text-center space-y-2 hover:border-[#0A5C36]/30 transition-all shadow-sm">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto">
                            <ShieldCheck className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Privacy</p>
                    </button>
                </div>
            </div>
        </div>
    );
}
