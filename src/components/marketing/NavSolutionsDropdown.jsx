import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronDown } from "lucide-react";

const SOLUTIONS = [
  { name: "Café Screen Advertising", page: "CafeScreenAdvertisingDubai" },
  { name: "Gym & Fitness Screens", page: "GymScreenAdvertisingDubai" },
  { name: "Co-Working Spaces", page: "CoworkingSpaceAdvertisingDubai" },
  { name: "Clinics & Healthcare", page: "ClinicScreenAdvertisingDubai" },
  { name: "Monetize Your Screens", page: "MonetizeYourScreensDubai" },
  { name: "DOOH Marketplace", page: "DOOHAdvertisingMarketplaceDubai" },
];

export default function NavSolutionsDropdown({ onNavigate }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="font-medium text-sm text-slate-600 hover:text-violet-600 flex items-center gap-1 whitespace-nowrap">
        Solutions
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-60 bg-white rounded-lg shadow-xl border border-slate-100 py-2 z-50">
          {SOLUTIONS.map(s => (
            <Link
              key={s.page}
              to={createPageUrl(s.page)}
              onClick={() => { setOpen(false); onNavigate?.(); }}
              className="block px-4 py-2.5 text-sm text-slate-600 hover:bg-violet-50 hover:text-violet-600 transition-colors"
            >
              {s.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}