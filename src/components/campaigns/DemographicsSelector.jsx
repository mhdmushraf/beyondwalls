import React from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ageGroups = [
  "18-24", "25-34", "35-44", "45-54", "55-64", "65+"
];

const interests = [
  "Fitness & Health", "Food & Dining", "Technology", "Fashion & Beauty",
  "Travel", "Entertainment", "Business", "Family & Kids", "Sports",
  "Luxury & Premium", "Eco-Friendly", "Gaming"
];

const incomelevels = [
  { value: "any", label: "Any Income Level" },
  { value: "budget", label: "Budget Conscious" },
  { value: "middle", label: "Middle Income" },
  { value: "affluent", label: "Affluent" },
  { value: "luxury", label: "High Net Worth" }
];

export default function DemographicsSelector({ demographics, onChange }) {
  const toggleAgeGroup = (age) => {
    const current = demographics.age_groups || [];
    const updated = current.includes(age)
      ? current.filter(a => a !== age)
      : [...current, age];
    onChange({ ...demographics, age_groups: updated });
  };

  const toggleInterest = (interest) => {
    const current = demographics.interests || [];
    const updated = current.includes(interest)
      ? current.filter(i => i !== interest)
      : [...current, interest];
    onChange({ ...demographics, interests: updated });
  };

  return (
    <div className="space-y-6">
      {/* Age Groups */}
      <div>
        <Label className="mb-3 block">Target Age Groups</Label>
        <div className="flex flex-wrap gap-2">
          {ageGroups.map((age) => (
            <Badge
              key={age}
              variant={demographics.age_groups?.includes(age) ? "default" : "outline"}
              className={`cursor-pointer px-3 py-1.5 ${
                demographics.age_groups?.includes(age)
                  ? "bg-violet-600 hover:bg-violet-700"
                  : "hover:bg-slate-100"
              }`}
              onClick={() => toggleAgeGroup(age)}
            >
              {age}
            </Badge>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {demographics.age_groups?.length > 0 
            ? `Selected: ${demographics.age_groups.join(", ")}`
            : "No selection = All age groups"}
        </p>
      </div>

      {/* Gender */}
      <div>
        <Label className="mb-3 block">Target Gender</Label>
        <div className="flex gap-2">
          {["all", "male", "female"].map((g) => (
            <Badge
              key={g}
              variant={demographics.gender === g ? "default" : "outline"}
              className={`cursor-pointer px-4 py-1.5 capitalize ${
                demographics.gender === g
                  ? "bg-violet-600 hover:bg-violet-700"
                  : "hover:bg-slate-100"
              }`}
              onClick={() => onChange({ ...demographics, gender: g })}
            >
              {g === "all" ? "All Genders" : g}
            </Badge>
          ))}
        </div>
      </div>

      {/* Income Level */}
      <div>
        <Label className="mb-3 block">Income Level</Label>
        <Select
          value={demographics.income_level || "any"}
          onValueChange={(v) => onChange({ ...demographics, income_level: v })}
        >
          <SelectTrigger className="w-full md:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {incomelevels.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Interests */}
      <div>
        <Label className="mb-3 block">Target Interests</Label>
        <div className="flex flex-wrap gap-2">
          {interests.map((interest) => (
            <Badge
              key={interest}
              variant={demographics.interests?.includes(interest) ? "default" : "outline"}
              className={`cursor-pointer px-3 py-1.5 ${
                demographics.interests?.includes(interest)
                  ? "bg-violet-600 hover:bg-violet-700"
                  : "hover:bg-slate-100"
              }`}
              onClick={() => toggleInterest(interest)}
            >
              {interest}
            </Badge>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {demographics.interests?.length > 0 
            ? `${demographics.interests.length} interests selected`
            : "Select interests to improve targeting"}
        </p>
      </div>
    </div>
  );
}