import React, { useRef, useState } from "react";
import { FileText, Upload, ClipboardPaste, AlertCircle, Loader2 } from "lucide-react";

// Helper to load PDF.js from CDN and perform client-side text extraction
const loadPdfJs = () => {
  return new Promise<any>((resolve, reject) => {
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      // Configure PDF.js worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      resolve(pdfjsLib);
    };
    script.onerror = () => reject(new Error("Failed to load PDF engine from CDN."));
    document.head.appendChild(script);
  });
};

const extractTextFromPdf = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  const pdfjsLib = await loadPdfJs();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(" ");
    fullText += pageText + "\n";
  }
  return fullText;
};

interface ResumeUploadProps {
  resumeText: string;
  setResumeText: (text: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({
  resumeText,
  setResumeText,
  onSubmit,
  isLoading,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isParsing) return;
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    setFileError(null);

    // Limit to 4MB for PDFs, images, and document files
    if (file.size > 4 * 1024 * 1024) {
      setFileError("File is too large. Please upload a file smaller than 4MB.");
      return;
    }

    setIsParsing(true);

    try {
      const lowerName = file.name.toLowerCase();

      // 1. Client-side parsing for TXT and MD files (instant and 100% reliable)
      if (file.type === "text/plain" || lowerName.endsWith(".txt") || lowerName.endsWith(".md")) {
        const text = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsText(file);
        });

        if (text && text.trim()) {
          setResumeText(text);
          return;
        }
      }

      // 2. Client-side parsing for PDF files (bypasses Netlify payload limit & timeouts)
      if (file.type === "application/pdf" || lowerName.endsWith(".pdf")) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdfText = await extractTextFromPdf(arrayBuffer);
          if (pdfText && pdfText.trim().length > 10) {
            setResumeText(pdfText);
            return;
          } else {
            throw new Error("No readable text found in PDF (it might be a scanned image-only PDF). Falling back to server-side OCR...");
          }
        } catch (pdfErr: any) {
          console.warn("Client-side PDF text extraction failed, falling back to server-side OCR:", pdfErr);
        }
      }

      // 3. Fallback to server-side parser for DOCX, DOC, ODT, RTF, and Scanned Image OCR
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            const base64 = reader.result.split(",")[1];
            resolve(base64);
          } else {
            reject(new Error("Failed to read file."));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });

      const response = await fetch("/api/parse-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileData: base64Data,
          fileName: file.name,
          mimeType: file.type,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Parsing failed with status ${response.status}`);
      }

      const data = await response.json();
      if (data.text) {
        setResumeText(data.text);
      } else {
        throw new Error("No readable text found in this file.");
      }
    } catch (err: any) {
      console.error("Error parsing file:", err);
      setFileError(err.message || "Could not parse text from this file format.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (isParsing) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isParsing) return;
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    if (isParsing) return;
    fileInputRef.current?.click();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6" id="resume-upload-form">
      <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            2. Feed the Roast Beast
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Drag-and-drop your resume file or paste your resume content directly below.
          </p>
        </div>

        {/* Drag and Drop Zone / File Input */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          id="drag-drop-zone"
          className={`group relative rounded-xl border-2 border-dashed p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
            isParsing
              ? "border-slate-800 bg-slate-950/20 text-slate-500 cursor-not-allowed pointer-events-none"
              : isDragActive
              ? "border-indigo-500 bg-indigo-950/20 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
              : "border-slate-700 bg-slate-950/40 text-slate-400 hover:border-slate-500 hover:bg-slate-950/60"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx,.doc,.odt,.rtf,.txt,.md,.png,.jpg,.jpeg"
            className="hidden"
            id="resume-file-input"
            disabled={isParsing}
          />

          {isParsing ? (
            <>
              <Loader2 className="w-10 h-10 mb-3 text-indigo-400 animate-spin" />
              <p className="font-semibold text-sm text-slate-200">
                AI parsing in progress...
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
                Extracting structured resume content and handling layouts/OCR...
              </p>
            </>
          ) : (
            <>
              <Upload className={`w-10 h-10 mb-3 transition-transform ${isDragActive ? "scale-110 text-indigo-400 animate-bounce" : "text-slate-500 group-hover:text-slate-400"}`} />
              <p className="font-semibold text-sm text-slate-200">
                Drag & drop your resume file here, or <span className="text-indigo-400 group-hover:underline">browse files</span>
              </p>
              <div className="text-xs text-slate-500 mt-2 max-w-[320px] leading-relaxed">
                Supports <span className="text-indigo-300 font-mono text-[11px] font-bold">PDF, DOCX, DOC, ODT, RTF, TXT, MD</span> and <span className="text-indigo-300 font-mono text-[11px] font-bold">PNG/JPG</span> (with advanced AI OCR)
              </div>
            </>
          )}
        </div>

        {/* File Error Notification */}
        {fileError && (
          <div className="flex items-center gap-2 bg-red-950/30 text-red-400 text-xs p-3 rounded-lg border border-red-900/30" id="file-error-alert">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{fileError}</span>
          </div>
        )}

        {/* Text Area */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="resume-textarea" className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ClipboardPaste className="w-3.5 h-3.5" />
              Direct Paste Resume Text
            </label>
            <span className="text-[10px] text-slate-500 font-mono">
              {resumeText ? `${resumeText.length} characters` : "Empty"}
            </span>
          </div>

          <textarea
            id="resume-textarea"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your professional experience, buzzwords, and formatting mistakes here..."
            className="w-full h-64 rounded-xl bg-slate-950/90 border border-slate-800 p-4 text-slate-300 font-mono text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-y leading-relaxed"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !resumeText.trim()}
        id="roast-now-submit-btn"
        className={`w-full py-4 px-6 rounded-xl font-bold tracking-wide shadow-lg flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${
          !resumeText.trim()
            ? "bg-slate-800 text-slate-500 cursor-not-allowed"
            : "bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-white hover:brightness-110 active:scale-[0.98] shadow-orange-500/10 hover:shadow-orange-500/25"
        }`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Analyzing Synergy Matrix...</span>
          </>
        ) : (
          <span>🔥🔥 Roast My Resume Now 🔥🔥</span>
        )}
      </button>
    </form>
  );
};
