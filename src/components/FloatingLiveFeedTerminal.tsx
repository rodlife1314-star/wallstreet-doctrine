import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Terminal, 
  Pin, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  WifiOff, 
  RefreshCw, 
  Database,
  Activity,
  Maximize2,
  Minimize2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FeedEvent {
  id: string;
  timestamp: string;
  lane: "OBSERVATION" | "DINAPOLI" | "FIBONACCI" | "X-BREAK" | "COPILOT" | "RED TEAM" | "AMBIGUITY" | "ARCHIVE";
  message: string;
  severity: "info" | "success" | "warning" | "error" | "doctrine";
}

const INITIAL_EVENTS: FeedEvent[] = [
  {
    id: "evt-01",
    timestamp: "22:08:14",
    lane: "OBSERVATION",
    message: "Cold bench active. Awaiting live market authority feed.",
    severity: "warning"
  },
  {
    id: "evt-02",
    timestamp: "22:08:15",
    lane: "DINAPOLI",
    message: "Doctrine lane staged. COP / OP / XOP validation pending packet.",
    severity: "doctrine"
  },
  {
    id: "evt-03",
    timestamp: "22:08:16",
    lane: "FIBONACCI",
    message: "Doctrine lane staged. 382 / 618 / 786 validation pending packet.",
    severity: "doctrine"
  },
  {
    id: "evt-04",
    timestamp: "22:08:17",
    lane: "X-BREAK",
    message: "Doctrine lane staged. Liquidity sweep / X-level status pending packet.",
    severity: "doctrine"
  },
  {
    id: "evt-05",
    timestamp: "22:08:18",
    lane: "COPILOT",
    message: "Synthesis lane staged. Awaiting agent validation contracts.",
    severity: "info"
  },
  {
    id: "evt-06",
    timestamp: "22:08:19",
    lane: "RED TEAM",
    message: "Audit lane staged. No active challenge running.",
    severity: "info"
  },
  {
    id: "evt-07",
    timestamp: "22:08:20",
    lane: "AMBIGUITY",
    message: "Gateway staged. Lock inactive until live packet submitted.",
    severity: "error"
  },
  {
    id: "evt-08",
    timestamp: "22:08:21",
    lane: "ARCHIVE",
    message: "Chain-of-custody output lane staged.",
    severity: "success"
  }
];

const MOCK_HISTORICAL_LIBRARY = [
  { lane: "OBSERVATION", message: "Listening socket bound to external market ticker telemetry channels.", severity: "info" },
  { lane: "DINAPOLI", message: "Fibonacci expansion vectors compiled. Objective logic maps verified.", severity: "doctrine" },
  { lane: "FIBONACCI", message: "Golden Ratio node (1.618 / 0.618) designated as sovereign zone boundaries.", severity: "doctrine" },
  { lane: "X-BREAK", message: "Redistribution levels scanned. No supply-side exhaustion recognized in current bracket.", severity: "info" },
  { lane: "COPILOT", message: "Reality check complete: FRED macro indicators loaded in sandbox partition.", severity: "success" },
  { lane: "RED TEAM", message: "Simulating liquidity vacuum scenarios below critical invalidation floor.", severity: "warning" },
  { lane: "AMBIGUITY", message: "Tolerance parameters normalized. Gateway trigger lock set at 85% confidence floor.", severity: "info" },
  { lane: "ARCHIVE", message: "State packet seal ready. Pushing state metadata to immutable memory mockup.", severity: "success" }
] as const;

