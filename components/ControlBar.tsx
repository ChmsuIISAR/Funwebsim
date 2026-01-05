
import React from 'react';
import { SimulationStatus } from '../types';

interface ControlBarProps {
  status: SimulationStatus;
  onToggle: () => void;
  onReset: () => void;
}

const ControlBar: React.FC<ControlBarProps> = ({ status, onToggle, onReset }) => {
  const isRunning = status === SimulationStatus.RUNNING;
  const isFinished = status === SimulationStatus.FINISHED;

  return (
    <div className="flex items-center gap-3 p-2 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl">
      <button 
        onClick={onToggle}
        className={`
          relative flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-[0.15em] transition-all transform active:scale-95
          ${isFinished 
            ? 'bg-blue-600 hover:bg-blue-500 text-white' 
            : isRunning
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }
          shadow-lg hover:shadow-xl
        `}
      >
        <i className={`fas ${isFinished ? 'fa-rotate' : isRunning ? 'fa-pause' : 'fa-play'}`}></i>
        <span>{isFinished ? 'Restart' : isRunning ? 'Pause' : 'Launch'}</span>
      </button>

      <button 
        onClick={onReset}
        title="Reset All Parameters"
        className="flex items-center justify-center w-12 h-12 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-slate-700 active:rotate-[-45deg]"
      >
        <i className="fas fa-undo-alt"></i>
      </button>

      <div className="hidden sm:flex flex-col px-4 border-l border-slate-800">
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Engine Status</span>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-slate-600'}`}></div>
          <span className={`text-[10px] font-black uppercase ${isRunning ? 'text-emerald-400' : 'text-slate-500'}`}>
            {status}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ControlBar;
