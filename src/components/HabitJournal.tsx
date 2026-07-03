import React, { useState } from "react";
import { useApp } from "../lib/context";
import { doc, setDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { 
  Sparkles, BookOpen, Smile, Compass, RefreshCw, CheckCircle2, 
  HelpCircle, ShieldCheck, Heart, AlertCircle, TrendingUp
} from "lucide-react";
import { JournalEntry } from "../types";

export default function HabitJournal() {
  const { user, journals, addXP, addCoins } = useApp();
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<"Happy" | "Calm" | "Neutral" | "Sad" | "Stressed" | null>(null);
  const [wins, setWins] = useState("");
  const [challenges, setChallenges] = useState("");
  const [lessons, setLessons] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const moodEmojis = {
    Happy: "😀",
    Calm: "🙂",
    Neutral: "😐",
    Sad: "😔",
    Stressed: "😩"
  };

  const handleSaveJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim() || !selectedMood) return;

    setSaving(true);
    setError(null);

    const journalId = "journal_" + Date.now();

    try {
      // 1. Get AI insights
      const res = await fetch("/api/summarize-journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          mood: selectedMood,
          moodEmoji: moodEmojis[selectedMood],
          wins,
          challenges,
          lessons
        })
      });

      let aiSummary = "Daily reflection captured.";
      let aiPatterns = ["Keep consistent with your substitutions"];

      if (res.ok) {
        const data = await res.json();
        aiSummary = data.aiSummary || aiSummary;
        aiPatterns = data.aiPatterns || aiPatterns;
      }

      // 2. Save to Firestore
      const journalPayload: JournalEntry = {
        id: journalId,
        userId: user.uid,
        content,
        mood: selectedMood,
        moodEmoji: moodEmojis[selectedMood],
        wins,
        challenges,
        lessons,
        aiSummary,
        aiPatterns,
        date: new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString()
      };

      const path = `users/${user.uid}/journals/${journalId}`;
      await setDoc(doc(db, "users", user.uid, "journals", journalId), journalPayload);

      // Reward points for self-reflection
      await addXP(30);
      await addCoins(8);

      // Clear form
      setContent("");
      setSelectedMood(null);
      setWins("");
      setChallenges("");
      setLessons("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save journal reflection.");
    } finally {
      setSaving(false);
    }
  };

  // Aggregate mood statistics for correlation
  const totalCount = journals.length;
  const moodCounts = journals.reduce((acc, j) => {
    acc[j.mood] = (acc[j.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header and statistics */}
      <div className="bg-white border border-[#E5E5E7] p-8 rounded-[32px] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 uppercase tracking-wider">
            Self-Reflective Logging
          </span>
          <h1 className="text-2xl font-semibold text-[#1D1D1F] font-sans tracking-tight mt-1.5">Behavioral Journal</h1>
          <p className="text-xs text-[#86868B] mt-1">Reflect on daily successes. Our AI extracts mood patterns and schedules core insights.</p>
        </div>

        {totalCount > 0 && (
          <div className="flex items-center gap-4 bg-[#F5F5F7] border border-[#E5E5E7] p-4 rounded-2xl">
            <div>
              <div className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider">Reflection Streak</div>
              <div className="text-xl font-semibold text-[#1D1D1F] mt-0.5">{totalCount} Days Logged</div>
            </div>
            <TrendingUp className="w-6 h-6 text-[#86868B]" />
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs rounded-2xl">
          {error}
        </div>
      )}

      {/* Write Daily Journal Entry Form */}
      <div className="bg-white border border-[#E5E5E7] rounded-[32px] p-8 shadow-sm">
        <h3 className="text-sm font-semibold text-[#1D1D1F] flex items-center gap-2 mb-5">
          <BookOpen className="w-4.5 h-4.5 text-blue-600" /> Complete Daily Log
        </h3>

        <form onSubmit={handleSaveJournal} className="space-y-5">
          {/* Mood Selector */}
          <div>
            <label className="block text-[10px] font-bold text-[#86868B] uppercase tracking-wider mb-2.5">
              Select Your Mood Today
            </label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(moodEmojis) as Array<keyof typeof moodEmojis>).map((mood) => (
                <button
                  key={mood}
                  type="button"
                  onClick={() => setSelectedMood(mood)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    selectedMood === mood
                      ? "border-blue-600 bg-blue-50 text-blue-600 shadow-none"
                      : "border-[#E5E5E7] bg-white text-[#1D1D1F] hover:border-[#D2D2D7]"
                  }`}
                >
                  <span className="text-sm">{moodEmojis[mood]}</span>
                  <span>{mood}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-bold text-[#86868B] uppercase tracking-wider mb-2">
                What did you write / experience?
              </label>
              <textarea
                rows={3}
                placeholder="Share your general mental state, focus challenges, and substitution flow..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                disabled={saving}
                className="w-full px-4 py-3 bg-[#F5F5F7] border border-[#E5E5E7]/80 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs text-[#1D1D1F] placeholder-[#86868B] transition-all"
              ></textarea>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#86868B] uppercase tracking-wider mb-2">
                Lessons Learned Today
              </label>
              <textarea
                rows={3}
                placeholder="What trigger situations arose, and how did you substitute them?"
                value={lessons}
                onChange={(e) => setLessons(e.target.value)}
                disabled={saving}
                className="w-full px-4 py-3 bg-[#F5F5F7] border border-[#E5E5E7]/80 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs text-[#1D1D1F] placeholder-[#86868B] transition-all"
              ></textarea>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-bold text-[#86868B] uppercase tracking-wider mb-2">
                Wins (What went right?)
              </label>
              <input
                type="text"
                placeholder="e.g., Read 15 pages instead of using TikTok"
                value={wins}
                onChange={(e) => setWins(e.target.value)}
                disabled={saving}
                className="w-full px-4 py-3 bg-[#F5F5F7] border border-[#E5E5E7]/80 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs text-[#1D1D1F] placeholder-[#86868B] transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#86868B] uppercase tracking-wider mb-2">
                Hurdles / Temptations
              </label>
              <input
                type="text"
                placeholder="e.g., Received social app notification mid-study"
                value={challenges}
                onChange={(e) => setChallenges(e.target.value)}
                disabled={saving}
                className="w-full px-4 py-3 bg-[#F5F5F7] border border-[#E5E5E7]/80 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs text-[#1D1D1F] placeholder-[#86868B] transition-all"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-[#F5F5F7]">
            <span className="text-[10px] text-[#86868B] font-semibold">Earn +30 XP for journaling daily wins</span>
            <button
              type="submit"
              disabled={saving || !content.trim() || !selectedMood}
              className="px-5 py-2.5 bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
            >
              {saving ? (
                <>
                  AI Syncing... <RefreshCw className="w-3 animate-spin" />
                </>
              ) : (
                <>
                  Save Entry (+30 XP) <CheckCircle2 className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Mood correlation insights */}
      {totalCount > 0 && (
        <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-[32px] shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-blue-600 flex items-center gap-2">
            <Heart className="w-4.5 h-4.5 text-blue-600 fill-blue-600" /> AI Mood Correlation Analytics
          </h3>
          <p className="text-xs text-[#86868B] leading-relaxed max-w-2xl">
            Our diagnostic model detects high habit breakdown triggers when mood averages dip below "Calm." Journal regularly to feed the correlation vectors and optimize predictive substitution alerts.
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            {Object.entries(moodCounts).map(([mName, count]) => (
              <div key={mName} className="bg-white border border-[#E5E5E7] px-3.5 py-2 rounded-xl text-center shadow-sm flex items-center gap-2">
                <span className="text-xs font-semibold text-[#1D1D1F]">{moodEmojis[mName as keyof typeof moodEmojis]} {mName}</span>
                <span className="text-xs text-[#86868B] font-mono font-semibold">{count}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Entries Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-[#1D1D1F]">Historical Reflection Logs</h2>
        {journals.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {journals.map((log) => (
              <div key={log.id} className="bg-white border border-[#E5E5E7] rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-[#F5F5F7]">
                  <div className="text-[10px] font-mono font-semibold text-[#86868B]">{log.date}</div>
                  <div className="text-xs font-semibold bg-[#F5F5F7] border border-[#E5E5E7] px-3 py-1 rounded-full text-[#1D1D1F]">
                    {log.moodEmoji} {log.mood}
                  </div>
                </div>

                <p className="text-xs text-[#1D1D1F] leading-relaxed italic">"{log.content}"</p>

                {log.aiSummary && (
                  <div className="bg-[#F5F5F7] p-4 rounded-xl border border-[#E5E5E7]/60 text-[11px] leading-relaxed">
                    <span className="font-semibold text-blue-600 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Coach Summary:
                    </span>
                    <p className="text-[#86868B] mt-1">{log.aiSummary}</p>
                  </div>
                )}

                {log.aiPatterns && log.aiPatterns.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">Triggers Detected</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {log.aiPatterns.map((pat, pIdx) => (
                        <span key={pIdx} className="bg-[#F5F5F7] text-[#1D1D1F] px-2.5 py-1 rounded text-[10px] border border-[#E5E5E7] font-semibold">
                          {pat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#86868B] italic">No historical journals completed in this focus phase.</p>
        )}
      </div>
    </div>
  );
}
