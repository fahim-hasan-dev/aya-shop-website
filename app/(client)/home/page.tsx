"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Search, 
  MapPin, 
  Star, 
  CheckCircle2, 
  ChevronLeft,
  ChevronRight, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  Briefcase, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  ThumbsUp,
  Quote
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ServiceCard from "@/components/client/ServiceCard";
import { serviceService } from "@/services/serviceService";
import { categoryService } from "@/services/categoryService";
import { metaService } from "@/services/metaService";
import { reviewService } from "@/services/reviewService";

function CategoryCardItem({ cat, baseUrl }: { cat: any; baseUrl: string }) {
    const [imgError, setImgError] = useState(false);
    const imageUrl = cat.image
        ? cat.image.startsWith("http")
            ? cat.image
            : `${baseUrl}${cat.image}`
        : null;

    return (
        <Link
            href={`/listings?category=${cat._id}`}
            className="group flex flex-col h-full rounded-xl bg-white border border-slate-200/80 hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-950/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
        >
            {/* Top Image Cover */}
            <div className="relative w-full h-24 sm:h-28 bg-gradient-to-br from-emerald-800 to-teal-950 overflow-hidden flex items-center justify-center">
                {imageUrl && !imgError ? (
                    <img
                        src={imageUrl}
                        alt={cat.name}
                        onError={() => setImgError(true)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0A5C36] to-emerald-900 text-white">
                        <Briefcase className="w-8 h-8 text-emerald-200 group-hover:scale-110 transition-transform" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
            </div>

            {/* Bottom Content Area */}
            <div className="p-3 flex-1 flex flex-col justify-between space-y-1 bg-white">
                <h3 className="font-bold text-slate-900 group-hover:text-[#0A5C36] text-xs sm:text-sm line-clamp-1 transition-colors">
                    {cat.name}
                </h3>
                <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-700 pt-0.5">
                    <span>Explore</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </Link>
    );
}

export default function ClientHomePage() {
    const router = useRouter();
    const [services, setServices] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [landingStats, setLandingStats] = useState<any>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
    const [isReviewsLoading, setIsReviewsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeftState, setScrollLeftState] = useState(0);

    const reviewScrollRef = useRef<HTMLDivElement>(null);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "";

    const scrollReviews = (direction: "left" | "right") => {
        if (reviewScrollRef.current) {
            const scrollAmount = direction === "left" ? -360 : 360;
            reviewScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!reviewScrollRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - reviewScrollRef.current.offsetLeft);
        setScrollLeftState(reviewScrollRef.current.scrollLeft);
    };

    const handleMouseLeaveOrUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !reviewScrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - reviewScrollRef.current.offsetLeft;
        const walk = (x - startX) * 1.5;
        reviewScrollRef.current.scrollLeft = scrollLeftState - walk;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [servicesRes, categoriesRes, statsRes] = await Promise.allSettled([
                    serviceService.getTopRatedServices(),
                    categoryService.getCategories(),
                    metaService.getLandingStats()
                ]);

                if (servicesRes.status === 'fulfilled' && servicesRes.value?.success) {
                    const sData = servicesRes.value.data;
                    const sList = Array.isArray(sData) ? sData : sData?.data || [];
                    setServices(sList.slice(0, 6));
                }

                if (categoriesRes.status === 'fulfilled' && categoriesRes.value?.success) {
                    const cData = categoriesRes.value.data;
                    const cList = Array.isArray(cData) ? cData : cData?.data || cData?.categories || [];
                    setCategories(cList);
                }

                if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
                    setLandingStats(statsRes.value.data);
                }
            } catch (error: any) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
                setIsCategoriesLoading(false);
            }
        };

        fetchData();
    }, []);

    // Fetch dynamic reviews from backend for top services
    useEffect(() => {
        const fetchReviews = async () => {
            if (services.length > 0) {
                try {
                    const reviewPromises = services.map((s) =>
                        reviewService.getReviewsByServiceId(s._id, { limit: 5 }).catch(() => null)
                    );
                    const results = await Promise.all(reviewPromises);
                    const fetchedReviews: any[] = [];

                    results.forEach((res, index) => {
                        if (res?.success) {
                            const rList = Array.isArray(res.data) ? res.data : res.data?.reviews || [];
                            rList.forEach((r: any) => {
                                fetchedReviews.push({
                                    ...r,
                                    serviceName: services[index]?.name,
                                    categoryName: services[index]?.categoryInfo?.name || services[index]?.category?.name,
                                });
                            });
                        }
                    });

                    setReviews(fetchedReviews);
                } catch (err) {
                    console.error("Error fetching reviews:", err);
                } finally {
                    setIsReviewsLoading(false);
                }
            } else {
                setIsReviewsLoading(false);
            }
        };

        fetchReviews();
    }, [services]);

    const fallbackReviews = [
        {
            _id: "fb1",
            comment: "Found an incredible technician within 10 minutes. Arrived right on time and fixed all our issues cleanly. Highly recommended!",
            rating: 5,
            client: { fullName: "Sarah Jenkins", image: null },
            serviceName: "Electrical & Home Repair",
            location: "Dhaka, Mohakhali"
        },
        {
            _id: "fb2",
            comment: "Booking home cleaning through AYA Shop was super seamless! The provider was background-checked, polite, and very thorough.",
            rating: 5,
            client: { fullName: "Michael Rahman", image: null },
            serviceName: "Deep Home Cleaning",
            location: "Gulshan, Dhaka"
        },
        {
            _id: "fb3",
            comment: "Great customer service and transparent pricing. I booked my appointment slots without any back-and-forth phone calls.",
            rating: 5,
            client: { fullName: "Anika Chowdhury", image: null },
            serviceName: "Plumbing Maintenance",
            location: "Dhanmondi, Dhaka"
        },
        {
            _id: "fb4",
            comment: "Extremely professional service provider. They brought all necessary tools and completed the work ahead of schedule.",
            rating: 5,
            client: { fullName: "Tanvir Ahmed", image: null },
            serviceName: "Air Conditioning Service",
            location: "Uttara, Dhaka"
        },
        {
            _id: "fb5",
            comment: "Clean UI, transparent slot booking, and genuine verified reviews. AYA Shop is now my default app for local services.",
            rating: 5,
            client: { fullName: "Nusrat Jahan", image: null },
            serviceName: "Beauty & Spa Treatment",
            location: "Banani, Dhaka"
        },
        {
            _id: "fb6",
            comment: "Quick response time and high quality work. I am super satisfied with the booking process and overall experience.",
            rating: 5,
            client: { fullName: "Rafiqul Islam", image: null },
            serviceName: "Carpentry & Maintenance",
            location: "Mirpur, Dhaka"
        }
    ];

    const displayReviews = reviews.length > 0 ? reviews : fallbackReviews;

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
        } else {
            router.push("/listings");
        }
    };

    const popularSearchChips = ["Plumbing", "Cleaning", "Electrician", "Beauty", "Business"];

    return (
        <div className="flex flex-col gap-16 md:gap-24">
            {/* HERO SECTION */}
            <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-[#064E3B] to-[#0A5C36] text-white p-6 sm:p-10 lg:p-14 shadow-2xl border border-emerald-800/40">
                {/* Ambient Glow & Grid Pattern */}
                <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                    {/* Left Column (Content & Search) */}
                    <div className="lg:col-span-7 space-y-7">
                        {/* Top Trust Badge */}
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-emerald-200 tracking-wide">
                            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                            <span>#1 Trusted On-Demand Service Platform</span>
                        </div>

                        {/* Main Title & Subtitle */}
                        <div className="space-y-3.5">
                            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight leading-[1.15]">
                                Book Verified <span className="text-emerald-300 bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">Local Experts</span> In Minutes
                            </h1>
                            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-xl">
                                Connect with top-rated professionals for home repairs, beauty, cleaning, and business services. Guaranteed quality & instant slot booking.
                            </p>
                        </div>

                        {/* Search Bar */}
                        <form onSubmit={handleSearchSubmit} className="bg-white/95 backdrop-blur-xl p-2 rounded-2xl shadow-2xl border border-white/60 flex flex-col sm:flex-row gap-2">
                            <div className="relative flex-1 flex items-center">
                                <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
                                <Input
                                    type="text"
                                    placeholder="Search services (e.g. Cleaning, Plumbing)..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-12 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 border-none bg-transparent focus:ring-0 text-sm font-medium"
                                />
                            </div>
                            <Button type="submit" className="h-12 px-7 rounded-xl bg-[#0A5C36] hover:bg-[#064E3B] text-white font-bold text-sm shadow-md shadow-emerald-950/30 flex items-center justify-center gap-2 transition-all cursor-pointer">
                                <span>Search</span>
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </form>

                        {/* Popular Tags */}
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold pt-1">
                            <span className="text-emerald-200/70">Popular searches:</span>
                            {popularSearchChips.map((chip) => (
                                <Link
                                    key={chip}
                                    href={`/search?q=${chip}`}
                                    className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-100 border border-white/10 backdrop-blur-sm transition-all text-[11px]"
                                >
                                    {chip}
                                </Link>
                            ))}
                        </div>

                        {/* Trust Metric Badges */}
                        <div className="pt-4 border-t border-emerald-800/60 grid grid-cols-3 gap-4 text-left">
                            <div>
                                <div className="text-xl sm:text-2xl font-black text-white">4.9/5.0</div>
                                <div className="text-[11px] font-semibold text-emerald-200/80 flex items-center gap-1">
                                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Customer Rating
                                </div>
                            </div>
                            <div>
                                <div className="text-xl sm:text-2xl font-black text-white">100%</div>
                                <div className="text-[11px] font-semibold text-emerald-200/80 flex items-center gap-1">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Pros
                                </div>
                            </div>
                            <div>
                                <div className="text-xl sm:text-2xl font-black text-white">24/7</div>
                                <div className="text-[11px] font-semibold text-emerald-200/80 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-teal-300" /> Instant Booking
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Visual Showcase Cards) */}
                    <div className="lg:col-span-5 hidden lg:flex flex-col gap-4 relative">
                        {/* Floating Feature Card 1 */}
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-2xl shadow-2xl space-y-3 transform hover:-translate-y-1 transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold">
                                        <Briefcase className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">Verified Service Experts</div>
                                        <div className="text-xs text-emerald-200/80">Background-checked & certified</div>
                                    </div>
                                </div>
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                                    Active
                                </span>
                            </div>
                        </div>

                        {/* Floating Feature Card 2 */}
                        <div className="bg-gradient-to-r from-emerald-900/80 to-teal-950/80 backdrop-blur-xl border border-emerald-500/30 p-5 rounded-2xl shadow-2xl space-y-3 transform translate-x-4 hover:translate-x-3 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 font-bold">
                                    <Award className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">Quality Guarantee</div>
                                    <div className="text-xs text-slate-300">100% satisfaction or full support</div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Feature Card 3 */}
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-300">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-semibold text-slate-200">Easy Online Slots & Payment</span>
                            </div>
                            <span className="text-xs font-bold text-emerald-300">Instant</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* TOP CATEGORIES SECTION */}
            <section className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-1">
                    <div className="space-y-1.5 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#0A5C36] border border-emerald-200/80 text-xs font-extrabold uppercase tracking-wider">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>Explore Categories</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                            Browse by Service Category
                        </h2>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                            Discover qualified professionals across all major service categories for home, health, and business.
                        </p>
                    </div>
                    <Link
                        href="/listings"
                        className="inline-flex items-center gap-2 text-sm font-extrabold text-[#0A5C36] hover:text-[#064E3B] transition-colors group shrink-0"
                    >
                        <span>View All Categories</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {isCategoriesLoading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="h-40 bg-slate-100 rounded-xl animate-pulse" />
                        ))
                    ) : categories.length > 0 ? (
                        categories.map((cat) => (
                            <CategoryCardItem key={cat._id} cat={cat} baseUrl={baseUrl} />
                        ))
                    ) : (
                        <div className="col-span-full py-6 text-center text-slate-400 font-semibold text-xs bg-white rounded-xl border border-dashed border-slate-200">
                            No categories available
                        </div>
                    )}
                </div>
            </section>

            {/* TOP RATED SERVICES SECTION */}
            <section className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-1">
                    <div className="space-y-1.5 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#0A5C36] border border-emerald-200/80 text-xs font-extrabold uppercase tracking-wider">
                            <Award className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>Featured Listings</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                            Top Rated Services
                        </h2>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                            Handpicked top-rated service listings verified for high quality, reliability, and customer satisfaction.
                        </p>
                    </div>
                    <Link
                        href="/listings"
                        className="inline-flex items-center gap-2 text-sm font-extrabold text-[#0A5C36] hover:text-[#064E3B] transition-colors group shrink-0"
                    >
                        <span>See All Services ({services.length})</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="h-80 bg-slate-100 rounded-2xl animate-pulse" />
                        ))
                    ) : services.length > 0 ? (
                        services.map((service) => (
                            <ServiceCard key={service._id} service={service} />
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center text-slate-400 font-bold bg-white rounded-2xl border border-slate-200 text-sm">
                            No top rated services currently available.
                        </div>
                    )}
                </div>
            </section>

            {/* HOW IT WORKS SECTION */}
            <section className="space-y-8 bg-gradient-to-b from-slate-50 to-emerald-50/40 p-6 sm:p-10 lg:p-12 rounded-3xl border border-slate-200/60 shadow-xs">
                <div className="space-y-1.5 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-[#0A5C36] border border-emerald-200/80 text-xs font-extrabold uppercase tracking-wider">
                        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>Simple Process</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                        How Booking Works in 3 Easy Steps
                    </h2>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">
                        Getting professional help for your home or business has never been easier or faster.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                    {/* Step 1 */}
                    <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 space-y-4 shadow-sm relative overflow-hidden group hover:border-emerald-400 transition-all hover:-translate-y-0.5">
                        <div className="w-12 h-12 rounded-xl bg-[#0A5C36] text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-950/20">
                            01
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Explore & Compare</h3>
                        <p className="text-slate-500 text-xs sm:text-sm font-normal leading-relaxed">
                            Search thousands of verified local pros by category, pricing, city, and real customer star ratings.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 space-y-4 shadow-sm relative overflow-hidden group hover:border-emerald-400 transition-all hover:-translate-y-0.5">
                        <div className="w-12 h-12 rounded-xl bg-[#0A5C36] text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-950/20">
                            02
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Select Available Slot</h3>
                        <p className="text-slate-500 text-xs sm:text-sm font-normal leading-relaxed">
                            Choose real-time open date and time slots directly on the service provider's calendar without calling.
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 space-y-4 shadow-sm relative overflow-hidden group hover:border-emerald-400 transition-all hover:-translate-y-0.5">
                        <div className="w-12 h-12 rounded-xl bg-[#0A5C36] text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-950/20">
                            03
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Guaranteed Service</h3>
                        <p className="text-slate-500 text-xs sm:text-sm font-normal leading-relaxed">
                            Meet your verified expert, get quality work done, and leave your own genuine rating and feedback.
                        </p>
                    </div>
                </div>
            </section>

            {/* LANDING STATS BANNER */}
            {landingStats && (
                <section className="bg-gradient-to-r from-emerald-950 via-[#0A5C36] to-emerald-900 text-white rounded-2xl p-6 md:p-12 border border-emerald-800/40 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-emerald-800/60 relative z-10">
                        <div className="space-y-2 pt-4 md:pt-0">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-emerald-300 mx-auto mb-2 border border-white/10">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-3xl md:text-4xl font-black text-white">
                                {landingStats.totalProviders}+
                            </h3>
                            <p className="text-xs font-bold uppercase tracking-wider text-emerald-200/80">
                                Verified Service Providers
                            </p>
                        </div>

                        <div className="space-y-2 pt-6 md:pt-0">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-emerald-300 mx-auto mb-2 border border-white/10">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-3xl md:text-4xl font-black text-white">
                                {landingStats.totalJobsDone}+
                            </h3>
                            <p className="text-xs font-bold uppercase tracking-wider text-emerald-200/80">
                                Completed Bookings
                            </p>
                        </div>

                        <div className="space-y-2 pt-6 md:pt-0">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-emerald-300 mx-auto mb-2 border border-white/10">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <h3 className="text-3xl md:text-4xl font-black text-white">
                                {landingStats.totalServices}+
                            </h3>
                            <p className="text-xs font-bold uppercase tracking-wider text-emerald-200/80">
                                Active Service Listings
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* DYNAMIC CUSTOMER REVIEWS CAROUSEL SECTION */}
            <section className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-1">
                    <div className="space-y-1.5 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#0A5C36] border border-emerald-200/80 text-xs font-extrabold uppercase tracking-wider">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>Client Testimonials</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                            What Clients Say About Our Pros
                        </h2>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                            Real experiences and honest feedback from verified clients who booked services through AYA Shop.
                        </p>
                    </div>

                    {/* Carousel Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => scrollReviews("left")}
                            className="p-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-[#0A5C36] hover:text-white hover:border-[#0A5C36] transition-all shadow-sm active:scale-95 cursor-pointer"
                            aria-label="Previous Reviews"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => scrollReviews("right")}
                            className="p-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-[#0A5C36] hover:text-white hover:border-[#0A5C36] transition-all shadow-sm active:scale-95 cursor-pointer"
                            aria-label="Next Reviews"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Scrollable Track (Mouse Drag & Arrow Controlled, No Scrollbar) */}
                <div
                    ref={reviewScrollRef}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeaveOrUp}
                    onMouseUp={handleMouseLeaveOrUp}
                    onMouseMove={handleMouseMove}
                    className="flex gap-6 overflow-x-auto select-none [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-4 pt-1 cursor-grab active:cursor-grabbing"
                >
                    {isReviewsLoading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="min-w-[300px] sm:min-w-[360px] h-60 bg-slate-100 rounded-2xl animate-pulse shrink-0" />
                        ))
                    ) : displayReviews.length > 0 ? (
                        displayReviews.map((rev: any, idx: number) => {
                            const clientName = rev.client?.fullName || rev.clientName || "Satisfied Client";
                            const clientImage = rev.client?.image
                                ? rev.client.image.startsWith("http")
                                    ? rev.client.image
                                    : `${baseUrl}${rev.client.image}`
                                : null;
                            const ratingStars = rev.rating || 5;

                            return (
                                <div
                                    key={rev._id || idx}
                                    className="min-w-[300px] sm:min-w-[360px] max-w-[380px] snap-start bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between space-y-5 relative overflow-hidden group shrink-0"
                                >
                                    <Quote className="absolute top-4 right-4 w-10 h-10 text-emerald-100/80 group-hover:text-emerald-200 transition-colors pointer-events-none" />

                                    <div className="space-y-3 relative z-10">
                                        {/* Rating Stars & Badge */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, starIdx) => (
                                                    <Star
                                                        key={starIdx}
                                                        className={`w-4 h-4 ${
                                                            starIdx < ratingStars
                                                                ? "text-amber-400 fill-amber-400"
                                                                : "text-slate-200"
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                                                Verified Booking
                                            </span>
                                        </div>

                                        {/* Comment */}
                                        <p className="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed italic line-clamp-4">
                                            "{rev.comment || rev.description || "Excellent service provided with great professionalism and attention to detail. Would definitely book again!"}"
                                        </p>
                                    </div>

                                    {/* Client & Service Info */}
                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 overflow-hidden relative shrink-0 flex items-center justify-center text-emerald-800 font-bold text-sm">
                                                {clientImage ? (
                                                    <Image
                                                        src={clientImage}
                                                        alt={clientName}
                                                        fill
                                                        className="object-cover"
                                                        unoptimized={true}
                                                    />
                                                ) : (
                                                    <span>{clientName.charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
                                                    {clientName}
                                                </h4>
                                                <p className="text-[11px] font-medium text-slate-400 line-clamp-1">
                                                    {rev.serviceName || rev.location || "Verified Client"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : null}
                </div>
            </section>

            {/* WHY AYA SHOP ADVANTAGE */}
            <section className="space-y-8">
                <div className="space-y-1.5 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#0A5C36] border border-emerald-200/80 text-xs font-extrabold uppercase tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Why Choose Us</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                        The AYA Shop Difference
                    </h2>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">
                        We connect you with trusted experts who deliver high-quality, reliable services with complete peace of mind.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 space-y-4 hover:shadow-lg hover:border-emerald-300 transition-all duration-300 group hover:-translate-y-1">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0A5C36] to-[#064E3B] text-white flex items-center justify-center shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform">
                            <ShieldCheck className="w-7 h-7" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Verified Business Profiles</h3>
                        <p className="text-slate-500 text-xs sm:text-sm font-normal leading-relaxed">
                            Every provider undergoes identity checks and business status verification by our admin team before listing services.
                        </p>
                    </div>

                    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 space-y-4 hover:shadow-lg hover:border-emerald-300 transition-all duration-300 group hover:-translate-y-1">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0A5C36] to-[#064E3B] text-white flex items-center justify-center shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform">
                            <Clock className="w-7 h-7" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Instant Appointment Slots</h3>
                        <p className="text-slate-500 text-xs sm:text-sm font-normal leading-relaxed">
                            Select real-time available date and time slots that fit your schedule without waiting on hold or endless calls.
                        </p>
                    </div>

                    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 space-y-4 hover:shadow-lg hover:border-emerald-300 transition-all duration-300 group hover:-translate-y-1">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0A5C36] to-[#064E3B] text-white flex items-center justify-center shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform">
                            <Star className="w-7 h-7" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Real Customer Reviews</h3>
                        <p className="text-slate-500 text-xs sm:text-sm font-normal leading-relaxed">
                            Read genuine feedback and star ratings left by real clients after completed service appointments.
                        </p>
                    </div>
                </div>
            </section>

            {/* BUSINESS OWNER PROMO BANNER */}
            <section className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-[#064E3B] to-emerald-950 text-white p-8 sm:p-12 md:p-14 overflow-hidden border border-emerald-800/40 shadow-2xl">
                {/* Background Ambient Glow & Grid Lines */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                    {/* Left Column Content */}
                    <div className="space-y-4 text-center lg:text-left max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-extrabold uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>For Service Providers & Businesses</span>
                        </div>

                        <h3 className="text-3xl sm:text-4xl lg:text-4xl font-black tracking-tight leading-tight">
                            Grow Your Business & Reach <span className="text-emerald-300 underline decoration-emerald-400/40 underline-offset-8">Thousands</span> of Local Clients
                        </h3>

                        <p className="text-slate-300 text-sm sm:text-base font-medium leading-relaxed">
                            Register your business on AYA Shop today. Set your custom working hours, manage real-time appointments, and boost your monthly revenue effortlessly.
                        </p>

                        {/* Perk Badges */}
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs font-semibold text-emerald-200">
                            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>Zero Setup Fee</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>Verified Badge</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                                <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>Real-time Dashboard</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column Action */}
                    <div className="flex flex-col items-center lg:items-end gap-3 shrink-0">
                        <Link href="/auth">
                            <Button className="h-13 px-8 rounded-xl bg-emerald-400 text-slate-950 hover:bg-emerald-300 font-extrabold text-base shadow-xl shadow-emerald-950/50 transition-all hover:scale-105 flex items-center gap-2 cursor-pointer">
                                <span>Register Your Business</span>
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                        </Link>
                        <span className="text-[11px] font-medium text-emerald-200/80">
                            Instant Setup • No Credit Card Required
                        </span>
                    </div>
                </div>
            </section>
        </div>
    );
}
