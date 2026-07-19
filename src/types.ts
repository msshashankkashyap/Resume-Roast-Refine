export type RoastLevel = "eggshell" | "crispy" | "deep fried";

export interface LineRoast {
  excerpt: string;
  section: "Summary" | "Experience" | "Skills" | "Education" | "Formatting" | "Other";
  roast: string;
  emoji: string;
}

export interface ImprovedBullet {
  original_line: string;
  improved_line: string;
  why_it_works: string;
}

export interface RoastResult {
  id: string;
  timestamp: string;
  resume_name: string;
  roast_score: number;
  headline_roast: string;
  line_roasts: LineRoast[];
  silver_lining: string[];
  closing_line: string;
  optimized_resume_text?: string;
  improved_bullet_points?: ImprovedBullet[];
  config: {
    level: RoastLevel;
    intensity: number;
  };
}

export interface PresetResume {
  id: string;
  name: string;
  title: string;
  description: string;
  text: string;
  icon: string;
}
