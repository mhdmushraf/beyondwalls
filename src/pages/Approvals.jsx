import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { WorkspaceSkeleton } from '@/components/workspace/Skeletons';
import NotAuthorised from '@/components/admin/NotAuthorised';
import ScreensApprovalTab from '@/components/admin/ScreensApprovalTab';
import VenuesApprovalTab from '@/components/admin/VenuesApprovalTab';
import BookingsApprovalTab from '@/components/admin/BookingsApprovalTab';
import PayoutsApprovalTab from '@/components/admin/PayoutsApprovalTab';

export default function Approvals() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ screens: 0, venues: 0, bookings: 0, payouts: 0 });

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
      } catch (e) {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const refreshCounts = async () => {
    try {
      const [screens, venues, bookings, payouts] = await Promise.all([
        base44.entities.Screen.filter({ approval_status: 'pending' }, null, 500, 0),
        base44.entities.Venue.filter({ status: 'pending' }, null, 500, 0),
        base44.entities.AdBooking.filter({ status: 'pending_payment' }, null, 500, 0),
        base44.entities.PayoutRequest.filter({ status: { $in: ['pending', 'approved'] } }, null, 500, 0),
      ]);
      setCounts({
        screens: screens.length,
        venues: venues.length,
        bookings: bookings.length,
        payouts: payouts.length,
      });
    } catch (e) {
      // silent
    }
  };

  useEffect(() => {
    if (user && (user.user_role === 'admin' || user.role === 'admin')) {
      refreshCounts();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <WorkspaceSkeleton />;

  const isAdmin = user?.user_role === 'admin' || user?.role === 'admin';
  if (!isAdmin) return <NotAuthorised />;

  const badge = (n) => (
    <Badge className="bg-slate-200 text-slate-700 ml-2">{n}</Badge>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <h1 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">Approvals</h1>
      <Tabs defaultValue="screens">
        <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full">
          <TabsTrigger value="screens">Screens{badge(counts.screens)}</TabsTrigger>
          <TabsTrigger value="venues">Venues{badge(counts.venues)}</TabsTrigger>
          <TabsTrigger value="bookings">Bookings{badge(counts.bookings)}</TabsTrigger>
          <TabsTrigger value="payouts">Payouts{badge(counts.payouts)}</TabsTrigger>
        </TabsList>
        <TabsContent value="screens" className="mt-4"><ScreensApprovalTab onActionComplete={refreshCounts} /></TabsContent>
        <TabsContent value="venues" className="mt-4"><VenuesApprovalTab onActionComplete={refreshCounts} /></TabsContent>
        <TabsContent value="bookings" className="mt-4"><BookingsApprovalTab onActionComplete={refreshCounts} /></TabsContent>
        <TabsContent value="payouts" className="mt-4"><PayoutsApprovalTab onActionComplete={refreshCounts} /></TabsContent>
      </Tabs>
    </div>
  );
}