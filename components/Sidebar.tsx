import React from 'react';
import { MotionVariables } from '../types';
import { CHARACTERS } from '../constants';

interface SidebarProps {
  objectVars: Record<string, MotionVariables>;
  onIndividualChange: (id: string, key: keyof MotionVariables | string, value: number) => void;
  globalVars: any;
  onGlobalChange: (key: string, value: any) => void;
  onResetDefaults: () => void;
  simulationActive: boolean;
  onClose?: () => void;
}

const Slider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  tooltip: string;
  accentColor: string;
  onChange: (val: number) => void;
  disabled?: boolean;
}> = ({ label, value, min, max, step, unit, tooltip, accentColor, onChange, disabled }) => (
  <div className="mb-6 group relative">
    <div className="flex justify-between items-end mb-2">
      <label className="text-[10px] font-bold text-slate-400 group-hover:text-slate-200 transition-colors flex items-center gap-2 uppercase tracking-widest">
        {label}
        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
           <i className="fas fa-circle-question text-[9px] text-slate-500 cursor-help" title={tooltip}></i>
        </span>
      </label>
      <span className="text-[11px] font-mono font-bold text-white bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/50 min-w-[4rem] text-center shadow-inner">
        {value.toLocaleString()}{unit}
      </span>
    </div>
    <div className="relative flex items-center h-5">
      <input 
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        style={{ color: accentColor }}
        className={`transition-all ${disabled ? 'opacity-20 grayscale cursor-not-allowed' : 'opacity-100 hover:brightness-110'}`}
      />
    </div>
  </div>
);

const Sidebar: React.FC<SidebarProps> = ({ 
  objectVars, 
  onIndividualChange, 
  globalVars,
  onGlobalChange,
  onResetDefaults,
  simulationActive,
  onClose
}) => {
  return (
    <aside className="w-[85vw] max-w-[300px] sm:w-80 bg-slate-950 border-r border-slate-800 flex flex-col h-full overflow-y-auto custom-scrollbar shadow-2xl relative z-50">
      
      <div className="lg:hidden flex justify-between items-center p-5 border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
        <h2 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">Lab Configuration</h2>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-white bg-slate-800 rounded-lg transition-colors">
          <i className="fas fa-chevron-left"></i>
        </button>
      </div>

      <div className="p-6">
        <div className="mb-8">
          <button 
            onClick={onResetDefaults}
            disabled={simulationActive}
            className="w-full p-3 bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-600 rounded-xl transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] disabled:opacity-20 disabled:cursor-not-allowed active:scale-95 shadow-lg group"
          >
            <i className="fas fa-rotate-left group-hover:rotate-[-90deg] transition-transform duration-300"></i>
            Reset to Default Settings
          </button>
        </div>

        <section className="mb-8">
          <h2 className="text-[10px] font-black text-blue-400 mb-6 uppercase flex items-center gap-3 tracking-[0.2em]">
            <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
            GLOBAL CONTROLS
          </h2>

          <Slider 
            label="Max Distance"
            value={globalVars.maxDistance}
            min={10} max={1000} step={10} unit=" m"
            tooltip="Set the total track length in meters."
            accentColor="#3b82f6"
            onChange={(v) => onGlobalChange('maxDistance', v)}
            disabled={simulationActive}
          />
          <Slider 
            label="Time Scale"
            value={globalVars.timeScale}
            min={0.1} max={5} step={0.1} unit="x"
            tooltip="Control simulation clock speed. 1x is real-time."
            accentColor="#eab308"
            onChange={(v) => onGlobalChange('timeScale', v)}
            disabled={false}
          />
        </section>

        {CHARACTERS.map((char) => (
          <section key={char.id} className="mb-10 pt-6 border-t border-slate-900/50">
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="w-8 h-8 rounded-xl border flex items-center justify-center shadow-lg transform rotate-3"
                style={{ borderColor: `${char.color}66`, backgroundColor: `${char.color}11` }}
              >
                <i className="fas fa-robot text-sm" style={{ color: char.color }}></i>
              </div>
              <div>
                <h3 className="font-black text-xs text-slate-100 uppercase tracking-widest">
                  {char.name}
                </h3>
                <div className="w-12 h-0.5 mt-1 rounded-full opacity-50" style={{ backgroundColor: char.color }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <Slider 
                label="Initial Velocity"
                value={objectVars[char.id].velocity}
                min={0} max={100} step={1} unit=" m/s"
                tooltip="Starting speed at t = 0."
                accentColor={char.color}
                onChange={(v) => onIndividualChange(char.id, 'velocity', v)}
                disabled={simulationActive}
              />
              <Slider 
                label="Applied Force"
                value={objectVars[char.id].force}
                min={0} max={1000} step={5} unit=" N"
                tooltip="Constant thrust force applied to the object."
                accentColor={char.color}
                onChange={(v) => onIndividualChange(char.id, 'force', v)}
                disabled={simulationActive}
              />
              <Slider 
                label="Mass"
                value={objectVars[char.id].mass}
                min={1} max={100} step={1} unit=" kg"
                tooltip="Resistance to acceleration (Inertia)."
                accentColor={char.color}
                onChange={(v) => onIndividualChange(char.id, 'mass', v)}
                disabled={simulationActive}
              />
              <Slider 
                label="Friction"
                value={objectVars[char.id].friction}
                min={0} max={1.0} step={0.01} unit=" (μ)"
                tooltip="Coefficient of kinetic friction (μk)."
                accentColor={char.color}
                onChange={(v) => onIndividualChange(char.id, 'friction', v)}
                disabled={simulationActive}
              />
              <Slider 
                label="Air Resistance"
                value={objectVars[char.id].airResistance}
                min={0} max={0.2} step={0.001} unit=" (k)"
                tooltip="Quadratic drag coefficient (k) for air resistance."
                accentColor={char.color}
                onChange={(v) => onIndividualChange(char.id, 'airResistance', v)}
                disabled={simulationActive}
              />
            </div>
          </section>
        ))}
      </div>

      <div className="p-6 mt-auto bg-slate-900/40 border-t border-slate-800">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/50">
          <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 flex items-center gap-2 mb-2 uppercase">
            <i className="fas fa-graduation-cap text-emerald-500"></i> Scientific Context
          </p>
          <p className="text-[10px] leading-relaxed text-slate-500 font-medium italic">
            "Net Force (ΣF) = Applied Force - Friction - Air Resistance. Acceleration (a) = ΣF / m."
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;