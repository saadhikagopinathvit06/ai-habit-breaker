import React, { useState } from "react";
import { 
  ArrowRight, Check, Play, ShieldAlert, Sparkles, Brain, Award, 
  MessageSquare, BookOpen, Clock, Activity, Zap, HelpCircle, Send 
} from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [testInput, setTestInput] = useState("");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSuccess, setContactSuccess] = useState(false);

  const stats = [
    { value: "92%", label: "Plan Completion Rate" },
    { value: "4.8/5", label: "AI Support Rating" },
    { value: "14 Days", label: "Average Break Time" },
    { value: "250K+", label: "Bad Habits Overcome" }
  ];

  const features = [
    {
      icon: <Brain className="w-6 h-6 text-neutral-800" />,
      title: "AI Cognitive Analysis",
      description: "Describe any habit in pure natural language. Our specialized Gemini network analyzes emotional triggers, root causes, and long-term risks."
    },
    {
      icon: <Award className="w-6 h-6 text-neutral-800" />,
      title: "21-Day Neural Rewiring",
      description: "Get a highly structured, progressive day-by-day substitution protocol tailored specifically around your psychological triggers."
    },
    {
      icon: <Activity className="w-6 h-6 text-neutral-800" />,
      title: "Gamified Habit Forge",
      description: "Earn experience points (XP), rise through levels, collect gold coins, and unlock gorgeous badges for completing routines."
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-neutral-800" />,
      title: "Interactive AI Coach",
      description: "A 24/7 dedicated behavioral companion that answers questions, guides triggers in real-time, and provides urgent motivation."
    },
    {
      icon: <BookOpen className="w-6 h-6 text-neutral-800" />,
      title: "Smart Mood Journal",
      description: "Log daily experiences, reflections, and emotions. The AI automatically detects correlations between your mood and habit progress."
    },
    {
      icon: <Clock className="w-6 h-6 text-neutral-800" />,
      title: "Smart System Prompts",
      description: "Intelligent scheduled reminders and progressive nudge mechanisms designed to strengthen self-discipline on autopilot."
    }
  ];

  const pricingPlans = [
    {
      name: "Standard Forge",
      price: "Free",
      description: "Everything you need to analyze and tackle your first habit.",
      features: [
        "Track 1 Active Bad Habit",
        "AI Diagnostic Report",
        "21-Day Recovery Program",
        "Daily Habit Challenges",
        "XP & Leveling System",
        "Basic Analytics Dashboard"
      ],
      buttonText: "Get Started Free",
      popular: false
    },
    {
      name: "Infinite Rewiring",
      price: "$9.99/mo",
      description: "Complete unconstrained access to unlimited cognitive analysis and tools.",
      features: [
        "Track Unlimited Bad Habits",
        "Deep Gemini 2.5 Pro Analytics",
        "Uncapped Chat Coach Conversations",
        "Advanced Mood Correlation AI",
        "Downloadable PDF Progress Reports",
        "Priority Response & Core Servers",
        "Exclusive Champion Badges"
      ],
      buttonText: "Upgrade to Premium",
      popular: true
    }
  ];

  const faqs = [
    {
      q: "How does the 21-Day program work?",
      a: "Research in cognitive science shows that minor habits take an average of 21 days of highly conscious substitution to dismantle. The AI breaks down your specific triggers and builds a tailored Roadmap, scaling up difficulties and reward mechanisms to lock in healthy alternatives."
    },
    {
      q: "What makes this different from traditional habit checklists?",
      a: "Traditional tools are static. AI Habit Breaker is dynamic—it acts as an active therapist. It does not just say 'don't do this.' It listens to why you do it, identifies stress patterns via your journal, and redirects your cognitive energy using behavioral therapy models."
    },
    {
      q: "Can I connect my real Google account?",
      a: "Yes. The login platform uses highly secure official Google Sign-In popups to sync your progress, logs, and settings across your devices in real-time."
    },
    {
      q: "Do I need a credit card for the free plan?",
      a: "No. You can sign up and start analyzing your habits, tracking scores, and running daily programs immediately with zero billing credentials."
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSuccess(true);
    setContactEmail("");
    setContactMessage("");
    setTimeout(() => setContactSuccess(false), 5000);
  };

  return (
    <div className="bg-[#F5F5F7] min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E5E5E7] px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-sm">
              <Brain className="w-5 h-5" />
            </div>
            <span className="font-sans font-semibold tracking-tight text-[#1D1D1F] text-lg">AI Habit Breaker</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-xs font-semibold text-[#86868B] hover:text-[#1D1D1F] transition-colors">Features</a>
            <a href="#pricing" className="text-xs font-semibold text-[#86868B] hover:text-[#1D1D1F] transition-colors">Pricing</a>
            <a href="#faq" className="text-xs font-semibold text-[#86868B] hover:text-[#1D1D1F] transition-colors">FAQ</a>
            <button 
              onClick={onGetStarted} 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative py-24 px-6 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-100/40 rounded-full filter blur-3xl opacity-30 -z-10 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-50/40 rounded-full filter blur-3xl opacity-30 -z-10"></div>
        
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-[#E5E5E7] rounded-full shadow-sm mb-6">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">Next-Gen Behavioral AI Coach</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-[#1D1D1F] font-sans leading-tight">
            Dismantle Bad Habits.<br/>
            <span className="text-[#86868B] font-normal">Rewire Your Mind.</span>
          </h1>
          
          <p className="text-base text-[#86868B] mt-6 max-w-2xl mx-auto leading-relaxed font-medium">
            AI Habit Breaker combines behavioral psychology models with generative intelligence to help you identify emotional triggers, build personalized substitutions, and gamify self-discipline.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white hover:bg-blue-700 font-sans font-semibold text-xs rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              Start Free Diagnosis <ArrowRight className="w-4 h-4" />
            </button>
            <a 
              href="#demo"
              className="w-full sm:w-auto px-6 py-4 border border-[#E5E5E7] hover:border-[#D2D2D7] bg-white hover:bg-[#F5F5F7] font-sans font-semibold text-xs rounded-2xl text-[#1D1D1F] flex items-center justify-center gap-2 transition-colors"
            >
              <Play className="w-4 h-4 fill-[#86868B] text-[#86868B]" /> Learn How It Works
            </a>
          </div>
        </div>
      </header>

      {/* Interactive AI Preview Box */}
      <section id="demo" className="py-12 px-6">
        <div className="max-w-4xl mx-auto bg-white border border-[#E5E5E7] rounded-[32px] p-8 shadow-sm relative">
          <div className="absolute top-4 right-4 text-[10px] font-bold text-[#86868B] bg-[#F5F5F7] px-2.5 py-1 rounded-full border border-[#E5E5E7] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Live Demo Sandbox
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold font-sans tracking-tight text-[#1D1D1F] flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" /> Test Your Bad Habit Instantly
            </h3>
            <p className="text-xs text-[#86868B] mt-1 font-medium">Type in a behavior you want to break, just like you would in the real dashboard.</p>
          </div>

          <div className="space-y-4">
            <input 
              type="text"
              placeholder="e.g., I check my phone for 2 hours before sleeping..."
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              className="w-full px-5 py-4 bg-[#F5F5F7] border border-[#E5E5E7]/80 rounded-2xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs text-[#1D1D1F] placeholder-[#86868B] transition-all"
            />
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#86868B] font-semibold uppercase tracking-wider">No account required to test</span>
              <button 
                onClick={onGetStarted}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                Analyze Habit <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Success Statistics Grid */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white border border-[#E5E5E7] rounded-2xl p-6 text-center shadow-sm">
              <div className="text-3xl md:text-4xl font-semibold text-[#1D1D1F] tracking-tight">{stat.value}</div>
              <div className="text-[10px] font-bold text-[#86868B] uppercase mt-2 tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-semibold tracking-tight text-[#1D1D1F] font-sans">
              Behavioral Engineering Features
            </h2>
            <p className="text-xs text-[#86868B] mt-3 leading-relaxed font-medium">
              We replace old cravings with new micro-rewards. Discover the complete arsenal of tools designed to hack habits and rebuild high levels of performance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="bg-white border border-[#E5E5E7] rounded-[24px] p-8 shadow-sm hover:border-blue-600/40 transition-colors">
                <div className="p-3 bg-[#F5F5F7] rounded-xl inline-block mb-4 border border-[#E5E5E7]/60 text-blue-600">
                  {feature.icon}
                </div>
                <h3 className="text-sm font-semibold text-[#1D1D1F]">{feature.title}</h3>
                <p className="text-xs text-[#86868B] mt-2.5 leading-relaxed font-medium">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium vs Free Pricing */}
      <section id="pricing" className="py-24 px-6 bg-white border-y border-[#E5E5E7]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-semibold tracking-tight text-[#1D1D1F] font-sans">
              Tailored for Every Focus Phase
            </h2>
            <p className="text-xs text-[#86868B] mt-3 leading-relaxed font-medium">
              Start with standard diagnostic toolsets or upgrade to unlock deep AI coaching loops with premium execution rights.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <div 
                key={i} 
                className={`rounded-[32px] p-8 border ${
                  plan.popular 
                    ? "border-[#1D1D1F] shadow-md bg-[#1D1D1F] text-white relative overflow-hidden" 
                    : "border-[#E5E5E7] shadow-sm bg-white text-[#1D1D1F]"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-4 right-4 bg-blue-600 text-white text-[9px] font-bold uppercase px-2.5 py-1 rounded-full tracking-wider shadow-sm">
                    Most Popular
                  </div>
                )}
                <h3 className="text-base font-semibold font-sans">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                </div>
                <p className={`text-xs mt-2 ${plan.popular ? "text-neutral-400" : "text-[#86868B]"}`}>
                  {plan.description}
                </p>

                <ul className="mt-6 space-y-3 border-t border-[#E5E5E7]/20 pt-6">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2 text-xs font-medium">
                      <Check className={`w-4 h-4 shrink-0 ${plan.popular ? "text-blue-500" : "text-blue-600"}`} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={onGetStarted}
                  className={`w-full py-3.5 mt-8 text-xs font-semibold rounded-2xl tracking-wide transition-colors cursor-pointer shadow-sm ${
                    plan.popular 
                      ? "bg-blue-600 text-white hover:bg-blue-700" 
                      : "bg-white border border-[#E5E5E7] text-[#1D1D1F] hover:bg-[#F5F5F7]"
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>      {/* Frequently Asked Questions */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight text-[#1D1D1F] font-sans">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="bg-white border border-[#E5E5E7] rounded-2xl overflow-hidden transition-all shadow-sm"
              >
                <button 
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full text-left px-6 py-5 flex justify-between items-center gap-4 hover:bg-[#F5F5F7]/30 transition-colors cursor-pointer"
                >
                  <span className="text-xs font-semibold text-[#1D1D1F] flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" /> {faq.q}
                  </span>
                  <span className="text-[#86868B] font-bold">{activeFaq === idx ? "−" : "+"}</span>
                </button>
                {activeFaq === idx && (
                  <div className="px-6 pb-5 text-xs text-[#86868B] leading-relaxed border-t border-[#F5F5F7]/60 pt-3 font-medium">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-[#F5F5F7] border-t border-[#E5E5E7]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-xl font-semibold text-[#1D1D1F] mb-12">Success Stories from our Breakers</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-[24px] border border-[#E5E5E7] shadow-sm">
              <p className="text-xs text-[#86868B] leading-relaxed italic font-medium">
                "I was spending over 6 hours a day doom-scrolling on Instagram. The 21-Day substitution program rebuilt my morning routines on day 4. Being able to chat with the Motivation Coach during evening triggers saved me multiple times. Now I am 3 months clean!"
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1D1D1F] text-white flex items-center justify-center text-[10px] font-bold">SM</div>
                <div>
                  <div className="text-xs font-semibold text-[#1D1D1F]">Sarah Mitchell</div>
                  <div className="text-[10px] text-[#86868B] font-medium">Broken Social Media Doom-Scrolling</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[24px] border border-[#E5E5E7] shadow-sm">
              <p className="text-xs text-[#86868B] leading-relaxed italic font-medium">
                "Procrastination before big quarterly reviews was hurting my career development. The AI identified that anxiety of failing was my trigger and guided me to break reviews into micro-challenges. Gamification points kept me focused."
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1D1D1F] text-white flex items-center justify-center text-[10px] font-bold">DL</div>
                <div>
                  <div className="text-xs font-semibold text-[#1D1D1F]">David Liang</div>
                  <div className="text-[10px] text-[#86868B] font-medium">Broken Career Procrastination</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-24 px-6 border-t border-[#E5E5E7] bg-white">
        <div className="max-w-md mx-auto bg-white border border-[#E5E5E7] rounded-[32px] p-8 shadow-sm text-center">
          <h2 className="text-2xl font-semibold text-[#1D1D1F] font-sans tracking-tight">Need behavioral consultation?</h2>
          <p className="text-xs text-[#86868B] mt-1.5 leading-relaxed font-medium">
            Drop us your email or request corporate mental health support packages. Our team will get back to you in under 12 hours.
          </p>

          {contactSuccess ? (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 text-blue-600 text-xs rounded-2xl font-semibold">
              Message received! We will connect with you shortly.
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="mt-6 space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold text-[#86868B] uppercase tracking-wider mb-1.5">Your Email</label>
                <input 
                  type="email" 
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="name@company.com" 
                  required
                  className="w-full px-4 py-3 bg-[#F5F5F7] border border-[#E5E5E7]/80 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs text-[#1D1D1F] placeholder-[#86868B] transition-all" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#86868B] uppercase tracking-wider mb-1.5">Message</label>
                <textarea 
                  rows={3} 
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Tell us what you need help with..." 
                  required
                  className="w-full px-4 py-3 bg-[#F5F5F7] border border-[#E5E5E7]/80 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs text-[#1D1D1F] placeholder-[#86868B] transition-all"
                ></textarea>
              </div>
              <button 
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                Send Message <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white text-[#86868B] text-center text-xs border-t border-[#E5E5E7]">
        <div className="max-w-7xl mx-auto px-6 space-y-4">
          <div className="flex justify-center items-center gap-2">
            <div className="p-1.5 bg-blue-600 text-white rounded-lg shadow-sm">
              <Brain className="w-4 h-4" />
            </div>
            <span className="font-semibold tracking-tight text-[#1D1D1F] text-sm">AI Habit Breaker</span>
          </div>
          <p className="font-medium">© 2026 AI Habit Breaker. All rights reserved. Designed for cognitive self-rewiring.</p>
          <div className="flex justify-center gap-4 text-[10px] font-bold uppercase tracking-wider text-[#86868B]">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms of Use</a>
            <span>•</span>
            <a href="#" className="hover:text-blue-600 transition-colors">SaaS Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
