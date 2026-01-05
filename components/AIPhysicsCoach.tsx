
import React from 'react';

interface AIPhysicsCoachProps {
  analysis: string | null;
  isAnalyzing: boolean;
  onClose: () => void;
}

const AIPhysicsCoach: React.FC<AIPhysicsCoachProps> = ({ analysis, isAnalyzing, onClose }) => {
  if (!analysis && !isAnalyzing) return null;

  return (
    <div className="fixed bottom-24 right-6 w-80 sm:w-96 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-pink-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[60vh]">
        <div className="p-4 bg-gradient-to-r from-pink-600/20 to-blue-600/20 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div>
            <h3 className="text-xs font-black uppercase tracking-widest text-pink-400">Gemini Physics Coach</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="p-5 overflow-y-auto custom-scrollbar text-sm leading-relaxed text-slate-200">
          {isAnalyzing ? (
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
              </div>
              <p className="text-xs text-slate-500 font-medium italic">Calculating trajectories and forces...</p>
            </div>
          ) : (
            <div className="prose prose-invert prose-sm">
              {analysis?.split('\n').map((line, i) => (
                <p key={i} className={line.startsWith('#') ? 'text-pink-400 font-bold mt-2' : ''}>
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 bg-slate-950/50 border-t border-slate-800 flex items-center gap-2">
          <i className="fas fa-info-circle text-[10px] text-slate-500"></i>
          <p className="text-[9px] text-slate-500 font-medium uppercase tracking-tight">AI can make mistakes. Verify with your textbook!</p>
        </div>
      </div>
    </div>
  );
};

export default AIPhysicsCoach;
