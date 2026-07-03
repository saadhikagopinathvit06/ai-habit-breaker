import React, { useState } from "react";
import { AppProvider, useApp } from "./lib/context";
import Auth from "./components/Auth";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import HabitAnalysis from "./components/HabitAnalysis";
import RecoveryPlanView from "./components/RecoveryPlanView";
import DailyChallenges from "./components/DailyChallenges";
import AICoach from "./components/AICoach";
import HabitJournal from "./components/HabitJournal";
import ProfileSettings from "./components/ProfileSettings";
import AdminPanel from "./components/AdminPanel";
import { 
  Brain, Compass, Target, Zap, Bot, BookOpen, Settings, 
  Shield, Menu, X, Check, Award, Coins
} from "lucide-react";

function AppContent() {
  const { user, profile, activeHabit, loading, isAdmin } = useApp();
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F7] space-y-4">
        <div className="p-4 bg-blue-600 text-white rounded-2xl animate-pulse shadow-sm">
          <Brain className="w-8 h-8" />
        </div>
        <div className="text-xs font-semibold text-[#86868B] font-sans tracking-tight">
          Rebuilding neural pathways...
        </div>
      </div>
    );
  }

  // Guest Landing View
  if (!user) {
    return (
      <>
        {showAuthOverlay ? (
          <div className="relative">
            <button 
              onClick={() => setShowAuthOverlay(false)}
              className="absolute top-6 left-6 z-50 px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold rounded-xl flex items-center gap-1 shadow transition-all"
            >
              ← Back to Landing
            </button>
            <Auth />
          </div>
        ) : (
          <LandingPage onGetStarted={() => setShowAuthOverlay(true)} />
        )}
      </>
    );
  }

  // Tab router
  const renderTabContent = () => {
    switch (currentTab) {
      case "dashboard":
        return <Dashboard onNavigate={(tab) => setCurrentTab(tab)} />;
      case "analyze":
        return <HabitAnalysis onNavigate={(tab) => setCurrentTab(tab)} />;
      case "roadmap":
        return <RecoveryPlanView />;
      case "quests":
        return <DailyChallenges />;
      case "coach":
        return <AICoach />;
      case "journal":
        return <HabitJournal />;
      case "settings":
        return <ProfileSettings />;
      case "admin":
        return isAdmin ? <AdminPanel /> : <Dashboard onNavigate={(tab) => setCurrentTab(tab)} />;
      default:
        return <Dashboard onNavigate={(tab) => setCurrentTab(tab)} />;
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <Compass className="w-4 h-4" /> },
    { id: "analyze", label: "Diagnostics", icon: <Brain className="w-4 h-4" /> },
    { id: "roadmap", label: "Roadmap", icon: <Target className="w-4 h-4" /> },
    { id: "quests", label: "AI Quests", icon: <Zap className="w-4 h-4" /> },
    { id: "coach", label: "AI Coach", icon: <Bot className="w-4 h-4" /> },
    { id: "journal", label: "Reflections", icon: <BookOpen className="w-4 h-4" /> },
    { id: "settings", label: "Profile", icon: <Settings className="w-4 h-4" /> }
  ];

  if (isAdmin) {
    navItems.push({ id: "admin", label: "Ops Panel", icon: <Shield className="w-4 h-4" /> });
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col">
      {/* Dynamic Workspace Header */}
      <header className="sticky top-0 z-40 bg-white/60 backdrop-blur-xl border-b border-[#D2D2D7] px-6 py-4 shrink-0">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
              <Brain className="w-4.5 h-4.5" />
            </div>
            <span className="font-sans font-semibold tracking-tight text-[#1D1D1F] text-lg">HabitBreaker</span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#F5F5F7] p-1 rounded-xl border border-[#D2D2D7]">
            {navItems.map((item) => {
              const isAct = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
                    isAct 
                      ? "bg-white text-blue-600 shadow-sm border border-[#E5E5E7]" 
                      : "text-[#86868B] hover:text-[#1D1D1F]"
                  }`}
                >
                  <span className={`${isAct ? "text-blue-600" : "text-[#86868B]"}`}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Quick Level Capsule */}
          <div className="hidden sm:flex items-center gap-4 bg-white border border-[#D2D2D7] px-4 py-2 rounded-full shadow-sm text-xs font-semibold text-[#1D1D1F]">
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-blue-600" /> Lvl {profile?.level}
            </span>
            <div className="w-[1px] h-3.5 bg-[#D2D2D7]"></div>
            <span className="flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500/10" /> {profile?.coins} Gold
            </span>
            {profile?.premium && (
              <>
                <div className="w-[1px] h-3.5 bg-[#D2D2D7]"></div>
                <span className="bg-blue-600 text-white text-[8px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider">
                  Pro Plan
                </span>
              </>
            )}
          </div>

          {/* Mobile hamburger toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#1D1D1F] hover:text-black transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-[#F5F5F7]/95 backdrop-blur-xl pt-20 px-6">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isAct = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full p-4 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all ${
                    isAct 
                      ? "bg-blue-600 text-white shadow" 
                      : "bg-white border border-[#E5E5E7] text-[#1D1D1F] hover:bg-neutral-50"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Main Container viewport */}
      <main className="flex-1 overflow-y-auto pb-16">
        {renderTabContent()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
