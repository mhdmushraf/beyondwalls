import React from "react";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const FEATURE_TIPS = {
  users: {
    title: "User Management",
    description: "View all registered users, manage wallet balances, and configure admin permissions. Use filters to find specific users."
  },
  userApprovals: {
    title: "User Approvals",
    description: "Review new user registrations. Check Emirates ID and Trade License documents before approving. Rejected users receive email notifications."
  },
  venues: {
    title: "Venue Management",
    description: "Venues are physical locations with advertising screens. Approve venues to allow them to register screens. Each venue can have multiple screens."
  },
  screens: {
    title: "Screen Management",
    description: "Screens display advertisements. Approve screens to generate setup codes. Monitor online/offline status and view live previews of running ads."
  },
  bookings: {
    title: "Ad Bookings",
    description: "Advertisers book slots on screens. Review creative content before approval. Revenue is split 70% to venue owner, 30% to platform."
  },
  campaigns: {
    title: "Campaign Management",
    description: "Campaigns are collections of bookings. Track performance metrics, impressions, and spending across all advertiser campaigns."
  },
  wallet: {
    title: "Wallet System",
    description: "Users top up their wallets to pay for ads. Venue owners receive earnings in their wallets. Process withdrawals and track all transactions."
  },
  walletRequests: {
    title: "Wallet Requests",
    description: "Process top-up and withdrawal requests. Verify bank transfer receipts before approving top-ups. Withdrawals require manual bank transfers."
  },
  transactions: {
    title: "Transactions",
    description: "View all financial transactions including top-ups, ad spending, earnings, and withdrawals. Filter by user or transaction type."
  },
  pricing: {
    title: "Dynamic Pricing",
    description: "Configure pricing rules based on time, demand, and seasons. Prices automatically adjust to maximize revenue during peak times."
  },
  platformWallet: {
    title: "Platform Revenue",
    description: "Track platform earnings from the 30% commission on all bookings. Monitor total revenue and tax collected."
  },
  blog: {
    title: "Blog Management",
    description: "Create and publish blog posts for SEO and marketing. Posts can be featured in newsletters and shared on social media."
  },
  crm: {
    title: "CRM & Newsletter",
    description: "Manage leads and newsletter subscribers. Configure auto-newsletters with AI-generated content. Track subscriber growth."
  },
  newsletter: {
    title: "Newsletter",
    description: "Send daily/weekly newsletters to subscribers. Use AI to generate content ideas. Include featured offers and new feature announcements."
  }
};

export default function FeatureTooltip({ feature, children }) {
  const tip = FEATURE_TIPS[feature];
  
  if (!tip) return children;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 cursor-help">
            {children}
            <HelpCircle className="w-4 h-4 text-slate-400" />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-3">
          <p className="font-semibold text-slate-900 mb-1">{tip.title}</p>
          <p className="text-xs text-slate-600">{tip.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}