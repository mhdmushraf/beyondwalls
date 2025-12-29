import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Package, Search, Filter, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BundleCard from "@/components/bundles/BundleCard";

export default function CampaignBundles() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const { data: bundles = [], isLoading } = useQuery({
    queryKey: ['campaign-bundles'],
    queryFn: () => base44.entities.CampaignBundle.filter({ is_active: true })
  });

  const { data: venues = [] } = useQuery({
    queryKey: ['venues'],
    queryFn: () => base44.entities.Venue.list()
  });

  const filteredBundles = bundles.filter(bundle => {
    const matchesSearch = bundle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bundle.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || bundle.bundle_type === filterType;
    return matchesSearch && matchesType;
  });

  const featuredBundles = filteredBundles.filter(b => b.featured);
  const regularBundles = filteredBundles.filter(b => !b.featured);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-violet-600 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-500">Loading bundles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Campaign Bundles</h1>
              <p className="text-slate-500 text-sm sm:text-base">Pre-packaged screen bundles for maximum reach</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
            <div className="p-3 sm:p-4 bg-white rounded-xl border border-slate-200">
              <p className="text-xs sm:text-sm text-slate-500 mb-1">Available Bundles</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900">{bundles.length}</p>
            </div>
            <div className="p-3 sm:p-4 bg-white rounded-xl border border-slate-200">
              <p className="text-xs sm:text-sm text-slate-500 mb-1">Featured Deals</p>
              <p className="text-xl sm:text-2xl font-bold text-violet-600">{featuredBundles.length}</p>
            </div>
            <div className="p-3 sm:p-4 bg-white rounded-xl border border-slate-200">
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-500 mb-1">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                Avg Savings
              </div>
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                {bundles.length > 0 
                  ? Math.round(bundles.reduce((acc, b) => acc + (b.discount_percentage || 0), 0) / bundles.length)
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search bundles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="health_fitness">Health & Fitness</SelectItem>
              <SelectItem value="coffee_cafes">Coffee & Cafés</SelectItem>
              <SelectItem value="mall_shopping">Mall Shopping</SelectItem>
              <SelectItem value="business_district">Business District</SelectItem>
              <SelectItem value="weekend_special">Weekend Special</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Featured Bundles */}
        {featuredBundles.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">⭐ Featured Bundles</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {featuredBundles.map(bundle => {
                const bundleVenues = venues.filter(v => 
                  bundle.screen_ids?.some(screenId => 
                    v.id === screenId.split('_')[0]
                  )
                );
                return <BundleCard key={bundle.id} bundle={bundle} venues={bundleVenues} />;
              })}
            </div>
          </div>
        )}

        {/* All Bundles */}
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">All Bundles</h2>
          {regularBundles.length === 0 ? (
            <div className="text-center py-8 sm:py-12 bg-white rounded-xl border border-slate-200">
              <Package className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm sm:text-base">No bundles found</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {regularBundles.map(bundle => {
                const bundleVenues = venues.filter(v => 
                  bundle.screen_ids?.some(screenId => 
                    v.id === screenId.split('_')[0]
                  )
                );
                return <BundleCard key={bundle.id} bundle={bundle} venues={bundleVenues} />;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}