import React, { useState } from "react";
import { useApp } from "../lib/context";
import { 
  Shield, Users, Activity, BarChart3, Quote, AlertOctagon, 
  Download, Trash2, Check, Sparkles, RefreshCw, Layers
} from "lucide-react";

export default function AdminPanel() {
  const { profile, habits, challenges, journals, isAdmin } = useApp();
  const [quotes, setQuotes] = useState([
    { text: "Your future self will thank you for the boundaries you set today.", author: "AI Habit Coach" },
    { text: "Small, consistent daily victories build an unshakeable fortress of discipline.", author: "AI Habit Coach" },
    { text: "The chains of habit are too weak to be felt until they are too strong to be broken.", author: "Samuel Johnson" },
    { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" }
  ]);
  const [newQuoteText, setNewQuoteText] = useState("");
  const [newQuoteAuthor, setNewQuoteAuthor] = useState("");
  const [exportSuccess, setExportSuccess] = useState(false);

  // Admin user list (mocked for demo, including active user profile)
  const usersList = [
    { name: profile?.name || "CurrentUser", email: profile?.email || "saadhikagopinathvit06@gmail.com", xp: profile?.xp || 150, level: profile?.level || 2, premium: profile?.premium || false },
    { name: "Marcus Aurelius", email: "marcus@stoic.org", xp: 1250, level: 12, premium: true },
    { name: "John Doe", email: "john@example.com", xp: 420, level: 5, premium: false },
    { name: "Alice Smith", email: "alice@coder.dev", xp: 950, level: 9, premium: true }
  ];

  const handleAddQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuoteText.trim()) return;
    setQuotes([...quotes, { text: newQuoteText, author: newQuoteAuthor || "AI Coach" }]);
    setNewQuoteText("");
    setNewQuoteAuthor("");
  };

  const handleRemoveQuote = (idx: number) => {
    setQuotes(quotes.filter((_, i) => i !== idx));
  };

  const handleExportTelemetry = () => {
    setExportSuccess(true);
    const telemetryData = {
      timestamp: new Date().toISOString(),
      platformVersion: "1.2.0-Production",
      metrics: {
        totalTrackedHabits: habits.length + 15, // real + background simulations
        activeChallenges: challenges.length + 4,
        averageMoodIndex: 4.2,
        aiSuccessRate: "94.2%",
        apiResponseLatency: "210ms"
      },
      quotesCount: quotes.length,
      admins: ["saadhikagopinathvit06@gmail.com", "admin@habitbreaker.ai"]
    };

    const blob = new Blob([JSON.stringify(telemetryData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AI_Habit_Breaker_Telemetry_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    
    setTimeout(() => setExportSuccess(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      {/* Header and warnings */}
      <div className="bg-white border border-[#E5E5E7] p-8 rounded-[32px] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-[10px] font-semibold text-[#86868B] bg-[#F5F5F7] px-2.5 py-1 rounded-full border border-[#E5E5E7] flex items-center gap-1.5 w-fit">
            <Shield className="w-3.5 h-3.5 text-blue-600" /> Admin Controller
          </span>
          <h1 className="text-2xl font-semibold font-sans tracking-tight text-[#1D1D1F] mt-2.5">Platform Operations Panel</h1>
          <p className="text-xs text-[#86868B] mt-1">Manage system-generated parameters, view global latency logs, and audit premium quotas.</p>
        </div>

        <button 
          onClick={handleExportTelemetry}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm shrink-0 cursor-pointer"
        >
          {exportSuccess ? (
            <>
              Report Exported! <Check className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              Export Platform Telemetry <Download className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* Grid: Server Stats vs Quota Utilization */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E5E7] rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">Total Registrations</span>
          <h3 className="text-xl font-semibold text-[#1D1D1F] mt-1 flex items-baseline gap-1">
            2,540 <span className="text-[10px] text-blue-600 font-semibold">+12%</span>
          </h3>
        </div>

        <div className="bg-white border border-[#E5E5E7] rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">AI API Requests</span>
          <h3 className="text-xl font-semibold text-[#1D1D1F] mt-1 flex items-baseline gap-1">
            42.8K <span className="text-[10px] text-[#86868B] font-semibold">Gemini v2.5</span>
          </h3>
        </div>

        <div className="bg-white border border-[#E5E5E7] rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">Average Success</span>
          <h3 className="text-xl font-semibold text-[#1D1D1F] mt-1 flex items-baseline gap-1">
            88.4% <span className="text-[10px] text-blue-600 font-semibold">Unshakeable</span>
          </h3>
        </div>

        <div className="bg-white border border-[#E5E5E7] rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">API Quota Spent</span>
          <h3 className="text-xl font-semibold text-[#1D1D1F] mt-1 flex items-baseline gap-1">
            18.5% <span className="text-[10px] text-amber-600 font-semibold">Spark Free</span>
          </h3>
        </div>
      </div>

      {/* Two columns: Quote controller & Registered users list */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quote Manager column */}
        <div className="bg-white border border-[#E5E5E7] rounded-[32px] p-8 shadow-sm space-y-4 lg:col-span-2">
          <h3 className="text-sm font-semibold text-[#1D1D1F] flex items-center gap-2 pb-3 border-b border-[#F5F5F7]">
            <Quote className="w-4.5 h-4.5 text-blue-600" /> Manage Motivational Quotes
          </h3>

          <form onSubmit={handleAddQuote} className="grid sm:grid-cols-3 gap-3">
            <input 
              type="text" 
              placeholder="e.g. Small consistent routines rewires pathways." 
              required
              value={newQuoteText}
              onChange={(e) => setNewQuoteText(e.target.value)}
              className="sm:col-span-2 px-3 py-2.5 bg-[#F5F5F7] border border-[#E5E5E7]/80 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs text-[#1D1D1F] placeholder-[#86868B] transition-all" 
            />
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Author" 
                value={newQuoteAuthor}
                onChange={(e) => setNewQuoteAuthor(e.target.value)}
                className="flex-1 px-3 py-2.5 bg-[#F5F5F7] border border-[#E5E5E7]/80 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs text-[#1D1D1F] placeholder-[#86868B] transition-all" 
              />
              <button 
                type="submit" 
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shrink-0 transition-colors cursor-pointer shadow-sm"
              >
                Add
              </button>
            </div>
          </form>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 pt-1 border-t border-[#F5F5F7]">
            {quotes.map((q, idx) => (
              <div key={idx} className="bg-[#F5F5F7]/80 p-4 rounded-xl border border-[#E5E5E7]/60 flex justify-between items-center gap-4 text-xs">
                <div className="leading-relaxed">
                  <span className="font-semibold text-[#1D1D1F]">"{q.text}"</span>
                  <p className="text-[10px] text-[#86868B] mt-1 font-medium">Author: {q.author}</p>
                </div>
                <button 
                  onClick={() => handleRemoveQuote(idx)}
                  className="text-[#86868B] hover:text-red-600 p-1.5 transition-colors shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* User list column */}
        <div className="bg-white border border-[#E5E5E7] rounded-[32px] p-8 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-[#1D1D1F] flex items-center gap-2 pb-3 border-b border-[#F5F5F7]">
            <Users className="w-4.5 h-4.5 text-blue-600" /> Active Platform Users
          </h3>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {usersList.map((usr, uIdx) => (
              <div key={uIdx} className="p-4 bg-[#F5F5F7]/80 border border-[#E5E5E7]/60 rounded-xl text-xs flex justify-between items-center gap-3">
                <div>
                  <div className="font-semibold text-[#1D1D1F] flex items-center gap-2">
                    {usr.name}
                    {usr.premium && <span className="bg-blue-600 text-white text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-md">Premium</span>}
                  </div>
                  <div className="text-[10px] text-[#86868B] mt-0.5">{usr.email}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-semibold text-[#1D1D1F]">Level {usr.level}</div>
                  <div className="text-[10px] text-[#86868B]">{usr.xp} XP</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
