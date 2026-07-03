import React, { useState } from "react";
import { useApp } from "../lib/context";
import { doc, updateDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType, logoutUser } from "../lib/firebase";
import { 
  Award, ShieldCheck, Sparkles, User, Settings, Bell, 
  ChevronRight, LogOut, CheckCircle2, Star, Coins, Zap
} from "lucide-react";

export default function ProfileSettings() {
  const { user, profile, addXP, togglePremium } = useApp();
  const [name, setName] = useState(profile?.name || "");
  const [age, setAge] = useState(profile?.age || "");
  const [occupation, setOccupation] = useState(profile?.occupation || "");
  const [habitGoals, setHabitGoals] = useState(profile?.habitGoals || "");
  const [emailNotif, setEmailNotif] = useState(profile?.reminderPreferences?.email ?? true);
  const [browserNotif, setBrowserNotif] = useState(profile?.reminderPreferences?.browser ?? true);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setUpdating(true);
    setSuccess(false);

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        name,
        age,
        occupation,
        habitGoals,
        reminderPreferences: {
          email: emailNotif,
          browser: browserNotif,
          push: true
        }
      });

      setSuccess(true);
      await addXP(15); // reward minor XP for setting up profile
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setUpdating(false);
    }
  };

  const badgeIcons: Record<string, string> = {
    "First Step": "🌱",
    "3-Day Streak": "🔥",
    "7-Day Warrior": "🛡️",
    "14-Day Champion": "👑",
    "21-Day Habit Breaker": "⚡",
    "One Month Strong": "💎"
  };

  const badgeDescriptions: Record<string, string> = {
    "First Step": "Initiated your first bad habit analysis diagnostic.",
    "3-Day Streak": "Achieved level 3 and established initial substitution momentum.",
    "7-Day Warrior": "Achieved level 5. Rebuilt focus loops under immediate trigger pressure.",
    "14-Day Champion": "Achieved level 8. Complete shield integrity established.",
    "21-Day Habit Breaker": "Achieved level 12. 21 days of neural rewiring completed.",
    "One Month Strong": "Maintained unshakeable habit control for a full standard phase."
  };

  const availableBadges = ["First Step", "3-Day Streak", "7-Day Warrior", "14-Day Champion", "21-Day Habit Breaker", "One Month Strong"];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header card with core level metrics */}
      <div className="bg-white border border-[#E5E5E7] p-8 rounded-[32px] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-3xl font-bold shadow-sm">
            {profile?.name ? profile.name.substring(0, 2).toUpperCase() : "HB"}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#1D1D1F] font-sans tracking-tight">{profile?.name || "Habit Breaker"}</h1>
            <p className="text-xs text-[#86868B] mt-0.5">Email: {profile?.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5">
                <Zap className="w-3 h-3 fill-blue-500 text-blue-500" /> Level {profile?.level}
              </span>
              <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5">
                <Coins className="w-3 h-3 fill-amber-500 text-amber-500" /> {profile?.coins} Gold
              </span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => logoutUser()}
          className="px-4 py-2 border border-[#E5E5E7] hover:border-red-300 hover:bg-red-50 text-[#86868B] hover:text-red-600 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          Sign Out <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Premium Trial Toggle card */}
      <div className={`p-8 rounded-[32px] shadow-sm border flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${
        profile?.premium 
          ? "bg-[#1D1D1F] text-white border-black" 
          : "bg-blue-50 text-[#1D1D1F] border-blue-100"
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className={`w-4.5 h-4.5 ${profile?.premium ? "text-amber-400" : "text-blue-600"}`} />
            <h3 className="font-semibold text-base">
              {profile?.premium ? "Infinite Rewiring Member" : "Standard Forge Account"}
            </h3>
          </div>
          <p className={`text-xs leading-relaxed ${profile?.premium ? "text-[#86868B]" : "text-[#86868B]"}`}>
            {profile?.premium 
              ? "You have premium privileges: Unlimited AI diagnostics, priority chatbot servers, and mood insights enabled." 
              : "Upgrade to premium to unlock unconstrained chats, unlimited habit slots, and exportable PDF progress charts."}
          </p>
        </div>

        <button
          onClick={togglePremium}
          className={`px-5 py-2.5 text-xs font-semibold rounded-xl cursor-pointer shadow-sm transition-colors shrink-0 ${
            profile?.premium 
              ? "bg-white text-[#1D1D1F] hover:bg-[#F5F5F7]" 
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {profile?.premium ? "Downgrade Profile" : "Trial Premium Free"}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Settings form column */}
        <div className="lg:col-span-2 bg-white border border-[#E5E5E7] rounded-[32px] p-8 shadow-sm space-y-6">
          <h3 className="text-sm font-semibold text-[#1D1D1F] flex items-center gap-2 pb-3 border-b border-[#F5F5F7]">
            <Settings className="w-4.5 h-4.5 text-blue-600" /> Account Settings
          </h3>

          {success && (
            <div className="p-4 bg-blue-50 border border-blue-100 text-blue-600 text-xs rounded-xl font-semibold">
              Profile updated successfully! (+15 XP awarded)
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-bold text-[#86868B] uppercase tracking-wider mb-2">Display Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Mitchell" 
                  required
                  className="w-full px-4 py-2.5 bg-[#F5F5F7] border border-[#E5E5E7]/80 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs text-[#1D1D1F] placeholder-[#86868B] transition-all" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#86868B] uppercase tracking-wider mb-2">Age</label>
                <input 
                  type="text" 
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 25" 
                  className="w-full px-4 py-2.5 bg-[#F5F5F7] border border-[#E5E5E7]/80 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs text-[#1D1D1F] placeholder-[#86868B] transition-all" 
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-bold text-[#86868B] uppercase tracking-wider mb-2">Occupation</label>
                <input 
                  type="text" 
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="e.g. Software Engineer" 
                  className="w-full px-4 py-2.5 bg-[#F5F5F7] border border-[#E5E5E7]/80 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs text-[#1D1D1F] placeholder-[#86868B] transition-all" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#86868B] uppercase tracking-wider mb-2">Primary Habit Goal</label>
                <input 
                  type="text" 
                  value={habitGoals}
                  onChange={(e) => setHabitGoals(e.target.value)}
                  placeholder="e.g. Break social doom scrolling and fix sleep routines" 
                  className="w-full px-4 py-2.5 bg-[#F5F5F7] border border-[#E5E5E7]/80 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs text-[#1D1D1F] placeholder-[#86868B] transition-all" 
                />
              </div>
            </div>

            {/* Notification triggers */}
            <div className="pt-2 border-t border-[#F5F5F7]">
              <span className="block text-[10px] font-bold text-[#86868B] uppercase tracking-wider mb-3">Reminder Preferences</span>
              <div className="space-y-3">
                <label className="flex items-center gap-2.5 text-xs text-[#1D1D1F] font-medium cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={emailNotif}
                    onChange={(e) => setEmailNotif(e.target.checked)}
                    className="rounded border-[#E5E5E7] text-blue-600 focus:ring-blue-600 w-4 h-4 cursor-pointer" 
                  />
                  <span>Send daily substitution insights via email</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-[#1D1D1F] font-medium cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={browserNotif}
                    onChange={(e) => setBrowserNotif(e.target.checked)}
                    className="rounded border-[#E5E5E7] text-blue-600 focus:ring-blue-600 w-4 h-4 cursor-pointer" 
                  />
                  <span>Allow browser/push notifications for urgent substitution cues</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#F5F5F7]">
              <button 
                type="submit"
                disabled={updating}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                {updating ? "Saving Changes..." : "Save Settings"}
              </button>
            </div>
          </form>
        </div>

        {/* Badges and achievements Column */}
        <div className="bg-white border border-[#E5E5E7] rounded-[32px] p-8 shadow-sm space-y-6">
          <h3 className="text-sm font-semibold text-[#1D1D1F] flex items-center gap-2 pb-3 border-b border-[#F5F5F7]">
            <Award className="w-4.5 h-4.5 text-blue-600" /> Unlocked Achievements
          </h3>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {availableBadges.map((badge) => {
              const hasBadge = profile?.badges?.includes(badge) ?? false;
              return (
                <div 
                  key={badge} 
                  className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                    hasBadge 
                      ? "bg-[#F5F5F7]/80 border-[#E5E5E7] text-[#1D1D1F]" 
                      : "bg-[#F5F5F7]/30 border-[#E5E5E7]/40 text-[#86868B] opacity-50"
                  }`}
                >
                  <div className="text-2xl shrink-0 p-2 bg-white rounded-xl border border-[#E5E5E7] shadow-sm">{badgeIcons[badge]}</div>
                  <div>
                    <div className="text-xs font-semibold flex items-center gap-1.5 text-[#1D1D1F]">
                      {badge} {hasBadge && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-[#86868B] leading-relaxed mt-1">{badgeDescriptions[badge]}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
