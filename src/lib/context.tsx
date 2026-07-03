import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, onSnapshot, updateDoc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "./firebase";
import { UserProfile, Habit, RecoveryPlan, Challenge, JournalEntry, ChatMessage } from "../types";

interface AppContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  habits: Habit[];
  activeHabit: Habit | null;
  setActiveHabit: (habit: Habit | null) => void;
  recoveryPlans: RecoveryPlan[];
  challenges: Challenge[];
  journals: JournalEntry[];
  chats: ChatMessage[];
  loading: boolean;
  isAdmin: boolean;
  addXP: (amount: number) => Promise<void>;
  addCoins: (amount: number) => Promise<void>;
  togglePremium: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [activeHabit, setActiveHabitState] = useState<Habit | null>(null);
  const [recoveryPlans, setRecoveryPlans] = useState<RecoveryPlan[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.email === "saadhikagopinathvit06@gmail.com" || profile?.email === "admin@habitbreaker.ai";

  // Helper to sync Active Habit state
  const setActiveHabit = (h: Habit | null) => {
    setActiveHabitState(h);
    if (h) {
      localStorage.setItem("active_habit_id", h.id);
    } else {
      localStorage.removeItem("active_habit_id");
    }
  };

  // 1. Listen to Auth State changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch or Initialize User Profile in Firestore
        const userRef = doc(db, "users", currentUser.uid);
        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            // Create user profile
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              name: currentUser.displayName || currentUser.email?.split("@")[0] || "User",
              email: currentUser.email || "",
              xp: 0,
              level: 1,
              coins: 10,
              badges: ["First Step"],
              premium: false,
              createdAt: new Date().toISOString()
            };
            await setDoc(userRef, newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          console.error("Error setting up user profile:", error);
        }
      } else {
        setProfile(null);
        setHabits([]);
        setActiveHabitState(null);
        setRecoveryPlans([]);
        setChallenges([]);
        setJournals([]);
        setChats([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time Subscription to Subcollections
  useEffect(() => {
    if (!user) return;

    // Subscriptions setup
    const habitsPath = `users/${user.uid}/habits`;
    const plansPath = `users/${user.uid}/recoveryPlans`;
    const challengesPath = `users/${user.uid}/challenges`;
    const journalsPath = `users/${user.uid}/journals`;
    const chatsPath = `users/${user.uid}/chats`;

    // 1. Habits
    const unsubHabits = onSnapshot(
      collection(db, "users", user.uid, "habits"),
      (snapshot) => {
        const list: Habit[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Habit);
        });
        setHabits(list);

        // Recover last active habit
        const savedId = localStorage.getItem("active_habit_id");
        if (savedId) {
          const match = list.find((h) => h.id === savedId);
          if (match) setActiveHabitState(match);
          else if (list.length > 0) setActiveHabitState(list[0]);
        } else if (list.length > 0 && !activeHabit) {
          setActiveHabitState(list[0]);
        }
      },
      (error) => handleFirestoreError(error, OperationType.LIST, habitsPath)
    );

    // 2. Plans
    const unsubPlans = onSnapshot(
      collection(db, "users", user.uid, "recoveryPlans"),
      (snapshot) => {
        const list: RecoveryPlan[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as RecoveryPlan);
        });
        setRecoveryPlans(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, plansPath)
    );

    // 3. Challenges
    const unsubChallenges = onSnapshot(
      collection(db, "users", user.uid, "challenges"),
      (snapshot) => {
        const list: Challenge[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Challenge);
        });
        setChallenges(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, challengesPath)
    );

    // 4. Journals
    const unsubJournals = onSnapshot(
      collection(db, "users", user.uid, "journals"),
      (snapshot) => {
        const list: JournalEntry[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as JournalEntry);
        });
        // Sort newest first
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setJournals(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, journalsPath)
    );

    // 5. Chats
    const unsubChats = onSnapshot(
      collection(db, "users", user.uid, "chats"),
      (snapshot) => {
        const list: ChatMessage[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as ChatMessage);
        });
        // Sort oldest first for conversation order
        list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setChats(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, chatsPath)
    );

    return () => {
      unsubHabits();
      unsubPlans();
      unsubChallenges();
      unsubJournals();
      unsubChats();
    };
  }, [user]);

  // Real-time user profile subscription
  useEffect(() => {
    if (!user) return;
    const unsubProfile = onSnapshot(
      doc(db, "users", user.uid),
      (snap) => {
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
        }
      },
      (err) => console.error("Profile sync error:", err)
    );
    return () => unsubProfile();
  }, [user]);

  // Gamification: Add XP & Level Up Logic
  const addXP = async (amount: number) => {
    if (!user || !profile) return;
    const userRef = doc(db, "users", user.uid);
    try {
      const newXp = profile.xp + amount;
      // Formula: level up every 100 XP
      const newLevel = Math.floor(newXp / 100) + 1;
      const badges = [...profile.badges];

      // Badge unlock rules
      if (newLevel >= 3 && !badges.includes("3-Day Streak")) {
        badges.push("3-Day Streak");
      }
      if (newLevel >= 5 && !badges.includes("7-Day Warrior")) {
        badges.push("7-Day Warrior");
      }
      if (newLevel >= 8 && !badges.includes("14-Day Champion")) {
        badges.push("14-Day Champion");
      }
      if (newLevel >= 12 && !badges.includes("21-Day Habit Breaker")) {
        badges.push("21-Day Habit Breaker");
      }

      await updateDoc(userRef, {
        xp: newXp,
        level: newLevel,
        badges
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  // Gamification: Add Coins
  const addCoins = async (amount: number) => {
    if (!user || !profile) return;
    const userRef = doc(db, "users", user.uid);
    try {
      await updateDoc(userRef, {
        coins: profile.coins + amount
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  // Premium toggle
  const togglePremium = async () => {
    if (!user || !profile) return;
    const userRef = doc(db, "users", user.uid);
    try {
      await updateDoc(userRef, {
        premium: !profile.premium
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      setProfile(snap.data() as UserProfile);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        profile,
        habits,
        activeHabit,
        setActiveHabit,
        recoveryPlans,
        challenges,
        journals,
        chats,
        loading,
        isAdmin,
        addXP,
        addCoins,
        togglePremium,
        refreshProfile
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
