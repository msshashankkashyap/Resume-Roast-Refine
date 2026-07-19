import React from "react";
import { motion } from "motion/react";
import { RoastLevel } from "../types";
import { Egg, Flame, FlameKindling, Info } from "lucide-react";

interface IntensitySelectorProps {
  level: RoastLevel;
  setLevel: (level: RoastLevel) => void;
  intensity: number;
  setIntensity: (intensity: number) => void;
}

export const IntensitySelector: React.FC<IntensitySelectorProps> = ({
  level,
  setLevel,
  intensity,
  setIntensity,
}) => {
  // Synchronize level and intensity when level is explicitly clicked
  const handleLevelChange = (newLevel: RoastLevel) => {
    setLevel(newLevel);
    if (newLevel === "eggshell") {
      setIntensity(25);
    } else if (newLevel === "crispy") {
      setIntensity(60);
    } else {
      setIntensity(90);
    }
  };

  // Synchronize level when intensity slider is moved
  const handleIntensityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setIntensity(val);
    if (val <= 40) {
      setLevel("eggshell");
    } else if (val <= 80) {
      setLevel("crispy");
    } else {
      setLevel("deep fried");
    }
  };

  // Dynamic feedback copy based on intensity value
  const getIntensityFeedback = (val: number) => {
    if (val <= 10) return { label: "Pillow Fight 🧸", desc: "Extremely gentle, mostly praise and soft petting. Ideal if you cry easily." };
    if (val <= 25) return { label: "Supportive Sibling 🤗", desc: "Teasing but full of real support. Your mom would approve." };
    if (val <= 40) return { label: "Polite Coffee Chat ☕", desc: "Light teasing wrapped in corporate-friendly, helpful feedback." };
    if (val <= 55) return { label: "Passive-Aggressive Post-it 📝", desc: "Sitcom energy. Sarcastic but polite enough to not get HR involved." };
    if (val <= 70) return { label: "The Performance Review 📊", desc: "Direct and witty. Calls out weak buzzwords and filler text with zero apology." };
    if (val <= 80) return { label: "Reddit's r/Resumes 🌶️", desc: "Confident sarcasm. You will laugh, but you will definitely wince." };
    if (val <= 90) return { label: "Twitter Callout 💀", desc: "Merciless, meme-heavy, and brutally honest. Keep your tissues close." };
    return { label: "Literal Ashes 🔥", desc: "Gordon Ramsay reviewing a burnt steak. Merciless savagery of your career choices." };
  };

  const feedback = getIntensityFeedback(intensity);

  return (
    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6" id="intensity-selector-container">
      <div>
        <h3 className="text-lg font-semibold text-slate-100 tracking-tight flex items-center gap-2">
          <FlameKindling className="w-5 h-5 text-orange-500" />
          1. Calibrate the Roast Heat
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          How thick is your skin today? Dial in the intensity before feeding your resume to the machine.
        </p>
      </div>

      {/* Level Selector Cards */}
      <div className="grid grid-cols-3 gap-3">
        {/* Eggshell */}
        <button
          type="button"
          id="level-btn-eggshell"
          onClick={() => handleLevelChange("eggshell")}
          className={`relative overflow-hidden rounded-xl p-4 flex flex-col items-center justify-center border transition-all duration-300 ${
            level === "eggshell"
              ? "bg-amber-950/40 border-amber-500/80 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
              : "bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-300 hover:bg-slate-950/60"
          }`}
        >
          <Egg className={`w-6 h-6 mb-2 ${level === "eggshell" ? "text-amber-400 animate-bounce" : "text-slate-500"}`} />
          <span className="font-bold text-sm">Eggshell</span>
          <span className="text-[10px] text-slate-500 mt-1">Warm Teasing</span>
        </button>

        {/* Crispy */}
        <button
          type="button"
          id="level-btn-crispy"
          onClick={() => handleLevelChange("crispy")}
          className={`relative overflow-hidden rounded-xl p-4 flex flex-col items-center justify-center border transition-all duration-300 ${
            level === "crispy"
              ? "bg-orange-950/40 border-orange-500/80 text-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.15)]"
              : "bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-300 hover:bg-slate-950/60"
          }`}
        >
          <FlameKindling className={`w-6 h-6 mb-2 ${level === "crispy" ? "text-orange-400 animate-pulse" : "text-slate-500"}`} />
          <span className="font-bold text-sm">Crispy</span>
          <span className="text-[10px] text-slate-500 mt-1">Witty Sarcasm</span>
        </button>

        {/* Deep Fried */}
        <button
          type="button"
          id="level-btn-deep-fried"
          onClick={() => handleLevelChange("deep fried")}
          className={`relative overflow-hidden rounded-xl p-4 flex flex-col items-center justify-center border transition-all duration-300 ${
            level === "deep fried"
              ? "bg-red-950/40 border-red-500/80 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
              : "bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-300 hover:bg-slate-950/60"
          }`}
        >
          <Flame className={`w-6 h-6 mb-2 ${level === "deep fried" ? "text-red-400 animate-pulse" : "text-slate-500"}`} />
          <span className="font-bold text-sm">Deep Fried</span>
          <span className="text-[10px] text-slate-500 mt-1">Savagery Only</span>
        </button>
      </div>

      {/* Slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs font-mono text-slate-400">
          <span>Eggshell (1)</span>
          <span className="text-orange-400 font-bold bg-orange-950/30 px-2 py-1 rounded border border-orange-900/40">
            Intensity: {intensity}/100
          </span>
          <span>Deep Fried (100)</span>
        </div>

        <input
          type="range"
          id="intensity-range-slider"
          min="1"
          max="100"
          value={intensity}
          onChange={handleIntensityChange}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-950 accent-orange-500"
          style={{
            background: `linear-gradient(to right, #f59e0b 0%, #f97316 40%, #ef4444 80%, #a855f7 100%)`
          }}
        />
      </div>

      {/* Thermometer Gauge Status */}
      <motion.div
        key={intensity}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-xl border flex gap-3 ${
          intensity <= 40
            ? "bg-amber-950/20 border-amber-900/30 text-amber-200"
            : intensity <= 80
            ? "bg-orange-950/20 border-orange-900/30 text-orange-200"
            : "bg-red-950/20 border-red-900/30 text-red-200"
        }`}
      >
        <Info className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider font-mono">
            Vibe: {feedback.label}
          </h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {feedback.desc}
          </p>
        </div>
      </motion.div>
    </div>
  );
};
