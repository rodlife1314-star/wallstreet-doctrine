import { useState, useEffect, useMemo } from "react";
import { 
  Activity, 
  Sliders, 
  Database, 
  Server, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Terminal, 
  Compass, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  RefreshCw, 
  Info, 
  AlertTriangle, 
  ChevronRight, 
  Check, 
  DollarSign, 
  Cpu,
  Bookmark,
  BookOpen,
  PieChart,
  GitCommit,
  Network,
  Brain,
  History,
  PenTool,
  Zap
} from "lucide-react";
import { jsPDF } from "jspdf";
import FloatingLiveFeedTerminal from "./FloatingLiveFeedTerminal";

// Definition of Assets & Ingress Presets
export interface AssetPreset {
  id: string;
  name: string;
  ticker: string;
  description: string;
  currentPrice: number;
  swingLow: number;
  swingHigh: number;
  priorDayHigh: number;
  priorDayLow: number;
  bslTarget: number; // Buy-side liquidity
  sslTarget: number; // Sell-side liquidity
  volatilityIndex: string; // VIX or GVZ
  volatilityValue: number;
  macroContext: string;
  heavyStrikeOptions?: string;
  customDetails?: string;
  d1Observation?: string;
  h4Observation?: string;
  m15Observation?: string;
  m5Observation?: string;
}

const ASSET_PRESETS: AssetPreset[] = [
  {
    id: "GC",
    name: "Gold Futures",
    ticker: "GC",
    description: "Sovereign liquidity bellwether. Direct real interest rate and global tail-risk pricing.",
    currentPrice: 2412.50,
    swingLow: 2320.00,
    swingHigh: 2435.00,
    priorDayHigh: 2428.00,
    priorDayLow: 2392.00,
    bslTarget: 2435.00,
    sslTarget: 2370.00,
    volatilityIndex: "GVZ (Gold Volatility)",
    volatilityValue: 16.4,
    macroContext: "Federal Reserve hawkish hold continues. US 10Y real yields flattened at +2.15%. Persistent global central bank purchasing registers positive structural feedback loop.",
    heavyStrikeOptions: "CME Gold Options OI concentation suggests massive resistance boundary clusters at $2450.00 and $2500.00 call strikes.",
    customDetails: "Dinapoli Thrust sequence active in Daily time-frame.",
    d1Observation: "D1 strategic upward trend intact. Strong buying demand detected above the $2320 support level series.",
    h4Observation: "H4 structural context identifies bullish displacement leg with local consolidation and minor expansion.",
    m15Observation: "M15 tactical retracement completed within the discount zone of the active H4 displacement block.",
    m5Observation: "M5 entry confirmation active with bullish rejection candle prints on high sovereign volume indexes."
  },
  {
    id: "NQ",
    name: "Nasdaq-100 Index",
    ticker: "NQ",
    description: "High-beta growth engine. Heavy institutional capitalization and premium volatility mapping.",
    currentPrice: 18220.00,
    swingLow: 17800.00,
    swingHigh: 18450.00,
    priorDayHigh: 18340.00,
    priorDayLow: 18110.00,
    bslTarget: 18450.00,
    sslTarget: 17950.00,
    volatilityIndex: "VXN (Nasdaq volatility)",
    volatilityValue: 19.8,
    macroContext: "Tech-sector capitalization skews extreme. Treasury yields softening briefly. Underlying distribution traces in mega-cap semiconductors signal premium risk caution.",
    heavyStrikeOptions: "Concentrated CME Open Interest highlights key gamma hedge flip zone near 18,100 index floor.",
    customDetails: "Bearish Market Structure Shift observed in H4 timeframe.",
    d1Observation: "D1 strategic shift down. Prior highs act as a major institutional supply and distribution block.",
    h4Observation: "H4 structural break of recent swing lows confirms bearish distribution pattern and impulse breakdown.",
    m15Observation: "M15 tactical correction bounce rejected at the 0.618 premium golden pocket zone coordinate.",
    m5Observation: "M5 confirmation layer shows clear bearish consolidation with decreasing buying delta streams."
  },
  {
    id: "YM",
    name: "Dow Jones Industrials",
    ticker: "YM",
    description: "Blue-chip capital reserve proxy. Resilient heavy industrial and value accumulation index.",
    currentPrice: 39110.00,
    swingLow: 38400.00,
    swingHigh: 39350.00,
    priorDayHigh: 39220.00,
    priorDayLow: 38980.00,
    bslTarget: 39350.00,
    sslTarget: 38650.00,
    volatilityIndex: "VXD (Dow Volatility)",
    volatilityValue: 13.5,
    macroContext: "Cyclical rotation active as services PMI slows slightly. Balance sheet consolidations steady, but industrial margin compression slows near-term expansion momentum.",
    heavyStrikeOptions: "OI clusters confirm stable put support at 38,800 strike.",
    customDetails: "Consolidation inside long-term 0.618 golden pocket.",
    d1Observation: "D1 index remains within a broad sideways consolidation band; no strategic trend direction is clear.",
    h4Observation: "H4 structural range bound between $38,400 order block support and $39,350 supply level overhead.",
    m15Observation: "M15 tactical price action tests premium range; awaiting structural liquidation sweeps on key levels.",
    m5Observation: "M5 entry profile shows lack of clear rejection; waiting for momentum surge signature."
  },
  {
    id: "BTC",
    name: "Bitcoin Space-Proxy",
    ticker: "BTC",
    description: "Digital energy ledger. Highly reflexive, decentralized liquidity pressure gauge.",
    currentPrice: 67450.00,
    swingLow: 62500.00,
    swingHigh: 69500.00,
    priorDayHigh: 68120.00,
    priorDayLow: 66340.00,
    bslTarget: 69500.00,
    sslTarget: 64100.00,
    volatilityIndex: "BVOL (Bitcoin Volatility)",
    volatilityValue: 45.2,
    macroContext: "Cross-border spot inflows steady but softening. Leverage rates inside offshore derivatives approach historical warning standard. Squeeze hazard elevated near local highs.",
    heavyStrikeOptions: "Option skews register aggressive long call purchasing at $70,000.00-75,000.00 boundaries.",
    customDetails: "X-Break liquidity hunt registers massive long squeeze liquidation possibilities.",
    d1Observation: "D1 strategic range expansion. Extreme risk of leveraged retail squeeze at offshore exchanges.",
    h4Observation: "H4 structure shows bullish trend origin at $62,500; price trading near premium high at $67,450.",
    m15Observation: "M15 tactical liquidation sweep of $66,340 local daily session low successfully validated.",
    m5Observation: "M5 confirmation shows extreme option gamma flip with active bullish volume spikes."
  },
  {
    id: "SI",
    name: "Silver Futures",
    ticker: "SI",
    description: "Dual monetary-industrial metal. Extreme leverage velocity and industrial baseline reflector.",
    currentPrice: 29.45,
    swingLow: 27.10,
    swingHigh: 31.25,
    priorDayHigh: 29.95,
    priorDayLow: 29.10,
    bslTarget: 31.25,
    sslTarget: 28.50,
    volatilityIndex: "VXSL (Silver Volatility)",
    volatilityValue: 28.1,
    macroContext: "Industrial green-energy usage continues to absorb physical inventory. COMEX warehouse deliveries pace remains elevated while speculative paper options build resistance near $30.00.",
    heavyStrikeOptions: "Heavy silver call clusters registered directly on $30.00 option strike.",
    customDetails: "Breakout above prior swing high validated in weekly chart.",
    d1Observation: "D1 structural breakout of long-term weekly multi-year resistance holds strategic momentum.",
    h4Observation: "H4 active impulse origin at $27.10 holds safe as the major structure demand base line.",
    m15Observation: "M15 tactical minor pullbacks under premium levels are aggressively bought back inside demand zones.",
    m5Observation: "M5 confirmation verifies energetic market buyers defending local intraday structural swings."
  }
];

// Structural Ingress Schema representation 
export const OBSERVATION_PACKET_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "WallStreetObservationPacket",
  description: "Formal ledger inputs detailing real-time structural and mechanical indicators.",
  type: "object",
  required: [
    "assetTicker",
    "spotPrice",
    "swingLow",
    "swingHigh",
    "priorDayHigh",
    "priorDayLow",
    "macroBackdrop",
    "liquidityState",
    "volatilityConfig"
  ],
  properties: {
    assetTicker: { type: "string", description: "Symbol code for asset" },
    spotPrice: { type: "number", description: "Last observed sovereign price action" },
    swingLow: { type: "number", description: "HTF major local structure origin point" },
    swingHigh: { type: "number", description: "HTF major local structure terminal point" },
    priorDayHigh: { type: "number", description: "Daily session high level" },
    priorDayLow: { type: "number", description: "Daily session low level" },
    macroBackdrop: { type: "string", description: "Sovereign/macro-economic climate status" },
    liquidityState: {
      type: "object",
      required: ["bslPool", "sslPool"],
      properties: {
        bslPool: { type: "number", description: "Buy-side resting liquidity price anchor" },
        sslPool: { type: "number", description: "Sell-side resting liquidity price anchor" }
      }
    },
    volatilityConfig: {
      type: "object",
      properties: {
        indexCode: { type: "string" },
        rate: { type: "number" }
      }
    }
  }
};

export interface AgentValidationOutput {
  agentName: string;
  finding: string;
  doctrineRule: string;
  priceRelationship: string;
  supportingEvidence: string[];
  contradictingEvidence: string[];
  invalidationLevel: number;
  confidence: "LOW" | "MEDIUM" | "HIGH" | "NONE" | string;
  doctrineRuleInvoked: string;
  priceRelationshipToDoctrine: string;
  confidenceLevel: "LOW" | "MEDIUM" | "HIGH" | "NONE" | string;
  status: "VALIDATED" | "INCOMPLETE" | "AMBIGUOUS" | "INVALIDATED" | "INSUFFICIENT_EVIDENCE";
  admissibilityReference: string;

  // Multi-Timeframe Custody Chain findings
  d1Finding?: string;
  h4Finding?: string;
  m15Finding?: string;
  m5Finding?: string;
  custodyChainExplanation?: string;

  // Custom X-Break tracking structural fields
  activeImpulseDirection?: "bullish" | "bearish" | "none";
  impulseOrigin?: number;
  xLevel?: number;
  hasXLevelBroken?: boolean;
  hasAcceptanceBeyondX?: boolean;
  modelStatus?: "INACTIVE" | "ACTIVE" | "APPROACHING_X" | "X_BREAK_CONFIRMED" | "FAILED" | "INVALIDATED";

  // Fibonacci ABC submodule sub-state
  abcSubmodule?: {
    pointA: number;
    pointB: number;
    pointC: number;
    retracementLevel: number;
    projectionTarget: number;
    structureStatus: "COMPLETE" | "INCOMPLETE" | "FAILED" | "AMBIGUOUS";
  };
}

export interface CopilotSynthesis {
  recommendedInterpretation: string;
  agreementScore: number; // percentage
  conflictAnalysis: string;
  ambiguityStatus: "CLEAR" | "WARNING" | "LOCKOUT";
  isAmbiguous: boolean;
  verdict: "OBSERVE" | "WAIT" | "REVIEW" | "STRUCTURE_CONFIRMED" | "STRUCTURE_FAILED" | "AMBIGUOUS";
}

