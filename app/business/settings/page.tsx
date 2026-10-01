"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Home, UserCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { userService } from "@/services/userService";
import { categoryService } from "@/services/categoryService";
import { toast } from "sonner";

const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday"
];

export default function BusinessSettingsPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);

    const [formValues, setFormValues] = useState({
        businessName: "",
        category: "",
        description: "",
    });

    const [businessHours, setBusinessHours] = useState<any>({
        monday: { from: "", to: "" },
        tuesday: { from: "", to: "" },
        wednesday: { from: "", to: "" },
        thursday: { from: "", to: "" },
        friday: { from: "", to: "" },
        saturday: { from: "", to: "" },
        sunday: { from: "", to: "" },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, catRes] = await Promise.all([
                    userService.getMe(),
                    categoryService.getCategories()
                ]);

                if (catRes.success) {
                    setCategories(catRes.data?.categories || []);
                }

                if (userRes.success && userRes.data?.business) {
                    const b = userRes.data.business;
                    setFormValues({
                        businessName: b.businessName || "",
                        category: b.category?._id || b.category || "",
                        description: b.description || "",
                    });
                    
                    if (b.businessHours) {
                        setBusinessHours({
                            monday: b.businessHours.monday || { from: "00:00", to: "00:00" },
                            tuesday: b.businessHours.tuesday || { from: "00:00", to: "00:00" },
                            wednesday: b.businessHours.wednesday || { from: "00:00", to: "00:00" },
                            thursday: b.businessHours.thursday || { from: "00:00", to: "00:00" },
                            friday: b.businessHours.friday || { from: "00:00", to: "00:00" },
                            saturday: b.businessHours.saturday || { from: "00:00", to: "00:00" },
                            sunday: b.businessHours.sunday || { from: "00:00", to: "00:00" },
                        });
                    }
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to load settings data");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleHourChange = (day: string, field: "from" | "to", value: string) => {
        setBusinessHours((prev: any) => ({
            ...prev,
            [day]: { ...prev[day], [field]: value }
        }));
    };

    const handleToggleClosed = (day: string) => {
        setBusinessHours((prev: any) => {
            const isCurrentlyClosed = prev[day]?.from === "00:00" && prev[day]?.to === "00:00";
            if (isCurrentlyClosed) {
                // If it was closed, open it with default hours
                return {
                    ...prev,
                    [day]: { from: "09:00", to: "17:00" }
                };
            } else {
                // Mark as closed by setting to 00:00
                return {
                    ...prev,
                    [day]: { from: "00:00", to: "00:00" }
                };
            }
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            const payload = {
                businessName: formValues.businessName,
                category: formValues.category,
                description: formValues.description,
                businessHours
            };
            
            formData.append("data", JSON.stringify(payload));
            
            const response = await userService.updateBusinessProfile(formData);
            if (response.success) {
                toast.success("Settings saved successfully!");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to save settings");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-50/50 items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#0A4D2E]" />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50 pb-24 client-ui">
            {/* Header */}
            <div className="bg-[#0A4D2E] text-white px-6 py-4 flex items-center justify-between lg:hidden">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/business")}
                        className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                    >
                        <Home className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-lg font-semibold leading-tight">Business Hub</h1>
                        <p className="text-xs text-white/70">Manage your business</p>
                    </div>
                </div>
                <div className="flex items-center gap-5">
                    <Link href="/business/profile" className="flex flex-col items-center gap-0.5">
                        <UserCircle className="w-6 h-6" />
                        <span className="text-[10px]">Profile</span>
                    </Link>
                </div>
            </div>

            <div className="px-5 py-6 space-y-8 max-w-3xl mx-auto w-full">
                <h2 className="text-2xl font-black text-gray-900 md:text-3xl">Business Settings</h2>

                {/* Business Information */}
                <div className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm space-y-6">
                    <h3 className="text-xl font-black text-gray-900">Business Information</h3>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Business Name</label>
                            <Input
                                placeholder="Enter business name"
                                value={formValues.businessName}
                                onChange={(e) => setFormValues({...formValues, businessName: e.target.value})}
                                className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Business Category</label>
                            <select
                                value={formValues.category}
                                onChange={(e) => setFormValues({...formValues, category: e.target.value})}
                                className="w-full h-14 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white transition-all font-medium px-4 outline-none appearance-none"
                            >
                                <option value="" disabled>Select category</option>
                                {categories.map(c => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</label>
                            <Textarea
                                placeholder="Enter business description"
                                value={formValues.description}
                                onChange={(e) => setFormValues({...formValues, description: e.target.value})}
                                className="min-h-[120px] rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all font-medium resize-none px-4 py-3"
                            />
                        </div>
                    </div>
                </div>

                {/* Business Hours */}
                <div className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm space-y-6">
                    <h3 className="text-xl font-black text-gray-900">Business Hours</h3>

                    <div className="space-y-4">
                        {days.map((day) => {
                            const isClosed = businessHours[day]?.from === "00:00" && businessHours[day]?.to === "00:00";

                            return (
                                <div key={day} className="flex items-center justify-between gap-4 p-3 rounded-2xl hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-center gap-3 w-32">
                                        <input 
                                            type="checkbox"
                                            checked={isClosed}
                                            onChange={() => handleToggleClosed(day)}
                                            className="w-4 h-4 rounded border-gray-300 text-[#0A4D2E] focus:ring-[#0A4D2E]"
                                        />
                                        <span className={`text-sm font-bold capitalize ${isClosed ? "text-gray-400 line-through" : "text-gray-700"}`}>
                                            {day}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 flex-1">
                                        <Input
                                            type="time"
                                            value={isClosed ? "" : (businessHours[day]?.from || "")}
                                            onChange={(e) => handleHourChange(day, "from", e.target.value)}
                                            disabled={isClosed}
                                            className={`h-12 rounded-xl text-center font-bold ${isClosed ? "bg-gray-100 border-gray-50 text-gray-400" : "border-gray-100 bg-white"}`}
                                        />
                                        <span className="text-xs font-bold text-gray-400">to</span>
                                        <Input
                                            type="time"
                                            value={isClosed ? "" : (businessHours[day]?.to || "")}
                                            onChange={(e) => handleHourChange(day, "to", e.target.value)}
                                            disabled={isClosed}
                                            className={`h-12 rounded-xl text-center font-bold ${isClosed ? "bg-gray-100 border-gray-50 text-gray-400" : "border-gray-100 bg-white"}`}
                                        />
                                        {isClosed && (
                                            <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg ml-2 shrink-0">Closed</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Save Button */}
                <Button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full h-16 bg-[#0A4D2E] hover:bg-[#0d7344] rounded-[24px] text-lg font-black shadow-xl shadow-green-900/10 transition-all flex items-center justify-center gap-2"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" /> Saving...
                        </>
                    ) : "Save Changes"}
                </Button>
            </div>
        </div>
    );
}
