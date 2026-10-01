"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Clock, ChevronRight, Building2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServiceCardProps {
  service: any;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "";

  // Dynamic Category Name
  const categoryName =
    service.categoryInfo?.name ||
    service.category?.name ||
    (typeof service.category === "string" ? service.category : null) ||
    "Service";

  // Dynamic Provider Name
  const providerName =
    service.providerInfo?.business?.businessName ||
    service.provider?.business?.businessName ||
    service.providerInfo?.fullName ||
    service.provider?.fullName ||
    "Verified Business";

  // Dynamic Location (City, State)
  const locationParts = [
    service.providerInfo?.business?.city || service.provider?.business?.city,
    service.providerInfo?.business?.state || service.provider?.business?.state,
  ].filter(Boolean);

  const locationText = locationParts.length > 0 ? locationParts.join(", ") : "Location N/A";

  // Dynamic Image URL
  const mainPhoto = service.photos?.[0];
  const photoUrl = mainPhoto
    ? mainPhoto.startsWith("http")
      ? mainPhoto
      : `${baseUrl}${mainPhoto}`
    : null;

  // Dynamic Rating
  const rawRating = service.rating?.averageRating;
  const ratingVal = typeof rawRating === "number" && rawRating > 0 ? rawRating.toFixed(1) : "5.0";
  const ratingCount = service.rating?.total || 0;

  // Dynamic Duration
  const durationDisplay = service.duration
    ? typeof service.duration === "string" && (service.duration.includes("min") || service.duration.includes("hour"))
      ? service.duration
      : `${service.duration} min`
    : "Flexible";

  // Dynamic Price
  const hasPrice = service.price !== undefined && service.price !== null;
  const priceDisplay = hasPrice ? `$${service.price}` : "Custom Quote";

  return (
    <Link
      href={`/services/${service._id}`}
      className="group block h-full focus:outline-none"
    >
      <div className="relative flex flex-col h-full bg-white rounded-xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer">
        {/* Image Container */}
        <div className="relative w-full h-44 bg-slate-100 overflow-hidden">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={service.name || "Service Image"}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              unoptimized={true}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 font-semibold text-xs">
              <Building2 className="w-7 h-7 mb-1 text-slate-300" />
              <span>No Image Available</span>
            </div>
          )}

          {/* Overlay Gradient for contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-70 group-hover:opacity-85 transition-opacity" />

          {/* Category Badge */}
          <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-[#0A5C36] shadow-sm border border-white/60 tracking-wider uppercase">
            {categoryName}
          </div>

          {/* Rating Badge */}
          <div className="absolute top-3 right-3 z-10 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-bold text-white shadow-sm flex items-center gap-1 border border-white/10">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span>{ratingVal}</span>
            {ratingCount > 0 && (
              <span className="text-[10px] text-slate-300">({ratingCount})</span>
            )}
          </div>

          {/* Verified Provider Badge */}
          <div className="absolute bottom-2.5 left-3 right-3 z-10 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate max-w-[200px] shadow-sm">{providerName}</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
          {/* Main Info */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-[#0A5C36] transition-colors line-clamp-1">
              {service.name || "Untitled Service"}
            </h3>
            <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed font-normal">
              {service.description || "No description available."}
            </p>
          </div>

          {/* Details & Footer Row */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="truncate max-w-[130px]">
                  {locationText}
                </span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{durationDisplay}</span>
              </div>
            </div>

            {/* Price & Action Button */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Price
                </span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl font-black text-[#0A5C36]">
                    {priceDisplay}
                  </span>
                  {hasPrice && (
                    <span className="text-[10px] font-medium text-slate-400">
                      / session
                    </span>
                  )}
                </div>
              </div>

              <Button className="h-9 px-3.5 rounded-lg bg-emerald-50 text-[#0A5C36] group-hover:bg-[#0A5C36] group-hover:text-white font-bold text-xs shadow-none group-hover:shadow-md transition-all flex items-center gap-1 border border-emerald-200/80 group-hover:border-[#0A5C36]">
                <span>Details</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
