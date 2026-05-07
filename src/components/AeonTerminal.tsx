import React, {useState, useRef} from 'react';
import {motion, AnimatePresence} from 'motion/react';
import {
  Upload,
  Zap,
  Globe,
  Clock,
  ChevronRight,
  ShieldAlert,
  Loader2,
  Trash2,
  FileText,
  Activity,
  History,
  Target
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {runSimulation} from '../services/aeonService';
import {TimelineReport} from '../types';

export default function AeonTerminal() {
  const [city, setCity] = useState('');
  const [context, setContext] = useState('');
  const [files, setFiles] = useState<{data: string; name: string; mimeType: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<TimelineReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;

    Array.from(uploadedFiles).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFiles(prev => [...prev, {
          data: event.target?.result as string,
          name: file.name,
          mimeType: file.type
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startSimulation = async () => {
    if (!city.trim()) {
      setError('Aeon requires a target location coordinate.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await runSimulation(city, context, files);
      setReport(result);
    } catch (err) {
      setError('Temporal instability detected. Failed to retrieve timeline data.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetNexus = () => {
    setReport(null);
    setCity('');
    setContext('');
    setFiles([]);
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-brand-bg text-slate-100 font-sans">
      <div className="scanline" />
      
      {/* Header: Temporal Status Bar */}
      <header className="h-16 px-8 flex items-center justify-between border-b border-brand-cyan/20 bg-slate-900/40 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-cyan rounded-sm flex items-center justify-center rotate-45 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <Clock className="w-4 h-4 text-slate-900 -rotate-45" />
          </div>
          <h1 className="text-xl font-bold tracking-widest text-brand-cyan">
            AEON // <span className="font-light opacity-70">URBAN TIME-STREAMER</span>
          </h1>
        </div>
        
        <div className="hidden md:flex gap-8 text-[10px] font-mono tracking-tighter uppercase whitespace-nowrap">
          <div className="flex flex-col">
            <span className="text-brand-cyan/60">Current Epoch</span>
            <span className="text-lg leading-tight">2024.Q4.A</span>
          </div>
          <div className="flex flex-col">
            <span className="text-brand-purple">Target Sync</span>
            <span className="text-lg leading-tight uppercase">{report ? '2075.08.12' : '-- -- --'}</span>
          </div>
          <div className="flex flex-col border-l border-white/10 pl-8">
            <span className="text-slate-500">Temporal Anchor</span>
            <span className="text-lg leading-tight uppercase">{city || 'STANDBY'}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar: Simulation Parameters */}
        <aside className="w-80 border-r border-white/5 bg-slate-900/40 p-6 flex flex-col gap-6 overflow-y-auto">
          <div>
            <h2 className="text-[11px] uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-3 bg-brand-cyan"></span> Parameters & Inputs
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-brand-cyan/70">Target City Name</label>
                <input 
                  type="text"
                  placeholder="E.g. Amsterdam, Mumbai, Cairo..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-800/40 border border-white/10 rounded px-3 py-2 text-sm outline-none focus:border-brand-cyan/50 transition-colors"
                />
                <p className="text-[9px] font-mono text-slate-500 uppercase">Temporal sensors will resolve GPS coordinates.</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-brand-cyan/70">Context / Policy Directives</label>
                <textarea 
                  rows={4}
                  placeholder="Describe specific challenges or desired outcomes..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="w-full bg-slate-800/40 border border-white/10 rounded px-3 py-2 text-xs outline-none focus:border-brand-cyan/50 transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-[11px] uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-3 bg-brand-purple"></span> City Master Plan & Data
            </h2>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-white/10 rounded-lg h-32 flex flex-col items-center justify-center text-[10px] text-slate-500 gap-2 hover:bg-white/5 cursor-pointer transition-colors px-4 text-center"
            >
              <Upload className="w-5 h-5 opacity-40" />
              <span>Drop Master Plan (PDF), Satellite Maps, or Infrastructure Photos</span>
              <input 
                 ref={fileInputRef}
                 type="file" 
                 multiple 
                 className="hidden" 
                 accept="image/*,application/pdf"
                 onChange={handleFileUpload} 
              />
            </div>

            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white/5 p-2 rounded text-[10px] border border-white/5">
                    <div className="flex items-center gap-2 truncate">
                      {file.mimeType.includes('pdf') ? <FileText className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                      <span className="truncate">{file.name}</span>
                    </div>
                    <button onClick={() => removeFile(idx)} className="text-slate-500 hover:text-red-400">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-auto pt-6 border-t border-white/5">
            <button
              onClick={startSimulation}
              disabled={isLoading}
              className="w-full py-4 bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan font-bold text-xs uppercase tracking-widest rounded hover:bg-brand-cyan hover:text-brand-bg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Activity className="w-4 h-4" />
              )}
              {isLoading ? 'SIM_RUNNING...' : 'Execute Rewrite'}
            </button>
            {error && <p className="text-[10px] text-red-400 mt-2 font-mono uppercase italic">{error}</p>}
          </div>

          {!report && !isLoading && (
            <div className="p-4 bg-brand-cyan/5 border border-brand-cyan/10 rounded-lg">
              <p className="text-[10px] leading-relaxed italic text-brand-cyan/70 font-mono">
                "I am scanning the timeline. Provide a city and its current trajectory so we may begin the simulation."
              </p>
            </div>
          )}
        </aside>

        {/* Content: Simulation Branches */}
        <section className="flex-1 p-8 overflow-y-auto bg-[radial-gradient(circle_at_50%_50%,_#1e293b_0%,_#020617_100%)]">
          <AnimatePresence mode="wait">
            {!report ? (
              <motion.div 
                key="empty"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                className="h-full flex flex-col items-center justify-center text-center opacity-40 gap-4"
              >
                <div className="w-24 h-24 border border-brand-cyan/20 rounded-full flex items-center justify-center animate-pulse">
                  <Target className="w-12 h-12 text-brand-cyan" />
                </div>
                <div>
                  <h3 className="font-mono text-sm tracking-[0.3em] uppercase">Awaiting Temporal Coordinates</h3>
                  <p className="text-xs uppercase mt-2">Initialize simulation to view branch alternates</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="report"
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                className="h-full grid grid-cols-1 xl:grid-cols-2 gap-8"
              >
                {/* Branch A: Business As Usual */}
                <div className="group relative h-fit xl:h-full">
                  <div className="absolute -inset-0.5 bg-gradient-to-b from-brand-amber/20 to-transparent blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative h-full bg-slate-900/60 border border-brand-amber/30 rounded-xl p-6 flex flex-col shadow-2xl">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className="text-[10px] font-mono text-brand-amber uppercase tracking-tighter">Branch Alpha-9</span>
                        <h3 className="text-2xl font-bold text-brand-amber/90 tracking-tight">BUSINESS AS USUAL</h3>
                      </div>
                      <span className="text-4xl opacity-10 font-black">2075</span>
                    </div>
                    
                    <div className="flex-1 space-y-6">
                      <div className="w-full h-48 bg-slate-800 rounded border border-white/5 overflow-hidden relative">
                         {report.businessImageB64 ? (
                           <img 
                             src={report.businessImageB64} 
                             alt="Business As Usual Scenario" 
                             className="w-full h-full object-cover"
                             referrerPolicy="no-referrer"
                           />
                         ) : (
                           <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,#000,#000_10px,#111_10px,#111_20px)] opacity-30"></div>
                         )}
                         <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                         <div className="absolute bottom-4 left-4 font-mono text-[10px] text-brand-amber/60 flex items-center gap-2">
                           <History className="w-3 h-3" /> TRAJECTORY_STABLE
                         </div>
                      </div>
                      
                      <div className="prose prose-invert prose-sm prose-amber max-w-none">
                        <h4 className="text-xs uppercase text-brand-amber/70 mb-2 font-bold tracking-widest underline decoration-brand-amber/30 underline-offset-4">Trajectery Analysis</h4>
                        <div className="leading-relaxed opacity-90">
                          <ReactMarkdown>{report.businessAsUsual2075}</ReactMarkdown>
                        </div>
                      </div>

                      <div className="bg-brand-amber/5 border border-brand-amber/20 rounded p-4">
                        <h4 className="text-[10px] uppercase text-brand-amber font-bold mb-2">Current Vibe Summary</h4>
                        <p className="text-xs leading-relaxed text-slate-300">{report.currentVibe}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Branch B: SDG Hero */}
                <div className="group relative h-fit xl:h-full">
                  <div className="absolute -inset-0.5 bg-gradient-to-b from-brand-cyan/20 to-transparent blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative h-full bg-slate-900/60 border border-brand-cyan/30 rounded-xl p-6 flex flex-col shadow-2xl">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className="text-[10px] font-mono text-brand-cyan uppercase tracking-tighter">Branch Omega-1</span>
                        <h3 className="text-2xl font-bold text-brand-cyan/90 tracking-tight">SDG HERO BRANCH</h3>
                      </div>
                      <span className="text-4xl opacity-10 font-black text-brand-cyan">2075</span>
                    </div>

                    <div className="flex-1 space-y-6">
                      <div className="w-full h-48 bg-slate-800 rounded border border-white/5 overflow-hidden relative">
                         {report.heroImageB64 ? (
                           <img 
                             src={report.heroImageB64} 
                             alt="SDG Hero Scenario" 
                             className="w-full h-full object-cover"
                             referrerPolicy="no-referrer"
                           />
                         ) : (
                           <>
                             <div className="absolute inset-0 bg-brand-cyan/10"></div>
                             <div className="absolute bottom-0 w-full h-1/2 bg-brand-cyan/5 blur-3xl"></div>
                           </>
                         )}
                         <div className="absolute bottom-4 left-4 font-mono text-[10px] text-brand-cyan flex items-center gap-2">
                           <Globe className="w-3 h-3" /> OPTIMAL_PATH_DETECTED
                         </div>
                      </div>

                      <div className="prose prose-invert prose-sm prose-cyan max-w-none">
                        <h4 className="text-xs uppercase text-brand-cyan/70 mb-2 font-bold tracking-widest underline decoration-brand-cyan/30 underline-offset-4">Resilience Protocol</h4>
                        <div className="leading-relaxed opacity-90">
                          <ReactMarkdown>{report.sdgHero2075}</ReactMarkdown>
                        </div>
                      </div>

                      <button 
                         onClick={resetNexus}
                         className="flex items-center gap-2 text-[10px] uppercase font-mono text-brand-cyan/40 hover:text-brand-cyan transition-colors"
                      >
                        Reset Temporal Nexus
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Footer: Time-Traveler's Advice */}
      <footer className="h-28 px-8 py-4 bg-slate-900 border-t border-white/10 flex gap-6 items-center z-20">
        <div className="w-12 h-12 rounded-full border border-brand-cyan/50 flex items-center justify-center shrink-0">
          <div className={`w-8 h-8 rounded-full bg-brand-cyan ${isLoading ? 'animate-ping' : 'animate-pulse'}`}></div>
        </div>
        
        <div className="flex-1 grid grid-cols-3 gap-4 h-full">
          {report ? (
            report.advice.map((item, idx) => (
              <div key={idx} className="bg-white/5 rounded px-4 py-2 border-l-2 border-brand-cyan flex flex-col justify-center">
                <span className="text-[9px] uppercase font-bold text-brand-cyan block mb-1">Action 0{idx + 1}</span>
                <p className="text-[11px] leading-tight text-slate-300 line-clamp-2">{item}</p>
              </div>
            ))
          ) : (
            <>
              <div className="bg-white/5 rounded px-4 py-2 border-l-2 border-slate-700 opacity-20 h-full"></div>
              <div className="bg-white/5 rounded px-4 py-2 border-l-2 border-slate-700 opacity-20 h-full"></div>
              <div className="bg-white/5 rounded px-4 py-2 border-l-2 border-slate-700 opacity-20 h-full"></div>
            </>
          )}
        </div>
        
        <div className="hidden lg:flex flex-col items-end gap-1 text-right">
           <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Protocol Signal</span>
           <div className="flex gap-1">
             {[1,2,3,4,5].map(i => (
               <div key={i} className={`h-1 w-4 rounded-full ${report ? 'bg-brand-cyan' : 'bg-slate-800'}`} />
             ))}
           </div>
        </div>
      </footer>
    </div>
  );
}
