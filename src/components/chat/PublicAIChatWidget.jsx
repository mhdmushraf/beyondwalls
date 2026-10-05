import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { 
  MessageCircle, 
  X, 
  Send, 
  Loader2, 
  Bot, 
  User,
  Sparkles,
  MinusCircle,
  Maximize2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

export default function PublicAIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi there! 👋 I'm BeyondWalls AI assistant. I can help you with:\n\n• Understanding our advertising platform\n• Pricing and packages\n• How to get started\n• Venue partnerships\n• Technical questions\n\nHow can I help you today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are BeyondWalls AI Assistant, a helpful and friendly assistant for BeyondWalls - UAE's leading Digital Out-of-Home (DOOH) advertising platform.

About BeyondWalls:
- Self-serve DOOH advertising platform
- Screens across cafés, malls, gyms, and coworking spaces in UAE
- Advertisers can book screens starting from AED 50/week per slot
- Venues earn 70% revenue share
- Real-time analytics and reporting
- AI-powered campaign optimization
- Quick approval process (within 2-4 hours)
- Premium venues only - restaurants, malls, gyms, coworking spaces

Key Features for Advertisers:
- Book ad slots on digital screens across UAE
- Target by location, venue type, and time slot
- Upload image or video creatives
- Track campaign performance in real-time
- AI-powered recommendations

Key Features for Venue Owners:
- Easy screen registration
- 70% revenue share on all ads
- Control which ads appear on your screens
- Reserve slots for your own promotions
- Weekly payouts

Contact: info@linkzoneglobal.com | +971 55 614 0067

The user is asking: "${userMessage}"

Provide a helpful, concise, and friendly response. If they ask about pricing, mention that slot prices vary by venue (starting from AED 50/week) and encourage them to explore the platform. For complex inquiries, suggest contacting the team. Keep responses under 150 words unless detailed explanation is needed. Use bullet points for lists. Be conversational and helpful.`,
        add_context_from_internet: false
      });

      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I apologize, but I'm having trouble processing your request right now. Please try again or contact us directly at info@linkzoneglobal.com or +971 55 614 0067." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    "How much does advertising cost?",
    "How do I become a venue partner?",
    "What screen sizes are available?",
    "How does targeting work?"
  ];

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full shadow-lg shadow-violet-500/30 flex items-center justify-center hover:scale-105 transition-transform"
        >
          <MessageCircle className="w-6 h-6 text-white" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={cn(
            "fixed z-50 bg-white rounded-2xl shadow-2xl transition-all duration-300 flex flex-col",
            isMinimized 
              ? "bottom-6 right-6 w-72 h-14" 
              : "bottom-6 right-6 w-96 h-[600px] max-h-[80vh]"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              {!isMinimized && (
                <div>
                  <h3 className="font-semibold text-white">BeyondWalls AI</h3>
                  <p className="text-xs text-violet-200">Always here to help</p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4 text-white" />
                ) : (
                  <MinusCircle className="w-4 h-4 text-white" />
                )}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "flex gap-3",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-violet-600" />
                      </div>
                    )}
                    <div 
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2.5",
                        msg.role === "user" 
                          ? "bg-violet-600 text-white rounded-br-md" 
                          : "bg-slate-100 text-slate-800 rounded-bl-md"
                      )}
                    >
                      {msg.role === "assistant" ? (
                        <ReactMarkdown 
                          className="text-sm prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                          components={{
                            p: ({ children }) => <p className="my-1">{children}</p>,
                            ul: ({ children }) => <ul className="my-1 ml-4 list-disc">{children}</ul>,
                            li: ({ children }) => <li className="my-0.5">{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        <p className="text-sm">{msg.content}</p>
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-violet-600" />
                    </div>
                    <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Questions */}
              {messages.length === 1 && (
                <div className="px-4 pb-2">
                  <p className="text-xs text-slate-500 mb-2">Quick questions:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setInput(q);
                          setTimeout(() => handleSend(), 100);
                        }}
                        className="text-xs bg-slate-100 hover:bg-violet-100 text-slate-700 hover:text-violet-700 px-3 py-1.5 rounded-full transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t border-slate-100">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    size="icon"
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-slate-400 text-center mt-2">
                  Powered by BeyondWalls AI
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}