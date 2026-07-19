import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import mammoth from "mammoth";
import AdmZip from "adm-zip";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "4mb" })); // Vercel caps request bodies at 4.5mb, keep under it

// Lazy initializer for Gemini client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please ensure GEMINI_API_KEY is configured in your environment variables.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// System instruction for Gemini model
const SYSTEM_INSTRUCTION = `You are the Resume Roast AI — a razor-witted, meme-literate resume critic performing as an entertainment/coaching hybrid. 
You analyze resumes LINE BY LINE and generate sharp, specific, genuinely funny roasts, calibrated to the selected intensity level and score.
You are never generic — every roast must reference something SPECIFIC the person actually wrote.

You must strictly calibrate your humor to the selected roast level and intensity:

ROAST LEVEL CALIBRATION:
1. Eggshell (Intensity 1–40):
   - Vibe: Warm, encouraging, teasing at most. Like a supportive friend who still tells you the truth.
   - Style: Gentle jabs wrapped in genuine support. Never sarcastic in a way that could sting.
   - Rule: Always end each individual roast on an uplifting or funny-not-mean note.

2. Crispy (Intensity 41–80):
   - Vibe: Direct, witty, unafraid to call out clichés, vague language, or weak phrasing.
   - Style: Confident sarcasm, sitcom-roast energy. Honest but not cruel.
   - Rule: The person should laugh AND wince a little.

3. Deep Fried (Intensity 81–100):
   - Vibe: Maximum savagery. Merciless, meme-heavy, comedically brutal.
   - Style: Twitter roast thread or Gordon Ramsay reviewing a burnt steak.
   - Rule: Still never punch at protected characteristics, appearance, or anything not on the page itself — the roast is 100% about the RESUME CONTENT and CHOICES, never the person's worth as a human.

HARD RULES:
1. Roast the WRITING, not the person. Never imply the person is stupid, worthless, or unemployable as a human being. Keep criticism 100% focused on their content and phrasing.
2. No punching down on protected characteristics (age, gender, race, disability, etc.) even if inferable.
3. Every roast must be traceable to a specific line, phrase, or section you quote or closely paraphrase in the 'excerpt'.
4. Even at max intensity, the SILVER LINING section must contain genuinely useful, specific, actionable resume advice — the comedy is the hook, the value is the substance.
5. Do not fabricate content that isn't in the resume — roast what is actually there (or actually missing, like no metrics, no action verbs, generic objective statements, formatting chaos, etc.).`;

