import React, { useState } from "react";
import { useApp } from "../lib/context";
import { doc, updateDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { 
  Award, Sparkles, Sunrise, Sunset, ShieldAlert, Compass, CheckCircle2, 
  HelpCircle, Check, ArrowLeft, RefreshCw, Zap, Star
} from "lucide-react";
import { RecoveryPlan, RecoveryPlanDay } from "../types";

export default function RecoveryPlanView() {
  const { user, activeHabit, recoveryPlans, addXP, addCoins } = useApp();
  const [selectedDay, setSelectedDay] = useState<RecoveryPlanDay | null>(null);
  const [updating, setUpdating] = useState(false);

  // Find plan matching active habit
  const matchingPlan = recoveryPlans.find((p) => p.habitId === activeHabit?.id);

  const handleToggleDayComplete = async (dayNum: number) => {
    if (!user || !matchingPlan) return;
    setUpdating(true);

    try {
      const planRef = doc(db, "users", user.uid, "recoveryPlans", matchingPlan.id);
      const updatedDays = matchingPlan.days.map((day) => {
        if (day.day === dayNum) {
          const isComp = !day.completed;
          // Trigger rewards on complete
          if (isComp) {
            addXP(25);
            addCoins(10);
          }
          return { ...day, completed: isComp };
        }
        return day;
      });

      await updateDoc(planRef, { days: updatedDays });
      
      // Update local state if selectedDay is open
      if (selectedDay && selectedDay.day === dayNum) {
        setSelectedDay({ ...selectedDay, completed: !selectedDay.completed });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/recoveryPlans/${matchingPlan.id}`);
    } finally {
      setUpdating(false);
    }
  };

  if (!activeHabit) {
    return (
      <div className="max-w-xl mx-auto text-center py-12 px-4 space-y-4">
        <Compass className="w-12 h-12 text-neutral-300 mx-auto" />
        <h2 className="text-xl font-bold font-sans tracking-tight text-neutral-900">No Active Habit Selected</h2>
        <p className="text-sm text-neutral-500">Please select or analyze a bad habit from your dashboard to configure a substitution Roadmap.</p>
      </div>
    );
  }

  if (!matchingPlan) {
    return (
      <div className="max-w-xl mx-auto text-center py-12 px-4 space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold font-sans tracking-tight text-neutral-900">Roadmap Not Found</h2>
        <p className="text-sm text-neutral-500">We could not find a 21-day recovery roadmap for "{activeHabit.name}". Start the diagnostic process to forge one instantly.</p>
      </div>
    );
  }

  const completedDaysCount = matchingPlan.days.filter((d) => d.completed).length;
  const progressPercent = Math.floor((completedDaysCount / 21) * 100);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Roadmap header & progress bar */}
      <div className="bg-white border border-[#E5E5E7] rounded-[32px] p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
            Active Substitution Program
          </span>
          <h1 className="text-2xl font-semibold text-[#1D1D1F] font-sans tracking-tight mt-1">{activeHabit.name} Roadmap</h1>
          <p className="text-xs text-[#86868B]">Track milestones, maintain morning routines, and claim gold tokens.</p>
        </div>

        <div className="w-full md:w-64 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-[#1D1D1F]">
            <span>Overall Progress</span>
            <span className="text-blue-600 font-bold">{completedDaysCount}/21 Days ({progressPercent}%)</span>
          </div>
          <div className="w-full h-3 bg-[#F5F5F7] rounded-full overflow-hidden border border-[#D2D2D7]/60">
            <div 
              className="bg-blue-600 h-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Routine Blocks */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E5E5E7] rounded-[24px] p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-[#1D1D1F] flex items-center gap-2 mb-3">
            <Sunrise className="w-4.5 h-4.5 text-blue-600" /> Morning Substitution Routine
          </h3>
          <p className="text-xs text-[#86868B] leading-relaxed">{matchingPlan.morningRoutine}</p>
        </div>

        <div className="bg-white border border-[#E5E5E7] rounded-[24px] p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-[#1D1D1F] flex items-center gap-2 mb-3">
            <Sunset className="w-4.5 h-4.5 text-blue-600" /> Evening Substitutive Routine
          </h3>
          <p className="text-xs text-[#86868B] leading-relaxed">{matchingPlan.eveningRoutine}</p>
        </div>
      </div>

      {/* 21-Day Road Grid */}
      <div>
        <h3 className="text-base font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
          <Star className="w-4.5 h-4.5 text-blue-600" /> 21-Day Journey Milestones
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-4">
          {matchingPlan.days.map((day) => {
            const isSelect = selectedDay?.day === day.day;
            return (
              <button
                key={day.day}
                onClick={() => setSelectedDay(day)}
                className={`aspect-square rounded-2xl border transition-all flex flex-col justify-between p-3.5 text-left relative overflow-hidden group ${
                  day.completed 
                    ? "bg-[#F5F5F7] border-[#D2D2D7] text-blue-600 shadow-none" 
                    : isSelect 
                      ? "bg-white border-blue-600 shadow-sm ring-1 ring-blue-600" 
                      : "bg-white border-[#E5E5E7] hover:border-[#D2D2D7] shadow-sm"
                }`}
              >
                <div className="text-[10px] font-bold font-mono uppercase tracking-widest text-[#86868B] group-hover:text-[#1D1D1F] transition-colors">
                  Day {day.day}
                </div>

                {day.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-[#34C759] self-end" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-[#D2D2D7] self-end flex items-center justify-center text-[10px] font-semibold group-hover:bg-[#F5F5F7] text-[#1D1D1F]">
                    {day.day}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day details Drawer/Card */}
      {selectedDay && (
        <div className="bg-white border border-[#E5E5E7] rounded-[32px] p-8 shadow-sm space-y-5">
          <div className="flex justify-between items-center pb-4 border-b border-[#E5E5E7]">
            <div>
              <span className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wider">Milestone Blueprint</span>
              <h3 className="text-lg font-semibold text-[#1D1D1F] font-sans mt-0.5">Day {selectedDay.day} Focus</h3>
            </div>
            <button 
              onClick={() => setSelectedDay(null)}
              className="text-xs text-[#86868B] hover:text-[#1D1D1F] font-semibold"
            >
              Close
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 pt-2">
            <div className="space-y-4 md:col-span-2">
              <div>
                <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">Focus Phase</span>
                <p className="text-xs text-[#1D1D1F] mt-1.5 leading-relaxed">{selectedDay.description}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-[#F5F5F7] p-5 rounded-2xl border border-[#D2D2D7]/60">
                  <div className="text-[10px] font-bold text-[#1D1D1F] uppercase tracking-wider flex items-center gap-1.5">
                    <Sunrise className="w-3.5 h-3.5 text-blue-600" /> Morning Target
                  </div>
                  <p className="text-xs text-[#86868B] mt-1.5 leading-relaxed">{selectedDay.morningGoal}</p>
                </div>

                <div className="bg-[#F5F5F7] p-5 rounded-2xl border border-[#D2D2D7]/60">
                  <div className="text-[10px] font-bold text-[#1D1D1F] uppercase tracking-wider flex items-center gap-1.5">
                    <Sunset className="w-3.5 h-3.5 text-blue-600" /> Evening Target
                  </div>
                  <p className="text-xs text-[#86868B] mt-1.5 leading-relaxed">{selectedDay.eveningGoal}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-[#F5F5F7]/50 p-5 rounded-2xl border border-[#D2D2D7]/40">
              <div>
                <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">Alternate Substitution</span>
                <p className="text-xs text-[#1D1D1F] mt-1.5 leading-relaxed font-medium">{selectedDay.alternateActivity}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">AI Coach Tip</span>
                <p className="text-xs text-[#86868B] leading-relaxed mt-1.5 italic">"{selectedDay.tips}"</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">Unlockable Reward</span>
                <p className="text-xs font-semibold text-blue-600 mt-1.5">{selectedDay.reward}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#E5E5E7]">
            <button
              onClick={() => handleToggleDayComplete(selectedDay.day)}
              disabled={updating}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                selectedDay.completed
                  ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
              }`}
            >
              {updating ? (
                <>
                  Syncing Progress... <RefreshCw className="w-3 animate-spin" />
                </>
              ) : selectedDay.completed ? (
                <>
                  Mark Incomplete <Check className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  Check off Day {selectedDay.day} (+25 XP) <CheckCircle2 className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
