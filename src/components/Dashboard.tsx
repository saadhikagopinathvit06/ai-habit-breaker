import React, { useState, useEffect } from "react";
import { useApp } from "../lib/context";
import { 
  Sparkles, Award, Zap, Coins, TrendingUp, Calendar, CheckCircle2, 
  HelpCircle, ChevronRight, Activity, Plus, Brain, Compass
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { profile, habits, challenges, journals, activeHabit, setActiveHabit } = useApp();
  const [quote, setQuote] = useState({ text: "Every minor win strengthens the neural pathway of control.", author: "Behavioral Coach" });
  const [loadingQuote, setLoadingQuote] = useState(true);

  // Fetch AI dynamic quote
  useEffect(() => {
    fetch("/api/dashboard-quote")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.text) setQuote(data);
      })
      .catch((err) => console.warn("Failed to load quote, using fallback:", err))
      .finally(() => setLoadingQuote(false));
  }, []);

  // Compute stats
  const totalXP = profile?.xp || 0;
  const currentLevel = profile?.level || 1;
  const coins = profile?.coins || 0;
  const trackedHabitsCount = habits.length;
  const activeChallenges = challenges.filter((c) => c.status === "pending");
  const completedChallenges = challenges.filter((c) => c.status === "completed");

  const longestStreak = habits.reduce((acc, h) => Math.max(acc, h.streak), 0);
  const activeHabitsList = habits.filter((h) => h.status === "active");

  // Recharts sample data correlating with past week
  const weeklyAnalyticsData = [
    { day: "Mon", recoveryScore: 65, productivity: 40, mood: 3 },
    { day: "Tue", recoveryScore: 70, productivity: 50, mood: 4 },
    { day: "Wed", recoveryScore: 60, productivity: 45, mood: 3 },
    { day: "Thu", recoveryScore: 75, productivity: 60, mood: 5 },
    { day: "Fri", recoveryScore: 80, productivity: 70, mood: 4 },
    { day: "Sat", recoveryScore: 85, productivity: 85, mood: 5 },
    { day: "Sun", recoveryScore: 90, productivity: 95, mood: 5 }
  ];

  // Calculate generic habit score (0-100)
  const habitScore = habits.length > 0
    ? Math.min(100, Math.floor((longestStreak * 10) + 50))
    : 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-8">
      {/* Upper Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[32px] border border-[#E5E5E7] shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-[#86868B] font-mono text-xs">
            <Calendar className="w-3.5 h-3.5 text-blue-600" /> UTC Time Focus
          </div>
          <h1 className="text-3xl font-semibold font-sans tracking-tight text-[#1D1D1F] mt-2">
            Stay strong, {profile?.name || "Breaker"}!
          </h1>
          <p className="text-sm text-[#86868B] mt-1">
            Your level {currentLevel} profile is active • {totalXP} total XP.
          </p>
        </div>

        {/* Level & XP Capsule */}
        <div className="flex items-center gap-4 bg-[#F5F5F7] border border-[#D2D2D7]/60 rounded-2xl p-4">
          <div className="text-center">
            <div className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">Level</div>
            <div className="text-2xl font-semibold text-[#1D1D1F]">{currentLevel}</div>
          </div>
          <div className="w-[1px] h-10 bg-[#D2D2D7]"></div>
          <div>
            <div className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">XP Progression</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-28 h-2 bg-[#E5E5E7] rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full transition-all duration-500" 
                  style={{ width: `${totalXP % 100}%` }}
                ></div>
              </div>
              <span className="text-[10px] font-semibold text-[#1D1D1F]">{totalXP % 100}/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gamified Stat Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak card */}
        <div className="bg-white border border-[#E5E5E7] rounded-[24px] p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider">Top Streak</span>
            <h3 className="text-2xl font-semibold text-[#1D1D1F] mt-1 flex items-baseline gap-1">
              {longestStreak} <span className="text-xs text-[#86868B] font-medium">Days</span>
            </h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Zap className="w-5 h-5 fill-blue-600 stroke-blue-600" />
          </div>
        </div>

        {/* Coins card */}
        <div className="bg-white border border-[#E5E5E7] rounded-[24px] p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider">Breaker Coins</span>
            <h3 className="text-2xl font-semibold text-[#1D1D1F] mt-1 flex items-baseline gap-1">
              {coins} <span className="text-xs text-[#86868B] font-medium">Gold</span>
            </h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl">
            <Coins className="w-5 h-5 fill-amber-500 stroke-amber-500" />
          </div>
        </div>

        {/* Habit Score Card */}
        <div className="bg-white border border-[#E5E5E7] rounded-[24px] p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider">Recovery Index</span>
            <h3 className="text-2xl font-semibold text-[#1D1D1F] mt-1 flex items-baseline gap-1">
              {habitScore}% <span className="text-xs text-[#86868B] font-medium">Stability</span>
            </h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Completed Challenges Card */}
        <div className="bg-white border border-[#E5E5E7] rounded-[24px] p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider">Daily Quests</span>
            <h3 className="text-2xl font-semibold text-[#1D1D1F] mt-1 flex items-baseline gap-1">
              {completedChallenges.length} <span className="text-xs text-[#86868B] font-medium">Done</span>
            </h3>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>      {/* Quote and AI Motivation Cards */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-[#1D1D1F] to-[#3A3A3C] text-white rounded-[32px] p-8 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[190px]">
          {/* Subtle glow accent */}
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-500/20 blur-[60px] rounded-full pointer-events-none"></div>
          
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-white rounded-full text-[10px] font-semibold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-blue-400" /> Cognitive Insight
            </span>
            <h2 className="text-lg font-normal leading-relaxed font-sans mt-4 text-gray-200">
              "{quote.text}"
            </h2>
          </div>
          
          <div className="mt-4 flex justify-between items-center text-xs text-gray-400">
            <span>Author: {quote.author}</span>
            <span className="font-mono text-[9px] text-gray-500">Optimized via Gemini</span>
          </div>
        </div>

        <div className="bg-white rounded-[32px] border border-[#E5E5E7] p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#1D1D1F] flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-blue-600" /> Active Diagnostic Status
            </h3>
            {activeHabit ? (
              <div className="mt-3">
                <div className="text-lg font-semibold text-[#1D1D1F] tracking-tight">{activeHabit.name}</div>
                <div className="text-[10px] font-mono text-[#86868B] mt-1.5 bg-[#F5F5F7] border border-[#E5E5E7] px-2.5 py-1 rounded-full inline-block">
                  Category: {activeHabit.category}
                </div>
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-[#86868B]">
                    <span>Severity:</span>
                    <span className="text-red-500 font-semibold">{activeHabit.severity}</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium text-[#86868B]">
                    <span>Recovery Difficulty:</span>
                    <span className="text-blue-600 font-semibold">{activeHabit.recoveryDifficulty}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-center py-4">
                <p className="text-xs text-[#86868B] leading-relaxed">No active habits tracked yet. Start by typing your bad habit!</p>
              </div>
            )}
          </div>

          <button 
            onClick={() => onNavigate("analyze")}
            className="w-full py-2.5 mt-4 bg-[#F5F5F7] hover:bg-[#E5E5E7] border border-[#D2D2D7] text-blue-600 hover:text-blue-700 text-xs font-medium rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            {activeHabit ? "Analyze Another Behavior" : "Run Diagnostics"} <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Tracked Habits vs Progress Analytics */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Tracked habits column */}
        <div className="bg-white border border-[#E5E5E7] rounded-[32px] p-8 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-[#1D1D1F]">Tracked Bad Habits</h3>
            <span className="text-xs text-[#86868B] font-semibold">{trackedHabitsCount} Total</span>
          </div>

          {trackedHabitsCount > 0 ? (
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {habits.map((h) => (
                <button
                  key={h.id}
                  onClick={() => setActiveHabit(h)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    activeHabit?.id === h.id 
                      ? "border-blue-600 bg-blue-50/10 shadow-sm" 
                      : "border-[#E5E5E7] hover:border-[#D2D2D7] bg-white"
                  }`}
                >
                  <div>
                    <div className="text-xs font-semibold text-[#1D1D1F]">{h.name}</div>
                    <div className="text-[10px] font-mono text-[#86868B] mt-0.5">{h.category}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-0.5 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-medium">
                      <Zap className="w-3 h-3 fill-blue-600 stroke-blue-600" /> {h.streak}d
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#86868B]" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border border-dashed border-[#D2D2D7] rounded-2xl">
              <Compass className="w-8 h-8 text-[#86868B]/40 mx-auto" />
              <p className="text-xs text-[#86868B] mt-2 max-w-[180px] mx-auto">Analyze your behaviors to spawn recovery roadmaps.</p>
              <button 
                onClick={() => onNavigate("analyze")}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-xl shadow-sm"
              >
                Launch Diagnostics
              </button>
            </div>
          )}
        </div>

        {/* Analytics Column */}
        <div className="lg:col-span-2 bg-white border border-[#E5E5E7] rounded-[32px] p-8 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-semibold text-[#1D1D1F]">Behavioral Analytics</h3>
              <p className="text-[10px] text-[#86868B]">Correlating recovery scores with focus times</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-[#1D1D1F] bg-[#F5F5F7] px-3 py-1 rounded-full border border-[#D2D2D7]">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span> Weekly Trend
            </div>
          </div>

          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyAnalyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E7" />
                <XAxis dataKey="day" stroke="#86868B" fontSize={11} tickLine={false} />
                <YAxis stroke="#86868B" fontSize={11} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="recoveryScore" stroke="#0071E3" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Stability %" />
                <Line type="monotone" dataKey="productivity" stroke="#34C759" strokeWidth={2} dot={{ r: 3 }} name="Focus growth" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
