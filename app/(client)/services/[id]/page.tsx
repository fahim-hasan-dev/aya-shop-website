"use client";

import { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  MapPin, 
  Star, 
  Phone, 
  MessageSquare, 
  Clock, 
  Globe, 
  Mail, 
  Users, 
  CheckCircle2, 
  ShieldCheck, 
  Send,
  Trash2,
  Building2,
  CalendarCheck
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { serviceService } from "@/services/serviceService";
import { chatService } from "@/services/chatService";
import { reviewService } from "@/services/reviewService";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { authService } from "@/services/authService";

export default function ServiceDetailPage() {
    const router = useRouter();
    const params = useParams();
    const serviceId = params.id as string;
    
    const [service, setService] = useState<any>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<string>("");

    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "";
    
    // Review State
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, comment: "" });

    useEffect(() => {
        const fetchService = async () => {
            if (!serviceId) return;
            try {
                const [serviceRes, reviewsRes] = await Promise.all([
                    serviceService.getSingleService(serviceId),
                    reviewService.getReviewsByServiceId(serviceId, { limit: 10 })
                ]);
                
                if (serviceRes.success) {
                    setService(serviceRes.data);
                    if (serviceRes.data.photos?.[0]) {
                        setSelectedPhoto(serviceRes.data.photos[0]);
                    }
                }
                if (reviewsRes.success) {
                    setReviews(reviewsRes.data.reviews || reviewsRes.data || []);
                }
            } catch (error: any) {
                console.error("Error fetching service:", error);
                toast.error("Failed to load service details");
            } finally {
                setIsLoading(false);
            }
        };

        fetchService();
    }, [serviceId]);

    const handleChatWithProvider = async () => {
        if (!authService.isAuthenticated()) {
            toast.info("Please log in to chat with provider");
            router.push(`/client/login?redirect=${encodeURIComponent(`/services/${serviceId}`)}`);
            return;
        }
        if (!service?.provider?._id) return;
        
        setIsChatLoading(true);
        try {
            const response = await chatService.createChat(service.provider._id);
            if (response.success) {
                toast.success("Conversation started");
                router.push("/messages");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to start conversation");
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!authService.isAuthenticated()) {
            toast.info("Please log in to submit a review");
            router.push(`/client/login?redirect=${encodeURIComponent(`/services/${serviceId}`)}`);
            return;
        }
        if (!newReview.comment.trim()) return toast.error("Please enter a comment");
        
        setIsSubmittingReview(true);
        try {
            const response = await reviewService.createReview({
                service: serviceId,
                rating: newReview.rating,
                comment: newReview.comment
            });
            if (response.success) {
                toast.success("Review submitted!");
                setReviews([response.data, ...reviews]);
                setNewReview({ rating: 5, comment: "" });
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to submit review");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        const result = await Swal.fire({
            title: "Delete Review?",
            text: "Are you sure you want to delete this review?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#0A5C36",
            confirmButtonText: "Yes, Delete",
        });

        if (result.isConfirmed) {
            try {
                await reviewService.deleteReview(reviewId);
                setReviews(reviews.filter(r => r._id !== reviewId));
                toast.success("Review deleted");
            } catch (error: any) {
                toast.error(error.message || "Failed to delete review");
            }
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto pb-20 space-y-8 animate-pulse">
                <div className="h-44 bg-slate-200 rounded-[36px]" />
                <div className="h-96 bg-slate-100 rounded-[36px]" />
            </div>
        );
    }

    if (!service) {
        return (
            <div className="max-w-xl mx-auto py-24 text-center bg-white p-12 rounded-[36px] border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900">Service Not Found</h2>
                <p className="text-slate-500 text-sm font-medium mt-2">The service you are looking for might have been deleted or is unavailable.</p>
                <Button onClick={() => router.push("/listings")} className="mt-6 rounded-2xl bg-[#0A5C36] font-bold">
                    Browse All Services
                </Button>
            </div>
        );
    }

    const mainPhotoUrl = selectedPhoto
        ? selectedPhoto.startsWith('http') ? selectedPhoto : `${baseUrl}${selectedPhoto}`
        : service.photos?.[0]
        ? service.photos[0].startsWith('http') ? service.photos[0] : `${baseUrl}${service.photos[0]}`
        : null;

    return (
        <div className="flex flex-col gap-10 pb-20">
            {/* Top Navigation Bar */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-[#0A5C36] hover:bg-emerald-50 transition-all shadow-sm"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-[#0A5C36] text-xs font-black uppercase tracking-wider">
                        {service.category?.name || service.categoryInfo?.name || "Service"}
                    </span>
                    <span className="text-slate-400 text-xs font-bold">•</span>
                    <div className="flex items-center gap-1 text-xs font-extrabold text-slate-700">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        <span>{service.rating?.averageRating || 0}</span>
                        <span className="text-slate-400">({service.rating?.total || 0} reviews)</span>
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left (2 Cols): Gallery & Overview */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Main Image Gallery */}
                    <div className="space-y-4">
                        <div className="relative w-full h-80 sm:h-[450px] bg-slate-100 rounded-[36px] overflow-hidden shadow-md border border-slate-200">
                            {mainPhotoUrl ? (
                                <Image
                                    src={mainPhotoUrl}
                                    alt={service.name}
                                    fill
                                    className="object-cover"
                                    unoptimized={true}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-base">
                                    No Service Image Available
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {service.photos && service.photos.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {service.photos.map((photo: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedPhoto(photo)}
                                        className={`relative w-24 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                                            selectedPhoto === photo ? "border-[#0A5C36] shadow-md scale-105" : "border-slate-200 opacity-70 hover:opacity-100"
                                        }`}
                                    >
                                        <Image
                                            src={photo.startsWith('http') ? photo : `${baseUrl}${photo}`}
                                            alt=""
                                            fill
                                            className="object-cover"
                                            unoptimized={true}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Title & Description */}
                    <div className="bg-white p-8 md:p-10 rounded-[36px] border border-slate-200/80 shadow-sm space-y-6">
                        <div className="space-y-3">
                            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                                {service.name}
                            </h1>
                            <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                                <div className="flex items-center gap-1 text-slate-700">
                                    <Building2 className="w-4 h-4 text-emerald-600" />
                                    <span>{service.provider?.business?.businessName || service.providerInfo?.business?.businessName || "Verified Provider"}</span>
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4 text-red-500" />
                                    <span>{service.provider?.business?.city || service.providerInfo?.business?.city}, {service.provider?.business?.state || service.providerInfo?.business?.state}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 space-y-3">
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">About This Service</h3>
                            <p className="text-slate-600 text-base font-medium leading-relaxed whitespace-pre-line">
                                {service.description}
                            </p>
                        </div>
                    </div>

                    {/* Features List */}
                    {service.features && service.features.length > 0 && (
                        <div className="bg-white p-8 md:p-10 rounded-[36px] border border-slate-200/80 shadow-sm space-y-6">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Included Features</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {service.features.map((feature: string, idx: number) => (
                                    <div key={idx} className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                                        <CheckCircle2 className="w-5 h-5 text-[#0A5C36] shrink-0 mt-0.5" />
                                        <span className="text-sm font-bold text-slate-800">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reviews Section */}
                    <div className="bg-white p-8 md:p-10 rounded-[36px] border border-slate-200/80 shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Customer Reviews</h3>
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-3.5 py-1.5 rounded-full">
                                {reviews.length} Total
                            </span>
                        </div>

                        {/* Submit Review Form */}
                        <form onSubmit={handleSubmitReview} className="bg-slate-50 p-6 rounded-3xl space-y-4 border border-slate-200/70">
                            <h4 className="text-sm font-black text-slate-900">Leave Your Rating</h4>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setNewReview({ ...newReview, rating: star })}
                                        className="focus:outline-none hover:scale-110 transition-transform"
                                    >
                                        <Star className={`w-7 h-7 ${star <= newReview.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300"}`} />
                                    </button>
                                ))}
                            </div>
                            <textarea
                                placeholder="Write your review experience..."
                                value={newReview.comment}
                                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                className="w-full h-28 p-4 rounded-2xl border border-slate-200 bg-white text-sm font-medium focus:ring-2 focus:ring-[#0A5C36]/20 focus:border-[#0A5C36] transition-all resize-none outline-none"
                            />
                            <Button
                                type="submit"
                                disabled={isSubmittingReview}
                                className="w-full h-12 bg-[#0A5C36] hover:bg-[#064E3B] text-white font-bold rounded-2xl shadow-md shadow-emerald-950/20"
                            >
                                {isSubmittingReview ? "Submitting..." : "Submit Review"}
                            </Button>
                        </form>

                        {/* Reviews List */}
                        <div className="space-y-4">
                            {reviews.length > 0 ? (
                                reviews.map((review) => (
                                    <div key={review._id} className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 flex gap-4 group">
                                        <div className="w-11 h-11 bg-emerald-100 rounded-2xl flex items-center justify-center text-[#0A5C36] font-black shrink-0 overflow-hidden">
                                            {review.client?.image ? (
                                                <img src={review.client.image.startsWith('http') ? review.client.image : `${baseUrl}${review.client.image}`} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <Users className="w-5 h-5" />
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h5 className="font-extrabold text-slate-900 text-sm">{review.client?.fullName || "Verified Client"}</h5>
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200"}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteReview(review._id)}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-xs font-medium text-slate-600 leading-relaxed">{review.comment}</p>
                                            <p className="text-[10px] font-extrabold text-slate-300 uppercase tracking-widest pt-1">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-8 text-slate-400 text-xs font-bold">No reviews yet. Be the first to leave a review!</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Sticky Pricing & Provider Card */}
                <div className="space-y-8">
                    {/* Pricing & Booking Action Card */}
                    <div className="sticky top-28 bg-white p-8 rounded-[36px] border border-slate-200/80 shadow-xl shadow-slate-200/40 space-y-6">
                        <div className="space-y-1">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Service Price</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-[#0A5C36]">${service.price}</span>
                                <span className="text-xs font-bold text-slate-400">/ service</span>
                            </div>
                        </div>

                        <div className="space-y-3 py-4 border-y border-slate-100 text-xs font-bold text-slate-600">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-slate-400"><Clock className="w-4 h-4 text-emerald-600" /> Duration</span>
                                <span className="text-slate-900 font-extrabold">{service.duration} mins</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-slate-400"><CalendarCheck className="w-4 h-4 text-emerald-600" /> Max Slots</span>
                                <span className="text-slate-900 font-extrabold">{service.maxBookingsPerDay || 5} per day</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-slate-400"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Verification</span>
                                <span className="text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full text-[10px]">Verified</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3 pt-2">
                            <Link href={`/services/${service._id}/book`} className="block">
                                <Button className="w-full h-14 bg-[#0A5C36] hover:bg-[#064E3B] text-white font-extrabold text-base rounded-2xl shadow-lg shadow-emerald-950/30 active:scale-95 transition-all">
                                    Book This Service
                                </Button>
                            </Link>

                            <Button
                                variant="outline"
                                onClick={handleChatWithProvider}
                                disabled={isChatLoading}
                                className="w-full h-12 rounded-2xl border-slate-200 text-[#0A5C36] hover:bg-emerald-50 font-bold text-xs flex items-center justify-center gap-2"
                            >
                                <MessageSquare className="w-4 h-4" />
                                {isChatLoading ? "Starting Conversation..." : "Chat with Provider"}
                            </Button>
                        </div>
                    </div>

                    {/* Provider Info Card */}
                    <div className="bg-white p-8 rounded-[36px] border border-slate-200/80 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-emerald-100 text-[#0A5C36] rounded-2xl flex items-center justify-center font-black text-lg">
                                🏪
                            </div>
                            <div>
                                <h4 className="font-extrabold text-slate-900 text-base">{service.provider?.business?.businessName || "Verified Business"}</h4>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Official Provider</span>
                            </div>
                        </div>

                        <div className="space-y-3 text-xs font-bold text-slate-600 pt-2">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                <span>{service.provider?.business?.address || "Address available upon booking"}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>{service.provider?.phone || "+34 900 123 456"}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span className="truncate">{service.provider?.email || "provider@ayashop.com"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

