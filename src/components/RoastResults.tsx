import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { LineRoast, RoastResult, ImprovedBullet } from "../types";
import { 
  Award, 
  Lightbulb, 
  RotateCcw, 
  Share2, 
  Sparkles, 
  Check, 
  Frown, 
  TrendingUp, 
  CheckCircle2, 
  Flame,
  ThumbsUp,
  Laugh,
  FileText,
  Copy,
  PenSquare,
  ArrowRight,
  RefreshCw,
  Undo2
} from "lucide-react";

interface RoastResultsProps {
  result: RoastResult;
  onReset: () => void;
  memeMode?: boolean;
}

const getMemeRank = (score: number) => {
  if (score <= 25) return { label: "📈 FUTURE SENIOR VP OF SYNERGY", desc: "You write resumes like a McKinsey consultant. Your LinkedIn is likely unbearable but you make $250k/yr.", meme: "👔" };
  if (score <= 50) return { label: "😐 MIDDLE MANAGEMENT HELL", desc: "You have spent way too much time in meetings discussing 'synergies' and 'alignment'. Free yourself.", meme: "😐" };
  if (score <= 75) return { label: "🗑️ ATS TRASH CAN SPECIALIST", desc: "Your resume is written in a secret language designed to trigger recruiter gag reflexes.", meme: "🗑️" };
  return { label: "🎪 CHIEF CIRCUS EXECUTIVE", desc: "Your experience contains more buzzwords than actual real human skills. Even AI got a headache reading this.", meme: "🤡" };
};

const getSavageTranslation = (excerpt: string, idx: number) => {
  const translations = [
    "I sat there and watched other people work, then put my name on the slide deck.",
    "I spent 8 hours a day clicking random buttons and copy-pasting code from StackOverflow.",
    "I did literally nothing of substance but I know how to use bold fonts.",
    "I am a buzzword robot. Please insert electricity to resume operation.",
    "My mom said I did a great job, so I put it in my experience section.",
    "I copied this bullet point from a Google search and didn't even read it.",
    "I participated in team syncs, which means I drank coffee while muted."
  ];
  return translations[idx % translations.length];
};

