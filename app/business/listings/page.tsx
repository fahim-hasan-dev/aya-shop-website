"use client";

import { useState, useEffect, useRef } from "react";
import {
    Plus,
    Star,
    MapPin,
    CalendarCheck2,
    Trash2,
    Edit3,
    Home,
    Bell,
    UserCircle,
    Loader2,
    X,
    Camera,
    Check,
    ChevronRight,
    CircleDashed,
    Package,
    Clock,
    DollarSign,
    Zap
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { notificationService } from "@/services/notificationService";
import { serviceService } from "@/services/serviceService";
import { categoryService } from "@/services/categoryService";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

export default function BusinessListingsPage() {
    const [listings, setListings] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [unreadNotifCount, setUnreadNotifCount] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingService, setEditingService] = useState<any>(null);

    const [formValues, setFormValues] = useState({
        name: "",
        category: "",
        description: "",
        price: "",
        duration: "",
        maxBookingsPerDay: "",
        serviceType: "paid", // New field
        features: "", // Comma separated for UI
        clientRequirements: "",
        cancellationPolicy: ""
    });
    const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "";

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [servicesRes, categoriesRes, notifRes] = await Promise.all([
                serviceService.getMyServices({ page: 1, limit: 100 }),
                categoryService.getCategories(),
                notificationService.getUnreadCount()
            ]);

            if (servicesRes.success) setListings(Array.isArray(servicesRes.data) ? servicesRes.data : servicesRes.data?.data || []);
            if (categoriesRes.success) setCategories(categoriesRes.data?.categories || []);
            if (notifRes.success) setUnreadNotifCount(notifRes.data?.unreadCount || 0);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load listings");
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = async (id: string) => {
        try {
            const response = await serviceService.toggleStatus(id);
            if (response.success) {
                toast.success("Service status updated");
                fetchData();
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to toggle status");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this service?")) return;
        try {
            const response = await serviceService.deleteService(id);
            if (response.success) {
                toast.success("Service deleted");
                fetchData();
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to delete service");
        }
    };

    const handleOpenModal = (service: any = null) => {
        if (service) {
            setEditingService(service);
            setFormValues({
                name: service.name || "",
                category: service.category || service.categoryInfo?._id || "",
                description: service.description || "",
                price: service.price?.toString() || "",
                duration: service.duration || "",
                maxBookingsPerDay: service.maxBookingsPerDay?.toString() || "",
                serviceType: service.serviceType || "paid",
                features: service.features?.join(", ") || "",
                clientRequirements: service.clientRequirements || "",
                cancellationPolicy: service.cancellationPolicy || ""
            });
            setPhotoPreviews(service.photos?.map((p: string) => `${baseUrl}${p}`) || []);
        } else {
            setEditingService(null);
            setFormValues({
                name: "",
                category: "",
                description: "",
                price: "",
                duration: "",
                maxBookingsPerDay: "",
                serviceType: "paid",
                features: "",
                clientRequirements: "",
                cancellationPolicy: ""
            });
            setPhotoPreviews([]);
        }
        setSelectedPhotos([]);
        setIsModalOpen(true);
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setSelectedPhotos(prev => [...prev, ...files]);
            const newPreviews = files.map(f => URL.createObjectURL(f));
            setPhotoPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removePhoto = (index: number) => {
        setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
        setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!formValues.name || !formValues.category || !formValues.price) {
            toast.error("Please fill required fields");
            return;
        }

        setIsSaving(true);
        try {
            const formData = new FormData();
            const data = {
                name: formValues.name,
                category: formValues.category,
                description: formValues.description,
                price: Number(formValues.price) || 0,
                duration: formValues.duration,
                maxBookingsPerDay: Math.max(Number(formValues.maxBookingsPerDay) || 1, 1),
                serviceType: formValues.serviceType,
                features: formValues.features.split(",").map(f => f.trim()).filter(f => f !== ""),
                clientRequirements: formValues.clientRequirements,
                cancellationPolicy: formValues.cancellationPolicy
            };
            
            formData.append("data", JSON.stringify(data));

            selectedPhotos.forEach(file => {
                formData.append("photos", file);
            });

            let response;
            if (editingService) {
                response = await serviceService.updateService(editingService._id, formData);
            } else {
                response = await serviceService.createService(formData);
            }

            if (response.success) {
                toast.success(editingService ? "Service updated" : "Service created");
                setIsModalOpen(false);
                fetchData();
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to save service");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50 pb-24 client-ui">
            {/* Header */}
            <div className="bg-[#0A4D2E] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-lg">
                <div className="flex items-center gap-3">
                    <Link href="/business" className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                        <Home className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-black leading-tight tracking-tight">Listing Manager</h1>
                        <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest">Grow your business</p>
                    </div>
                </div>
                <div className="flex items-center gap-5">
                    <Link href="/business/notifications" className="relative group p-2 hover:bg-white/10 rounded-xl transition-all">
                        <Bell className="w-6 h-6" />
                        {unreadNotifCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0A4D2E] animate-pulse" />
                        )}
                    </Link>
                    <Link href="/business/profile" className="flex items-center gap-2 group p-1 pr-3 hover:bg-white/10 rounded-2xl transition-all">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center overflow-hidden">
                            <UserCircle className="w-6 h-6" />
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Profile</p>
                            <p className="text-xs font-bold">My Account</p>
                        </div>
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto w-full px-5 py-6 md:py-10 space-y-8">
                {/* Action Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Active Services</h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                            {listings.length} Services Currently Listed
                        </p>
                    </div>
                    <Button 
                        onClick={() => handleOpenModal()}
                        className="bg-[#0A4D2E] hover:bg-[#0d7344] h-14 px-8 rounded-2xl font-black shadow-xl shadow-green-900/10 gap-3 transition-all active:scale-95 text-base"
                    >
                        <Plus className="w-6 h-6" />
                        Add New Service
                    </Button>
                </div>

                {isLoading ? (
                    <div className="py-40 flex flex-col items-center justify-center gap-4">
                        <div className="relative">
                            <Loader2 className="w-12 h-12 animate-spin text-[#0A4D2E]" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <CircleDashed className="w-6 h-6 text-[#0A4D2E]/20" />
                            </div>
                        </div>
                        <p className="font-black text-gray-400 uppercase tracking-[0.2em] text-[10px]">Synchronizing services...</p>
                    </div>
                ) : listings.length === 0 ? (
                    <div className="py-32 text-center space-y-6 bg-white rounded-[40px] border border-dashed border-gray-200">
                        <div className="w-24 h-24 bg-gray-50 rounded-[32px] mx-auto flex items-center justify-center">
                            <Package className="w-12 h-12 text-gray-200" />
                        </div>
                        <div className="space-y-2 px-6">
                            <h3 className="text-2xl font-black text-gray-900">Your shelf is empty</h3>
                            <p className="text-sm font-bold text-gray-400 max-w-xs mx-auto">Create your first service to start reaching thousands of potential clients.</p>
                        </div>
                        <Button 
                            onClick={() => handleOpenModal()}
                            className="bg-[#0A4D2E] h-14 px-10 rounded-2xl font-black shadow-xl"
                        >
                            Start Now
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {listings.map((item) => (
                            <div key={item._id} className="bg-white rounded-[40px] border border-gray-100 p-6 shadow-sm hover:shadow-2xl hover:shadow-green-900/5 transition-all group flex flex-col relative overflow-hidden">
                                {/* Badge Overlay */}
                                <div className="absolute top-0 right-0 p-6">
                                    <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur shadow-sm px-3 py-1.5 rounded-full border border-gray-50">
                                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                        <span className="text-xs font-black text-gray-900">{item.rating?.averageRating || "N/A"}</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 space-y-6">
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-[#0A4D2E] uppercase tracking-widest">{item.categoryInfo?.name || "General"}</p>
                                        <h3 className="text-xl font-black text-gray-900 group-hover:text-[#0A4D2E] transition-colors leading-tight">{item.name}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 font-medium">{item.description}</p>
                                    </div>

                                    <div className="flex items-center justify-between py-4 border-y border-gray-50">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Price</p>
                                            <p className="text-lg font-black text-gray-900">${item.price}</p>
                                        </div>
                                        <div className="h-8 w-px bg-gray-100" />
                                        <div className="space-y-1 text-right">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Duration</p>
                                            <p className="text-lg font-black text-gray-900">{item.duration}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 rounded-2xl p-3">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Bookings</p>
                                            <p className="text-base font-black text-[#0A4D2E]">{item.bookingCount || 0}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-2xl p-3">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Status</p>
                                            <button 
                                                onClick={() => handleToggleStatus(item._id)}
                                                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${item.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}
                                            >
                                                {item.status || 'active'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-8 flex gap-3 pt-6 border-t border-gray-50">
                                    <Button 
                                        onClick={() => handleOpenModal(item)}
                                        variant="outline" 
                                        className="flex-1 h-12 border-gray-100 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 hover:text-blue-700 hover:border-blue-100 transition-all"
                                    >
                                        <Edit3 className="w-4 h-4 mr-2" />
                                        Edit
                                    </Button>
                                    <Button 
                                        onClick={() => handleDelete(item._id)}
                                        variant="outline" 
                                        className="w-12 h-12 border-gray-100 rounded-xl flex items-center justify-center p-0 hover:bg-red-50 hover:text-red-700 hover:border-red-100 transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-[40px] border-none shadow-2xl">
                    <DialogHeader className="p-8 pb-0">
                        <DialogTitle className="text-2xl font-black text-gray-900">
                            {editingService ? "Update Service" : "Launch New Service"}
                        </DialogTitle>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">
                            {editingService ? "Modify your existing offering" : "Complete the details below"}
                        </p>
                    </DialogHeader>

                    <div className="p-8 space-y-6">
                        {/* Photos Upload */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Service Gallery</label>
                            <div className="grid grid-cols-4 gap-4">
                                {photoPreviews.map((url, i) => (
                                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-100 group">
                                        <Image src={url} alt="Service" fill className="object-cover" unoptimized />
                                        <button 
                                            onClick={() => removePhoto(i)}
                                            className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-2 hover:border-[#0A4D2E] hover:bg-green-50 transition-all text-gray-400 hover:text-[#0A4D2E]"
                                >
                                    <Camera className="w-6 h-6" />
                                    <span className="text-[10px] font-bold">Add Photo</span>
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    multiple 
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Service Name</label>
                                <Input 
                                    placeholder="e.g. Premium Web Audit"
                                    value={formValues.name}
                                    onChange={e => setFormValues({...formValues, name: e.target.value})}
                                    className="h-12 rounded-xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Business Category</label>
                                <select 
                                    value={formValues.category}
                                    onChange={e => setFormValues({...formValues, category: e.target.value})}
                                    className="w-full h-12 rounded-xl border border-gray-100 bg-gray-50 font-bold px-4 focus:ring-2 focus:ring-[#0A4D2E] outline-none appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Select category</option>
                                    {categories.map((cat: any) => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Description</label>
                            <Textarea 
                                placeholder="Explain what the client will receive..."
                                value={formValues.description}
                                onChange={e => setFormValues({...formValues, description: e.target.value})}
                                className="min-h-[120px] rounded-xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-medium"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Price ($)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input 
                                        type="number"
                                        placeholder="0.00"
                                        value={formValues.price}
                                        onChange={e => setFormValues({...formValues, price: e.target.value})}
                                        className="h-12 pl-10 rounded-xl border-gray-100 bg-gray-50 font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration</label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input 
                                        placeholder="60 min"
                                        value={formValues.duration}
                                        onChange={e => setFormValues({...formValues, duration: e.target.value})}
                                        className="h-12 pl-10 rounded-xl border-gray-100 bg-gray-50 font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Max Booking</label>
                                <Input 
                                    type="number"
                                    placeholder="5"
                                    value={formValues.maxBookingsPerDay}
                                    onChange={e => setFormValues({...formValues, maxBookingsPerDay: e.target.value})}
                                    className="h-12 rounded-xl border-gray-100 bg-gray-50 font-bold"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Service Type</label>
                                <select 
                                    value={formValues.serviceType} 
                                    onChange={e => setFormValues({...formValues, serviceType: e.target.value})}
                                    className="w-full h-12 rounded-xl border border-gray-100 bg-gray-50 font-bold px-4 focus:ring-2 focus:ring-[#0A4D2E] outline-none appearance-none cursor-pointer"
                                >
                                    <option value="paid">Paid Service</option>
                                    <option value="unpaid">Unpaid Service</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Features (Comma separated)</label>
                                <Input 
                                    placeholder="SEO, High Performance, Mobile First..."
                                    value={formValues.features}
                                    onChange={e => setFormValues({...formValues, features: e.target.value})}
                                    className="h-12 rounded-xl border-gray-100 bg-gray-50 font-bold"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Client Requirements</label>
                                <Textarea 
                                    placeholder="What do you need from the client?"
                                    value={formValues.clientRequirements}
                                    onChange={e => setFormValues({...formValues, clientRequirements: e.target.value})}
                                    className="rounded-xl border-gray-100 bg-gray-50 font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cancellation Policy</label>
                                <Textarea 
                                    placeholder="e.g. Full refund within 24h"
                                    value={formValues.cancellationPolicy}
                                    onChange={e => setFormValues({...formValues, cancellationPolicy: e.target.value})}
                                    className="rounded-xl border-gray-100 bg-gray-50 font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-8 pt-4 bg-gray-50/50 rounded-b-[40px] flex flex-row gap-4">
                        <Button 
                            variant="outline" 
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest border-gray-100"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 h-14 bg-[#0A4D2E] hover:bg-[#0d7344] rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-green-900/10 gap-2"
                        >
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                            {editingService ? "Update Service" : "Create Service"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
