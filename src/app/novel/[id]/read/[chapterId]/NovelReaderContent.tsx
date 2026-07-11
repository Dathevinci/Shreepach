"use client";

import { useState } from "react";
import { Type, Moon, Sun, Settings } from "lucide-react";

export default function NovelReaderContent({ 
  chapter, 
  novelId, 
  novelSlug 
}: { 
  chapter: any; 
  novelId: number; 
  novelSlug: string;
}) {
  const [fontSize, setFontSize] = useState("text-lg");
  const [theme, setTheme] = useState("dark"); // dark, sepia, light
  const [showSettings, setShowSettings] = useState(false);

  const getThemeClasses = () => {
    switch(theme) {
      case "sepia": return "bg-[#f4ecd8] text-[#5b4636]";
      case "light": return "bg-white text-slate-800";
      case "dark": default: return "bg-[#09090b] text-slate-300";
    }
  };

  return (
    <div className={`relative min-h-[80vh] transition-colors duration-300 ${getThemeClasses()}`}>
      
      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-4 right-4 z-40 bg-[#141414] border border-white/10 rounded-xl p-4 shadow-2xl animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Text Size</h4>
              <div className="flex items-center gap-2">
                <button onClick={() => setFontSize("text-base")} className={`w-8 h-8 rounded flex items-center justify-center font-serif text-sm ${fontSize === "text-base" ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}>A</button>
                <button onClick={() => setFontSize("text-lg")} className={`w-8 h-8 rounded flex items-center justify-center font-serif text-lg ${fontSize === "text-lg" ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}>A</button>
                <button onClick={() => setFontSize("text-xl")} className={`w-8 h-8 rounded flex items-center justify-center font-serif text-xl ${fontSize === "text-xl" ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}>A</button>
                <button onClick={() => setFontSize("text-2xl")} className={`w-8 h-8 rounded flex items-center justify-center font-serif text-2xl ${fontSize === "text-2xl" ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}>A</button>
              </div>
            </div>
            
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Theme</h4>
              <div className="flex items-center gap-2">
                <button onClick={() => setTheme("dark")} className={`w-8 h-8 rounded-full flex items-center justify-center bg-[#09090b] border-2 ${theme === "dark" ? "border-indigo-500" : "border-white/10"}`}>
                  <Moon className="w-4 h-4 text-slate-300" />
                </button>
                <button onClick={() => setTheme("sepia")} className={`w-8 h-8 rounded-full flex items-center justify-center bg-[#f4ecd8] border-2 ${theme === "sepia" ? "border-indigo-500" : "border-black/10"}`}>
                  <span className="w-4 h-4 rounded-full bg-[#5b4636]"></span>
                </button>
                <button onClick={() => setTheme("light")} className={`w-8 h-8 rounded-full flex items-center justify-center bg-white border-2 ${theme === "light" ? "border-indigo-500" : "border-black/10"}`}>
                  <Sun className="w-4 h-4 text-slate-800" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Settings Toggle */}
      <button 
        onClick={() => setShowSettings(!showSettings)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-500 hover:scale-105 transition-all"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-black mb-12 text-center font-serif leading-tight">
          {chapter.title}
        </h2>
        
        <div 
          className={`font-serif leading-loose space-y-6 ${fontSize}`}
          dangerouslySetInnerHTML={{ __html: chapter.content }}
        />
      </div>
    </div>
  );
}