export default function FloatingLiveFeedTerminal() {
  const [events, setEvents] = useState<FeedEvent[]>(INITIAL_EVENTS);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [selectedLane, setSelectedLane] = useState<string>("ALL");
  const [activeStateLabel, setActiveStateLabel] = useState<"COLD BENCH" | "STAGED" | "NOT LIVE" | "AWAITING PACKET">("COLD BENCH");
  const [isSimulating, setIsSimulating] = useState(false);
  
  const endRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (!isCollapsed && endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [events, isCollapsed]);

  // Periodic label transition to represent passive, offline telemetry sandbox
  useEffect(() => {
    const labels: Array<"COLD BENCH" | "STAGED" | "NOT LIVE" | "AWAITING PACKET"> = [
      "COLD BENCH", "STAGED", "NOT LIVE", "AWAITING PACKET"
    ];
    const interval = setInterval(() => {
      setActiveStateLabel(current => {
        const idx = labels.indexOf(current);
        return labels[(idx + 1) % labels.length];
      });
    }, 15000); // changes every 15s to keep UI interesting but low resource
    return () => clearInterval(interval);
  }, []);

  // Periodic simulated packet event injection
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * MOCK_HISTORICAL_LIBRARY.length);
      const template = MOCK_HISTORICAL_LIBRARY[idx];
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];

      const newEvt: FeedEvent = {
        id: `sim-${Date.now()}-${idx}`,
        timestamp: timeStr,
        lane: template.lane,
        message: template.message,
        severity: template.severity
      };

      setEvents(prev => [...prev, newEvt].slice(-50)); // cap at 50 events
    }, 4500);

    return () => clearInterval(interval);
  }, [isSimulating]);

  const filteredEvents = useMemo(() => {
    if (selectedLane === "ALL") return events;
    return events.filter(e => e.lane === selectedLane);
  }, [events, selectedLane]);

  const clearFeed = () => {
    setEvents([]);
  };

  const resetFeed = () => {
    setEvents(INITIAL_EVENTS);
  };

  const injectSingleEvent = () => {
    const idx = Math.floor(Math.random() * MOCK_HISTORICAL_LIBRARY.length);
    const template = MOCK_HISTORICAL_LIBRARY[idx];
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];

    const newEvt: FeedEvent = {
      id: `manual-${Date.now()}-${idx}`,
      timestamp: timeStr,
      lane: template.lane,
      message: `${template.message} (Cascade Simulation)`,
      severity: template.severity
    };

    setEvents(prev => [...prev, newEvt].slice(-50));
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "error":
        return "text-[#f43f5e] border-[#f43f5e]/20 bg-[#f43f5e]/5";
      case "warning":
        return "text-[#f59e0b] border-[#f59e0b]/20 bg-[#f59e0b]/5";
      case "success":
        return "text-[#10b981] border-[#10b981]/20 bg-[#10b981]/5";
      case "doctrine":
        return "text-[#06b6d4] border-[#06b6d4]/20 bg-[#06b6d4]/5";
      case "info":
      default:
        return "text-[#94a3b8] border-slate-800 bg-slate-900/40";
    }
  };

  const lanes = ["ALL", "OBSERVATION", "DINAPOLI", "FIBONACCI", "X-BREAK", "COPILOT", "RED TEAM", "AMBIGUITY", "ARCHIVE"] as const;

  return (
    <div 
      className={`
        ${isPinned ? "relative w-full mt-6" : "fixed bottom-4 right-4 z-40 max-w-sm sm:max-w-md w-[calc(100vw-2rem)]"}
        transition-all duration-300 font-mono text-xs
      `}
      id="floating-live-feed-terminal-root"
    >
      <div className="bg-[#05070a]/95 backdrop-blur border border-cyan-950/70 rounded-xl overflow-hidden shadow-[0_12px_40px_-5px_rgba(0,0,0,0.85)] flex flex-col">
        
        {/* Terminal Header */}
        <div className="bg-[#0a0f18] px-4 py-3 border-b border-cyan-950/60 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isSimulating ? 'bg-cyan-400' : 'bg-emerald-400/40'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isSimulating ? 'bg-cyan-400' : 'bg-emerald-500/60'}`}></span>
            </span>
            <div className="flex items-center gap-1.5">
              <Terminal className="h-4 w-4 text-cyan-400" />
              <span className="font-extrabold tracking-wider text-slate-205 text-[11px] uppercase">
                WallStreet Terminal
              </span>
            </div>
            {/* Soft telemetry offline chip */}
            <span className="text-[8px] px-1.5 py-0.5 rounded font-black border border-cyan-500/20 text-cyan-400 bg-cyan-950/30">
              {activeStateLabel}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setIsPinned(!isPinned)}
              title={isPinned ? "Unpin from page grid and float" : "Pin layout to bottom page section"}
              className={`p-1.5 rounded transition-all cursor-pointer ${isPinned ? "bg-cyan-950/60 text-cyan-400" : "text-slate-500 hover:text-slate-350"}`}
            >
              <Pin className="h-3.5 w-3.5" />
            </button>
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 text-slate-500 hover:text-slate-350 rounded transition-all cursor-pointer"
            >
              {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Expandable Body */}
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-[320px]"
            >
              {/* Cold Bench Notice Banner */}
              <div className="bg-[#0e1625] px-4 py-2 border-b border-cyan-950/30 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-1.5 text-cyan-500 text-[10px]">
                  <WifiOff className="h-3.5 w-3.5 shrink-0" />
                  <span className="tracking-wide">
                    STATION SCAFFOLD ONLY — NO ACTIVE DEPLOYMENT PORT BINDING
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={injectSingleEvent}
                    className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 px-1.5 py-0.5 rounded"
                    title="Manual Telemetry Event Feed Trigger"
                  >
                    + STAGE
                  </button>
                  <label className="flex items-center gap-1 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={isSimulating}
                      onChange={(e) => setIsSimulating(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 focus:ring-offset-0 h-3 w-3 cursor-pointer"
                    />
                    <span className="text-[9px] text-slate-500">SIMULATE</span>
                  </label>
                </div>
              </div>

              {/* Filtering Controls */}
              <div className="p-2 bg-[#06090e] border-b border-cyan-950/30 flex items-center gap-2 overflow-x-auto shrink-0 select-none scrollbar-none">
                <Filter className="h-3.5 w-3.5 text-slate-500 shrink-0 ml-1" />
                <div className="flex items-center gap-1">
                  {lanes.map((lane) => (
                    <button
                      key={lane}
                      onClick={() => setSelectedLane(lane)}
                      className={`
                        px-2 py-0.5 text-[9px] rounded-full font-black border transition-all cursor-pointer whitespace-nowrap
                        ${selectedLane === lane 
                          ? "bg-cyan-950/80 text-cyan-300 border-cyan-500/50" 
                          : "bg-[#0b0f19] text-slate-550 border-slate-805/70 hover:text-slate-350 hover:bg-[#111726]"
                        }
                      `}
                    >
                      {lane}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Scrolled Output terminal screen */}
              <div className="flex-1 bg-[#020406] overflow-y-auto p-3.5 space-y-2 text-[10.5px]">
                {filteredEvents.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-655 text-center p-4">
                    <p className="font-semibold italic">Console buffer flushed.</p>
                    <p className="text-[9px] mt-1 text-slate-500">Enable Simulating or inject test packages to verify telemetry cascade.</p>
                  </div>
                ) : (
                  filteredEvents.map((evt) => (
                    <div 
                      key={evt.id} 
                      className="group flex items-start gap-2 leading-relaxed selection:bg-cyan-500/20"
                    >
                      <span className="text-slate-600 font-mono tracking-tighter self-start select-none">
                        [{evt.timestamp}]
                      </span>
                      <div className="flex-1">
                        <span className={`
                          px-1 rounded mr-1.5 border text-[9px] font-black tracking-wider select-none
                          ${getSeverityStyle(evt.severity)}
                        `}>
                          {evt.lane}
                        </span>
                        <span className="text-slate-300 select-all font-mono">
                          {evt.message}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={endRef} />
              </div>

              {/* Terminal Footer Navigation Controls */}
              <div className="bg-[#080d16] border-t border-cyan-950/40 p-2 flex items-center justify-between shrink-0 select-none">
                <span className="text-[8.5px] text-slate-600 font-mono uppercase">
                  Telemetry Scaffold v0.1 Build Active
                </span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={resetFeed}
                    title="Reset default cold-bench sequence"
                    className="p-1 hover:bg-[#141b2a] text-slate-500 hover:text-slate-300 rounded transition-all cursor-pointer flex items-center gap-1 text-[9.5px]"
                  >
                    <RefreshCw className="h-3 w-3" /> RESET
                  </button>
                  <span className="text-slate-800">|</span>
                  <button 
                    onClick={clearFeed}
                    title="Flush temporary sandbox memory logs"
                    className="p-1 hover:bg-[#141b2a] text-slate-500 hover:text-rose-400 rounded transition-all cursor-pointer flex items-center gap-1 text-[9.5px]"
                  >
                    <Trash2 className="h-3 w-3" /> FLUSH BUFFER
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compact Bar state when collapsed */}
        {isCollapsed && (
          <div 
            onClick={() => setIsCollapsed(false)}
            className="bg-[#05070b]/90 border-t border-cyan-950/20 p-2 text-center text-[9px] text-slate-500 hover:text-slate-300 font-mono cursor-pointer select-none"
          >
            Terminal collapsed. Click to monitor doctrine pipeline output stream.
          </div>
        )}
      </div>
    </div>
  );
}
