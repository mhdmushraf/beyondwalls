import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  MessageCircle,
  Send,
  Loader2,
  Trash2,
  CheckCircle,
  XCircle,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function CommentSection({ postId }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    author_name: "",
    author_email: "",
    content: ""
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setIsAdmin(userData.role === "admin");
      setFormData(prev => ({
        ...prev,
        author_name: userData.full_name || "",
        author_email: userData.email || ""
      }));
    } catch (e) {
      // Not logged in
    }
  };

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["blog-comments", postId],
    queryFn: async () => {
      const allComments = await base44.entities.BlogComment.filter({ post_id: postId }, "-created_date");
      // Non-admins only see approved comments
      if (isAdmin) return allComments;
      return allComments.filter(c => c.status === "approved");
    },
    enabled: !!postId
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.author_name.trim() || !formData.content.trim()) {
      toast.error("Please fill in your name and comment");
      return;
    }

    setSubmitting(true);
    try {
      await base44.entities.BlogComment.create({
        post_id: postId,
        author_name: formData.author_name.trim(),
        author_email: formData.author_email.trim(),
        content: formData.content.trim(),
        status: "approved"
      });
      setFormData(prev => ({ ...prev, content: "" }));
      queryClient.invalidateQueries({ queryKey: ["blog-comments", postId] });
      toast.success("Comment posted!");
    } catch (error) {
      toast.error("Failed to post comment");
    }
    setSubmitting(false);
  };

  const handleModerate = async (commentId, status) => {
    try {
      if (status === "delete") {
        await base44.entities.BlogComment.delete(commentId);
        toast.success("Comment deleted");
      } else {
        await base44.entities.BlogComment.update(commentId, { status });
        toast.success(`Comment ${status}`);
      }
      queryClient.invalidateQueries({ queryKey: ["blog-comments", postId] });
    } catch (error) {
      toast.error("Failed to update comment");
    }
  };

  const approvedComments = comments.filter(c => c.status === "approved");
  const pendingComments = comments.filter(c => c.status === "pending");

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-violet-600" />
          Comments ({approvedComments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pb-6 border-b">
          {!user && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Your name *"
                value={formData.author_name}
                onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
              />
              <Input
                type="email"
                placeholder="Your email (optional)"
                value={formData.author_email}
                onChange={(e) => setFormData({ ...formData, author_email: e.target.value })}
              />
            </div>
          )}
          <Textarea
            placeholder="Write a comment..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={3}
          />
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={submitting}
              className="bg-gradient-to-r from-violet-600 to-indigo-600"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Post Comment
            </Button>
          </div>
        </form>

        {/* Admin: Pending Comments */}
        {isAdmin && pendingComments.length > 0 && (
          <div className="space-y-3 pb-4 border-b">
            <p className="text-sm font-medium text-amber-600">Pending Approval ({pendingComments.length})</p>
            {pendingComments.map((comment) => (
              <div key={comment.id} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-amber-200 text-amber-700 text-sm">
                        {comment.author_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{comment.author_name}</p>
                      <p className="text-slate-600 text-sm mt-1">{comment.content}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600" onClick={() => handleModerate(comment.id, "approved")}>
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-600" onClick={() => handleModerate(comment.id, "delete")}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Comments List */}
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 text-violet-600 animate-spin mx-auto" />
          </div>
        ) : approvedComments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500">No comments yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {approvedComments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-violet-100 text-violet-600">
                    {comment.author_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900">{comment.author_name}</p>
                    <span className="text-xs text-slate-400">
                      {formatDistanceToNow(new Date(comment.created_date), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1">{comment.content}</p>
                </div>
                {isAdmin && (
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 text-slate-400 hover:text-rose-600"
                    onClick={() => handleModerate(comment.id, "delete")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}