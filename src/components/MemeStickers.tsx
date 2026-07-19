import React, { useRef } from "react";
import { motion } from "motion/react";

interface MemeStickerProps {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  rotation: string;
  position: string; // for lg absolute layouts
  color: string;
  badgeColor: string;
}

export const MEME_STICKERS: MemeStickerProps[] = [
  {
    id: "where-metrics",
    emoji: "🔍",
    title: "WHERE METRICS?",
    desc: "Critical quantitative deficiency detected",
    rotation: "-rotate-6",
    position: "top-24 left-4",
    color: "bg-red-500/20 text-red-300 border-red-500/40 shadow-red-500/10",
    badgeColor: "bg-red-500/30 text-red-200 border-red-400/30"
  },
  {
    id: "stonks-down",
    emoji: "📉",
    title: "STONKS DOWN",
    desc: "Your market value after this summary",
    rotation: "rotate-3",
    position: "top-[400px] right-6",
    color: "bg-orange-500/20 text-orange-300 border-orange-500/40 shadow-orange-500/10",
    badgeColor: "bg-orange-500/30 text-orange-200 border-orange-400/30"
  },
  {
    id: "this-is-fine",
    emoji: "🔥",
    title: "THIS IS FINE.",
    desc: "Everything is burning, but stay positive",
    rotation: "rotate-6",
    position: "bottom-12 left-6",
    color: "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/10",
    badgeColor: "bg-amber-500/30 text-amber-200 border-amber-400/30"
  },
  {
    id: "chatgpt-spotted",
    emoji: "🤖",
    title: "AI SLOP DETECTED",
    desc: "100% written by ChatGPT",
    rotation: "-rotate-3",
    position: "bottom-[350px] right-4",
    color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-indigo-500/10",
    badgeColor: "bg-indigo-500/30 text-indigo-200 border-indigo-400/30"
  },
];

export const MemeStickers: React.FC<{ active: boolean }> = ({ active }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  if (!active) return null;

  return (
    <div 
      ref={containerRef}
      className="relative lg:absolute lg:inset-0 pointer-events-none w-full" 
      id="meme-stickers-container"
    >
      {/* 1. Mobile/Tablet Responsive Sticker Tray (displays inline on smaller screens, hidden on lg screens) */}
      <div className="lg:hidden flex flex-wrap gap-3 justify-center py-2 px-1 mb-4 select-none">
        {MEME_STICKERS.map((sticker) => (
          <motion.div
            key={sticker.id + "-mobile"}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2.5 p-2.5 rounded-xl border backdrop-blur-md text-left shadow-sm ${sticker.color}`}
          >
            <span className="text-2xl">{sticker.emoji}</span>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-mono font-extrabold text-[10px] tracking-wide uppercase">
                  {sticker.title}
                </span>
                <span className="text-[8px] px-1 py-0.2 rounded font-black bg-black/40 text-amber-400 border border-amber-500/20 font-mono">
                  STICKER
                </span>
              </div>
              <p className="text-[9px] text-slate-300 leading-tight mt-0.5 max-w-[120px] line-clamp-1">
                {sticker.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 2. Desktop Fully Draggable Floating Stickers (displays only on lg screens) */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none overflow-hidden h-full w-full">
        {MEME_STICKERS.map((sticker) => (
          <motion.div
            key={sticker.id + "-desktop"}
            drag
            dragConstraints={containerRef}
            dragElastic={0.2}
            dragMomentum={true}
            initial={{ opacity: 0, scale: 0.5, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1, rotate: sticker.rotation.includes("-") ? "-12deg" : "12deg" }}
            whileDrag={{ scale: 1.15, cursor: "grabbing" }}
            className={`absolute ${sticker.position} ${sticker.rotation} flex flex-col p-4 rounded-2xl border backdrop-blur-md max-w-[170px] shadow-2xl pointer-events-auto cursor-grab active:cursor-grabbing transition-shadow hover:shadow-orange-500/15 ${sticker.color}`}
            style={{ userSelect: "none" }}
            title="Drag me around! 🤪"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-3.5xl filter drop-shadow">{sticker.emoji}</span>
              <span className={`text-[8px] font-black font-mono tracking-widest px-1.5 py-0.5 rounded-full border uppercase ${sticker.badgeColor}`}>
                GigaSticker
              </span>
            </div>
            <h5 className="font-mono font-black text-xs tracking-wider uppercase">
              {sticker.title}
            </h5>
            <p className="text-[10px] text-slate-300 leading-snug mt-1 font-medium">
              {sticker.desc}
            </p>
            <div className="mt-2.5 pt-1.5 border-t border-white/5 flex justify-between items-center text-[8px] font-mono text-slate-400 uppercase tracking-widest">
              <span>Drag to move</span>
              <span>🤪</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
