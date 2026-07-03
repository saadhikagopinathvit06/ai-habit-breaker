import React, { useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  sendEmailVerification, 
  updateProfile 
} from "firebase/auth";
import { loginWithGoogle, auth } from "../lib/firebase";
import { Shield, Sparkles, Mail, Lock, User, Compass } from "lucide-react";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || "Failed to log in with Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      if (isForgot) {
        if (!email) throw new Error("Please enter your email.");
        await sendPasswordResetEmail(auth, email);
        setInfo("Reset email sent! Please check your inbox.");
        setIsForgot(false);
      } else if (isSignUp) {
        if (!email || !password || !name) throw new Error("Please fill out all fields.");
        if (password.length < 6) throw new Error("Password must be at least 6 characters.");
        
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCred.user, { displayName: name });
        try {
          await sendEmailVerification(userCred.user);
          setInfo("Verification email sent! Please verify your address.");
        } catch (vErr) {
          console.warn("Could not send verification email:", vErr);
        }
      } else {
        if (!email || !password) throw new Error("Please fill out all fields.");
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let errMsg = err.message;
      if (err.code === "auth/operation-not-allowed") {
        errMsg = "Email/Password sign-in is not enabled by default. Please click 'Continue with Google' for immediate entry, or enable Email/Password provider in the Firebase Console.";
      } else if (err.code === "auth/user-not-found") {
        errMsg = "No account found with this email.";
      } else if (err.code === "auth/wrong-password") {
        errMsg = "Incorrect password.";
      } else if (err.code === "auth/email-already-in-use") {
        errMsg = "An account already exists with this email.";
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] p-6 relative overflow-hidden">
      {/* Background design accents */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100/40 rounded-full filter blur-3xl opacity-30 -translate-x-20 -translate-y-20"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-50/40 rounded-full filter blur-3xl opacity-30 translate-x-20 translate-y-20"></div>

      <div className="w-full max-w-md bg-white border border-[#E5E5E7] rounded-[32px] p-8 shadow-sm relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-blue-600 text-white rounded-2xl mb-4 shadow-sm">
            <Compass className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-semibold font-sans tracking-tight text-[#1D1D1F]">
            {isForgot ? "Reset Password" : isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-xs text-[#86868B] mt-1.5 font-medium">
            {isForgot 
              ? "We'll send you an recovery link." 
              : isSignUp 
                ? "Start your journey toward cognitive habits mastery." 
                : "Sign in to access your dashboard & AI coach."}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs leading-relaxed mb-6">
            {error}
          </div>
        )}

        {info && (
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600 text-xs leading-relaxed mb-6">
            {info}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isForgot && isSignUp && (
            <div>
              <label className="block text-[10px] font-bold text-[#86868B] uppercase tracking-wider mb-2">
                Display Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#86868B]">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#F5F5F7] border border-[#E5E5E7]/80 rounded-2xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs text-[#1D1D1F] placeholder-[#86868B] transition-all"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-[#86868B] uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#86868B]">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#F5F5F7] border border-[#E5E5E7]/80 rounded-2xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs text-[#1D1D1F] placeholder-[#86868B] transition-all"
                required
              />
            </div>
          </div>

          {!isForgot && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-bold text-[#86868B] uppercase tracking-wider">
                  Password
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => setIsForgot(true)}
                    className="text-xs font-semibold text-[#86868B] hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#86868B]">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#F5F5F7] border border-[#E5E5E7]/80 rounded-2xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs text-[#1D1D1F] placeholder-[#86868B] transition-all"
                  required={!isForgot}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white hover:bg-blue-700 font-sans font-semibold text-xs rounded-2xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? "Please wait..." : isForgot ? "Send Reset Email" : isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E5E5E7]"></div>
          </div>
          <span className="relative bg-white px-3 text-[10px] text-[#86868B] font-bold uppercase tracking-wider">
            Or continue with
          </span>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 border border-[#E5E5E7] bg-white hover:bg-[#F5F5F7] hover:border-[#D2D2D7] font-sans font-semibold text-xs rounded-2xl text-[#1D1D1F] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.86-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.11C18.281 1.09 15.548 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.84 11.57-11.72 0-.795-.085-1.4-.195-2H12.24z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="text-center mt-6">
          <button
            onClick={() => {
              setIsForgot(false);
              setIsSignUp(!isSignUp);
              setError(null);
              setInfo(null);
            }}
            className="text-xs font-semibold text-[#86868B] hover:text-blue-600 transition-colors cursor-pointer"
          >
            {isForgot 
              ? "Back to login" 
              : isSignUp 
                ? "Already have an account? Sign In" 
                : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
