import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RoastLevel, RoastResult } from "./types";
import { IntensitySelector } from "./components/IntensitySelector";
import { ResumeUpload } from "./components/ResumeUpload";
import { RoastResults } from "./components/RoastResults";
import { MemeStickers } from "./components/MemeStickers";
import { 
  Flame, 
  History, 
  Trash2, 
  X, 
  Sparkles, 
  AlertCircle, 
  ChevronRight, 
  ArrowLeft,
  FileText
} from "lucide-react";

const LOADING_MESSAGES = [
  "Searching for where you used the word 'results-driven'...",
  "Analyzing the complete lack of quantifiable metrics...",
  "Warming up the deep fryer to maximum crispiness...",
  "Sniffing out AI-generated buzzwords and corporate fluff...",
  "Counting how many times you wrote 'responsible for' instead of an action verb...",
  "Checking if your skills section lists 'Microsoft Word' or 'Email'...",
  "Consulting the ancient gods of HR and ATS screening filters...",
  "Sighing audibly at your generic objective statement...",
  "Calculating how fast an ATS bot would throw this in the recycling bin...",
  "Flipping the burger of synergy into deep blue-sky paradigms..."
];

export default function App() {
  const [resumeText, setResumeText] = useState("");
  const [roastLevel, setRoastLevel] = useState<RoastLevel>("crispy");
  const [intensityScore, setIntensityScore] = useState(60);
  const [currentResult, setCurrentResult] = useState<RoastResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [roastHistory, setRoastHistory] = useState<RoastResult[]>([]);
  const [memeMode, setMemeMode] = useState(true);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("resume_roast_history");
      if (saved) {
        setRoastHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load roast history from localStorage", e);
    }
  }, []);

  // Cycle through funny loading messages when loading
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingMessageIdx(0);
      interval = setInterval(() => {
        setLoadingMessageIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 3500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  // Trigger submission to server API
  const handleRoastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) return;

    setIsLoading(true);
    setError(null);
    setCurrentResult(null);

    try {
      const response = await fetch("/api/roast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeText,
          roastLevel,
          intensityScore,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate your resume roast.");
      }

      // Generate a unique ID and timestamp for local history saving
      const finalResult: RoastResult = {
        ...data,
        id: `roast-${Date.now()}`,
        timestamp: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        resume_name: resumeText.trim().split("\n")[0].substring(0, 30) || "Anonymous Resume",
        config: {
          level: roastLevel,
          intensity: intensityScore,
        },
      };

      setCurrentResult(finalResult);

      // Save to history list
      setRoastHistory((prev) => {
        const updated = [finalResult, ...prev].slice(0, 15); // Limit to 15 items
        localStorage.setItem("resume_roast_history", JSON.stringify(updated));
        return updated;
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong while talking to the roast core.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRoastHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem("resume_roast_history", JSON.stringify(updated));
      return updated;
    });
  };

  const handleSelectHistoryItem = (item: RoastResult) => {
    setCurrentResult(item);
    setResumeText(item.resume_name);
    setRoastLevel(item.config.level);
    setIntensityScore(item.config.intensity);
    setShowHistory(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setCurrentResult(null);
    setError(null);
    // Don't wipe the text field so they can adjust it after a roast!
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-orange-500/30 selection:text-orange-200">
      
      {/* Decorative ambient visual background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-1%] right-[-5%] w-[45%] h-[45%] bg-orange-950/10 rounded-full blur-[120px]" />
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-900 px-4 py-4 shrink-0">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleReset}>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Flame className="w-6 h-6 text-white fill-white/10 animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-slate-950" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-lg tracking-tight bg-gradient-to-r from-amber-200 via-orange-300 to-red-400 bg-clip-text text-transparent">
                Resume Roast AI
              </h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                Critic & Career Coach Hybrid
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="meme-mode-toggle-btn"
              onClick={() => setMemeMode(!memeMode)}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
                memeMode 
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-lg shadow-amber-500/5 animate-pulse"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800/80"
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${memeMode ? "text-amber-400 animate-spin" : "text-slate-400"}`} />
              <span>{memeMode ? "Meme Mode ON 🤪" : "Meme Mode"}</span>
            </button>

            <button
              type="button"
              id="view-history-toggle-btn"
              onClick={() => setShowHistory(true)}
              className="py-2 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-all border border-slate-800/80 cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span>History</span>
              {roastHistory.length > 0 && (
                <span className="ml-1 bg-orange-600 text-white font-mono font-bold text-[9px] px-1.5 py-0.5 rounded-full">
                  {roastHistory.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Scrollable Area */}
      <main className="flex-grow max-w-5xl w-full mx-auto px-4 py-8 relative z-10 space-y-8">
        <MemeStickers active={memeMode} />
        
        <AnimatePresence mode="wait">
          {/* 1. LOADING SCREEN VIEW */}
          {isLoading && (
            <motion.div
              key="loading-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center space-y-6 min-h-[50vh]"
              id="loading-screen"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 to-red-600 rounded-full blur-2xl opacity-20 animate-pulse" />
                <div className="w-24 h-24 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-2xl relative z-10">
                  <Flame className="w-12 h-12 text-orange-500 animate-bounce fill-orange-500/10" />
                </div>
              </div>

              <div className="space-y-2 max-w-lg">
                <h3 className="font-display font-bold text-xl text-slate-100">
                  Pre-heating the Grill...
                </h3>
                <p className="text-sm text-slate-400">
                  Our hyper-intelligent AI is performing a microscopic, line-by-line inspection of your professional decisions.
                </p>
              </div>

              {/* Cycling Fun Messages */}
              <motion.div
                key={loadingMessageIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="bg-slate-900/60 border border-slate-850 rounded-xl px-5 py-3 text-xs font-mono text-orange-400 max-w-md w-full shadow-md"
              >
                {LOADING_MESSAGES[loadingMessageIdx]}
              </motion.div>
            </motion.div>
          )}

          {/* 2. MAIN INPUT AND OPTIONS VIEW */}
          {!isLoading && !currentResult && (
            <motion.div
              key="input-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
              id="input-view-container"
            >
              {/* Introduction Banner */}
              <div className="text-center max-w-2xl mx-auto space-y-3 pb-4">
                <span className="text-[10px] font-bold tracking-widest bg-orange-950/50 text-orange-400 border border-orange-900/40 px-3 py-1 rounded-full inline-block uppercase font-mono">
                  🚨 Entertainment / Career Coaching Hybrid
                </span>
                <h2 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight text-white">
                  Get Your Resume Roasted line-by-line.
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Upload or paste your resume, select your heat level, and let our razor-sharp critic slice through your corporate speak. Then walk away with 3 high-impact actionable fixes to land real interviews.
                </p>
              </div>

              {/* Form Controls */}
              <div className="grid md:grid-cols-12 gap-8">
                {/* Left side: Configuration calibration */}
                <div className="md:col-span-5 space-y-6">
                  <IntensitySelector
                    level={roastLevel}
                    setLevel={setRoastLevel}
                    intensity={intensityScore}
                    setIntensity={setIntensityScore}
                  />
                </div>

                {/* Right side: Input & upload */}
                <div className="md:col-span-7">
                  <ResumeUpload
                    resumeText={resumeText}
                    setResumeText={setResumeText}
                    onSubmit={handleRoastSubmit}
                    isLoading={isLoading}
                  />
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-950/30 border border-red-900/30 rounded-2xl p-5 flex gap-4 max-w-3xl mx-auto" id="error-banner">
                  <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-bold text-red-400 text-sm">
                      Failed to Pre-heat the Grill
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {error}
                    </p>
                    {error.includes("GEMINI_API_KEY") && (
                      <div className="pt-2 text-xs text-slate-400 space-y-1.5 border-t border-red-900/20 mt-2">
                        <p className="font-semibold text-slate-300">How to fix this:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Click on the <span className="font-semibold text-slate-300">Settings</span> menu in the AI Studio UI sidebar or top-right.</li>
                          <li>Open the <span className="font-semibold text-slate-300">Secrets</span> panel.</li>
                          <li>Add a new environment variable: <code className="bg-slate-950 px-1 py-0.5 rounded font-mono text-[10px] text-red-400">GEMINI_API_KEY</code> with your Gemini API key.</li>
                          <li>Refresh the page and try roasting again!</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* 3. ROAST RESULTS VIEW */}
          {!isLoading && currentResult && (
            <motion.div
              key="results-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between pb-2">
                <button
                  type="button"
                  id="results-back-btn"
                  onClick={handleReset}
                  className="py-2 px-3.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all flex items-center gap-1.5 bg-slate-950 border border-slate-850 hover:border-slate-700 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Adjust Input / Calibration</span>
                </button>
              </div>

              <RoastResults result={currentResult} onReset={handleReset} memeMode={memeMode} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* History Drawer Overlay */}
      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-50 overflow-hidden" id="history-drawer-overlay">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setShowHistory(false)}
            />

            <div className="absolute inset-y-0 right-0 max-w-md w-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between">
              {/* Header */}
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-display font-bold text-slate-100">
                    Past Resume Roasts
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHistory(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* History list content */}
              <div className="flex-grow overflow-y-auto p-6 space-y-4">
                {roastHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                    <FileText className="w-10 h-10 text-slate-700" />
                    <p className="text-sm font-semibold text-slate-400">No past roasts yet</p>
                    <p className="text-xs text-slate-500 max-w-xs">
                      Roast a resume from the main panel and they will be archived here for safe-keeping!
                    </p>
                  </div>
                ) : (
                  roastHistory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectHistoryItem(item)}
                      className="bg-slate-950/50 hover:bg-slate-950 border border-slate-850 hover:border-slate-700/80 p-4 rounded-xl cursor-pointer transition-all duration-300 flex justify-between items-start group relative overflow-hidden"
                    >
                      <div className="space-y-1.5 max-w-[85%]">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase ${
                            item.config.level === "eggshell" ? "bg-amber-950 text-amber-300 border-amber-900/30" :
                            item.config.level === "crispy" ? "bg-orange-950 text-orange-300 border-orange-900/30" :
                            "bg-red-950 text-red-300 border-red-900/30"
                          }`}>
                            {item.config.level} ({item.config.intensity})
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {item.timestamp}
                          </span>
                        </div>

                        <h4 className="font-semibold text-sm text-slate-200 group-hover:text-white line-clamp-1">
                          {item.resume_name}
                        </h4>

                        <p className="text-xs text-slate-400 italic line-clamp-1">
                          &ldquo;{item.headline_roast}&rdquo;
                        </p>
                      </div>

                      <div className="flex flex-col items-end justify-between h-full gap-4">
                        <span className={`text-xs font-mono font-bold bg-slate-900 px-2 py-1 rounded border border-slate-800 ${
                          item.roast_score >= 75 ? "text-red-500" :
                          item.roast_score >= 50 ? "text-orange-400" :
                          "text-emerald-400"
                        }`}>
                          Score: {item.roast_score}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                          className="p-1 rounded text-slate-600 hover:text-red-400 hover:bg-red-950/20 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                          title="Delete Roast Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer footer */}
              <div className="p-6 border-t border-slate-800 bg-slate-900/90 text-center">
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  Saved locally in localStorage
                </p>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Styled Human Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 px-4 py-6 text-center text-xs text-slate-500 shrink-0 font-mono">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <div>
            &copy; {new Date().getFullYear()} Resume Roast AI. Roast responsibly.
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
            Powered by <span className="font-bold text-slate-500">Gemini 3.5 Flash</span> &bull; 100% Client/Server Security
          </div>
        </div>
      </footer>

    </div>
  );
}
