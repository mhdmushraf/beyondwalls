import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, TrendingUp, Target, Clock, DollarSign, 
  PlayCircle, PauseCircle, Trophy, Activity 
} from "lucide-react";
import { toast } from "sonner";

export default function ProgrammaticBidding() {
  const [user, setUser] = useState(null);
  const [showBidForm, setShowBidForm] = useState(false);
  const [bidData, setBidData] = useState({
    screen_id: "",
    campaign_id: "",
    bid_amount: 0.05,
    max_daily_spend: 100,
    auto_optimize: true,
    target_audience: {
      age_groups: [],
      interests: [],
      purchase_intent: "medium"
    },
    time_slot: {
      start_time: "09:00",
      end_time: "21:00",
      days_of_week: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    }
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const { data: screens = [] } = useQuery({
    queryKey: ["screens"],
    queryFn: () => base44.entities.Screen.list()
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ["my-campaigns", user?.email],
    queryFn: () => base44.entities.Campaign.filter({ advertiser_id: user?.email }),
    enabled: !!user
  });

  const { data: myBids = [] } = useQuery({
    queryKey: ["my-bids", user?.email],
    queryFn: () => base44.entities.AdBid.filter({ advertiser_id: user?.email }),
    enabled: !!user
  });

  const { data: venues = [] } = useQuery({
    queryKey: ["venues"],
    queryFn: () => base44.entities.Venue.list()
  });

  // Create bid
  const createBidMutation = useMutation({
    mutationFn: (data) => base44.entities.AdBid.create({
      advertiser_id: user?.email,
      ...data
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bids"] });
      setShowBidForm(false);
      setBidData({
        screen_id: "",
        campaign_id: "",
        bid_amount: 0.05,
        max_daily_spend: 100,
        auto_optimize: true,
        target_audience: {
          age_groups: [],
          interests: [],
          purchase_intent: "medium"
        },
        time_slot: {
          start_time: "09:00",
          end_time: "21:00",
          days_of_week: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        }
      });
      toast.success("Bid created successfully!");
    }
  });

  // Update bid status
  const updateBidStatusMutation = useMutation({
    mutationFn: ({ bidId, status }) => base44.entities.AdBid.update(bidId, { bid_status: status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bids"] });
      toast.success("Bid status updated!");
    }
  });

  const activeBids = myBids.filter(b => b.bid_status === "active");
  const wonBids = myBids.filter(b => b.bid_status === "won");
  const totalSpend = myBids.reduce((sum, b) => sum + (b.total_spend || 0), 0);
  const totalImpressions = myBids.reduce((sum, b) => sum + (b.impressions_delivered || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-8 h-8 text-violet-600" />
              Programmatic Bidding
            </h1>
            <p className="text-slate-600 mt-1">Real-time bidding for premium ad inventory</p>
          </div>
          <Button
            onClick={() => setShowBidForm(!showBidForm)}
            className="bg-gradient-to-r from-violet-600 to-indigo-600"
          >
            <Target className="w-4 h-4 mr-2" />
            Create New Bid
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-600">Active Bids</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-violet-600">{activeBids.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-600">Won Bids</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{wonBids.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-600">Total Impressions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-600">Total Spend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">AED {totalSpend.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Bid Form */}
        {showBidForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create Programmatic Bid</CardTitle>
              <CardDescription>Set your bid parameters for automated ad placement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Select Campaign</Label>
                  <select
                    className="w-full p-2 border rounded-lg"
                    value={bidData.campaign_id}
                    onChange={(e) => setBidData({ ...bidData, campaign_id: e.target.value })}
                  >
                    <option value="">Choose campaign...</option>
                    {campaigns.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Target Screen</Label>
                  <select
                    className="w-full p-2 border rounded-lg"
                    value={bidData.screen_id}
                    onChange={(e) => setBidData({ ...bidData, screen_id: e.target.value })}
                  >
                    <option value="">Choose screen...</option>
                    {screens.map(s => {
                      const venue = venues.find(v => v.id === s.venue_id);
                      return (
                        <option key={s.id} value={s.id}>
                          {s.name} - {venue?.name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <Label>Bid Amount (AED per impression)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={bidData.bid_amount}
                    onChange={(e) => setBidData({ ...bidData, bid_amount: parseFloat(e.target.value) })}
                  />
                  <p className="text-xs text-slate-600 mt-1">Recommended: AED 0.05 - 0.15</p>
                </div>

                <div>
                  <Label>Max Daily Spend (AED)</Label>
                  <Input
                    type="number"
                    value={bidData.max_daily_spend}
                    onChange={(e) => setBidData({ ...bidData, max_daily_spend: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label>Target Audience - Age Groups</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["18-25", "26-35", "36-45", "46+"].map(age => (
                    <Badge
                      key={age}
                      className={`cursor-pointer ${
                        bidData.target_audience.age_groups.includes(age)
                          ? "bg-violet-600"
                          : "bg-slate-300"
                      }`}
                      onClick={() => {
                        const ages = bidData.target_audience.age_groups.includes(age)
                          ? bidData.target_audience.age_groups.filter(a => a !== age)
                          : [...bidData.target_audience.age_groups, age];
                        setBidData({
                          ...bidData,
                          target_audience: { ...bidData.target_audience, age_groups: ages }
                        });
                      }}
                    >
                      {age}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Purchase Intent</Label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={bidData.target_audience.purchase_intent}
                  onChange={(e) => setBidData({
                    ...bidData,
                    target_audience: { ...bidData.target_audience, purchase_intent: e.target.value }
                  })}
                >
                  <option value="low">Low Intent</option>
                  <option value="medium">Medium Intent</option>
                  <option value="high">High Intent (Premium)</option>
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={bidData.time_slot.start_time}
                    onChange={(e) => setBidData({
                      ...bidData,
                      time_slot: { ...bidData.time_slot, start_time: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={bidData.time_slot.end_time}
                    onChange={(e) => setBidData({
                      ...bidData,
                      time_slot: { ...bidData.time_slot, end_time: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <Label className="font-semibold">Enable AI Auto-Optimization</Label>
                  <p className="text-xs text-slate-600">AI will adjust bids based on performance</p>
                </div>
                <Switch
                  checked={bidData.auto_optimize}
                  onCheckedChange={(checked) => setBidData({ ...bidData, auto_optimize: checked })}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => createBidMutation.mutate(bidData)}
                  disabled={!bidData.screen_id || !bidData.campaign_id || createBidMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600"
                >
                  Create Bid
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowBidForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bids List */}
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">
              <Activity className="w-4 h-4 mr-2" />
              Active ({activeBids.length})
            </TabsTrigger>
            <TabsTrigger value="won">
              <Trophy className="w-4 h-4 mr-2" />
              Won ({wonBids.length})
            </TabsTrigger>
            <TabsTrigger value="all">All Bids</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4 mt-6">
            {activeBids.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-slate-600">
                  No active bids. Create your first programmatic bid to get started!
                </CardContent>
              </Card>
            ) : (
              activeBids.map((bid) => {
                const screen = screens.find(s => s.id === bid.screen_id);
                const venue = venues.find(v => v.id === screen?.venue_id);
                const campaign = campaigns.find(c => c.id === bid.campaign_id);

                return (
                  <Card key={bid.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{campaign?.name}</CardTitle>
                          <p className="text-sm text-slate-600">
                            {screen?.name} at {venue?.name}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className="bg-green-600">
                            <Activity className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                          {bid.auto_optimize && (
                            <Badge className="bg-violet-600">AI Optimizing</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-4 gap-4">
                        <div>
                          <Label className="text-xs text-slate-600">Bid Amount</Label>
                          <p className="font-semibold">AED {bid.bid_amount}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-600">Daily Budget</Label>
                          <p className="font-semibold">AED {bid.max_daily_spend}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-600">Impressions</Label>
                          <p className="font-semibold">{(bid.impressions_delivered || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-600">Spend</Label>
                          <p className="font-semibold text-orange-600">AED {(bid.total_spend || 0).toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateBidStatusMutation.mutate({ bidId: bid.id, status: "expired" })}
                        >
                          <PauseCircle className="w-4 h-4 mr-1" />
                          Pause Bid
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="won" className="space-y-4 mt-6">
            {wonBids.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-slate-600">
                  No won bids yet. Keep bidding!
                </CardContent>
              </Card>
            ) : (
              wonBids.map((bid) => {
                const screen = screens.find(s => s.id === bid.screen_id);
                const venue = venues.find(v => v.id === screen?.venue_id);
                const campaign = campaigns.find(c => c.id === bid.campaign_id);

                return (
                  <Card key={bid.id} className="border-l-4 border-green-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{campaign?.name}</CardTitle>
                          <p className="text-sm text-slate-600">
                            {screen?.name} at {venue?.name}
                          </p>
                        </div>
                        <Badge className="bg-green-600">
                          <Trophy className="w-3 h-3 mr-1" />
                          Won
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-xs text-slate-600">Winning Bid</Label>
                          <p className="font-semibold">AED {bid.bid_amount}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-600">Impressions Delivered</Label>
                          <p className="font-semibold">{(bid.impressions_delivered || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-600">Total Spend</Label>
                          <p className="font-semibold text-orange-600">AED {(bid.total_spend || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4 mt-6">
            {myBids.map((bid) => {
              const screen = screens.find(s => s.id === bid.screen_id);
              const venue = venues.find(v => v.id === screen?.venue_id);
              const campaign = campaigns.find(c => c.id === bid.campaign_id);

              return (
                <Card key={bid.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{campaign?.name}</CardTitle>
                        <p className="text-sm text-slate-600">{screen?.name}</p>
                      </div>
                      <Badge className={
                        bid.bid_status === "won" ? "bg-green-600" :
                        bid.bid_status === "active" ? "bg-blue-600" :
                        bid.bid_status === "lost" ? "bg-red-600" :
                        "bg-slate-600"
                      }>
                        {bid.bid_status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span>Bid: AED {bid.bid_amount}</span>
                      <span>Impressions: {(bid.impressions_delivered || 0).toLocaleString()}</span>
                      <span>Spend: AED {(bid.total_spend || 0).toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}