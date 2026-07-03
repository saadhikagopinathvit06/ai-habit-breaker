import React, { useState } from "react";
import { useApp } from "../lib/context";
import { doc, updateDoc, setDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { Award, Check, RefreshCw, Zap, Star, Sparkles, AlertCircle } from "lucide-react";
import { Challenge } from "../types";

export default function DailyChallenges() {
  const { user, challenges, addXP, addCoins } = useApp();
  const [loadingChallengeId, setLoadingChallengeId] = useState<string | null>(null);

  const handleUpdateStatus = async (challengeId: string, status: "completed" | "skipped") => {
    if (!user) return;
    setLoadingChallengeId(challengeId);

    try {
      const challengeRef = doc(db, "users", user.uid, "challenges", challengeId);
      await updateDoc(challengeRef, { status });

      if (status === "completed") {
        // Find challenge details to award correct amounts
        const match = challenges.find((c) => c.id === challengeId);
        const xpReward = match?.xp || 20;
        const coinsReward = match?.coins || 5;
        
        await addXP(xpReward);
        await addCoins(coinsReward);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/challenges/${challengeId}`);
    } finally {
      setLoadingChallengeId(null);
    }
  };

  const handleGenerateBackupChallenge = async () => {
    if (!user) return;
    const backupId = "challenge_" + Math.random().toString(36).substring(2, 9);
    const backupTasks = [
      { title: "No Social Media 30 Mins", desc: "Keep all devices locked in another room for 30 consecutive minutes.", xp: 30, coins: 10 },
      { title: "Drink 2 Liters of Water", desc: "Maintain full brain hydration to reduce anxious cravings.", xp: 20, coins: 5 },
      { title: "Read 10 Pages", desc: "Engage deep reading attention to rebuild cognitive focus spans.", xp: 25, coins: 8 },
      { title: "Go for a 20-min Walk", desc: "Get natural sunshine to stabilize serotonin and trigger substitution.", xp: 20, coins: 5 }
    ];
    
    const randomTask = backupTasks[Math.floor(Math.random() * backupTasks.length)];
    
    const challengePayload: Challenge = {
      id: backupId,
      userId: user.uid,
      title: randomTask.title,
      description: randomTask.desc,
      xp: randomTask.xp,
      coins: randomTask.coins,
      status: "pending",
      date: new Date().toISOString().split("T")[0]
    };

    try {
      await setDoc(doc(db, "users", user.uid, "challenges", backupId), challengePayload);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/challenges/${backupId}`);
    }
  };

  const pendingChallenges = challenges.filter((c) => c.status === "pending");
  const completedChallenges = challenges.filter((c) => c.status === "completed");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white border border-[#E5E5E7] rounded-[32px] p-8 shadow-sm">
        <div>
          <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 uppercase tracking-wider">
            Cognitive Quests
          </span>
          <h1 className="text-2xl font-semibold text-[#1D1D1F] font-sans tracking-tight mt-1.5">Daily AI Challenges</h1>
          <p className="text-xs text-[#86868B] mt-1">Complete unique gamified challenges to gain XP, unlock badges, and earn coins.</p>
        </div>

        <button 
          onClick={handleGenerateBackupChallenge}
          className="px-5 py-2.5 bg-blue-600 text-white hover:bg-blue-700 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-all shadow-sm shrink-0"
        >
          Request Quest <Sparkles className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Active Challenges list */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-[#1D1D1F] flex items-center gap-2">
          <Zap className="w-4.5 h-4.5 text-blue-600" /> Active Quests
        </h2>

        {pendingChallenges.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {pendingChallenges.map((challenge) => (
              <div 
                key={challenge.id} 
                className="bg-white border border-[#E5E5E7] rounded-2xl p-6 shadow-sm hover:border-[#D2D2D7] transition-all flex flex-col justify-between space-y-5"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-semibold text-[#1D1D1F]">{challenge.title}</h3>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">Active</span>
                  </div>
                  <p className="text-xs text-[#86868B] mt-2 leading-relaxed">{challenge.description}</p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-[#F5F5F7]">
                  <div className="flex gap-2 text-[10px] font-semibold">
                    <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded">+{challenge.xp} XP</span>
                    <span className="bg-[#F5F5F7] text-[#1D1D1F] border border-[#D2D2D7]/60 px-2.5 py-1 rounded">+{challenge.coins} Coins</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      disabled={loadingChallengeId === challenge.id}
                      onClick={() => handleUpdateStatus(challenge.id, "skipped")}
                      className="px-2.5 py-1.5 hover:bg-[#F5F5F7] text-[#86868B] hover:text-[#1D1D1F] text-xs font-semibold rounded-lg transition-colors"
                    >
                      Skip
                    </button>
                    <button
                      disabled={loadingChallengeId === challenge.id}
                      onClick={() => handleUpdateStatus(challenge.id, "completed")}
                      className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      {loadingChallengeId === challenge.id ? (
                        <RefreshCw className="w-3 animate-spin" />
                      ) : (
                        <>
                          Complete <Check className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white border border-dashed border-[#D2D2D7] rounded-3xl">
            <AlertCircle className="w-10 h-10 text-[#86868B]/40 mx-auto" />
            <h3 className="text-sm font-semibold text-[#1D1D1F] mt-3">All clear!</h3>
            <p className="text-xs text-[#86868B] mt-1.5 max-w-[240px] mx-auto leading-relaxed">No active challenges. Click 'Request Quest' above to fetch a new micro-task immediately.</p>
          </div>
        )}
      </div>

      {/* Completed Challenges List */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-[#1D1D1F] flex items-center gap-2">
          <Star className="w-4.5 h-4.5 text-yellow-500 fill-yellow-500" /> Completed Quests
        </h2>

        {completedChallenges.length > 0 ? (
          <div className="bg-white border border-[#E5E5E7] rounded-2xl p-6 divide-y divide-[#E5E5E7] shadow-sm">
            {completedChallenges.map((challenge) => (
              <div key={challenge.id} className="py-4 flex justify-between items-center gap-4 text-xs first:pt-0 last:pb-0">
                <div>
                  <div className="font-semibold text-[#1D1D1F] line-through">{challenge.title}</div>
                  <div className="text-[10px] text-[#86868B] mt-1">{challenge.description}</div>
                </div>
                <div className="flex items-center gap-1.5 font-sans text-[10px] font-bold text-[#34C759] shrink-0 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                  <Check className="w-3.5 h-3.5" /> CLAIMED
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#86868B] italic">No historical challenges completed in this focus phase.</p>
        )}
      </div>
    </div>
  );
}