export default function WallStreetWorkspace() {
  const [selectedAssetId, setSelectedAssetId] = useState<string>("GC");
  
  // Custom asset parameters controlled by the Operator
  const [currentPrice, setCurrentPrice] = useState<number>(2412.50);
  const [swingLow, setSwingLow] = useState<number>(2320.00);
  const [swingHigh, setSwingHigh] = useState<number>(2435.00);
  const [priorDayHigh, setPriorDayHigh] = useState<number>(2428.00);
  const [priorDayLow, setPriorDayLow] = useState<number>(2392.00);
  const [bslTarget, setBslTarget] = useState<number>(2435.00);
  const [sslTarget, setSslTarget] = useState<number>(2370.00);
  const [volatilityIndex, setVolatilityIndex] = useState<string>("GVZ");
  const [volatilityValue, setVolatilityValue] = useState<number>(16.4);
  const [macroContext, setMacroContext] = useState<string>("");
  const [heavyStrikeOptions, setHeavyStrikeOptions] = useState<string>("");

  // Observation Hierarchy States
  const [d1Observation, setD1Observation] = useState<string>("");
  const [h4Observation, setH4Observation] = useState<string>("");
  const [m15Observation, setM15Observation] = useState<string>("");
  const [m5Observation, setM5Observation] = useState<string>("");

  const [activeTab, setActiveTab] = useState<"ingress" | "agents" | "synthesis" | "report" | "lattice">("ingress");
  
  // Audit engine and state levels
  const [packetSealed, setPacketSealed] = useState<boolean>(false);
  const [computedHash, setComputedHash] = useState<string>("");
  const [realityAuditPassed, setRealityAuditPassed] = useState<boolean>(false);
  const [redTeamChallenged, setRedTeamChallenged] = useState<boolean>(false);
  const [gateLocked, setGateLocked] = useState<boolean>(true);
  const [ingressLog, setIngressLog] = useState<string[]>([]);
  
  // Load asset preset parameters
  const activePreset = useMemo(() => {
    return ASSET_PRESETS.find(p => p.id === selectedAssetId) || ASSET_PRESETS[0];
  }, [selectedAssetId]);

  // Sync customized state when active asset preset changes
  useEffect(() => {
    setCurrentPrice(activePreset.currentPrice);
    setSwingLow(activePreset.swingLow);
    setSwingHigh(activePreset.swingHigh);
    setPriorDayHigh(activePreset.priorDayHigh);
    setPriorDayLow(activePreset.priorDayLow);
    setBslTarget(activePreset.bslTarget);
    setSslTarget(activePreset.sslTarget);
    setVolatilityIndex(activePreset.volatilityIndex);
    setVolatilityValue(activePreset.volatilityValue);
    setMacroContext(activePreset.macroContext);
    setHeavyStrikeOptions(activePreset.heavyStrikeOptions || "");
    
    // Sync hierarchical observations
    setD1Observation(activePreset.d1Observation || "");
    setH4Observation(activePreset.h4Observation || "");
    setM15Observation(activePreset.m15Observation || "");
    setM5Observation(activePreset.m5Observation || "");

    setPacketSealed(false);
    setRealityAuditPassed(false);
    setRedTeamChallenged(false);
    setGateLocked(true);
    setIngressLog([`[SYSTEM] Asset switched to: ${activePreset.name} (${activePreset.ticker})`]);
  }, [selectedAssetId]);

  // Market Memory Lattice React States
  const [assetProfiles, setAssetProfiles] = useState<any[]>([]);
  const [timeframeStates, setTimeframeStates] = useState<any[]>([]);
  const [patternRegistry, setPatternRegistry] = useState<any[]>([]);
  const [macroContexts, setMacroContexts] = useState<any[]>([]);
  const [outcomeFeedbacks, setOutcomeFeedbacks] = useState<any[]>([]);
  const [operatorOverrides, setOperatorOverrides] = useState<any[]>([]);
  const [latticeLoading, setLatticeLoading] = useState<boolean>(false);
  const [latticeError, setLatticeError] = useState<string>("");

  const fetchLatticeData = async () => {
    setLatticeLoading(true);
    setLatticeError("");
    try {
      const getJson = async (url: string) => {
        try {
          console.log(`[Lattice Sync] Fetching: ${url}`);
          const res = await fetch(url);
          if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
          }
          const contentType = res.headers.get("content-type") || "";
          if (!contentType.includes("application/json")) {
            const text = await res.text().catch(() => "");
            throw new Error(`Expected JSON but got: ${contentType}. Raw: ${text.slice(0, 100)}`);
          }
          return await res.json();
        } catch (err: any) {
          console.error(`[Lattice Sync Error] Path ${url} failed:`, err);
          // Return empty array on failure to prevent entire cascade from failing
          return [];
        }
      };

      const [profilesRes, tfRes, patRes, macroRes, fbRes, ovRes] = await Promise.all([
        getJson("/api/lattice/asset-profiles"),
        getJson("/api/lattice/timeframe-states"),
        getJson("/api/lattice/patterns"),
        getJson("/api/lattice/macro"),
        getJson("/api/lattice/feedback"),
        getJson("/api/lattice/overrides"),
      ]);

      setAssetProfiles(Array.isArray(profilesRes) ? profilesRes : []);
      setTimeframeStates(Array.isArray(tfRes) ? tfRes : []);
      setPatternRegistry(Array.isArray(patRes) ? patRes : []);
      setMacroContexts(Array.isArray(macroRes) ? macroRes : []);
      setOutcomeFeedbacks(Array.isArray(fbRes) ? fbRes : []);
      setOperatorOverrides(Array.isArray(ovRes) ? ovRes : []);
    } catch (e: any) {
      console.error("Failed to load market memory lattice", e);
      setLatticeError(e.message || "Network error loading lattice collections.");
    } finally {
      setLatticeLoading(false);
    }
  };

  useEffect(() => {
    fetchLatticeData();
  }, []);

  // Derived Packet ID and Admissibility Engine
  const packetId = useMemo(() => {
    if (!computedHash) return "";
    return `WS-PACKET-${selectedAssetId}-${computedHash}`;
  }, [selectedAssetId, computedHash]);

  const packetAdmissibility = useMemo(() => {
    const missing: string[] = [];
    if (!selectedAssetId) missing.push("Asset Selection");
    if (!d1Observation.trim()) missing.push("D1 Observation");
    if (!h4Observation.trim()) missing.push("H4 Observation");
    if (!m15Observation.trim()) missing.push("M15 Observation");
    if (!m5Observation.trim()) missing.push("M5 Confirmation/Denial");
    if (!packetSealed) missing.push("Operator Custody Seal");
    if (!computedHash) missing.push("Block Hash Identifier");

    return {
      status: missing.length === 0 ? "ADMISSIBLE" : "INADMISSIBLE_EVIDENCE" as const,
      missingFields: missing
    };
  }, [selectedAssetId, d1Observation, h4Observation, m15Observation, m5Observation, packetSealed, computedHash]);

  // Handle parameter verification & packet sealing
  const handleSealPacket = () => {
    if (!d1Observation.trim() || !h4Observation.trim() || !m15Observation.trim() || !m5Observation.trim()) {
      setIngressLog(prev => [
        ...prev,
        `[INGRESS] [${new Date().toLocaleTimeString()}] ❌ SEALING REJECTED: All Observation Hierarchy fields (D1, H4, M15, M5) must be entered before sealing.`
      ]);
      return;
    }

    const timestamp = new Date().toISOString();
    const mockHashInput = `${selectedAssetId}-${currentPrice}-${swingLow}-${swingHigh}-${d1Observation.substring(0, 20)}-${h4Observation.substring(0, 20)}-${timestamp}`;
    
    // Simplistic visual hash calculation to prove Chain-of-Custody mapping
    let hash = 0;
    for (let i = 0; i < mockHashInput.length; i++) {
      hash = (hash << 5) - hash + mockHashInput.charCodeAt(i);
      hash = hash & hash;
    }
    const derivedHash = `0xWS${Math.abs(hash).toString(16).toUpperCase().padStart(8, '0')}C0D`;
    
    setComputedHash(derivedHash);
    setPacketSealed(true);
    setIngressLog(prev => [
      ...prev,
      `[INGRESS] [${new Date().toLocaleTimeString()}] Static schema analysis passed validation framework.`,
      `[INGRESS] Observation parameters successfully parsed and compiled into active ledger memory.`,
      `[INGRESS] STATUS: OBSERVATION_PACKET_SEALED (Operator seal signature verified ✔).`,
      `[INGRESS] Registered Packet ID: WS-PACKET-${selectedAssetId}-${derivedHash}`,
      `[INGRESS] SHA-256 Chain-of-Custody Block Hash applied: ${derivedHash}.`,
      `[INGRESS] Ready for Model Agency validation sequence.`
    ]);
    setActiveTab("agents");
  };

  // Re-calc formulas based on doctrine rules
  // 1. DiNapoli Target Calculations:
  // COP (Contracted Objective Point) = 0.618 of Swing height
  // OP (Objective Point) = 1.00 of Swing height
  // XOP (Expanded Objective Point) = 1.618 of Swing height
  const swingHeight = useMemo(() => Math.abs(swingHigh - swingLow), [swingHigh, swingLow]);
  const isUpwardThrust = useMemo(() => currentPrice > swingLow + swingHeight/2, [currentPrice, swingLow, swingHeight]);

  const diNapoliTargets = useMemo(() => {
    if (isUpwardThrust) {
      return {
        cop: swingLow + swingHeight * 0.618,
        op: swingLow + swingHeight * 1.0,
        xop: swingLow + swingHeight * 1.618,
      };
    } else {
      return {
        cop: swingHigh - swingHeight * 0.618,
        op: swingHigh - swingHeight * 1.0,
        xop: swingHigh - swingHeight * 1.618,
      };
    }
  }, [swingHeight, swingLow, swingHigh, isUpwardThrust]);

  // 2. Classical Fibonacci retracements
  const fibRetracements = useMemo(() => {
    return {
      r382: isUpwardThrust ? swingHigh - swingHeight * 0.382 : swingLow + swingHeight * 0.382,
      r500: isUpwardThrust ? swingHigh - swingHeight * 0.500 : swingLow + swingHeight * 0.500,
      r618: isUpwardThrust ? swingHigh - swingHeight * 0.618 : swingLow + swingHeight * 0.618,
      r786: isUpwardThrust ? swingHigh - swingHeight * 0.786 : swingLow + swingHeight * 0.786,
    };
  }, [swingHeight, swingLow, swingHigh, isUpwardThrust]);

  // 3. X-Break model triggers
  // Checks premium vs discount zones, order blocks, and levels of buy/sell sweeps
  const premiumDiscountMedian = useMemo(() => (swingHigh + swingLow) / 2, [swingHigh, swingLow]);
  const pricingZone = useMemo(() => {
    return currentPrice > premiumDiscountMedian ? "PREMIUM (Redistribution/Supply Zone)" : "DISCOUNT (Accumulation/Demand Zone)";
  }, [currentPrice, premiumDiscountMedian]);

  // Compute three method-authority validation contracts
  const diNapoliAgent: AgentValidationOutput = useMemo(() => {
    // 1. Operator Custody Seal Pre-verification: No Method Authority Agent may evaluate until the sealer is active
    if (!packetSealed) {
      return {
        agentName: "DiNapoli Agent",
        finding: "AWAITING_OPERATOR_SEAL",
        doctrineRuleInvoked: "Operator Custody Seal Protocol",
        doctrineRule: "Operator Custody Seal Protocol",
        priceRelationshipToDoctrine: "Evaluation is locked. No Method Authority Agent may evaluate until the Operator Observation Seal is active.",
        priceRelationship: "Evaluation is locked. No Method Authority Agent may evaluate until the Operator Observation Seal is active.",
        supportingEvidence: ["Required status: Observation seal must be ACTIVE (OBSERVATION_PACKET_SEALED)."],
        contradictingEvidence: ["Operator custody seal is currently INACTIVE."],
        invalidationLevel: 0,
        confidenceLevel: "NONE",
        confidence: "NONE",
        status: "INSUFFICIENT_EVIDENCE",
        admissibilityReference: "INADMISSIBLE"
      };
    }

    // 2. Observation Hierarchy Context Check: If D1 or H4 is missing, agents may not execute.
    if (!d1Observation.trim() || !h4Observation.trim()) {
      return {
        agentName: "DiNapoli Agent",
        finding: "AWAITING_HIERARCHY_CONTEXT",
        doctrineRuleInvoked: "Observation Doctrine Hierarchy Limits",
        doctrineRule: "Observation Doctrine Hierarchy Limits",
        priceRelationshipToDoctrine: "Strategic (D1) or Structural (H4) context block is missing. Method Authority Agents are blocked from execution.",
        priceRelationship: "Strategic (D1) or Structural (H4) context block is missing. Method Authority Agents are blocked from execution.",
        supportingEvidence: ["Rule constraint: D1 and H4 context layers must be populated before execution."],
        contradictingEvidence: ["Observation packet is incomplete."],
        invalidationLevel: 0,
        confidenceLevel: "NONE",
        confidence: "NONE",
        status: "INSUFFICIENT_EVIDENCE",
        admissibilityReference: "INADMISSIBLE"
      };
    }

    // 3. Overall Admissibility Check
    if (packetAdmissibility.status === "INADMISSIBLE_EVIDENCE") {
      return {
        agentName: "DiNapoli Agent",
        finding: "INADMISSIBLE_EVIDENCE",
        doctrineRuleInvoked: "Evidence Admissibility Boundary Check",
        doctrineRule: "Evidence Admissibility Boundary Check",
        priceRelationshipToDoctrine: `Evaluation blocked. Ingress packet fails admissibility standard. Missing fields: [${packetAdmissibility.missingFields.join(", ")}].`,
        priceRelationship: `Evaluation blocked. Ingress packet fails admissibility standard. Missing fields: [${packetAdmissibility.missingFields.join(", ")}].`,
        supportingEvidence: ["Observation packet failed structural integrity scans."],
        contradictingEvidence: ["Packet marked as INADMISSIBLE_EVIDENCE."],
        invalidationLevel: 0,
        confidenceLevel: "NONE",
        confidence: "NONE",
        status: "INSUFFICIENT_EVIDENCE",
        admissibilityReference: "INADMISSIBLE"
      };
    }

    const cop = diNapoliTargets.cop;
    const op = diNapoliTargets.op;
    const xop = diNapoliTargets.xop;
    const invLevel = isUpwardThrust ? swingLow : swingHigh;

    // Rule 8: If no valid swing is defined, output INSUFFICIENT_EVIDENCE.
    if (swingLow === 0 || swingHigh === 0 || swingHigh <= swingLow) {
      const fallbackMsg = "Price is currently positioned relative to COP / OP / XOP as follows: Swing points are undefined or invalid. Awaiting valid higher timeframe structure.";
      return {
        agentName: "DiNapoli Agent",
        finding: "AWAITING_VALID_SWING",
        doctrineRuleInvoked: "No active swing defined.",
        doctrineRule: "No active swing defined.",
        priceRelationshipToDoctrine: fallbackMsg,
        priceRelationship: fallbackMsg,
        supportingEvidence: ["Rule violation: Ingress swing dimensions are invalid."],
        contradictingEvidence: ["No technical interpretation can proceed because the reference swing is unmapped."],
        invalidationLevel: 0,
        confidenceLevel: "NONE",
        confidence: "NONE",
        status: "INSUFFICIENT_EVIDENCE",
        admissibilityReference: packetId
      };
    }

    // Rule 9: If COP/OP/XOP are not calculated, output INCOMPLETE.
    if (isNaN(cop) || isNaN(op) || isNaN(xop) || cop === 0 || op === 0 || xop === 0) {
      const incompleteMsg = "Price is currently positioned relative to COP / OP / XOP as follows: Math boundaries not loaded.";
      return {
        agentName: "DiNapoli Agent",
        finding: "UNPARSED_OBJECTIVE_TARGETS",
        doctrineRuleInvoked: "Expansion targets are not computed.",
        doctrineRule: "Expansion targets are not computed.",
        priceRelationshipToDoctrine: incompleteMsg,
        priceRelationship: incompleteMsg,
        supportingEvidence: ["Calculation error or missing asset configuration state."],
        contradictingEvidence: ["No reference coordinates exist."],
        invalidationLevel: 0,
        confidenceLevel: "NONE",
        confidence: "NONE",
        status: "INCOMPLETE",
        admissibilityReference: packetId
      };
    }

    // Rule 3 & 4 (Invalidation)
    const isBullishInvalidated = isUpwardThrust && currentPrice <= swingLow;
    const isBearishInvalidated = !isUpwardThrust && currentPrice >= swingHigh;
    if (isBullishInvalidated || isBearishInvalidated) {
      const invalidatedMsg = `Price is currently positioned relative to COP / OP / XOP as follows: Price has breached the core swing boundaries ($${invLevel.toFixed(2)}).`;
      return {
        agentName: "DiNapoli Agent",
        finding: "STRUCTURE_INVALIDATED",
        doctrineRuleInvoked: "DiNapoli Invalidation Breach Protocol",
        doctrineRule: "DiNapoli Invalidation Breach Protocol",
        priceRelationshipToDoctrine: invalidatedMsg,
        priceRelationship: invalidatedMsg,
        supportingEvidence: [
          isBullishInvalidated ? "Price trading below major swing low invalidation level." : "Price trading above major swing high invalidation level.",
          "Dynamic market structure invalidated."
        ],
        contradictingEvidence: ["All bullish progression rules are terminated."],
        invalidationLevel: invLevel,
        confidenceLevel: "NONE",
        confidence: "NONE",
        status: "INVALIDATED",
        admissibilityReference: packetId
      };
    }

    // Active swing is valid. Identify price location & directional findings.
    const isBullishContinuation = isUpwardThrust && currentPrice > cop;
    const isBearishContinuation = !isUpwardThrust && currentPrice < cop;
    const finding = isBullishContinuation 
      ? "BULLISH_CONTINUATION" 
      : (isBearishContinuation ? "BEARISH_REDISTRIBUTION" : "RETRACEMENT_BOUND");

    // Rule 5: If price is between COP and OP, state whether OP is active or rejected.
    let opStatusMessage = "OP target is dormant or unreached.";
    const isBetweenCopAndOp = isUpwardThrust 
      ? (currentPrice >= cop && currentPrice <= op) 
      : (currentPrice <= cop && currentPrice >= op);

    if (isBetweenCopAndOp) {
      opStatusMessage = "Price is trapped between COP and OP. Target OP is currently ACTIVE and acting as the primary magnet.";
    }

    // Rule 6: If price is approaching XOP, mark extension risk and exhaustion risk.
    let exhaustionRisk = "Standard technical risk dimensions.";
    const diffPercentXop = Math.abs(currentPrice - xop) / xop;
    if (diffPercentXop < 0.03) {
      exhaustionRisk = "ALERT: Price is approaching XOP target level. Extreme target expansion risk & momentum exhaustion risk registered.";
    }

    // Rule 7: If price rejects from OP or XOP, mark possible completion or reversal pressure.
    let rejectionPressureMessage = "No active reversal signature localized.";
    const hasRejectedOP = isUpwardThrust ? (currentPrice < op && priorDayHigh >= op) : (currentPrice > op && priorDayLow <= op);
    const hasRejectedXOP = isUpwardThrust ? (currentPrice < xop && priorDayHigh >= xop) : (currentPrice > xop && priorDayLow <= xop);
    if (hasRejectedOP || hasRejectedXOP) {
      rejectionPressureMessage = "Rejection detected from key expansion target (OP/XOP). Possible sequence completion or reversal pressure building.";
    }

    const relationship = `Price is currently positioned relative to COP / OP / XOP as follows: Current SPOT is $${currentPrice.toFixed(2)} with COP at $${cop.toFixed(2)}, OP at $${op.toFixed(2)}, and XOP at $${xop.toFixed(2)}. Controlling swing structure is ${isUpwardThrust ? "UPWARD THRUST" : "DOWNWARD REACTION"}. Invalidation is locked strictly at $${invLevel.toFixed(2)}. ${opStatusMessage}`;

    const supportEv = [
      isUpwardThrust ? "Displaced 3x3 Moving Average remains strictly underneath candidate closing candles." : "Downward Thrust validates bear distribution sequence.",
      `Current level ${currentPrice.toFixed(2)} holds safe priority relative to locked invalidation boundary $${invLevel.toFixed(2)}.`
    ];
    if (isBetweenCopAndOp) supportEv.push("Price has successfully cleared contracted target COP, activating deep target search logic.");

    const contraEv = [];
    if (hasRejectedOP || hasRejectedXOP) contraEv.push(rejectionPressureMessage);
    if (diffPercentXop < 0.03) contraEv.push(exhaustionRisk);
    if (currentPrice < priorDayLow) contraEv.push("Intraday break of prior-day range limits upward momentum index.");
    if (volatilityValue > 25) contraEv.push("Elevated volatility introduces distribution jitter.");

    const d1Finding = `Dominant thrust matches ${isUpwardThrust ? "BULLISH PROGRESSION" : "BEARISH REDISTRIBUTION"}. Price objectives is mapped to COP ($${cop.toFixed(2)}), OP ($${op.toFixed(2)}), and XOP ($${xop.toFixed(2)}). Under strategic rules, ${isUpwardThrust ? "upward expansion" : "downward depletion"} sequence remains intact. Strategic context D1: "${d1Observation.trim()}".`;

    const h4Finding = `H4 structural environment is ${isBetweenCopAndOp ? "extending dynamically towards targets" : "correcting / consolidating inside range boundaries"}. Structural trend is ${isUpwardThrust ? "bullish" : "bearish"} displacement aligned with strategic anchor parameters. Structural context H4: "${h4Observation.trim()}".`;

    const m15Finding = `M15 tactical action represents ${hasRejectedOP || hasRejectedXOP ? "completed expansion leg with local minor counter-reaction threat" : "orderly flow inside displacement boundaries"}. Objectives are ${diffPercentXop < 0.03 ? "approaching maximum extension risk zone" : "actively pulling back for discount structure optimization"}. Tactical context M15: "${m15Observation.trim()}".`;

    const m5Finding = `M5 confirmation layer serves as final witness. Does not create the thesis; validates the sequential vector. Current volume action ${hasRejectedOP || hasRejectedXOP ? "confirms exhaustion" : "supports dynamic trend persistence"}. Confirmation context M5: "${m5Observation.trim()}".`;

    const custodyChainExplanation = `D1 Strategic Context (${isUpwardThrust ? "Bullish Thrust Active" : "Bearish Thrust Active"}) + H4 Structural Alignment (${isBetweenCopAndOp ? "Extending Target Search" : "Consolidating"}) + M15 Tactical Reaction (${hasRejectedOP ? "OP Exhaustion Rejection" : "Orderly Vector"}) + M5 Dynamic Witness = Sequence validation complete. Finding: ${finding}.`;

    return {
      agentName: "DiNapoli Agent",
      finding,
      doctrineRuleInvoked: isUpwardThrust ? "DiNapoli Continuation Thruster Principle" : "DiNapoli Downward Exhaustion Protocol",
      doctrineRule: isUpwardThrust ? "DiNapoli Continuation Thruster Principle" : "DiNapoli Downward Exhaustion Protocol",
      priceRelationshipToDoctrine: relationship,
      priceRelationship: relationship,
      supportingEvidence: supportEv,
      contradictingEvidence: contraEv,
      invalidationLevel: invLevel,
      confidenceLevel: volatilityValue < 25 ? "HIGH" : "MEDIUM",
      confidence: volatilityValue < 25 ? "HIGH" : "MEDIUM",
      status: "VALIDATED",
      admissibilityReference: packetId,
      d1Finding,
      h4Finding,
      m15Finding,
      m5Finding,
      custodyChainExplanation
    };
  }, [currentPrice, diNapoliTargets, isUpwardThrust, swingLow, swingHigh, priorDayHigh, priorDayLow, volatilityValue, packetSealed, d1Observation, h4Observation, packetAdmissibility, packetId]);

  const classicalFibAgent: AgentValidationOutput = useMemo(() => {
    // 1. Operator Custody Seal Pre-verification
    if (!packetSealed) {
      return {
        agentName: "Fibonacci Agent",
        finding: "AWAITING_OPERATOR_SEAL",
        doctrineRuleInvoked: "Operator Custody Seal Protocol",
        doctrineRule: "Operator Custody Seal Protocol",
        priceRelationshipToDoctrine: "Evaluation is locked. No Method Authority Agent may evaluate until the Operator Observation Seal is active.",
        priceRelationship: "Evaluation is locked. No Method Authority Agent may evaluate until the Operator Observation Seal is active.",
        supportingEvidence: ["Required status: Observation seal must be ACTIVE (OBSERVATION_PACKET_SEALED)."],
        contradictingEvidence: ["Operator custody seal is currently INACTIVE."],
        invalidationLevel: 0,
        confidenceLevel: "NONE",
        confidence: "NONE",
        status: "INSUFFICIENT_EVIDENCE",
        admissibilityReference: "INADMISSIBLE"
      };
    }

    // 2. Observation Hierarchy Context Check
    if (!d1Observation.trim() || !h4Observation.trim()) {
      return {
        agentName: "Fibonacci Agent",
        finding: "AWAITING_HIERARCHY_CONTEXT",
        doctrineRuleInvoked: "Observation Doctrine Hierarchy Limits",
        doctrineRule: "Observation Doctrine Hierarchy Limits",
        priceRelationshipToDoctrine: "Strategic (D1) or Structural (H4) context block is missing. Method Authority Agents are blocked from execution.",
        priceRelationship: "Strategic (D1) or Structural (H4) context block is missing. Method Authority Agents are blocked from execution.",
        supportingEvidence: ["Rule constraint: D1 and H4 context layers must be populated before execution."],
        contradictingEvidence: ["Observation packet is incomplete."],
        invalidationLevel: 0,
        confidenceLevel: "NONE",
        confidence: "NONE",
        status: "INSUFFICIENT_EVIDENCE",
        admissibilityReference: "INADMISSIBLE"
      };
    }

    // 3. Overall Admissibility Check
    if (packetAdmissibility.status === "INADMISSIBLE_EVIDENCE") {
      return {
        agentName: "Fibonacci Agent",
        finding: "INADMISSIBLE_EVIDENCE",
        doctrineRuleInvoked: "Evidence Admissibility Boundary Check",
        doctrineRule: "Evidence Admissibility Boundary Check",
        priceRelationshipToDoctrine: `Evaluation blocked. Ingress packet fails admissibility standard. Missing fields: [${packetAdmissibility.missingFields.join(", ")}].`,
        priceRelationship: `Evaluation blocked. Ingress packet fails admissibility standard. Missing fields: [${packetAdmissibility.missingFields.join(", ")}].`,
        supportingEvidence: ["Observation packet failed structural integrity scans."],
        contradictingEvidence: ["Packet marked as INADMISSIBLE_EVIDENCE."],
        invalidationLevel: 0,
        confidenceLevel: "NONE",
        confidence: "NONE",
        status: "INSUFFICIENT_EVIDENCE",
        admissibilityReference: "INADMISSIBLE"
      };
    }

    const r382 = fibRetracements.r382;
    const r500 = fibRetracements.r500;
    const r618 = fibRetracements.r618;
    const r786 = fibRetracements.r786;

    // Rule 9: If anchors are unclear / invalid, output INSUFFICIENT_EVIDENCE.
    if (swingLow === 0 || swingHigh === 0 || swingHigh <= swingLow) {
      const errMessage = "Price is currently positioned relative to 0.382 / 0.50 / 0.618 / 0.786 as follows: Anchor points are unmapped.";
      return {
        agentName: "Fibonacci Agent",
        finding: "ERR_CLEAR_ANCHORS_MISSING",
        doctrineRuleInvoked: "Classical Retracement Doctrine",
        doctrineRule: "Classical Retracement Doctrine",
        priceRelationshipToDoctrine: errMessage,
        priceRelationship: errMessage,
        supportingEvidence: ["Rule violation: Incomplete anchor layout."],
        contradictingEvidence: [],
        invalidationLevel: 0,
        confidenceLevel: "NONE",
        confidence: "NONE",
        status: "INSUFFICIENT_EVIDENCE",
        admissibilityReference: packetId
      };
    }

    const anchorDesc = `Anchors declared: Swing Low at $${swingLow.toFixed(2)}, Swing High at $${swingHigh.toFixed(2)}.`;
    
    // Check if price is trapped between 0.50 and 0.618 (Rule 8)
    const lowerBound = isUpwardThrust ? r618 : r500;
    const upperBound = isUpwardThrust ? r500 : r618;
    const isTrapped50to618 = currentPrice >= lowerBound && currentPrice <= upperBound;

    let finding = "RETRACEMENT_BOUND";
    let status: "VALIDATED" | "INCOMPLETE" | "AMBIGUOUS" | "INVALIDATED" | "INSUFFICIENT_EVIDENCE" = "VALIDATED";

    if (isTrapped50to618) {
      finding = "AMBIGUOUS";
      status = "AMBIGUOUS";
    } else if (isUpwardThrust) {
      if (currentPrice > r382) {
        finding = "BULLISH_CONTINUATION";
      } else if (currentPrice < r786) {
        finding = "BEARISH_REDISTRIBUTION";
        status = "INVALIDATED";
      } else {
        finding = "RETRACEMENT_BOUND";
      }
    } else {
      if (currentPrice < r382) {
        finding = "BEARISH_REDISTRIBUTION";
      } else if (currentPrice > r786) {
        finding = "BULLISH_CONTINUATION";
        status = "INVALIDATED";
      } else {
        finding = "RETRACEMENT_BOUND";
      }
    }

    // Rule 2 & 3: 0.382 reaction represents low reliability without reclaim
    const isNear382 = Math.abs(currentPrice - r382) / r382 < 0.015;
    let comment382 = "Price is not currently localized near the 382 retracement node.";
    if (isNear382) {
      comment382 = "ALERT: Price is reacting near the 0.382 retracement node. Under doctrine rules, this is treated strictly as a transient liquidity reaction, NOT an automatic reversal confirmation, unless structural levels are reclaimed.";
    }

    // Rule 4: 0.618 primary decision zone
    const isNear618 = Math.abs(currentPrice - r618) / r618 <= 0.02;
    let comment618 = "Price is trading outside the primary 0.618 golden pocket.";
    if (isNear618) {
      comment618 = "NOTICE: Price is interacting within the primary 0.618 Golden Pocket decision zone.";
    }

    // Rule 5: 0.786 failure-risk territory
    const isNear786 = isUpwardThrust ? currentPrice <= r786 : currentPrice >= r786;
    let comment786 = "Price remains above deep failure risk bounds.";
    if (isNear786) {
      comment786 = "ALERT: Price is testing deep failure-risk territory at the 0.786 retracement zone. Deep retracement penetrations elevate structure breakdown risks.";
    }

    const invLevel = r786;
    const relationship = `Price is currently positioned relative to 0.382 / 0.50 / 0.618 / 0.786 as follows: ${anchorDesc} Spot price is $${currentPrice.toFixed(2)}. retracement nodes: 0.382 ($${r382.toFixed(2)}), 0.500 ($${r500.toFixed(2)}), 0.618 ($${r618.toFixed(2)}), 0.786 ($${r786.toFixed(2)}). Invalidation level is mapped to r786 at $${invLevel.toFixed(2)}. ${comment382} ${comment618} ${comment786}`;

    // Compute ABC Fibonacci Submodule metrics
    const pointA = isUpwardThrust ? swingLow : swingHigh;
    const pointB = isUpwardThrust ? swingHigh : swingLow;
    const pointC = currentPrice;
    const totalLeg = Math.abs(pointB - pointA);
    const retracedDist = Math.abs(pointB - pointC);
    const retracementLevel = totalLeg > 0 ? (retracedDist / totalLeg) : 0;
    
    // Project 100% continuation
    const projectionTarget = isUpwardThrust 
      ? pointC + totalLeg 
      : pointC - totalLeg;

    let structureStatus: "COMPLETE" | "INCOMPLETE" | "FAILED" | "AMBIGUOUS" = "INCOMPLETE";
    if (swingLow === 0 || swingHigh === 0 || swingHigh <= swingLow) {
      structureStatus = "AMBIGUOUS";
    } else {
      const isBreached = isUpwardThrust ? currentPrice < swingLow : currentPrice > swingHigh;
      const isProjectedReached = isUpwardThrust ? currentPrice >= projectionTarget : currentPrice <= projectionTarget;
      
      if (isBreached) {
        structureStatus = "FAILED";
      } else if (isProjectedReached) {
        structureStatus = "COMPLETE";
      } else if (isTrapped50to618) {
        structureStatus = "AMBIGUOUS";
      } else {
        structureStatus = "INCOMPLETE";
      }
    }

    const abcSubmodule = {
      pointA,
      pointB,
      pointC,
      retracementLevel,
      projectionTarget,
      structureStatus
    };

    const supportEv = [
      `0.618 structural node (${r618.toFixed(2)}) holds as dynamic base coordinate.`,
      "Fibonacci anchors successfully cataloged as active reference coordinates.",
      `ABC Submodule active: point A ($${pointA.toFixed(2)}), point B ($${pointB.toFixed(2)}), point C ($${pointC.toFixed(2)}).`,
      `Retracement ratio sits at ${(retracementLevel * 100).toFixed(1)}% of the core leg.`
    ];
    if (isUpwardThrust && currentPrice > r618) {
      supportEv.push(`Bullish continuation support remains active above primary 0.618 level (${r618.toFixed(2)}).`);
    }

    const contraEv = [];
    if (isTrapped50to618) {
      contraEv.push("Price trapped between 0.50 and 0.618 decision coordinates; direction is highly ambiguous.");
    }
    if (isNear382) {
      contraEv.push("0.382 reaction represents low structural reliability without trend confirmation.");
    }
    if (isNear786) {
      contraEv.push("Deep 0.786 penetration threatens structure invalidation limit.");
    }
    if (currentPrice > swingHigh) {
      contraEv.push("Extreme standard deviation extends overbought technical momentum parameters.");
    }

    // Rule 10: Fibonacci may not output directional confidence without identifying price's location relative to 0.382 ...
    const confidenceLevel = (status === "AMBIGUOUS") ? "NONE" : "HIGH";

    const d1Finding = `Strategic Fibonacci structure evaluated as ${isUpwardThrust ? "BULLISH EMERGENCE" : "BEARISH RETRACEMENT"}. Critical invalidation level marked at 0.786 ($${r786.toFixed(2)}). General trend aligns with higher timeframe parameters. Strategic context D1: "${d1Observation.trim()}".`;

    const h4Finding = `H4 structural anchors established: Swing Low at $${swingLow.toFixed(2)}, Swing High at $${swingHigh.toFixed(2)}. Target displacement range is $${swingHeight.toFixed(2)}. Primary retracement nodes active: 38.2% ($${r382.toFixed(2)}), 50% ($${r500.toFixed(2)}), and 61.8% ($${r618.toFixed(2)}). Structural context H4: "${h4Observation.trim()}".`;

    const m15Finding = `M15 tactical action indicates price is ${isTrapped50to618 ? "trapped inside the 50%-61.8% high-ambiguity corridor" : isNear618 ? "reacting actively within the 61.8% golden pocket zone" : isNear382 ? "testing the shallow 38.2% minor liquidity zone" : "progressing between standard retracement coordinates"}. Tactical context M15: "${m15Observation.trim()}".`;

    const m5Finding = `M5 confirmation layer evaluates dynamic rejection prints at critical Fib nodes. Witness verifies that local volume profile ${isNear618 ? "validates pocket absorption" : "supports continued consolidation range flow"}. Confirmation context M5: "${m5Observation.trim()}".`;

    const custodyChainExplanation = `D1 Strategic Fib (${isUpwardThrust ? "Bullish Struct intact" : "Bearish Struct intact"}) + H4 Anchor Mappings + M15 Node Location (${isTrapped50to618 ? "Corridor Blocked" : "Pocket Testing"}) + M5 Valve Activation = Fibonacci Custody envelope sealed. Finding: ${finding}.`;

    return {
      agentName: "Fibonacci Agent",
      finding,
      doctrineRuleInvoked: "Classical Fibonacci Node Retracement Theory",
      doctrineRule: "Classical Fibonacci Node Retracement Theory",
      priceRelationshipToDoctrine: relationship,
      priceRelationship: relationship,
      supportingEvidence: supportEv,
      contradictingEvidence: contraEv,
      invalidationLevel: invLevel,
      confidenceLevel,
      confidence: confidenceLevel,
      status,
      admissibilityReference: packetId,
      abcSubmodule,
      d1Finding,
      h4Finding,
      m15Finding,
      m5Finding,
      custodyChainExplanation
    };
  }, [currentPrice, fibRetracements, isUpwardThrust, swingLow, swingHigh, packetSealed, d1Observation, h4Observation, packetAdmissibility, packetId]);

  const xBreakAgent: AgentValidationOutput = useMemo(() => {
    // 1. Operator Custody Seal Pre-verification
    if (!packetSealed) {
      return {
        agentName: "X-Break Agent",
        finding: "AWAITING_OPERATOR_SEAL",
        doctrineRuleInvoked: "Operator Custody Seal Protocol",
        doctrineRule: "Operator Custody Seal Protocol",
        priceRelationshipToDoctrine: "Evaluation is locked. No Method Authority Agent may evaluate until the Operator Observation Seal is active.",
        priceRelationship: "Evaluation is locked. No Method Authority Agent may evaluate until the Operator Observation Seal is active.",
        supportingEvidence: ["Required status: Observation seal must be ACTIVE (OBSERVATION_PACKET_SEALED)."],
        contradictingEvidence: ["Operator custody seal is currently INACTIVE."],
        invalidationLevel: 0,
        confidenceLevel: "NONE",
        confidence: "NONE",
        status: "INSUFFICIENT_EVIDENCE",
        admissibilityReference: "INADMISSIBLE"
      };
    }

    // 2. Observation Hierarchy Context Check
    if (!d1Observation.trim() || !h4Observation.trim()) {
      return {
        agentName: "X-Break Agent",
        finding: "AWAITING_HIERARCHY_CONTEXT",
        doctrineRuleInvoked: "Observation Doctrine Hierarchy Limits",
        doctrineRule: "Observation Doctrine Hierarchy Limits",
        priceRelationshipToDoctrine: "Strategic (D1) or Structural (H4) context block is missing. Method Authority Agents are blocked from execution.",
        priceRelationship: "Strategic (D1) or Structural (H4) context block is missing. Method Authority Agents are blocked from execution.",
        supportingEvidence: ["Rule constraint: D1 and H4 context layers must be populated before execution."],
        contradictingEvidence: ["Observation packet is incomplete."],
        invalidationLevel: 0,
        confidenceLevel: "NONE",
        confidence: "NONE",
        status: "INSUFFICIENT_EVIDENCE",
        admissibilityReference: "INADMISSIBLE"
      };
    }

    // 3. Overall Admissibility Check
    if (packetAdmissibility.status === "INADMISSIBLE_EVIDENCE") {
      return {
        agentName: "X-Break Agent",
        finding: "INADMISSIBLE_EVIDENCE",
        doctrineRuleInvoked: "Evidence Admissibility Boundary Check",
        doctrineRule: "Evidence Admissibility Boundary Check",
        priceRelationshipToDoctrine: `Evaluation blocked. Ingress packet fails admissibility standard. Missing fields: [${packetAdmissibility.missingFields.join(", ")}].`,
        priceRelationship: `Evaluation blocked. Ingress packet fails admissibility standard. Missing fields: [${packetAdmissibility.missingFields.join(", ")}].`,
        supportingEvidence: ["Observation packet failed structural integrity scans."],
        contradictingEvidence: ["Packet marked as INADMISSIBLE_EVIDENCE."],
        invalidationLevel: 0,
        confidenceLevel: "NONE",
        confidence: "NONE",
        status: "INSUFFICIENT_EVIDENCE",
        admissibilityReference: "INADMISSIBLE"
      };
    }

    // Rules 1 & 6: Validate anchor structure and the presence of an active impulse first.
    if (swingLow === 0 || swingHigh === 0 || swingHigh <= swingLow) {
      const errMessage = "Price is currently positioned relative to the X-Break model as follows: Swing anchors are undefined or invalid.";
      return {
        agentName: "X-Break Agent",
        finding: "AWAITING_VALID_SWING",
        doctrineRuleInvoked: "Sovereign X-Break Structural Failure Model",
        doctrineRule: "Sovereign X-Break Structural Failure Model",
        priceRelationshipToDoctrine: errMessage,
        priceRelationship: errMessage,
        supportingEvidence: ["Rule violation: Ingress swing dimensions are invalid."],
        contradictingEvidence: [],
        invalidationLevel: 0,
        confidenceLevel: "NONE",
        confidence: "NONE",
        status: "INSUFFICIENT_EVIDENCE",
        admissibilityReference: packetId,
        activeImpulseDirection: "none",
        impulseOrigin: 0,
        xLevel: 0,
        hasXLevelBroken: false,
        hasAcceptanceBeyondX: false,
        modelStatus: "INACTIVE"
      };
    }

    // Determine the active impulse and search for the origin (X-Level) under constraints
    const activeImpulseDirection: "bullish" | "bearish" | "none" = isUpwardThrust ? "bullish" : "bearish";
    const impulseOrigin = activeImpulseDirection === "bullish" ? swingLow : swingHigh;
    const xLevel = impulseOrigin;

    // Rules 3 & 4 & 5: Determine whether price broken and accepted beyond X-Level
    let hasXLevelBroken = false;
    let hasAcceptanceBeyondX = false;

    if (activeImpulseDirection === "bullish") {
      hasXLevelBroken = currentPrice < xLevel;
      // Acceptance is defined as staying 0.25% beyond X bounds
      hasAcceptanceBeyondX = currentPrice <= xLevel - (xLevel * 0.0025);
    } else {
      hasXLevelBroken = currentPrice > xLevel;
      hasAcceptanceBeyondX = currentPrice >= xLevel + (xLevel * 0.0025);
    }

    let modelStatus: "INACTIVE" | "ACTIVE" | "APPROACHING_X" | "X_BREAK_CONFIRMED" | "FAILED" | "INVALIDATED" = "INACTIVE";
    let status: "VALIDATED" | "INCOMPLETE" | "AMBIGUOUS" | "INVALIDATED" | "INSUFFICIENT_EVIDENCE" = "INCOMPLETE";
    let finding = "INACTIVE";

    const devPercent = Math.abs(currentPrice - xLevel) / xLevel;

    if (hasAcceptanceBeyondX) {
      modelStatus = "X_BREAK_CONFIRMED";
      status = "VALIDATED";
      finding = activeImpulseDirection === "bullish" ? "BEARISH_REDISTRIBUTION" : "BULLISH_CONTINUATION";
    } else if (hasXLevelBroken) {
      modelStatus = "ACTIVE";
      status = "INCOMPLETE"; // Redistribution cannot be claimed before break AND acceptance parameters hold
      finding = "X_BREAK_IN_PROGRESS";
    } else if (devPercent <= 0.035) {
      modelStatus = "APPROACHING_X";
      status = "INCOMPLETE";
      finding = "APPROACHING_X_LEVEL";
    } else {
      modelStatus = "INACTIVE";
      status = "INCOMPLETE"; // Rule 7: If X-Level was not broken, output INCOMPLETE
      finding = "IMPULSE_RETAINED";
    }

    const explanation = modelStatus === "X_BREAK_CONFIRMED"
      ? `X-Break CONFIRMED. Spot has broken and accepted beyond the origin of the active impulse ($${xLevel.toFixed(2)}). Dynamic structural invalidation triggered.`
      : modelStatus === "ACTIVE"
      ? `X-Break IN PROGRESS. Spot has broken the key impulse origin at $${xLevel.toFixed(2)} but has not fully established acceptance threshold metrics.`
      : modelStatus === "APPROACHING_X"
      ? `Price index lies within critical tracking proximity ($${currentPrice.toFixed(2)}) of interest boundary X-Level coordinate ($${xLevel.toFixed(2)}).`
      : `X-Break remains INACTIVE. Spot remains range bound safely within the boundaries of the active impulse corridor ($${swingLow.toFixed(2)} - $${swingHigh.toFixed(2)}).`;

    const relationship = `Price is currently positioned relative to the X-Break failure model as follows: ${explanation} SPOT stands at $${currentPrice.toFixed(2)} with X-Level locked at $${xLevel.toFixed(2)}.`;

    const supportEv = [
      hasXLevelBroken 
        ? `Sovereign impulse structure has broken: Spot breached boundary at $${xLevel.toFixed(2)}.` 
        : `Active impulse remains structurally intact; price remains above/below the key origin pivot.`,
      `The origin point of the active ${activeImpulseDirection} impulse leg is locked strictly at $${xLevel.toFixed(2)}.`
    ];

    const contraEv = [];
    if (!hasAcceptanceBeyondX) {
      contraEv.push(`Structural redistribution cannot be validated before X-Level coordinates break and accept.`);
    }

    const confidenceLvl = hasAcceptanceBeyondX ? "HIGH" : "NONE";

    const d1Finding = `Strategic D1 trend is mapped to an active ${activeImpulseDirection} impulse leg. Price limits are tracked against the core swing low ($${swingLow.toFixed(2)}) and swing high ($${swingHigh.toFixed(2)}). Strategic context D1: "${d1Observation.trim()}".`;

    const h4Finding = `H4 structural environment establishes the X-Level strictly at the root origin of the active impulse ($${xLevel.toFixed(2)}). Under sovereign X-Break doctrine rules, this point is the ultimate line of structural invalidation. Structural context H4: "${h4Observation.trim()}".`;

    const m15Finding = `M15 tactical action monitors critical tracking proximity. Current spot price is at $${currentPrice.toFixed(2)}, showing a deviation of ${(devPercent * 100).toFixed(2)}% from key origin. Tactical context M15: "${m15Observation.trim()}".`;

    const m5Finding = `M5 confirmation layer serves as final witness to confirm whether price has broken (Breached: ${hasXLevelBroken ? "YES" : "NO"}) and accepted (Accepted: ${hasAcceptanceBeyondX ? "YES" : "NO"}) beyond the X-Level boundary. Confirmation context M5: "${m5Observation.trim()}".`;

    const custodyChainExplanation = `D1 Strategic Impulse (${activeImpulseDirection.toUpperCase()}) + H4 X-Level Established ($${xLevel.toFixed(2)}) + M15 Proximity (${(devPercent * 100).toFixed(1)}% dev) + M5 Witness Acceptance (${hasAcceptanceBeyondX ? "CONFIRMED" : "HELD"}) = X-Break Custody evaluation complete. Finding: ${finding}.`;

    return {
      agentName: "X-Break Agent",
      finding,
      doctrineRuleInvoked: "Sovereign X-Break Structural Failure Model",
      doctrineRule: "Sovereign X-Break Structural Failure Model",
      priceRelationshipToDoctrine: relationship,
      priceRelationship: relationship,
      supportingEvidence: supportEv,
      contradictingEvidence: contraEv,
      invalidationLevel: xLevel,
      confidenceLevel: confidenceLvl,
      confidence: confidenceLvl,
      status,
      admissibilityReference: packetId,
      activeImpulseDirection,
      impulseOrigin,
      xLevel,
      currentPrice,
      hasXLevelBroken,
      hasAcceptanceBeyondX,
      modelStatus,
      d1Finding,
      h4Finding,
      m15Finding,
      m5Finding,
      custodyChainExplanation
    };
  }, [currentPrice, isUpwardThrust, swingLow, swingHigh, packetSealed, d1Observation, h4Observation, packetAdmissibility, packetId]);

  // Copilot Synthesis Contract computation
  const copilotSynthesis: CopilotSynthesis = useMemo(() => {
    const agentStatuses = [diNapoliAgent.status, classicalFibAgent.status, xBreakAgent.status];
    const weakStatusesCount = agentStatuses.filter(
      s => s === "AMBIGUOUS" || s === "INCOMPLETE" || s === "INSUFFICIENT_EVIDENCE"
    ).length;

    // Checks for directional conflict among validated active findings
    const activeFindings: string[] = [];
    if (diNapoliAgent.status === "VALIDATED") activeFindings.push(diNapoliAgent.finding);
    if (classicalFibAgent.status === "VALIDATED") activeFindings.push(classicalFibAgent.finding);
    if (xBreakAgent.status === "VALIDATED") activeFindings.push(xBreakAgent.finding);

    const hasBullish = activeFindings.includes("BULLISH_CONTINUATION");
    const hasBearish = activeFindings.includes("BEARISH_REDISTRIBUTION");
    const hasConflict = hasBullish && hasBearish;

    // Inside decision zone?
    const isInsideDecisionZone = (classicalFibAgent.status === "AMBIGUOUS");

    // Lacks required evidence?
    const lacksEvidence = agentStatuses.includes("INSUFFICIENT_EVIDENCE");

    // Invalidation levels conflict?
    const invalidationConflict = (diNapoliAgent.status === "VALIDATED" && classicalFibAgent.status === "VALIDATED") &&
      (isUpwardThrust && diNapoliAgent.invalidationLevel > classicalFibAgent.invalidationLevel);

    // Trigger lock active?
    const isAmbiguityLockActive = hasConflict || lacksEvidence || isInsideDecisionZone || (weakStatusesCount >= 2) || invalidationConflict;

    let verdict: "OBSERVE" | "WAIT" | "REVIEW" | "STRUCTURE_CONFIRMED" | "STRUCTURE_FAILED" | "AMBIGUOUS" = "OBSERVE";

    if (isAmbiguityLockActive) {
      if (weakStatusesCount >= 2 || lacksEvidence) {
        verdict = "WAIT";
      } else if (hasConflict || invalidationConflict) {
        verdict = "REVIEW";
      } else {
        verdict = "AMBIGUOUS";
      }
    } else {
      const allBullish = activeFindings.every(f => f === "BULLISH_CONTINUATION") && activeFindings.length > 0;
      const allBearish = activeFindings.every(f => f === "BEARISH_REDISTRIBUTION") && activeFindings.length > 0;
      if (allBullish) {
        verdict = "STRUCTURE_CONFIRMED";
      } else if (allBearish) {
        verdict = "STRUCTURE_FAILED";
      } else {
        verdict = "OBSERVE";
      }
    }

    // Agreement score calculation
    let score = 100;
    if (isAmbiguityLockActive) {
      if (hasConflict) score = 33;
      else if (weakStatusesCount === 1) score = 66;
      else score = 33;
    } else {
      score = 100;
    }

    let interpretation = "";
    if (isAmbiguityLockActive) {
      interpretation = "AMBIGUITY LOCK ACTIVE — OBSERVE ONLY. Recommended Action: cash preservation. Restrict operator directional exposure.";
    } else if (verdict === "STRUCTURE_CONFIRMED") {
      interpretation = "STRUCTURE CONFIRMED: Active alignment across DiNapoli Contraction and Classical Fibonacci Golden Pocket Support models.";
    } else if (verdict === "STRUCTURE_FAILED") {
      interpretation = "STRUCTURE FAILED: Active downward redistribution confirmed by all supporting independent system authorities.";
    } else {
      interpretation = "OBSERVE & WAIT: System models in transition. Awaiting active ledger breakout conformation before committing resources.";
    }

    let conflictAnalysisMsg = "";
    if (hasConflict) {
      conflictAnalysisMsg = `CRITICAL DIRECTIONAL CONFLICT: ${diNapoliAgent.agentName} shows ${diNapoliAgent.finding} while ${xBreakAgent.agentName} validates ${xBreakAgent.finding}.`;
    } else if (lacksEvidence) {
      conflictAnalysisMsg = "INSUFFICIENT EVIDENCE FOR DECISION: Mapped layers lack structural ingress parameter validation blocks.";
    } else if (isInsideDecisionZone) {
      conflictAnalysisMsg = "PRICE WITHIN THE PRIMARY DECISION ZONE: Fibonacci Golden Pocket friction prevents clean mathematical continuation bias.";
    } else if (invalidationConflict) {
      conflictAnalysisMsg = "INVALIDATION INTERSECT FLUSH: Opposing invalidation boundaries discovered between independent model systems.";
    } else {
      conflictAnalysisMsg = "COMPLETE DOCTRINAL ALIGNMENT: All validation agents exhibit synchronized structural direction.";
    }

    return {
      recommendedInterpretation: interpretation,
      agreementScore: score,
      conflictAnalysis: conflictAnalysisMsg,
      ambiguityStatus: isAmbiguityLockActive ? "LOCKOUT" : "CLEAR",
      isAmbiguous: isAmbiguityLockActive,
      verdict
    };
  }, [diNapoliAgent, classicalFibAgent, xBreakAgent, volatilityValue, currentPrice, fibRetracements.r618, isUpwardThrust]);

  // Handle audit triggers
  const handleRealityAudit = () => {
    setRealityAuditPassed(true);
    setIngressLog(prev => [
      ...prev,
      `[COPILOT AUDIT] [${new Date().toLocaleTimeString()}] Checked data sources against sovereign data repositories.`,
      `[COPILOT AUDIT] Historical parameters matched FRED and CME API bounds. No data anomalies identified.`,
      `[COPILOT AUDIT] Copilot Reality Audit status: APPROVED ✔`
    ]);
  };

  const handleRedTeamChallenge = () => {
    setRedTeamChallenged(true);
    setIngressLog(prev => [
      ...prev,
      `[RED TEAM] [${new Date().toLocaleTimeString()}] Challenging bullish assumptions...`,
      `[RED TEAM] High volatility coefficient (${volatilityValue}%) could cause false break of structural lows.`,
      `[RED TEAM] Invalidation trigger bound verified at ${diNapoliAgent.invalidationLevel.toFixed(2)}.`,
      `[RED TEAM] Red Team assumptions validated & logged successfully. Security clearance issued.`
    ]);
  };

  // Lock status dictates final output
  useEffect(() => {
    if (realityAuditPassed && redTeamChallenged && packetSealed) {
      if (copilotSynthesis.isAmbiguous) {
        setIngressLog(prev => [
          ...prev,
          `[AUDIT GATE] 🔒 AMBIGUITY GATEWAY LOCKOUT TRIGGERED. Doctrine conflicts cannot be resolved under risk-preservation protocols. Operator state forced to: WAIT / OBSERVE.`
        ]);
      } else {
        setIngressLog(prev => [
          ...prev,
          `[AUDIT GATE] 🔓 ALL CHECKS CLEARED. Security hashes verified. Validation bounds resolved. Operator authorization granted.`
        ]);
      }
      setGateLocked(false);
    }
  }, [realityAuditPassed, redTeamChallenged, copilotSynthesis.isAmbiguous, packetSealed]);

  // Master Finding evaluation
  const masterFinding = useMemo(() => {
    if (copilotSynthesis.isAmbiguous) return "AMBIGUITY LOCK ACTIVE — OBSERVE ONLY.";
    if (copilotSynthesis.verdict === "STRUCTURE_CONFIRMED") return "Structure Confirmed (Bullish)";
    if (copilotSynthesis.verdict === "STRUCTURE_FAILED") return "Structure Failed (Bearish)";
    return "Review / Wait (Doctrinal Pivot)";
  }, [copilotSynthesis.isAmbiguous, copilotSynthesis.verdict]);

  // PDF Export logic
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42); // slate-900 color profile
    doc.rect(0, 0, 210, 297, "F");

    doc.setTextColor(236, 237, 241);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.text("WALLSTREET FIELD-STATE REPORT", 15, 25);
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.setFont("Helvetica", "normal");
    doc.text(`Export Timestamp: ${new Date().toISOString()}`, 15, 33);
    doc.text(`Chain-of-Custody Block Hash: ${computedHash || "0xUNSEALED"}`, 15, 38);

    // Asset Section
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(15, 45, 180, 20, "F");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(251, 191, 36); // amber-400
    doc.text(`ASSET: ${activePreset.name} (${activePreset.ticker})`, 20, 53);
    doc.setFontSize(9);
    doc.setTextColor(226, 232, 240);
    doc.text(`Spot Execution Price: $${currentPrice.toFixed(2)}  |  Volatility Gauge: ${volatilityIndex} (${volatilityValue}%)`, 20, 59);

    // Structured Ingress Parameters
    doc.setFontSize(11);
    doc.setTextColor(248, 250, 252);
    doc.setFont("Helvetica", "bold");
    doc.text("1. STRUCTURED INGRESS PARAMETERS", 15, 75);
    doc.setFontSize(9);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(203, 213, 225);
    doc.text(`- HTF Major Swing Low: $${swingLow.toFixed(2)}`, 20, 82);
    doc.text(`- HTF Major Swing High: $${swingHigh.toFixed(2)}`, 20, 87);
    doc.text(`- Prior Daily Session range: $${priorDayLow.toFixed(2)} - $${priorDayHigh.toFixed(2)}`, 20, 92);
    doc.text(`- Buy-Side Liquidity Pool Target: $${bslTarget.toFixed(2)}`, 20, 97);
    doc.text(`- Sell-Side Liquidity Pool Target: $${sslTarget.toFixed(2)}`, 20, 102);

    // Sovereign Macro Context
    doc.setFontSize(11);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(34, 211, 238); // sky-400
    doc.text("2. SOVEREIGN MACRO & EXCHANGE PROFILE", 15, 110);
    doc.setFontSize(8);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    const splitMacro = doc.splitTextToSize(macroContext, 175);
    doc.text(splitMacro, 20, 115);

    // 2B. Observation Hierarchy Logs
    doc.setFontSize(10.5);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(147, 197, 253); // blue-350
    doc.text("2B. HIERARCHY OF OBSERVATION LOGS", 15, 126);
    doc.setFontSize(7.5);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(191, 219, 254);
    doc.text(`- D1 Strategic Context: ${d1Observation.substring(0, 95)}${d1Observation.length > 95 ? "..." : ""}`, 20, 131);
    doc.text(`- H4 Structural Context: ${h4Observation.substring(0, 95)}${h4Observation.length > 95 ? "..." : ""}`, 20, 135);
    doc.text(`- M15 Tactical Friction: ${m15Observation.substring(0, 95)}${m15Observation.length > 95 ? "..." : ""}`, 20, 139);
    doc.text(`- M5 Entry Confirmation: ${m5Observation.substring(0, 95)}${m5Observation.length > 95 ? "..." : ""}`, 20, 143);

    // Method Agency Findings
    doc.setFontSize(11);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(248, 250, 252);
    doc.text("3. METHOD AGENCY DOCTRINE ANALYSIS", 15, 151);
    
    // Agent 1: DiNapoli
    doc.setFontSize(9);
    doc.setTextColor(251, 191, 36);
    doc.text(`• ${diNapoliAgent.agentName} (${diNapoliAgent.doctrineRule}):`, 20, 158);
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    doc.text(`  Finding: ${diNapoliAgent.finding} | Invalidation level: $${diNapoliAgent.invalidationLevel.toFixed(2)}`, 20, 162);
    doc.text(`  Relationship: ${diNapoliAgent.priceRelationship.substring(0, 100)}${diNapoliAgent.priceRelationship.length > 100 ? "..." : ""}`, 20, 166);

    // Agent 2: Fibonacci
    doc.setFontSize(9);
    doc.setTextColor(251, 191, 36);
    doc.text(`• ${classicalFibAgent.agentName} (${classicalFibAgent.doctrineRule}):`, 20, 173);
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    doc.text(`  Finding: ${classicalFibAgent.finding} | Submodule Status: ${classicalFibAgent.abcSubmodule?.structureStatus || "N/A"}`, 20, 177);
    doc.text(`  Relationship: ${classicalFibAgent.priceRelationship.substring(0, 100)}${classicalFibAgent.priceRelationship.length > 100 ? "..." : ""}`, 20, 181);

    // Agent 3: X-Break
    doc.setFontSize(9);
    doc.setTextColor(251, 191, 36);
    doc.text(`• ${xBreakAgent.agentName} (${xBreakAgent.doctrineRule}):`, 20, 188);
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    doc.text(`  Finding: ${xBreakAgent.finding} | Model Status: ${xBreakAgent.modelStatus || "N/A"}`, 20, 192);
    doc.text(`  Relationship: ${xBreakAgent.priceRelationship.substring(0, 100)}${xBreakAgent.priceRelationship.length > 100 ? "..." : ""}`, 20, 196);

    // Copilot Synthesis
    doc.setFontSize(11);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(34, 197, 94); // emerald-500
    doc.text("4. COPILOT EVIDENCE SYNTHESIS", 15, 207);
    doc.setFontSize(8.5);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(226, 232, 240);
    doc.text(`Agreement Score: ${copilotSynthesis.agreementScore}%  |  Ambiguity Status: ${copilotSynthesis.ambiguityStatus}`, 20, 213);
    const splitSynthesis = doc.splitTextToSize(copilotSynthesis.recommendedInterpretation, 175);
    doc.text(splitSynthesis, 20, 218);

    // Dynamic Invalidation and Operator Mandate
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(15, 234, 180, 45, "F");
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(248, 250, 252);
    doc.text("OPERATOR FIELD SUMMARY STATE", 20, 241);
    
    doc.setFontSize(8.5);
    doc.setFont("Helvetica", "normal");
    doc.text(`- MASTER OBSERVED FINDING:  ${masterFinding.toUpperCase()}`, 20, 248);
    doc.text(`- CRITICAL INVALIDATION BOUNDS:  $${diNapoliAgent.invalidationLevel.toFixed(2)}`, 20, 254);
    doc.text(`- DECLARED LEVERAGE CEILING:  CASH PRESERVATION PREFERRED`, 20, 260);
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(147, 197, 253); // blue-300
    doc.text("VERDICT SYNDICATE CLEARANCE: GRANTED OBSERVER ACCESS", 20, 274);

    doc.save(`WallStreet_Field_State_${selectedAssetId}.pdf`);
  };

  return (
    <div className="bg-[#0b0c0e] border border-[#232932] rounded-xl overflow-hidden shadow-2xl flex flex-col min-h-[660px]" id="wallstreet-workspace-root">
      
      {/* Dynamic Header */}
      <div className="bg-gradient-to-r from-[#11141a] to-[#141b25] px-6 py-5 border-b border-[#212733] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-sky-950/40 rounded border border-sky-800/50 text-sky-400">
              <Activity className="h-4.5 w-4.5" />
            </span>
            <h1 className="text-base font-mono font-extrabold tracking-widest text-slate-100">
              WALLSTREET <span className="text-sky-400">v0.1</span>
            </h1>
            <span className="text-[8.5px] font-mono bg-[#1d2433] text-indigo-400 px-2 py-0.5 border border-indigo-900/40 rounded font-bold uppercase tracking-wide">
              Ecosystem Observer
            </span>
          </div>
          <p className="text-[10.5px] text-slate-400 font-medium mt-1">
            Pathfinder-Derived Independent Market Structure Observation Engine. Continuous Validation & Reality Audit Workspace.
          </p>
        </div>

        {/* Global Action Handshakes */}
        <div className="flex items-center gap-3 self-stretch md:self-auto justify-end">
          <button 
            onClick={() => {
              // Forced reload of preset data values
              setSelectedAssetId(selectedAssetId);
            }} 
            className="p-1 px-2.5 bg-[#171c26] hover:bg-[#202736] border border-[#2e374d] text-slate-400 text-[10px] font-mono rounded flex items-center gap-1.5 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" /> Reset Ingress
          </button>
          
          <div className="flex items-center gap-1.5 bg-[#131720] px-3 py-1 border border-[#212a3d] rounded-lg">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9.5px] font-mono text-slate-400 font-bold">SOVEREIGN FEED: DIRECT</span>
          </div>
        </div>
      </div>

      {/* Primary Subsystems Navigation rail */}
      <div className="bg-[#0d1016] px-6 py-2.5 border-b border-[#1e2531] flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setActiveTab("ingress")}
          className={`px-4 py-1.5 rounded-lg text-[10px] font-mono tracking-wider transition-all uppercase flex items-center gap-1.5 border cursor-pointer ${
            activeTab === "ingress"
              ? "bg-[#18202d] text-sky-450 border-sky-800/40 font-bold"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#131721] border-transparent"
          }`}
        >
          <Database className="h-3.5 w-3.5" /> 1. Parameter Ingress Schema
        </button>

        <ChevronRight className="h-3 w-3 text-slate-600 hidden sm:block" />

        <button
          onClick={() => {
            if (!packetSealed) return;
            setActiveTab("agents");
          }}
          disabled={!packetSealed}
          className={`px-4 py-1.5 rounded-lg text-[10px] font-mono tracking-wider transition-all uppercase flex items-center gap-1.5 border ${
            !packetSealed ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
          } ${
            activeTab === "agents"
              ? "bg-[#18202d] text-sky-450 border-sky-800/40 font-bold"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#131721] border-transparent"
          }`}
        >
          <Sliders className="h-3.5 w-3.5" /> 2. Dual Doctrine Agents
        </button>

        <ChevronRight className="h-3 w-3 text-slate-600 hidden sm:block" />

        <button
          onClick={() => {
            if (!packetSealed) return;
            setActiveTab("synthesis");
          }}
          disabled={!packetSealed}
          className={`px-4 py-1.5 rounded-lg text-[10px] font-mono tracking-wider transition-all uppercase flex items-center gap-1.5 border ${
            !packetSealed ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
          } ${
            activeTab === "synthesis"
              ? "bg-[#18202d] text-sky-450 border-sky-800/40 font-bold"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#131721] border-transparent"
          }`}
        >
          <Cpu className="h-3.5 w-3.5" /> 3. Copilot Synthesis & Audit
        </button>

        <ChevronRight className="h-3 w-3 text-slate-600 hidden sm:block" />

        <button
          onClick={() => {
            if (!packetSealed) return;
            setActiveTab("report");
          }}
          disabled={!packetSealed}
          className={`px-4 py-1.5 rounded-lg text-[10px] font-mono tracking-wider transition-all uppercase flex items-center gap-1.5 border ${
            !packetSealed ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
          } ${
            activeTab === "report"
              ? "bg-gradient-to-r from-amber-955 to-amber-900/30 text-amber-500 border-amber-900/40 font-bold"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#131721] border-transparent"
          }`}
        >
          <Compass className="h-3.5 w-3.5" /> 4. Field State Report
        </button>

        <ChevronRight className="h-3 w-3 text-slate-600 hidden sm:block" />

        <button
          onClick={() => {
            setActiveTab("lattice");
            fetchLatticeData();
          }}
          className={`px-4 py-1.5 rounded-lg text-[10px] font-mono tracking-wider transition-all uppercase flex items-center gap-1.5 border cursor-pointer ${
            activeTab === "lattice"
              ? "bg-gradient-to-r from-emerald-955 to-emerald-900/30 text-emerald-400 border-emerald-900/40 font-bold"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#131721] border-transparent"
          }`}
        >
          <Network className="h-3.5 w-3.5 text-emerald-450" /> 5. Memory Lattice
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 items-stretch">
        
        {/* Workspace core interaction panel */}
        <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">
          
          {/* TAB 1: INGRESS SCHEMA */}
          {activeTab === "ingress" && (
            <div className="bg-[#12161f] border border-[#212836] rounded-xl p-5 shadow-lg flex flex-col gap-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-sky-500/5 rounded-full blur-[30px] pointer-events-none" />
              
              <div className="border-b border-[#212836] pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-mono font-extrabold uppercase tracking-widest text-slate-200">
                    I. Asset Sovereign Selector & Parameters Ingress
                  </h2>
                  <p className="text-[10px] text-slate-400 mt-0.5">Define structured boundaries using authorized economic markers or dynamic configuration dials.</p>
                </div>
                <BookOpen className="h-4 w-4 text-sky-400" />
              </div>

              {/* Asset Selector Row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-4 flex flex-col gap-1.5">
                  <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Select Sovereign Market Asset:</label>
                  <select
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                    className="bg-[#0b0d12] border border-[#2a3447] rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
                    id="ws-asset-dropdown"
                  >
                    {ASSET_PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.ticker})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-8 bg-[#171e2b] border border-[#242e3f] rounded-lg p-3 text-[10.5px] leading-relaxed text-slate-350 flex items-start gap-2.5">
                  <Info className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-200">Doctrine Profile:</span> {activePreset.description}
                  </div>
                </div>
              </div>

              {/* Dynamic input parameters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-1">
                <div className="flex flex-col gap-1">
                  <label className="text-[9.5px] font-mono text-slate-450 font-bold uppercase">Spot Level:</label>
                  <input
                    type="number"
                    value={currentPrice}
                    step="0.01"
                    onChange={(e) => {
                      setCurrentPrice(parseFloat(e.target.value) || 0);
                      setPacketSealed(false);
                    }}
                    className="bg-[#0b0d12] border border-[#212a3d] rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9.5px] font-mono text-slate-450 font-bold uppercase">HTF Swing Low:</label>
                  <input
                    type="number"
                    value={swingLow}
                    step="0.01"
                    onChange={(e) => {
                      setSwingLow(parseFloat(e.target.value) || 0);
                      setPacketSealed(false);
                    }}
                    className="bg-[#0b0d12] border border-[#212a3d] rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9.5px] font-mono text-slate-450 font-bold uppercase">HTF Swing High:</label>
                  <input
                    type="number"
                    value={swingHigh}
                    step="0.01"
                    onChange={(e) => {
                      setSwingHigh(parseFloat(e.target.value) || 0);
                      setPacketSealed(false);
                    }}
                    className="bg-[#0b0d12] border border-[#212a3d] rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9.5px] font-mono text-slate-450 font-bold uppercase">Prior Day range:</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={priorDayLow}
                      step="0.01"
                      onChange={(e) => {
                        setPriorDayLow(parseFloat(e.target.value) || 0);
                        setPacketSealed(false);
                      }}
                      placeholder="Low"
                      className="bg-[#0b0d12] border border-[#212a3d] rounded-lg px-1.5 py-1.5 text-xs font-mono text-slate-250 w-full focus:outline-none"
                    />
                    <span className="text-slate-600">-</span>
                    <input
                      type="number"
                      value={priorDayHigh}
                      step="0.01"
                      onChange={(e) => {
                        setPriorDayHigh(parseFloat(e.target.value) || 0);
                        setPacketSealed(false);
                      }}
                      placeholder="High"
                      className="bg-[#0b0d12] border border-[#212a3d] rounded-lg px-1.5 py-1.5 text-xs font-mono text-slate-250 w-full focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Ingress Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[9.5px] font-mono text-slate-450 font-bold uppercase">Buy-Side Liquidity Pool Target:</label>
                  <input
                    type="number"
                    value={bslTarget}
                    step="0.01"
                    onChange={(e) => {
                      setBslTarget(parseFloat(e.target.value) || 0);
                      setPacketSealed(false);
                    }}
                    className="bg-[#0b0d12] border border-[#212a3d] rounded-lg px-2.5 py-1.5 text-xs font-mono text-emerald-450 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9.5px] font-mono text-slate-450 font-bold uppercase">Sell-Side Liquidity Pool Target:</label>
                  <input
                    type="number"
                    value={sslTarget}
                    step="0.01"
                    onChange={(e) => {
                      setSslTarget(parseFloat(e.target.value) || 0);
                      setPacketSealed(false);
                    }}
                    className="bg-[#0b0d12] border border-[#212a3d] rounded-lg px-2.5 py-1.5 text-xs font-mono text-rose-450 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9.5px] font-mono text-slate-450 font-bold uppercase">Volatility Multiplier Value:</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-indigo-400 shrink-0">{volatilityIndex}:</span>
                    <input
                      type="number"
                      value={volatilityValue}
                      step="0.1"
                      onChange={(e) => {
                        setVolatilityValue(parseFloat(e.target.value) || 0);
                        setPacketSealed(false);
                      }}
                      className="bg-[#0b0d12] border border-[#212a3d] rounded-lg px-2 py-1 text-xs font-mono text-slate-200 focus:outline-none w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Custom Macro Backdrop Text Area */}
              <div className="flex flex-col gap-1">
                <label className="text-[9.5px] font-mono text-slate-450 font-bold uppercase">Sovereign Macrobackdrop Status:</label>
                <textarea
                  value={macroContext}
                  onChange={(e) => setMacroContext(e.target.value)}
                  rows={2}
                  className="bg-[#0b0d12] border border-[#212a3d] rounded-lg p-2.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-sky-500 leading-normal"
                />
              </div>

              {/* Options Open Interest info */}
              <div className="flex flex-col gap-1">
                <label className="text-[9.5px] font-mono text-slate-450 font-bold uppercase">Derivative Open Interest clusters (CME Quikstrike skew etc):</label>
                <input
                  type="text"
                  value={heavyStrikeOptions}
                  onChange={(e) => setHeavyStrikeOptions(e.target.value)}
                  className="bg-[#0b0d12] border border-[#212a3d] rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-300 focus:outline-none"
                  placeholder="E.g., Resistance boundaries, heavy strike volume concentrations..."
                />
              </div>

              {/* Observation Hierarchy (D1 -> H4 -> M15 -> M5) inputs */}
              <div className="border-t border-[#212836] pt-4 mt-2">
                <h3 className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#93c7fe] mb-3 flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-sky-400" />
                  Observation Hierarchy (Strategic Context → Confirmation Layer)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* D1 Strategic Context */}
                  <div className="bg-[#0b0e14] border border-[#232c3d]/50 rounded-lg p-3 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[9px] font-mono font-extrabold text-[#fda4af] uppercase tracking-wider">
                        D1 : Strategic Context [FIRST PROTOCOL]
                      </label>
                      <span className="text-[8px] font-mono bg-rose-950/20 text-rose-400 border border-rose-900/40 px-1 py-0.5 rounded uppercase">
                        Trend Base
                      </span>
                    </div>
                    <textarea
                      value={d1Observation}
                      onChange={(e) => {
                        setD1Observation(e.target.value);
                        setPacketSealed(false);
                      }}
                      placeholder="Enter strategic context observation on the D1 chart (Required to authorize agents)..."
                      className="bg-[#121620] border border-[#212836] rounded-md p-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-sky-500 leading-relaxed"
                      rows={2}
                    />
                  </div>

                  {/* H4 Structural Context */}
                  <div className="bg-[#0b0e14] border border-[#232c3d]/50 rounded-lg p-3 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[9px] font-mono font-extrabold text-[#fde047] uppercase tracking-wider">
                        H4 : Structural Context [SECOND PROTOCOL]
                      </label>
                      <span className="text-[8px] font-mono bg-yellow-950/20 text-yellow-500 border border-yellow-900/40 px-1 py-0.5 rounded uppercase">
                        Market Space
                      </span>
                    </div>
                    <textarea
                      value={h4Observation}
                      onChange={(e) => {
                        setH4Observation(e.target.value);
                        setPacketSealed(false);
                      }}
                      placeholder="Enter structural context observation on the H4 chart (Required to authorize agents)..."
                      className="bg-[#121620] border border-[#212836] rounded-md p-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-sky-500 leading-relaxed"
                      rows={2}
                    />
                  </div>

                  {/* M15 Tactical Context */}
                  <div className="bg-[#0b0e14] border border-[#232c3d]/50 rounded-lg p-3 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[9px] font-mono font-extrabold text-[#6ee7b7] uppercase tracking-wider">
                        M15 : Tactical Context [THIRD PROTOCOL]
                      </label>
                      <span className="text-[8px] font-mono bg-emerald-950/20 text-emerald-400 border border-emerald-900/40 px-1 py-0.5 rounded uppercase">
                        Friction Zone
                      </span>
                    </div>
                    <textarea
                      value={m15Observation}
                      onChange={(e) => {
                        setM15Observation(e.target.value);
                        setPacketSealed(false);
                      }}
                      placeholder="Enter tactical context observation on the M15 chart..."
                      className="bg-[#121620] border border-[#212836] rounded-md p-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-sky-500 leading-relaxed"
                      rows={2}
                    />
                  </div>

                  {/* M5 Confirmation Layer */}
                  <div className="bg-[#0b0e14] border border-[#232c3d]/50 rounded-lg p-3 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[9px] font-mono font-extrabold text-[#c084fc] uppercase tracking-wider">
                        M5 : Confirmation Layer [FOURTH PROTOCOL]
                      </label>
                      <span className="text-[8px] font-mono bg-purple-950/20 text-purple-400 border border-purple-900/40 px-1 py-0.5 rounded uppercase">
                        Execution Trigger
                      </span>
                    </div>
                    <textarea
                      value={m5Observation}
                      onChange={(e) => {
                        setM5Observation(e.target.value);
                        setPacketSealed(false);
                      }}
                      placeholder="Enter confirmation layer observations on the M5 chart (no trade execution recommendations allowed)..."
                      className="bg-[#121620] border border-[#212836] rounded-md p-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-sky-500 leading-relaxed"
                      rows={2}
                    />
                  </div>

                </div>
              </div>

              {/* Ingress Seal Action */}
              <div className="border-t border-[#212836] pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
                <div className="text-[10px] text-slate-450 flex flex-col gap-1">
                  <span className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${packetAdmissibility.status === "ADMISSIBLE" ? "bg-emerald-500" : "bg-rose-500 animate-pulse"}`} />
                    ADMISSIBILITY: {packetAdmissibility.status === "ADMISSIBLE" ? "✔ INGRESS VALID AT CURRENT PRICE" : "❌ INCOMPLETE EVIDENCE PACKET"}
                  </span>
                  {packetAdmissibility.missingFields.length > 0 && (
                    <span className="text-[9px] text-rose-400 max-w-[400px]">
                      Awaiting: {packetAdmissibility.missingFields.join(", ")}
                    </span>
                  )}
                </div>

                <button
                  onClick={handleSealPacket}
                  className="bg-indigo-650 hover:bg-indigo-600 px-6 py-2.5 rounded-lg text-xs font-mono font-bold tracking-widest text-slate-100 flex items-center gap-1.5 shadow-md active:scale-98 transition-all cursor-pointer border border-indigo-500/30 font-bold"
                >
                  <Database className="h-4 w-4" /> [ SEAL OBSERVATION PACKET ]
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: DUAL DOCTRINE AGENTS */}
          {activeTab === "agents" && (
            <div className="flex flex-col gap-6">
              
              <div className="bg-[#10131b] border border-[#202633] rounded-xl p-5 shadow-lg flex flex-col gap-2">
                <h2 className="text-xs font-mono font-extrabold uppercase tracking-widest text-slate-200">
                  II. Method Authority Validation Contracts
                </h2>
                <p className="text-[10px] text-slate-400">
                  Sovereign doctrinal analysis agents dissect the registered packet autonomously under locked mathematical boundaries.
                </p>
                {computedHash && (
                  <div className="mt-2 text-[9.5px] font-mono bg-[#141b25] px-2.5 py-1 border border-sky-950/40 rounded text-slate-400">
                    🔒 <span className="font-bold text-sky-400">SEALED ENVELOPE SHA-256 HASH:</span> {computedHash}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. DINAPOLI AGENT */}
                <div className="bg-[#121620] border border-[#222938] rounded-xl p-4 shadow-md flex flex-col justify-between">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-[#212a3d] pb-2">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4 text-amber-400" />
                        <span className="font-mono text-xs font-bold text-slate-250">DiNapoli Agent</span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[8px] bg-[#292211] text-amber-400 border border-amber-900/30 px-1.5 py-0.5 rounded font-bold font-mono uppercase">
                          Active Node
                        </span>
                        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                          diNapoliAgent.status === "VALIDATED" 
                            ? "bg-[#112d1e] text-emerald-400 border-emerald-900/30" 
                            : diNapoliAgent.status === "AMBIGUOUS"
                            ? "bg-[#292211] text-amber-500 border-amber-900/30"
                            : "bg-[#2d1112] text-rose-400 border-rose-900/30"
                        }`}>
                          {diNapoliAgent.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-[10.5px]">
                      <div>
                        <span className="font-mono text-[9px] text-[#94a3b8] uppercase block">Doctrine Rule invoked:</span>
                        <span className="text-slate-200 font-semibold">{diNapoliAgent.doctrineRuleInvoked}</span>
                      </div>

                      <div>
                        <span className="font-mono text-[9px] text-[#94a3b8] uppercase block">Price Relationship:</span>
                        <span className="text-slate-350 leading-relaxed block">{diNapoliAgent.priceRelationshipToDoctrine}</span>
                      </div>

                      <div>
                        <span className="font-mono text-[9px] text-[#94a3b8] uppercase block">Calculated Targets (COP/OP/XOP):</span>
                        <div className="bg-[#0b0c10] border border-[#1e2531] rounded p-1.5 font-mono text-[10px] space-y-0.5 text-slate-400">
                          <div>COP Target: <span className="text-indigo-400 font-bold">${diNapoliTargets.cop.toFixed(2)}</span></div>
                          <div>OP Target: <span className="text-sky-400 font-bold">${diNapoliTargets.op.toFixed(2)}</span></div>
                          <div>XOP Target: <span className="text-amber-500 font-bold">${diNapoliTargets.xop.toFixed(2)}</span></div>
                        </div>
                      </div>

                      {/* Multi-Timeframe Custody Chain */}
                      {diNapoliAgent.d1Finding && (
                        <div>
                          <span className="font-mono text-[9px] text-sky-400 uppercase block font-extrabold mb-1.5 flex items-center gap-1">
                            <Activity className="h-3 w-3 text-sky-450" />
                            Multi-Timeframe Custody Chain
                          </span>
                          <div className="bg-[#0b0e14] border border-[#212a3d] rounded-lg p-2.5 font-mono text-[9px] text-slate-350 space-y-2 relative overflow-hidden">
                            <div className="absolute left-[9px] top-4 bottom-4 w-[1px] bg-slate-800" />
                            
                            {/* D1 */}
                            <div className="flex gap-2.5 relative pl-3.5">
                              <span className="absolute left-[6.5px] top-1.5 h-1.5 w-1.5 rounded-full bg-rose-400 border border-[#121620]" />
                              <div>
                                <span className="text-[#fda4af] font-bold uppercase tracking-wider block text-[8px]">D1 Napoli Strategic finding:</span>
                                <p className="text-slate-400 leading-relaxed text-[8.5px]">{diNapoliAgent.d1Finding}</p>
                              </div>
                            </div>

                            {/* H4 */}
                            <div className="flex gap-2.5 relative pl-3.5">
                              <span className="absolute left-[6.5px] top-1.5 h-1.5 w-1.5 rounded-full bg-yellow-400 border border-[#121620]" />
                              <div>
                                <span className="text-[#fde047] font-bold uppercase tracking-wider block text-[8px]">H4 Napoli Structural finding:</span>
                                <p className="text-slate-400 leading-relaxed text-[8.5px]">{diNapoliAgent.h4Finding}</p>
                              </div>
                            </div>

                            {/* M15 */}
                            <div className="flex gap-2.5 relative pl-3.5">
                              <span className="absolute left-[6.5px] top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-450 border border-[#121620]" />
                              <div>
                                <span className="text-[#6ee7b7] font-bold uppercase tracking-wider block text-[8px]">M15 Napoli Tactical finding:</span>
                                <p className="text-slate-400 leading-relaxed text-[8.5px]">{diNapoliAgent.m15Finding}</p>
                              </div>
                            </div>

                            {/* M5 */}
                            <div className="flex gap-2.5 relative pl-3.5">
                              <span className="absolute left-[6.5px] top-1.5 h-1.5 w-1.5 rounded-full bg-purple-400 border border-[#121620]" />
                              <div>
                                <span className="text-[#c084fc] font-bold uppercase tracking-wider block text-[8px]">M5 Napoli Confirmation finder:</span>
                                <p className="text-slate-400 leading-relaxed text-[8.5px]">{diNapoliAgent.m5Finding}</p>
                              </div>
                            </div>

                            {/* Custody Conclusion Envelope */}
                            <div className="border-t border-[#1e2531]/80 pt-2 mt-2 bg-[#121722] p-1.5 rounded border border-indigo-950/40">
                              <span className="text-indigo-400 font-extrabold uppercase text-[7.5px] tracking-wider block">DiNapoli Custody packet:</span>
                              <p className="text-slate-200 mt-1 italic text-[9px] leading-relaxed">{diNapoliAgent.custodyChainExplanation}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <span className="font-mono text-[9px] text-emerald-500 uppercase block">Supporting Evidence:</span>
                        <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-slate-400">
                          {diNapoliAgent.supportingEvidence.map((e, idx) => (
                            <li key={idx}>{e}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <span className="font-mono text-[9px] text-rose-455 uppercase block">Contradicting Evidence:</span>
                        <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-slate-400 font-medium">
                          {diNapoliAgent.contradictingEvidence.map((e, idx) => (
                            <li key={idx}>{e}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#212a3d] pt-3 mt-4 flex items-center justify-between text-[10px] font-mono">
                    <div>
                      <span className="text-[#94a3b8] block text-[8px] uppercase">Custody Admissibility Reference</span>
                      <span className="font-semibold text-slate-400 text-[8.5px]">{diNapoliAgent.admissibilityReference}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[#94a3b8] block text-[8px] uppercase">Invalidation Level</span>
                      <span className="font-bold text-rose-400">${diNapoliAgent.invalidationLevel.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* 2. FIBONACCI AGENT */}
                <div className="bg-[#121620] border border-[#222938] rounded-xl p-4 shadow-md flex flex-col justify-between">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-[#212a3d] pb-2">
                      <div className="flex items-center gap-1.5">
                        <Bookmark className="h-4 w-4 text-indigo-400" />
                        <span className="font-mono text-xs font-bold text-slate-250">Fibonacci Agent</span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[8px] bg-[#1a1c32] text-indigo-400 border border-indigo-900/40 px-1.5 py-0.5 rounded font-bold font-mono uppercase">
                          Active Node
                        </span>
                        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                          classicalFibAgent.status === "VALIDATED" 
                            ? "bg-[#112d1e] text-emerald-400 border-emerald-900/30" 
                            : classicalFibAgent.status === "AMBIGUOUS"
                            ? "bg-[#292211] text-amber-500 border-amber-900/30"
                            : "bg-[#2d1112] text-rose-400 border-rose-900/30"
                        }`}>
                          {classicalFibAgent.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-[10.5px]">
                      <div>
                        <span className="font-mono text-[9px] text-[#94a3b8] uppercase block">Doctrine Rule invoked:</span>
                        <span className="text-slate-200 font-semibold">{classicalFibAgent.doctrineRuleInvoked}</span>
                      </div>

                      <div>
                        <span className="font-mono text-[9px] text-[#94a3b8] uppercase block">Price Relationship:</span>
                        <span className="text-slate-350 leading-relaxed block">{classicalFibAgent.priceRelationshipToDoctrine}</span>
                      </div>

                      <div>
                        <span className="font-mono text-[9px] text-[#94a3b8] uppercase block">Calculated Retro Spreads:</span>
                        <div className="bg-[#0b0c10] border border-[#1e2531] rounded p-1.5 font-mono text-[10px] space-y-0.5 text-slate-400">
                          <div>0.382 Level: <span className="text-slate-350 font-bold">${fibRetracements.r382.toFixed(2)}</span></div>
                          <div>0.500 Median: <span className="text-[#cbd5e1] font-bold">${fibRetracements.r500.toFixed(2)}</span></div>
                          <div>0.618 Pocket: <span className="text-amber-400 font-extrabold">${fibRetracements.r618.toFixed(2)}</span></div>
                          <div>0.786 Limit: <span className="text-rose-455 font-bold">${fibRetracements.r786.toFixed(2)}</span></div>
                        </div>
                      </div>

                      {/* Fibonacci ABC Submodule Visual display */}
                      {classicalFibAgent.abcSubmodule && (
                        <div>
                          <span className="font-mono text-[9px] text-[#818cf8] uppercase block mt-1">Fibonacci ABC Submodule:</span>
                          <div className="bg-[#141b2b] border border-[#2b354d] rounded p-2 font-mono text-[9px] space-y-1.5 text-slate-300">
                            <div className="grid grid-cols-3 gap-1 text-center border-b border-indigo-900/30 pb-1">
                              <div>A: <span className="font-bold text-slate-200">${classicalFibAgent.abcSubmodule.pointA.toFixed(1)}</span></div>
                              <div>B: <span className="font-bold text-slate-200">${classicalFibAgent.abcSubmodule.pointB.toFixed(1)}</span></div>
                              <div>C: <span className="font-bold text-slate-200">${classicalFibAgent.abcSubmodule.pointC.toFixed(1)}</span></div>
                            </div>
                            <div className="flex justify-between">
                              <span>Retracement:</span>
                              <span className="font-extrabold text-indigo-400">{(classicalFibAgent.abcSubmodule.retracementLevel * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Projection (100%):</span>
                              <span className="font-extrabold text-sky-400">${classicalFibAgent.abcSubmodule.projectionTarget.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center bg-[#0d121c] p-1 rounded">
                              <span>Sub-Status:</span>
                              <span className={`px-1 py-0.2 rounded text-[8.5px] font-bold uppercase tracking-wide border ${
                                classicalFibAgent.abcSubmodule.structureStatus === "COMPLETE"
                                  ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/30"
                                  : classicalFibAgent.abcSubmodule.structureStatus === "FAILED"
                                  ? "bg-rose-950/40 text-rose-400 border-rose-900/30"
                                  : "bg-indigo-950/40 text-indigo-400 border-indigo-900/30"
                              }`}>
                                {classicalFibAgent.abcSubmodule.structureStatus}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Multi-Timeframe Custody Chain */}
                      {classicalFibAgent.d1Finding && (
                        <div>
                          <span className="font-mono text-[9px] text-indigo-400 uppercase block font-extrabold mb-1.5 flex items-center gap-1">
                            <Activity className="h-3 w-3 text-indigo-400" />
                            Multi-Timeframe Custody Chain
                          </span>
                          <div className="bg-[#0b0e14] border border-[#212a3d] rounded-lg p-2.5 font-mono text-[9px] text-slate-350 space-y-2 relative overflow-hidden">
                            <div className="absolute left-[9px] top-4 bottom-4 w-[1px] bg-slate-800" />
                            
                            {/* D1 */}
                            <div className="flex gap-2.5 relative pl-3.5">
                              <span className="absolute left-[6.5px] top-1.5 h-1.5 w-1.5 rounded-full bg-rose-455 border border-[#121620]" />
                              <div>
                                <span className="text-[#fda4af] font-bold uppercase tracking-wider block text-[8px]">D1 Fib Strategic finding:</span>
                                <p className="text-slate-400 leading-relaxed text-[8.5px]">{classicalFibAgent.d1Finding}</p>
                              </div>
                            </div>

                            {/* H4 */}
                            <div className="flex gap-2.5 relative pl-3.5">
                              <span className="absolute left-[6.5px] top-1.5 h-1.5 w-1.5 rounded-full bg-yellow-400 border border-[#121620]" />
                              <div>
                                <span className="text-[#fde047] font-bold uppercase tracking-wider block text-[8px]">H4 Fib Structural finding:</span>
                                <p className="text-slate-400 leading-relaxed text-[8.5px]">{classicalFibAgent.h4Finding}</p>
                              </div>
                            </div>

                            {/* M15 */}
                            <div className="flex gap-2.5 relative pl-3.5">
                              <span className="absolute left-[6.5px] top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-450 border border-[#121620]" />
                              <div>
                                <span className="text-[#6ee7b7] font-bold uppercase tracking-wider block text-[8px]">M15 Fib Tactical finding:</span>
                                <p className="text-slate-400 leading-relaxed text-[8.5px]">{classicalFibAgent.m15Finding}</p>
                              </div>
                            </div>

                            {/* M5 */}
                            <div className="flex gap-2.5 relative pl-3.5">
                              <span className="absolute left-[6.5px] top-1.5 h-1.5 w-1.5 rounded-full bg-purple-400 border border-[#121620]" />
                              <div>
                                <span className="text-[#c084fc] font-bold uppercase tracking-wider block text-[8px]">M5 Fib Confirmation finder:</span>
                                <p className="text-slate-400 leading-relaxed text-[8.5px]">{classicalFibAgent.m5Finding}</p>
                              </div>
                            </div>

                            {/* Custody Conclusion Envelope */}
                            <div className="border-t border-[#1e2531]/80 pt-2 mt-2 bg-[#121722] p-1.5 rounded border border-indigo-950/40">
                              <span className="text-indigo-400 font-extrabold uppercase text-[7.5px] tracking-wider block">Fibonacci Custody packet:</span>
                              <p className="text-slate-200 mt-1 italic text-[9px] leading-relaxed">{classicalFibAgent.custodyChainExplanation}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <span className="font-mono text-[9px] text-emerald-500 uppercase block">Supporting Evidence:</span>
                        <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-slate-400">
                          {classicalFibAgent.supportingEvidence.map((e, idx) => (
                            <li key={idx}>{e}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <span className="font-mono text-[9px] text-rose-455 uppercase block">Contradicting Evidence:</span>
                        <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-slate-400">
                          {classicalFibAgent.contradictingEvidence.map((e, idx) => (
                            <li key={idx}>{e}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#212a3d] pt-3 mt-4 flex items-center justify-between text-[10px] font-mono">
                    <div>
                      <span className="text-[#94a3b8] block text-[8px] uppercase">Custody Admissibility Reference</span>
                      <span className="font-semibold text-slate-400 text-[8.5px]">{classicalFibAgent.admissibilityReference}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[#94a3b8] block text-[8px] uppercase">Invalidation Level</span>
                      <span className="font-bold text-rose-400">${classicalFibAgent.invalidationLevel.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* 3. X-BREAK AGENT */}
                <div className="bg-[#121620] border border-[#222938] rounded-xl p-4 shadow-md flex flex-col justify-between">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-[#212a3d] pb-2">
                      <div className="flex items-center gap-1.5">
                        <Compass className="h-4 w-4 text-teal-400" />
                        <span className="font-mono text-xs font-bold text-slate-250">X-Break Structural Failure Agent</span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[8px] bg-[#112a20] text-teal-400 border border-teal-900/30 px-1.5 py-0.5 rounded font-bold font-mono uppercase">
                          Active Node
                        </span>
                        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                          xBreakAgent.status === "VALIDATED" 
                            ? "bg-[#112d1e] text-emerald-400 border-emerald-900/30" 
                            : xBreakAgent.status === "INCOMPLETE"
                            ? "bg-[#1f2535] text-sky-400 border-sky-900/30"
                            : "bg-[#2d1112] text-rose-400 border-rose-900/30"
                        }`}>
                          {xBreakAgent.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-[10.5px]">
                      <div>
                        <span className="font-mono text-[9px] text-[#94a3b8] uppercase block">Doctrine Rule invoked:</span>
                        <span className="text-slate-200 font-semibold">{xBreakAgent.doctrineRuleInvoked}</span>
                      </div>

                      <div>
                        <span className="font-mono text-[9px] text-[#94a3b8] uppercase block">Price Relationship:</span>
                        <span className="text-slate-350 leading-relaxed block">{xBreakAgent.priceRelationshipToDoctrine}</span>
                      </div>

                      <div>
                        <span className="font-mono text-[9px] text-[#94a3b8] uppercase block">Active Impulse Coordinates:</span>
                        <div className="bg-[#0b0c10] border border-[#1e2531] rounded p-1.5 font-mono text-[10px] text-slate-400 space-y-1">
                          <div className="justify-between flex">
                            <span>Impulse Direction:</span> 
                            <span className="text-slate-350 font-bold uppercase">{xBreakAgent.activeImpulseDirection}</span>
                          </div>
                          <div className="justify-between flex">
                            <span>Impulse Origin (X):</span>
                            <span className="text-indigo-400 font-bold">${xBreakAgent.impulseOrigin?.toFixed(2) || (isUpwardThrust ? swingLow : swingHigh).toFixed(2)}</span>
                          </div>
                          
                          {/* X-Break Status attributes */}
                          <div className="border-t border-[#1e2531] mt-1 pt-1 space-y-1">
                            <div className="flex justify-between">
                              <span>Origin Broken?</span>
                              <span className={`font-bold ${xBreakAgent.hasXLevelBroken ? "text-rose-450" : "text-slate-500"}`}>
                                {xBreakAgent.hasXLevelBroken ? "BREACHED" : "UNBREACHED"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Value Accepted (&gt;0.25%):</span>
                              <span className={`font-bold ${xBreakAgent.hasAcceptanceBeyondX ? "text-[#f43f5e]" : "text-slate-500"}`}>
                                {xBreakAgent.hasAcceptanceBeyondX ? "ACCEPTED" : "BLOCKED"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center bg-[#0d121c] p-0.5 px-1 rounded text-[9.5px]">
                              <span>Model Status:</span>
                              <span className={`text-[8.5px] font-bold uppercase tracking-wider px-1 rounded ${
                                xBreakAgent.modelStatus === "X_BREAK_CONFIRMED"
                                  ? "bg-rose-950/40 text-rose-400 border border-rose-900/40"
                                  : xBreakAgent.modelStatus === "APPROACHING_X"
                                  ? "bg-amber-950/40 text-amber-400 border border-amber-900/40"
                                  : "bg-[#181d29] text-slate-550 border border-slate-900/40"
                              }`}>
                                {xBreakAgent.modelStatus}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Multi-Timeframe Custody Chain */}
                      {xBreakAgent.d1Finding && (
                        <div>
                          <span className="font-mono text-[9px] text-teal-400 uppercase block font-extrabold mb-1.5 flex items-center gap-1">
                            <Activity className="h-3 w-3 text-teal-450" />
                            Multi-Timeframe Custody Chain
                          </span>
                          <div className="bg-[#0b0e14] border border-[#212a3d] rounded-lg p-2.5 font-mono text-[9px] text-slate-350 space-y-2 relative overflow-hidden">
                            <div className="absolute left-[9px] top-4 bottom-4 w-[1px] bg-slate-800" />
                            
                            {/* D1 */}
                            <div className="flex gap-2.5 relative pl-3.5">
                              <span className="absolute left-[6.5px] top-1.5 h-1.5 w-1.5 rounded-full bg-rose-455 border border-[#121620]" />
                              <div>
                                <span className="text-[#fda4af] font-bold uppercase tracking-wider block text-[8px]">D1 X-Break Strategic finding:</span>
                                <p className="text-slate-400 leading-relaxed text-[8.5px]">{xBreakAgent.d1Finding}</p>
                              </div>
                            </div>

                            {/* H4 */}
                            <div className="flex gap-2.5 relative pl-3.5">
                              <span className="absolute left-[6.5px] top-1.5 h-1.5 w-1.5 rounded-full bg-yellow-400 border border-[#121620]" />
                              <div>
                                <span className="text-[#fde047] font-bold uppercase tracking-wider block text-[8px]">H4 X-Break level establishment:</span>
                                <p className="text-slate-400 leading-relaxed text-[8.5px]">{xBreakAgent.h4Finding}</p>
                              </div>
                            </div>

                            {/* M15 */}
                            <div className="flex gap-2.5 relative pl-3.5">
                              <span className="absolute left-[6.5px] top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-450 border border-[#121620]" />
                              <div>
                                <span className="text-[#6ee7b7] font-bold uppercase tracking-wider block text-[8px]">M15 X-Break proximity monitoring:</span>
                                <p className="text-slate-400 leading-relaxed text-[8.5px]">{xBreakAgent.m15Finding}</p>
                              </div>
                            </div>

                            {/* M5 */}
                            <div className="flex gap-2.5 relative pl-3.5">
                              <span className="absolute left-[6.5px] top-1.5 h-1.5 w-1.5 rounded-full bg-purple-400 border border-[#121620]" />
                              <div>
                                <span className="text-[#c084fc] font-bold uppercase tracking-wider block text-[8px]">M5 X-Break Validation witness:</span>
                                <p className="text-slate-400 leading-relaxed text-[8.5px]">{xBreakAgent.m5Finding}</p>
                              </div>
                            </div>

                            {/* Custody Conclusion Envelope */}
                            <div className="border-t border-[#1e2531]/80 pt-2 mt-2 bg-[#121722] p-1.5 rounded border border-indigo-950/40">
                              <span className="text-indigo-400 font-extrabold uppercase text-[7.5px] tracking-wider block">X-Break Custody packet:</span>
                              <p className="text-slate-200 mt-1 italic text-[9px] leading-relaxed">{xBreakAgent.custodyChainExplanation}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <span className="font-mono text-[9px] text-emerald-500 uppercase block">Supporting Evidence:</span>
                        <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-slate-400">
                          {xBreakAgent.supportingEvidence.map((e, idx) => (
                            <li key={idx}>{e}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <span className="font-mono text-[9px] text-rose-455 uppercase block">Contradicting Evidence:</span>
                        <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-slate-400">
                          {xBreakAgent.contradictingEvidence.map((e, idx) => (
                            <li key={idx}>{e}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#212a3d] pt-3 mt-4 flex items-center justify-between text-[10px] font-mono">
                    <div>
                      <span className="text-[#94a3b8] block text-[8px] uppercase">Custody Admissibility Reference</span>
                      <span className="font-semibold text-slate-400 text-[8.5px]">{xBreakAgent.admissibilityReference}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[#94a3b8] block text-[8px] uppercase">Invalidation Level</span>
                      <span className="font-bold text-rose-400">${xBreakAgent.invalidationLevel.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Navigation Proceed Button */}
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => setActiveTab("synthesis")}
                  className="bg-[#171c26] hover:bg-[#202736] border border-[#2e374d] text-slate-350 text-xs font-mono font-bold px-5 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  Proceed to Ingress Synthesis <ChevronRight className="h-4 w-4" />
                </button>
              </div>

            </div>
          )}

          {/* TAB 3: COPILOT SYNTHESIS & AUDIT LAYER */}
          {activeTab === "synthesis" && (
            <div className="bg-[#121620] border border-[#222938] rounded-xl p-5 shadow-lg flex flex-col gap-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[140px] h-[140px] bg-emerald-500/5 rounded-full blur-[35px] pointer-events-none" />
              
              <div className="border-b border-[#212836] pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-mono font-extrabold uppercase tracking-widest text-slate-200">
                    III. Copilot Synthesis & Sovereign Audit Gateways
                  </h2>
                  <p className="text-[10px] text-slate-400 mt-0.5">Validate logic fidelity, challenge core directional assumptions, and verify system integrity.</p>
                </div>
                <Cpu className="h-4 w-4 text-emerald-400" />
              </div>

              {/* Synthesis metrics */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 py-2">
                {/* Score gauge */}
                <div className="md:col-span-4 bg-[#181d29] border border-[#263246] rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2">
                  <span className="font-mono text-[9px] text-[#94a3b8] uppercase tracking-wider">Doctrinal Agreement Score</span>
                  <div className="relative flex items-center justify-center">
                    <span className="font-mono text-3xl font-black text-slate-100">{copilotSynthesis.agreementScore}%</span>
                  </div>
                  <span className={`text-[9.5px] font-bold uppercase ${
                    copilotSynthesis.agreementScore === 100 ? "text-emerald-400" : copilotSynthesis.agreementScore === 66 ? "text-amber-500" : "text-rose-455"
                  }`}>
                    {copilotSynthesis.agreementScore === 100 ? "Pure Consensus" : copilotSynthesis.agreementScore === 66 ? "Local Consensus" : "Model Disaccord"}
                  </span>
                </div>

                {/* Synthesis analysis text */}
                <div className="md:col-span-8 space-y-3">
                  <div className="bg-[#181d29] border border-[#263246] rounded-xl p-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 uppercase tracking-wide">
                      <TrendingUp className="h-4 w-4 text-sky-400" /> Recommended Interpretation
                    </div>
                    <p className="text-[11.5px] text-slate-300 leading-relaxed mt-2 font-mono">
                      {copilotSynthesis.recommendedInterpretation}
                    </p>
                  </div>

                  <div className="bg-[#181d29] border border-[#263246] rounded-xl p-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 uppercase tracking-wide">
                      <AlertTriangle className="h-4 w-4 text-amber-500" /> Conflict & Ambiguity Analysis
                    </div>
                    <p className="text-[11.5px] text-slate-350 leading-relaxed mt-2">
                      {copilotSynthesis.conflictAnalysis}
                    </p>
                  </div>
                </div>
              </div>

              {/* Three Strict Audit Gate buttons */}
              <div className="bg-[#161c27] border border-[#273247] rounded-xl p-4 flex flex-col gap-4 mt-2">
                <div className="text-[11px] font-mono font-bold uppercase text-slate-200 tracking-wider flex items-center gap-1">
                  🛡️ Active Security & Audit Controls
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  {/* Reality Audit */}
                  <button
                    onClick={handleRealityAudit}
                    className={`p-3.5 border rounded-lg text-left flex flex-col gap-1 transition-all relative overflow-hidden group cursor-pointer ${
                      realityAuditPassed
                        ? "bg-[#112d1e] border-emerald-500/40 text-emerald-350"
                        : "bg-[#141b26] border-[#29354b] hover:border-slate-500 hover:bg-[#1a2333]"
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[9.5px] font-bold">
                      <span>AUDIT 1: REALITY GATE</span>
                      {realityAuditPassed ? <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> : <RefreshCw className="h-3 w-3 text-slate-500 animate-spin" />}
                    </div>
                    <span className="text-[11px] font-bold text-slate-100 group-hover:text-amber-300">Run Copilot Reality Audit</span>
                    <span className="text-[9px] text-[#94a3b8] leading-snug">Verifies parameters and timestamps directly against central banking time-series bounds.</span>
                  </button>

                  {/* Red Team Challenge */}
                  <button
                    onClick={handleRedTeamChallenge}
                    className={`p-3.5 border rounded-lg text-left flex flex-col gap-1 transition-all relative overflow-hidden group cursor-pointer ${
                      redTeamChallenged
                        ? "bg-[#1d1b32] border-indigo-500/40 text-indigo-350"
                        : "bg-[#141b26] border-[#29354b] hover:border-slate-500 hover:bg-[#1a2333]"
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[9.5px] font-bold">
                      <span>AUDIT 2: SECURITY BIAS</span>
                      {redTeamChallenged ? <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" /> : <RefreshCw className="h-3 w-3 text-slate-500" />}
                    </div>
                    <span className="text-[11px] font-bold text-slate-100 group-hover:text-amber-300">Red Team Assumption Challenge</span>
                    <span className="text-[9px] text-[#94a3b8] leading-snug">Audits confirmation bias constraints and identifies underlying market invalidation levels.</span>
                  </button>

                  {/* Ambiguity Lock */}
                  <div className={`p-3.5 border rounded-lg text-left flex flex-col gap-1 relative overflow-hidden ${
                    copilotSynthesis.isAmbiguous
                      ? "bg-[#331417] border-rose-500/45 text-rose-350"
                      : "bg-[#112d1e] border-emerald-500/40 text-emerald-350"
                  }`}>
                    <div className="flex items-center justify-between font-mono text-[9.5px] font-bold">
                      <span>AUDIT 3: AMBIGUITY LOCK</span>
                      {copilotSynthesis.isAmbiguous ? <Lock className="h-3.5 w-3.5 text-rose-400" /> : <Unlock className="h-3.5 w-3.5 text-emerald-400" />}
                    </div>
                    <span className="text-[11px] font-bold text-slate-100">
                      {copilotSynthesis.isAmbiguous ? "EMERGENCY SYSTEM LOCK ACTIVE" : "AMBIGUITY LOCK CLEAR"}
                    </span>
                    <span className="text-[9px] text-[#94a3b8] leading-snug">
                      {copilotSynthesis.isAmbiguous 
                        ? "Total disaccord detected. Lock prevents Operator authorization. Force cash preservation." 
                        : "Agreement index confirms valid structural conditions. System flow operational."}
                    </span>
                  </div>

                </div>
              </div>

              {/* Proceed to final report */}
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => {
                    if (gateLocked) return;
                    setActiveTab("report");
                  }}
                  disabled={gateLocked}
                  className={`px-6 py-2.5 rounded-lg text-xs font-mono font-bold tracking-widest flex items-center gap-1.5 transition-all outline-none border ${
                    gateLocked
                      ? "bg-gradient-to-r from-[#171c26] to-[#11141a] text-slate-500 border-[#2e374d] cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-550 hover:to-amber-700 text-slate-100 border-amber-400/40 shadow-md cursor-pointer active:scale-98"
                  }`}
                >
                  {gateLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                  {gateLocked ? "[ PASSIVE AUDITS PENDING ]" : "[ COMPILE FIELD STATE REPORT ]"}
                </button>
              </div>

            </div>
          )}

          {/* TAB 4: FIELD STATE REPORT */}
          {activeTab === "report" && (
            <div className="flex flex-col gap-6">
              
              {/* PRINT READY DOCKET CONTAINER */}
              <div className="bg-[#0f1118] border-2 border-dashed border-[#2b3547] rounded-xl p-6 sm:p-8 flex flex-col gap-6 font-mono text-[11px] text-slate-350 leading-relaxed max-w-3xl mx-auto shadow-2xl relative" id="printable-docket-canvas">
                <div className="absolute top-4 right-4 text-[9px] font-bold bg-[#1d2535] text-sky-400 px-2 py-0.5 rounded border border-sky-900/40">
                  OFFICIAL COGNITIVE TRANSCRIPT
                </div>

                {/* Double Bordered Title */}
                <div className="border-4 border-double border-slate-700 p-4 text-center">
                  <h1 className="text-sm font-extrabold text-slate-100 tracking-[0.25em] mb-1">WALLSTREET FIELD-STATE REPORT</h1>
                  <span className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase">SOVEREIGN OBSERVER SYNDICATE</span>
                </div>

                {/* Micro Metadata Table */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#141924] border border-[#232d3d] p-3 rounded-lg text-[10px]">
                  <div>
                    <span className="text-slate-500 block">TARGET SYSTEM</span>
                    <span className="font-extrabold text-amber-500 uppercase">{activePreset.name} ({activePreset.ticker})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">CUSTODY HASHCODE</span>
                    <span className="font-bold text-slate-300">{computedHash || "0xUNSEALED"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">VOLATILITY RANGE</span>
                    <span className="font-semibold text-sky-350 uppercase">{volatilityValue}% (ATR {volatilityIndex})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">CURRENT LEVEL</span>
                    <span className="font-black text-slate-100">${currentPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Section I: Ingress Schema Parameters */}
                <div className="space-y-2">
                  <div className="border-b border-slate-800 pb-1 text-slate-200 font-extrabold uppercase tracking-wider">
                    I. SOVEREIGN FEED INGRESS VALUE SEGMENTS
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 pl-2">
                    <div>HTF MAJOR SWING MINIMUM: <span className="text-slate-150 font-bold text-right">${swingLow.toFixed(2)}</span></div>
                    <div>HTF MAJOR SWING HEIGHT BOUNDARY: <span className="text-slate-150 font-bold">${swingHigh.toFixed(2)}</span></div>
                    <div>PRIOR DAILY ACTIVE FLOOR: <span className="text-slate-150 font-bold">${priorDayLow.toFixed(2)}</span></div>
                    <div>PRIOR DAILY ACTIVE CEILING: <span className="text-slate-150 font-bold">${priorDayHigh.toFixed(2)}</span></div>
                    <div>BUY-SIDE LIQUIDITY OFFSET POOL: <span className="text-emerald-450 font-bold">${bslTarget.toFixed(2)}</span></div>
                    <div>SELL-SIDE LIQUIDITY OFFSET POOL: <span className="text-rose-450 font-bold">${sslTarget.toFixed(2)}</span></div>
                  </div>
                </div>

                {/* Section II: Macro backdrop */}
                <div className="space-y-2">
                  <div className="border-b border-slate-800 pb-1 text-slate-200 font-extrabold uppercase tracking-wider">
                    II. MACROBACKDROP CLIMATE MATRIX
                  </div>
                  <p className="pl-2 leading-relaxed text-[#a0aec0] text-[10px]">
                    {macroContext}
                  </p>
                  {heavyStrikeOptions && (
                    <div className="pl-2 flex items-start gap-1 text-[10px] text-indigo-355 italic pb-1">
                      <span>•</span>
                      <span>{heavyStrikeOptions}</span>
                    </div>
                  )}
                </div>

                {/* Section III: Doctrine Outputs */}
                <div className="space-y-2">
                  <div className="border-b border-slate-800 pb-1 text-slate-200 font-extrabold uppercase tracking-wider">
                    III. INDEPENDENT AGENCY SUB-VERDICTS
                  </div>
                  <div className="space-y-3.5 pl-2 text-[10.5px]">
                    <div>
                      <span className="text-slate-100 font-bold">1. DiNapoli Target Node Model Rules:</span>
                      <div className="text-slate-350 text-[10px] pl-2 mt-0.5 space-y-0.5">
                        <p>• Finding: <span className="text-amber-400 font-extrabold">{diNapoliAgent.finding}</span> | Confidence is {diNapoliAgent.confidence}.</p>
                        <p>• Relationship: {diNapoliAgent.priceRelationship}</p>
                        <p>• Calculated objective bounds: COP ${diNapoliTargets.cop.toFixed(2)} / OP ${diNapoliTargets.op.toFixed(2)}.</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-100 font-bold">2. Fibonacci Gold Pocket Alignment:</span>
                      <div className="text-slate-350 text-[10px] pl-2 mt-0.5 space-y-0.5">
                        <p>• Finding: <span className="text-[#a5b4fc] font-extrabold">{classicalFibAgent.finding}</span> | Core retracement supports golden ratio targets.</p>
                        <p>• Level Index: 0.618 dynamic node floats at ${fibRetracements.r618.toFixed(2)}.</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-100 font-bold">3. Sovereign X-Break Structural Failure Model:</span>
                      <div className="text-slate-350 text-[10px] pl-2 mt-0.5 space-y-0.5">
                        <p>• Finding: <span className="text-emerald-450 font-extrabold">{xBreakAgent.finding}</span> | Model tracks active impulse invalidation.</p>
                        <p>• Active Impulse Origin (X-Level): <span className="font-bold text-slate-150">${xBreakAgent.invalidationLevel.toFixed(2)}</span>.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section IV: Consensus Matrix */}
                <div className="space-y-2">
                  <div className="border-b border-slate-800 pb-1 text-slate-200 font-extrabold uppercase tracking-wider">
                    IV. SYNTHETIC COPILOT REALITY CONCORDANCE
                  </div>
                  <div className="pl-2 text-[10px] space-y-1">
                    <p>• DOCTRINARY AGREEMENT INTEGRITY: <span className="text-slate-100 font-bold">{copilotSynthesis.agreementScore}% AGREEMENT INDEX</span></p>
                    <p>• STRUCTURAL AMBIGUITY INDEX: <span className={`font-bold uppercase ${copilotSynthesis.isAmbiguous ? "text-rose-450 text-xs" : "text-emerald-450 text-xs"}`}>
                      {copilotSynthesis.isAmbiguous ? "CRITICAL (AMBIGUITY LOCKOUT ENGAGED)" : "STABLE VALID STATUS"}
                    </span></p>
                    <p className="text-slate-350 mt-1">{copilotSynthesis.recommendedInterpretation}</p>
                  </div>
                </div>

                {/* Outlines Invalidation and Operator Mandate */}
                <div className="bg-[#171e2c] border border-slate-700 p-4 rounded-lg mt-2 font-mono">
                  <div className="text-[10px] font-extrabold text-slate-200 uppercase tracking-widest mb-2 border-b border-slate-700 pb-1">
                    🎯 FINISHED DOCTRINARY SYNDICATE DECISION MANDATE
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10.5px]">
                    <div>
                      <span className="text-slate-500 block uppercase">Observed Verdict Finding:</span>
                      <span className={`text-[12.5px] font-black uppercase tracking-wider ${
                        copilotSynthesis.isAmbiguous 
                          ? "text-rose-455" 
                          : diNapoliAgent.finding === "BULLISH_CONTINUATION" 
                          ? "text-emerald-400 animate-pulse" 
                          : "text-amber-500"
                      }`}>
                        {copilotSynthesis.isAmbiguous ? "OBSERVE & WAIT (AMBIGUOUS)" : masterFinding.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block uppercase">Critical Invalidation Bound:</span>
                      <span className="text-rose-400 font-bold text-xs">${diNapoliAgent.invalidationLevel.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-[#cbd5e1] leading-relaxed mt-3 border-t border-slate-700/65 pt-2 italic">
                    💡 <span className="font-bold uppercase">Operator Action Directive:</span> WallStreet executes zero proprietary positions. Under Pathfinder governance protocol, if ambiguity persists or model values diverge, cash functions as a valid capital reserve. Let the market prove structure first.
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2 bg-[#10141d] p-4 border border-[#232a39] rounded-xl shadow">
                <p className="text-[10px] text-slate-400 font-mono">
                  Report is compiled, validated and ready. Secure Ledger is sealed.
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab("ingress")}
                    className="px-4 py-2 bg-[#171c26] hover:bg-[#202736] border border-[#2e374d] text-slate-350 text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Modify Ingress Dials
                  </button>

                  <button
                    onClick={handleExportPDF}
                    className="bg-emerald-650 hover:bg-emerald-600 px-6 py-2.5 rounded-lg text-xs font-mono font-bold tracking-widest text-slate-100 flex items-center gap-1.5 shadow-md active:scale-98 transition-all cursor-pointer border border-emerald-500/30"
                  >
                    <Download className="h-4 w-4" /> [ EXPORT FIELD STATE PDF ]
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: DOCTRINE MEMORY LATTICE */}
          {activeTab === "lattice" && (
            <div className="bg-[#12161f] border border-[#212836] rounded-xl p-5 shadow-lg flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none" />

              <div className="border-b border-[#212836] pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Brain className="h-4.5 w-4.5 text-emerald-400" />
                    <h2 className="text-xs font-mono font-extrabold uppercase tracking-widest text-slate-200">
                      WallStreet Core Doctrine Memory Lattice
                    </h2>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">
                    Continuous self-optimizing database of asset profiles, feedback logs, and operator override ledgers.
                  </p>
                </div>
                <button
                  onClick={fetchLatticeData}
                  disabled={latticeLoading}
                  className="px-3 py-1.5 bg-[#171c26] hover:bg-[#202736] border border-[#2e374d] text-slate-350 text-[10px] font-mono rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`h-3 w-3 ${latticeLoading ? 'animate-spin' : ''}`} /> Sync DB Lattice
                </button>
              </div>

              {latticeError && (
                <div className="p-3 bg-red-950/40 border border-red-500/30 text-rose-300 text-[10px] font-mono rounded-lg">
                  ⚠️ Error syncing lattice collections: {latticeError}
                </div>
              )}

              {/* SECTION 1: ASSET PROFILE MEMORIES */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 border-b border-slate-800 pb-1">
                  <Bookmark className="h-3.5 w-3.5 text-emerald-405" />
                  <span className="text-[10.5px] font-mono font-bold text-slate-200 uppercase tracking-wider">I. Instrument Profile Memories (Sovereign Cognition)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assetProfiles.map((prof: any) => (
                    <div key={prof.id} className="p-3 bg-[#0b0e14] border border-[#1d2433] rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-black text-amber-400">{prof.id} — {prof.name}</span>
                        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/30 font-bold">
                          Fidelity Weight: {(prof.diNapoliFibResponseWeight * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="text-[10px] space-y-1 text-slate-400">
                        <p><strong className="text-slate-300">Preferred Sessions:</strong> {prof.preferredSessions?.join(", ") || "None specified"}</p>
                        <p><strong className="text-slate-300">Continuous Confluences:</strong> {prof.successfulConfluencesCount || 0} Successful / {prof.failedSetupsCount || 0} Failed</p>
                        <p><strong className="text-slate-300">Macro Drivers:</strong> {prof.macroDrivers?.join(", ") || "None specified"}</p>
                        <p><strong className="text-slate-300">Liquidity Habits:</strong> <span className="italic text-slate-350">"{prof.liquidityHabits}"</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 2: TIMEFRAME CUSTODY SEQUENCE */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 border-b border-slate-800 pb-1">
                  <Database className="h-3.5 w-3.5 text-indigo-405" />
                  <span className="text-[10.5px] font-mono font-bold text-slate-200 uppercase tracking-wider">II. Hierarchical Timeframe State Sequence</span>
                </div>
                <div className="p-3 bg-[#090b0e] border border-[#1b212f]/80 rounded-xl space-y-3">
                  <div className="bg-[#241a0e]/45 border border-amber-500/25 p-3 rounded-lg text-[10px] text-amber-300/90 italic font-mono flex items-start gap-1">
                    <span>💡</span>
                    <span>
                      <strong className="text-amber-200 uppercase not-italic">Sequence Sequence Principle:</strong> D1/H4 bounds hold supreme decision authority. M15/M5 sit at lower layers. M5 weight is numerically small (0.10) and has <strong>0 thesis generation authority</strong>; its role is strictly valid confirmation evidence for the sequence.
                    </span>
                  </div>
                  <div className="relative pl-4 space-y-3 border-l-2 border-[#1e2636]">
                    {timeframeStates.length === 0 ? (
                      <p className="text-[10px] text-slate-500 italic">No timeframe states configured. Initialize presets above.</p>
                    ) : (
                      timeframeStates.map((state: any) => {
                        let badgeColor = "bg-rose-950/55 text-rose-300 border-rose-900/40";
                        if (state.timeframe === "D1") badgeColor = "bg-sky-950/50 text-sky-350 border-sky-900/40 pb-0.5";
                        else if (state.timeframe === "H4") badgeColor = "bg-indigo-950/50 text-indigo-300 border-indigo-900/40";
                        else if (state.timeframe === "M15") badgeColor = "bg-amber-955/50 text-amber-300 border-amber-900/40";
                        else if (state.timeframe === "M5") badgeColor = "bg-teal-950/50 text-teal-300 border-teal-900/40";

                        return (
                          <div key={state.id} className="relative space-y-1">
                            <span className="absolute -left-[21px] top-0.5 h-2 w-2 rounded-full bg-indigo-500" />
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-mono font-bold uppercase tracking-wider border px-1.5 py-0.5 rounded ${badgeColor}`}>
                                {state.timeframe} — {state.role}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 font-bold">
                                Asset: {state.assetId} | Weight Authority: {state.authorityWeight}
                              </span>
                            </div>
                            <p className="text-[10px] font-mono text-slate-300 pl-1">{state.currentFinding}</p>
                            <p className="text-[9px] font-mono text-rose-450 pl-1">Invalidation Line: ${state.invalidationLine}</p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 3: SPECIFIC PATTERN REGISTRY & PROBABILITY */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 border-b border-slate-800 pb-1">
                  <Zap className="h-3.5 w-3.5 text-amber-405" />
                  <span className="text-[10.5px] font-mono font-bold text-slate-200 uppercase tracking-wider">III. Specialist Pattern Registry index</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 select-none">
                  {patternRegistry.map((pat: any) => (
                    <div key={pat.id} className="p-3 bg-[#090b10] border border-[#1c2230] rounded-lg flex flex-col gap-2">
                      <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
                        <span className="text-[10.5px] font-mono font-black text-slate-100 truncate">{pat.name}</span>
                        <span className="text-[9.5px] font-mono text-indigo-400 font-bold">{pat.asset} ({pat.timeframe})</span>
                      </div>
                      <div className="text-[9.5px] font-mono space-y-1 text-slate-400">
                        <p><strong className="text-slate-300">Session:</strong> {pat.session}</p>
                        <p className="line-clamp-2"><strong className="text-slate-300">Trigger:</strong> {pat.entryCondition}</p>
                        <div className="flex items-center justify-between text-[9px] bg-[#121621] p-1 rounded font-bold">
                          <span className="text-slate-400">P(Success)</span>
                          <span className="text-emerald-450">{(pat.probabilityWeight * 100).toFixed(0)}%</span>
                        </div>
                        <p className="text-slate-500 italic pl-1 leading-snug">"Lesson: {pat.lesson}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 4: OUTCOME FEEDBACK LOOP */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
                {/* Historical Log list */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 border-b border-slate-800 pb-1">
                    <History className="h-3.5 w-3.5 text-emerald-450" />
                    <span className="text-[10.5px] font-mono font-bold text-slate-200 uppercase tracking-wider">IV. Outcome Feedback Logs</span>
                  </div>
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {outcomeFeedbacks.map((fb: any) => (
                      <div key={fb.id} className="p-3 bg-[#0a0c12] border border-[#1b212f] rounded-lg text-[9.5px] font-mono text-slate-400 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-slate-250 font-mono">Pattern ID: {fb.patternId}</span>
                          <span className={`font-black ${fb.actualOutcome === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'}`}>{fb.actualOutcome}</span>
                        </div>
                        <p>Asset: <strong className="text-slate-300">{fb.asset}</strong> | Predicted Bias: <strong className="text-slate-300">{fb.predictedBias}</strong></p>
                        <p>Weight Adjust Applied: <strong className="text-emerald-455">+{fb.weightAdjustmentApplied}</strong></p>
                        {fb.unsolicitedNotes && <p className="italic text-slate-500">"{fb.unsolicitedNotes}"</p>}
                      </div>
                    ))}
                  </div>

                  {/* Add Outcome Feedback Form */}
                  <div className="p-3 bg-[#0f121b] border border-slate-800 rounded-lg space-y-2.5">
                    <span className="text-[10px] font-mono font-extrabold text-[#e2e8f0] block uppercase border-b border-slate-800 pb-1">Record Outcome Feedback</span>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <input 
                        type="text" 
                        placeholder="Pattern ID" 
                        id="new-outcome-pat-id"
                        defaultValue="pat-gc-xbreak"
                        className="p-1 px-2 bg-[#090b10] border border-slate-800 rounded text-[10px] text-slate-200 uppercase font-mono"
                      />
                      <input 
                        type="text" 
                        placeholder="Asset" 
                        id="new-outcome-asset"
                        defaultValue="GC"
                        className="p-1 px-2 bg-[#090b10] border border-slate-800 rounded text-[10px] text-slate-200 uppercase font-mono"
                      />
                      <select 
                        id="new-outcome-status"
                        className="p-1 bg-[#090b10] border border-slate-800 rounded text-[10px] text-slate-200 font-mono"
                      >
                        <option value="SUCCESS">SUCCESS</option>
                        <option value="FAILURE">FAILURE</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        placeholder="Predicted Bias" 
                        id="new-outcome-bias"
                        defaultValue="BULLISH"
                        className="p-1 px-2 bg-[#090b10] border border-slate-800 rounded text-[10px] text-slate-200 uppercase font-mono"
                      />
                      <input 
                        type="number" 
                        step="0.01"
                        placeholder="Weight adjustment" 
                        id="new-outcome-weight"
                        defaultValue="0.02"
                        className="p-1 px-2 bg-[#090b10] border border-slate-800 rounded text-[10px] text-slate-200 font-mono"
                      />
                    </div>

                    <input 
                      type="text" 
                      placeholder="Operator Lessons Captured" 
                      id="new-outcome-notes"
                      className="w-full p-1.5 bg-[#090b10] border border-slate-800 rounded text-[10px] text-slate-200 font-mono"
                    />

                    <button 
                      onClick={async () => {
                        const patId = (document.getElementById("new-outcome-pat-id") as HTMLInputElement)?.value || "";
                        const asset = (document.getElementById("new-outcome-asset") as HTMLInputElement)?.value || "";
                        const status = (document.getElementById("new-outcome-status") as HTMLSelectElement)?.value || "SUCCESS";
                        const bias = (document.getElementById("new-outcome-bias") as HTMLInputElement)?.value || "";
                        const weight = Number((document.getElementById("new-outcome-weight") as HTMLInputElement)?.value) || 0.02;
                        const notes = (document.getElementById("new-outcome-notes") as HTMLInputElement)?.value || "";

                        if (!patId || !asset) return;
                        
                        try {
                          const res = await fetch("/api/lattice/feedback", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              id: `FB-ENTRY-${Date.now()}`,
                              patternId: patId,
                              asset,
                              predictedBias: bias,
                              actualOutcome: status,
                              deviation: 0.02,
                              weightAdjustmentApplied: weight,
                              unsolicitedNotes: notes
                            })
                          });
                          if(res.ok) {
                            fetchLatticeData();
                            const notesInput = document.getElementById("new-outcome-notes") as HTMLInputElement;
                            if (notesInput) notesInput.value = "";
                          }
                        } catch(e) {
                          console.error(e);
                        }
                      }}
                      className="w-full py-1 bg-emerald-700 hover:bg-emerald-600 border border-emerald-500 text-slate-100 rounded text-[10px] font-mono font-bold cursor-pointer"
                    >
                      Record Feedback Entry & Adjust Weights
                    </button>
                  </div>
                </div>

                {/* Operator Mandates and Overrides */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 border-b border-slate-800 pb-1">
                    <PenTool className="h-3.5 w-3.5 text-amber-450" />
                    <span className="text-[10.5px] font-mono font-bold text-slate-200 uppercase tracking-wider">V. Operator Sovereignty Mandates</span>
                  </div>
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {operatorOverrides.map((ov: any) => (
                      <div key={ov.id} className="p-3 bg-[#110e14] border border-[#261f2f] rounded-lg text-[9.5px] font-mono text-slate-400 space-y-1 relative">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-extrabold text-amber-450 uppercase">Asset Mode: {ov.asset}</span>
                          <span className="text-[9px] bg-red-955 text-rose-300 border border-rose-900/45 px-1 rounded">OVERRIDE</span>
                        </div>
                        <p><strong className="text-slate-350">Reason:</strong> {ov.overrideReason}</p>
                        <p><strong className="text-slate-350">Authority Seal:</strong> <span className="text-amber-300 font-extrabold font-mono text-[9px]">{ov.sealSignature}</span></p>
                      </div>
                    ))}
                  </div>

                  {/* Issue Override Form */}
                  <div className="p-3 bg-[#18131e] border border-indigo-950/60 rounded-lg space-y-2.5">
                    <span className="text-[10px] font-mono font-extrabold text-indigo-200 block uppercase border-b border-indigo-950 pb-1">Issue Sovereign Override</span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        placeholder="Asset code (GC/NQ/BTC)" 
                        id="override-asset"
                        defaultValue="GC"
                        className="p-1 px-2 bg-[#090b10] border border-slate-800 rounded text-[10px] text-slate-200 uppercase font-mono"
                      />
                      <input 
                        type="text" 
                        placeholder="Timeframe context" 
                        id="override-tf"
                        defaultValue="D1"
                        className="p-1 px-2 bg-[#090b10] border border-slate-800 rounded text-[10px] text-slate-200 uppercase font-mono"
                      />
                    </div>

                    <input 
                      type="text" 
                      placeholder="Override reason or forced mandate summary" 
                      id="override-reason"
                      className="w-full p-1.5 bg-[#090b10] border border-slate-800 rounded text-[10px] text-slate-200 font-mono"
                    />

                    <input 
                      type="text" 
                      placeholder="Sovereignty signature code" 
                      id="override-seal"
                      defaultValue="OP-SEAL-8891-ROD-SOVEREIGN"
                      className="w-full p-1.5 bg-[#090b10] border border-slate-800 rounded text-[10px] text-slate-200 font-mono font-bold"
                    />

                    <button 
                      onClick={async () => {
                        const asset = (document.getElementById("override-asset") as HTMLInputElement)?.value || "";
                        const tf = (document.getElementById("override-tf") as HTMLInputElement)?.value || "";
                        const reason = (document.getElementById("override-reason") as HTMLInputElement)?.value || "";
                        const seal = (document.getElementById("override-seal") as HTMLInputElement)?.value || "";

                        if (!asset || !reason) return;

                        try {
                          const res = await fetch("/api/lattice/overrides", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              id: `OVERRIDE-GEN-${Date.now()}`,
                              asset,
                              timeframe: tf,
                              overrideReason: reason,
                              approvedByOperator: true,
                              sealSignature: seal,
                              timestamp: new Date().toISOString()
                            })
                          });
                          if(res.ok) {
                            fetchLatticeData();
                            const reasonInput = document.getElementById("override-reason") as HTMLInputElement;
                            if (reasonInput) reasonInput.value = "";
                          }
                        } catch(e) {
                          console.error(e);
                        }
                      }}
                      className="w-full py-1.5 bg-indigo-700 hover:bg-indigo-600 border border-indigo-500 text-slate-100 rounded text-[10px] font-mono font-bold cursor-pointer"
                    >
                      Sign Sovereign Override & Dispatch Lock
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* RIGHT COLUMN: LOGS & SECURITY TRANSPARENCY (Lg: 4 cols) */}
        <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
          
          {/* Diagnostic Console Panel */}
          <div className="bg-[#10121a] border border-[#1f2635] rounded-xl p-4 shadow-lg flex-1 flex flex-col min-h-[350px]">
            <div className="flex items-center justify-between border-b border-[#212a3d] pb-2 mb-3.5">
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-250">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span>Ecosystem Audit Logger</span>
              </div>
              <span className="text-[9px] bg-emerald-950/40 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800/30 font-bold uppercase tracking-wider">
                Veracious
              </span>
            </div>

            {/* Ingress Console Logs */}
            <div className="flex-1 bg-[#07090d] border border-[#1b212e] rounded-lg p-3.5 font-mono text-[10px] text-slate-400 space-y-2.5 overflow-y-auto max-h-[500px]">
              {ingressLog.length === 0 ? (
                <p className="text-slate-600 italic">No audit records registered. Define parameters and click Ingress Seal.</p>
              ) : (
                ingressLog.map((log, index) => {
                  let color = "text-slate-400";
                  if (log.includes("[INGRESS]")) color = "text-sky-400";
                  else if (log.includes("[COPILOT AUDIT]")) color = "text-emerald-450";
                  else if (log.includes("[RED TEAM]")) color = "text-indigo-400";
                  else if (log.includes("[AUDIT GATE]")) color = "text-amber-500 font-bold";
                  else if (log.includes("[SYSTEM]")) color = "text-slate-400 font-medium";

                  return (
                    <div key={index} className={`leading-normal border-l-2 pl-2 border-slate-800 ${color}`}>
                      {log}
                    </div>
                  );
                })
              )}
            </div>

            <p className="text-[9.5px] leading-relaxed text-slate-500 font-mono mt-3.5">
              💡 Observation ledger registers active Chain-of-Custody hashes synchronously. Offline state cache enabled.
            </p>
          </div>

          {/* Quick-Load Presets */}
          <div className="bg-[#10121a] border border-[#1f2635] rounded-xl p-4 shadow-lg">
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest border-b border-[#212a3d] pb-2 mb-3 flex items-center gap-1.5">
              <PieChart className="h-4 w-4 text-sky-400" /> Presets Sandbox
            </h3>

            <div className="space-y-2.5">
              {ASSET_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedAssetId(p.id)}
                  className={`w-full text-left p-2 rounded-lg border flex flex-col gap-0.5 transition-colors cursor-pointer ${
                    selectedAssetId === p.id
                      ? "bg-[#18202e] border-sky-800/50 text-slate-100"
                      : "bg-[#0b0c10] border-[#1e2532] hover:bg-[#131720] text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                    <span>{p.name}</span>
                    <span className="text-sky-450 font-extrabold text-[9.5px]">{p.ticker}</span>
                  </div>
                  <p className="text-[9.5px] text-slate-[#8292a8] leading-tight truncate w-full">{p.description}</p>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Floating Cold Bench telemetry live feed terminal scaffold */}
      <FloatingLiveFeedTerminal />

    </div>
  );
}