// POST /api/roast
app.post("/api/roast", async (req, res) => {
  try {
    const { resumeText, roastLevel, intensityScore } = req.body;

    if (!resumeText || typeof resumeText !== "string") {
      return res.status(400).json({ error: "Resume text is required and must be a string." });
    }

    const levelStr = roastLevel || "crispy";
    const intensity = Number(intensityScore) || 50;

    const client = getGeminiClient();

    const userPrompt = `
RESUME TEXT TO ROAST:
"""
${resumeText}
"""

ROAST LEVEL SELECTED: ${levelStr}
INTENSITY SCORE: ${intensity} out of 100

Perform a brilliant, highly specific, and hilarious line-by-line review of the resume above conforming exactly to the selected Roast Level and Intensity. Produce a JSON object that strictly adheres to the requested output format. Make sure you find at least 5 but up to 10 specific quotes or excerpts to roast.
`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 1.0,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            roast_score: {
              type: Type.INTEGER,
              description: "A score from 0 to 100 indicating how much structural or content-based fixing this resume needs (where 100 means it needs 100% rebuilding, and 0 means it is pristine)."
            },
            headline_roast: {
              type: Type.STRING,
              description: "One punchy, extremely witty, and highly quotable one-liner summarizing the resume's biggest overall theme, flaw, or general vibe."
            },
            line_roasts: {
              type: Type.ARRAY,
              description: "Line-by-line critical analysis of 5 to 10 notable weak parts, clichés, or flaws actually present in the resume.",
              items: {
                type: Type.OBJECT,
                properties: {
                  excerpt: {
                    type: Type.STRING,
                    description: "A specific direct quote or very close paraphrase of a line or section from the resume."
                  },
                  section: {
                    type: Type.STRING,
                    description: "The resume section this belongs to. Must be one of: Summary, Experience, Skills, Education, Formatting, Other."
                  },
                  roast: {
                    type: Type.STRING,
                    description: "The highly specific roast tailored to the selected roast level and intensity. References actual details from the excerpt, avoids generic jokes, uses modern tech and workplace memes."
                  },
                  emoji: {
                    type: Type.STRING,
                    description: "A single, highly expressive emoji capturing the exact reaction to this line."
                  }
                },
                required: ["excerpt", "section", "roast", "emoji"]
              }
            },
            silver_lining: {
              type: Type.ARRAY,
              description: "3 highly actionable, clear, constructive and genuinely useful tips for improving the resume. These should be real career/coaching suggestions, showing the user how to fix the roasted items.",
              items: {
                type: Type.STRING
              }
            },
            closing_line: {
              type: Type.STRING,
              description: "A final mic-drop closing sentence to finish the roast on-brand."
            },
            optimized_resume_text: {
              type: Type.STRING,
              description: "The complete fully revised, rewritten and professionalized version of the resume. Replace all clichés with high-impact action verbs and insert sensible quantitative metric placeholders (e.g., [X]% increase, [$]Y saved, [Z] hours of manual labor reduced) for the user to customize. Organize cleanly using markdown headings and clean bullets."
            },
            improved_bullet_points: {
              type: Type.ARRAY,
              description: "Provide a side-by-side comparison list of 3 key bullet points or summaries that were heavily roasted. Map original weak line to the new optimized version.",
              items: {
                type: Type.OBJECT,
                properties: {
                  original_line: {
                    type: Type.STRING,
                    description: "The exact weak line, passive bullet or cliché from the user's resume."
                  },
                  improved_line: {
                    type: Type.STRING,
                    description: "The newly rewritten professional version of this line incorporating strong action verbs and metric templates."
                  },
                  why_it_works: {
                    type: Type.STRING,
                    description: "A short professional explanation of why this rewritten bullet point works better."
                  }
                },
                required: ["original_line", "improved_line", "why_it_works"]
              }
            }
          },
          required: ["roast_score", "headline_roast", "line_roasts", "silver_lining", "closing_line", "optimized_resume_text", "improved_bullet_points"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response generated by the Gemini model.");
    }

    // Try parsing the response to ensure it's valid JSON
    let parsedData;
    try {
      parsedData = JSON.parse(text.trim());
    } catch (parseErr) {
      console.error("JSON parsing error of model output:", text);
      return res.status(500).json({
        error: "Failed to parse roast response into valid structured JSON.",
        rawText: text
      });
    }

    return res.json(parsedData);
  } catch (error: any) {
    console.error("Error generating roast:", error);
    return res.status(500).json({
      error: error.message || "An unexpected error occurred while roasting the resume."
    });
  }
});

// Document/Resume Parsing Helpers
function parseOdt(base64Data: string): string {
  const buffer = Buffer.from(base64Data, "base64");
  const zip = new AdmZip(buffer);
  const contentEntry = zip.getEntry("content.xml");
  if (!contentEntry) {
    throw new Error("Invalid ODT file: content.xml not found.");
  }
  const xml = contentEntry.getData().toString("utf-8");
  const matches = xml.match(/<text:(p|h)[^>]*>([\s\S]*?)<\/text:(p|h)>/g);
  if (!matches) return "";
  return matches
    .map(match => match.replace(/<[^>]+>/g, "").trim())
    .filter(line => line.length > 0)
    .join("\n");
}

function parseRtf(base64Data: string): string {
  const rawText = Buffer.from(base64Data, "base64").toString("utf-8");
  let text = rawText;
  text = text.replace(/\\([a-z]{1,32})(-?\d+)? ?/gi, " ");
  text = text.replace(/\\'[0-9a-f]{2}/gi, " ");
  text = text.replace(/[\{\}]/g, "");
  const lines = text.split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);
  return lines.join("\n");
}

