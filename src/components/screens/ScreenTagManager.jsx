import React, { useState } from "react";
import { Tag, X, Plus, Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const TAG_COLORS = [
  { name: "violet", bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-200" },
  { name: "blue", bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  { name: "emerald", bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  { name: "amber", bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  { name: "rose", bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200" },
  { name: "cyan", bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-200" },
];

export function getTagColor(tag) {
  const hash = tag.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
  return TAG_COLORS[hash % TAG_COLORS.length];
}

export default function ScreenTagManager({ 
  screens, 
  allTags, 
  onUpdateTags, 
  onCreateTag,
  selectedScreen,
  open,
  onOpenChange 
}) {
  const [newTag, setNewTag] = useState("");
  const [screenTags, setScreenTags] = useState(selectedScreen?.tags || []);

  React.useEffect(() => {
    setScreenTags(selectedScreen?.tags || []);
  }, [selectedScreen]);

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    const tag = newTag.trim().toLowerCase();
    if (!screenTags.includes(tag)) {
      const updated = [...screenTags, tag];
      setScreenTags(updated);
      if (!allTags.includes(tag)) {
        onCreateTag(tag);
      }
    }
    setNewTag("");
  };

  const handleRemoveTag = (tag) => {
    setScreenTags(screenTags.filter(t => t !== tag));
  };

  const handleSave = async () => {
    await onUpdateTags(selectedScreen.id, screenTags);
    toast.success("Tags updated");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-violet-600" />
            Manage Tags - {selectedScreen?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Tags */}
          <div>
            <p className="text-sm text-slate-500 mb-2">Current Tags</p>
            <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-slate-50 rounded-lg">
              {screenTags.length === 0 ? (
                <span className="text-sm text-slate-400">No tags assigned</span>
              ) : (
                screenTags.map((tag) => {
                  const color = getTagColor(tag);
                  return (
                    <Badge 
                      key={tag} 
                      className={`${color.bg} ${color.text} ${color.border} border flex items-center gap-1`}
                    >
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:opacity-70">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  );
                })
              )}
            </div>
          </div>

          {/* Add New Tag */}
          <div>
            <p className="text-sm text-slate-500 mb-2">Add Tag</p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter tag name..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              />
              <Button onClick={handleAddTag} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Existing Tags */}
          {allTags.length > 0 && (
            <div>
              <p className="text-sm text-slate-500 mb-2">Quick Add</p>
              <div className="flex flex-wrap gap-2">
                {allTags.filter(t => !screenTags.includes(t)).map((tag) => {
                  const color = getTagColor(tag);
                  return (
                    <Badge 
                      key={tag} 
                      className={`${color.bg} ${color.text} ${color.border} border cursor-pointer hover:opacity-80`}
                      onClick={() => setScreenTags([...screenTags, tag])}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-violet-600 to-indigo-600">
            <Check className="w-4 h-4 mr-2" />
            Save Tags
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}