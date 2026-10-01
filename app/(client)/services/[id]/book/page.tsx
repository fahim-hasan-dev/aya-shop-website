"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Calendar as CalendarIcon, Clock, User, Mail, Phone, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { serviceService } from "@/services/serviceService";
import { bookingService } from "@/services/bookingService";
import { toast } from "sonner";
import { format, addDays } from "date-fns";

export default function BookingPage() {
    const router = useRouter();
    const params = useParams();
    const serviceId = params.id as string;
    
    const [service, setService] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availabilityLoading, setAvailabilityLoading] = useState(false);
    const [availableSlots, setAvailableSlots] = useState<any[]>([]);

    const [step, setStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedSlot, setSelectedSlot] = useState<any>(null);

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        notes: ""
    });

    useEffect(() => {
        try {
            const infoStr = localStorage.getItem("userInfo");
            if (infoStr) {
                const u = JSON.parse(infoStr);
                setFormData(prev => ({
                    ...prev,
                    fullName: u.fullName || "",
                    email: u.email || "",
                    phone: u.phone || ""
                }));
            }
        } catch (e) {
            console.error(e);
        }
    }, []);

    useEffect(() => {
        const fetchService = async () => {
            if (!serviceId) return;
            try {
                const response = await serviceService.getSingleService(serviceId);
                if (response.success) {
                    setService(response.data);
                }
            } catch (error: any) {
                console.error("Error fetching service:", error);
                toast.error("Failed to load service for booking");
            } finally {
                setIsLoading(false);
            }
        };
        fetchService();
    }, [serviceId]);

    useEffect(() => {
        const checkAvailability = async () => {
            if (!serviceId || !selectedDate) return;
            setAvailabilityLoading(true);
            try {
                const dateStr = format(selectedDate, "yyyy-MM-dd");
                const response = await serviceService.getServiceAvailability(serviceId, dateStr);
                if (response.success) {
                    const aData = response.data;
                    const aList = Array.isArray(aData) ? aData : aData?.slots || aData?.data || [];
                    setAvailableSlots(aList);
                    setSelectedSlot(null);
                }
            } catch (error: any) {
                console.error("Error checking availability:", error);
                setAvailableSlots([]);
            } finally {
                setAvailabilityLoading(false);
            }
        };
        checkAvailability();
    }, [serviceId, selectedDate]);

    const dates = Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i));

    const nextStep = () => {
        if (step === 1 && !selectedSlot) {
            toast.error("Please select an available time slot");
            return;
        }
        setStep(step + 1);
    };

    const handleBooking = async () => {
        if (!formData.fullName || !formData.email || !formData.phone) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);
        try {
            const bookingData = {
                service: serviceId,
                date: format(selectedDate, "yyyy-MM-dd"),
                startTime: selectedSlot.from,
                endTime: selectedSlot.to,
                notes: formData.notes,
                paymentMethod: "online" as const
            };

            const response = await bookingService.createBooking(bookingData);
            if (response.success) {
                setStep(3);
            } else {
                toast.error(response.message || "Failed to create booking");
            }
        } catch (error: any) {
            console.error("Booking error:", error);
            toast.error(error.message || "An error occurred during booking");
        } finally {
            setIsSubmitting(false);
        }
    };

    const prevStep = () => setStep(step - 1);

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto py-24 text-center">
                <div className="w-12 h-12 border-4 border-[#0A5C36] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="font-bold text-slate-500 text-sm">Loading Appointment Details...</p>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="max-w-md mx-auto py-20 text-center bg-white p-8 rounded-3xl border border-slate-200">
                <h3 className="text-xl font-black text-slate-900">Service Not Available</h3>
                <Button onClick={() => router.push("/listings")} className="mt-4 rounded-xl bg-[#0A5C36]">
                    Back to Services
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto pb-20 space-y-8">
            {/* Top Header */}
            <div className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                <button
                    disabled={isSubmitting}
                    onClick={() => step === 1 ? router.back() : prevStep()}
                    className="p-3 hover:bg-slate-100 rounded-2xl transition-all disabled:opacity-50 text-slate-700"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-black text-slate-900 leading-tight">Book Appointment</h1>
                    <p className="text-xs font-bold text-slate-400 truncate">{service.name}</p>
                </div>
                <span className="text-xl font-black text-[#0A5C36]">${service.price}</span>
            </div>

            {/* Stepper Progress Bar */}
            <div className="bg-white px-8 py-6 rounded-3xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between relative max-w-sm mx-auto">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex flex-col items-center gap-2 z-10">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all ${
                                step >= s ? "bg-[#0A5C36] text-white shadow-lg shadow-emerald-950/20" : "bg-slate-100 text-slate-400"
                            }`}>
                                {s}
                            </div>
                            <span className={`text-[10px] font-extrabold uppercase tracking-wider ${step >= s ? "text-[#0A5C36]" : "text-slate-400"}`}>
                                {s === 1 ? "Date & Slot" : s === 2 ? "Contact Details" : "Confirmed"}
                            </span>
                        </div>
                    ))}
                    <div className="absolute top-5 left-4 right-4 h-[2px] bg-slate-100 z-0" />
                    <div
                        className="absolute top-5 left-4 h-[2px] bg-[#0A5C36] transition-all duration-500 z-0"
                        style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
                    />
                </div>
            </div>

            {/* Summary Card */}
            <div className="bg-emerald-50/70 p-6 rounded-3xl border border-emerald-100 flex justify-between items-center">
                <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#0A5C36]">Target Service</span>
                    <h3 className="text-lg font-black text-slate-900">{service.name}</h3>
                    <p className="text-xs font-bold text-slate-500">{service.provider?.business?.businessName || service.providerInfo?.business?.businessName}</p>
                </div>
                <div className="text-right">
                    <span className="text-xs font-extrabold text-slate-400 block uppercase tracking-wider">Duration</span>
                    <span className="text-base font-black text-[#0A5C36]">{service.duration} min</span>
                </div>
            </div>

            {/* STEP 1: DATE & TIME SLOT SELECTION */}
            {step === 1 && (
                <div className="bg-white p-8 rounded-[36px] border border-slate-200/80 shadow-sm space-y-8">
                    {/* Date Picker */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-900">
                                <CalendarIcon className="w-5 h-5 text-[#0A5C36]" />
                                <h3 className="font-black text-sm uppercase tracking-widest">Select Date</h3>
                            </div>
                            {availabilityLoading && <span className="text-xs font-bold text-slate-400 animate-pulse">Checking Slots...</span>}
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                            {dates.map((d) => {
                                const isSelected = format(selectedDate, 'PP') === format(d, 'PP');
                                return (
                                    <button
                                        key={d.toISOString()}
                                        onClick={() => setSelectedDate(d)}
                                        className={`min-w-[105px] p-4 rounded-2xl border transition-all text-left space-y-1 ${
                                            isSelected
                                                ? "bg-[#0A5C36] border-[#0A5C36] text-white shadow-lg shadow-emerald-950/20"
                                                : "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
                                        }`}
                                    >
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? "text-emerald-200" : "text-slate-400"}`}>
                                            {format(d, "EEE")}
                                        </p>
                                        <p className="text-base font-black">
                                            {format(d, "MMM d")}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                        {!availabilityLoading && (
                            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-full inline-block ${
                                availableSlots.length > 0 ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-700"
                            }`}>
                                {availableSlots.length} Slots Available for {format(selectedDate, "MMM d")}
                            </span>
                        )}
                    </div>

                    {/* Slot Picker */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-slate-900">
                            <Clock className="w-5 h-5 text-[#0A5C36]" />
                            <h3 className="font-black text-sm uppercase tracking-widest">Select Available Time Slot</h3>
                        </div>
                        {availabilityLoading ? (
                            <div className="grid grid-cols-2 gap-3">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : availableSlots.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {availableSlots.map((slot, idx) => {
                                    const isSelected = selectedSlot === slot;
                                    const isAvailable = slot.status === 'available';
                                    return (
                                        <button
                                            key={idx}
                                            disabled={!isAvailable}
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`p-4 rounded-2xl border transition-all font-bold text-sm flex flex-col items-center gap-1 ${
                                                isSelected
                                                    ? "bg-[#0A5C36] border-[#0A5C36] text-white shadow-lg shadow-emerald-950/20"
                                                    : isAvailable
                                                    ? "bg-white border-slate-200 text-slate-700 hover:border-[#0A5C36]"
                                                    : "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                                            }`}
                                        >
                                            <span className="text-[10px] uppercase opacity-70">
                                                {isAvailable ? "Available" : "Booked"}
                                            </span>
                                            <span className="font-extrabold">{slot.from} - {slot.to}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-10 bg-slate-50 rounded-3xl text-center border border-dashed border-slate-200">
                                <p className="text-slate-400 font-bold text-sm">No available slots for this selected date.</p>
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={nextStep}
                        disabled={!selectedSlot}
                        className="w-full h-14 bg-[#0A5C36] hover:bg-[#064E3B] text-white font-extrabold text-base rounded-2xl shadow-lg shadow-emerald-950/20"
                    >
                        Continue to Contact Details
                    </Button>
                </div>
            )}

            {/* STEP 2: CONTACT DETAILS */}
            {step === 2 && (
                <div className="bg-white p-8 rounded-[36px] border border-slate-200/80 shadow-sm space-y-6">
                    <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-[#0A5C36]" />
                        <h3 className="font-black text-sm uppercase tracking-widest text-[#0A5C36]">Contact Information</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Full Name *</label>
                            <Input
                                placeholder="Full Name"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="h-14 rounded-2xl border-slate-200 bg-slate-50 font-medium px-5 focus:bg-white transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Email Address *</label>
                            <Input
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="h-14 rounded-2xl border-slate-200 bg-slate-50 font-medium px-5 focus:bg-white transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Phone Number *</label>
                            <Input
                                placeholder="Phone Number"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="h-14 rounded-2xl border-slate-200 bg-slate-50 font-medium px-5 focus:bg-white transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Special Requirements (Optional)</label>
                            <textarea
                                placeholder="Any additional details or special requests..."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full h-28 p-5 rounded-2xl border border-slate-200 bg-slate-50 font-medium text-sm focus:bg-white outline-none focus:ring-2 focus:ring-[#0A5C36]/20 transition-all resize-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <Button
                            variant="outline"
                            onClick={prevStep}
                            className="h-14 px-6 rounded-2xl border-slate-200 font-bold text-slate-600"
                        >
                            Back
                        </Button>
                        <Button
                            onClick={handleBooking}
                            disabled={isSubmitting}
                            className="flex-1 h-14 bg-[#0A5C36] hover:bg-[#064E3B] text-white font-extrabold text-base rounded-2xl shadow-lg shadow-emerald-950/20"
                        >
                            {isSubmitting ? "Confirming Booking..." : "Confirm & Complete Booking"}
                        </Button>
                    </div>
                </div>
            )}

            {/* STEP 3: CONFIRMATION */}
            {step === 3 && (
                <div className="bg-white p-12 rounded-[36px] border border-slate-200/80 shadow-xl text-center space-y-6">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-[#0A5C36]">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-slate-900">Appointment Booked!</h2>
                        <p className="text-slate-500 font-medium text-sm max-w-md mx-auto">
                            Your appointment for <span className="text-slate-900 font-bold">{format(selectedDate, 'PP')}</span> at <span className="text-slate-900 font-bold">{selectedSlot?.from}</span> has been successfully confirmed.
                        </p>
                    </div>

                    <div className="pt-6 max-w-sm mx-auto space-y-3">
                        <Button
                            onClick={() => router.push("/bookings")}
                            className="w-full h-14 bg-[#0A5C36] hover:bg-[#064E3B] text-white font-bold rounded-2xl shadow-md"
                        >
                            View My Bookings
                        </Button>
                        <Button
                            onClick={() => router.push("/home")}
                            variant="outline"
                            className="w-full h-14 rounded-2xl border-slate-200 font-bold text-slate-600"
                        >
                            Return to Home Page
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

