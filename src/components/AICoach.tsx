import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../lib/context";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { Send, Sparkles, Brain, Bot, Compass, RefreshCw } from "lucide-react";
import { ChatMessage } from "../types";

export default function AICoach() {
  const { user, profile, activeHabit, chats } = useApp();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever chats change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const userText = input.trim();
    setInput("");
    setSending(true);

    const userMessageId = "msg_user_" + Date.now();
    const coachMessageId = "msg_coach_" + (Date.now() + 1);

    // 1. Create client-side User ChatMessage payload
    const userMessagePayload: ChatMessage = {
      id: userMessageId,
      userId: user.uid,
      role: "user",
      content: userText,
      createdAt: new Date().toISOString()
    };

    // Save user message to Firestore
    try {
      await setDoc(doc(db, "users", user.uid, "chats", userMessageId), userMessagePayload);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/chats/${userMessageId}`);
    }

    try {
      // 2. Fetch from our API proxy
      const historyPayload = chats.map((c) => ({
        role: c.role,
        content: c.content
      }));

      const res = await fetch("/api/chat-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: [...historyPayload, { role: "user", content: userText }],
          habitName: activeHabit?.name || "Breaking general negative behaviors",
          userProfile: {
            name: profile?.name || "User",
            level: profile?.level || 1,
            xp: profile?.xp || 0
          }
        })
      });

      if (!res.ok) {
        throw new Error("Chat coach failed to respond.");
      }

      const data = await res.json();

      // 3. Save assistant response payload to Firestore
      const assistantMessagePayload: ChatMessage = {
        id: coachMessageId,
        userId: user.uid,
        role: "assistant",
        content: data.text || "I am always here to guide you. Take a deep, intentional breath.",
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, "users", user.uid, "chats", coachMessageId), assistantMessagePayload);
    } catch (error) {
      console.error(error);
      // Save a fallback assistant message so the chat isn't stuck
      const fallbackPayload: ChatMessage = {
        id: coachMessageId,
        userId: user.uid,
        role: "assistant",
        content: "I ran into a minor connection glitch, but my motivation remains absolute! Pause, drink some water, and remember that breaking habits is a progressive journey.",
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, "users", user.uid, "chats", coachMessageId), fallbackPayload);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col h-[calc(100vh-140px)] space-y-4">
      {/* Coach Header */}
      <div className="bg-white border border-[#E5E5E7] p-6 rounded-[32px] shadow-sm flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-[#1D1D1F] font-sans tracking-tight">AI Motivation Coach</h1>
            <p className="text-[10px] text-[#86868B] font-semibold uppercase tracking-wider mt-0.5">
              Behavioral Support: {activeHabit ? `Focusing on "${activeHabit.name}"` : "General Habits"}
            </p>
          </div>
        </div>

        <div className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase tracking-wider shrink-0">
          24/7 Companion Active
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto bg-white border border-[#E5E5E7] rounded-[32px] p-6 shadow-sm space-y-4 min-h-0">
        {chats.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-3">
            <Compass className="w-10 h-10 text-[#86868B]/40" />
            <h3 className="text-sm font-semibold text-[#1D1D1F]">Your coaching safe-space</h3>
            <p className="text-xs text-[#86868B] leading-relaxed">
              Ask anything about triggers, physical substitution strategies, or mental avoidance. Our AI Coach understands clinical behavioral models and is trained to support your progress.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {chats.map((msg) => {
              const isCoach = msg.role === "assistant";
              return (
                <div 
                  key={msg.id}
                  className={`flex ${isCoach ? "justify-start" : "justify-end"}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-[20px] p-4 text-xs leading-relaxed font-sans shadow-sm ${
                      isCoach 
                        ? "bg-[#F5F5F7] border border-[#E5E5E7] text-[#1D1D1F]" 
                        : "bg-blue-600 text-white font-medium"
                    }`}
                  >
                    <div className={`font-bold uppercase text-[9px] tracking-wider mb-1.5 ${
                      isCoach ? "text-blue-600" : "text-blue-100"
                    }`}>
                      {isCoach ? "AI Coach" : (profile?.name || "You")}
                    </div>
                    <div>{msg.content}</div>
                  </div>
                </div>
              );
            })}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-[#F5F5F7] border border-[#E5E5E7] rounded-[20px] p-4 text-xs text-[#86868B] flex items-center gap-1.5 shadow-sm">
                  Coach is typing <RefreshCw className="w-3 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Chat input form */}
      <form onSubmit={handleSendMessage} className="flex gap-2.5 shrink-0">
        <input
          type="text"
          placeholder="Ask your coach anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={sending}
          className="flex-1 px-5 py-3.5 bg-white border border-[#E5E5E7] rounded-2xl text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-[#1D1D1F] placeholder-[#86868B]"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-sm disabled:opacity-40 transition-all flex items-center justify-center shrink-0 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
