import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  ShoppingCart,
  Trash2,
  MonitorPlay,
  MapPin,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { toast } from "sonner";

export default function BookingCart({
  cartItems,
  onRemoveItem,
  onUpdateItem,
  onClearCart,
  onCheckout,
  venues,
  screens,
  userBalance,
  isOpen,
  onOpenChange
}) {
  const [checking, setChecking] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState({});

  const totalCost = cartItems.reduce((sum, item) => sum + (item.totalCost || 0), 0);
  const hasInsufficientBalance = totalCost > (userBalance || 0);

  // Check availability for all cart items
  const checkAllAvailability = async () => {
    setChecking(true);
    const newStatus = {};

    for (const item of cartItems) {
      try {
        const bookings = await base44.entities.AdSlotBooking.filter({
          screen_id: item.screenId,
          status: "active"
        });
        
        const isSlotTaken = bookings.some(b => b.slot_number === item.slotNumber);
        
        const screenData = await base44.entities.Screen.filter({ id: item.screenId });
        const isScreenOnline = screenData.length > 0 && screenData[0].status === "online";

        newStatus[item.id] = {
          available: !isSlotTaken && isScreenOnline,
          reason: isSlotTaken ? "Slot already booked" : !isScreenOnline ? "Screen offline" : null
        };
      } catch (error) {
        newStatus[item.id] = { available: false, reason: "Failed to check" };
      }
    }

    setAvailabilityStatus(newStatus);
    setChecking(false);

    const unavailableCount = Object.values(newStatus).filter(s => !s.available).length;
    if (unavailableCount > 0) {
      toast.error(`${unavailableCount} item(s) no longer available`);
    } else if (cartItems.length > 0) {
      toast.success("All slots are available!");
    }
  };

  useEffect(() => {
    if (isOpen && cartItems.length > 0) {
      checkAllAvailability();
    }
  }, [isOpen, cartItems.length]);

  const getScreenInfo = (screenId) => screens.find(s => s.id === screenId);
  const getVenueInfo = (venueId) => venues.find(v => v.id === venueId);

  const allAvailable = cartItems.length > 0 && 
    cartItems.every(item => availabilityStatus[item.id]?.available !== false);

  const handleCheckout = () => {
    if (!allAvailable) {
      toast.error("Please remove unavailable items before checkout");
      return;
    }
    if (hasInsufficientBalance) {
      toast.error("Insufficient wallet balance");
      return;
    }
    onCheckout();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <ShoppingCart className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Cart</span>
          {cartItems.length > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-violet-600 text-[10px]">
              {cartItems.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-[420px] flex flex-col" side="right">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Booking Cart ({cartItems.length})
            </span>
            {cartItems.length > 0 && (
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={checkAllAvailability}
                  disabled={checking}
                >
                  {checking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </Button>
                <Button variant="ghost" size="sm" onClick={onClearCart} className="text-rose-600">
                  Clear All
                </Button>
              </div>
            )}
          </SheetTitle>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">Your cart is empty</p>
              <p className="text-sm text-slate-400 mt-1">Add screens to start booking</p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-3 py-4">
                {cartItems.map((item) => {
                  const screen = getScreenInfo(item.screenId);
                  const venue = screen ? getVenueInfo(screen.venue_id) : null;
                  const status = availabilityStatus[item.id];
                  const isUnavailable = status?.available === false;

                  return (
                    <Card 
                      key={item.id} 
                      className={`relative ${isUnavailable ? "border-rose-300 bg-rose-50" : ""}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isUnavailable ? "bg-rose-100" : "bg-violet-100"
                          }`}>
                            <MonitorPlay className={`w-5 h-5 ${isUnavailable ? "text-rose-600" : "text-violet-600"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-slate-900 truncate">{screen?.name}</h4>
                                <p className="text-xs text-slate-500 truncate">{venue?.name}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-slate-400 hover:text-rose-600"
                                onClick={() => onRemoveItem(item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500">
                              <Badge variant="outline" className="text-xs">
                                Slot {item.slotNumber}
                              </Badge>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {venue?.city}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                              <Calendar className="w-3 h-3" />
                              <span>{format(new Date(item.startDate), "MMM d")} - {format(new Date(item.endDate), "MMM d, yyyy")}</span>
                            </div>

                            <div className="flex items-center justify-between mt-3">
                              <span className="font-bold text-violet-600">
                                AED {item.totalCost?.toLocaleString()}
                              </span>
                              {status && (
                                <div className="flex items-center gap-1">
                                  {status.available ? (
                                    <span className="flex items-center gap-1 text-xs text-emerald-600">
                                      <CheckCircle2 className="w-3 h-3" />
                                      Available
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1 text-xs text-rose-600">
                                      <AlertCircle className="w-3 h-3" />
                                      {status.reason}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="border-t pt-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal ({cartItems.length} items)</span>
                  <span className="font-medium">AED {totalCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Wallet Balance</span>
                  <span className={hasInsufficientBalance ? "text-rose-600 font-medium" : "text-emerald-600 font-medium"}>
                    AED {(userBalance || 0).toLocaleString()}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-violet-600">AED {totalCost.toLocaleString()}</span>
                </div>
              </div>

              {hasInsufficientBalance && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <p className="text-xs text-rose-700">
                    Insufficient balance. Please top up AED {(totalCost - (userBalance || 0)).toLocaleString()}
                  </p>
                </div>
              )}

              <Button
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600"
                size="lg"
                onClick={handleCheckout}
                disabled={checking || !allAvailable || hasInsufficientBalance || cartItems.length === 0}
              >
                {checking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking availability...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Checkout ({cartItems.length} bookings)
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}