import React, { useEffect, useState } from 'react';
import { Brain, Search, ShieldCheck, FileText, Sparkles, Clock, Radio, Activity } from 'lucide-react';
import { AnalysisMode, SummaryLength } from '../types';

interface LoadingStateProps {
  targetLength: SummaryLength;
  mode: AnalysisMode;
}

const loadingSteps = [
  { 
    icon: Search, 
    text: "Scanning Target Source", 
    subtext: "Extracting metadata & removing noise",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30"
  },
  { 
    icon: Brain, 
    text: "Synthesizing Intelligence", 
    subtext: "Identifying key actors & events",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/30"
  },
  { 
    icon: ShieldCheck, 
    text: "Strategic Assessment", 
    subtext: "Analyzing risks & implications",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30"
  },
  { 
    icon: Sparkles, 
    text: "Finalizing Brief", 
    subtext: "Formatting for rapid consumption",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30"
  }
];

export const LoadingState: React.FC<LoadingStateProps> = ({ targetLength, mode }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Total duration approx 6s
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const step = loadingSteps[currentStep];
  const Icon = step.icon;

  const isMilitary = mode === AnalysisMode.MILITARY;

  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in px-4 w-full">
      
      {/* HUD Container */}
      <div className="relative w-full max-w-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl overflow-hidden">
        
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
             style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
        </div>

        {/* Central Scanner */}
        <div className="relative flex flex-col items-center mb-10">
          <div className="relative w-32 h-32 flex items-center justify-center">
             {/* Rotating Rings */}
             <div className="absolute inset-0 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-full animate-[spin_8s_linear_infinite]"></div>
             <div className="absolute inset-2 border border-slate-200 dark:border-slate-800 rounded-full animate-[spin_4s_linear_infinite_reverse]"></div>
             
             {/* Pulse Effect */}
             <div className={`absolute inset-0 rounded-full ${step.bg} animate-ping opacity-20`}></div>
             
             {/* Center Icon */}
             <div className={`relative z-10 w-16 h-16 rounded-full ${step.bg} ${step.border} border backdrop-blur-md flex items-center justify-center shadow-lg transition-all duration-500`}>
                <Icon className={`w-8 h-8 ${step.color} transition-all duration-500`} />
             </div>
          </div>
          
          {/* Status Text */}
          <div className="mt-6 text-center space-y-1 relative z-10">
             <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight animate-fade-in key={currentStep}">
               {step.text}
             </h3>
             <p className="text-sm font-mono text-slate-500 dark:text-slate-400">
               {step.subtext}
             </p>
          </div>
        </div>

        {/* Mission Parameters Dashboard */}
        <div className="grid grid-cols-2 gap-3 mb-6">
           {/* Target Length Card */}
           <div className="bg-slate-50 dark:bg-slate-800/80 rounded-lg p-3 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-1 opacity-20 group-hover:opacity-40 transition-opacity">
                 <Clock size={40} />
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest mb-1">Target Time</span>
              <div className="flex items-baseline gap-1">
                 <span className="text-2xl font-mono font-bold text-indigo-600 dark:text-indigo-400 animate-pulse">{targetLength}</span>
                 <span className="text-xs font-bold text-slate-500">SEC</span>
              </div>
           </div>

           {/* Mode Card */}
           <div className={`bg-slate-50 dark:bg-slate-800/80 rounded-lg p-3 border flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-500 ${isMilitary ? 'border-amber-500/30 dark:border-amber-900/50' : 'border-slate-200 dark:border-slate-700'}`}>
              <div className={`absolute top-0 right-0 p-1 opacity-20 transition-opacity ${isMilitary ? 'text-amber-500' : 'text-slate-400'}`}>
                 {isMilitary ? <ShieldCheck size={40} /> : <Activity size={40} />}
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest mb-1">Analysis Mode</span>
              <div className={`text-sm font-bold uppercase tracking-wider ${isMilitary ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                 {mode}
              </div>
           </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden w-full">
           <div 
             className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700 ease-out"
             style={{ width: `${((currentStep + 1) / loadingSteps.length) * 100}%` }}
           ></div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex justify-between items-center text-[10px] font-mono uppercase text-slate-400 dark:text-slate-600">
           <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Gemini 2.5 Active
           </span>
           <span>ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
        </div>

      </div>
    </div>
  );
};