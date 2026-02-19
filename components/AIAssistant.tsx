
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  photos: { id: string; url: string; filename: string }[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose, photos }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [query, setQuery] = useState('Find the best high-emotion moments from these photos.');

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setResult(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // We pass the prompt and references to the photos
      // For the demo, we simulate image analysis by passing the context of the filenames
      // In a real app, we'd pass base64 image data parts
      const prompt = `You are a professional photography editor. 
      Analyze this set of photos: ${photos.map(p => p.filename).join(', ')}.
      Based on the photographer's request: "${query}", which photos should they prioritize? 
      Give a concise summary and a few specific recommendations.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setResult(response.text || "No insights found.");
    } catch (error) {
      console.error("AI Analysis failed:", error);
      setResult("Error analyzing photos. Please check your connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-white dark:bg-gray-900 shadow-2xl z-50 border-l border-slate-200 dark:border-gray-800 animate-in slide-in-from-right duration-300 flex flex-col">
      <div className="p-6 border-b border-slate-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined">auto_awesome</span>
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight">AI Curator</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Powered by Gemini</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <span className="material-symbols-outlined text-slate-400">close</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
        <div className="space-y-4">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest">What are you looking for?</label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-32 p-4 rounded-2xl border border-slate-200 dark:border-gray-800 dark:bg-gray-800 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm resize-none"
            placeholder="e.g. Find all photos with the bride laughing..."
          />
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full h-14 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <span className="material-symbols-outlined animate-spin">sync</span>
                Analyzing Gallery...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">magic_button</span>
                Run Smart Analysis
              </>
            )}
          </button>
        </div>

        {result && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <label className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-base">psychology</span>
              AI Insights
            </label>
            <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 text-slate-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {result}
            </div>
            <div className="flex gap-2">
               <button className="flex-1 h-10 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50">Apply Tags</button>
               <button className="flex-1 h-10 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50">Save Recommendations</button>
            </div>
          </div>
        )}

        {!result && !isAnalyzing && (
          <div className="p-8 border-2 border-dashed border-slate-100 dark:border-gray-800 rounded-3xl flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-4xl text-slate-200 mb-4">image_search</span>
            <p className="text-sm text-slate-400 font-medium">Select a goal above to start analyzing your {photos.length} uploaded photos.</p>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-slate-100 dark:border-gray-800 bg-slate-50 dark:bg-gray-900/50">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">AI suggestions are for assistance and should be verified by the studio owner.</p>
      </div>
    </div>
  );
};

export default AIAssistant;