export const RoastResults: React.FC<RoastResultsProps> = ({ result, onReset, memeMode = false }) => {
  const [copied, setCopied] = useState(false);
  const [copiedPolish, setCopiedPolish] = useState(false);
  const [activeTab, setActiveTab] = useState<"roast" | "bullets" | "rewrite">("roast");
  const [editableResume, setEditableResume] = useState("");
  
  // Track visual reactions locally for each line roast
  const [reactions, setReactions] = useState<{ [key: number]: { agree: number; laugh: number; hasAgreed: boolean; hasLaughed: boolean } }>({});

  // Sync editable text with current result on load
  useEffect(() => {
    if (result.optimized_resume_text) {
      setEditableResume(result.optimized_resume_text);
    }
  }, [result]);

  const handleReaction = (index: number, type: "agree" | "laugh") => {
    setReactions(prev => {
      const lineReact = prev[index] || { agree: 0, laugh: 0, hasAgreed: false, hasLaughed: false };
      
      if (type === "agree") {
        return {
          ...prev,
          [index]: {
            ...lineReact,
            agree: lineReact.hasAgreed ? lineReact.agree - 1 : lineReact.agree + 1,
            hasAgreed: !lineReact.hasAgreed
          }
        };
      } else {
        return {
          ...prev,
          [index]: {
            ...lineReact,
            laugh: lineReact.hasLaughed ? lineReact.laugh - 1 : lineReact.laugh + 1,
            hasLaughed: !lineReact.hasLaughed
          }
        };
      }
    });
  };

  const getScoreInterpretation = (score: number) => {
    if (score <= 25) return { text: "SLIGHT POLISH", color: "text-emerald-400", bg: "bg-emerald-950/20", border: "border-emerald-800/40", desc: "Surprisingly clean! Minor formatting adjustments and a few buzzword swaps will make this bulletproof." };
    if (score <= 50) return { text: "MILD OVERHAUL", color: "text-amber-400", bg: "bg-amber-950/20", border: "border-amber-800/40", desc: "Solid skeleton, but padded with standard resume clichés. Needs quantitative metrics and punchier action verbs." };
    if (score <= 75) return { text: "CRITICAL REBUILD", color: "text-orange-400", bg: "bg-orange-950/20", border: "border-orange-800/40", desc: "Drowning in generic corporate lingo and vague claims. It's time to swap out placeholders with hard evidence." };
    return { text: "BURN IT TO THE GROUND", color: "text-red-500", bg: "bg-red-950/30", border: "border-red-900/40", desc: "Pure synergistic hot air. Reconstruct your experience from scratch using actual human verbs and countable outcomes." };
  };

  const getSectionColor = (section: string) => {
    switch (section) {
      case "Summary": return "bg-purple-950/40 text-purple-300 border-purple-800/40";
      case "Experience": return "bg-blue-950/40 text-blue-300 border-blue-800/40";
      case "Skills": return "bg-emerald-950/40 text-emerald-300 border-emerald-800/40";
      case "Education": return "bg-indigo-950/40 text-indigo-300 border-indigo-800/40";
      case "Formatting": return "bg-amber-950/40 text-amber-300 border-amber-800/40";
      default: return "bg-slate-800/40 text-slate-300 border-slate-700/40";
    }
  };

  const interpretation = getScoreInterpretation(result.roast_score);

  // Copy full report summary to clipboard
  const handleCopySummary = () => {
    const formattedText = `🔥 RESUME ROAST AI REPORT 🔥
Level: ${result.config.level.toUpperCase()} | Intensity: ${result.config.intensity}/100
Fix-O-Meter Score: ${result.config.roast_score}/100 (${interpretation.text})

📢 HEADLINE ROAST:
"${result.headline_roast}"

🚨 KEY CRITIQUES:
${result.line_roasts.map(r => `- [${r.section}] "${r.excerpt}" -> ${r.emoji} ${r.roast}`).join("\n")}

🌱 ACTIONABLE SILVER LININGS:
${result.silver_lining.map((line, i) => `${i + 1}. ${line}`).join("\n")}

💬 CLOSING:
"${result.closing_line}"

Roast your own resume on Resume Roast AI!`;

    navigator.clipboard.writeText(formattedText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Copy polished rewritten text to clipboard
  const handleCopyPolish = () => {
    navigator.clipboard.writeText(editableResume).then(() => {
      setCopiedPolish(true);
      setTimeout(() => setCopiedPolish(false), 2000);
    });
  };

  // Reset editable text back to AI original rewrite
  const handleResetRewrite = () => {
    if (result.optimized_resume_text) {
      setEditableResume(result.optimized_resume_text);
    }
  };

  return (
    <div className="space-y-8" id="roast-results-wrapper">
      {/* Overview Score Dial & Headline */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-3xl p-6 md:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Subtle background fire glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid md:grid-cols-12 gap-8 items-center relative z-10">
          {/* Circular Score Gauge */}
          <div className="md:col-span-4 flex flex-col items-center text-center justify-center">
            <div className="relative w-44 h-44 flex items-center justify-center">
              {/* Outer circle track */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r="74"
                  className="stroke-slate-800"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="88"
                  cy="88"
                  r="74"
                  className={`transition-all duration-1000 ${
                    result.roast_score <= 25 ? "stroke-emerald-500" :
                    result.roast_score <= 50 ? "stroke-amber-500" :
                    result.roast_score <= 75 ? "stroke-orange-500" : "stroke-red-600"
                  }`}
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 74}
                  strokeDashoffset={2 * Math.PI * 74 * (1 - result.roast_score / 100)}
                  strokeLinecap="round"
                />
              </svg>

              {/* Central Text */}
              <div className="flex flex-col items-center">
                <span className="text-4xl font-extrabold tracking-tight font-mono text-slate-100">
                  {result.roast_score}
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                  Fix-O-Meter
                </span>
              </div>

              {memeMode && (
                <motion.div 
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: -15 }}
                  className="absolute bg-red-600 text-white border-2 border-red-400 font-mono font-black text-[9px] px-2.5 py-1 rounded uppercase tracking-wider shadow-lg select-none pointer-events-none top-2 -right-4"
                >
                  🤡 ATS REJECTED
                </motion.div>
              )}
            </div>

            <div className="mt-4">
              <span className={`text-sm font-black font-mono tracking-wider ${interpretation.color} px-3 py-1 rounded-full ${interpretation.bg} border ${interpretation.border}`}>
                {interpretation.text}
              </span>
            </div>
          </div>

          {/* Headline Critique */}
          <div className="md:col-span-8 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded uppercase font-mono">
                System Diagnosis
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                🔥 Heat Level: <span className="font-bold text-orange-400 capitalize">{result.config.level}</span> ({result.config.intensity}/100)
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
              &ldquo;{result.headline_roast}&rdquo;
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              {interpretation.desc}
            </p>

            {memeMode && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 space-y-2 mt-4 relative overflow-hidden"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getMemeRank(result.roast_score).meme}</span>
                  <span className="font-mono font-black text-xs text-red-400 tracking-wider uppercase">
                    Meme Class: {getMemeRank(result.roast_score).label}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {getMemeRank(result.roast_score).desc}
                </p>
                <div className="absolute top-1 right-2 font-mono text-[8px] text-red-500/40 uppercase font-bold tracking-widest select-none">
                  CLOWN_DEPT
                </div>
              </motion.div>
            )}

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                id="copy-roast-summary-btn"
                onClick={handleCopySummary}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition-all flex items-center gap-2 border border-slate-700/80 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied Report!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-orange-400" />
                    <span>Export Roast Summary</span>
                  </>
                )}
              </button>

              <button
                type="button"
                id="roast-another-btn"
                onClick={onReset}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-orange-600 hover:bg-orange-500 text-white transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-orange-600/10"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Roast Another Resume</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DASHBOARD NAVIGATION TABS */}
      <div className="border-b border-slate-800 flex overflow-x-auto gap-2 scrollbar-none" id="results-tabs-nav">
        <button
          type="button"
          onClick={() => setActiveTab("roast")}
          className={`py-3 px-5 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "roast"
              ? "border-red-500 text-red-400 bg-red-950/10"
              : "border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-900/40"
          }`}
        >
          <Flame className="w-4 h-4" />
          1. Line-by-Line Roast
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("bullets")}
          className={`py-3 px-5 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "bullets"
              ? "border-amber-500 text-amber-400 bg-amber-950/10"
              : "border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-900/40"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          2. Side-by-Side Upgrades
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("rewrite")}
          className={`py-3 px-5 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "rewrite"
              ? "border-emerald-500 text-emerald-400 bg-emerald-950/10"
              : "border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-900/40"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          3. Polish & Edit Resume
        </button>
      </div>

      {/* TAB CONTENT PANEL */}
      <div className="min-h-[300px]">
        {/* TAB 1: LINE-BY-LINE ROAST */}
        {activeTab === "roast" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
              <p className="text-xs text-slate-400">
                Review the funny, line-by-line critiques highlighting what was holding you back.
              </p>
              <span className="text-[10px] font-mono text-slate-500">
                {result.line_roasts.length} highlights
              </span>
            </div>

            <div className="grid gap-4">
              {result.line_roasts.map((line: LineRoast, idx: number) => {
                const reactState = reactions[idx] || { agree: 0, laugh: 0, hasAgreed: false, hasLaughed: false };
                
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-slate-900/45 rounded-2xl border border-slate-850 p-5 space-y-4 hover:border-slate-800 transition-all shadow-md group"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-500">
                          #{idx + 1}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase font-mono ${getSectionColor(line.section)}`}>
                          {line.section}
                        </span>
                        {memeMode && (
                          <span className="text-[9px] font-black font-mono tracking-wide px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 uppercase">
                            {["🤦‍♂️ CRINGE", "💅 COPE", "🤌 NO METRICS?", "👽 CHATGPT SLOP", "💀 R.I.P. CAREER", "🤌 SYNERGY CHEF", "📉 DOWN BAD"][idx % 7]}
                          </span>
                        )}
                      </div>
                      <span className="text-2xl" role="img" aria-label="reaction emoji">
                        {line.emoji}
                      </span>
                    </div>

                    <div className="bg-slate-950 rounded-lg p-3.5 border-l-4 border-orange-500/80 font-mono text-xs text-slate-300 leading-relaxed shadow-inner overflow-x-auto">
                      <span className="text-slate-600 select-none mr-2 font-bold">&gt;</span>
                      {line.excerpt}
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-medium text-slate-200 leading-relaxed">
                        {line.roast}
                      </p>

                      {memeMode && (
                        <div className="bg-red-950/20 border border-red-500/20 rounded-xl p-3 text-xs text-red-200 flex items-start gap-2.5 italic">
                          <span className="text-red-400 font-extrabold not-italic font-mono text-[9px] uppercase tracking-wider bg-red-950 px-1.5 py-0.5 rounded border border-red-500/30 shrink-0">
                            Savage Translation
                          </span>
                          <span>&ldquo;{getSavageTranslation(line.excerpt, idx)}&rdquo;</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1 border-t border-slate-850/60 text-xs">
                        <span className="text-slate-500 mr-2 font-mono text-[10px]">Agree with critic?</span>
                        
                        <button
                          type="button"
                          onClick={() => handleReaction(idx, "agree")}
                          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                            reactState.hasAgreed 
                              ? "bg-indigo-950/40 text-indigo-300 border border-indigo-500/30" 
                              : "bg-slate-950/40 text-slate-400 hover:text-slate-300 border border-transparent"
                          }`}
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${reactState.hasAgreed ? "fill-indigo-400 text-indigo-400" : ""}`} />
                          <span className="font-mono">{reactState.agree + (reactState.hasAgreed ? 1 : 0)}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReaction(idx, "laugh")}
                          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                            reactState.hasLaughed 
                              ? "bg-orange-950/40 text-orange-300 border border-orange-500/30" 
                              : "bg-slate-950/40 text-slate-400 hover:text-slate-300 border border-transparent"
                          }`}
                        >
                          <Laugh className={`w-3.5 h-3.5 ${reactState.hasLaughed ? "fill-orange-400 text-orange-400" : ""}`} />
                          <span className="font-mono">{reactState.laugh + (reactState.hasLaughed ? 1 : 0)}</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: SIDE-BY-SIDE UPGRADES */}
        {activeTab === "bullets" && (
          <div className="space-y-6">
            <div className="bg-amber-950/20 border border-amber-900/30 rounded-2xl p-4 flex gap-3 text-amber-200 text-xs leading-relaxed">
              <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Upgrade Philosophy:</span> We identify weak bullet points and replace them with strong outcomes. We leave placeholders in square brackets like <code className="bg-slate-950 px-1 py-0.5 rounded font-mono text-[10px] text-amber-300">[X]%</code> so you can fill in your real numbers!
              </div>
            </div>

            <div className="space-y-6">
              {result.improved_bullet_points && result.improved_bullet_points.length > 0 ? (
                result.improved_bullet_points.map((bullet: ImprovedBullet, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="grid md:grid-cols-2 gap-4 bg-slate-900/40 rounded-2xl border border-slate-850 p-5 relative overflow-hidden"
                  >
                    {/* Original bullet */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-mono font-bold bg-red-950/30 text-red-400 border border-red-900/20 px-2 py-0.5 rounded flex items-center gap-1">
                          <Frown className="w-3 h-3" /> Original Cliché
                        </span>
                      </div>
                      <div className="bg-slate-950 rounded-xl p-4 border border-slate-900 font-mono text-xs text-slate-400 leading-relaxed h-full min-h-[80px] flex items-center relative overflow-hidden">
                        <span className="relative z-10">&ldquo;{bullet.original_line}&rdquo;</span>
                        {memeMode && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-10">
                            <span className="text-red-500 font-black text-5xl rotate-12 uppercase tracking-widest">
                              {["BOOOO", "YAWN", "CRINGE", "ZERO", "MID"][i % 5]}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Improved bullet */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 justify-between">
                        <span className="text-[10px] uppercase font-mono font-bold bg-emerald-950/40 text-emerald-300 border border-emerald-900/20 px-2 py-0.5 rounded flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> AI Improved Version
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(bullet.improved_line);
                          }}
                          className="text-[10px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1 cursor-pointer"
                          title="Copy this bullet"
                        >
                          <Copy className="w-3 h-3" /> Copy Bullet
                        </button>
                      </div>
                      <div className="bg-emerald-950/10 rounded-xl p-4 border border-emerald-900/20 font-sans text-xs text-emerald-200 leading-relaxed font-semibold h-full min-h-[80px] flex items-center relative overflow-hidden">
                        <span className="relative z-10">{bullet.improved_line}</span>
                        {memeMode && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.06]">
                            <span className="text-emerald-400 font-black text-4xl -rotate-12 uppercase tracking-widest">
                              {["STONKS", "GIGACHAD", "W", "POGGERS", "CHAD"][i % 5]}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Full width explanation */}
                    <div className="md:col-span-2 bg-slate-950/80 border border-slate-850 rounded-xl p-3 text-xs text-slate-300 flex items-start gap-2 mt-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-400 font-mono text-[10px] uppercase block mb-0.5">Why this works:</span>
                        {bullet.why_it_works}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No side-by-side comparisons available for this resume.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: FULL POLISH & REWRITE EDITOR */}
        {activeTab === "rewrite" && (
          <div className="space-y-6">
            <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold text-emerald-300">
                  Interactive AI-Polish Editor
                </h4>
              </div>
              <p className="text-xs text-emerald-100/80 leading-relaxed">
                We have generated a fully-revised, high-impact version of your resume content. Feel free to <span className="font-bold">modify, customize, or fill in the bracketed templates</span> (like changing [X]% to your actual metrics) directly inside this editor before copying!
              </p>
            </div>

            {/* Markdown Text Editor box */}
            <div className="space-y-3 relative">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <PenSquare className="w-3.5 h-3.5 text-emerald-400" />
                  Edit Polished Resume Markdown
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetRewrite}
                    className="text-[10px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Restore AI original rewrite"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    Reset to AI Original
                  </button>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {editableResume.length} characters
                  </span>
                </div>
              </div>

              <textarea
                value={editableResume}
                onChange={(e) => setEditableResume(e.target.value)}
                className="w-full h-96 rounded-2xl bg-slate-950 border border-slate-800 p-6 text-slate-200 font-mono text-sm leading-relaxed focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors shadow-inner resize-y"
                placeholder="Writing polished resume contents..."
              />

              <div className="flex justify-between items-center bg-slate-950 border-x border-b border-slate-850 p-4 rounded-b-2xl mt-[-12px] relative z-10">
                <span className="text-[10px] font-mono text-slate-500">
                  💡 Tips: Format is standard plain Markdown. Ready for your Word or Docs page.
                </span>
                
                <button
                  type="button"
                  id="copy-polished-resume-btn"
                  onClick={handleCopyPolish}
                  className={`py-2 px-5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                    copiedPolish 
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-500/30" 
                      : "bg-emerald-600 text-white hover:bg-emerald-500"
                  }`}
                >
                  {copiedPolish ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied Polished Resume!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Full Polished Resume</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Constructive Actionable Fixes (Silver Lining) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-indigo-950/30 via-slate-950 to-emerald-950/10 rounded-2xl border border-indigo-900/30 p-6 md:p-8 space-y-6 shadow-xl"
      >
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-500/20 text-indigo-400">
            <Lightbulb className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Actionable Silver Linings
            </h3>
            <p className="text-xs text-slate-400">
              The comedy is the hook, the career advice is the substance. Real fixes for your roasted elements:
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {result.silver_lining.map((advice, i) => (
            <div key={i} className="bg-slate-950/60 rounded-xl p-5 border border-slate-800/60 space-y-3 hover:border-indigo-900/40 transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-500/20 text-xs flex items-center justify-center font-bold font-mono">
                    {i + 1}
                  </span>
                  <span className="text-xs text-slate-400 font-bold tracking-wider font-mono uppercase">
                    Coaching Advice
                  </span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {advice}
                </p>
              </div>
              <div className="pt-2 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400 uppercase tracking-widest font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" /> High Impact Fix
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Final Mic-Drop Sentence */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-slate-950 border border-red-950/40 rounded-2xl p-6 text-center space-y-3 max-w-2xl mx-auto relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600" />
        <span className="text-[10px] font-bold tracking-widest font-mono uppercase text-red-500 bg-red-950/30 px-2.5 py-1 rounded-full border border-red-900/20 inline-block">
          Mic Drop
        </span>
        <p className="text-base md:text-lg font-bold text-slate-100 italic leading-relaxed">
          &ldquo;{result.closing_line}&rdquo;
        </p>
      </motion.div>

      {/* Restart Footer Button */}
      <div className="flex justify-center pt-4">
        <button
          type="button"
          onClick={onReset}
          className="py-3 px-6 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-all border border-slate-800 flex items-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Upload Another Resume</span>
        </button>
      </div>
    </div>
  );
};
