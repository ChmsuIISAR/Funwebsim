import React from 'react';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header className="bg-slate-950 border-b border-slate-800 p-2 sm:p-4 flex justify-between items-center shadow-lg relative z-20 shrink-0">
      <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
        {/* Mobile Sidebar Toggle */}
        <button 
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors flex-shrink-0"
          aria-label="Toggle Settings"
        >
          <i className="fas fa-sliders text-lg sm:text-xl"></i>
        </button>

        <div className="w-7 h-7 sm:w-10 sm:h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center shadow-lg shrink-0">
          <i className="fas fa-atom text-white text-sm sm:text-xl"></i>
        </div>
        
        <div className="min-w-0">
          <h1 className="text-xs sm:text-lg md:text-xl font-black bg-gradient-to-r from-pink-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent truncate tracking-tight">
            Funweb Physics: Motion Simulation
          </h1>
          <p className="text-[7px] sm:text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold truncate">
            Grade 7 Motion Module
          </p>
        </div>
      </div>
      
      {/* Top right indicators removed as requested */}
    </header>
  );
};

export default Header;