import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazy initialize Gemini AI
let aiInstance: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. Using mock fallback mode for development.");
      return null;
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // 1. API: AI Habit Analyzer
  app.post("/api/analyze-habit", async (req, res) => {
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ error: "Habit description is required." });
    }

    const ai = getAI();
    if (!ai) {
      // Return a premium mock response if no API key is specified
      return res.json({
        category: "Digital Overconsumption",
        rootCauses: [
          "Dopamine seek loops triggered by intermittent feedback",
          "Escapism from immediate academic or career pressure",
          "Habitual cue-reward triggers during periods of low stimulation"
        ],
        triggerSituations: [
          "Waking up or lying in bed late at night",
          "Encountering complex or challenging tasks requiring cognitive load",
          "Boredom or transitions between meetings and study sessions"
        ],
        emotionalPatterns: [
          "Anxiety or apprehension of missing out (FOMO)",
          "Temporary relief followed by underlying guilt and lethargy",
          "Subconscious avoidance of silent self-reflection"
        ],
        severity: "Severe",
        longTermRisks: [
          "Impaired neural focus span and working memory capacity",
          "Disrupted sleep circadian rhythms and daylight lethargy",
          "Substantial erosion of long-term goal execution focus"
        ],
        recoveryDifficulty: "Hard",
        confidenceScore: 92,
        summary: "This digital escape habit represents a heavy reliance on immediate gratification loops to buffer stress, causing sleep and productivity trade-offs."
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze the following bad habit description: "${description}"
Return a valid JSON object matching this schema strictly, without markdown decoration:
{
  "category": "string",
  "rootCauses": ["string"],
  "triggerSituations": ["string"],
  "emotionalPatterns": ["string"],
  "severity": "Mild" | "Moderate" | "Severe",
  "longTermRisks": ["string"],
  "recoveryDifficulty": "Easy" | "Medium" | "Hard" | "Very Hard",
  "confidenceScore": number (0 to 100),
  "summary": "string"
}`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (error: any) {
      console.error("Gemini Analyze Error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze habit." });
    }
  });

  // 2. API: Generate 21-Day Recovery Plan
  app.post("/api/generate-plan", async (req, res) => {
    const { habitName, category, severity, rootCauses } = req.body;
    if (!habitName) {
      return res.status(400).json({ error: "Habit name is required." });
    }

    const ai = getAI();
    if (!ai) {
      // Mock plan
      const mockDays = Array.from({ length: 21 }, (_, i) => ({
        day: i + 1,
        morningGoal: i < 7 ? "Acknowledge the trigger" : i < 14 ? "Substitute with 10 mins reading" : "Assert intentional control",
        eveningGoal: i < 7 ? "Wind down screen-free 30 mins" : i < 14 ? "Place devices in another room" : "Reflect on success journaling",
        alternateActivity: "Stretch, read a non-fiction page, or drink a warm herbal tea",
        tips: `Day ${i + 1} Tip: Consistency builds structural grey matter. Keep your alternate stimulus ready.`,
        reward: `+${20 + (i % 3) * 5} XP & Badges progression`,
        description: `Stretching focus resilience during critical Day ${i + 1} phase.`
      }));

      return res.json({
        days: mockDays,
        morningRoutine: "Spend 5 minutes meditating, followed by hydration and stretching.",
        eveningRoutine: "Express gratitude, journal daily progress, and disable all immediate notifications.",
        healthyAlternatives: [
          "Reading high-quality physical paperbacks",
          "Isometric mindfulness stretching",
          "Engaging in interactive, hands-on cooking or creative tasks"
        ]
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate a detailed, custom, highly structured 21-Day Habit Break Plan to overcome the bad habit: "${habitName}".
The habit details are: Category: ${category || "General"}, Severity: ${severity || "Moderate"}, Root Causes: ${JSON.stringify(rootCauses || [])}.
Return a valid JSON object matching this schema strictly, without markdown decoration:
{
  "days": [
    {
      "day": number (1 to 21),
      "morningGoal": "string",
      "eveningGoal": "string",
      "alternateActivity": "string",
      "tips": "string",
      "reward": "string",
      "description": "string"
    }
  ],
  "morningRoutine": "string",
  "eveningRoutine": "string",
  "healthyAlternatives": ["string"]
}
Ensure each day from 1 to 21 has distinct morning and evening goals that scale progressive recovery support.`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (error: any) {
      console.error("Gemini Generate Plan Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate recovery plan." });
    }
  });

  // 3. API: AI Motivation Coach Chat
  app.post("/api/chat-coach", async (req, res) => {
    const { message, history, habitName, userProfile } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const ai = getAI();
    if (!ai) {
      return res.json({
        text: "I am here to support you! Breaking habits takes courage and patience. Remember, every time you pause and choose a healthy alternative, you are actively rewiring your brain. Let's tackle today's challenges step-by-step!"
      });
    }

    try {
      const historyPrompt = (history || [])
        .map((h: any) => `${h.role === "user" ? "User" : "Coach"}: ${h.content}`)
        .join("\n");

      const prompt = `You are the "AI Motivation Coach", a highly skilled, supportive, and compassionate behavioral therapist helping users overcome bad habits.
Current habit the user is breaking: "${habitName || "General bad habit"}"
User's goals and profile: ${JSON.stringify(userProfile || {})}

Conversation History:
${historyPrompt}

User: "${message}"
Coach:`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });

      res.json({ text: response.text || "Keep taking small steps! You can do this." });
    } catch (error: any) {
      console.error("Gemini Chat Coach Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI response." });
    }
  });

  // 4. API: Summarize Journal
  app.post("/api/summarize-journal", async (req, res) => {
    const { content, mood, wins, challenges, lessons } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Journal content is required." });
    }

    const ai = getAI();
    if (!ai) {
      return res.json({
        aiSummary: "The user reflected on self-discipline and felt balanced. Noted positive momentum in substitution strategies despite high cognitive tasks.",
        aiPatterns: [
          "Stress triggers digital escapism mid-afternoon",
          "Positive journaling reinforces a higher habit recovery score",
          "Early sleep improves overall emotional resilience"
        ]
      });
    }

    try {
      const prompt = `Summarize this user's daily habit journal reflection and detect emotional triggers or patterns:
Content: "${content}"
Wins: "${wins || "None declared"}"
Challenges: "${challenges || "None declared"}"
Lessons: "${lessons || "None declared"}"
Mood: "${mood || "Neutral"}"

Return a valid JSON object matching this schema strictly:
{
  "aiSummary": "string",
  "aiPatterns": ["string"]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (error: any) {
      console.error("Gemini Summarize Journal Error:", error);
      res.status(500).json({ error: error.message || "Failed to summarize journal." });
    }
  });

  // 5. API: Daily Motivational Quotes and Analytics Insights
  app.get("/api/dashboard-quote", async (req, res) => {
    const quotes = [
      { text: "Your future self will thank you for the boundaries you set today.", author: "AI Habit Coach" },
      { text: "Small, consistent daily victories build an unshakeable fortress of discipline.", author: "AI Habit Coach" },
      { text: "The chains of habit are too weak to be felt until they are too strong to be broken.", author: "Samuel Johnson" },
      { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
      { text: "It is easier to prevent bad habits than to break them, but starting now is your ultimate leverage.", author: "Benjamin Franklin" }
    ];
    const randomIndex = Math.floor(Math.random() * quotes.length);
    res.json(quotes[randomIndex]);
  });

  // 6. Vite middleware or Static files serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
