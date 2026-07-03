import React, { useState } from "react";
import { useApp } from "../lib/context";
import { doc, setDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { 
  Sparkles, Brain, AlertTriangle, RefreshCw, Layers, ShieldCheck, 
  Flame, CheckCircle, HelpCircle, ArrowRight, Hourglass
} from "lucide-react";
import { Habit, RecoveryPlan, Challenge } from "../types";

interface HabitAnalysisProps {
  onNavigate: (view: string) => void;
}

export default function HabitAnalysis({ onNavigate }: HabitAnalysisProps) {
  const { user, addXP, addCoins, setActiveHabit } = useApp();
  const [description, setDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States to keep the analysis report
  const [analysisReport, setAnalysisReport] = useState<any | null>(null);
  const [habitName, setHabitName] = useState("");

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setAnalyzing(true);
    setError(null);
    setAnalysisReport(null);

    try {
      const response = await fetch("/api/analyze-habit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description })
      });

      if (!response.ok) {
        throw new Error("Analysis failed. Please check backend.");
      }

      const data = await response.json();
      setAnalysisReport(data);

      // Extract a nice summary name for the habit (e.g., first 3 words of description or category)
      const words = description.split(" ");
      const nameGuess = words.length > 4 ? words.slice(0, 4).join(" ") + "..." : description;
      setHabitName(nameGuess);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to analyze your habit description.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateAndSavePlan = async () => {
    if (!user || !analysisReport || !habitName) return;

    setGeneratingPlan(true);
    setError(null);

    try {
      const planRes = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitName,
          category: analysisReport.category,
          severity: analysisReport.severity,
          rootCauses: analysisReport.rootCauses
        })
      });

      if (!planRes.ok) {
        throw new Error("Plan generation failed.");
      }

      const planData = await planRes.json();

      // IDs for records
      const habitId = "habit_" + Math.random().toString(36).substring(2, 11);
      const planId = "plan_" + Math.random().toString(36).substring(2, 11);

      // Create Habit payload
      const habitPayload: Habit = {
        id: habitId,
        userId: user.uid,
        name: habitName,
        description: description,
        category: analysisReport.category || "Behavioral",
        severity: analysisReport.severity || "Moderate",
        recoveryDifficulty: analysisReport.recoveryDifficulty || "Medium",
        confidenceScore: analysisReport.confidenceScore || 85,
        rootCauses: analysisReport.rootCauses || [],
        triggerSituations: analysisReport.triggerSituations || [],
        emotionalPatterns: analysisReport.emotionalPatterns || [],
        longTermRisks: analysisReport.longTermRisks || [],
        streak: 0,
        maxStreak: 0,
        status: "active",
        createdAt: new Date().toISOString()
      };

      // Create RecoveryPlan payload
      const planPayload: RecoveryPlan = {
        id: planId,
        userId: user.uid,
        habitId,
        days: planData.days || [],
        morningRoutine: planData.morningRoutine || "Standard morning mindfulness",
        eveningRoutine: planData.eveningRoutine || "Standard evening screen-free rest",
        healthyAlternatives: planData.healthyAlternatives || [],
        createdAt: new Date().toISOString()
      };

      // Save to Firestore
      const habitsPath = `users/${user.uid}/habits/${habitId}`;
      const plansPath = `users/${user.uid}/recoveryPlans/${planId}`;

      try {
        await setDoc(doc(db, "users", user.uid, "habits", habitId), habitPayload);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, habitsPath);
      }

      try {
        await setDoc(doc(db, "users", user.uid, "recoveryPlans", planId), planPayload);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, plansPath);
      }

      // Generate a set of matching Challenges to trigger gamification instantly
      const challengeId = "challenge_day1";
      const challengePayload: Challenge = {
        id: challengeId,
        userId: user.uid,
        title: `Limit ${habitName.replace("...", "")} today`,
        description: `Complete Day 1 substitution goals. Substitute trigger with: ${planPayload.healthyAlternatives[0] || "stretch, read, or drink tea"}.`,
        xp: 30,
        coins: 10,
        status: "pending",
        date: new Date().toISOString().split("T")[0],
        habitId
      };
      await setDoc(doc(db, "users", user.uid, "challenges", challengeId), challengePayload);

      // Reward points
      await addXP(50);
      await addCoins(15);

      setActiveHabit(habitPayload);
      onNavigate("dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to finalize plan.");
    } finally {
      setGeneratingPlan(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex p-3 bg-blue-600 text-white rounded-2xl mb-4 shadow-sm">
          <Brain className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-semibold font-sans tracking-tight text-[#1D1D1F]">
          Behavioral Diagnostics
        </h1>
        <p className="text-sm text-[#86868B] mt-2 leading-relaxed">
          Our Gemini engine parses triggers, payoffs, and structures an unshakeable 21-day neuro-substitution roadmap.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs leading-relaxed">
          {error}
        </div>
      )}

      {/* Input Form */}
      <div className="bg-white border border-[#E5E5E7] rounded-[32px] p-8 shadow-sm">
        <form onSubmit={handleAnalyze} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-2">
              Describe your behavior naturally
            </label>
            <textarea
              rows={4}
              placeholder="e.g., I spend 7 hours a day on Instagram reels, mostly because I feel lonely or procrastinate before doing my homework. I sleep at 3 AM and feel exhausted..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={analyzing || generatingPlan}
              required
              className="w-full px-5 py-4 bg-[#F5F5F7] border border-[#D2D2D7] rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm font-sans transition-all disabled:opacity-50"
            ></textarea>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[11px] text-[#86868B]">Include triggers, emotional payoffs, & frequency</span>
            <button
              type="submit"
              disabled={analyzing || generatingPlan || !description.trim()}
              className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 text-xs font-medium rounded-xl disabled:opacity-50 flex items-center gap-2 transition-all shadow-sm"
            >
              {analyzing ? (
                <>
                  Analyzing Behaviors... <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                </>
              ) : (
                <>
                  Begin Diagnostics <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Display Analysis Cards */}
      {analysisReport && (
        <div className="space-y-6">
          <div className="p-8 bg-gradient-to-br from-[#1D1D1F] to-[#3A3A3C] text-white rounded-[32px] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-500/20 blur-[60px] rounded-full pointer-events-none"></div>
            <div className="relative z-10">
              <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Diagnostic Verdict</span>
              <h2 className="text-xl font-medium font-sans tracking-tight mt-1">
                Category: {analysisReport.category}
              </h2>
              <p className="text-xs text-gray-300 mt-2 max-w-xl leading-relaxed">
                {analysisReport.summary}
              </p>
            </div>
            <div className="flex gap-3 relative z-10">
              <div className="bg-white/10 px-4 py-2 rounded-xl text-center border border-white/5">
                <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Severity</div>
                <div className="text-xs font-semibold text-red-400 mt-0.5">{analysisReport.severity}</div>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl text-center border border-white/5">
                <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Difficulty</div>
                <div className="text-xs font-semibold text-blue-400 mt-0.5">{analysisReport.recoveryDifficulty}</div>
              </div>
            </div>
          </div>

          {/* Core breakdown boxes */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-[#E5E5E7] rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1D1D1F] flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-blue-600" /> Psychological Root Causes
              </h3>
              <ul className="space-y-2.5">
                {analysisReport.rootCauses?.map((rc: string, i: number) => (
                  <li key={i} className="text-xs text-[#86868B] flex items-start gap-2.5 leading-relaxed">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full shrink-0 mt-1.5"></span>
                    <span>{rc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-[#E5E5E7] rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1D1D1F] flex items-center gap-2 mb-4">
                <Flame className="w-4 h-4 text-red-500" /> Immediate Cues & Triggers
              </h3>
              <ul className="space-y-2.5">
                {analysisReport.triggerSituations?.map((ts: string, i: number) => (
                  <li key={i} className="text-xs text-[#86868B] flex items-start gap-2.5 leading-relaxed">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0 mt-1.5"></span>
                    <span>{ts}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-[#E5E5E7] rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1D1D1F] flex items-center gap-2 mb-4">
                <Hourglass className="w-4 h-4 text-emerald-500" /> Long-Term Risks
              </h3>
              <ul className="space-y-2.5">
                {analysisReport.longTermRisks?.map((risk: string, i: number) => (
                  <li key={i} className="text-xs text-[#86868B] flex items-start gap-2.5 leading-relaxed">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0 mt-1.5"></span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-[#E5E5E7] rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1D1D1F] flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Emotional Compensation Loops
              </h3>
              <ul className="space-y-2.5">
                {analysisReport.emotionalPatterns?.map((pat: string, i: number) => (
                  <li key={i} className="text-xs text-[#86868B] flex items-start gap-2.5 leading-relaxed">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0 mt-1.5"></span>
                    <span>{pat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Confirm & generate plan CTA block */}
          <div className="bg-blue-50/40 border border-blue-100 rounded-[32px] p-8 text-center space-y-4">
            <h3 className="text-lg font-semibold text-blue-950 flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" /> AI Confidence Match: {analysisReport.confidenceScore || 85}%
            </h3>
            <p className="text-xs text-blue-800 max-w-xl mx-auto leading-relaxed">
              We have completed the high-level cognitive diagnostic. Let's name this habit and let our generative engine formulate your personalized 21-Day substitution program.
            </p>

            <div className="max-w-md mx-auto flex gap-3">
              <input
                type="text"
                placeholder="Give this habit a custom name..."
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-white border border-[#D2D2D7] focus:outline-none focus:border-blue-600 text-xs rounded-xl shadow-sm"
              />
              <button
                onClick={handleGenerateAndSavePlan}
                disabled={generatingPlan || !habitName.trim()}
                className="px-5 py-2.5 bg-blue-600 text-white hover:bg-blue-700 text-xs font-medium rounded-xl disabled:opacity-50 flex items-center gap-1.5 transition-all shadow-sm"
              >
                {generatingPlan ? (
                  <>
                    Creating Plan... <RefreshCw className="w-3 animate-spin" />
                  </>
                ) : (
                  <>
                    Forge Plan (+50 XP) <Sparkles className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