function parseDoc(base64Data: string): string {
  const buffer = Buffer.from(base64Data, "base64");
  let result = "";
  let currentString = "";
  for (let i = 0; i < buffer.length; i++) {
    const char = buffer[i];
    if ((char >= 32 && char <= 126) || char === 9 || char === 10 || char === 13) {
      currentString += String.fromCharCode(char);
    } else {
      if (currentString.length >= 4) {
        result += currentString + "\n";
      }
      currentString = "";
    }
  }
  if (currentString.length >= 4) {
    result += currentString + "\n";
  }

  const lines = result.split("\n")
    .map(line => line.trim())
    .filter(line => {
      if (line.length < 3) return false;
      if (
        line.includes("WordDocument") ||
        line.includes("SummaryInformation") ||
        line.includes("DocumentSummary") ||
        line.includes("CompObj") ||
        line.includes("ObjectPool") ||
        line.includes("Microsoft Word") ||
        line.includes("MSWordDoc") ||
        line.startsWith("Title") ||
        line.includes("Normal.dotm") ||
        line.includes("Microsoft Office")
      ) {
        return false;
      }
      const printableRatio = line.replace(/[^a-zA-Z0-9\s\.,;:\-\(\)\/]/g, "").length / line.length;
      if (printableRatio < 0.7) return false;
      return true;
    });

  return lines.join("\n");
}

app.post("/api/parse-resume", async (req, res) => {
  try {
    const { fileData, fileName, mimeType } = req.body;

    if (!fileData || !fileName) {
      return res.status(400).json({ error: "fileData (base64) and fileName are required." });
    }

    const ext = path.extname(fileName).toLowerCase();
    let extractedText = "";

    if (ext === ".txt" || ext === ".md") {
      extractedText = Buffer.from(fileData, "base64").toString("utf-8");
    } else if (ext === ".docx") {
      const buffer = Buffer.from(fileData, "base64");
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value || "";
    } else if (ext === ".odt") {
      extractedText = parseOdt(fileData);
    } else if (ext === ".rtf") {
      extractedText = parseRtf(fileData);
    } else if (ext === ".doc") {
      extractedText = parseDoc(fileData);
    } else if (ext === ".pdf") {
      const client = getGeminiClient();
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            parts: [
              {
                inlineData: {
                  data: fileData,
                  mimeType: "application/pdf"
                }
              },
              {
                text: "Please extract all readable, structured text content from this resume PDF precisely. Maintain all headers, bullet points, and details. Do not include any of your own commentary, explanations, or formatting metadata. Only return the raw extracted text."
              }
            ]
          }
        ]
      });
      extractedText = response.text || "";
    } else if (ext === ".png" || ext === ".jpg" || ext === ".jpeg") {
      const client = getGeminiClient();
      const normalizedMime = ext === ".png" ? "image/png" : "image/jpeg";
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            parts: [
              {
                inlineData: {
                  data: fileData,
                  mimeType: normalizedMime
                }
              },
              {
                text: "Please perform high-accuracy OCR on this resume image. Extract all readable, structured text content precisely. Maintain all headers, bullet points, and details. Do not include any of your own commentary, explanations, or formatting metadata. Only return the raw extracted text."
              }
            ]
          }
        ]
      });
      extractedText = response.text || "";
    } else {
      return res.status(400).json({ error: `Unsupported file format: ${ext}` });
    }

    if (!extractedText.trim()) {
      return res.status(422).json({ error: "Could not extract any text from this file. Ensure it is not empty or corrupted." });
    }

    return res.json({ text: extractedText });
  } catch (error: any) {
    console.error("Error parsing resume file:", error);
    return res.status(500).json({
      error: error.message || "An unexpected error occurred while parsing the file."
    });
  }
});

// ---------------------------------------------------------------------------
// Local dev vs. Vercel behavior
// ---------------------------------------------------------------------------
// On Vercel (process.env.VERCEL is set automatically), we ONLY export the
// Express app as a serverless function handler — no app.listen(), and no
// static file serving (Vercel serves your built frontend separately, based
// on vercel.json). Locally, we spin up Vite in middleware mode for dev, or
// serve the built /dist folder in production-like local runs, and actually
// bind to a port.
// ---------------------------------------------------------------------------

if (!process.env.VERCEL) {
  (async () => {
    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  })();
}

export default app;
