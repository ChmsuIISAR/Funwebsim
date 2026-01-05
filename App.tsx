import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SimulationStatus, SimulationObjectState, MotionVariables } from './types';
import { CHARACTERS, INITIAL_VARIABLES, PHYSICS } from './constants';
import Sidebar from './components/Sidebar';
import SimulationCanvas from './components/SimulationCanvas';
import ControlBar from './components/ControlBar';
import Header from './components/Header';
import './App.css';

const App: React.FC = () => {
  const [status, setStatus] = useState<SimulationStatus>(SimulationStatus.IDLE);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [simTime, setSimTime] = useState(0);

  const [globalVars, setGlobalVars] = useState({
    maxDistance: INITIAL_VARIABLES.maxDistance,
    timeScale: INITIAL_VARIABLES.timeScale,
  });

  const [objectVars, setObjectVars] = useState<Record<string, MotionVariables>>({
    blossom: { ...INITIAL_VARIABLES },
    bubbles: { ...INITIAL_VARIABLES },
    buttercup: { ...INITIAL_VARIABLES },
  });

  const [objects, setObjects] = useState<SimulationObjectState[]>(
    CHARACTERS.map((char) => ({
      id: char.id,
      name: char.name,
      color: char.color,
      image: char.image,
      position: 0,
      velocity: 0,
      acceleration: 0,
      variables: { ...objectVars[char.id] },
      trail: [],
      isFinished: false,
    }))
  );

  const requestRef = useRef<number>(null);
  const lastTimestampRef = useRef<number | null>(null);

  const resetSimulation = useCallback(() => {
    setStatus(SimulationStatus.IDLE);
    setSimTime(0);
    lastTimestampRef.current = null;
    setObjects(prev => prev.map(obj => ({
      ...obj,
      position: 0,
      velocity: objectVars[obj.id].velocity || 0,
      acceleration: 0,
      trail: [],
      isFinished: false,
      variables: { 
        ...objectVars[obj.id], 
        maxDistance: globalVars.maxDistance
      }
    })));
  }, [objectVars, globalVars]);

  const resetToDefaultSettings = useCallback(() => {
    if (status !== SimulationStatus.IDLE) return;
    
    const defaults = { ...INITIAL_VARIABLES };
    setGlobalVars({
      maxDistance: defaults.maxDistance,
      timeScale: defaults.timeScale,
    });
    setObjectVars({
      blossom: { ...defaults },
      bubbles: { ...defaults },
      buttercup: { ...defaults },
    });
  }, [status]);

  const updatePhysics = useCallback((timestamp: number) => {
    if (status !== SimulationStatus.RUNNING) {
      lastTimestampRef.current = null;
      return;
    }

    if (lastTimestampRef.current === null) {
      lastTimestampRef.current = timestamp;
      requestRef.current = requestAnimationFrame(updatePhysics);
      return;
    }

    const frameDelta = (timestamp - lastTimestampRef.current) / 1000;
    lastTimestampRef.current = timestamp;
    
    // Strictly follow real-world delta time multiplied only by user-defined scale
    const dt = frameDelta * globalVars.timeScale;
    setSimTime(prev => prev + dt);

    setObjects((prevObjects) => {
      const newObjects = prevObjects.map((obj) => {
        if (obj.isFinished) return obj;

        const vars = obj.variables;
        const g = PHYSICS.GRAVITY;
        const mass = vars.mass;
        const F_app = vars.force;
        
        // Physics Calculation according to Newton's Second Law: Fnet = m * a
        // Kinetic Friction: Fk = mu * m * g
        // Static Friction: Fs_max = mu_s * m * g
        const F_fric_k = vars.friction * mass * g;
        const F_fric_s_max = F_fric_k * PHYSICS.STATIC_FRICTION_MULTIPLIER;
        
        let F_net = 0;
        const v = obj.velocity;
        
        // Quadratic Air Resistance (Drag): Fd = k * v^2
        const F_drag = vars.airResistance * v * Math.abs(v);

        if (Math.abs(v) < 0.001) {
          // Object is at rest: check static friction threshold
          if (Math.abs(F_app) > F_fric_s_max) {
            // Break static friction, use kinetic friction for motion
            F_net = F_app - (Math.sign(F_app) * F_fric_k) - F_drag;
          } else {
            // Locked by static friction
            F_net = 0;
          }
        } else {
          // Object is in motion: kinetic friction opposes velocity direction
          const frictionDir = Math.sign(v);
          F_net = F_app - (frictionDir * F_fric_k) - F_drag;
          
          // Friction/Drag can only stop an object, not reverse it instantly
          // Verify if the net force would cause a velocity sign flip within this dt
          const potentialA = F_net / mass;
          const potentialV = v + potentialA * dt;
          if (Math.sign(potentialV) !== Math.sign(v) && Math.abs(potentialV) > 0.001) {
             // Friction stopped the object perfectly
             F_net = -v * mass / dt;
          }
        }

        const acceleration = F_net / mass;
        
        // Semi-implicit Euler integration for stability
        const newVelocity = v + acceleration * dt;
        let position = obj.position + newVelocity * dt;

        let isFinished = false;
        if (position >= globalVars.maxDistance) {
          position = globalVars.maxDistance;
          isFinished = true;
        } else if (position < 0) {
          position = 0;
          // Bounce or stop at starting gate (clamped for consistency)
        }

        const newTrail = [...obj.trail, { x: position, y: 0, opacity: 1.0 }]
          .slice(-PHYSICS.MAX_TRAIL_LENGTH)
          .map(t => ({ ...t, opacity: Math.max(0, t.opacity - PHYSICS.TRAIL_FADE_SPEED) }));

        return {
          ...obj,
          position,
          velocity: isFinished ? 0 : newVelocity,
          acceleration: isFinished ? 0 : acceleration,
          trail: newTrail.filter(t => t.opacity > 0),
          isFinished,
        };
      });

      if (newObjects.every(obj => obj.isFinished)) {
        setStatus(SimulationStatus.FINISHED);
      }

      return newObjects;
    });

    requestRef.current = requestAnimationFrame(updatePhysics);
  }, [status, globalVars]);

  useEffect(() => {
    if (status === SimulationStatus.RUNNING) {
      requestRef.current = requestAnimationFrame(updatePhysics);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      lastTimestampRef.current = null;
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [status, updatePhysics]);

  const toggleSimulation = () => {
    if (status === SimulationStatus.IDLE || status === SimulationStatus.PAUSED) {
      setStatus(SimulationStatus.RUNNING);
    } else if (status === SimulationStatus.RUNNING) {
      setStatus(SimulationStatus.PAUSED);
    } else if (status === SimulationStatus.FINISHED) {
      resetSimulation();
      setStatus(SimulationStatus.RUNNING);
    }
  };

  useEffect(() => {
    if (status === SimulationStatus.IDLE) {
      setObjects(prev => prev.map(obj => ({
        ...obj,
        velocity: objectVars[obj.id].velocity,
        variables: { 
          ...objectVars[obj.id], 
          maxDistance: globalVars.maxDistance, 
        }
      })));
    }
  }, [objectVars, status, globalVars]);

  const handleGlobalChange = (key: string, value: any) => {
    setGlobalVars(prev => ({ ...prev, [key]: value }));
  };

  const handleIndividualChange = (objId: string, key: string, value: number) => {
    if (status !== SimulationStatus.IDLE) return;
    setObjectVars(prev => ({
      ...prev,
      [objId]: { ...prev[objId], [key]: value }
    }));
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 font-sans select-none overflow-hidden touch-none safe-p">
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />

    {/* Fixed mobile timer (top center) for phones & tablets */}
    <div className="lg:hidden mobile-timer-fixed">
      <div className="mobile-timer flex flex-col items-center">
        <div className="timer-card bg-gradient-to-r from-emerald-700/80 to-emerald-500/70 text-white px-4 py-2 rounded-2xl border border-emerald-300/10 shadow-2xl flex flex-col items-center">
          <span className="timer-title text-[9px] font-black uppercase tracking-[0.18em] mb-0.5 opacity-90">Physical Time</span>
          <span className="timer-value text-xl sm:text-2xl font-mono font-black tracking-tight">{simTime.toFixed(2)}<span className="text-xs ml-1 opacity-80">s</span></span>
        </div>
      </div>
    </div>

      <main className="flex flex-1 overflow-hidden relative lab-grid">
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[45] lg:hidden animate-in fade-in duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className={`
          fixed inset-y-0 left-0 z-50 transform lg:relative lg:translate-x-0 transition-transform duration-500 ease-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <Sidebar 
            objectVars={objectVars} 
            onIndividualChange={handleIndividualChange}
            globalVars={globalVars}
            onGlobalChange={handleGlobalChange}
            onResetDefaults={resetToDefaultSettings}
            simulationActive={status !== SimulationStatus.IDLE}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>

        <div className="flex-1 flex flex-col relative">
          <div className="flex-1 min-h-0 relative p-2 sm:p-4">
            <div className="sim-canvas-container w-full h-[60vh] sm:h-[65vh] md:h-[72vh] lg:h-[78vh] rounded-xl overflow-hidden relative">
              <SimulationCanvas 
                objects={objects} 
                maxDistance={globalVars.maxDistance}
                globalFriction={0} 
                globalDrag={0}
                onTap={toggleSimulation}
              />
            </div>

            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-fit px-4 hidden lg:flex">
              <div className="flex items-center gap-6">
                 <ControlBar 
                  status={status}
                  onToggle={toggleSimulation}
                  onReset={resetSimulation}
                />
                <div className="bg-slate-950/80 backdrop-blur px-6 py-2 rounded-2xl border border-slate-700/50 shadow-2xl min-w-[140px] flex flex-col items-center">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">Physical Time</span>
                  <span className="text-2xl font-mono text-emerald-400 font-black tracking-tight">{simTime.toFixed(2)}<span className="text-xs ml-1 opacity-50">s</span></span>
                </div>
              </div>
            </div>

            {/* mobile timer moved to fixed top-level element to ensure visibility on small devices */}

            <div className="absolute bottom-6 right-6 hidden md:block">
              <div className="bg-slate-900/50 backdrop-blur text-[9px] font-black text-slate-500 uppercase tracking-widest px-3 py-1.5 rounded-full border border-slate-800">
                <i className="fas fa-microscope mr-2"></i> Lab ready: 1m = 10px
              </div>
            </div>

            {/* Mobile fixed control bar */}
            <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-3 mobile-controls">
              <ControlBar status={status} onToggle={toggleSimulation} onReset={resetSimulation} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;