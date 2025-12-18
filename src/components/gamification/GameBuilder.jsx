import React, { useState } from "react";
import { Gamepad2, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function GameBuilder({ gameConfig, onChange }) {
  const [prizes, setPrizes] = useState(gameConfig?.prizes || []);

  const addPrize = () => {
    const newPrizes = [...prizes, { label: "", probability: 10, coupon_code: "" }];
    setPrizes(newPrizes);
    onChange({ ...gameConfig, prizes: newPrizes });
  };

  const removePrize = (index) => {
    const newPrizes = prizes.filter((_, i) => i !== index);
    setPrizes(newPrizes);
    onChange({ ...gameConfig, prizes: newPrizes });
  };

  const updatePrize = (index, field, value) => {
    const newPrizes = [...prizes];
    newPrizes[index] = { ...newPrizes[index], [field]: value };
    setPrizes(newPrizes);
    onChange({ ...gameConfig, prizes: newPrizes });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gamepad2 className="w-5 h-5" />
          Game Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Game Type</Label>
          <Select
            value={gameConfig?.game_type || "spin_wheel"}
            onValueChange={(value) => onChange({ ...gameConfig, game_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spin_wheel">Spin the Wheel</SelectItem>
              <SelectItem value="scratch_card">Scratch Card</SelectItem>
              <SelectItem value="quiz">Quiz</SelectItem>
              <SelectItem value="poll">Poll</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {gameConfig?.game_type === "quiz" && (
          <>
            <div>
              <Label>Question</Label>
              <Textarea
                placeholder="What is your favorite product?"
                value={gameConfig?.question || ""}
                onChange={(e) => onChange({ ...gameConfig, question: e.target.value })}
              />
            </div>
            <div>
              <Label>Options (comma-separated)</Label>
              <Input
                placeholder="Option A, Option B, Option C"
                value={gameConfig?.options?.join(", ") || ""}
                onChange={(e) => onChange({ ...gameConfig, options: e.target.value.split(",").map(s => s.trim()) })}
              />
            </div>
            <div>
              <Label>Correct Answer</Label>
              <Input
                placeholder="Option A"
                value={gameConfig?.correct_answer || ""}
                onChange={(e) => onChange({ ...gameConfig, correct_answer: e.target.value })}
              />
            </div>
          </>
        )}

        <div>
          <div className="flex items-center justify-between mb-3">
            <Label>Prizes / Rewards</Label>
            <Button size="sm" variant="outline" onClick={addPrize}>
              <Plus className="w-4 h-4 mr-1" />
              Add Prize
            </Button>
          </div>
          <div className="space-y-3">
            {prizes.map((prize, index) => (
              <div key={index} className="p-3 bg-slate-50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Prize {index + 1}</span>
                  <Button size="sm" variant="ghost" onClick={() => removePrize(index)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
                <Input
                  placeholder="Prize label (e.g., 10% off)"
                  value={prize.label}
                  onChange={(e) => updatePrize(index, "label", e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Win probability %"
                  value={prize.probability}
                  onChange={(e) => updatePrize(index, "probability", parseFloat(e.target.value))}
                />
                <Input
                  placeholder="Coupon code"
                  value={prize.coupon_code}
                  onChange={(e) => updatePrize(index, "coupon_code", e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 bg-violet-50 rounded-lg">
          <p className="text-sm text-violet-900">
            💡 Tip: Games can increase QR scan rates by up to 3x!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}