"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Search, 
  MapPin, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  Sparkles,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ServiceCard from "@/components/client/ServiceCard";
import { serviceService } from "@/services/serviceService";
import { categoryService } from "@/services/categoryService";
import { toast } from "sonner";

function ListingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("q") || searchParams.get("searchTerm") || "";
  const initialCategory = searchParams.get("category") || "all";
  const initialCity = searchParams.get("city") || "";
  const initialSort = searchParams.get("sort") || "-createdAt";
  const initialPage = Number(searchParams.get("page")) || 1;

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedCity, setSelectedCity] = useState<string>(initialCity);
  const [sortBy, setSortBy] = useState<string>(initialSort);
  const [page, setPage] = useState<number>(initialPage);

  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const limit = 15; // 15 services per page

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        if (response.success) {
          const cData = response.data;
          const cList = Array.isArray(cData) ? cData : cData?.data || cData?.categories || [];
          setCategories(cList);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = { page, limit };
      if (searchTerm.trim()) params.searchTerm = searchTerm.trim();
      if (selectedCategory && selectedCategory !== "all") params.category = selectedCategory;
      if (selectedCity.trim()) params.city = selectedCity.trim();
      if (sortBy) params.sort = sortBy;

      const response = await serviceService.getServices(params);
      if (response.success) {
        const sData = response.data;
        const sList = Array.isArray(sData) ? sData : sData?.data || sData?.services || [];
        setServices(sList);
        const count = response.meta?.total || response.data?.total || sList.length;
        setTotalCount(count);
        setTotalPages(response.meta?.totalPage || Math.ceil(count / limit) || 1);
      } else {
        setServices([]);
        setTotalCount(0);
      }
    } catch (error: any) {
      console.error("Error fetching services:", error);
      toast.error("Failed to load services");
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedCity, sortBy, page]);

  useEffect(() => {
    fetchServices();

    const newParams = new URLSearchParams();
    if (searchTerm.trim()) newParams.set("q", searchTerm.trim());
    if (selectedCategory && selectedCategory !== "all") newParams.set("category", selectedCategory);
    if (selectedCity.trim()) newParams.set("city", selectedCity.trim());
    if (sortBy && sortBy !== "-createdAt") newParams.set("sort", sortBy);
    if (page > 1) newParams.set("page", String(page));

    const queryString = newParams.toString();
    router.replace(queryString ? `/listings?${queryString}` : `/listings`, { scroll: false });
  }, [fetchServices, searchTerm, selectedCategory, selectedCity, sortBy, page, router]);

  const handleReset = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedCity("");
    setSortBy("-createdAt");
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const hasActiveFilters = 
    searchTerm.trim() !== "" || 
    selectedCategory !== "all" || 
    selectedCity.trim() !== "" || 
    sortBy !== "-createdAt";

  return (
    <div className="flex flex-col gap-8 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
      {/* DISTINCT HERO HEADER & FILTER CARD SECTION */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-[#064E3B] to-[#0A5C36] text-white p-6 sm:p-8 lg:p-9 shadow-xl border border-emerald-800/40 space-y-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Title Header Row */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-emerald-800/60">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-200 uppercase tracking-widest mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Service Catalog</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Explore & Book Verified Services
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 font-medium mt-0.5">
              Discover verified local experts & book appointment slots
            </p>
          </div>
          
          <div className="text-xs sm:text-sm font-bold text-emerald-100 bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/15 backdrop-blur-md self-start md:self-auto shrink-0">
            Showing <span className="text-emerald-300 font-black">{totalCount}</span> {totalCount === 1 ? "service" : "services"}
          </div>
        </div>

        {/* Filter Controls Box (Inside Dark Card) */}
        <div className="relative z-10 bg-white/95 backdrop-blur-xl p-3.5 sm:p-4 rounded-2xl shadow-lg border border-white/80 text-slate-900">
          {/* Main Controls Row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Keyword Search */}
            <div className="sm:col-span-5 relative flex items-center">
              <Search className="absolute left-4 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search services (e.g. Cleaning, Repair)..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="h-13 pl-11 pr-8 text-xs sm:text-sm rounded-xl border-slate-200/90 bg-slate-50 focus:bg-white font-medium text-slate-900 placeholder:text-slate-400 shadow-xs"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Select Dropdown */}
            <div className="sm:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full h-13 px-3.5 rounded-xl border border-slate-200/90 bg-slate-50 focus:bg-white text-slate-800 text-xs sm:text-sm font-bold focus:outline-none cursor-pointer shadow-xs"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By Dropdown */}
            <div className="sm:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="w-full h-13 px-3.5 rounded-xl border border-slate-200/90 bg-slate-50 focus:bg-white text-slate-800 text-xs sm:text-sm font-bold focus:outline-none cursor-pointer shadow-xs"
              >
                <option value="-createdAt">Newest</option>
                <option value="-rating.averageRating">Top Rated</option>
                <option value="-bookingCount">Popular</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
              </select>
            </div>

            {/* City Input & Reset Filter */}
            <div className="sm:col-span-2 flex items-center gap-2">
              <div className="relative flex-1 flex items-center">
                <MapPin className="absolute left-3 w-3.5 h-3.5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="City"
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setPage(1);
                  }}
                  className="h-13 pl-8 pr-2 text-xs sm:text-sm rounded-xl border-slate-200/90 bg-slate-50 focus:bg-white font-medium text-slate-900 placeholder:text-slate-400 shadow-xs"
                />
              </div>
              {hasActiveFilters && (
                <button
                  onClick={handleReset}
                  title="Reset Filters"
                  className="h-13 w-13 rounded-xl bg-slate-100 text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-all cursor-pointer shrink-0 flex items-center justify-center shadow-xs"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES GRID (15 per page) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-80 bg-slate-100 rounded-2xl animate-pulse" />
          ))
        ) : services.length > 0 ? (
          services.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-slate-400 font-bold bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <Search className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No Services Found</h3>
            <p className="text-xs text-slate-500 font-medium">Try adjusting keywords or selecting a different category.</p>
            {hasActiveFilters && (
              <Button
                onClick={handleReset}
                variant="outline"
                className="mt-2 rounded-xl border-slate-200 text-xs font-bold cursor-pointer"
              >
                Reset Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-slate-200/60">
          <Button
            variant="outline"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="h-10 px-4 rounded-xl border-slate-200 text-slate-700 hover:text-[#0A5C36] hover:border-[#0A5C36] disabled:opacity-40 text-xs font-bold cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Prev
          </Button>

          <div className="flex items-center gap-1.5">
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              const isActive = page === pageNum;
              return (
                <Button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`h-10 w-10 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#0A5C36] text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-700 hover:border-[#0A5C36] hover:text-[#0A5C36]"
                  }`}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="h-10 px-4 rounded-xl border-slate-200 text-slate-700 hover:text-[#0A5C36] hover:border-[#0A5C36] disabled:opacity-40 text-xs font-bold cursor-pointer"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={
      <div className="py-20 text-center text-slate-500 font-bold text-sm">
        Loading services...
      </div>
    }>
      <ListingsContent />
    </Suspense>
  );
}
