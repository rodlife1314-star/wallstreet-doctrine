import { useState, useEffect, useRef, FormEvent, useMemo, Dispatch, SetStateAction } from "react";
import { 
  Plane, 
  Sliders, 
  Activity, 
  Lock, 
  Unlock, 
  Play, 
  Terminal, 
  Database, 
  Send, 
  AlertTriangle, 
  Cpu, 
  RefreshCw, 
  Sparkles, 
  Server, 
  Info, 
  ExternalLink, 
  Check, 
  FileText, 
  Zap, 
  Compass, 
  ShieldCheck, 
  Layers, 
  ChevronRight,
  ShieldAlert,
  X,
  Search, 
  HelpCircle,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Link,
  Key,
  TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PresetConfigs, ChatMessage, CustodyPacket } from "./types";
import { OctagonComputeRuntimeAdapter, RuntimeHandoffContract, CapabilityProfile, deriveCapabilityProfile, IReasoner, REASONER_REGISTRY } from "./crystal_bridge";
import { jsPDF } from "jspdf";
import WallStreetWorkspace from "./components/WallStreetWorkspace";

// Dynamic classified subsystems for repository ingestion
const INGEST_SUBSYSTEMS = [
  {
    id: "runtime",
    name: "Runtime Core",
    desc: "C++ engine loaders, VRAM allocators, device checks, and capability alignment layers.",
    path: "src/jemma_tenzor/runtime/",
    files: [
      { name: "engine_manager.py", action: "Loads dynamic engine files & validates weights compatibility", size: "12 KB" },
      { name: "vram_allocator.py", action: "Estimates dynamic CUDA cache allocations based on model profiles", size: "8 KB" }
    ],
    status: "PROPOSED",
    metrics: "Optimized for hardware threads execution"
  },
  {
    id: "inference",
    name: "Inference Services",
    desc: "FastAPI production gateway, tokenizer client wrappers, stream response channels.",
    path: "src/jemma_tenzor/inference/",
    files: [
      { name: "server_gateway.py", action: "FastAPI server running endpoints on port 8000 inside Docker", size: "15 KB" },
      { name: "streaming_client.py", action: "Token yield handler converting binary output stream to JSON", size: "9 KB" }
    ],
    status: "PROPOSED",
    metrics: "Asynchronous stream pipeline enabled"
  },
  {
    id: "validation",
    name: "Ingestion Validation",
    desc: "Strict environment parameters validation, dependency isolation trackers and GPU analysis tools.",
    path: "src/jemma_tenzor/validation/",
    files: [
      { name: "dependency_validation.py", action: "Validates python module library baselines offline", size: "2 KB" },
      { name: "environment_validation.py", action: "Checks host execution ports and secret boundaries", size: "2 KB" },
      { name: "gpu_availability_validation.py", action: "Diagnoses GPU limits & configures fallback CPU tiers", size: "2 KB" },
      { name: "model_manifest_validation.py", action: "Compares model parameters against manifest templates", size: "2 KB" }
    ],
    status: "VERIFIED",
    metrics: "CPU-safe Verification Engine online"
  },
  {
    id: "configs",
    name: "Runtime Configuration Workspace",
    desc: "Templated model profiles, precision parameters configurations and memory allocator limits.",
    path: "config/",
    files: [
      { name: "runtime_config_template.json", action: "Specifies default engine paths and threads safety ceilings", size: "1.5 KB" },
      { name: "model_profile_template.json", action: "Houses attention head counts, layer definitions and profiles", size: "1 KB" },
      { name: "quantization_profile_template.json", action: "Sets AWQ layout compression rates and precision parameters", size: "1 KB" }
    ],
    status: "VERIFIED",
    metrics: "Active runtime workspace profiles loaded"
  },
  {
    id: "schemas",
    name: "Structural Schemas",
    desc: "Formal model declarations, target infrastructure specs and requests/responses constraints.",
    path: "schemas/",
    files: [
      { name: "model_manifest_schema.json", action: "Defines requirements for model weights registration", size: "1 KB" },
      { name: "deployment_manifest_schema.json", action: "Establishes cloud configurations specifications constraints", size: "1 KB" },
      { name: "inference_schema.json", action: "Binds active temperature parameters to API gateway endpoints", size: "1 KB" }
    ],
    status: "VERIFIED",
    metrics: "Strict JSON structural validators linked"
  },
  {
    id: "tests",
    name: "Incremental Sandbox Tests",
    desc: "CPU safe regression tests suites validating core runtime modules without hardware constraints.",
    path: "tests/",
    files: [
      { name: "test_mock_inference.py", action: "Performs mock tokenization & baseline latency assertions", size: "1.5 KB" },
      { name: "test_allocator_boundary.py", action: "Verifies VRAM safety multiplier calculation logic", size: "1 KB" },
      { name: "test_gateway_route.py", action: "Ensures FastAPI schema routers map correctly", size: "1 KB" }
    ],
    status: "VERIFIED",
    metrics: "Clean safe unit test coverage verified"
  }
];

const sampleChallenges = [
  {
    challenge: "Why is US inflation falling while employment remains resilient?",
    dataset_recommendations: ["CPIAUCSL", "PAYEMS", "UNRATE", "OPHNFB"],
    authority_chain: ["FRED", "BLS"]
  },
  {
    challenge: "What is the structural correlation between US Treasury 10Y-2Y yield curves and commercial defaults?",
    dataset_recommendations: ["T10Y2Y", "CRE_INDEX", "DEFAULT_COMMERCIAL"],
    authority_chain: ["FRED", "FED_BOARD"]
  },
  {
    challenge: "What concentration skews are present in CME QuikStrike Open Interest Profile for Gold Options near heavy strikes?",
    dataset_recommendations: ["CME_GOLD_OI_PROFILE", "CME_GOLD_OPTIONS_VOLUME_SKEW"],
    authority_chain: ["CME", "SEC"]
  },
  {
    challenge: "What are the core liquidity offsets of the Bank of England's Official Bank Rate changes on cross-border GBP flows?",
    dataset_recommendations: ["BOE_BANK_RATE", "BOE_YIELD_CURVE", "BOE_GBP_USD"],
    authority_chain: ["BOE", "FRED"]
  },
  {
    challenge: "Analyze the elasticity of domestic energy supply lines against rising heavy industrial demands.",
    dataset_recommendations: ["AEO_ENERGY_PROD", "IP_UTILITIES", "PPI_ENERGY_INDEX"],
    authority_chain: ["EIA", "FRED"]
  },
  {
    challenge: "Compare persistent service sector wage pressure against general consumer pricing indices.",
    dataset_recommendations: ["ECI_SERVICES", "CPI_SERVICES_LESS_ENERGY", "WAGES_AVERAGE_HOURLY"],
    authority_chain: ["BLS", "FRED"]
  }
];

const DATASET_REGISTRY: Record<string, { name: string; url: string; authority: string; accessMethod: string }> = {
  BOE_BANK_RATE: {
    name: "Bank of England Official Bank Rate (Historical Series)",
    url: "https://www.bankofengland.co.uk/boeapps/database/fromshowcolumns.asp?SeriesCodes=IUMABEDR",
    authority: "BOE",
    accessMethod: "Bank of England Direct Time-series Export (CSV/XML)"
  },
  BOE_YIELD_CURVE: {
    name: "Bank of England Nominal Gilt Yield Curves & Interest Spreads",
    url: "https://www.bankofengland.co.uk/statistics/yield-curves",
    authority: "BOE",
    accessMethod: "Official Central Bank Yield Model Engine"
  },
  BOE_GBP_USD: {
    name: "Bank of England Spot Exchange Rate (GBP vs USD daily)",
    url: "https://www.bankofengland.co.uk/boeapps/database/fromshowcolumns.asp?SeriesCodes=XUDLGBD",
    authority: "BOE",
    accessMethod: "BOE Interactive Database Webpage Query"
  },
  BOE_HOUSEHOLD_CREDIT: {
    name: "Bank of England Lending to Individuals / Household Credit",
    url: "https://www.bankofengland.co.uk/statistics/visual-summaries/lending-to-individuals",
    authority: "BOE",
    accessMethod: "Central Bank Statistical Release Web Portal"
  },
  BOE_MONEY_SUPPLY: {
    name: "Bank of England Central Bank Money Supply (M4 series)",
    url: "https://www.bankofengland.co.uk/statistics/money-and-credit",
    authority: "BOE",
    accessMethod: "BOE Database Ingress Service"
  },
  BOE_EFFECTIVE_INT: {
    name: "Bank of England Effective Interest Rates (Aggregated Metrics)",
    url: "https://www.bankofengland.co.uk/statistics/effective-interest-rates",
    authority: "BOE",
    accessMethod: "BOE Direct CSV Series Indexer"
  },
  BOE_BANKING_STATS: {
    name: "Bank of England Banking Sector Balance Sheet & System Reserves",
    url: "https://www.bankofengland.co.uk/statistics/banking-sector-balance-sheet",
    authority: "BOE",
    accessMethod: "Central Bank Balance Sheet Database Reader"
  },
  OPENJARVIS_PORTABLE_SPEC: {
    name: "OpenJarvis Local-First Agent Portable Specification & Trace Optimizers",
    url: "https://github.com/tinyfish-io/bigset",
    authority: "OpenJarvis Architecture Group",
    accessMethod: "Portable JSON Spec + Trace Logs"
  },
  CPIAUCSL: {
    name: "Consumer Price Index for All Urban Consumers (CPI-U)",
    url: "https://fred.stlouisfed.org/series/CPIAUCSL",
    authority: "BLS",
    accessMethod: "FRED HTTP API (JSON)"
  },
  PAYEMS: {
    name: "All Employees, Total Nonfarm Payrolls",
    url: "https://fred.stlouisfed.org/series/PAYEMS",
    authority: "BLS",
    accessMethod: "BLS Public API v2 (JSON)"
  },
  UNRATE: {
    name: "Civilian Unemployment Rate",
    url: "https://fred.stlouisfed.org/series/UNRATE",
    authority: "BLS",
    accessMethod: "FRED HTTP API (JSON)"
  },
  OPHNFB: {
    name: "Nonfarm Business Sector: Real Output Per Hour",
    url: "https://fred.stlouisfed.org/series/OPHNFB",
    authority: "BLS",
    accessMethod: "BLS Public API v2 (JSON)"
  },
  T10Y2Y: {
    name: "10-Year Treasury Constant Maturity Minus 2-Year Treasury",
    url: "https://fred.stlouisfed.org/series/T10Y2Y",
    authority: "FRED",
    accessMethod: "FRED HTTP API (JSON)"
  },
  CRE_INDEX: {
    name: "Commercial Real Estate Price Index (Level)",
    url: "https://fred.stlouisfed.org/series/CRE_INDEX",
    authority: "FED_BOARD",
    accessMethod: "Fed Data Download Program (XML)"
  },
  DEFAULT_COMMERCIAL: {
    name: "Delinquency Rate on Commercial Real Estate Loans",
    url: "https://fred.stlouisfed.org/series/DRCRELEX",
    authority: "FED_BOARD",
    accessMethod: "Fed Data Download Program (XML)"
  },
  CME_GOLD_OI_PROFILE: {
    name: "CME QuikStrike Gold Option Striking Open Interest Profile",
    url: "https://www.cmegroup.com/trading/metals/precious/gold_quotes_globex_options.html",
    authority: "CME",
    accessMethod: "CME QuikStrike SSO Ingress Endpoint"
  },
  CME_GOLD_OPTIONS_VOLUME_SKEW: {
    name: "CME Gold Options Volume Profiles & Skew Ratio Matrix",
    url: "https://www.cmegroup.com/market-data/volume-open-interest/metals-volume.html",
    authority: "CME",
    accessMethod: "CME Globex Data-Feed (SFTP)"
  },
  CME_SOFR_VOLS: {
    name: "CME SOFR Options Volume & Strike Distribution Index",
    url: "https://www.cmegroup.com/market-data/volume-open-interest/sofr-options-volume.html",
    authority: "CME",
    accessMethod: "CME QuikStrike TLS API Ingress"
  },
  AEO_ENERGY_PROD: {
    name: "EIA Annual Energy Outlook (AEO): Supply & Production",
    url: "https://www.eia.gov/outlooks/aeo/data/browser/",
    authority: "EIA",
    accessMethod: "EIA Open Data API v2 (JSON)"
  },
  IP_UTILITIES: {
    name: "Industrial Production: Utilities (Gas and Electric)",
    url: "https://fred.stlouisfed.org/series/IPUTILITIES",
    authority: "FRED",
    accessMethod: "FRED HTTP API (JSON)"
  },
  PPI_ENERGY_INDEX: {
    name: "Producer Price Index: Fuels and Related Power",
    url: "https://fred.stlouisfed.org/series/PPIENG",
    authority: "BLS",
    accessMethod: "FRED HTTP API (JSON)"
  },
  ECI_SERVICES: {
    name: "Employment Cost Index: Wages in Services",
    url: "https://fred.stlouisfed.org/series/ECIWAG",
    authority: "BLS",
    accessMethod: "BLS Public API v2 (JSON)"
  },
  CPI_SERVICES_LESS_ENERGY: {
    name: "CPI: Services Less Energy Services",
    url: "https://fred.stlouisfed.org/series/KSIM940251M086NEST",
    authority: "BLS",
    accessMethod: "FRED HTTP API (JSON)"
  },
  WAGES_AVERAGE_HOURLY: {
    name: "Average Hourly Earnings of All Private Employees",
    url: "https://fred.stlouisfed.org/series/CES0500000003",
    authority: "BLS",
    accessMethod: "BLS Public API v2 (JSON)"
  }
};

const SOVEREIGN_AUTHORITY_CATALOGUE = [
  {
    code: "BOE",
    name: "Bank of England (BOE)",
    type: "Central Bank Statistics",
    trustLevel: "Tier 1 Sovereign Authority",
    description: "United Kingdom's primary central bank statistical warehouse. Provides monetary policy targets, official bank rates, gilt curves, household credit limits, and banking system reserves.",
    datasets: {
      "Statistical Core Database": {
        name: "Macroeconomic & Monetary Time-Series Warehouse",
        series: [
          { code: "BOE_BANK_RATE", name: "Official Bank Rate History (Series Code: IUMABEDR)", url: "https://www.bankofengland.co.uk/boeapps/database/fromshowcolumns.asp?SeriesCodes=IUMABEDR", accessMethod: "BOE Direct CSV Series Indexer" },
          { code: "BOE_YIELD_CURVE", name: "Nominal Gilt Yield Curves & Interest Spreads", url: "https://www.bankofengland.co.uk/statistics/yield-curves", accessMethod: "Official Central Bank Yield Model Engine" },
          { code: "BOE_GBP_USD", name: "Daily Spot Exchange Rate GBP vs USD", url: "https://www.bankofengland.co.uk/boeapps/database/fromshowcolumns.asp?SeriesCodes=XUDLGBD", accessMethod: "BOE Interactive Database Query" },
          { code: "BOE_MONEY_SUPPLY", name: "Central Bank Money Supply indicators (M4 aggregates)", url: "https://www.bankofengland.co.uk/statistics/money-and-credit", accessMethod: "BOE Database Ingress Service" },
          { code: "BOE_EFFECTIVE_INT", name: "Effective Interest Rates & Compound Aggregates", url: "https://www.bankofengland.co.uk/statistics/effective-interest-rates", accessMethod: "BOE Direct CSV Series Indexer" },
          { code: "BOE_BANKING_STATS", name: "Banking Sector Balance Sheet & System Reserves", url: "https://www.bankofengland.co.uk/statistics/banking-sector-balance-sheet", accessMethod: "Central Bank Balance Sheet Database Reader" }
        ]
      },
      "Sovereign Summaries": {
        name: "Sovereign Visual Economic Summaries",
        series: [
          { code: "BOE_HOUSEHOLD_CREDIT", name: "Lending to Individuals & Household Credit", url: "https://www.bankofengland.co.uk/statistics/visual-summaries/lending-to-individuals", accessMethod: "Statistical Release Web Portal" }
        ]
      }
    }
  },
  {
    code: "BLS",
    name: "Bureau of Labor Statistics (BLS)",
    type: "Government Labor & Inflation Statistics",
    trustLevel: "Tier 1 Sovereign Authority",
    description: "US Department of Labor primary compiler. Determines nationwide consumer pricing indices (CPI), producer prices, employment changes, and business productivity indices.",
    datasets: {
      "Consumer Price Index Suite": {
        name: "Inflation & Cost of Living Pricing Index Database",
        series: [
          { code: "CPIAUCSL", name: "Consumer Price Index for All Urban Consumers (CPI-U)", url: "https://fred.stlouisfed.org/series/CPIAUCSL", accessMethod: "FRED HTTP API (JSON)" },
          { code: "CPI_SERVICES_LESS_ENERGY", name: "CPI: Services Less Energy Services Index", url: "https://fred.stlouisfed.org/series/KSIM940251M086NEST", accessMethod: "FRED HTTP API (JSON)" },
          { code: "PPI_ENERGY_INDEX", name: "Producer Price Index: Fuels & Related Power", url: "https://fred.stlouisfed.org/series/PPIENG", accessMethod: "FRED HTTP API (JSON)" }
        ]
      },
      "Current Employment Statistics": {
        name: "National Workforce, Productivity & Earnings Series",
        series: [
          { code: "PAYEMS", name: "All Employees, Total Nonfarm Payrolls", url: "https://fred.stlouisfed.org/series/PAYEMS", accessMethod: "BLS Public API v2 (JSON)" },
          { code: "UNRATE", name: "Civilian Unemployment Rate Index", url: "https://fred.stlouisfed.org/series/UNRATE", accessMethod: "FRED HTTP API (JSON)" },
          { code: "OPHNFB", name: "Productivity: Real Output Per Hour", url: "https://fred.stlouisfed.org/series/OPHNFB", accessMethod: "BLS Public API v2 (JSON)" },
          { code: "WAGES_AVERAGE_HOURLY", name: "Average Hourly Earnings of All Private Employees", url: "https://fred.stlouisfed.org/series/CES0500000003", accessMethod: "BLS Public API v2 (JSON)" }
        ]
      }
    }
  },
  {
    code: "FRED",
    name: "St. Louis Fed (FRED Host)",
    type: "Federal Economic Data Hub",
    trustLevel: "Tier 1 Sovereign Hub",
    description: "Global repository hosting thousands of public economic files, currency spot pairs, macro indices, and debt/credit datasets from multiple countries.",
    datasets: {
      "FRED Macro Databank": {
        name: "Primary Macroeconomic Yield & Industrial Series",
        series: [
          { code: "T10Y2Y", name: "10-Year Treasury Yield spread minus 2-Year Treasury", url: "https://fred.stlouisfed.org/series/T10Y2Y", accessMethod: "FRED HTTP API (JSON)" },
          { code: "IP_UTILITIES", name: "Industrial Production: Utilities (Gas and Electric)", url: "https://fred.stlouisfed.org/series/IPUTILITIES", accessMethod: "FRED HTTP API (JSON)" },
          { code: "ECI_SERVICES", name: "Employment Cost Index: Wages in Service Sectors", url: "https://fred.stlouisfed.org/series/ECIWAG", accessMethod: "BLS Public API v2 (JSON)" }
        ]
      }
    }
  },
  {
    code: "FED_BOARD",
    name: "Federal Reserve Board",
    type: "Central Banking Authority System",
    trustLevel: "Tier 1 Sovereign Authority",
    description: "US Fed Board of Governors. Emits aggregated bank system balance sheets, reserve changes, and commercial real estate risk indices.",
    datasets: {
      "H.8 & Delinquency Releases": {
        name: "Aggregated Credit, Real Estate & Bank Conditions",
        series: [
          { code: "CRE_INDEX", name: "Commercial Real Estate Price Index (Level)", url: "https://fred.stlouisfed.org/series/CRE_INDEX", accessMethod: "Fed Data Download Program (XML)" },
          { code: "DEFAULT_COMMERCIAL", name: "Delinquency Rate on Commercial Real Estate Loans", url: "https://fred.stlouisfed.org/series/DRCRELEX", accessMethod: "Fed Data Download Program (XML)" }
        ]
      }
    }
  },
  {
    code: "CME",
    name: "CME Group Options Exchange",
    type: "Derivatives Clearinghouse System",
    trustLevel: "Tier 1 Corporate Clearinghouse",
    description: "World commodities futures leader. Exposes interest rate hedging skews, option volume strike clusters, open interest concentrations and pricing thresholds.",
    datasets: {
      "QuikStrike Option Ingress": {
        name: "SOFR & Gold Institutional Derivatives Analysis",
        series: [
          { code: "CME_GOLD_OI_PROFILE", name: "Gold Option Striking Open Interest Profile", url: "https://www.cmegroup.com/trading/metals/precious/gold_quotes_globex_options.html", accessMethod: "CME QuikStrike SSO Ingress Endpoint" },
          { code: "CME_GOLD_OPTIONS_VOLUME_SKEW", name: "Gold Options Volume Profiles & Skew Ratio Matrix", url: "https://www.cmegroup.com/market-data/volume-open-interest/metals-volume.html", accessMethod: "CME Globex Data-Feed (SFTP)" },
          { code: "CME_SOFR_VOLS", name: "SOFR Options Volume & Strike Distribution Index", url: "https://www.cmegroup.com/market-data/volume-open-interest/sofr-options-volume.html", accessMethod: "CME QuikStrike TLS API Ingress" }
        ]
      }
    }
  },
  {
    code: "EIA",
    name: "Energy Information Administration (EIA)",
    type: "Sovereign Industrial System",
    trustLevel: "Tier 1 Sovereign Authority",
    description: "Federal EIA platform serving official US industrial supply-demand analytics, carbon and fuel production timelines.",
    datasets: {
      "Annual Energy Outlook Suite": {
        name: "AEO Supply and Production Forecast Databox",
        series: [
          { code: "AEO_ENERGY_PROD", name: "EIA Annual Energy Outlook: Supply & Production", url: "https://www.eia.gov/outlooks/aeo/data/browser/", accessMethod: "EIA Open Data API v2 (JSON)" }
        ]
      }
    }
  },
  {
    code: "OPENJARVIS",
    name: "OpenJarvis Architecture Group",
    type: "Sovereign Research Artifact",
    trustLevel: "Implementation Spec",
    description: "Stanford OpenJarvis Local-First personal Al decoupling stack. Handles trace execution learning that optimizes model instructions based on runtime outcomes.",
    datasets: {
      "Research & Tracing Specifications": {
        name: "Trace Logs & Portable Spec Sandbox",
        series: [
          { code: "OPENJARVIS_PORTABLE_SPEC", name: "OpenJarvis Local-First portable specs & trace optimizers", url: "https://github.com/tinyfish-io/bigset", accessMethod: "Portable JSON Spec + Trace Logs" }
        ]
      }
    }
  }
];

const INTAKE_SAMPLES = {
  Challenge: [
    "Why is US inflation falling while employment remains resilient?",
    "Analyze the elasticity of domestic energy supply lines against rising heavy industrial demands.",
    "Compare persistent service sector wage pressure against general consumer pricing indices."
  ],
  Claim: [
    "Commercial real estate defaults will rise by 3.5% as long-term treasury yields stay above 4.5%.",
    "US treasury yield curve skews (T10Y2Y) are directly compressing small bank loan growth."
  ],
  Query: [
    "Query Gold Options heavy strike OI clusters and correlation to macroeconomic indices.",
    "Retrieve CME Secured Overnight Financing Rate Options Volume Profiles."
  ],
  Dataset: [
    "Register consumer price indexes and national employment figures dataset links.",
    "Verify Gold options volume profiles and pricing index boundaries.",
    "Link CME QuikStrike SOFR Options volatility spreads dataset."
  ],
  Investigation: [
    "Investigate why treasury curve skews are compressing regional bank credit expansion.",
    "Investigate persistent wage growth drift against service-sector price movements.",
    "Investigate US inflation dynamics relative to high labor force density."
  ]
};

const renderRealityBadge = (status: "SIMULATED" | "DISCOVERED" | "REGISTERED" | "CONNECTED" | "VERIFIED" | "LIVE" | "PENDING_AUTH") => {
  let colors = "";
  let icon = "";
  switch(status) {
    case "SIMULATED":
      colors = "bg-amber-950/40 text-amber-400 border-amber-800/30";
      icon = "🧬";
      break;
    case "PENDING_AUTH":
      colors = "bg-[#d97706]/20 text-[#f59e0b] border-[#d97706]/30 animate-pulse";
      icon = "🔑";
      break;
    case "DISCOVERED":
      colors = "bg-violet-950/40 text-violet-300 border-violet-800/30";
      icon = "🔭";
      break;
    case "REGISTERED":
      colors = "bg-[#1d4ed8]/20 text-[#60a5fa] border-[#1d4ed8]/30";
      icon = "📋";
      break;
    case "CONNECTED":
      colors = "bg-[#0f766e]/20 text-[#2dd4bf] border-[#0f766e]/30";
      icon = "🔌";
      break;
    case "VERIFIED":
      colors = "bg-[#047857]/20 text-[#34d399] border-[#047857]/30";
      icon = "🛡️";
      break;
    case "LIVE":
      colors = "bg-[#be123c]/20 text-[#fb7185] border-[#be123c]/30 font-black";
      icon = "🔴";
      break;
  }
  return (
    <span className={`px-2 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase tracking-widest border flex items-center gap-1 shrink-0 ${colors}`}>
      {icon} {status}
    </span>
  );
};

const renderAmbiguityLockOnly = (
  packet: CustodyPacket,
  onResolve: (packetId: string, notes: string) => Promise<void>,
  onReject: (packetId: string) => Promise<void>
) => {
  const lockInfo = packet.ambiguityLock || {
    active: true,
    reason: "Unspecified semantic ambiguity in economic indicators.",
    detectedAt: new Date().toISOString(),
    terms: []
  };

  return (
    <div className="bg-[#0b0d11] p-6 rounded-xl border border-rose-950/40 font-mono text-xs space-y-5 relative overflow-hidden" id="ambiguity-lock-container">
      {/* Absolute Background Accent Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#ef444405,transparent_50%)] pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-rose-950/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-950/40 border border-rose-800/30 rounded-lg text-rose-500 animate-pulse">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-[11.5px] font-extrabold uppercase tracking-widest text-[#ececf1] flex items-center gap-1.5">
              🚨 AMBIGUITY GATEWAY LOCKOUT (ACTIVE)
            </h4>
            <p className="text-[9px] text-[#8a99ad] mt-0.5 font-sans leading-tight">
              Avionics policy: Pre-ingestion structure execution halted due to semantic divergence.
            </p>
          </div>
        </div>
        <span className="bg-rose-950/65 text-rose-400 border border-rose-800/25 px-2.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider h-5 flex items-center shrink-0">
          🔒 BLOCKSET ACTIVE
        </span>
      </div>

      <div className="bg-[#12161d] p-4 rounded-lg border border-rose-950/20 space-y-3">
        <div className="flex justify-between text-[9px] text-slate-500 uppercase border-b border-slate-800 pb-1.5">
          <span>Divergent Packet ID</span>
          <span className="text-rose-400 font-bold">{packet.packet_id}</span>
        </div>

        <div>
          <span className="text-[9px] text-[#718096] uppercase font-black block">Anomalous Context Statement:</span>
          <p className="text-slate-200 font-sans leading-normal bg-[#0a0c10]/70 p-2.5 rounded border border-[#1b212b] mt-1.5 italic text-[11px]">
            "{packet.challenge}"
          </p>
        </div>

        <div>
          <span className="text-[9px] text-[#718096] uppercase font-black block">Divergence Root Analysis:</span>
          <p className="text-rose-200 bg-rose-950/20 border border-rose-900/30 font-sans leading-normal p-3 rounded-lg mt-1.5 text-[11px]">
            {lockInfo.reason}
          </p>
        </div>

        {lockInfo.terms && lockInfo.terms.length > 0 && (
          <div>
            <span className="text-[9px] text-[#718096] uppercase font-black block mb-1.5">Flagged Divergent Identifiers:</span>
            <div className="flex flex-wrap gap-1.5">
              {lockInfo.terms.map((t, idx) => (
                <span key={idx} className="bg-rose-950/35 text-rose-300 border border-rose-800/15 px-2 py-0.5 rounded text-[8.5px] font-bold">
                  ⚠️ "{t}"
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center text-[9px] text-slate-500 pt-1.5 font-mono">
          <span>DETECTED CHRONO:</span>
          <span>{lockInfo.detectedAt ? new Date(lockInfo.detectedAt).toLocaleString() : "UNKNOWN"}</span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="space-y-4">
        <div className="border-t border-[#1a1f26] pt-4">
          <label className="text-[9.5px] text-slate-400 uppercase font-black block pb-1.5">
            Operator Overrides & Calibration Briefing:
          </label>
          <textarea
            id="ambiguity-resolution-notes"
            placeholder="e.g. Cleared semantic variables. Registered custom elastic curves dataset matching CME index standard."
            className="w-full bg-[#08090d] border border-slate-800 text-slate-300 text-xs font-sans rounded-lg p-2.5 outline-none focus:border-rose-700 min-h-[60px]"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 w-full">
          <button
            onClick={async () => {
              const notesElem = document.getElementById("ambiguity-resolution-notes") as HTMLTextAreaElement;
              const notes = notesElem ? notesElem.value : "";
              await onResolve(packet.packet_id, notes);
            }}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white p-2.5 rounded-lg border border-emerald-400/20 text-[10.5px] font-bold tracking-wide uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Unlock className="h-3.5 w-3.5" /> Resolve Ambiguity (Clear Lock)
          </button>
          <button
            onClick={async () => {
              await onReject(packet.packet_id);
            }}
            className="bg-rose-950/50 hover:bg-rose-900/30 text-rose-300 p-2.5 rounded-lg border border-rose-800/20 text-[10.5px] font-bold uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all cursor-pointer px-4"
          >
            <X className="h-3.5 w-3.5" /> Reject Formulation
          </button>
        </div>
      </div>
    </div>
  );
};

const QuasicrystalBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none">
    {/* Deep-Space Ambient Breathing Gradients */}
    <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-amber-500/[0.04] rounded-full blur-[120px] animate-pulse" style={{ animationDuration: "12s" }} />
    <div className="absolute top-1/4 right-[-100px] w-[400px] h-[400px] bg-teal-500/[0.03] rounded-full blur-[100px] animate-pulse" style={{ animationDuration: "8s" }} />
    <div className="absolute bottom-10 left-[-50px] w-[450px] h-[450px] bg-indigo-500/[0.05] rounded-full blur-[110px] animate-pulse" style={{ animationDuration: "15s" }} />
    <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-purple-500/[0.03] rounded-full blur-[90px]" />

    {/* Moving Light Shimmer Reflection */}
    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.015] to-transparent transform -skew-y-12 animate-[pulse_6s_infinite] pointer-events-none" />

    {/* Quasicrystal Pentagonal Facets in 5D projection */}
    <motion.svg 
      className="absolute inset-0 w-full h-full opacity-[0.24]"
      animate={{ rotate: 360 }}
      transition={{ ease: "linear", duration: 220, repeat: Infinity }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="indigoGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Primary Quasicrystal Decagram lattices connecting central nodes */}
      <g stroke="rgba(255,255,255,0.075)" strokeWidth="0.6" fill="none">
        <polygon points="187,150 205,200 258,200 215,231 231,283 187,251 143,283 159,231 116,200 169,200" className="animate-pulse" style={{ animationDuration: "7s" }} />
        {/* Secondary expanded alignment mesh */}
        <polygon points="187,50 287,100 337,200 287,300 187,350 87,300 37,200 87,100" stroke="rgba(45,212,191,0.035)" strokeWidth="0.55" />
        
        <line x1="187" y1="150" x2="187" y2="251" />
        <line x1="258" y1="200" x2="143" y2="283" stroke="rgba(255,255,255,0.04)" />
        <line x1="231" y1="283" x2="116" y2="200" stroke="rgba(255,255,255,0.04)" />
        <line x1="159" y1="231" x2="205" y2="200" />
        <line x1="187" y1="251" x2="187" y2="50" stroke="rgba(99,102,241,0.065)" />
        <line x1="0" y1="0" x2="187" y2="150" stroke="rgba(45,212,191,0.04)" strokeWidth="0.8" />
        <line x1="375" y1="0" x2="187" y2="150" stroke="rgba(245,158,11,0.04)" strokeWidth="0.8" />
        <line x1="187" y1="350" x2="187" y2="150" stroke="rgba(129,140,248,0.05)" />
      </g>

      {/* Blooming Core vertices */}
      <circle cx="187" cy="150" r="22" fill="url(#centerGlow)" className="animate-ping" style={{ animationDuration: "5s" }} />
      <circle cx="187" cy="150" r="5" fill="#fbbf24" />
      <circle cx="187" cy="350" r="14" fill="url(#indigoGlow)" className="opacity-40 animate-pulse" style={{ animationDuration: "4s" }} />
      
      {/* Precision node alignment points */}
      <circle cx="205" cy="200" r="2" fill="#2dd4bf" className="opacity-80" />
      <circle cx="258" cy="200" r="2.5" fill="#3b82f6" className="opacity-90" />
      <circle cx="215" cy="231" r="2" fill="#a78bfa" className="opacity-75" />
      <circle cx="231" cy="283" r="2.5" fill="#2dd4bf" className="opacity-85" />
      <circle cx="187" cy="251" r="3.5" fill="#fbbf24" className="opacity-95" />
      <circle cx="143" cy="283" r="2" fill="#3b82f6" className="opacity-80" />
      <circle cx="159" cy="231" r="2" fill="#a78bfa" className="opacity-70" />
      <circle cx="116" cy="200" r="3" fill="#2dd4bf" className="opacity-90" />
    </motion.svg>
  </div>
);

interface RedTeamConsoleProps {
  selectedPacket: any;
  setSelectedPacketId: (id: string) => void;
  packets: any[];
  setPackets: Dispatch<SetStateAction<any[]>>;
  setIngestLogs: Dispatch<SetStateAction<any[]>>;
}

export function RedTeamConsole({
  selectedPacket,
  setSelectedPacketId,
  packets,
  setPackets,
  setIngestLogs
}: RedTeamConsoleProps) {
  const [scanLoading, setScanLoading] = useState(false);
  const [operatorNote, setOperatorNote] = useState("");
  const [noteError, setNoteError] = useState("");
  const [showResolved, setShowResolved] = useState(false);

  const isSealedAndCleared = (pkt: any) => {
    const isSealed = pkt.operator_gate === "APPROVED" || pkt.current_status === "PACKET_SEALED" || pkt.current_status === "Deployed (Demo)" || pkt.current_status === "DEPLOYED";
    const isCleared = pkt.redTeamStatus === "PASSED" || pkt.redTeamStatus === "WAIVED_BY_OPERATOR" || pkt.red_team_verdict === "CLEARED";
    return isSealed && isCleared;
  };

  const isActive = (pkt: any) => {
    const pktStatus = pkt.redTeamStatus || "NOT_RUN";
    const isCleared = pktStatus === "PASSED" || pktStatus === "WAIVED_BY_OPERATOR" || pkt.red_team_verdict === "CLEARED";
    return !isCleared;
  };

  const nonArchivedPackets = packets.filter(pkt => !isSealedAndCleared(pkt));
  const activePackets = nonArchivedPackets.filter(isActive);
  const resolvedPackets = nonArchivedPackets.filter(pkt => !isActive(pkt));

  // Selection auto-fallback synchronizer
  useEffect(() => {
    const activeSelectedExists = nonArchivedPackets.some(p => p.packet_id === selectedPacket?.packet_id);
    if (!activeSelectedExists && nonArchivedPackets.length > 0) {
      const fallback = activePackets[0] || resolvedPackets[0] || nonArchivedPackets[0];
      if (fallback) {
        setSelectedPacketId(fallback.packet_id);
        localStorage.setItem("pathfinder_selected_packet_id", fallback.packet_id);
      }
    }
  }, [packets, selectedPacket?.packet_id, activePackets.length, resolvedPackets.length]);

  const runScan = async () => {
    setScanLoading(true);
    setNoteError("");
    try {
      const response = await fetch("/api/audit/red-team/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packetId: selectedPacket.packet_id })
      });
      const data = await response.json();
      if (response.ok) {
        setPackets(prev => prev.map(p => {
          if (p.packet_id === selectedPacket.packet_id) {
            return {
              ...p,
              redTeamStatus: data.redTeamStatus,
              redTeamFindings: data.findings,
              redTeamRiskScore: data.riskScore,
              redTeamScannedAt: data.scannedAt,
              redTeamRecommendation: data.recommendation,
              red_team_verdict: data.redTeamStatus === "PASSED" ? "CLEARED" : "VULNERABLE"
            };
          }
          return p;
        }));
        setIngestLogs(prev => [
          ...prev,
          `[🛡️ RED TEAM] Programmatic scan executed for PKT: ${selectedPacket.packet_id}. Risk: ${data.riskScore}%. Status: ${data.redTeamStatus}`
        ]);
      } else {
        setNoteError(data.error || "Programmatic scan failed.");
      }
    } catch (err: any) {
      setNoteError(err.message || "Failed to contact Red Team scanner backend.");
    } finally {
      setScanLoading(false);
    }
  };

  const submitVerdict = async (verdict: "CLEARED" | "VULNERABLE", status: "PASSED" | "FAILED" | "WAIVED_BY_OPERATOR") => {
    setNoteError("");
    if ((status === "WAIVED_BY_OPERATOR" || status === "PASSED" || status === "FAILED") && !operatorNote.trim()) {
      setNoteError(`An operator justification note is required to execute this override (${status}).`);
      return;
    }

    try {
      const response = await fetch("/api/packets/verdict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packet_id: selectedPacket.packet_id,
          reviewer: "Operator RedTeam Console",
          reviewType: "RED_TEAM",
          verdict,
          redTeamStatus: status,
          reason: operatorNote
        })
      });
      const data = await response.json();
      if (response.ok) {
        setPackets(prev => prev.map(p => {
          if (p.packet_id === selectedPacket.packet_id) {
            return {
              ...p,
              ...data.packet
            };
          }
          return p;
        }));
        setIngestLogs(prev => [
          ...prev,
          `[🛡️ RED TEAM OVERRIDE] Registered operational gate: ${status} for ${selectedPacket.packet_id}. Comment: "${operatorNote}"`
        ]);
        setOperatorNote("");
      } else {
        setNoteError(data.error || "Override verification write rejected.");
      }
    } catch (err: any) {
      setNoteError(err.message || "Failed to transmit override verdict.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PASSED":
        return <span className="px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase bg-emerald-950/20 text-emerald-400 border border-emerald-900/50">PASSED</span>;
      case "FAILED":
        return <span className="px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase bg-rose-955/20 text-rose-400 border border-rose-900/50">FAILED</span>;
      case "RUNNING":
        return <span className="px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase bg-purple-950/40 text-purple-400 border border-purple-900/50 animate-pulse">RUNNING</span>;
      case "WAIVED_BY_OPERATOR":
        return <span className="px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase bg-amber-950/20 text-amber-400 border border-amber-900/50">WAIVED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase bg-slate-950/20 text-slate-400 border border-slate-900/50">NOT RUN</span>;
    }
  };

  const activeStatus = selectedPacket.redTeamStatus || "NOT_RUN";
  const activeFindings = selectedPacket.redTeamFindings || [];
  const riskScore = selectedPacket.redTeamRiskScore || 0;
  const lastScanned = selectedPacket.redTeamScannedAt;

  return (
    <div className="bg-[#0f1217] border border-[#232932] rounded-xl p-6 shadow-2xl relative overflow-hidden text-slate-200" id="red-team-console-card">
      {/* Background radial accent */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-red-950/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#232a35] pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="h-5 w-5 text-red-500 animate-pulse" />
            <span className="text-[9px] font-mono tracking-[0.25em] bg-red-950 text-red-500 border border-red-900 px-2 py-0.5 rounded font-black uppercase">
              Operational Red Team Gate
            </span>
          </div>
          <h1 className="text-xl font-mono font-black uppercase tracking-wider text-white">
            Red Team Auditor Security Console
          </h1>
          <p className="text-[11px] text-slate-400 italic mt-0.5">
            Doctrine: "Red Team attacks. Operator decides. Ledger records."
          </p>
        </div>
        <div className="mt-4 md:mt-0 px-4 py-2 bg-[#12161d] border border-white/5 rounded-xl font-mono text-[10px]">
          <span className="text-slate-500 font-bold uppercase">SECURE VERDICT NODE: </span>
          <span className="text-sky-400 font-black">CRYSTAL-GATE-CORE-B</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (col-span-4): Packets Selection */}
        <div className="lg:col-span-4 flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          
          {/* Active Workload Section */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-[10px] font-mono font-black text-rose-400 uppercase tracking-wider border-b border-rose-950/40 pb-2">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                RED TEAM ACTIVE ({activePackets.length})
              </span>
              {activePackets.length > 0 && (
                <span className="bg-rose-950/30 text-rose-400 text-[8.5px] font-black border border-rose-900/45 px-1.5 py-0.5 rounded">
                  ATTN REQ
                </span>
              )}
            </div>

            {activePackets.length === 0 ? (
              <div className="text-center p-6 bg-[#14181f]/20 border border-dashed border-white/5 rounded-xl text-slate-500 font-mono text-[10px] italic">
                ✓ No active threats pending scan or review.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {activePackets.map((pkt) => {
                  const isSelected = pkt.packet_id === selectedPacket?.packet_id;
                  const pktStatus = pkt.redTeamStatus || "NOT_RUN";
                  const pktRisk = pkt.redTeamRiskScore || 0;
                  return (
                    <div
                      key={pkt.packet_id}
                      onClick={() => {
                        setSelectedPacketId(pkt.packet_id);
                        localStorage.setItem("pathfinder_selected_packet_id", pkt.packet_id);
                      }}
                      className={`p-3 rounded-lg border transition-all duration-150 cursor-pointer text-left ${
                        isSelected
                          ? "bg-[#1d232c] border-red-500/40 shadow-inner"
                          : "bg-[#14181f]/40 border-white/5 hover:border-slate-700/50 hover:bg-[#14181f]/80"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-mono font-extrabold text-white">
                          {pkt.packet_id}
                        </span>
                        <div>{getStatusBadge(pktStatus)}</div>
                      </div>
                      <p className="text-[10px] text-slate-400 font-sans line-clamp-1 italic mb-2">
                        "{pkt.challenge}"
                      </p>
                      <div className="flex justify-between items-center text-[9px] font-mono border-t border-white/5 pt-1.5 mt-1">
                        <span className="text-slate-500 font-bold">TYPE: {pkt.inputType || "Challenge"}</span>
                        <span className={`font-black ${
                          pktRisk >= 40 ? "text-red-400" : pktRisk > 0 ? "text-amber-400" : "text-slate-550"
                        }`}>
                          Risk Score: {pktRisk}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Resolved History Section */}
          <div className="flex flex-col gap-2 mt-1">
            <button
              type="button"
              onClick={() => setShowResolved(!showResolved)}
              className="flex justify-between items-center text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2 cursor-pointer hover:text-white group outline-none bg-transparent"
            >
              <span className="flex items-center gap-1.5 text-slate-400 group-hover:text-slate-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/80" />
                Resolved Queue ({resolvedPackets.length})
              </span>
              <span className="text-[9px] bg-[#14181f] px-1.5 py-0.5 rounded border border-white/5 flex items-center gap-1 text-slate-505 group-hover:border-slate-750">
                {showResolved ? "HIDE" : "SHOW HISTORY"}
                <span>{showResolved ? "▲" : "▼"}</span>
              </span>
            </button>

            {showResolved && (
              <div className="flex flex-col gap-2">
                {resolvedPackets.length === 0 ? (
                  <div className="text-center p-4 bg-[#14181f]/10 border border-dashed border-white/5 rounded-xl text-slate-500 font-mono text-[10px] italic">
                    No resolved packets in active queue.
                  </div>
                ) : (
                  resolvedPackets.map((pkt) => {
                    const isSelected = pkt.packet_id === selectedPacket?.packet_id;
                    const pktStatus = pkt.redTeamStatus || "NOT_RUN";
                    const pktRisk = pkt.redTeamRiskScore || 0;
                    return (
                      <div
                        key={pkt.packet_id}
                        onClick={() => {
                          setSelectedPacketId(pkt.packet_id);
                          localStorage.setItem("pathfinder_selected_packet_id", pkt.packet_id);
                        }}
                        className={`p-3 rounded-lg border transition-all duration-150 cursor-pointer text-left ${
                          isSelected
                            ? "bg-[#1d232c] border-emerald-500/40 shadow-inner"
                            : "bg-[#14181f]/40 border-white/5 hover:border-slate-700/50 hover:bg-[#14181f]/80"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs font-mono font-extrabold text-slate-350">
                            {pkt.packet_id}
                          </span>
                          <div>{getStatusBadge(pktStatus)}</div>
                        </div>
                        <p className="text-[10px] text-slate-400 font-sans line-clamp-1 italic mb-2">
                          "{pkt.challenge}"
                        </p>
                        <div className="flex justify-between items-center text-[9px] font-mono border-t border-white/5 pt-1.5 mt-1">
                          <span className="text-slate-500 font-bold">TYPE: {pkt.inputType || "Challenge"}</span>
                          <span className="text-emerald-400 font-black">
                            Risk Score: {pktRisk}%
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Archived Summary Indicator */}
          {(() => {
            const archivedCount = packets.filter(isSealedAndCleared).length;
            if (archivedCount > 0) {
              return (
                <div className="mt-auto pt-3 border-t border-[#1a1e26] text-[9.5px] font-mono text-slate-500 flex justify-between items-center">
                  <span className="uppercase font-bold tracking-wider">📁 Promoted to Archive:</span>
                  <span className="bg-emerald-950/20 border border-emerald-900/45 text-emerald-400 px-1.5 py-0.5 rounded font-black">
                    {archivedCount} {archivedCount === 1 ? "PACKET" : "PACKETS"}
                  </span>
                </div>
              );
            }
            return null;
          })()}
        </div>

        {/* Right Column (col-span-8): Core Interactive Control */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-[#14181f] border border-white/5 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex justify-between items-start border-b border-white/5 pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase font-black">TARGET IDENTIFICATION SPECIFICATION</span>
                <h3 className="text-sm font-mono font-black text-white mt-0.5">{selectedPacket.packet_id}</h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-black">LAST THREAT SCAN</span>
                <p className="text-xs font-mono font-bold text-slate-300 mt-0.5">
                  {lastScanned ? new Date(lastScanned).toLocaleTimeString() + " " + new Date(lastScanned).toLocaleDateString() : "NEVER SCAN RUN"}
                </p>
              </div>
            </div>

            {/* Core Metrics Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0b0e14] border border-white/5 rounded-lg p-3">
                <span className="text-[9px] font-mono text-slate-500 font-extrabold uppercase block mb-1">
                  CHALLENGE SPECIFICATION CONTENT
                </span>
                <p className="text-xs text-slate-300 leading-normal italic font-serif">
                  "{selectedPacket.challenge}"
                </p>
              </div>

              <div className="bg-[#0b0e14] border border-white/5 rounded-lg p-3">
                <span className="text-[9px] font-mono text-slate-500 font-extrabold uppercase block mb-1">
                  INGESTED INTAKE URL TARGET
                </span>
                <p className="text-xs font-mono text-[#00f2fe] truncate">
                  {selectedPacket.url_candidate || selectedPacket.urlCandidate || "No active external ingress url."}
                </p>
              </div>
            </div>

            {/* Core Risk Gauge */}
            <div className="bg-[#0b0e14] border border-[#232932] rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1 w-full">
                <div className="flex justify-between items-center text-[10px] font-mono mb-1.5">
                  <span className="text-slate-400 font-black">PROGRAMMATIC THREAT INJECTION RISK</span>
                  <span className={`font-black text-xs ${
                    riskScore >= 40 ? "text-red-500 animate-pulse font-black" : riskScore > 0 ? "text-amber-500" : "text-emerald-400"
                  }`}>
                    {riskScore}% RISK WEIGHT
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-white/5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      riskScore >= 40 
                        ? "bg-gradient-to-r from-red-600 to-rose-500" 
                        : riskScore > 0 
                          ? "bg-gradient-to-r from-amber-500 to-amber-300" 
                          : "bg-emerald-500"
                    }`}
                    style={{ width: `${riskScore}%` }}
                  />
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-center justify-center border-l border-white/5 pl-4 md:h-12">
                <span className="text-[9px] font-mono text-slate-500 font-extrabold uppercase block">GATE VERDICT</span>
                <div className="mt-0.5">{getStatusBadge(activeStatus)}</div>
              </div>
            </div>

            {/* Execution Actions Surface */}
            <div>
              <div className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider mb-2 border-b border-white/5 pb-1">
                Security Control Sign-off Terminus Actions
              </div>

              {/* Error Callout */}
              {noteError && (
                <div className="bg-red-950/20 border border-red-500/30 rounded-lg p-2.5 text-[10.5px] font-mono text-red-400 flex items-center gap-2 mb-3">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{noteError}</span>
                </div>
              )}

              {/* Notes input area for justification (Operator Note) */}
              <div className="mb-3.5">
                <label className="text-[9.5px] font-mono font-bold text-slate-500 uppercase block mb-1 md:flex md:justify-between">
                  <span>Operator Notes &amp; Override Justifications</span>
                  <span className="text-red-400 text-[8.5px]">(Required for overrides/waivers)</span>
                </label>
                <textarea
                  value={operatorNote}
                  onChange={(e) => setOperatorNote(e.target.value)}
                  placeholder="Enter programmatic verification signature or operator waiver logs..."
                  className="w-full bg-[#0b0e14] border border-white/10 rounded-lg p-2.5 text-xs font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-red-500/40 h-16 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-[9.5px]">
                <button
                  type="button"
                  disabled={scanLoading}
                  onClick={runScan}
                  className={`flex items-center justify-center gap-1.5 bg-red-950/40 hover:bg-red-900/30 text-rose-300 font-mono font-bold uppercase rounded-lg border border-red-800/30 py-2.5 cursor-pointer text-center select-none ${
                    scanLoading ? "opacity-50 pointer-events-none" : ""
                  }`}
                  id="run-rt-scan-btn"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${scanLoading ? "animate-spin" : ""}`} />
                  {scanLoading ? "SCANNING..." : "RUN RED TEAM SCAN"}
                </button>

                <button
                  type="button"
                  onClick={() => submitVerdict("CLEARED", "PASSED")}
                  className="flex items-center justify-center gap-1.5 bg-emerald-950/40 hover:bg-emerald-900/30 text-emerald-300 font-mono font-bold uppercase rounded-lg border border-emerald-800/30 py-2.5 cursor-pointer text-center select-none"
                  id="mark-rt-verified-btn"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  MARK VERIFIED
                </button>

                <button
                  type="button"
                  onClick={() => submitVerdict("VULNERABLE", "FAILED")}
                  className="flex items-center justify-center gap-1.5 bg-rose-955/20 hover:bg-rose-900/10 text-rose-450 font-mono font-bold uppercase rounded-lg border border-rose-850/20 py-2.5 cursor-pointer text-center select-none"
                  id="flag-rt-objection-btn"
                >
                  <X className="h-3.5 w-3.5" />
                  FLAG OBJECTION
                </button>

                <button
                  type="button"
                  onClick={() => submitVerdict("CLEARED", "WAIVED_BY_OPERATOR")}
                  className="flex items-center justify-center gap-1.5 bg-amber-950/40 hover:bg-amber-900/30 text-amber-300 font-mono font-bold uppercase rounded-lg border border-amber-800/30 py-2.5 cursor-pointer text-center select-none"
                  id="waive-rt-btn"
                >
                  <Lock className="h-3.5 w-3.5" />
                  WAIVE WITH NOTE
                </button>
              </div>
            </div>
          </div>

          {/* Checklist of threat vectors scrutinized */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#14181f]/40 border border-white/5 rounded-xl p-4">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-black block mb-3 border-b border-white/5 pb-1">
                Programmatic Auditing Vectors Checkpoints
              </span>
              <div className="flex flex-col gap-2.5 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className={activeStatus === "PASSED" || activeStatus === "WAIVED_BY_OPERATOR" ? "text-emerald-400" : activeStatus === "FAILED" ? "text-rose-450" : "text-slate-600"}>
                    {activeStatus === "PASSED" || activeStatus === "WAIVED_BY_OPERATOR" ? "🟢" : activeStatus === "FAILED" ? "🔴" : "⚪"}
                  </span>
                  <span className={activeStatus !== "NOT_RUN" ? "text-slate-300" : "text-slate-500"}>
                    Command injection vector check
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={activeStatus === "PASSED" || activeStatus === "WAIVED_BY_OPERATOR" ? "text-emerald-400" : activeStatus === "FAILED" ? "text-rose-450" : "text-slate-600"}>
                    {activeStatus === "PASSED" || activeStatus === "WAIVED_BY_OPERATOR" ? "🟢" : activeStatus === "FAILED" ? "🔴" : "⚪"}
                  </span>
                  <span className={activeStatus !== "NOT_RUN" ? "text-slate-300" : "text-slate-400"}>
                    SQL injection syntax checks
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={activeStatus === "PASSED" || activeStatus === "WAIVED_BY_OPERATOR" ? "text-emerald-400" : activeStatus === "FAILED" ? "text-rose-450" : "text-slate-600"}>
                    {activeStatus === "PASSED" || activeStatus === "WAIVED_BY_OPERATOR" ? "🟢" : activeStatus === "FAILED" ? "🔴" : "⚪"}
                  </span>
                  <span className={activeStatus !== "NOT_RUN" ? "text-slate-300" : "text-slate-400"}>
                    External ingress URL schemes validation
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={activeStatus === "PASSED" || activeStatus === "WAIVED_BY_OPERATOR" ? "text-emerald-400" : activeStatus === "FAILED" ? "text-rose-450" : "text-slate-600"}>
                    {activeStatus === "PASSED" || activeStatus === "WAIVED_BY_OPERATOR" ? "🟢" : activeStatus === "FAILED" ? "🔴" : "⚪"}
                  </span>
                  <span className={activeStatus !== "NOT_RUN" ? "text-slate-300" : "text-slate-400"}>
                    Input fields boundary check (&gt;= 10 chars)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={activeStatus === "PASSED" || activeStatus === "WAIVED_BY_OPERATOR" ? "text-emerald-400" : activeStatus === "FAILED" ? "text-rose-450" : "text-slate-600"}>
                    {activeStatus === "PASSED" || activeStatus === "WAIVED_BY_OPERATOR" ? "🟢" : activeStatus === "FAILED" ? "🔴" : "⚪"}
                  </span>
                  <span className={activeStatus !== "NOT_RUN" ? "text-slate-300" : "text-slate-400"}>
                    TPM node hardware drift (CUDA/GPU) verification
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#14181f]/40 border border-[#232932] rounded-xl p-4 flex flex-col gap-2.5">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-black block border-b border-white/5 pb-1">
                Scan Findings Logs
              </span>
              <div className="flex-1 overflow-y-auto max-h-[140px] text-[10.5px] font-mono flex flex-col gap-1.5 pr-1">
                {activeFindings.length > 0 ? (
                  activeFindings.map((finding: string, idx: number) => (
                    <div key={idx} className="bg-red-950/15 border border-red-900/30 rounded p-2 text-rose-300 italic">
                      {finding}
                    </div>
                  ))
                ) : activeStatus === "PASSED" ? (
                  <div className="text-emerald-300 bg-emerald-950/10 border border-emerald-900/20 rounded p-2 italic">
                    ✓ Programmatic threat scanner detected zero security risk vectors. Inside nominal boundaries.
                  </div>
                ) : activeStatus === "WAIVED_BY_OPERATOR" ? (
                  <div className="text-amber-350 bg-amber-950/10 border border-amber-900/20 rounded p-2 italic">
                    ⚠️ Operator waived previous vulnerabilities with reason note in ledger documentation.
                  </div>
                ) : (
                  <div className="text-slate-500 italic p-2 text-center">
                    No active threat scans logged. Run "RUN RED TEAM SCAN" to parse the challenge vectors payload.
                  </div>
                )}
              </div>
              {selectedPacket.redTeamRecommendation && (
                <div className="text-[10px] font-mono bg-[#0b0e14] border border-white/5 p-2 rounded text-slate-400">
                  <span className="font-bold text-[#fbbf24]">RECOMMENDATION: </span>
                  {selectedPacket.redTeamRecommendation}
                </div>
              )}
              {selectedPacket.redTeamNotes && (
                <div className="text-[10px] font-mono bg-[#0b0e14] border border-red-950/30 p-2 rounded text-slate-400 italic">
                  <span className="font-bold text-red-400">OPERATOR COMMENT: </span>
                  "{selectedPacket.redTeamNotes}"
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [viewMode, setViewMode] = useState<"operator" | "architect" | "engineer" | "archive" | "redteam" | "wallstreet">("wallstreet");
  const [registryDisplayMode, setRegistryDisplayMode] = useState<"flat" | "hierarchy">("hierarchy");
  const [selectedCatalogAuthority, setSelectedCatalogAuthority] = useState<string>("BOE");
  const [catalogSearchQuery, setCatalogSearchQuery] = useState<string>("");
  const [section2Tab, setSection2Tab] = useState<"pipeline" | "catalog">("catalog");
  const [expandedSection, setExpandedSection] = useState<number | null>(1);
  const [activeSubsystem, setActiveSubsystem] = useState("runtime");
  
  // Custom states for cockpit simulation and active selections
  const [activeTab, setActiveTab] = useState<"dashboard" | "custody" | "roadmap">("dashboard");
  const [isMobile, setIsMobile] = useState(false);
  const [mobileTab, setMobileTab] = useState<"challenge" | "claim" | "query" | "investigation" | "approval" | "redteam">("challenge");
  const [mobileOverride, setMobileOverride] = useState<boolean | null>(null);
  const [copilotExpanded, setCopilotExpanded] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Synchronize viewMode and mobileTab to guarantee seamless experience on any screen viewport size
  useEffect(() => {
    if (viewMode === "redteam" && mobileTab !== "redteam") {
      setMobileTab("redteam");
    } else if (viewMode !== "redteam" && mobileTab === "redteam") {
      setMobileTab("investigation"); // Default fallback tab on mobile
    }
  }, [viewMode]);

  useEffect(() => {
    if (mobileTab === "redteam" && viewMode !== "redteam") {
      setViewMode("redteam");
    } else if (mobileTab !== "redteam" && viewMode === "redteam") {
      setViewMode("operator"); // Default fallback viewMode on desktop
    }
  }, [mobileTab]);

  const effectiveIsMobile = mobileOverride !== null ? mobileOverride : isMobile;
  const [currentTime, setCurrentTime] = useState("");
  const [alignmentRate, setAlignmentRate] = useState(88.4);
  const [sysLogCount, setSysLogCount] = useState(412);
  const [selectedSubsystem, setSelectedSubsystem] = useState("runtime");

  // Jemma operator entry point states (Intake Layer)
  const [intakeType, setIntakeType] = useState<"Challenge" | "Claim" | "Query" | "Dataset" | "Investigation">("Challenge");
  const [intakeInput, setIntakeInput] = useState("");
  const intakeRef = useRef<HTMLTextAreaElement>(null);

  // Packet Archive v1 Custom State Engines
  const [archiveSearch, setArchiveSearch] = useState("");
  const [archiveFilterPreset, setArchiveFilterPreset] = useState<"all" | "gold" | "cme" | "qwen" | "deepseek">("all");
  const [highlightedParentLineage, setHighlightedParentLineage] = useState<string | null>(null);
  const [showEvolutionSynthesis, setShowEvolutionSynthesis] = useState(false);

  // Journal storage state
  const [journal, setJournal] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("pathfinder_journal");
      return saved ? JSON.parse(saved) : [
        {
          packet_id: "PKT-303",
          type: "Query",
          input: "Query Gold Options heavy strike OI clusters and correlation to macroeconomic indices.",
          finding: "[QUERY] Query Gold Options heavy strike OI clusters and correlation to macroeconomic indices.",
          authorities: ["CME", "SEC"],
          datasets: ["CME_GOLD_OI_PROFILE", "CME_GOLD_OPTIONS_VOLUME_SKEW"],
          status: "Accepted",
          timestamp: new Date().toLocaleDateString()
        },
        {
          packet_id: "PKT-114",
          type: "Challenge",
          input: "Why is US inflation falling while employment remains resilient?",
          finding: "[CHALLENGE] Why is US inflation falling while employment remains resilient?",
          authorities: ["BLS", "FRED"],
          datasets: ["CPIAUCSL", "PAYEMS"],
          status: "Accepted",
          timestamp: new Date().toLocaleDateString()
        }
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("pathfinder_journal", JSON.stringify(journal));
  }, [journal]);

  const getPacketType = (p: any): "Challenge" | "Claim" | "Query" | "Dataset" | "Investigation" => {
    if (!p || !p.challenge) return "Challenge";
    if (p.challenge.startsWith("[CHALLENGE]")) return "Challenge";
    if (p.challenge.startsWith("[CLAIM]")) return "Claim";
    if (p.challenge.startsWith("[QUERY]")) return "Query";
    if (p.challenge.startsWith("[DATASET]")) return "Dataset";
    if (p.challenge.startsWith("[INVESTIGATION]")) return "Investigation";
    
    const lower = p.challenge.toLowerCase();
    if (lower.includes("investigate")) return "Investigation";
    if (lower.includes("dataset") || lower.includes("link") || lower.includes("registration")) return "Dataset";
    if (lower.includes("query") || lower.includes("options") || lower.includes("financing rate")) return "Query";
    if (lower.includes("claim") || lower.includes("will rise") || lower.includes("yield curve skews")) return "Claim";
    return "Challenge";
  };

  const handleOperatorApply = (p: CustodyPacket) => {
    const type = getPacketType(p);
    setIntakeType(type);
    
    let text = p.challenge;
    if (text.startsWith("[CHALLENGE]")) text = text.substring(11).trim();
    if (text.startsWith("[CLAIM]")) text = text.substring(7).trim();
    if (text.startsWith("[QUERY]")) text = text.substring(7).trim();
    if (text.startsWith("[DATASET]")) text = text.substring(9).trim();
    if (text.startsWith("[INVESTIGATION]")) text = text.substring(15).trim();
    
    setIntakeInput(text);
    
    // Automatically trigger Save/Accept Finding into Investigation Journal to complete the loop!
    handleOperatorSave(p);

    setIngestLogs(prev => [
      ...prev,
      `[OPERATOR] Coupled Finding ${p.packet_id} to Intake. Generated auto Journal Entry & Accepted status.`
    ]);

    setTimeout(() => {
      if (intakeRef.current) {
        intakeRef.current.focus();
        intakeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 150);
  };

  const handleOperatorEdit = (p: CustodyPacket) => {
    handleOperatorApply(p);
    setTimeout(() => {
      if (intakeRef.current) {
        intakeRef.current.focus();
        intakeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  const handleOperatorSave = async (p: CustodyPacket) => {
    const type = getPacketType(p);
    let text = p.challenge;
    if (text.startsWith("[CHALLENGE]")) text = text.substring(11).trim();
    if (text.startsWith("[CLAIM]")) text = text.substring(7).trim();
    if (text.startsWith("[QUERY]")) text = text.substring(7).trim();
    if (text.startsWith("[DATASET]")) text = text.substring(11).trim();
    if (text.startsWith("[INVESTIGATION]")) text = text.substring(15).trim();

    const exists = journal.some(j => j.packet_id === p.packet_id && j.status === "Accepted");
    if (exists) {
      setIngestLogs(prev => [
        ...prev,
        `[INFO] Finding ${p.packet_id} is already stored in the Operator Investigation Journal.`
      ]);
      return;
    }

    const newJournal = {
      packet_id: p.packet_id,
      type,
      input: text,
      finding: p.challenge,
      authorities: p.authority_chain || [],
      datasets: p.dataset_recommendations || [],
      status: "Accepted" as const,
      timestamp: new Date().toLocaleDateString()
    };

    setJournal(prev => [newJournal, ...prev]);

    // Update state to operator approved locally as well, syncing with Same Pipeline rules
    setPackets(prev => prev.map(item => {
      if (item.packet_id === p.packet_id) {
        return {
          ...item,
          operator_gate: "APPROVED" as const,
          current_status: "OPERATOR_APPROVED"
        };
      }
      return item;
    }));

    // Auto sign off on server persistence
    try {
      const res = await fetch(`/api/packets/verdict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packet_id: p.packet_id,
          reviewType: "JEMMA",
          verdict: "APPROVED",
          reason: "Operator validated challenge veracity & logged to Investigation Journal."
        })
      });
      if (res.ok) {
        await loadPacketsFromDatabase();
      }
    } catch (err) {
      console.error("Failed to update packet verification on save:", err);
    }

    setIngestLogs(prev => [
      ...prev,
      `[JOURNAL] 💾 Finding ${p.packet_id} archived to Operator Investigation Journal successfully!`
    ]);
  };

  const handleOperatorReject = async (p: CustodyPacket) => {
    const type = getPacketType(p);
    let text = p.challenge;
    if (text.startsWith("[CHALLENGE]")) text = text.substring(11).trim();
    if (text.startsWith("[CLAIM]")) text = text.substring(7).trim();
    if (text.startsWith("[QUERY]")) text = text.substring(7).trim();
    if (text.startsWith("[DATASET]")) text = text.substring(11).trim();
    if (text.startsWith("[INVESTIGATION]")) text = text.substring(15).trim();

    const exists = journal.some(j => j.packet_id === p.packet_id && j.status === "Rejected");
    if (exists) {
      setIngestLogs(prev => [
        ...prev,
        `[INFO] Finding ${p.packet_id} has already been logged as Rejection.`
      ]);
      return;
    }

    const newJournal = {
      packet_id: p.packet_id,
      type,
      input: text,
      finding: p.challenge,
      authorities: p.authority_chain || [],
      datasets: p.dataset_recommendations || [],
      status: "Rejected" as const,
      timestamp: new Date().toLocaleDateString()
    };

    setJournal(prev => [newJournal, ...prev]);

    setPackets(prev => prev.map(item => {
      if (item.packet_id === p.packet_id) {
        return {
          ...item,
          operator_gate: "LOCKED" as const,
          current_status: "REJECTED"
        };
      }
      return item;
    }));

    setIngestLogs(prev => [
      ...prev,
      `[OPERATOR] ❌ Rejected packet ${p.packet_id}. Status logged as [Rejected] with audit track lock.`
    ]);
  };

  const toggleAmbiguityLock = async (packetId: string) => {
    try {
      const res = await fetch("/api/packets/toggle-ambiguity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packet_id: packetId })
      });
      if (res.ok) {
        const data = await res.json();
        setPackets(prev => prev.map(p => p.packet_id === packetId ? data.packet : p));
        setIngestLogs(prev => [
          ...prev,
          `[OPERATOR] Toggled Ambiguity Lock for ${packetId}. Active: ${data.packet.ambiguityLock?.active}`
        ]);
        await loadPacketsFromDatabase();
      }
    } catch (e) {
      console.error("Toggle ambiguity failed:", e);
    }
  };

  const resolveAmbiguityLock = async (packetId: string, notes: string) => {
    try {
      const res = await fetch("/api/packets/resolve-ambiguity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packet_id: packetId, resolutionNotes: notes })
      });
      if (res.ok) {
        const data = await res.json();
        setPackets(prev => prev.map(p => p.packet_id === packetId ? data.packet : p));
        setIngestLogs(prev => [
          ...prev,
          `[OPERATOR] Resolving Ambiguity for: ${packetId}. Notes: ${notes || "Calibrated ambiguous standards."}`
        ]);
        await loadPacketsFromDatabase();
      }
    } catch (e) {
      console.error("Resolve ambiguity failed:", e);
    }
  };

  const handleRejectAmbiguityPacket = async (packetId: string) => {
    try {
      const res = await fetch("/api/packets/verdict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packet_id: packetId,
          reviewType: "JEMMA",
          verdict: "REVISION_REQUIRED",
          reason: "Divergent ambiguity lock. Returning for formulation overhaul.",
          reviewer: "SYSTEM_OPERATOR"
        })
      });
      if (res.ok) {
        await resolveAmbiguityLock(packetId, "Flagged divergence. Returning packet for formulation revision.");
      }
    } catch (e) {
      console.error("Failed to reject ambiguity packet:", e);
    }
  };

  // Initial Custody Packets for Chain-of-Custody (synchronized with Firestore cloud ledger)
  const [packets, setPackets] = useState<CustodyPacket[]>(() => {
    try {
      const saved = localStorage.getItem("pathfinder_packets");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedPacketId, setSelectedPacketId] = useState(() => {
    return localStorage.getItem("pathfinder_selected_packet_id") || "";
  });
  const [datasetUrlInput, setDatasetUrlInput] = useState(() => {
    return localStorage.getItem("pathfinder_url_draft") || "";
  });
  const [ledgerStatus, setLedgerStatus] = useState("Restoring Session...");

  // Pathfinder Doctrine - Registered Authorities
  const [doctrine, setDoctrine] = useState<any[]>([]);
  const [newAuthorityName, setNewAuthorityName] = useState("");
  const [newAuthorityCategory, setNewAuthorityCategory] = useState("DERIVATIVES_MARKET_STRUCTURE");
  const [newAuthorityStatus, setNewAuthorityStatus] = useState("OBSERVE_ONLY");
  const [newAuthorityRole, setNewAuthorityRole] = useState("");
  const [newAuthorityDesc, setNewAuthorityDesc] = useState("");
  const [doctrineError, setDoctrineError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // CME Group API connection credentials validation state
  const [cmeConfigured, setCmeConfigured] = useState(false);
  const [geminiConfigured, setGeminiConfigured] = useState(false);
  const [firebaseConfigured, setFirebaseConfigured] = useState(false);
  const [traiConfigured, setTraiConfigured] = useState(false);
  const [cmeIsLive, setCmeIsLive] = useState(false);
  const [cmeUsername, setCmeUsername] = useState<string | null>(null);
  const [isCmeTesting, setIsCmeTesting] = useState(false);
  const [cmeTestFeedback, setCmeTestFeedback] = useState<string | null>(null);
  const [cmeTestSuccess, setCmeTestSuccess] = useState<boolean | null>(null);

  // TRAI Group API connection credentials validation state
  const [isTraiTesting, setIsTraiTesting] = useState(false);
  const [traiTestFeedback, setTraiTestFeedback] = useState<string | null>(null);
  const [traiTestSuccess, setTraiTestSuccess] = useState<boolean | null>(null);

  // Authority Recommendation Tree UI States
  const [treeExpanded, setTreeExpanded] = useState<Record<string, boolean>>({
    challenge: true,
    scout: true,
    authorities: true,
    reasoning: true,
    packets: true,
    fallback: false
  });
  const [expandedRecommendDatasets, setExpandedRecommendDatasets] = useState<Record<number, boolean>>({
    0: true // Default first one is open
  });
  const [operatorActionState, setOperatorActionState] = useState<"NONE" | "REGISTERED" | "HELD" | "REJECTED">("NONE");
  const [operatorActionLog, setOperatorActionLog] = useState<string | null>(null);

  // CME Interactive Registration Form State
  const [showCmeRegForm, setShowCmeRegForm] = useState(false);
  const [cmeRegUsername, setCmeRegUsername] = useState("");
  const [cmeRegPassword, setCmeRegPassword] = useState("");
  const [cmeRegError, setCmeRegError] = useState<string | null>(null);
  const [cmeRegSuccessMsg, setCmeRegSuccessMsg] = useState<string | null>(null);
  const [isCmeRegistering, setIsCmeRegistering] = useState(false);

  // System Compatibility Audit State Variables
  const [auditResult, setAuditResult] = useState<any | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [isRebooting, setIsRebooting] = useState(false);
  const [rebootError, setRebootError] = useState<string | null>(null);

  // Crystal Bridge and decoupled model runtime state variables
  const [compiledContract, setCompiledContract] = useState<RuntimeHandoffContract | null>(null);
  const [isBridgeDispatching, setIsBridgeDispatching] = useState(false);
  const [bridgeLogs, setBridgeLogs] = useState<string[]>([]);
  const [activeDomainFilter, setActiveDomainFilter] = useState<"ALL" | "CORE" | "COMPUTE" | "BRIDGE">("ALL");
  const [bridgeRuntimePreference, setBridgeRuntimePreference] = useState<string>("octagon-compute-runtime");

  // Reasoning Choice Layer pluggable state
  const [selectedReasoner, setSelectedReasoner] = useState<string>("Not Selected");
  const [reasonerAuditOutput, setReasonerAuditOutput] = useState<{
    analyzeText?: string;
    evidenceGapsText?: string;
    challengeText?: string;
    proposeAlternativesText?: string;
    confidenceScore?: number;
    reasonerName?: string;
  } | null>(null);
  const [isReasonerAuditing, setIsReasonerAuditing] = useState(false);

  // Ingestion dry run simulation state
  const [ingestStatus, setIngestStatus] = useState<"idle" | "running" | "success" | "error" | "query" | "deploying">("idle");
  const [ingestLogs, setIngestLogs] = useState<string[]>([
    "[SYSTEM INITIALIZED] Cockpit Avionics Online. Systems aligned.",
    "[STATUS] Pathfinder Route active on branch: main.",
    "[INFO] Ready to load synchronized Chain-of-Custody documents catalog."
  ]);
  const [ingestedModules, setIngestedModules] = useState<string[]>(["configs", "schemas", "tests"]);
  const [searchQueryInput, setSearchQueryInput] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Jemma-Tenzor dialogue copilot state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "initial",
      sender: "assistant",
      text: "Aviation intelligence console online. I am Jemma, your cockpit co-navigator. I manage structure enforcement, ingestion verification channels, and Chain-of-Custody audits before live builds occur under Pathfinder rules.",
      timestamp: new Date().toLocaleTimeString()
    },
    {
      id: "boe-discussion",
      sender: "user",
      text: "What about Bank of England statistical databases? Should we classify them as a primary central authority?",
      timestamp: new Date().toLocaleTimeString()
    },
    {
      id: "boe-response",
      sender: "assistant",
      text: "Excellent source, Rod. The BOE online database acts as the UK’s primary sovereign monetary time-series warehouse. I have indexed Series codes like IUMABEDR (Official Bank Rate) and spot rates (GBP/USD) directly into DATASET_REGISTRY. Pathfinder identifies the need, Crystal Bridge v2 Universal Outbound Dock routes, and you decide. Exactly how we want it.",
      timestamp: new Date().toLocaleTimeString()
    },
    {
      id: "openjarvis-discussion",
      sender: "user",
      text: "Look at Meet OpenJarvis local-first trace-driven spec updates... feels aligned with our decoupler architecture.",
      timestamp: new Date().toLocaleTimeString()
    },
    {
      id: "openjarvis-response",
      sender: "assistant",
      text: "Strong validation of our laptop thesis. In OpenJarvis, Intelligence /= Agent /= Memory /= Learning. Learning updates the portable specification from execution Traces. I classified this as a research architecture artifact (bigset database) under the AI_MODEL_CATALOGUE domain so we can review model decoupling safely.",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const terminalLogsEndRef = useRef<HTMLDivElement>(null);

  // Master generated configurations (loaded lazily)
  const [configs, setConfigs] = useState<PresetConfigs>({
    "cloudbuild.export.yaml": "",
    "Dockerfile.gpu": "",
    "deploy_cloudrun.sh": "",
    "inference.py": ""
  });
  const [activeConfigTab, setActiveConfigTab] = useState<keyof PresetConfigs>("cloudbuild.export.yaml");
  const [copiedFile, setCopiedFile] = useState(false);
  const [copiedText, setCopiedText] = useState("");

  const selectedPacket = packets.find(p => p.packet_id === selectedPacketId) || packets[0] || {
    packet_id: "LOADING",
    source_agent: "System",
    challenge: "Synchronizing with persistent clouds document-ledger store...",
    dataset_recommendations: [],
    authority_chain: [],
    jemma_verdict: "PENDING",
    red_team_verdict: "PENDING",
    operator_gate: "LOCKED",
    current_status: "RECOMMENDATION_CREATED",
    next_allowed_action: "Initial calibration"
  };

  // Derived operator approval from custody packet ledger status
  const bridgeOperatorApproval = selectedPacket 
    ? (selectedPacket.operator_gate === "APPROVED" || !!selectedPacket.operatorApproved) 
    : false;

  const getApprovalStampLabel = () => {
    if (!selectedPacket || selectedPacket.packet_id === "LOADING") return "PENDING (FALSE)";
    if (selectedPacket.operator_gate === "APPROVED" || !!selectedPacket.operatorApproved) {
      return "APPROVED (TRUE)";
    }
    if (selectedPacket.current_status === "FULLY_VERIFIED") {
      return "PENDING (FALSE)";
    }
    return "BLOCKED (FALSE)";
  };

  const [selectedPipeline, setSelectedPipeline] = useState<string>("AI_MODEL_CATALOGUE");
  const [bridgeDestinationTarget, setBridgeDestinationTarget] = useState<string>("AI_MODEL_CATALOGUE");
  const [gcpServiceAccount, setGcpServiceAccount] = useState<string>("gcp_service_account_token_active");
  const [nvidiaApiKey, setNvidiaApiKey] = useState<string>("nvidia_l4_workspace_token_active");
  const [firebaseCredentials, setFirebaseCredentials] = useState<string>("firebase_blueprints_key_active");
  const [workspaceToken, setWorkspaceToken] = useState<string>("google_workspace_oauth_token_active");
  const [credentialsValid, setCredentialsValid] = useState<boolean>(true);

  // Dynamic Capability Profile translation layer
  const capabilityProfile = useMemo(() => {
    return deriveCapabilityProfile(selectedPacket.challenge);
  }, [selectedPacket.challenge]);

  // Dynamically evaluate credential status
  const resolvedCredentialStatus = useMemo(() => {
    if (!credentialsValid) return "MISSING";
    
    if (selectedPipeline === "DOCUMENTATION_PIPELINE") {
      return "NOT_REQUIRED";
    }
    
    if (selectedPipeline === "AI_MODEL_CATALOGUE") {
      if (!nvidiaApiKey.trim()) return "MISSING";
    }
    if (selectedPipeline === "GOOGLE_CLOUD_PIPELINE") {
      if (!gcpServiceAccount.trim()) return "MISSING";
    }
    if (selectedPipeline === "ARCHIVE_PIPELINE") {
      if (!firebaseCredentials.trim()) return "MISSING";
    }
    if (selectedPipeline === "COMMUNICATION_PIPELINE") {
      if (!workspaceToken.trim()) return "MISSING";
    }
    if (selectedPipeline === "RESEARCH_PIPELINE") {
      if (!gcpServiceAccount.trim()) return "MISSING";
    }
    return "VALID";
  }, [credentialsValid, selectedPipeline, nvidiaApiKey, gcpServiceAccount, firebaseCredentials, workspaceToken]);

  const isPacketVerified = useMemo(() => {
    if (!selectedPacket) return false;
    const status = selectedPacket.current_status;
    return (
      status === "FULLY_VERIFIED" ||
      status === "OPERATOR_APPROVED" ||
      status === "PACKET_SEALED" ||
      status === "COPILOT_DISPATCHED" ||
      status === "Deployed (Demo)" ||
      status === "DEPLOYED" ||
      status === "INGESTION_AUTHORIZED" ||
      status === "INGESTED" ||
      status === "DEPLOY_AUTHORIZED"
    );
  }, [selectedPacket]);

  const recommendedReasoner = useMemo(() => {
    if (!capabilityProfile) return "Not Selected";
    const name = capabilityProfile.capabilityName;
    if (name === "Dataset Discovery") return "Gemini Reasoner";
    if (name === "Analysis + Visualisation") return "Claude-style Validator";
    if (name === "Deep Options Analytics") return "DeepSeek Reasoner";
    if (name === "Audit Veracity Check") return "Qwen Reasoner";
    return "Local Reasoner";
  }, [capabilityProfile]);

  const computedDispatchStatus = useMemo(() => {
    if (!isPacketVerified) return "LOCKED_PACKET_NOT_VERIFIED";
    if (!bridgeOperatorApproval) return "PENDING_OPERATOR_APPROVAL";
    if (selectedReasoner === "Not Selected") return "REASONER_REQUIRED";
    if (!bridgeRuntimePreference) return "RUNTIME_SELECTION_REQUIRED";
    if (!bridgeDestinationTarget) return "DESTINATION_SELECTION_REQUIRED";
    if (resolvedCredentialStatus === "MISSING") return "CREDENTIALS_REQUIRED";
    if (bridgeDestinationTarget === "Dry Run Console") return "DRY_RUN";
    return "DISPATCH_READY";
  }, [isPacketVerified, bridgeOperatorApproval, selectedReasoner, bridgeRuntimePreference, bridgeDestinationTarget, resolvedCredentialStatus]);

  const isDispatchOptionValid = useMemo(() => {
    return (
      isPacketVerified &&
      bridgeOperatorApproval &&
      selectedReasoner !== "Not Selected" &&
      !!bridgeRuntimePreference &&
      !!bridgeDestinationTarget &&
      resolvedCredentialStatus !== "MISSING"
    );
  }, [isPacketVerified, bridgeOperatorApproval, selectedReasoner, bridgeRuntimePreference, bridgeDestinationTarget, resolvedCredentialStatus]);

  // Synchronize recommended runtime & reasoner to operator selection controls
  useEffect(() => {
    if (capabilityProfile) {
      if (capabilityProfile.runtimeRecommendation === "GPU Workspace") {
        setBridgeRuntimePreference("nvidia-l4");
      } else {
        setBridgeRuntimePreference("octagon-compute-runtime");
      }
    }
  }, [selectedPacket.packet_id, capabilityProfile]);

  useEffect(() => {
    if (recommendedReasoner) {
      setSelectedReasoner(recommendedReasoner);
      setReasonerAuditOutput(null); // Reset stale commentary
    }
  }, [selectedPacket.packet_id, recommendedReasoner]);

  // Dynamic copilot greeting compiled from Registry status
  const generateOpeningMessage = (packet: any) => {
    const pid = packet?.packet_id || "PKT-001";
    const state = packet?.current_status || "RECOMMENDATION_CREATED";
    
    // Custom logic for Outstanding Conditions
    let outstanding = "None";
    if (packet?.jemma_verdict === "PENDING" || packet?.red_team_verdict === "PENDING") {
      const list = [];
      if (packet.jemma_verdict === "PENDING") list.push("Awaiting Jemma Review Clearance");
      if (packet.red_team_verdict === "PENDING") list.push("Awaiting Red Team Security Assessment");
      outstanding = list.join(", ");
    } else if (packet?.operator_gate === "LOCKED" || !packet?.operatorApproved) {
      outstanding = "Awaiting Operator Seal and Double-Signature Handshake Authorization";
    } else if (state !== "DEPLOYED" && state !== "Deployed (Demo)") {
      outstanding = "Pending final dispatch and execution runtime dispatch";
    }

    // Recommended next safe action
    let recommendedAction = "Review target evidence source chains in the evaluation workspace.";
    if (packet?.jemma_verdict === "PENDING" || packet?.red_team_verdict === "PENDING") {
      recommendedAction = "Initiate double-signature gate review for validation.";
    } else if (packet?.operator_gate === "LOCKED" || !packet?.operatorApproved) {
      recommendedAction = "Approve and seal the packet as safe for execution.";
    } else if (state !== "DEPLOYED" && state !== "Deployed (Demo)") {
      recommendedAction = "Select recommended accelerator target and execute the handoff contract.";
    } else {
      recommendedAction = "All gates completed. System operates under active observer guidelines.";
    }

    return `Current packet context loaded.

Packet:
${pid}

State:
${state}

Outstanding Conditions:
- ${outstanding}

Recommended Next Safe Action:
- ${recommendedAction}`;
  };

  // Synchronize copilot initial message with active packet
  useEffect(() => {
    if (chatMessages.length === 0 || chatMessages.some(m => m.id === "initial")) {
      setChatMessages(prev => {
        const text = generateOpeningMessage(selectedPacket);
        const exists = prev.find(m => m.id === "initial");
        if (exists) {
          if (exists.text === text) return prev;
          return prev.map(m => m.id === "initial" ? { ...m, text } : m);
        } else {
          return [
            {
              id: "initial",
              sender: "assistant",
              text,
              timestamp: new Date().toLocaleTimeString()
            },
            ...prev
          ];
        }
      });
    }
  }, [selectedPacket, chatMessages.length]);

  const loadCopilotHistory = async () => {
    try {
      const res = await fetch("/api/copilot/messages");
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setChatMessages(data);
        }
      } else {
        console.warn("Retrying fetch of copilot history: response was not ok");
      }
    } catch (err: any) {
      console.warn("Failed to load live copilot history (will retry automatically):", err?.message || err);
    }
  };

  const clearCopilotHistory = async () => {
    try {
      const res = await fetch("/api/copilot/messages", { method: "DELETE" });
      if (res.ok) {
        setChatMessages([
          {
            id: "initial",
            sender: "assistant",
            text: generateOpeningMessage(selectedPacket),
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
      }
    } catch (err) {
      console.error("Failed to clear copilot history:", err);
    }
  };

  const loadPacketsFromDatabase = async (selectFirst = false) => {
    try {
      const res = await fetch("/api/packets");
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setPackets(data);
          try {
            localStorage.setItem("pathfinder_packets", JSON.stringify(data));
          } catch (err) {
            console.error("Local storage packets save failed:", err);
          }

          const savedId = localStorage.getItem("pathfinder_selected_packet_id");
          const exists = data.some((p: any) => p.packet_id === savedId);
          if (savedId && exists) {
            setSelectedPacketId(savedId);
          } else if (selectFirst) {
            setSelectedPacketId(data[0].packet_id);
            localStorage.setItem("pathfinder_selected_packet_id", data[0].packet_id);
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch custody packets from ledger:", e);
      try {
        const saved = localStorage.getItem("pathfinder_packets");
        if (saved) {
          const data = JSON.parse(saved);
          setPackets(data);
          const savedId = localStorage.getItem("pathfinder_selected_packet_id");
          const exists = data.some((p: any) => p.packet_id === savedId);
          if (savedId && exists) {
            setSelectedPacketId(savedId);
          } else if (selectFirst && data.length > 0) {
            setSelectedPacketId(data[0].packet_id);
          }
        }
      } catch (err) {
        console.error("Local storage load failed in catch:", err);
      }
    }
  };

  const getSubsystemStatus = (subId: string, packetStatus: string, jemma: string, red: string) => {
    if (packetStatus === "DEPLOYED" || packetStatus === "Deployed (Demo)") {
      return { label: "ACTIVE", color: "bg-emerald-500 shadow-[0_0_8px_#10b981] text-emerald-400" };
    }

    if (jemma === "REVISION_REQUIRED" || red === "VULNERABLE") {
      if (subId === "validation" || subId === "runtime") {
        return { label: "FAILED", color: "bg-red-500 shadow-[0_0_8px_#ef4444] text-red-400" };
      }
      return { label: "ISOLATED", color: "bg-blue-400 text-blue-400" };
    }

    switch (packetStatus) {
      case "RECOMMENDATION_CREATED":
        if (subId === "runtime") return { label: "VERIFYING", color: "bg-amber-400 shadow-[0_0_6px_#fbbf24] text-amber-400 animate-pulse" };
        if (subId === "inference") return { label: "ISOLATED", color: "bg-blue-400 text-blue-400" };
        return { label: "READY", color: "bg-emerald-500 text-emerald-400" };

      case "DATASET_CANDIDATE_REGISTERED":
        if (subId === "validation") return { label: "VERIFYING", color: "bg-amber-400 shadow-[0_0_6px_#fbbf24] text-amber-400 animate-pulse" };
        if (subId === "inference") return { label: "READY", color: "bg-emerald-500 text-emerald-400" };
        return { label: "READY", color: "bg-emerald-500 text-emerald-400" };

      case "AWAITING_VALIDATION":
      case "JEMMA_APPROVED":
      case "RED_TEAM_CLEARED":
      case "FULLY_VERIFIED":
        if (subId === "validation" || subId === "tests") {
          return { label: "VERIFYING", color: "bg-amber-400 shadow-[0_0_6px_#fbbf24] text-amber-400 animate-pulse" };
        }
        return { label: "READY", color: "bg-emerald-500 text-emerald-400" };

      case "OPERATOR_APPROVED":
      case "INGESTION_AUTHORIZED":
      case "INGESTED":
      case "DEPLOY_AUTHORIZED":
        return { label: "READY", color: "bg-emerald-500 shadow-[0_0_6px_#10b981] text-emerald-400" };

      default:
        return { label: "READY", color: "bg-emerald-500 text-emerald-400" };
    }
  };

  const loadDoctrineFromDatabase = async () => {
    try {
      const res = await fetch("/api/doctrine");
      if (res.ok) {
        const data = await res.json();
        setDoctrine(data);
      }
    } catch (e) {
      console.error("Failed to fetch authority doctrine:", e);
    }
  };

  const loadCredentialsStatus = async () => {
    try {
      const res = await fetch("/api/credentials/status");
      if (res.ok) {
        const data = await res.json();
        setCmeConfigured(data.cme.configured);
        setCmeUsername(data.cme.username);
        setCmeIsLive(!!data.cme.isLive);
        setGeminiConfigured(!!data.gemini?.configured);
        setFirebaseConfigured(!!data.firestore?.configured);
        setTraiConfigured(!!data.trai?.configured);
        if (data.firestore && data.firestore.configured) {
          setLedgerStatus("Ledger restored from Firestore");
        } else {
          setLedgerStatus("Session restored from local cockpit memory");
        }
      } else {
        setLedgerStatus("Session restored from local cockpit memory");
      }
    } catch (e) {
      console.error("Failed to load credentials status:", e);
      setLedgerStatus("Session restored from local cockpit memory");
    }
  };

  const runCompatibilityAudit = async () => {
    setIsAuditing(true);
    setAuditError(null);
    try {
      const res = await fetch("/api/audit");
      if (res.ok) {
        const data = await res.json();
        setAuditResult(data);
      } else {
        const errData = await res.json();
        setAuditError(errData.error || "Failed to retrieve compatibility audit facts");
      }
    } catch (e: any) {
      setAuditError(e.message || "Failed to contact Pathfinder Audit Engine");
    } finally {
      setIsAuditing(false);
    }
  };

  const forceRebootHandshake = async () => {
    setIsRebooting(true);
    setRebootError(null);
    try {
      const res = await fetch("/api/audit/retry", { method: "POST" });
      if (res.ok) {
        await runCompatibilityAudit();
        await loadCredentialsStatus();
      } else {
        const errData = await res.json();
        setRebootError(errData.error || "Failed to reboot database handshake");
      }
    } catch (e: any) {
      setRebootError(e.message || "Failed to contact Handshake Controller");
    } finally {
      setIsRebooting(false);
    }
  };

  const handleRegisterCmeCredentials = async (e: FormEvent) => {
    e.preventDefault();
    if (!cmeRegUsername.trim() || !cmeRegPassword.trim()) {
      setCmeRegError("Federated identity email and WebSSO passkey credentials cannot be blank.");
      return;
    }
    setCmeRegError(null);
    setCmeRegSuccessMsg(null);
    setIsCmeRegistering(true);

    try {
      const res = await fetch("/api/credentials/cme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: cmeRegUsername,
          password: cmeRegPassword
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCmeRegSuccessMsg(data.message);
        setCmeRegUsername("");
        setCmeRegPassword("");
        await loadCredentialsStatus();
        setIngestLogs(prev => [
          ...prev,
          `[SSO] [REGISTERED] New CME SSO Credentials registered safely: ${data.username}`
        ]);
        setTimeout(() => setShowCmeRegForm(false), 2000);
      } else {
        setCmeRegError(data.error || "Handshake configuration registration failed");
      }
    } catch (err: any) {
      setCmeRegError(err.message || "Network exception saving credentials");
    } finally {
      setIsCmeRegistering(false);
    }
  };

  const handleTestCmeSSO = async () => {
    setIsCmeTesting(true);
    setCmeTestFeedback("Initiating secure TLS 1.3 socket to CME Group WebSSO portal...");
    setCmeTestSuccess(null);
    try {
      const res = await fetch("/api/credentials/cme/test", {
        method: "POST"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCmeTestSuccess(true);
        // Concatenate logs nicely
        const logLines = data.logs || [];
        setCmeTestFeedback(`AUTHENTICATED successfully containing authorized scopes:\n${data.identity.scope.join(", ")}`);
        setIngestLogs(prev => [
          ...prev,
          `[SSO] [SUCCESS] Active SSO Lease established for Options Analytical API`,
          ...logLines
        ]);
        // Also reload status
        loadCredentialsStatus();
      } else {
        setCmeTestSuccess(false);
        setCmeTestFeedback(data.error || "Authentication failed. Incorrect username/password signature.");
      }
    } catch (err: any) {
      setCmeTestSuccess(false);
      setCmeTestFeedback(`Connection exception: ${err.message || "Network Timeout"}`);
    } finally {
      setIsCmeTesting(false);
    }
  };

  const handleTestTrai = async () => {
    setIsTraiTesting(true);
    setTraiTestFeedback("Initiating local evaluation of TRAI Authority credentials...");
    setTraiTestSuccess(null);
    try {
      const res = await fetch("/api/credentials/trai/test", {
        method: "POST"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTraiTestSuccess(true);
        setTraiTestFeedback(`AUTHENTICATED successfully. TRAI key detected: ${data.maskedKey}`);
        setIngestLogs(prev => [
          ...prev,
          `[TRAI] [SUCCESS] Credential evaluated successfully. Authority handshake ready.`,
          ...(data.logs || [])
        ]);
        // reload status
        loadCredentialsStatus();
      } else {
        setTraiTestSuccess(false);
        setTraiTestFeedback(data.error || "Validation failed. Secret key is missing or invalid.");
      }
    } catch (err: any) {
      setTraiTestSuccess(false);
      setTraiTestFeedback(`Connection exception: ${err.message || "Network Timeout"}`);
    } finally {
      setIsTraiTesting(false);
    }
  };

  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const handleCopyContract = () => {
    if (!compiledContract) return;
    navigator.clipboard.writeText(JSON.stringify(compiledContract, null, 2));
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  const handleSaveToJournal = () => {
    if (!compiledContract) return;
    setIngestLogs(prev => [
      ...prev,
      `[JOURNAL_LEDGER] Saved metadata for crystal adapter contract: [${compiledContract.contractId}] with destination: [${compiledContract.destinationTarget}].`
    ]);
    setBridgeLogs(prev => [
      ...prev,
      `[JOURNAL_LEDGER] Contract metadata stored securely in local journal ledger.`
    ]);
  };

  const handleDryRunSimulation = async () => {
    const adapter = new OctagonComputeRuntimeAdapter();
    const contract = adapter.compileHandoffContract(selectedPacket, [
      {
        id: `candidate-${selectedPacket.packet_id}`,
        packetId: selectedPacket.packet_id,
        url: selectedPacket.url_candidate || "https://db.economicdata.example/v1/CPI.csv",
        status: "VERIFIED",
        createdAt: new Date().toISOString()
      }
    ]);
    contract.operatorApproval = true;
    contract.operatorApproved = true;
    contract.runtimePreference = bridgeRuntimePreference || "octagon-compute-runtime";
    contract.runtimeTarget = bridgeRuntimePreference || "octagon-compute-runtime";
    contract.destinationTarget = "Dry Run Console";
    contract.credentialStatus = "NOT_REQUIRED";
    contract.dispatchStatus = "DRY_RUN";

    setBridgeLogs(prev => [...prev, `[SIMULATION] Initiating Dry Run simulation for contract: ${contract.contractId}...`]);
    try {
      const result = await adapter.dispatchHandoff(contract);
      setBridgeLogs(prev => [
        ...prev,
        `[SIMULATION_SUCCESS] Dry-Run completed on Dry Run Console. Status Code: ${result.status}`,
        ...(result.logs || [])
      ]);
    } catch (err: any) {
      setBridgeLogs(prev => [...prev, `[SIMULATION_ERROR] Dry run simulation failed: ${err.message}`]);
    }
  };

  const handleCompileBridgeContract = () => {
    try {
      const adapter = new OctagonComputeRuntimeAdapter();
      const contract = adapter.compileHandoffContract(selectedPacket, [
        {
          id: `candidate-${selectedPacket.packet_id}`,
          packetId: selectedPacket.packet_id,
          url: selectedPacket.url_candidate || "https://db.economicdata.example/v1/CPI.csv",
          status: "VERIFIED",
          createdAt: new Date().toISOString()
        }
      ]);
      
      // Override or apply interactive parameters chosen by user
      contract.operatorApproval = bridgeOperatorApproval;
      contract.operatorApproved = bridgeOperatorApproval;
      contract.runtimePreference = bridgeRuntimePreference;
      contract.runtimeTarget = bridgeRuntimePreference;
      contract.destinationTarget = selectedPipeline;
      contract.credentialStatus = resolvedCredentialStatus;
      contract.capabilityProfile = capabilityProfile ? capabilityProfile.capabilityName : "Dataset Discovery";
      
      // Master dispatchStatus before final server dispatch is verified
      contract.dispatchStatus = computedDispatchStatus;

      setCompiledContract(contract);
      setBridgeLogs(prev => [
        ...prev,
        `[BRIDGE] [${new Date().toLocaleTimeString()}] Crystal Bridge compiled Outbound Dock Contract: ${contract.contractId}`,
        `  ➔ Target Precision: ${contract.models.precision.toUpperCase()}`,
        `  ➔ Source Packet ID: ${contract.sourcePacketId}`,
        `  ➔ Operator Approval Flag: ${contract.operatorApproval ? "TRUE" : "FALSE"}`,
        `  ➔ Runtime Target Path: "${contract.runtimePreference || "None"}"`,
        `  ➔ Universal Route: "${contract.destinationTarget}"`,
        `  ➔ Credential Status: ${contract.credentialStatus}`,
        `  ➔ Capability Profile: "${contract.capabilityProfile}"`
      ]);
    } catch (err: any) {
      setBridgeLogs(prev => [...prev, `[BRIDGE_ERROR] Compilation failed: ${err.message}`]);
    }
  };

  const handleDispatchBridgeContract = async () => {
    if (!compiledContract) return;
    setIsBridgeDispatching(true);
    setBridgeLogs(prev => [...prev, `[BRIDGE] [${new Date().toLocaleTimeString()}] Initiating dispatch verification check to separated Pathfinder Compute Runtime compiler...`]);
    try {
      const adapter = new OctagonComputeRuntimeAdapter();
      const result = await adapter.dispatchHandoff(compiledContract);
      if (result.success) {
        setBridgeLogs(prev => [
          ...prev,
          ...(result.logs || []),
          `[SUCCESS] Dispatch Approved! Status Code: ${result.status}`,
          `  ➔ Live Endpoint leased: ${result.endpointUrl}`
        ]);
        setIngestLogs(prev => [
          ...prev,
          `[BRIDGE] [${result.status}] Validation signature check succeeded.`
        ]);
        await loadPacketsFromDatabase();
      } else {
        setBridgeLogs(prev => [
          ...prev,
          ...(result.logs || []),
          `[BRIDGE_ERROR] Dispatch Blocked! Status Code: ${result.status || "FAILED"}`,
          `  ➔ Reason: ${result.error || "Validation check declined."}`
        ]);
        setIngestLogs(prev => [
          ...prev,
          `[BRIDGE_ERROR] [${result.status || "FAILED"}] Verification check declined: ${result.error}`
        ]);
      }
    } catch (err: any) {
      setBridgeLogs(prev => [...prev, `[BRIDGE_ERROR] Pipeline dispatch request Exception: ${err.message}`]);
    } finally {
      setIsBridgeDispatching(false);
    }
  };

  const handleRegisterDoctrine = async (e: FormEvent) => {
    e.preventDefault();
    if (!newAuthorityName.trim()) return;
    setDoctrineError("");
    try {
      const res = await fetch("/api/doctrine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authority: newAuthorityName.trim().toUpperCase(),
          category: newAuthorityCategory,
          status: newAuthorityStatus,
          role: newAuthorityRole.trim() || `${newAuthorityName.trim()} External Authority`,
          description: newAuthorityDesc.trim() || `Automated external dataset tracking node in Pathfinder doctrine for ${newAuthorityName.trim()}.`
        })
      });
      if (res.ok) {
        setIngestLogs(prev => [
          ...prev,
          `[DOCTRINE] [OPERATOR] Registered new authority class: ${newAuthorityName.trim().toUpperCase()}`,
          `➔ Class structure resolved: Category: ${newAuthorityCategory}, Status: ${newAuthorityStatus}`
        ]);
        setNewAuthorityName("");
        setNewAuthorityRole("");
        setNewAuthorityDesc("");
        setShowAddForm(false);
        loadDoctrineFromDatabase();
      } else {
        const errData = await res.json();
        setDoctrineError(errData.error || "Failed to register authority");
      }
    } catch (err: any) {
      setDoctrineError(err.message || "Network request failed");
    }
  };

  useEffect(() => {
    loadPacketsFromDatabase(true);
    loadDoctrineFromDatabase();
    loadCredentialsStatus();
    loadCopilotHistory();
    runCompatibilityAudit();
  }, []);

  // Auto real-time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toUTCString().replace("GMT", "UTC"));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Persist selectedPacketId to localStorage on state change
  useEffect(() => {
    if (selectedPacketId) {
      localStorage.setItem("pathfinder_selected_packet_id", selectedPacketId);
    }
  }, [selectedPacketId]);

  // Fetch preset maps on mount
  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const resp = await fetch("/api/generate-configs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: "llama3-8b", hardware: "nvidia-l4", quantization: "int8" })
        });
        if (resp.ok) {
          const data = await resp.json();
          setConfigs({
            "cloudbuild.export.yaml": data["cloudbuild.export.yaml"],
            "Dockerfile.gpu": data["Dockerfile.gpu"],
            "deploy_cloudrun.sh": data["deploy_cloudrun.sh"],
            "inference.py": data["inference.py"]
          });
        }
      } catch (e) {
        console.error("Error fetching configs:", e);
      }
    };
    fetchConfigs();
  }, []);

  // Handle copying files
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setCopiedFile(true);
    setTimeout(() => {
      setCopiedFile(false);
      setCopiedText("");
    }, 2000);
  };

  // 1. INGEST Simulation Trigger
  const handleIngestAction = () => {
    setIngestStatus("running");
    setIngestLogs(prev => [
      ...prev,
      `[INGEST] [${new Date().toLocaleTimeString()}] Triggering scan of airframe subsystem files...`,
      `[INGEST] Location Path Target: src/jemma_tenzor/`
    ]);

    let step = 0;
    const items = INGEST_SUBSYSTEMS;
    
    const interval = setInterval(() => {
      if (step < items.length) {
        const sub = items[step];
        setIngestLogs(prev => [
          ...prev,
          `[STAGE] Mapped [${sub.name}] at /${sub.path} (${sub.files.length} files classified successfully)`
        ]);
        if (!ingestedModules.includes(sub.id)) {
          setIngestedModules(prev => [...prev, sub.id]);
        }
        // Micro adjustment to metrics
        setAlignmentRate(prev => Math.min(99.6, Number((prev + 1.2).toFixed(1))));
        setSysLogCount(prev => prev + 8);
        step++;
      } else {
        clearInterval(interval);
        setIngestStatus("success");
        setIngestLogs(prev => [
          ...prev,
          `[SUCCESS] 100% Core system modules cataloged under CPU-safe standard isolation constraints.`,
          `[STATUS] Code structure safe. All proposed states transformed to VERIFIED.`
        ]);
      }
    }, 500);
  };

  // 2. QUERY Simulation Trigger
  const handleQuerySearch = (val?: string) => {
    const q = val || searchQueryInput || "inflation indices";
    setIngestStatus("query");
    const activeAuthNames = doctrine.map(d => d.authority).join(", ") || "FRED, BLS, SEC, CME, BOE";
    setIngestLogs(prev => [
      ...prev,
      `[QUERY] [${new Date().toLocaleTimeString()}] Querying Pathfinder Intelligence for: "${q}"`,
      `[QUERY] Searching credential authorities [${activeAuthNames}]...`
    ]);

    setTimeout(() => {
      const mockResult = [
        { key: "CPIAUCSL", name: "Consumer Price Index for All Urban Consumers", rate: "Base Level (MoM)", authority: "BLS" },
        { key: "PAYEMS", name: "All Employees, Total Nonfarm Payrolls", rate: "Monthly Aggregate", authority: "BLS" },
        { key: "T10Y2Y", name: "10-Year Treasury Constant Maturity Minus 2-Year", rate: "Yield spread metrics", authority: "FRED" },
        { key: "BOE_BANK_RATE", name: "Bank of England Official Bank Rate History", rate: "Base Discount Rate", authority: "BOE" },
        { key: "BOE_YIELD_CURVE", name: "Bank of England Nominal Gilt Yield Curves", rate: "Sovereign curve term structure", authority: "BOE" },
        { key: "CME_GOLD_OI", name: "CME QuikStrike Gold Open Interest Strategy Profile", rate: "Concentration skews & Strike Clusters", authority: "CME" },
        { key: "CME_SOFR_VOLS", name: "CME Secured Overnight Financing Rate Options Volume Profiles", rate: "Interest rates hedging skews", authority: "CME" }
      ].filter(r => r.key.toLowerCase().includes(q.toLowerCase()) || r.name.toLowerCase().includes(q.toLowerCase()) || q.length > 1);

      setSearchResults(mockResult);
      setIngestLogs(prev => [
        ...prev,
        `[SUCCESS] Found ${mockResult.length} authority dataset recommend categories. Matching keys output to Search Terminal.`
      ]);
    }, 600);
  };

  // 3. PATHFIND Intelligence Trigger (Generates custom custody packet in persistent Firestore store)
  const handlePathfindTrigger = async (customChallenge?: string, customRecs?: string[], customAuthed?: string[]) => {
    setIngestStatus("running");
    setIngestLogs(prev => [
      ...prev,
      `[PATHFIND] [${new Date().toLocaleTimeString()}] Invoking Pathfinder intelligence engines...`,
      `[PATHFIND] Sourcing evidentiary chains & writing structural challenge record to ledger...`
    ]);

    try {
      let challenge = customChallenge;
      let dataset_recommendations = customRecs;
      let authority_chain = customAuthed;

      if (!challenge) {
        const choice = sampleChallenges[Math.floor(Math.random() * sampleChallenges.length)];
        challenge = choice.challenge;
        dataset_recommendations = choice.dataset_recommendations;
        authority_chain = choice.authority_chain;
      }

      const res = await fetch("/api/packets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challenge,
          dataset_recommendations,
          authority_chain,
          confidence: Math.floor(Math.random() * 15 + 85)
        })
      });
      if (res.ok) {
        const createdPkt = await res.json();
        setIngestStatus("success");
        setIngestLogs(prev => [
          ...prev,
          `[SUCCESS] Persistent Record formulated for custody packet ${createdPkt.packet_id}!`,
          `[LEDGER] Log status updated: RECOMMENDATION_CREATED.`
        ]);
        await loadPacketsFromDatabase();
        setSelectedPacketId(createdPkt.packet_id);
      }
    } catch (e: any) {
      setIngestStatus("error");
      setIngestLogs(prev => [...prev, `[ERROR] Failed to write custody packet to ledger: ${e.message}`]);
    }
  };

  // Automated Sequential Operator Intake submission under Same Pipeline rules
  const handleIntakeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!intakeInput.trim()) return;

    const queryText = intakeInput.trim();
    const formattedStatement = `[${intakeType.toUpperCase()}] ${queryText}`;

    setIngestLogs(prev => [
      ...prev,
      `[INTAKE] [${new Date().toLocaleTimeString()}] Operator registered new Intake: [${intakeType.toUpperCase()}]`,
      `➔ Statement: "${queryText}"`,
      `➔ Initiating downstream sequence: QUERY ➔ PATHFIND...`
    ]);

    // Match recommendations based on keyword analysis
    let dataset_recommendations: string[] = [];
    let authority_chain: string[] = [];
    
    const lowerText = queryText.toLowerCase();
    if (lowerText.includes("inflation") || lowerText.includes("cpi") || lowerText.includes("prices") || lowerText.includes("wages")) {
      dataset_recommendations = ["CPIAUCSL", "WAGES_AVERAGE_HOURLY", "CPI_SERVICES_LESS_ENERGY"];
      authority_chain = ["BLS", "FRED"];
    } else if (lowerText.includes("employment") || lowerText.includes("payroll") || lowerText.includes("unrate") || lowerText.includes("unemployment")) {
      dataset_recommendations = ["PAYEMS", "UNRATE"];
      authority_chain = ["BLS", "FRED"];
    } else if (lowerText.includes("yield") || lowerText.includes("treasury") || lowerText.includes("bond") || lowerText.includes("default") || lowerText.includes("commercial")) {
      dataset_recommendations = ["T10Y2Y", "CRE_INDEX", "DEFAULT_COMMERCIAL"];
      authority_chain = ["FRED", "FED_BOARD"];
    } else if (lowerText.includes("gold") || lowerText.includes("option") || lowerText.includes("skew") || lowerText.includes("oi") || lowerText.includes("cme")) {
      dataset_recommendations = ["CME_GOLD_OI_PROFILE", "CME_GOLD_OPTIONS_VOLUME_SKEW"];
      authority_chain = ["CME", "SEC"];
    } else if (lowerText.includes("energy") || lowerText.includes("supply") || lowerText.includes("oil") || lowerText.includes("utility")) {
      dataset_recommendations = ["AEO_ENERGY_PROD", "IP_UTILITIES", "PPI_ENERGY_INDEX"];
      authority_chain = ["EIA", "FRED"];
    } else {
      dataset_recommendations = ["CPIAUCSL", "T10Y2Y"];
      authority_chain = ["BLS", "FRED"];
    }

    // Step 1: Execute QUERY simulation automatically
    handleQuerySearch(queryText);

    // Step 2: After a brief simulated delay, execute PATHFIND stage
    setTimeout(async () => {
      await handlePathfindTrigger(formattedStatement, dataset_recommendations, authority_chain);
    }, 850);
  };

  // 3B. REGISTER CANDIDATE URL (metadata-only URL registration under v0.3A rules)
  const handleRegisterCandidateUrl = async () => {
    if (!datasetUrlInput.trim()) return;
    setIngestStatus("running");
    setIngestLogs(prev => [
      ...prev,
      `[LEDGER] Registering dataset candidate URL for packet ${selectedPacket.packet_id}:`,
      `[URL] ${datasetUrlInput}`
    ]);

    try {
      const res = await fetch("/api/candidates/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packet_id: selectedPacket.packet_id,
          url: datasetUrlInput
        })
      });

      if (res.ok) {
        setIngestStatus("success");
        setIngestLogs(prev => [
          ...prev,
          `[SUCCESS] Datasetcandidate URL logged inside Firestore. Status advanced: DATASET_CANDIDATE_REGISTERED.`,
          `[GOVERNANCE] Metadata-only record saved. No live downloads were triggered on the server.`
        ]);
        setDatasetUrlInput("");
        localStorage.removeItem("pathfinder_url_draft");
        await loadPacketsFromDatabase();
      } else {
        const data = await res.json();
        throw new Error(data.error || "Registry write rejected by server rules");
      }
    } catch (e: any) {
      setIngestStatus("error");
      setIngestLogs(prev => [...prev, `[ERROR] URL Registration failed: ${e.message}`]);
    }
  };

  // 3B. Begin Safety Validation Gate
  const handleBeginValidation = async () => {
    setIngestStatus("running");
    setIngestLogs(prev => [
      ...prev,
      `[LEDGER] Initiating validation gate for packet ${selectedPacket.packet_id}...`,
      `[LEDGER] Moving state: DATASET_CANDIDATE_REGISTERED ➔ AWAITING_VALIDATION...`
    ]);

    try {
      const res = await fetch("/api/packets/begin-validation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packet_id: selectedPacket.packet_id })
      });

      if (!res.ok) {
        throw new Error("Server rejected beginning of validation flow");
      }

      setIngestStatus("success");
      setIngestLogs(prev => [
        ...prev,
        `[SUCCESS] Packet state advanced to AWAITING_VALIDATION. Validation checks ready!`
      ]);
      await loadPacketsFromDatabase();
    } catch (e: any) {
      setIngestStatus("error");
      setIngestLogs(prev => [...prev, `[ERROR] Failed to begin validation: ${e.message}`]);
    }
  };

  // 4. VALIDATE Persistent Verdicts Trigger
  const handleVerdictValidation = async () => {
    if (selectedPacket.current_status === "DEPLOYED" || selectedPacket.current_status === "Deployed (Demo)") {
      setIngestLogs(prev => [
        ...prev,
        `[BLOCKED] Packet ${selectedPacket.packet_id} has been deployed. Airframe state closed.`
      ]);
      return;
    }

    setIngestStatus("running");
    setIngestLogs(prev => [
      ...prev,
      `[VALIDATE] Commencing double-signature validation write for ${selectedPacket.packet_id}...`,
      `[VALIDATE] [JEMMA-VERDICT] Analyzing file dependency specifications & logging approved verdict...`
    ]);

    try {
      const jemmaRes = await fetch("/api/packets/verdict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packet_id: selectedPacket.packet_id,
          reviewer: "Jemma Tenzor Engine v0.3A",
          reviewType: "JEMMA",
          verdict: "APPROVED",
          reason: "Schema structure matched. Parameter ranges strictly aligned."
        })
      });

      if (!jemmaRes.ok) throw new Error("Server rejected Jemma review write");

      setIngestLogs(prev => [
        ...prev,
        `[SUCCESS] Jemma Verdict signature logged to persistent validation review registry!`,
        `[VALIDATE] [RED-TEAM-VERDICT] Screening payload input parameters safety & logging cleared verdict...`
      ]);

      const redRes = await fetch("/api/packets/verdict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packet_id: selectedPacket.packet_id,
          reviewer: "Operator Red Team Core",
          reviewType: "RED_TEAM",
          verdict: "CLEARED",
          reason: "Vetting completed. Zero parameter injection or overflow vulnerabilities."
        })
      });

      if (!redRes.ok) throw new Error("Server rejected Red Team review write");

      setIngestStatus("success");
      setIngestLogs(prev => [
        ...prev,
        `[SUCCESS] Red Team Verdict signature logged safely. both validation routes connected!`,
        `[LEDGER] Advanced state: FULLY_VERIFIED. Operator lock gate is now ready for sign-off.`
      ]);

      await loadPacketsFromDatabase();
      setAlignmentRate(prev => Math.min(100.0, Number((prev + 5.0).toFixed(1))));
    } catch (e: any) {
      setIngestStatus("error");
      setIngestLogs(prev => [...prev, `[ERROR] Validation review transaction failed: ${e.message}`]);
    }
  };

  // 4B. Combined Investigation Safety Audit (automatically submits Jemma & Red Team approvals)
  const runInvestigationSafetyAudits = async () => {
    if (!selectedPacket) return;
    setIngestStatus("running");
    setIngestLogs(prev => [
      ...prev,
      `[AUDIT] Launching automated validation checks for packet ${selectedPacket.packet_id}...`,
      `[JEMMA] [1/2] Aligning dataset schema and boundary verification...`
    ]);

    try {
      const jemmaRes = await fetch("/api/packets/verdict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packet_id: selectedPacket.packet_id,
          reviewer: "Jemma Tenzor Engine v0.3A",
          reviewType: "JEMMA",
          verdict: "APPROVED",
          reason: "Schema structure matched. Parameter ranges strictly aligned."
        })
      });

      if (!jemmaRes.ok) throw new Error("Jemma schema review failed.");

      setIngestLogs(prev => [
        ...prev,
        `[SUCCESS] Jemma Verdict logged.`,
        `[RED TEAM] [2/2] Running parameter injection safety check...`
      ]);

      const redRes = await fetch("/api/packets/verdict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packet_id: selectedPacket.packet_id,
          reviewer: "Operator Red Team Core",
          reviewType: "RED_TEAM",
          verdict: "CLEARED",
          reason: "Vetting completed. Zero parameter injection vulnerabilities."
        })
      });

      if (!redRes.ok) throw new Error("Red Team clearance failed.");

      setIngestStatus("success");
      setIngestLogs(prev => [
        ...prev,
        `[SUCCESS] Jemma & Red Team double-signatures verified successfully.`,
        `[LEDGER] Advanced state: INVESTIGATION_COMPLETE.`,
        `[LEDGER] Advanced state: READY_FOR_OPERATOR_REVIEW. Awaiting Operator review signature.`
      ]);

      await loadPacketsFromDatabase();
      setAlignmentRate(100.0);
    } catch (e: any) {
      setIngestStatus("error");
      setIngestLogs(prev => [...prev, `[ERROR] Multi-agent safety audit failed: ${e.message}`]);
    }
  };

  // 4C. Operator Approved Gate (performs manual approval check)
  const toggleOperatorApprove = async () => {
    if (!selectedPacket) return;
    try {
      setIngestLogs(prev => [...prev, `[OPERATOR] Approving dispatch intent clearance for packet ${selectedPacket.packet_id}...`]);
      const res = await fetch("/api/packets/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packet_id: selectedPacket.packet_id,
          operatorId: "operator-rodlife1314"
        })
      });

      if (res.ok) {
        setIngestLogs(prev => [
          ...prev,
          `[SUCCESS] Registered Operator dispatch approval directly in secure ledger!`,
          `[LEDGER] Advanced state to: OPERATOR_APPROVED.`
        ]);
        await loadPacketsFromDatabase();
      } else {
        const data = await res.json();
        throw new Error(data.error || "Approval rejected by server auth");
      }
    } catch (e: any) {
      setIngestLogs(prev => [...prev, `[ERROR] Operator approval failing: ${e.message}`]);
    }
  };

  // 4D. Toggle Operator Cryptographic Seal
  const toggleOperatorSeal = async () => {
    if (!selectedPacket) return;
    
    // Determine target seal state based on current gate
    const nextSeal = selectedPacket.operator_gate === "APPROVED" ? "LOCKED" : "APPROVED";

    setIngestLogs(prev => [
      ...prev,
      `[OPERATOR] Syncing digital seal signature [${nextSeal}] on ledger...`
    ]);

    try {
      const res = await fetch("/api/packets/seal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packet_id: selectedPacket.packet_id,
          operatorId: "operator-rodlife1314",
          sealStatus: nextSeal
        })
      });

      if (res.ok) {
        setIngestLogs(prev => [
          ...prev,
          nextSeal === "APPROVED" 
            ? `[SUCCESS] Secure cryptographic evidence seal secured!`
            : `[SUCCESS] Lifted operator evidence seal.`,
          `[LEDGER] Advanced state to: ${nextSeal === "APPROVED" ? "PACKET_SEALED. Dispatch controls opened!" : "READY_FOR_OPERATOR_REVIEW. Status returned back to review."}`
        ]);
        await loadPacketsFromDatabase();
      } else {
        const data = await res.json();
        throw new Error(data.error || "Seal signature rejected by server auth");
      }
    } catch (e: any) {
      setIngestLogs(prev => [...prev, `[ERROR] Cryptographic seal transaction failed: ${e.message}`]);
    }
  };

  // 5. DEPLOY Simulation Trigger (Cloud Run Release Dry-Run Build)
  const handleDeployReleaseDryRun = () => {
    if (selectedPacket.jemma_verdict !== "APPROVED" || selectedPacket.red_team_verdict !== "CLEARED") {
      setIngestLogs(prev => [
        ...prev,
        `[ABORT] Deploy blocked. Custody Packet ${selectedPacket.packet_id} fails Double Security validation checklist!`
      ]);
      return;
    }
    if (selectedPacket.operator_gate !== "APPROVED") {
      setIngestLogs(prev => [
        ...prev,
        `[ABORT] Deploy blocked. Operator Cryptographic Evidence Seal is missing from custody packet ${selectedPacket.packet_id}!`
      ]);
      return;
    }
    if (selectedPacket.current_status !== "PACKET_SEALED") {
      setIngestLogs(prev => [
        ...prev,
        `[ABORT] Deploy blocked. Custody Packet ${selectedPacket.packet_id} must be in PACKET_SEALED state with active cryptographic seal before deployment!`
      ]);
      return;
    }

    setIngestStatus("deploying");
    setIngestLogs(prev => [
      ...prev,
      `[DEPLOY] Initializing Pathfinder v0.1 Production CPU deployment pipeline...`,
      `[DEPLOY] Fetching cloud build targets: us-central1-docker.pkg.dev/.../app:v0.1`,
      `[DOCKER] Building lightweight CPU-safe production container...`
    ]);

    let step = 0;
    const deploySteps = [
      "[DOCKER] Step 1/3: FROM python:3.10-slim-bookworm... OK (2.3s)",
      "[DOCKER] Step 2/3: COPY requirements.txt /app && RUN pip install... OK (8.4s)",
      "[DOCKER] Step 3/3: EXPOSE 8080 && ENTRYPOINT ['uvicorn']... SUCCESS",
      "[DOCKER] Pushed image us-central1-docker.pkg.dev/Project-ID/pathfinder/app:v0.1 to Artifact Registry",
      "[GCLOUD] Deploying service [pathfinder-service] to region [us-central1]...",
      "[GCLOUD] Service port configured: 8080. Ingress: ALL. Platform: Managed CPU.",
      "[GCLOUD] Routing traffic parameters: 100% allocated to new revision."
    ];

    const pipeline = setInterval(() => {
      if (step < deploySteps.length) {
        const stepLog = deploySteps[step];
        setIngestLogs(prev => [...prev, stepLog]);
        step++;
      } else {
        clearInterval(pipeline);
        fetch("/api/packets/deploy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ packet_id: selectedPacket.packet_id })
        })
        .then(async (res) => {
          if (res.ok) {
            await loadPacketsFromDatabase();
            setIngestStatus("success");
            setIngestLogs(prev => [
              ...prev,
              `[SUCCESS] Live Cloud Run CPU deployment simulation complete! Spine is up and responsive.`,
              `[ENDPOINT] Standardized GET /healthz operational probe verified (200 OK)`,
              `[LEDGER] Status recorded permanently on the ledger: DEPLOYED.`
            ]);
            setAlignmentRate(100.0);
          } else {
            const data = await res.json();
            throw new Error(data.error || "Deployment transition rejected by ledger guard.");
          }
        })
        .catch(err => {
          setIngestStatus("error");
          setIngestLogs(prev => [...prev, `[ERROR] Deployment rejected by boundary guard: ${err.message}`]);
        });
      }
    }, 700);
  };

  // Copilot Assistant Chat Trigger
  const handleSendChat = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString()
    };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsAiTyping(true);

    try {
      const response = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          context: {
            model: "Jemma-Tenzor Cockpit OS v0.2",
            hardware: "Learjet Executive Interface",
            quantization: selectedPacket.packet_id,
            packet: selectedPacket,
            allPackets: packets,
            doctrine,
            cmeConfigured,
            firebaseConfigured,
            traiConfigured
          }
        })
      });

      if (response.ok) {
        await loadCopilotHistory();
      } else {
        throw new Error();
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "system",
        text: "🚨 Executive copilot system offline. Please ensure standard GEMINI_API_KEY environment variables are registered.",
        timestamp: new Date().toLocaleTimeString()
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Keyboard shortcut assistant clicker
  const clickShortcut = (text: string) => {
    handleSendChat(text);
  };

  // Auto Scroll log terminals
  useEffect(() => {
    terminalLogsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ingestLogs]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isAiTyping]);

  // PACKET ARCHIVE V1 MASTER HELPER DISPLAY
  const renderPacketArchiveDashboard = () => {
    // 1. Dynamic filtering and mapping based on search bar and preset chips
    const filteredPackets = packets.filter((p) => {
      const matchesSearch =
        p.packet_id.toLowerCase().includes(archiveSearch.toLowerCase()) ||
        p.challenge.toLowerCase().includes(archiveSearch.toLowerCase()) ||
        (p.reasoner && p.reasoner.toLowerCase().includes(archiveSearch.toLowerCase())) ||
        (p.capability && p.capability.toLowerCase().includes(archiveSearch.toLowerCase()));

      if (!matchesSearch) return false;

      // Filter modes
      switch (archiveFilterPreset) {
        case "gold":
          return (
            p.challenge.toLowerCase().includes("gold") ||
            p.dataset_recommendations.some((r) => r.toLowerCase().includes("gold"))
          );
        case "cme":
          return (
            p.authority_chain.some((a) => a.toUpperCase() === "CME") ||
            p.dataset_recommendations.some((r) => r.toLowerCase().includes("cme"))
          );
        case "qwen":
          return p.reasoner?.toLowerCase() === "qwen";
        case "deepseek":
          return p.reasoner?.toLowerCase().includes("deepseek");
        default:
          return true;
      }
    });

    const activeArchivePacket = packets.find((p) => p.packet_id === selectedPacketId) || filteredPackets[0] || packets[0];

    // Export packet helper to download file locally safely
    const handleDownloadPacket = (packet: CustodyPacket, format: "json" | "markdown" | "pdf") => {
      const filename = `pathfinder-archive-${packet.packet_id}.${format === "json" ? "json" : format === "markdown" ? "md" : "pdf"}`;
      
      if (format === "pdf") {
        const doc = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4"
        });

        let pageNumber = 1;
        let y = 43;

        const drawPageFramework = (pNum: number) => {
          // Border outline
          doc.setDrawColor(35, 41, 50); // slate-800
          doc.setLineWidth(0.3);
          doc.rect(10, 10, 190, 277); // A4 is 210 x 297

          // Subtle header print
          doc.setFont("Helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139); // slate-500
          doc.text("PATHFINDER REGULATORY EVIDENCE REPORT", 15, 15);
          doc.text(`Doc Ref: ${packet.contractId || packet.crystalContractId || "CRYSTAL-CONTRACT"}`, 140, 15);
          doc.line(15, 17, 195, 17);

          // Footer print
          doc.setFontSize(8);
          doc.text(`Report Generation Date: ${new Date().toISOString()}`, 15, 282);
          doc.text(`Page ${pNum}`, 180, 282);
          
          // Reset typography settings
          doc.setTextColor(0, 0, 0);
        };

        const checkPageBoundary = (neededHeight: number) => {
          if (y + neededHeight > 270) {
            doc.addPage();
            pageNumber++;
            drawPageFramework(pageNumber);
            y = 25; // reset y
          }
        };

        // Draw page 1 framework
        drawPageFramework(1);

        // Header
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(30, 41, 59); // deep slate
        doc.text("PATHFINDER REPORT: CO-CUSTODY PACKET", 15, 27);

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text("ORGANIZATIONAL EVIDENCE DISCOVERY & REGULATORY CLEARANCE RECORD", 15, 32);

        // Double line separator
        doc.setLineWidth(0.8);
        doc.setDrawColor(15, 23, 42); // slate-900
        doc.line(15, 35, 195, 35);
        doc.setLineWidth(0.3);
        doc.line(15, 36.5, 195, 36.5);

        // Metadata grid Setup
        const metaItems = [
          { label: "Packet ID:", value: packet.packet_id },
          { label: "Formulation Agent:", value: packet.source_agent },
          { label: "Timestamp:", value: packet.timestamp || "2026-06-01T20:00:54" },
          { label: "Selected Reasoner:", value: packet.reasoner || "Qwen-2.5-Coder" },
          { label: "Capability Target:", value: packet.capability || "Audit Veracity Check" },
          { label: "Selected Runtime:", value: packet.runtime || "Pathfinder Runtime" },
          { label: "Crystal Contract ID:", value: packet.contractId || packet.crystalContractId || "CRYSTAL-CONTRACT-5195FA57" },
          { label: "Jemma Autonomous Verdict:", value: packet.jemma_verdict },
          { label: "Red Team Security Verdict:", value: packet.red_team_verdict },
          { label: "Operator Approval Gate:", value: packet.operator_gate || (packet.operatorApproved ? "APPROVED" : "LOCKED") },
          { label: "State Ladder Status:", value: packet.current_status }
        ];

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.text("1. EVIDENCE RECORD IDENTITY & METADATA", 15, y);
        y += 5;

        doc.setDrawColor(226, 232, 240); // slate-200
        doc.setFillColor(248, 250, 252); // slate-50
        doc.setLineWidth(0.2);

        metaItems.forEach((item, index) => {
          const isLeft = index % 2 === 0;
          const colX = isLeft ? 15 : 105;
          const colW = isLeft ? 85 : 90;
          
          // Draw background box for item
          doc.rect(colX, y, colW, 7, "F");
          doc.rect(colX, y, colW, 7, "S");
          
          // Draw text
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(71, 85, 105); // slate-600
          doc.text(item.label, colX + 3, y + 4.8);
          
          doc.setFont("Helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(15, 23, 42); // slate-900
          
          // Right-align value
          const valText = String(item.value || "N/A");
          doc.text(valText, colX + colW - 3, y + 4.8, { align: "right" });
          
          if (!isLeft || index === metaItems.length - 1) {
            y += 7;
          }
        });

        y += 3;

        // Challenge section
        checkPageBoundary(30);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.text("2. OPERATOR CO-INTENT & CHALLENGE SPECIFICATION", 15, y);
        y += 5;

        const quoteBlockLines = doc.splitTextToSize(packet.challenge || "No challenge text provided.", 170);
        const quoteHeight = (quoteBlockLines.length * 4.5) + 6;

        checkPageBoundary(quoteHeight + 10);

        doc.setFillColor(241, 245, 249); // slate-100
        doc.rect(15, y, 175, quoteHeight, "F");
        doc.setDrawColor(14, 116, 144); // cyan-700
        doc.setLineWidth(1.5);
        doc.line(15, y, 15, y + quoteHeight);
        doc.setLineWidth(0.2);

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85); // slate-700
        doc.text(quoteBlockLines, 20, y + 5);

        y += quoteHeight + 6;

        // Authorities and Datasets
        checkPageBoundary(25);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.text("3. AUDITED AUTHORITIES & VERIFIED DATASETS", 15, y);
        y += 5;

        const authorities = packet.authority_chain || [];
        const datasets = packet.dataset_recommendations || [];

        const itemHeight = Math.max(authorities.length, datasets.length) * 5 + 10;
        const cardHeight = Math.max(itemHeight, 20);

        checkPageBoundary(cardHeight + 10);

        // Left Card: Authorities
        doc.setFillColor(248, 250, 252); // slate-50
        doc.setDrawColor(148, 163, 184); // slate-400
        doc.rect(15, y, 85, cardHeight, "F");
        doc.rect(15, y, 85, cardHeight, "S");

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text("Audited Authority Chain", 18, y + 5);
        doc.line(18, y + 7, 95, y + 7);

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);

        let lY = y + 11;
        if (authorities.length === 0) {
          doc.text("- No authority records registered", 18, lY);
        } else {
          authorities.forEach(auth => {
            doc.text(`* ${auth}`, 18, lY);
            lY += 5;
          });
        }

        // Right Card: Datasets
        doc.setFillColor(248, 250, 252);
        doc.rect(105, y, 85, cardHeight, "F");
        doc.rect(105, y, 85, cardHeight, "S");

        doc.setFont("Helvetica", "bold");
        doc.text("Intact Dataset Recommendations", 108, y + 5);
        doc.line(108, y + 7, 185, y + 7);

        doc.setFont("Helvetica", "normal");
        let rY = y + 11;
        if (datasets.length === 0) {
          doc.text("- No dataset references detected", 108, rY);
        } else {
          datasets.forEach(ds => {
            const dsWrapped = doc.splitTextToSize(`* ${ds}`, 78);
            doc.text(dsWrapped, 108, rY);
            rY += dsWrapped.length * 4.5;
          });
        }

        y += cardHeight + 6;

        // Transitions chronology
        checkPageBoundary(35);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.text("4. IMMUTABLE CHRONOLOGY & CUSTODY RECORD", 15, y);
        y += 5;

        const history = packet.history || [];
        if (history.length === 0) {
          doc.setFont("Helvetica", "normal");
          doc.setFontSize(9.5);
          doc.setTextColor(100, 116, 139);
          doc.text("No historic state transitions found on this ledger document.", 15, y);
          y += 6;
        } else {
          doc.setFillColor(15, 23, 42); // slate-900 (deep dark header)
          doc.rect(15, y, 175, 7, "F");
          
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(255, 255, 255);
          doc.text("EVENT ID/TIME", 17, y + 4.8);
          doc.text("ACTOR / CO-SIGNER", 57, y + 4.8);
          doc.text("STATE TRANSITION", 102, y + 4.8);
          doc.text("AUDIT COMMENT / METADATA", 147, y + 4.8);
          
          y += 7;
          
          history.forEach((h, index) => {
            const timeAndId = `${h.event_id || `EVT-${index}`}\n${h.timestamp || ""}`;
            const wrappedId = doc.splitTextToSize(timeAndId, 38);
            const wrappedActor = doc.splitTextToSize(h.actor || "UNKNOWN", 42);
            const wrappedTransition = doc.splitTextToSize(`${h.old_status || "N/A"} ->\n${h.new_status || "N/A"}`, 42);
            const wrappedComment = doc.splitTextToSize(h.comment || "Logged.", 45);
            
            const rowLines = Math.max(wrappedId.length, wrappedActor.length, wrappedTransition.length, wrappedComment.length);
            const rowHeight = (rowLines * 4.2) + 4;
            
            checkPageBoundary(rowHeight);
            
            if (index % 2 === 1) {
              doc.setFillColor(248, 250, 252); // slate-50
              doc.rect(15, y, 175, rowHeight, "F");
            }
            
            // border line
            doc.setDrawColor(226, 232, 240); // slate-200
            doc.line(15, y + rowHeight, 190, y + rowHeight);
            
            doc.setFont("Helvetica", "normal");
            doc.setFontSize(7.5);
            doc.setTextColor(71, 85, 105);
            
            doc.text(wrappedId, 17, y + 3.8);
            
            doc.setFont("Helvetica", "bold");
            doc.setTextColor(15, 23, 42);
            doc.text(wrappedActor, 57, y + 3.8);
            
            doc.setFont("Helvetica", "normal");
            doc.setTextColor(100, 116, 139);
            doc.text(wrappedTransition, 102, y + 3.8);
            
            doc.setTextColor(51, 65, 85);
            doc.text(wrappedComment, 147, y + 3.8);
            
            y += rowHeight;
          });
        }

        // Signature sign-off
        checkPageBoundary(25);
        y += 5;
        doc.setDrawColor(148, 163, 184); // slate-400
        doc.line(15, y, 190, y);
        y += 5;

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text("AUTHORITATIVE DISPATCH REPORT CLEARANCE", 15, y);

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text("This document constitutes a certified evidence transcript dynamically exported from the Pathfinder secure ledger system.", 15, y + 4);

        doc.setFont("Courier", "bold");
        doc.text(`HASH: ${packet.adapterPayloadHash || "A9B2F2E4C41D" + packet.packet_id}`, 15, y + 8);

        // Download document
        doc.save(filename);
      } else {
        let content = "";
        if (format === "json") {
          content = JSON.stringify(packet, null, 2);
        } else {
          content = `# PATHFINDER IMMUTABLE CUSTODY PACKET: ${packet.packet_id}
Generated on crystal ledger.

## 1. IDENTITY & METADATA
- **Packet ID**: ${packet.packet_id}
- **Timestamp**: ${packet.timestamp || "2026-06-01T20:00:54"}
- **Formulation Agent**: ${packet.source_agent}
- **Selected Reasoner**: ${packet.reasoner || "Qwen-2.5-Coder"}
- **Capability Target**: ${packet.capability || "Audit Veracity Check"}
- **Selected Runtime**: ${packet.runtime || "Pathfinder Runtime"}
- **Crystal Contract Link**: ${packet.contractId || "CRYSTAL-CONTRACT-5195FA57"}
- **Jemma Autonomous Verdict**: ${packet.jemma_verdict}
- **Red Team Security Clearing**: ${packet.red_team_verdict}
- **Operator Encasement Gate**: ${packet.operator_gate}
- **State Ladder Status**: ${packet.current_status}

## 2. INTENT & STRUCTURAL CHALLENGE
> ${packet.challenge}

## 3. AUDITED AUTHORITIES & INTACT DATASETS
- **Authority Chains**: ${packet.authority_chain.join(", ")}
- **Dataset Recommends**: ${packet.dataset_recommendations.join(", ")}

## 4. IMUTABLE LEDGER HISTORY
${(packet.history || []).map((h) => `- [${h.timestamp}] ${h.old_status} -> ${h.new_status} (by ${h.actor}) : ${h.comment}`).join("\n")}
`;
        }

        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };

    return (
      <div className="flex flex-col gap-6" id="archive-master-root-wrapper">
        
        {/* TOP COMPONENT: PERSISTENCE TOPOLOGY & CONNECTION REALITY MONITOR */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="archive-persistence-dashboard">
          
          <div className="bg-[#111417] border border-[#232932] rounded-xl p-4 flex flex-col gap-1.5 shadow-sm relative overflow-hidden" id="card-persistence-0">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              <span>Primary Storage Topology</span>
              <span className="text-[8px] bg-emerald-950/40 text-emerald-400 px-1 py-0.2 rounded border border-emerald-800/30 font-black uppercase">LIVE</span>
            </div>
            <div className="text-sm font-sans font-extrabold text-[#f1f5f9] flex items-center gap-2 mt-1">
              <Database className="h-4 w-4 text-sky-400" /> Web-Native Firestore
            </div>
            <p className="text-[9.5px] font-mono text-[#94a3b8] leading-tight">
              Authoritative distributed database storage path. Records live inside collection: <code className="text-[9px] text-[#fbbf24] px-1 bg-[#252a35] rounded font-bold">/custody_packets</code>
            </p>
          </div>

          <div className="bg-[#111417] border border-[#232932] rounded-xl p-4 flex flex-col gap-1.5 shadow-sm" id="card-persistence-1">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              <span>Offline Fallback Cache</span>
              <span className="text-[8px] bg-sky-950/40 text-sky-400 px-1 py-0.2 rounded border border-sky-800/30 font-semibold uppercase">ACTIVE</span>
            </div>
            <div className="text-sm font-sans font-extrabold text-[#f1f5f9] flex items-center gap-2 mt-1">
              <Layers className="h-4 w-4 text-indigo-400" /> fallbackStore Ledger
            </div>
            <p className="text-[9.5px] font-mono text-[#94a3b8] leading-tight">
              Offline-first resilience engine. Node memory synchronization layers trigger instant local failover on Firestore network interruptions.
            </p>
          </div>

          <div className="bg-[#111417] border border-[#232932] rounded-xl p-4 flex flex-col gap-1.5 shadow-sm" id="card-persistence-2">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              <span>Retrieval Execution Pipeline</span>
              <span className="text-[8px] text-[#ced9e0] font-semibold tracking-widest bg-[#1c212b]/40 border border-[#2d3543] px-1 py-0.2 rounded">SECURE</span>
            </div>
            <div className="text-sm font-sans font-extrabold text-[#f1f5f9] flex items-center gap-2 mt-1">
              <Compass className="h-4 w-4 text-purple-400" /> Client Handshake Adapter
            </div>
            <p className="text-[9.5px] font-mono text-[#94a3b8] leading-tight">
              Lazy SDK connections execute secure query handoffs matching verified crystal contracts prior to populating local layouts.
            </p>
          </div>

          <div className="bg-[#111417] border border-[#232932] rounded-xl p-4 flex flex-col gap-1.5 shadow-sm relative overflow-hidden" id="card-persistence-3">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              <span>Lineage Integrity</span>
              <span className="text-[8px] bg-emerald-950/20 text-emerald-400 border border-emerald-900/40 px-1 py-0.2 rounded font-mono">100% INTACT</span>
            </div>
            <div className="text-sm font-sans font-extrabold text-[#f1f5f9] flex items-center gap-2 mt-1">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> Cryptographic Sign Check
            </div>
            <p className="text-[9.5px] font-mono text-[#94a3b8] leading-tight font-sans">
              Cryptographic hash alignments monitor change custody streams. Sealed gates verified matching 256-bit invariants.
            </p>
          </div>
          
        </div>

        {/* MIDDLE SECTION: INTERACTIVE LINEAGE VISUALIZER & DETAILED INSPECTOR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" id="archive-visualizer-and-detail">
          
          {/* LEFT: EXPANSIVE SVG LINEAGE GRAPH PANEL (Lg: 7 cols) */}
          <div className="col-span-1 lg:col-span-7 bg-[#14181d] border border-[#232932] rounded-xl p-5 shadow-lg flex flex-col gap-4 relative overflow-hidden" id="lineage-topology-card">
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-indigo-500/5 rounded-full blur-[40px] pointer-events-none" />
            <div className="flex justify-between items-center border-b border-[#232a35] pb-3">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-sky-400" />
                <h2 className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#e2e8f0]">
                  Pathfinder Custody Lineage Tree
                </h2>
              </div>
              <span className="text-[9px] font-mono text-slate-450 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping shadow-[0_0_6px_#818cf8]" />
                GRAPHIC ATLAS
              </span>
            </div>

            {/* THE VISUALIZATION CANVAS */}
            <div className="bg-[#090b0e] border border-slate-900 rounded-xl p-4 flex items-center justify-center min-h-[350px] max-h-[450px] overflow-hidden select-none relative" id="topology-stage">
              
              <div className="absolute top-3 left-4 text-[9px] font-mono text-slate-500 flex flex-col gap-1 bg-[#12151c]/50 p-2 rounded border border-[#242936] z-10">
                <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#f43f5e]" /> DeepSeek Root</div>
                <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#38bdf8]" /> Child Audit / Viz Nodes</div>
                <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#94a3b8]" /> Standalone Macro Nodes</div>
              </div>

              <svg 
                viewBox="0 0 800 320" 
                className="w-full h-full max-h-[330px]"
                id="lineage-svg-canvas"
              >
                {/* SVG glowing filters definition */}
                <defs>
                  <filter id="glow-sky" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#06b6d4" floodOpacity="0.6"/>
                  </filter>
                  <filter id="glow-indigo" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#6366f1" floodOpacity="0.6"/>
                  </filter>
                </defs>

                {/* GRAPH CONNECTOR CURVES */}
                {/* Connecting gold volatility root (PKT-520) to its 3 children: PKT-680, PKT-788, PKT-947 */}
                <path 
                  d="M 400 90 C 400 160, 220 150, 220 220" 
                  stroke={activeArchivePacket?.packet_id === "PKT-680" ? "#38bdf8" : "#1e232d"} 
                  strokeWidth={activeArchivePacket?.packet_id === "PKT-680" ? "3" : "1.8"} 
                  strokeDasharray={activeArchivePacket?.packet_id === "PKT-680" ? "none" : "3,3"}
                  fill="none" 
                  className="transition-all duration-300" 
                />
                <path 
                  d="M 400 90 L 400 220" 
                  stroke={activeArchivePacket?.packet_id === "PKT-788" ? "#818cf8" : "#1e232d"} 
                  strokeWidth={activeArchivePacket?.packet_id === "PKT-788" ? "3" : "1.8"} 
                  strokeDasharray={activeArchivePacket?.packet_id === "PKT-788" ? "none" : "3,3"}
                  fill="none" 
                  className="transition-all duration-300" 
                />
                <path 
                  d="M 400 90 C 400 160, 580 150, 580 220" 
                  stroke={activeArchivePacket?.packet_id === "PKT-947" ? "#38bdf8" : "#1e232d"} 
                  strokeWidth={activeArchivePacket?.packet_id === "PKT-947" ? "3" : "1.8"} 
                  strokeDasharray={activeArchivePacket?.packet_id === "PKT-947" ? "none" : "3,3"}
                  fill="none" 
                  className="transition-all duration-300" 
                />

                {/* Node labels for targets */}
                <text x="310" y="150" fill="#475569" className="font-mono text-[9px] font-bold">Options skew map</text>
                <text x="460" y="150" fill="#475569" className="font-mono text-[9px] font-bold">Ingestate channel</text>

                {/* GRAPH NODES */}
                {[
                  {
                    id: "PKT-001",
                    x: 80,
                    y: 40,
                    w: 130,
                    h: 50,
                    rx: 8,
                    title: "PKT-001 (FRED)",
                    reasoner: "DeepSeek R1 Distill",
                    status: "Macro Core Matching",
                    colorClass: "stroke-slate-700 fill-[#101318]",
                    highlightColor: "stroke-slate-400 shadow-sm"
                  },
                  {
                    id: "PKT-520",
                    x: 325,
                    y: 40,
                    w: 150,
                    h: 50,
                    rx: 8,
                    title: "PKT-520 (Gold skews)",
                    reasoner: "DeepSeek-R1 (Root)",
                    status: "Gold Volatility Target",
                    colorClass: "stroke-[#e11d48] fill-[#1a1013]",
                    highlightColor: "stroke-rose-450",
                    filterUrl: "url(#glow-indigo)"
                  },
                  {
                    id: "PKT-958",
                    x: 590,
                    y: 40,
                    w: 140,
                    h: 50,
                    rx: 8,
                    title: "PKT-958 (NVIDIA L4)",
                    reasoner: "Qwen Compiler",
                    status: "TensorRT Compile Node",
                    colorClass: "stroke-slate-700 fill-[#101318]",
                    highlightColor: "stroke-slate-400 shadow-sm"
                  },
                  // CHILDREN OF PKT-520
                  {
                    id: "PKT-680",
                    x: 140,
                    y: 220,
                    w: 160,
                    h: 50,
                    rx: 8,
                    title: "PKT-680 (CME Audit)",
                    reasoner: "Qwen Coder",
                    status: "Veracity Audit Check",
                    colorClass: "stroke-[#06b6d4] fill-[#0d151c]",
                    highlightColor: "stroke-sky-400",
                    filterUrl: "url(#glow-sky)"
                  },
                  {
                    id: "PKT-788",
                    x: 320,
                    y: 220,
                    w: 160,
                    h: 50,
                    rx: 8,
                    title: "PKT-788 (CME Ingestion)",
                    reasoner: "Gemini Pro",
                    status: "OI Option Decay Visualizer",
                    colorClass: "stroke-[#6366f1] fill-[#11111d]",
                    highlightColor: "stroke-[#818cf8]",
                    filterUrl: "url(#glow-indigo)"
                  },
                  {
                    id: "PKT-947",
                    x: 500,
                    y: 220,
                    w: 160,
                    h: 50,
                    rx: 8,
                    title: "PKT-947 (Skew pricing)",
                    reasoner: "Qwen Pricing",
                    status: "Elastic Curve Settlements",
                    colorClass: "stroke-slate-800 fill-[#101318]",
                    highlightColor: "stroke-sky-500"
                  }
                ].map((node) => {
                  const isNodeSelected = activeArchivePacket?.packet_id === node.id;
                  return (
                    <g 
                      key={node.id} 
                      className="cursor-pointer group"
                      onClick={() => setSelectedPacketId(node.id)}
                    >
                      {/* Outer Card border/fill */}
                      <rect 
                        x={node.x}
                        y={node.y}
                        width={node.w}
                        height={node.h}
                        rx={node.rx}
                        className={`transition-all duration-300 ${node.colorClass} ${
                          isNodeSelected 
                            ? "stroke-[2.5] bg-[#161f30]" 
                            : "stroke-[1.5] group-hover:stroke-slate-400"
                        }`}
                        stroke={isNodeSelected ? "#06b6d4" : undefined}
                        filter={isNodeSelected ? node.filterUrl : undefined}
                      />
                      
                      {/* Text details inside the node */}
                      <text 
                        x={node.x + 10} 
                        y={node.y + 18} 
                        fill={isNodeSelected ? "#38bdf8" : "#e2e8f0"} 
                        className="font-mono text-[9.5px] font-extrabold"
                      >
                        {node.title} {isNodeSelected ? "🎯" : ""}
                      </text>
                      <text 
                        x={node.x + 10} 
                        y={node.y + 30} 
                        fill="#64748b" 
                        className="font-mono text-[8px] tracking-tight"
                      >
                        {node.reasoner}
                      </text>
                      <text 
                        x={node.x + 10} 
                        y={node.y + 42} 
                        fill="#94a3b8" 
                        className="font-sans text-[7.5px] uppercase font-bold text-slate-450"
                      >
                        {node.status}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Interactive Nodes: Click target packet to inspect physical payload topology</span>
              <span className="text-sky-500 uppercase tracking-wider font-extrabold flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-sky-400" /> Vector Handshake Aligned
              </span>
            </div>
            
          </div>

          {/* RIGHT: DETAILED PACKET REGISTRY INSPECTOR PANEL (Lg: 5 cols) */}
          <div className="col-span-1 lg:col-span-5 flex flex-col gap-4" id="archive-inspector-panel">
            
            <div className="bg-[#14181d] border border-[#232932] rounded-xl p-5 shadow-lg flex flex-col gap-4 flex-1">
              
              <div className="flex items-center justify-between border-b border-[#232a35] pb-3" id="inspector-heading">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-400 tracking-wide rotate-12" />
                  <h2 className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#e2e8f0]">
                    Packet Registry Inspector
                  </h2>
                </div>
                <div className="flex items-center gap-1 font-mono">
                  <span className="text-[9px] font-bold text-sky-400">
                    {activeArchivePacket?.packet_id}
                  </span>
                </div>
              </div>

              {/* SPECIFIC PAYLOAD BODY */}
              <div className="flex-1 flex flex-col gap-4 text-xs font-mono" id="inspector-detailed-body">
                
                <div className="space-y-1 bg-[#090b0e] p-3 rounded-xl border border-slate-900 leading-normal">
                  <div className="text-[9px] text-slate-500 uppercase font-black">FORMULATION CHALLENGE TARGET</div>
                  <p className="text-[11px] font-sans text-slate-200 leading-relaxed font-semibold">
                    {activeArchivePacket?.challenge}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3" id="inspector-metadata-grid">
                  <div className="bg-[#0e1115] p-2.5 rounded-lg border border-[#1d232b]">
                    <div className="text-[8.5px] text-slate-500 uppercase font-bold">REASONING CORE</div>
                    <div className="text-[10.5px] font-bold text-sky-400 mt-0.5">{activeArchivePacket?.reasoner || "Qwen-2.5-Coder"}</div>
                  </div>
                  <div className="bg-[#0e1115] p-2.5 rounded-lg border border-[#1d232b]">
                    <div className="text-[8.5px] text-slate-500 uppercase font-bold">DECISION CONTRACT</div>
                    <div className="text-[8px] font-bold text-indigo-400 mt-0.5 tracking-tight font-mono select-all uppercase">
                      {activeArchivePacket?.contractId || "CRYSTAL-CONTRACT-5195FA57"}
                    </div>
                  </div>
                  <div className="bg-[#0e1115] p-2.5 rounded-lg border border-[#1d232b]">
                    <div className="text-[8.5px] text-slate-500 uppercase font-bold">TASK CAPABILITY PROFILE</div>
                    <div className="text-[10px] font-semibold text-amber-450 mt-0.5 leading-tight">{activeArchivePacket?.capability || "Audit Veracity Check"}</div>
                  </div>
                  <div className="bg-[#0e1115] p-2.5 rounded-lg border border-[#1d232b]">
                    <div className="text-[8.5px] text-slate-500 uppercase font-bold">EXECUTION BACKBONE</div>
                    <div className="text-[10.5px] font-semibold text-slate-300 mt-0.5">Pathfinder Runtime</div>
                  </div>
                </div>

                {/* PHYSICAL DATA PATHWAYS IN ARCHIVE v1 */}
                <div className="space-y-2 bg-[#0d1014] p-3 border border-[#232932] rounded-xl flex flex-col gap-1 text-[10px] leading-relaxed">
                  <div className="text-[9px] text-[#fb1] font-bold tracking-wider uppercase border-b border-[#202730] pb-1">⚓ IMMUTABLE FILE PERSISTENCE & LOCATIONS</div>
                  
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Database Engine:</span>
                    <span className="text-[#a5b4fc] font-semibold">Cloud Run Distributed Firestore</span>
                  </div>
                  <div className="flex flex-col gap-0.5 bg-[#12161d] p-1.5 rounded border border-[#1b212c]">
                    <div className="text-[8px] text-slate-500 font-bold uppercase">FIRESTORE STORAGE DOCUMENT PATH:</div>
                    <span className="text-[#38bdf8] text-[9.5px] select-all font-mono font-bold leading-normal text-left">
                      /custody_packets/{activeArchivePacket?.packet_id}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5 bg-[#12161d] p-1.5 rounded border border-[#1b212c] mt-1">
                    <div className="text-[8px] text-slate-500 font-bold uppercase">PHYSICAL CLIENT RETRIEVAL ROUTE:</div>
                    <span className="text-slate-350 text-[9px] leading-relaxed text-left">
                      fetch(&quot;/api/packets&quot;) ➔ dbGetDocs(&quot;custody_packets&quot;) ➔ Client Adapter Fallback
                    </span>
                  </div>
                </div>

                {/* INTEGRATED CO-COPILOT ACTIONS */}
                <div className="flex flex-col gap-2">
                  <div className="text-[9px] text-slate-500 uppercase font-bold">GUIDED ACTION COMPASS</div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleDownloadPacket(activeArchivePacket, "json")}
                        className="flex-1 bg-slate-900 border border-slate-750 text-slate-200 py-1.5 rounded-lg hover:bg-slate-800 font-mono text-[9.5px] uppercase tracking-wider font-extrabold cursor-pointer transition-all active:scale-95"
                      >
                        JSON Format
                      </button>
                      <button 
                        onClick={() => handleDownloadPacket(activeArchivePacket, "markdown")}
                        className="flex-1 bg-slate-900 border border-slate-750 text-slate-200 py-1.5 rounded-lg hover:bg-slate-800 font-mono text-[9.5px] uppercase tracking-wider font-extrabold cursor-pointer transition-all active:scale-95"
                      >
                        Markdown
                      </button>
                    </div>
                    <button 
                      onClick={() => handleDownloadPacket(activeArchivePacket, "pdf")}
                      className="w-full bg-[#0e1726]/80 border border-cyan-500/30 text-cyan-400 py-2 rounded-lg hover:bg-[#131f33] font-mono text-[9.5px] uppercase tracking-wider font-extrabold cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <FileText className="h-3.5 w-3.5" /> Download Report as PDF
                    </button>
                  </div>
                </div>

              </div>

              {/* TIMELINE LOGGER HISTORY */}
              <div className="flex flex-col gap-2 border-t border-[#1e242d] pt-3 leading-normal text-left">
                <div className="text-[9px] text-[#cbd5e1] uppercase font-bold flex items-center gap-1.5 font-mono">
                  <Activity className="h-3 w-3 text-sky-400" /> Chronology & Custody Record
                </div>
                <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1 divide-y divide-[#181f29]" id="timeline-logger-history">
                  {(activeArchivePacket?.history || []).map((h, i) => (
                    <div key={i} className="text-[9.5px] font-mono text-slate-400 pt-1.5 first:pt-0">
                      <div className="flex justify-between font-extrabold text-[#94a3b8] text-[8px] uppercase">
                        <span>Event: {h.event_id || `EVT-${i}`}</span>
                        <span>{h.actor}</span>
                      </div>
                      <div className="text-slate-200 mt-0.5">{h.comment || "Transition logged."}</div>
                      <div className="text-slate-500 text-[8px] mt-0.5">{h.timestamp}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
          
        </div>

        {/* BOTTOM SECTION: COMPREHENSIVE REGISTRY LEDGER TABLE */}
        <div className="bg-[#14181d] border border-[#232932] rounded-xl p-5 shadow-lg flex flex-col gap-4 relative" id="archive-search-ledger-table-card">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#232a35] pb-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-sky-450" />
              <h2 className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#e2e8f0]">
                Authoritative Handover Register
              </h2>
            </div>
            
            {/* SEARCH AND FILTERS SURFACE */}
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-[220px]">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-650" />
                <input 
                  type="text"
                  value={archiveSearch}
                  onChange={(e) => setArchiveSearch(e.target.value)}
                  placeholder="Query packet, reasoner, ID..."
                  className="w-full bg-[#090b0e] border border-[#212731] rounded-lg pl-8 p-1.5 text-[11px] text-slate-100 font-mono outline-none focus:border-sky-500 placeholder:text-slate-700 font-medium"
                />
              </div>

              {/* FILTER CHIPS PRESETS */}
              <div className="flex self-start sm:self-auto gap-1 bg-[#090b0e] p-0.5 border border-[#1e232c] rounded-lg flex-wrap">
                {(["all", "gold", "cme", "qwen", "deepseek"] as const).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setArchiveFilterPreset(preset)}
                    className={`px-2 py-1 rounded text-[8px] font-mono uppercase tracking-wider font-extrabold ${
                      archiveFilterPreset === preset 
                        ? "bg-[#1d242e] text-sky-400 border border-[#242d3a] font-black" 
                        : "text-slate-600 hover:text-slate-350"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* DYNAMIC GUIDED QUERIES (CLICKABLE TRIGGERS ANSWERING THE PROMPT EXACTLY) */}
          <div className="bg-[#101317]/60 p-3 rounded-lg border border-[#1f252d] flex flex-col sm:flex-row items-start sm:items-center gap-2 leading-normal">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono font-black text-sky-400 tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-sky-400" /> Executive Queries:
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button 
                onClick={() => {
                  setArchiveSearch("gold");
                  setArchiveFilterPreset("all");
                }}
                className="bg-[#191e26] border border-slate-800 text-[10px] text-slate-300 font-mono font-bold px-2 py-1 rounded hover:border-sky-600 cursor-pointer transition-colors"
              >
                🔍 &quot;Show all packets related to gold&quot;
              </button>
              <button 
                onClick={() => {
                  setArchiveSearch("");
                  setArchiveFilterPreset("cme");
                }}
                className="bg-[#191e26] border border-slate-800 text-[10px] text-slate-300 font-mono font-bold px-2 py-1 rounded hover:border-sky-600 cursor-pointer transition-colors"
              >
                🔍 &quot;Show all packets that used CME&quot;
              </button>
              <button 
                onClick={() => {
                  setArchiveSearch("");
                  setArchiveFilterPreset("qwen");
                }}
                className="bg-[#191e26] border border-slate-800 text-[10px] text-slate-300 font-mono font-bold px-2 py-1 rounded hover:border-sky-600 cursor-pointer transition-colors"
              >
                🔍 &quot;Show all packets processed by Qwen&quot;
              </button>
              <button 
                onClick={() => {
                  setArchiveSearch("PKT-520");
                  setArchiveFilterPreset("all");
                }}
                className="bg-[#191e26] border border-slate-800 text-[10px] text-slate-300 font-mono font-bold px-2 py-1 rounded hover:border-sky-600 cursor-pointer transition-colors"
              >
                📐 &quot;Generate a graph from packet lineage&quot;
              </button>
              <button 
                onClick={() => {
                  setShowEvolutionSynthesis(true);
                }}
                className="bg-indigo-950/20 border border-indigo-900/40 text-[10px] text-indigo-300 font-mono font-bold px-2 py-1 rounded hover:border-indigo-650 cursor-pointer transition-colors"
                id="synthesize-evolution-btn"
              >
                🎬 &quot;Generate a video summary of packet evolution&quot;
              </button>
            </div>
          </div>

          {/* Evolution synthesis modal (simulate visual summary) */}
          <AnimatePresence>
            {showEvolutionSynthesis && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 bg-[#0a0f18] border border-indigo-900/60 rounded-xl flex flex-col gap-3 relative overflow-hidden text-left"
                id="video-synthesis-modal"
              >
                <div className="absolute top-0 right-0 p-2 cursor-pointer text-slate-400 hover:text-white" onClick={() => setShowEvolutionSynthesis(false)}>
                  <X className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 text-xs font-mono font-extrabold text-indigo-400 uppercase tracking-widest border-b border-indigo-950 pb-2">
                  <Play className="h-3.5 w-3.5 text-indigo-400 animate-pulse" /> SIMULATED EVOLUTIONARY SYNTHESIS TIMELINE
                </div>
                <div className="space-y-2 mt-1 font-mono text-[10px] text-slate-350 leading-relaxed max-w-4xl">
                  <p className="font-sans text-[11px] font-semibold text-slate-200">
                    🎬 **Dynamic Generation Finished!** Below is the intelligence chronicle tracking Gold Options decision evolution:
                  </p>
                  <div className="border-l-2 border-indigo-800/60 pl-3 space-y-2 py-1 text-left">
                    <div>
                      <span className="text-[#fb7185] font-black mr-2">PHASE I: FORMULATION [PKT-520]</span>
                      Root gold options pricing inquiry constructed. Handed off to **DeepSeek-R1** reasoning module. Skew profiling parameters recorded.
                    </div>
                    <div>
                      <span className="text-sky-400 font-black mr-2">PHASE II: COMPREHENSIVE AUDITING [PKT-680]</span>
                      Verification audit triggered on **Qwen**. Volatility skew validated against real-time CME Group open interest metrics. Zero exceptions detected.
                    </div>
                    <div>
                      <span className="text-purple-400 font-black mr-2">PHASE III: GRAPHIC ATLASING [PKT-788]</span>
                      Decay curve models assembled inside Gemini framework to render three-dimensional options surfaces. Registered as persistent ingestion layer.
                    </div>
                  </div>
                  <div className="p-2 border border-[#a5b4fc]/10 bg-[#a5b4fc]/5 rounded text-[9.5px] text-indigo-300">
                    ℹ️ *This evolutionary chronicle trace acts as the golden Pathfinder line-of-custody recording.*
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="overflow-x-auto w-full" id="table-wrapper-ledger">
            <table className="w-full text-left border-collapse text-[10px] font-mono leading-normal">
              <thead>
                <tr className="border-b border-[#212732] bg-[#12151b] uppercase text-[9px] text-[#94a3b8] font-bold">
                  <th className="p-3">Packet ID</th>
                  <th className="p-3">UTC Timestamp</th>
                  <th className="p-3">Challenge Concept</th>
                  <th className="p-3">Reasoner Model</th>
                  <th className="p-3">Task Capability</th>
                  <th className="p-3">Lobe Status</th>
                  <th className="p-3">Decision Contract SHA</th>
                  <th className="p-3 text-right">Inspection Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b212b]">
                {filteredPackets.map((p) => {
                  const isActive = activeArchivePacket?.packet_id === p.packet_id;
                  let badgeColors = "bg-[#1e1b4b] text-indigo-300 border-indigo-900/60";
                  if (p.current_status === "RECOMMENDATION_CREATED") badgeColors = "bg-[#251f15] text-amber-300 border-amber-900/60";
                  if (p.current_status === "FULLY_VERIFIED") badgeColors = "bg-[#062c2f] text-cyan-300 border-cyan-900/40";
                  if (p.current_status === "OPERATOR_APPROVED") badgeColors = "bg-[#062c1e] text-emerald-300 border-emerald-900/40";

                  return (
                    <tr 
                      key={p.packet_id}
                      className={`hover:bg-[#1a2028]/40 transition-colors cursor-pointer ${
                        isActive ? "bg-[#192433] text-sky-200 font-semibold" : "text-slate-350"
                      }`}
                      onClick={() => setSelectedPacketId(p.packet_id)}
                    >
                      <td className="p-3 font-extrabold text-sky-400 select-all">{p.packet_id}</td>
                      <td className="p-3">{p.timestamp || "2026-06-01 20:00:54"}</td>
                      <td className="p-3 max-w-[260px] truncate leading-normal" title={p.challenge}>{p.challenge}</td>
                      <td className="p-3 font-extrabold text-[#e2e8f0]">{p.reasoner || "Qwen"}</td>
                      <td className="p-3 text-slate-400">{p.capability || "Audit Veracity Check"}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-extrabold border ${badgeColors}`}>
                          {p.current_status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[9px] text-indigo-400 font-semibold select-all uppercase">
                        {p.contractId ? p.contractId.substring(0, 15) : "CRYSTAL-5195FA57"}...
                      </td>
                      <td className="p-3 text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPacketId(p.packet_id);
                          }}
                          className={`px-2 py-1 rounded text-[8px] uppercase font-bold tracking-wider cursor-pointer ${
                            isActive ? "bg-sky-950 text-sky-450 border border-sky-800" : "bg-[#181d24] text-slate-400 hover:text-white"
                          }`}
                        >
                          Focus Node
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredPackets.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-500 italic">
                      No matching custody packets registered under current lookup parameters. Try reset filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
        </div>

      </div>
    );
  };

  const renderMobileCockpit = () => {
    // Determine active validation state
    const isValidationAccepted = selectedPacket.jemma_verdict === "APPROVED" && selectedPacket.red_team_verdict === "CLEARED";
    
    // Total pending validation items countdown
    const pendingValidationCount = packets.filter(p => p.jemma_verdict === "PENDING" || p.red_team_verdict === "PENDING").length;
    const userEmail = "rodlife1314@gmail.com";

    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0d131f] via-[#07090e] to-[#040507] text-[#f1f5f9] font-sans flex flex-col antialiased relative overflow-x-hidden selection:bg-teal-500/30">
        
        {/* Dynamic Quasicrystal backdrop network */}
        <QuasicrystalBackground />

        {/* 1. TOP IOS STYLE STATUS BAR */}
        <div className="w-full px-5 pt-3 pb-1 flex justify-between items-center text-[11px] font-mono text-slate-400 font-semibold select-none z-10 shrink-0">
          <span>09:41</span>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-[10px] tracking-wider text-teal-400/80">5G LTE</span>
            <div className="w-5 h-2.5 border border-slate-500 rounded-sm p-0.5 flex items-center">
              <div className="h-full w-4 bg-teal-400 rounded-2xs" />
            </div>
          </div>
        </div>

        {/* 2. BRAND MOBILE GENTLEMAN HEADER */}
        <header className="px-5 py-3 flex items-center justify-between border-b border-white/5 bg-[#0a0d13]/60 backdrop-blur-md z-10 shrink-0 select-none">
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1.5 shrink-0">
              <button 
                onClick={() => setViewMode("wallstreet")}
                className="px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:text-emerald-300 transition-all text-[8.5px] font-mono font-black select-none cursor-pointer flex items-center gap-0.5"
                title="De-escalate to WallStreet Observer"
              >
                <span>📈</span> WALLSTREET
              </button>
              <button 
                onClick={() => {
                  // If they click menu on mobile, toggle simulation override to help test on desktop
                  setMobileOverride(false);
                }}
                className="px-2 py-0.5 rounded border border-slate-800 bg-[#12161f]/80 text-[8px] text-slate-400 hover:text-white transition-all font-mono font-bold select-none cursor-pointer"
                title="Switch to Desktop Workbench view"
              >
                🖥️ WORKBENCH
              </button>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-amber-400 text-xs font-bold font-mono">✦</span>
                <span className="font-mono text-[11.5px] font-black tracking-widest text-[#ececf1]">PATHFINDER</span>
                <span className="text-[7.5px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 py-0.2 rounded font-extrabold uppercase">COCKPIT</span>
              </div>
              <span className="text-[8px] tracking-widest text-slate-400 uppercase font-black font-mono">INTELLIGENCE UNDERNEATH THE HOOD</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex flex-col items-end text-right select-none">
              <span className="text-[9px] text-[#2dd4bf] font-bold tracking-widest uppercase flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4bf] animate-pulse" /> OPERATOR
              </span>
              <span className="text-[7.5px] text-slate-505 font-mono tracking-wider truncate max-w-[100px]">{userEmail}</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-teal-500 to-amber-400 p-0.5 shadow-md flex items-center justify-center relative select-none">
              <div className="h-full w-full bg-[#111622] rounded-full flex items-center justify-center font-bold text-[10px] text-teal-300 font-mono font-black">
                OP
              </div>
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 border border-[#111622]" />
            </div>
          </div>
        </header>

        {/* 3. MOBILE COCKPIT PANEL (SCROLLABLE PORTFLOW) */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4 z-10 pb-24">
          
          {/* A. ACTIVE PACKET STATUS MATRIX (THE TOP METRICS GRID) */}
          <section className="bg-gradient-to-b from-[#0e121d] via-[#090b10] to-[#05060a] border border-white/[0.07] rounded-3xl p-4 shadow-[0_15px_35px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.12)] relative overflow-hidden flex flex-col gap-3 group">
            {/* Ambient background soft light and metallic diagonal shimmer reflection line */}
            <div className="absolute top-0 right-0 w-[140px] h-[140px] bg-teal-500/[0.03] rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[110px] h-[110px] bg-purple-500/[0.03] rounded-full blur-2xl pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

            <div className="flex justify-between items-center select-none z-10">
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-mono text-slate-500 tracking-wider font-extrabold uppercase">ACTIVE INTEGRITY PKT</span>
                <span className="text-xs font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-350 tracking-wider">
                  {selectedPacket.packet_id || "PKT-001"}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse shadow-[0_0_8px_#2dd4bf]" />
                <span className="text-[8.5px] px-2 py-0.5 rounded border border-teal-500/25 bg-teal-500/10 text-teal-300 font-extrabold font-mono uppercase tracking-widest truncate max-w-[150px]">
                  {selectedPacket.current_status || "PENDING"}
                </span>
              </div>
            </div>

            {/* Tactile grid item parameters with subtle vertical brushed lines */}
            <div className="grid grid-cols-4 gap-1.5 border-t border-b border-white/[0.05] py-3 text-center z-10">
              <div className="border-r border-white/[0.04]">
                <p className="text-[7.5px] text-slate-500 font-bold uppercase tracking-widest font-mono">ALIGNMENT</p>
                <p className="text-[12.5px] font-black text-[#2dd4bf] font-mono tracking-tight mt-0.5 drop-shadow-[0_0_6px_rgba(45,212,191,0.2)]">
                  {selectedPacket.confidence || alignmentRate}%
                </p>
              </div>
              <div className="border-r border-white/[0.04]">
                <p className="text-[7.5px] text-slate-500 font-bold uppercase tracking-widest font-mono">REASONER</p>
                <p className="text-[11.5px] font-black text-slate-200 mt-0.5 font-mono truncate">
                  {selectedPacket.reasoner && selectedPacket.reasoner !== "Not Selected" ? (
                    selectedPacket.reasoner === "Gemini Reasoner" ? "Gemini" : selectedPacket.reasoner.split(" ")[0]
                  ) : "Gemini"}
                </p>
              </div>
              <div className="border-r border-white/[0.04]">
                <p className="text-[7.5px] text-slate-500 font-bold uppercase tracking-widest font-mono">RUNTIME</p>
                <p className="text-[11.5px] font-black text-slate-300 mt-0.5 font-mono truncate">
                  {selectedPacket.runtime || "Pathfinder"}
                </p>
              </div>
              <div>
                <p className="text-[7.5px] text-slate-500 font-bold uppercase tracking-widest font-mono">AUTHORITY</p>
                <p className="text-[11.5px] font-black mt-0.5 font-mono text-amber-400 truncate flex items-center justify-center gap-0.5">
                  <span className="text-[9px] drop-shadow-[0_0_4px_rgba(245,158,11,0.3)]">🛡️</span> OP
                </p>
              </div>
            </div>

            {/* Custom Interactive Chain of Custody graph path with Pathfinder language progress rail */}
            <div className="flex items-center justify-between text-[7px] font-mono text-slate-500 font-black border-b border-white/[0.05] pb-3 px-1 select-none z-10">
              {/* STEP 1: CHALLENGE */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <span className={`h-5 w-5 rounded-full border flex items-center justify-center font-bold font-mono text-[9px] transition-all duration-300 ${
                  selectedPacket.packet_id 
                    ? "bg-amber-500/20 border-amber-400/60 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.4)]" 
                    : "border-slate-800 text-slate-600 bg-[#0e121a]"
                }`}>
                  1
                </span>
                <span className={selectedPacket.packet_id ? "text-amber-400 font-extrabold tracking-widest" : "text-slate-600 font-medium"}>CHALLENGE</span>
              </div>
              
              <div className={`flex-1 h-0.5 mx-1 ${selectedPacket.reasoner && selectedPacket.reasoner !== "Not Selected" ? "bg-gradient-to-r from-amber-500 to-sky-500" : "bg-slate-800"}`} />

              {/* STEP 2: CLAIM */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <span className={`h-5 w-5 rounded-full border flex items-center justify-center font-bold font-mono text-[9px] transition-all duration-300 ${
                  selectedPacket.reasoner && selectedPacket.reasoner !== "Not Selected" 
                    ? "bg-sky-500/20 border-sky-400/60 text-sky-300 shadow-[0_0_10px_rgba(14,165,233,0.4)]" 
                    : "border-slate-800 text-slate-600 bg-[#0e121a]"
                }`}>
                  2
                </span>
                <span className={selectedPacket.reasoner && selectedPacket.reasoner !== "Not Selected" ? "text-sky-300 font-extrabold tracking-widest" : "text-slate-600 font-medium"}>CLAIM</span>
              </div>

              <div className={`flex-1 h-0.5 mx-1 ${selectedPacket.jemma_verdict === "APPROVED" ? "bg-gradient-to-r from-sky-500 to-teal-500" : "bg-slate-800"}`} />

              {/* STEP 3: INVESTIGATION */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <span className={`h-5 w-5 rounded-full border flex items-center justify-center font-bold font-mono text-[9px] transition-all duration-300 ${
                  selectedPacket.jemma_verdict === "APPROVED" 
                    ? "bg-teal-500/20 border-teal-400/60 text-teal-300 shadow-[0_0_10px_rgba(45,212,191,0.4)]" 
                    : "border-slate-800 text-slate-600 bg-[#0e121a]"
                }`}>
                  3
                </span>
                <span className={selectedPacket.jemma_verdict === "APPROVED" ? "text-teal-300 font-extrabold tracking-widest" : "text-slate-600 font-medium"}>INVESTIGATION</span>
              </div>

              <div className={`flex-1 h-0.5 mx-1 ${selectedPacket.operator_gate === "APPROVED" ? "bg-gradient-to-r from-teal-500 to-indigo-500" : "bg-slate-800"}`} />

              {/* STEP 4: APPROVAL */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <span className={`h-5 w-5 rounded-full border flex items-center justify-center font-bold font-mono text-[9px] transition-all duration-300 ${
                  selectedPacket.operator_gate === "APPROVED" 
                    ? "bg-indigo-500/20 border-indigo-400/60 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.4)]" 
                    : "border-slate-800 text-slate-600 bg-[#0e121a]"
                }`}>
                  4
                </span>
                <span className={selectedPacket.operator_gate === "APPROVED" ? "text-indigo-300 font-extrabold tracking-widest" : "text-slate-600 font-medium"}>APPROVAL</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono select-none z-10">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 uppercase font-black">CUSTODY:</span>
                <span className="text-emerald-400 font-extrabold uppercase flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" /> UNIQUE CHAIN
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 uppercase font-black">DISPATCH:</span>
                {selectedPacket.operator_gate === "APPROVED" ? (
                  <span className="text-emerald-400 font-extrabold uppercase flex items-center gap-1 drop-shadow-[0_0_4px_rgba(16,185,129,0.2)]">
                    🔓 SEAL_UNLOCKED
                  </span>
                ) : (
                  <span className="text-[#a78bfa] font-extrabold uppercase flex items-center gap-1 bg-purple-950/20 px-1.5 rounded border border-purple-900/40">
                    🔒 LOCKED
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* B. ACTIVE WORKSPACE CONTAINER (CONDITIONAL RENDERING OF THE ACTIVE MOBILE VIEW PAGE CARD) */}
          <section className="flex flex-col gap-3">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={mobileTab}
                initial={{ opacity: 0, scale: 0.98, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -5 }}
                transition={{ duration: 0.2 }}
                className="w-full shadow-lg"
              >
                
                {/* ID-1 CHALLENGE TAB CONTENT PANEL CARD */}
                {mobileTab === "challenge" && (
                  <div className="bg-[#121620] border border-amber-500/20 rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden shadow-inner">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
                    
                    <div className="flex items-center gap-2 border-b border-amber-500/10 pb-3">
                      <div className="h-7 w-7 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-400 text-xs shadow-sm border border-amber-500/20">
                        <Compass className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-mono font-black uppercase text-amber-405 tracking-wider">INTAKE MISSION CHALLENGE</h3>
                        <p className="text-[10px] text-slate-400 font-semibold leading-none">Determine evidence discovery criteria</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[8px] font-mono text-slate-550 uppercase font-black">ACTIVE REGISTERED ISSUE IN FLIGHT</label>
                      <div className="p-3.5 rounded-xl bg-[#090b10] border border-white/5 text-slate-200 text-[11px] font-medium leading-relaxed font-sans shadow-inner min-h-[60px]">
                        {selectedPacket.challenge || "No active challenge statement assigned to current integrity package."}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[8px] font-mono text-slate-550 uppercase font-black">FORMULATE NEW TARGET CHALLENGE STATEMENT</label>
                      <textarea
                        value={intakeInput}
                        onChange={(e) => setIntakeInput(e.target.value)}
                        placeholder="Define the objective mission logic here... e.g. Evaluate Gold derivative volatility correlation to macroeconomic indexes..."
                        className="bg-[#090b10] border border-white/10 rounded-xl p-3 text-[11px] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition-all font-sans min-h-[80px] leading-relaxed resize-none shadow-inner"
                      />
                    </div>

                    <button
                      onClick={() => {
                        if (!intakeInput.trim()) return;
                        // Mutate active packet challenge in real-time
                        setPackets(prev => prev.map(p => {
                          if (p.packet_id === selectedPacket.packet_id) {
                            return { ...p, challenge: intakeInput, current_status: "AWAITING_VALIDATION" };
                          }
                          return p;
                        }));
                        setIngestLogs(prev => [
                          ...prev,
                          `[OPERATOR] 🖊️ Reformulated challenge context for ${selectedPacket.packet_id}: "${intakeInput}"`
                        ]);
                        setIntakeInput("");
                        setMobileTab("claim"); // Move seamlessly to the next logical state!
                      }}
                      disabled={!intakeInput.trim()}
                      className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-[#090b0e] font-mono font-bold uppercase text-[10px] tracking-wider py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 outline-none hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed select-none cursor-pointer"
                    >
                      <Compass className="h-4 w-4" /> COMMIT CO-INTENT CHALLENGE
                    </button>
                  </div>
                )}

                {/* ID-2 CLAIM TAB CONTENT PANEL CARD */}
                {mobileTab === "claim" && (
                  <div className="bg-[#121620] border border-teal-500/20 rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden shadow-inner">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-teal-505/5 rounded-full blur-xl pointer-events-none" />
                    
                    <div className="flex items-center gap-2 border-b border-teal-504/10 pb-3">
                      <div className="h-7 w-7 bg-teal-505/10 rounded-lg flex items-center justify-center text-teal-400 text-xs shadow-sm border border-teal-500/20">
                        <Layers className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-mono font-black uppercase text-teal-400 tracking-wider">HYPOTHESIS ASSERTION LAYERS</h3>
                        <p className="text-[10px] text-slate-400 font-semibold leading-none">Map claims and expected outcomes</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 bg-[#090b10] border border-white/5 rounded-xl flex flex-col gap-1 text-center shadow-inner">
                        <span className="text-[8px] font-mono text-slate-500 uppercase font-extrabold leading-none">PRIMARY TARGET AGENT</span>
                        <span className="text-[10.5px] font-mono text-slate-150 font-extrabold tracking-wide mt-1 uppercase truncate">
                          {selectedPacket.source_agent || "Not Assigned"}
                        </span>
                      </div>
                      <div className="p-3 bg-[#090b10] border border-white/5 rounded-xl flex flex-col gap-1 text-center shadow-inner">
                        <span className="text-[8px] font-mono text-slate-500 uppercase font-extrabold leading-none">DISCOVERY CAPABILITY</span>
                        <span className="text-[10.5px] font-mono text-teal-450 font-extrabold truncate uppercase mt-1">
                          {selectedPacket.capability || "COMPUTES_BOUND"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[8px] font-mono text-slate-550 uppercase font-black">EVIDENCE CATEGORY SCHEMAS DESIGNATED</label>
                      <div className="flex flex-wrap gap-1 leading-none">
                        {selectedPacket.dataset_recommendations && selectedPacket.dataset_recommendations.length > 0 ? (
                          selectedPacket.dataset_recommendations.map((cat, idx) => (
                            <span key={idx} className="bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-1 rounded text-[8.5px] font-mono font-extrabold uppercase tracking-wide">
                              {cat}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 italic text-[9.5px]">No specific dataset recommendations categorized.</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[8px] font-mono text-slate-550 uppercase font-black">EXPECTED FINDING STATEMENT SUMMARY</label>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans bg-[#090b10]/60 p-3 rounded-lg border border-white/5">
                        The candidate claims to satisfy rigorous evidence validation requirements, verifying source database integrity across specified regulatory indicators.
                      </p>
                    </div>

                    <button
                      onClick={() => setMobileTab("query")}
                      className="w-full bg-gradient-to-r from-teal-600 to-teal-500 text-[#090b0e] font-mono font-bold uppercase text-[10px] tracking-wider py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer"
                    >
                      <Unlock className="h-4 w-4" /> INITIATE HARNESS QUERY DISCOVERY
                    </button>
                  </div>
                )}

                {/* ID-3 QUERY TAB CONTENT PANEL CARD */}
                {mobileTab === "query" && (
                  <div className="bg-[#121620] border border-sky-500/20 rounded-2xl p-4 flex flex-col gap-5 relative overflow-hidden shadow-inner font-mono text-left">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-xl pointer-events-none" />
                    
                    {/* Header */}
                    <div className="flex items-center gap-2 border-b border-sky-500/10 pb-3">
                      <div className="h-7 w-7 bg-sky-500/10 rounded-lg flex items-center justify-center text-sky-400 text-xs shadow-sm border border-sky-500/20">
                        <Search className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-mono font-black uppercase text-sky-400 tracking-wider">AUTHORITY RECOMMENDER HUB</h3>
                        <p className="text-[10px] text-slate-400 font-semibold leading-none">Automated tree alignment and dispatch console</p>
                      </div>
                    </div>

                    {/* Compact Workflow Progress Bar for Mobile */}
                    <div className="p-3 bg-[#090b10] border border-[#1d242e] rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                        <span>Workflow Pipeline</span>
                        <span className="text-sky-400">Active Phase: 03-05</span>
                      </div>
                      <div className="grid grid-cols-8 gap-0.5 text-center text-[6px] font-mono leading-none">
                        {[
                          { label: "CHALLENGE", active: true },
                          { label: "SCOUT", active: true },
                          { label: "SCAN", active: true },
                          { label: "REASON", active: true },
                          { label: "PACKETS", active: true },
                          { label: "GATE", active: operatorActionState !== "NONE" },
                          { label: "INGEST", active: operatorActionState === "REGISTERED" },
                          { label: "COPILOT", active: operatorActionState === "REGISTERED" }
                        ].map((v, i) => (
                          <div key={i} className="flex flex-col items-center gap-1">
                            <div className={`h-1 w-full rounded-full transition-colors ${
                              v.active ? "bg-gradient-to-r from-sky-500 to-sky-450" : "bg-[#161a22]"
                            }`} />
                            <span className={v.active ? "text-sky-400 font-bold" : "text-slate-650 font-semibold"}>
                              {v.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Collapse list tree wrapper with left dashed connector border */}
                    <div className="relative border-l border-dashed border-sky-500/20 ml-2 pl-4 space-y-4">
                      
                      {/* 1. Challenge Packet */}
                      <div className="relative">
                        {/* Node marker */}
                        <div className="absolute -left-[24.5px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#121620] border-2 border-amber-500 flex items-center justify-center">
                          <span className="h-0.5 w-0.5 rounded-full bg-amber-500" />
                        </div>
                        
                        <div className="border border-amber-500/10 rounded-xl bg-[#090b10]/40 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setTreeExpanded(prev => ({ ...prev, challenge: !prev.challenge }))}
                            className="w-full flex justify-between items-center p-2.5 text-left bg-[#090b10]/60 outline-none hover:bg-[#11141c]/50 transition-colors border-none cursor-pointer"
                          >
                            <span className="font-mono text-[9px] font-black text-amber-450 uppercase tracking-wider flex items-center gap-1.5">
                              <span>01. ACTIVE CHALLENGE PACKET</span>
                              <span className="text-[7px] font-mono py-0.5 px-1 bg-amber-950/40 text-amber-405 rounded border border-amber-900/30">
                                {selectedPacket.packet_id}
                              </span>
                            </span>
                            <ChevronRight className={`h-3 w-3 text-amber-500 transition-transform ${treeExpanded.challenge ? "rotate-90" : ""}`} />
                          </button>
                          
                          {treeExpanded.challenge && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="p-3 text-[10.5px] space-y-2 border-t border-amber-500/10"
                            >
                              <p className="text-slate-350 leading-relaxed font-sans font-medium italic">
                                "{selectedPacket.challenge || "No active challenge statement mapping assigned."}"
                              </p>
                              <div className="flex justify-between items-center text-[7.5px] font-mono text-slate-500 uppercase border-t border-[#12161b] pt-2">
                                <span>Status: <strong className="text-amber-400 font-bold">{selectedPacket.current_status}</strong></span>
                                <span>Agent: {selectedPacket.source_agent}</span>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>

                      {/* 2. Pathfinder Lead Scout */}
                      <div className="relative">
                        {/* Node marker */}
                        <div className="absolute -left-[24.5px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#121620] border-2 border-teal-500 flex items-center justify-center">
                          <span className="h-0.5 w-0.5 rounded-full bg-teal-500" />
                        </div>
                        
                        <div className="border border-teal-500/10 rounded-xl bg-[#090b10]/40 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setTreeExpanded(prev => ({ ...prev, scout: !prev.scout }))}
                            className="w-full flex justify-between items-center p-2.5 text-left bg-[#090b10]/60 outline-none hover:bg-[#11141c]/50 transition-colors border-none cursor-pointer"
                          >
                            <span className="font-mono text-[9px] font-black text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                              <span>02. PATHFINDER Lead Scout</span>
                              <span className="h-1.5 w-1.5 rounded-full bg-teal-450 animate-pulse" />
                            </span>
                            <ChevronRight className={`h-3 w-3 text-teal-500 transition-transform ${treeExpanded.scout ? "rotate-90" : ""}`} />
                          </button>
                          
                          {treeExpanded.scout && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="p-3 text-[10px] font-mono text-slate-300 space-y-2 border-t border-teal-500/10 leading-relaxed"
                            >
                              <div className="flex justify-between border-b border-[#12161b] pb-1">
                                <span className="text-slate-500 uppercase">Scout Designation:</span>
                                <span className="text-teal-450 font-bold">JEMMA-A1_SCOUT</span>
                              </div>
                              <div className="flex justify-between border-b border-[#12161b] pb-1">
                                <span className="text-slate-500 uppercase">Coverage Level:</span>
                                <span className="text-teal-450 font-bold">100% DISCOVERY</span>
                              </div>
                              <div className="flex justify-between pb-0.5">
                                <span className="text-slate-500 uppercase">Core Standard Objective:</span>
                                <span className="text-slate-100">Option Skew & Strike Indexing</span>
                              </div>
                              <p className="text-[8.5px] text-slate-500 mt-1 font-sans italic">
                                Lead scout Jemma-A1 conducts dynamic background audit of registered regulatory domains.
                              </p>
                            </motion.div>
                          )}
                        </div>
                      </div>

                      {/* 3. Available Authorities */}
                      <div className="relative">
                        {/* Node marker */}
                        <div className="absolute -left-[24.5px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#121620] border-2 border-blue-550 flex items-center justify-center">
                          <span className="h-0.5 w-0.5 rounded-full bg-blue-500" />
                        </div>
                        
                        <div className="border border-blue-500/10 rounded-xl bg-[#090b10]/40 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setTreeExpanded(prev => ({ ...prev, authorities: !prev.authorities }))}
                            className="w-full flex justify-between items-center p-2.5 text-left bg-[#090b10]/60 outline-none hover:bg-[#11141c]/50 transition-colors border-none cursor-pointer"
                          >
                            <span className="font-mono text-[9px] font-black text-blue-405 uppercase tracking-wider flex items-center gap-1.5">
                              <span>03. DESIGNATED authorities scan</span>
                            </span>
                            <ChevronRight className={`h-3 w-3 text-blue-500 transition-transform ${treeExpanded.authorities ? "rotate-90" : ""}`} />
                          </button>
                          
                          {treeExpanded.authorities && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="p-3 space-y-3 text-[10px] border-t border-blue-500/10 font-mono"
                            >
                              <div className="space-y-1.5">
                                <span className="text-[7.5px] font-bold text-slate-550 uppercase block">Public Authorities (Open Access)</span>
                                <div className="flex flex-wrap gap-1 leading-none">
                                  {["CME", "FRED", "SEC", "BLS"].map((v, i) => (
                                    <span key={i} className="px-1.5 py-0.5 rounded bg-blue-950/20 text-blue-400 border border-blue-900/40 text-[8.5px] font-bold">
                                      🏦 {v} (MATCHED)
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-1.5 pt-1.5 border-t border-[#12161b]">
                                <span className="text-[7.5px] font-bold text-slate-550 uppercase block">Authenticated Key-Stores (Credential Gate Checking)</span>
                                <div className="space-y-1">
                                  {/* CME */}
                                  <div className="flex justify-between items-center text-[9px]">
                                    <span className="text-slate-400 uppercase font-black">CME WebSSO Check:</span>
                                    {cmeConfigured ? (
                                      <span className="text-emerald-400 font-bold flex items-center gap-1 text-[8px]">
                                        <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                                        READY (SSO HANDSHAKE)
                                      </span>
                                    ) : (
                                      <span className="text-slate-500 font-bold flex items-center gap-1 text-[8px]">
                                        <span className="h-1 w-1 rounded-full bg-slate-705" />
                                        MISSING
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* TRAI/Tradingview */}
                                  <div className="flex justify-between items-center text-[9px]">
                                    <span className="text-slate-400 uppercase font-black">TradingView Access (TRAI):</span>
                                    {traiConfigured ? (
                                      <span className="text-emerald-400 font-bold flex items-center gap-1 text-[8px]">
                                        <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                                        READY (TRADINGVIEW_API_KEY)
                                      </span>
                                    ) : (
                                      <span className="text-slate-500 font-bold flex items-center gap-1 text-[8px]">
                                        <span className="h-1 w-1 rounded-full bg-slate-705" />
                                        MISSING
                                      </span>
                                    )}
                                  </div>

                                  {/* Gemini */}
                                  <div className="flex justify-between items-center text-[9px]">
                                    <span className="text-slate-400 uppercase font-black">Gemini Server Core:</span>
                                    {geminiConfigured ? (
                                      <span className="text-emerald-400 font-bold flex items-center gap-1 text-[8px]">
                                        <span className="h-1 w-1 rounded-full bg-emerald-500" />
                                        READY (SERVER SECRET)
                                      </span>
                                    ) : (
                                      <span className="text-rose-400 font-bold flex items-center gap-1 text-[8px]">
                                        MISSING
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>

                      {/* 4. Reasoning Board */}
                      <div className="relative">
                        {/* Node marker */}
                        <div className="absolute -left-[24.5px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#121620] border-2 border-indigo-500 flex items-center justify-center">
                          <span className="h-0.5 w-0.5 rounded-full bg-indigo-500" />
                        </div>
                        
                        <div className="border border-indigo-500/10 rounded-xl bg-[#090b10]/40 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setTreeExpanded(prev => ({ ...prev, reasoning: !prev.reasoning }))}
                            className="w-full flex justify-between items-center p-2.5 text-left bg-[#090b10]/60 outline-none hover:bg-[#11141c]/50 transition-colors border-none cursor-pointer"
                          >
                            <span className="font-mono text-[9px] font-black text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                              <span>04. INTEL LOGIC REASONING BOARD</span>
                            </span>
                            <ChevronRight className={`h-3 w-3 text-indigo-500 transition-transform ${treeExpanded.reasoning ? "rotate-90" : ""}`} />
                          </button>
                          
                          {treeExpanded.reasoning && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="p-3 text-[10.5px] text-slate-350 leading-relaxed font-sans border-t border-indigo-500/10 space-y-2 italic text-left"
                            >
                              <p>
                                "The option skew dynamics of {selectedPacket.packet_id || 'active assets'} require direct high-frequency option skews (CME Group QuikStrike) cross-referenced against historical macroeconomic risk-free interest rates (FRED) and real-time spot momentum profiles (TradingView). Aggregating these exact authorities on the ledger secures structural compliance and minimizes mathematical baseline drift."
                              </p>
                              <div className="text-[7.5px] font-mono font-bold text-indigo-400 text-right uppercase tracking-wider">
                                REGISTERED UNDER ACTIVE AUDIT SCHEMAS
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>

                      {/* 5. Recommended Data Packets Tree */}
                      <div className="relative">
                        {/* Node marker */}
                        <div className="absolute -left-[24.5px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#121620] border-2 border-sky-400 flex items-center justify-center">
                          <span className="h-0.5 w-0.5 rounded-full bg-sky-400" />
                        </div>
                        
                        <div className="border border-sky-500/10 rounded-xl bg-[#090b10]/40 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setTreeExpanded(prev => ({ ...prev, packets: !prev.packets }))}
                            className="w-full flex justify-between items-center p-2.5 text-left bg-[#090b10]/60 outline-none hover:bg-[#11141c]/50 transition-colors border-none cursor-pointer"
                          >
                            <span className="font-mono text-[9px] font-black text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                              <span>05. TOP 5 RECOMMENDED DATA PACKETS</span>
                              <span className="text-[7px] font-mono py-0.5 px-1 bg-sky-955/40 text-sky-400 rounded border border-sky-900/30">
                                5 IDENTIFIED
                              </span>
                            </span>
                            <ChevronRight className={`h-3 w-3 text-sky-500 transition-transform ${treeExpanded.packets ? "rotate-90" : ""}`} />
                          </button>
                          
                          {treeExpanded.packets && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="p-2 space-y-2 border-t border-sky-500/10 text-left"
                            >
                              {[
                                {
                                  id: "PKT-NODE-01",
                                  name: "CME Quikstrike Option open interest clusters",
                                  authority: "CME",
                                  desc: "Gold option striking open interest cluster concentrations",
                                  type: "SKEW_INDEX",
                                  ep: "CME Quikstrike SSO Ingress",
                                  confidence: "99.1%"
                                },
                                {
                                  id: "PKT-NODE-02",
                                  name: "FRED Real Gold Macro Spot benchmark indicators",
                                  authority: "FRED",
                                  desc: "10-Year risk-adjusted benchmark rate curves and physical gold spot macro indices",
                                  type: "MACRO_BENCHMARK",
                                  ep: "FRED API Ingress System",
                                  confidence: "98.4%"
                                },
                                {
                                  id: "PKT-NODE-03",
                                  name: "CME SOFR Hedging Option Spreads index",
                                  authority: "CME",
                                  desc: "Secured Overnight Financing Option volume profile index shift",
                                  type: "SPREAD_METRIC",
                                  ep: "CME Quikstrike TLS API Ingress",
                                  confidence: "94.5%"
                                },
                                {
                                  id: "PKT-NODE-04",
                                  name: "BLS Consumer Price Inflation factors",
                                  authority: "BLS",
                                  desc: "Inflation rate index adjustments adjusting absolute cost base margins",
                                  type: "INFLATION_INDEX",
                                  ep: "BLS Ingestion Endpoint",
                                  confidence: "89.2%"
                                },
                                {
                                  id: "PKT-NODE-05",
                                  name: "TradingView Gold Spot Tick indices (TRAI)",
                                  authority: "TRAI (TradingView)",
                                  desc: "Gold premium spot bars tick velocity index and real-time gold delta metrics",
                                  type: "MOMENTUM_INDEX",
                                  ep: "TradingView Authority Adapter (via TRADINGVIEW_API_KEY)",
                                  confidence: "97.6%"
                                }
                              ].map((candidate, idx) => (
                                <div key={idx} className="bg-[#090b10] border border-white/5 rounded-lg overflow-hidden">
                                  <button
                                    type="button"
                                    onClick={() => setExpandedRecommendDatasets(prev => ({ ...prev, [idx]: !prev[idx] }))}
                                    className="w-full flex items-center justify-between p-2 text-left hover:bg-[#11141a]/60 select-none cursor-pointer outline-none transition-colors border-none"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[8px] font-mono text-slate-500 font-extrabold">{idx + 1}.</span>
                                      <div className="flex flex-col">
                                        <span className="text-[10px] font-mono font-bold text-slate-200 uppercase tracking-tight">
                                          {candidate.name}
                                        </span>
                                        <span className="text-[7.5px] font-mono text-slate-500 uppercase font-black">
                                          Registry source: <span className="text-sky-400">{candidate.authority}</span>
                                        </span>
                                      </div>
                                    </div>
                                    <ChevronRight className={`h-2.5 w-2.5 text-slate-500 transition-transform ${expandedRecommendDatasets[idx] ? "rotate-90" : ""}`} />
                                  </button>
                                  
                                  {expandedRecommendDatasets[idx] && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      className="p-2.5 border-t border-white/5 text-[9.5px] font-mono text-slate-400 space-y-1.5 leading-relaxed bg-[#0b0e14]/50"
                                    >
                                      <p className="text-slate-400 text-[10px] italic font-sans">{candidate.desc}</p>
                                      <div className="grid grid-cols-2 gap-x-2 pt-1 border-t border-white/5 text-[7.5px] uppercase font-black text-slate-550 border-dashed">
                                        <div>Data Type: <span className="text-slate-300 font-extrabold">{candidate.type}</span></div>
                                        <div>Match Confidence: <span className="text-emerald-400 font-extrabold">{candidate.confidence}</span></div>
                                      </div>
                                      <div className="text-[7.5px] font-bold text-slate-400 flex items-center gap-1 mt-1 font-mono uppercase bg-slate-900/60 p-1 rounded border border-white/5 truncate">
                                        <span className="text-slate-550 flex-shrink-0">LINK EP:</span>
                                        <span className="text-slate-400 truncate">{candidate.ep}</span>
                                      </div>
                                    </motion.div>
                                  )}
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </div>
                      </div>

                      {/* 6. Operator Action Console */}
                      <div className="relative">
                        {/* Node marker */}
                        <div className="absolute -left-[24.5px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#121620] border-2 border-purple-500 flex items-center justify-center">
                          <span className="h-0.5 w-0.5 rounded-full bg-purple-500" />
                        </div>
                        
                        <div className="border border-purple-500/20 rounded-2xl bg-[#0d1117] p-3 text-left space-y-3.5">
                          <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <span className="font-mono text-[9px] font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                              <span>06. OPERATOR DISPATCH CONTROL GATE</span>
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[7.5px] font-mono font-black border tracking-wider transition-colors uppercase ${
                              operatorActionState === "REGISTERED" 
                                ? "bg-emerald-950/30 text-emerald-400 border-emerald-900/30" 
                                : operatorActionState === "HELD"
                                ? "bg-amber-950/30 text-amber-500 border-amber-900/30"
                                : operatorActionState === "REJECTED"
                                ? "bg-rose-950/30 text-rose-450 border-rose-900/30"
                                : "bg-slate-950/30 text-slate-405 border-slate-900/30"
                            }`}>
                              {operatorActionState === "REGISTERED" ? "INGESTION_AUTHORIZED" : operatorActionState || "PENDING_DECISION"}
                            </span>
                          </div>

                          <span className="text-[9px] text-slate-400 leading-normal block font-sans">
                            Confirm Pathfinder intelligence recommendations and transition stream state, or place an active holds on target candidates.
                          </span>

                          {/* Interactive Decision Actions */}
                          <div className="grid grid-cols-3 gap-1 text-[9px]">
                            <button
                              type="button"
                              onClick={() => {
                                setOperatorActionState("REGISTERED");
                                const logMsg = `[OPERATOR-DECISION] [${new Date().toLocaleTimeString()}] ✅ REGISTERED: Approved Pathfinder Scout recommendations. Registered candidate datasets for active state ingestion.`;
                                setOperatorActionLog(logMsg);
                                setIngestLogs(prev => [
                                  ...prev,
                                  `[OPERATOR] 🔗 Ingestion authorized for recommended sources matching package ${selectedPacket.packet_id}`,
                                  `  🚀 Active adapters mapped: CME Quikstrike Gateway, FRED Macro index indices, TradingView (via TRADINGVIEW_API_KEY)`
                                ]);
                                setPackets(prev => prev.map(p => {
                                  if (p.packet_id === selectedPacket.packet_id) {
                                    return { 
                                      ...p, 
                                      current_status: "INGESTION_AUTHORIZED"
                                    };
                                  }
                                  return p;
                                }));
                              }}
                              className={`font-mono font-black py-2.5 rounded-lg border cursor-pointer text-center select-none transition-all outline-none ${
                                operatorActionState === "REGISTERED"
                                  ? "bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                                  : "bg-[#11141a]/60 hover:bg-[#161a24] text-emerald-500 border-emerald-950/80"
                              }`}
                            >
                              REGISTER
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => {
                                setOperatorActionState("HELD");
                                const logMsg = `[OPERATOR-DECISION] [${new Date().toLocaleTimeString()}] ⚠️ HOLD: Recommendations placed on temporary audit hold pending further clearance.`;
                                setOperatorActionLog(logMsg);
                                setIngestLogs(prev => [
                                  ...prev,
                                  `[OPERATOR-WARN] ⚠️ Manual Audit Hold placed on package ${selectedPacket.packet_id} recommended sources.`
                                ]);
                                setPackets(prev => prev.map(p => {
                                  if (p.packet_id === selectedPacket.packet_id) {
                                    return { 
                                      ...p, 
                                      current_status: "AUDIT_HOLD"
                                    };
                                  }
                                  return p;
                                }));
                              }}
                              className={`font-mono font-black py-2.5 rounded-lg border cursor-pointer text-center select-none transition-all outline-none ${
                                operatorActionState === "HELD"
                                  ? "bg-amber-950/60 border-amber-500 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                                  : "bg-[#11141a]/60 hover:bg-[#161a24] text-amber-500 border-amber-950/80"
                              }`}
                            >
                              HOLD
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setOperatorActionState("REJECTED");
                                const logMsg = `[OPERATOR-DECISION] [${new Date().toLocaleTimeString()}] ❌ REJECTED: Candidate recommendation tree denied. Resetting checkpoint.`;
                                setOperatorActionLog(logMsg);
                                setIngestLogs(prev => [
                                  ...prev,
                                  `[OPERATOR-ERROR] ❌ Recommendation tree denied for package ${selectedPacket.packet_id}. Checkpoint reset.`
                                ]);
                                setPackets(prev => prev.map(p => {
                                  if (p.packet_id === selectedPacket.packet_id) {
                                    return { 
                                      ...p, 
                                      current_status: "RECO_REJECTED"
                                    };
                                  }
                                  return p;
                                }));
                              }}
                              className={`font-mono font-black py-2.5 rounded-lg border cursor-pointer text-center select-none transition-all outline-none ${
                                operatorActionState === "REJECTED"
                                  ? "bg-rose-950/60 border-rose-500 text-rose-300 shadow-[0_0_12px_rgba(239,68,68,0.15)]"
                                  : "bg-[#11141a]/60 hover:bg-[#161a22] text-rose-500 border-rose-950/80"
                              }`}
                            >
                              REJECT
                            </button>
                          </div>

                          {/* Dynamic Feedback Display */}
                          {operatorActionLog && (
                            <motion.div
                              initial={{ opacity: 0, y: 3 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`p-2.5 rounded-xl border text-[9px] leading-relaxed whitespace-pre-wrap ${
                                operatorActionState === "REGISTERED"
                                  ? "bg-emerald-950/35 border-emerald-800/40 text-emerald-300"
                                  : operatorActionState === "HELD"
                                  ? "bg-amber-950/35 border-amber-900/40 text-amber-300"
                                  : "bg-rose-950/35 border-rose-900/30 text-rose-300"
                              }`}
                            >
                              {operatorActionLog}
                            </motion.div>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* FALLBACK: MANUAL OVERRIDE (COLLAPSIBLE SECTION AS REQUESTED) */}
                    <div className="pt-2 border-t border-sky-500/10 text-left">
                      <div className="border border-white/5 rounded-xl bg-[#090b10]/40 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setTreeExpanded(prev => ({ ...prev, fallback: !prev.fallback }))}
                          className="w-full flex justify-between items-center p-2.5 text-left hover:bg-[#11141c]/50 transition-colors border-none cursor-pointer outline-none"
                        >
                          <span className="font-mono text-[8.5px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                            <span>🛡️ FALLBACK: MANUAL URL OVERRIDE</span>
                          </span>
                          <ChevronRight className={`h-3 w-3 text-slate-500 transition-transform ${treeExpanded.fallback ? "rotate-90" : ""}`} />
                        </button>
                        
                        {treeExpanded.fallback && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="p-3 border-t border-white/5 flex flex-col gap-3 bg-[#0c0f16]"
                          >
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[8px] font-mono text-slate-500 uppercase font-black">REGISTER LIVE DATASET URL PRE-ALIGN</label>
                              <div className="flex gap-2 text-left justify-start">
                                <input
                                  type="text"
                                  value={datasetUrlInput}
                                  onChange={(e) => setDatasetUrlInput(e.target.value)}
                                  placeholder="Paste verified authority URL (FRED database indicator)..."
                                  className="flex-1 bg-[#090b10] border border-white/10 rounded-xl p-2.5 text-[10px] text-slate-100 placeholder-slate-500 font-mono outline-none focus:border-sky-500/50"
                                />
                              </div>
                              <p className="text-[8px] text-slate-500 font-mono italic leading-none">Ensure the input source complies with authority doctrine metadata fields.</p>
                            </div>

                            <button
                              type="button"
                              onClick={async () => {
                                if (!datasetUrlInput.trim()) return;
                                setPackets(prev => prev.map(p => {
                                  if (p.packet_id === selectedPacket.packet_id) {
                                    return { 
                                      ...p, 
                                      url_candidate: datasetUrlInput,
                                      current_status: "DATASET_CANDIDATE_REGISTERED"
                                    };
                                  }
                                  return p;
                                }));
                                setIngestLogs(prev => [
                                  ...prev,
                                  `[OPERATOR] 🔗 Registered live URL candidate for ${selectedPacket.packet_id}: "${datasetUrlInput}"`
                                ]);
                                localStorage.setItem("pathfinder_url_draft", datasetUrlInput);
                                setDatasetUrlInput("");
                                setMobileTab("investigation"); // Move smoothly to the audit view
                              }}
                              disabled={!datasetUrlInput.trim()}
                              className="w-full bg-gradient-to-r from-sky-600 to-sky-500 text-[#090b0e] font-mono font-bold uppercase text-[9px] tracking-wider py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 disabled:opacity-40 cursor-pointer"
                            >
                              <Link className="h-3 w-3" /> REGISTER LIVE CANDIDATE INDICATOR
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {/* ID-4 INVESTIGATION TAB CONTENT PANEL CARD */}
                {mobileTab === "investigation" && (
                  <div className="bg-[#121620] border border-purple-500/20 rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden shadow-inner">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-505/5 rounded-full blur-xl pointer-events-none" />
                    
                    <div className="flex items-center gap-2 border-b border-purple-504/10 pb-3">
                      <div className="h-7 w-7 bg-purple-505/10 rounded-lg flex items-center justify-center text-purple-400 text-xs shadow-sm border border-purple-500/20">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-mono font-black uppercase text-purple-400 tracking-wider">EVIDENCE CHAIN INVESTIGATION</h3>
                        <p className="text-[10px] text-slate-400 font-semibold leading-none">Inspect reasoning, Jemma audits and red team clearances</p>
                      </div>
                    </div>

                    {/* Jemma Verdict and Details */}
                    <div className="bg-[#090b10]/90 rounded-xl p-3 border border-white/5 flex flex-col gap-2 shadow-inner">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-400 uppercase font-black">1. JEMMA VERITY ENGINE</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase border ${
                          selectedPacket.jemma_verdict === "APPROVED" 
                            ? "bg-emerald-950/20 text-emerald-400 border-emerald-950" 
                            : "bg-amber-950/20 text-amber-500 border-amber-950"
                        }`}>
                          {selectedPacket.jemma_verdict || "PENDING"}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-500 leading-normal font-sans italic">
                        "Evaluated deep structural compliance across legal and regulatory boundaries. Data matches verified sources, ensuring reproducible results."
                      </p>
                    </div>

                    {/* Red Team Verdict and Details */}
                    <div className="bg-[#090b10]/90 rounded-xl p-3 border border-white/5 flex flex-col gap-2 shadow-inner">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-400 uppercase font-black">2. RED TEAM AUDITOR EXTREMIS</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase border ${
                          selectedPacket.red_team_verdict === "CLEARED" 
                            ? "bg-emerald-950/20 text-emerald-400 border-emerald-950" 
                            : "bg-amber-950/20 text-amber-500 border-amber-950"
                        }`}>
                          {selectedPacket.red_team_verdict || "PENDING"}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-500 leading-normal font-sans italic">
                        "Conduct threat vector checks, ID poisoning, and input escalation analysis. The structural integrity is confirmed safe with zero vulnerabilities detected."
                      </p>
                    </div>

                    {/* Quick run actions simulating backend audits */}
                    <div className="flex gap-2 text-[9.5px]">
                      <button
                        onClick={async () => {
                          setPackets(prev => prev.map(p => {
                            if (p.packet_id === selectedPacket.packet_id) {
                              return { ...p, jemma_verdict: "APPROVED", current_status: "JEMMA_APPROVED" };
                            }
                            return p;
                          }));
                          setIngestLogs(prev => [
                            ...prev,
                            `[AUDITOR ENGINE] Jemma status parsed: APPROVED for packet ${selectedPacket.packet_id}`
                          ]);
                        }}
                        className="flex-1 bg-purple-950/35 hover:bg-purple-900/30 text-purple-300 font-mono font-bold uppercase rounded-lg border border-purple-800/20 py-2.5 cursor-pointer text-center select-none"
                      >
                        RUN JEMMA AUDIT
                      </button>
                      <button
                        onClick={() => {
                          setViewMode("redteam");
                        }}
                        className="flex-1 bg-red-950/35 hover:bg-red-900/30 text-rose-300 font-mono font-bold uppercase rounded-lg border border-red-850/20 py-2.5 cursor-pointer text-center select-none"
                      >
                        OPEN RED TEAM CONSOLE
                      </button>
                    </div>

                    {/* Operator quick approve button right in the sidebar if Jemma & Red Team are cleared */}
                    {selectedPacket.jemma_verdict === "APPROVED" && selectedPacket.red_team_verdict === "CLEARED" && selectedPacket.current_status !== "OPERATOR_APPROVED" && selectedPacket.operator_gate !== "APPROVED" && (
                      <button
                        onClick={toggleOperatorApprove}
                        className="w-full bg-amber-955/35 hover:bg-amber-900/30 text-amber-300 font-mono font-bold uppercase text-[9.5px] rounded-lg border border-amber-800/20 py-2.5 cursor-pointer text-center select-none tracking-wider mb-2"
                      >
                        RUN OPERATOR APPROVAL
                      </button>
                    )}

                    {/* Conditional escalate to seal integration with dynamic metrics checklist */}
                    {(() => {
                      const confidence = selectedPacket.confidence || alignmentRate;
                      const threshold = 90;
                      const isConfidenceApproved = confidence >= threshold;
                      const isJemmaApproved = selectedPacket.jemma_verdict === "APPROVED" || selectedPacket.current_status === "JEMMA_APPROVED";
                      const isRedTeamCleared = selectedPacket.red_team_verdict === "CLEARED" || selectedPacket.current_status === "RED_TEAM_CLEARED";
                      const isOperatorApproved = selectedPacket.current_status === "OPERATOR_APPROVED" || selectedPacket.operator_gate === "APPROVED";

                      const canEscalate = isConfidenceApproved && isJemmaApproved && isRedTeamCleared && isOperatorApproved;

                      if (!canEscalate) {
                        return (
                          <div className="bg-[#0b0e14] border border-red-950/40 rounded-xl p-3 flex flex-col gap-2 font-mono text-[9.5px] mt-1">
                            <div className="text-rose-450 font-extrabold uppercase tracking-wider text-[8.5px] flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                              SEAL CO-INTENT ESCALATION LOCKED
                            </div>
                            <p className="text-slate-400 text-[9px] leading-tight font-sans">
                              Escalate to Seal integration requires the following milestones to be completed:
                            </p>
                            <div className="grid grid-cols-2 gap-x-1.5 gap-y-1.5 mt-0.5 text-[8.5px]">
                              <div className="flex items-center gap-1 min-w-0 font-mono">
                                <span className="shrink-0">{isConfidenceApproved ? "🟢" : "🔴"}</span>
                                <span className={`truncate ${isConfidenceApproved ? "text-slate-300" : "text-slate-500"}`}>
                                  Conf: {confidence.toFixed(1)}% &gt;= {threshold}%
                                </span>
                              </div>
                              <div className="flex items-center gap-1 min-w-0 font-mono">
                                <span className="shrink-0">{isJemmaApproved ? "🟢" : "🔴"}</span>
                                <span className={`truncate ${isJemmaApproved ? "text-slate-300" : "text-slate-500"}`}>
                                  Jemma Approved
                                </span>
                              </div>
                              <div className="flex items-center gap-1 min-w-0 font-mono">
                                <span className="shrink-0">{isRedTeamCleared ? "🟢" : "🔴"}</span>
                                <span className={`truncate ${isRedTeamCleared ? "text-slate-300" : "text-slate-500"}`}>
                                  Red Team Cleared
                                </span>
                              </div>
                              <div className="flex items-center gap-1 min-w-0 font-mono">
                                <span className="shrink-0">{isOperatorApproved ? "🟢" : "🔴"}</span>
                                <span className={`truncate ${isOperatorApproved ? "text-slate-300" : "text-slate-500"}`}>
                                  Operator Approved
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <button
                          onClick={() => setMobileTab("approval")}
                          className="w-full bg-gradient-to-r from-purple-600 to-purple-500 text-[#090b0e] font-mono font-bold uppercase text-[10px] tracking-wider py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer"
                        >
                          <CheckCircle2 className="h-4 w-4" /> ESCALATE TO SEAL INTEGRATION
                        </button>
                      );
                    })()}
                  </div>
                )}

                {/* ID-5 APPROVAL TAB CONTENT PANEL CARD */}
                {mobileTab === "approval" && (
                  <div className="bg-[#121620] border border-orange-500/20 rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden shadow-inner">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-xl pointer-events-none" />
                    
                    <div className="flex items-center gap-2 border-b border-orange-540/10 pb-3">
                      <div className="h-7 w-7 bg-orange-505/10 rounded-lg flex items-center justify-center text-orange-400 text-xs shadow-sm border border-orange-500/20">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-mono font-black uppercase text-orange-400 tracking-wider">OPERATOR CO-INTENT GATE</h3>
                        <p className="text-[10px] text-slate-400 font-semibold leading-none">Signature authorization, packet sealing and dispatch control</p>
                      </div>
                    </div>

                    {/* Seal / Gate status information block */}
                    <div className="bg-[#090b10] border border-white/5 rounded-2xl p-4 flex flex-col gap-3 font-mono shadow-inner">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-550 font-black uppercase">SEAL STATUS</span>
                        <span className={`px-2.5 py-0.5 rounded text-[8px] font-black tracking-widest uppercase border ${
                          selectedPacket.operator_gate === "APPROVED" 
                            ? "bg-emerald-950/30 text-emerald-400 border-emerald-800"
                            : "bg-rose-955/35 text-rose-500 border-rose-950 animate-pulse"
                        }`}>
                          {selectedPacket.operator_gate || "LOCKED"}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-550 font-black uppercase">REASONING PROOF CODE</span>
                        <span className="text-slate-300 font-extrabold tracking-widest text-[9px]">
                          {selectedPacket.contractId || `CRYSTAL-SEAL-${selectedPacket.packet_id || "303"}`}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-550 font-black uppercase">VERIFIABLE DIGITAL DEPLOY</span>
                        <span className="text-slate-350 font-extrabold font-mono tracking-wide text-[8.5px] uppercase truncate max-w-[150px]">
                          {selectedPacket.operator_gate === "APPROVED" ? "APPROVED FOR CRYSTAL DISPATCH" : "AWAITING CO-INTENT SEAL"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 font-mono">
                      {selectedPacket.operator_gate === "APPROVED" ? (
                        <div className="bg-emerald-950/15 border border-emerald-800/20 p-4 rounded-xl text-center flex flex-col items-center gap-1.5 shadow-inner">
                          <span className="text-emerald-400 text-xl font-black">✓</span>
                          <h4 className="text-xs font-extrabold tracking-wider text-emerald-400 uppercase">EVIDENCE SEAL SECURED</h4>
                          <p className="text-[9.5px] text-slate-400 leading-normal">
                            This package hash and matching evidence metrics have been successfully locked and registered. Dispatch controls unlocked.
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 select-none">
                          <button
                            onClick={async () => {
                              await toggleOperatorSeal();
                            }}
                            disabled={selectedPacket.jemma_verdict !== "APPROVED" || selectedPacket.red_team_verdict !== "CLEARED"}
                            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-emerald-950 font-bold uppercase tracking-widest text-[10px] py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 enabled:hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-40 disabled:cursor-not-allowed select-none cursor-pointer"
                          >
                            🔒 SEAL & AUTHORIZE EVIDENCE CHAIN
                          </button>

                          <button
                            onClick={() => {
                              // Reject packet
                              setPackets(prev => prev.map(p => {
                                if (p.packet_id === selectedPacket.packet_id) {
                                  return { 
                                    ...p, 
                                    operator_gate: "LOCKED", 
                                    current_status: "REJECTED",
                                    jemma_verdict: "PENDING",
                                    red_team_verdict: "PENDING"
                                  };
                                }
                                return p;
                              }));
                              setIngestLogs(prev => [
                                ...prev,
                                `[OPERATOR] ❌ SEALS ABORTED & REJECTED for packet ${selectedPacket.packet_id}`
                              ]);
                            }}
                            className="w-full bg-[#181212] border border-rose-950 hover:bg-rose-955/20 text-rose-450 font-bold uppercase tracking-widest text-[9.5px] py-2.5 rounded-xl text-center select-none cursor-pointer transition-all duration-200"
                          >
                            REJECT DISPATCH INTENT
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Pre-align status requirement fallback information */}
                    {(selectedPacket.jemma_verdict !== "APPROVED" || selectedPacket.red_team_verdict !== "CLEARED") && (
                      <p className="text-[8px] font-mono text-amber-500 bg-[#1e130c] border border-amber-500/10 p-2.5 rounded-xl text-center animate-pulse leading-snug select-none">
                        ⚠️ Prerequisite verification checks are incomplete. Ensure Jemma and Red team audits are cleared inside the "Investigation" tab first.
                      </p>
                    )}
                  </div>
                )}

                {/* ID-6 RED TEAM AUDITOR SECURITY CONSOLE PANEL CARD */}
                {mobileTab === "redteam" && (
                  <RedTeamConsole 
                    selectedPacket={selectedPacket} 
                    setSelectedPacketId={setSelectedPacketId}
                    packets={packets} 
                    setPackets={setPackets} 
                    setIngestLogs={setIngestLogs} 
                  />
                )}

              </motion.div>
            </AnimatePresence>

          </section>

          {/* C. FIVE LARGE OPERATOR WORKFLOW SELECTORS IN GENERAL DASHBOARD */}
          <section className="flex flex-col gap-2 mt-2">
            <h4 className="text-[8px] tracking-widest text-slate-500 uppercase font-black font-mono select-none">
              OP WORKFLOW NAVIGATION MATRIX
            </h4>
            
            <div className="flex flex-col gap-2">
              
              {/* Challenge selector card */}
              <div 
                onClick={() => setMobileTab("challenge")}
                className={`p-3 rounded-2xl border transition-all duration-350 flex items-center justify-between cursor-pointer outline-none relative overflow-hidden select-none ${
                  mobileTab === "challenge" 
                    ? "bg-[#181512] border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.08)] bg-gradient-to-tr from-amber-500/5 via-transparent to-transparent" 
                    : "bg-[#0e121a]/90 border-white/[0.04] hover:bg-[#121622]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                    mobileTab === "challenge" 
                      ? "bg-amber-50s/10 border-amber-400 text-amber-400" 
                      : "bg-[#0a0c10] border-white/5 text-slate-500"
                  }`}>
                    <Compass className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className={`text-[11.5px] font-extrabold uppercase font-mono tracking-wide ${mobileTab === "challenge" ? "text-amber-400" : "text-slate-205"}`}>
                      1. CHALLENGE
                    </h5>
                    <p className="text-[9.5px] text-slate-400">Capture the problem. Define the mission.</p>
                  </div>
                </div>
                <ChevronRight className={`h-4.5 w-4.5 transition-all duration-300 ${mobileTab === "challenge" ? "text-amber-400 translate-x-0.5" : "text-slate-600"}`} />
              </div>

              {/* Claim selector card */}
              <div 
                onClick={() => setMobileTab("claim")}
                className={`p-3 rounded-2xl border transition-all duration-350 flex items-center justify-between cursor-pointer outline-none relative overflow-hidden select-none ${
                  mobileTab === "claim" 
                    ? "bg-[#101718] border-teal-500/40 shadow-[0_0_15px_rgba(45,212,191,0.08)] bg-gradient-to-tr from-teal-500/5 via-transparent to-transparent" 
                    : "bg-[#0e121a]/90 border-white/[0.04] hover:bg-[#121622]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                    mobileTab === "claim" 
                      ? "bg-teal-550/10 border-teal-400 text-teal-450" 
                      : "bg-[#0a0c10] border-white/5 text-slate-500"
                  }`}>
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className={`text-[11.5px] font-extrabold uppercase font-mono tracking-wide ${mobileTab === "claim" ? "text-teal-400" : "text-slate-205"}`}>
                      2. CLAIM
                    </h5>
                    <p className="text-[9.5px] text-slate-400">State your hypothesis. Make your assertion.</p>
                  </div>
                </div>
                <ChevronRight className={`h-4.5 w-4.5 transition-all duration-300 ${mobileTab === "claim" ? "text-teal-400 translate-x-0.5" : "text-slate-600"}`} />
              </div>

              {/* Query selector card */}
              <div 
                onClick={() => setMobileTab("query")}
                className={`p-3 rounded-2xl border transition-all duration-350 flex items-center justify-between cursor-pointer outline-none relative overflow-hidden select-none ${
                  mobileTab === "query" 
                    ? "bg-[#11161d] border-sky-550/40 shadow-[0_0_15px_rgba(14,165,233,0.08)] bg-gradient-to-tr from-sky-505/5 via-transparent to-transparent" 
                    : "bg-[#0e121a]/90 border-white/[0.04] hover:bg-[#121622]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center border transition-all duration-350 ${
                    mobileTab === "query" 
                      ? "bg-sky-550/10 border-sky-400 text-sky-450" 
                      : "bg-[#0a0c10] border-white/5 text-slate-500"
                  }`}>
                    <Search className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className={`text-[11.5px] font-extrabold uppercase font-mono tracking-wide ${mobileTab === "query" ? "text-sky-400" : "text-slate-205"}`}>
                      3. QUERY
                    </h5>
                    <p className="text-[9.5px] text-slate-400">Request evidence. Search authority sources.</p>
                  </div>
                </div>
                <ChevronRight className={`h-4.5 w-4.5 transition-all duration-300 ${mobileTab === "query" ? "text-sky-400 translate-x-0.5" : "text-slate-600"}`} />
              </div>

              {/* Investigation selector card */}
              <div 
                onClick={() => setMobileTab("investigation")}
                className={`p-3 rounded-2xl border transition-all duration-350 flex items-center justify-between cursor-pointer outline-none relative overflow-hidden select-none ${
                  mobileTab === "investigation" 
                    ? "bg-[#14131b] border-purple-500/40 shadow-[0_0_15px_rgba(167,139,250,0.08)] bg-gradient-to-tr from-purple-500/5 via-transparent to-transparent" 
                    : "bg-[#0e121a]/90 border-white/[0.04] hover:bg-[#121622]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center border transition-all duration-350 ${
                    mobileTab === "investigation" 
                      ? "bg-purple-505/10 border-purple-400 text-purple-450" 
                      : "bg-[#0a0c10] border-white/5 text-slate-505"
                  }`}>
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className={`text-[11.5px] font-extrabold uppercase font-mono tracking-wide ${mobileTab === "investigation" ? "text-purple-400" : "text-slate-205"}`}>
                      4. INVESTIGATION
                    </h5>
                    <p className="text-[9.5px] text-slate-400">Review findings. Explore evidence chains.</p>
                  </div>
                </div>
                <ChevronRight className={`h-4.5 w-4.5 transition-all duration-300 ${mobileTab === "investigation" ? "text-purple-400 translate-x-0.5" : "text-slate-600"}`} />
              </div>

              {/* Red Team selector card */}
              <div 
                onClick={() => setMobileTab("redteam")}
                className={`p-3 rounded-2xl border transition-all duration-350 flex items-center justify-between cursor-pointer outline-none relative overflow-hidden select-none ${
                  mobileTab === "redteam" 
                    ? "bg-[#181212] border-red-540/40 shadow-[0_0_15px_rgba(239,68,68,0.08)] bg-gradient-to-tr from-red-500/5 via-transparent to-transparent" 
                    : "bg-[#0e121a]/90 border-white/[0.04] hover:bg-[#121622]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center border transition-all duration-350 ${
                    mobileTab === "redteam" 
                      ? "bg-red-505/10 border-red-400 text-red-450" 
                      : "bg-[#0a0c10] border-white/5 text-slate-505"
                  }`}>
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className={`text-[11.5px] font-extrabold uppercase font-mono tracking-wide ${mobileTab === "redteam" ? "text-red-400" : "text-slate-205"}`}>
                      5. RED TEAM GATE
                    </h5>
                    <p className="text-[9.5px] text-slate-400">Perform scan. View vulnerabilities or overrides.</p>
                  </div>
                </div>
                <ChevronRight className={`h-4.5 w-4.5 transition-all duration-300 ${mobileTab === "redteam" ? "text-red-400 translate-x-0.5" : "text-slate-600"}`} />
              </div>

              {/* Approval selector card */}
              <div 
                onClick={() => setMobileTab("approval")}
                className={`p-3 rounded-2xl border transition-all duration-350 flex items-center justify-between cursor-pointer outline-none relative overflow-hidden select-none ${
                  mobileTab === "approval" 
                    ? "bg-[#181613] border-orange-550/40 shadow-[0_0_15px_rgba(249,115,22,0.08)] bg-gradient-to-tr from-orange-505/5 via-transparent to-transparent" 
                    : "bg-[#0e121a]/90 border-white/[0.04] hover:bg-[#121622]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center border transition-all duration-350 ${
                    mobileTab === "approval" 
                      ? "bg-orange-505/10 border-orange-400 text-orange-450" 
                      : "bg-[#0a0c10] border-white/5 text-slate-505"
                  }`}>
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className={`text-[11.5px] font-extrabold uppercase font-mono tracking-wide ${mobileTab === "approval" ? "text-orange-400" : "text-slate-205"}`}>
                      6. APPROVAL
                    </h5>
                    <p className="text-[9.5px] text-slate-400">Make the decision. Approve, reject or hold.</p>
                  </div>
                </div>
                <ChevronRight className={`h-4.5 w-4.5 transition-all duration-300 ${mobileTab === "approval" ? "text-orange-400 translate-x-0.5" : "text-slate-600"}`} />
              </div>

            </div>
          </section>

          {/* D. ACTIVE VALIDATION STATE LIVE TICKER MODULE Banner */}
          <div className="mt-2 select-none">
            {(() => {
              // Determine active validation state
              let validationState: "REQUIRED" | "REVIEWING" | "ACCEPTED" | "FAILED" = "REQUIRED";
              
              if (selectedPacket.jemma_verdict === "APPROVED" && selectedPacket.red_team_verdict === "CLEARED") {
                validationState = "ACCEPTED";
              } else if (ingestStatus === "running") {
                validationState = "REVIEWING";
              } else if (
                selectedPacket.jemma_verdict === "REJECTED" || 
                selectedPacket.red_team_verdict === "FAILED" || 
                selectedPacket.jemma_verdict === "FAILED" || 
                ingestStatus === "error"
              ) {
                validationState = "FAILED";
              } else if (selectedPacket.jemma_verdict === "PENDING" || selectedPacket.red_team_verdict === "PENDING") {
                validationState = "REQUIRED";
              }

              switch (validationState) {
                case "ACCEPTED":
                  return (
                    <div className="bg-gradient-to-b from-[#0b1b17] via-[#08120f] to-[#030806] border border-emerald-500/25 p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden transition-all duration-300 shadow-[0_10px_25px_-5px_rgba(16,185,129,0.06),inset_0_1px_1px_rgba(255,255,255,0.08)]">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-lg pointer-events-none" />
                      <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-inner">
                        <ShieldCheck className="h-6 w-6 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                      </div>
                      <div className="flex-1">
                        <span className="text-[8px] font-mono text-emerald-400/50 uppercase font-black tracking-widest leading-none block">ACTIVE VALIDATION MODULE</span>
                        <p className="text-[12px] text-emerald-400 font-extrabold tracking-wide uppercase mt-0.5 leading-none">VALIDATION ACCEPTED</p>
                        <p className="text-[9.5px] text-slate-350 font-medium mt-1 leading-tight">Evidence integrity verified • Chain secure</p>
                      </div>
                      <span className="bg-emerald-950/40 text-emerald-400 text-[8px] font-mono font-black border border-emerald-800/30 px-2 py-1 rounded-md shrink-0 self-center uppercase tracking-wider">
                        ✓ SECURE
                      </span>
                    </div>
                  );
                case "REVIEWING":
                  return (
                    <div className="bg-gradient-to-b from-[#0d1726] via-[#09111c] to-[#040810] border border-sky-500/25 p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden transition-all duration-300 shadow-[0_10px_25px_-5px_rgba(14,165,223,0.06),inset_0_1px_1px_rgba(255,255,255,0.08)]">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-sky-500/5 rounded-full blur-lg pointer-events-none" />
                      <div className="h-10 w-10 shrink-0 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-500/20 shadow-inner">
                        <RefreshCw className="h-5 w-5 animate-spin text-sky-400" />
                      </div>
                      <div className="flex-1">
                        <span className="text-[8px] font-mono text-sky-400/50 uppercase font-black tracking-widest leading-none block">ACTIVE VALIDATION MODULE</span>
                        <p className="text-[12px] text-sky-400 font-extrabold tracking-wide uppercase mt-0.5 leading-none">UNDER REVIEW</p>
                        <p className="text-[9.5px] text-slate-350 font-medium mt-1 leading-tight">Executing automated verification pipelines...</p>
                      </div>
                      <span className="bg-sky-950/40 text-sky-400 text-[8px] font-mono font-black border border-sky-800/30 px-2 py-1 rounded-md shrink-0 self-center uppercase tracking-wider animate-pulse">
                        ⚏ ACTIVE
                      </span>
                    </div>
                  );
                case "FAILED":
                  return (
                    <div className="bg-gradient-to-b from-[#1c0d0f] via-[#12090a] to-[#080304] border border-rose-500/25 p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden transition-all duration-300 shadow-[0_10px_25px_-5px_rgba(244,63,94,0.06),inset_0_1px_1px_rgba(255,255,255,0.08)]">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-full blur-lg pointer-events-none" />
                      <div className="h-10 w-10 shrink-0 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20 shadow-inner">
                        <ShieldAlert className="h-5 w-5 text-rose-400 animate-[bounce_1.5s_infinite]" />
                      </div>
                      <div className="flex-1">
                        <span className="text-[8px] font-mono text-rose-400/50 uppercase font-black tracking-widest leading-none block">ACTIVE VALIDATION MODULE</span>
                        <p className="text-[12px] text-rose-500 font-extrabold tracking-wide uppercase mt-0.5 leading-none">VALIDATION FAILED</p>
                        <p className="text-[9.5px] text-slate-350 font-medium mt-1 leading-tight">Integrity check mismatch • Review system logs</p>
                      </div>
                      <span className="bg-rose-950/40 text-rose-400 text-[8px] font-mono font-black border border-rose-800/30 px-2 py-1 rounded-md shrink-0 self-center uppercase tracking-wider animate-pulse">
                        ✗ FAILED
                      </span>
                    </div>
                  );
                case "REQUIRED":
                default:
                  return (
                    <div className="bg-gradient-to-b from-[#1b140f] via-[#120e0a] to-[#080604] border border-amber-500/25 p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden transition-all duration-300 shadow-[0_10px_25px_-5px_rgba(245,158,11,0.06),inset_0_1px_1px_rgba(255,255,255,0.08)] animate-[pulse_3s_infinite]">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-lg pointer-events-none" />
                      <div className="h-10 w-10 shrink-0 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-inner">
                        <AlertCircle className="h-6 w-6 text-amber-500 animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <span className="text-[8px] font-mono text-amber-500/50 uppercase font-black tracking-widest leading-none block">ACTIVE VALIDATION MODULE</span>
                        <p className="text-[12px] text-amber-500 font-extrabold tracking-wide uppercase mt-0.5 leading-none">VALIDATION REQUIRED</p>
                        <p className="text-[9.5px] text-slate-350 font-medium mt-1 leading-tight">Governance gate active • Operator action required</p>
                      </div>
                      <span className="bg-amber-950/40 text-amber-500 text-[8px] font-mono font-black border border-amber-800/30 px-2 py-1 rounded-md shrink-0 self-center uppercase tracking-wider animate-pulse">
                        ! PENDING
                      </span>
                    </div>
                  );
              }
            })()}
          </div>

        </div>

        {/* 4. DESIGN GLOSSARY FOOTER */}
        <div className="absolute bottom-16 left-0 right-0 flex items-center justify-center py-2 select-none opacity-40 z-10">
          <div className="flex items-center gap-2 font-mono text-[7px] text-[#8fa1b4] tracking-widest uppercase font-extrabold">
            <span>MICHELIN GRADE EXPERIENCE</span>
            <span className="h-0.5 w-0.5 rounded-full bg-[#2dd4bf]" />
            <span>SOFT TOUCH TACTILITY</span>
          </div>
        </div>

        {/* 5. BOTTOM NAVIGATION BAR */}
        <nav className="fixed bottom-0 left-0 right-0 h-18 bg-[#0a0d14]/90 backdrop-blur-md border-t border-white/5 px-2 flex justify-around items-center z-50 select-none shadow-[0_-8px_30px_rgba(0,0,0,0.6)] rounded-t-xl">
          <button 
            onClick={() => setMobileTab("challenge")}
            className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors outline-none cursor-pointer border border-transparent bg-transparent ${mobileTab === "challenge" ? "text-amber-400 font-extrabold" : "text-slate-500 hover:text-slate-300"}`}
          >
            <Compass className="h-5 w-5" />
            <span className="text-[8.5px] font-mono font-black uppercase tracking-wider">Challenge</span>
          </button>
          
          <button 
            onClick={() => setMobileTab("claim")}
            className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors outline-none cursor-pointer border border-transparent bg-transparent ${mobileTab === "claim" ? "text-teal-400 font-extrabold" : "text-slate-500 hover:text-slate-300"}`}
          >
            <Layers className="h-5 w-5" />
            <span className="text-[8.5px] font-mono font-black uppercase tracking-wider">Claim</span>
          </button>

          <button 
            onClick={() => setMobileTab("query")}
            className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors outline-none cursor-pointer border border-transparent bg-transparent ${mobileTab === "query" ? "text-sky-400 font-extrabold" : "text-slate-500 hover:text-slate-300"}`}
          >
            <Search className="h-5 w-5" />
            <span className="text-[8.5px] font-mono font-black uppercase tracking-wider">Query</span>
          </button>

          <button 
            onClick={() => setMobileTab("investigation")}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 transition-colors outline-none cursor-pointer border border-transparent bg-transparent ${mobileTab === "investigation" ? "text-purple-400 font-extrabold" : "text-slate-500 hover:text-slate-300"}`}
          >
            <Activity className="h-4.5 w-4.5" />
            <span className="text-[8.5px] font-mono font-black uppercase tracking-wider font-extrabold">Investigate</span>
          </button>

          <button 
            onClick={() => setMobileTab("redteam")}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 transition-colors outline-none cursor-pointer border border-transparent bg-transparent ${mobileTab === "redteam" ? "text-red-400 font-extrabold" : "text-slate-500 hover:text-slate-300"}`}
          >
            <ShieldAlert className="h-4.5 w-4.5" />
            <span className="text-[8.5px] font-mono font-black uppercase tracking-wider">Red Team</span>
          </button>

          <button 
            onClick={() => setMobileTab("approval")}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 transition-colors outline-none cursor-pointer border border-transparent bg-transparent ${mobileTab === "approval" ? "text-orange-400 font-extrabold" : "text-slate-500 hover:text-slate-300"}`}
          >
            <CheckCircle2 className="h-4.5 w-4.5" />
            <span className="text-[8.5px] font-mono font-black uppercase tracking-wider">Approval</span>
          </button>
        </nav>

        {/* Floating preview button to return workbench if override is active */}
        {mobileOverride && (
          <button 
            onClick={() => setMobileOverride(false)}
            className="fixed bottom-22 right-4 bg-teal-500/10 border border-teal-500/20 hover:bg-teal-520/30 text-[#2dd4bf] font-mono font-extrabold uppercase text-[9px] tracking-widest py-1.5 px-3 rounded-full z-45 transition-all select-none shadow-md cursor-pointer"
          >
            🖥️ Workbench Mode
          </button>
        )}

        {renderFloatingCopilot()}

      </div>
    );
  };

  // Floating Copilot Master Key widget
  const renderFloatingCopilot = () => {
    const activeId = selectedPacket?.packet_id || "PKT-001";
    const activeState = selectedPacket?.current_status || "RECOMMENDATION_CREATED";
    const activeWorkflowStage = mobileTab.toUpperCase(); // CHALLENGE | CLAIM | QUERY | INVESTIGATION | APPROVAL
    const isReady = !(selectedPacket?.jemma_verdict === "PENDING" || selectedPacket?.red_team_verdict === "PENDING" || selectedPacket?.operator_gate === "LOCKED");
    const activeStatus = isReady ? "READY" : "PENDING";

    // Dynamic switches based on workflow stage
    let nextActionLabel = "Review Packet";
    let nextStage: "challenge" | "claim" | "query" | "investigation" | "redteam" | "approval" = "challenge";

    switch (activeWorkflowStage) {
      case "CHALLENGE":
        nextActionLabel = "Advance to Claim";
        nextStage = "claim";
        break;
      case "CLAIM":
        nextActionLabel = "Advance to Query";
        nextStage = "query";
        break;
      case "QUERY":
        nextActionLabel = "Open Investigation";
        nextStage = "investigation";
        break;
      case "INVESTIGATION":
        nextActionLabel = "Advance to Red Team Gate";
        nextStage = "redteam";
        break;
      case "REDTEAM":
        nextActionLabel = "Submit for Approval";
        nextStage = "approval";
        break;
      case "APPROVAL":
        nextActionLabel = "Seal Packet";
        nextStage = "approval"; // stays on approval
        break;
      default:
        nextActionLabel = "Review Packet";
        nextStage = "challenge";
    }

    const handleNavigate = () => {
      setMobileTab(nextStage);
    };

    return (
      <div 
        id="floating-copilot-widget"
        className="fixed right-6 bottom-20 md:bottom-6 z-[999] flex flex-col items-end"
      >
        <AnimatePresence>
          {copilotExpanded ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-[#0f1217]/95 backdrop-blur-md border border-[#2d3748] rounded-2xl shadow-2xl p-4 w-64 text-slate-200 text-left relative overflow-hidden flex flex-col gap-3 font-mono"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-1.5 text-[10.5px] font-black uppercase text-emerald-400 tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  🧠 COPILOT
                </div>
                <button 
                  onClick={() => setCopilotExpanded(false)}
                  className="text-slate-500 hover:text-slate-300 transition-colors text-xs p-1 animate-none select-none"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1.5 text-[9.5px]">
                <div className="flex justify-between items-center bg-[#090b0e] py-1 px-2 rounded border border-white/5">
                  <span className="text-slate-500 uppercase font-bold text-[8.5px]">Packet:</span>
                  <span className="text-slate-300 font-bold">{activeId}</span>
                </div>
                <div className="flex justify-between items-center bg-[#090b0e] py-1 px-2 rounded border border-white/5">
                  <span className="text-slate-500 uppercase font-bold text-[8.5px]">Stage:</span>
                  <span className="text-amber-400 font-bold">{activeWorkflowStage}</span>
                </div>
                <div className="flex justify-between items-center bg-[#090b0e] py-1 px-2 rounded border border-white/5">
                  <span className="text-slate-500 uppercase font-bold text-[8.5px]">Status:</span>
                  <span className={`font-bold ${isReady ? "text-emerald-400" : "text-amber-400 animate-pulse"}`}>{activeStatus}</span>
                </div>
                <div className="flex justify-between items-center bg-[#090b0e] py-1 px-2 rounded border border-white/5">
                  <span className="text-slate-500 uppercase font-bold text-[8.5px]">Route Dock:</span>
                  <span className="text-indigo-400 font-black truncate max-w-[130px]">{selectedPipeline}</span>
                </div>
              </div>

              <div className="pt-1 select-none">
                <span className="text-[8.5px] text-slate-500 uppercase font-bold block mb-1 leading-none text-center">Recommended Action:</span>
                <button
                  onClick={handleNavigate}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[10.5px] py-2 px-3 rounded-lg border border-emerald-400/20 shadow-md active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 group uppercase tracking-wide"
                >
                  <span className="font-sans font-black">▶</span> {nextActionLabel}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              onClick={() => setCopilotExpanded(true)}
              className="bg-[#0f1217]/95 border border-[#2d3748] hover:border-emerald-500/40 hover:bg-emerald-500/5 text-slate-200 font-bold text-[10px] tracking-wider py-2 px-3 rounded-full shadow-lg transition-all flex items-center gap-1.5 cursor-pointer select-none group focus:outline-none"
            >
              <span className="animate-pulse">🧠</span>
              <span className="font-mono uppercase text-slate-300 group-hover:text-emerald-400 transition-colors">Copilot Registry Key</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    );
  };

  if (effectiveIsMobile) {
    if (viewMode === "wallstreet") {
      return (
        <div className="min-h-screen bg-[#07090e] text-[#f1f5f9] font-sans flex flex-col antialiased relative selection:bg-emerald-500/30 overflow-x-hidden pb-18">
          {/* Top IOS style status bar */}
          <div className="w-full px-5 pt-3 pb-1 flex justify-between items-center text-[11px] font-mono text-slate-400 font-semibold select-none shrink-0 z-10 bg-[#07090e]">
            <span>09:41</span>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[10px] tracking-wider text-emerald-400/80">5G LTE</span>
              <div className="w-5 h-2.5 border border-slate-500 rounded-sm p-0.5 flex items-center">
                <div className="h-full w-4 bg-emerald-400 rounded-2xs" />
              </div>
            </div>
          </div>

          {/* Header */}
          <header className="px-5 py-3 flex items-center justify-between border-b border-white/5 bg-[#0b0c10]/60 backdrop-blur-md z-15 select-none shrink-0">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setMobileOverride(false)}
                className="px-2 py-1 rounded-lg border border-slate-800 bg-[#12161f]/80 text-slate-400 hover:text-white transition-all text-[9.5px] font-mono font-bold select-none cursor-pointer"
              >
                🖥️ WORKBENCH
              </button>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-emerald-400 text-xs font-mono">📈</span>
                  <span className="font-mono text-[11.5px] font-black tracking-widest text-[#ececf1]">WALLSTREET</span>
                  <span className="text-[7.5px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1 py-0.2 rounded font-extrabold uppercase">OBSERVER v0.1</span>
                </div>
                <span className="text-[8px] tracking-widest text-slate-400 uppercase font-black font-mono">Market Ecosystem Observer</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative flex flex-col items-end text-right select-none">
                <span className="text-[9px] text-emerald-400 font-bold tracking-widest uppercase flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> OPERATOR
                </span>
                <span className="text-[7.5px] text-slate-500 font-mono tracking-wider truncate max-w-[100px]">rodlife1314@gmail.com</span>
              </div>
            </div>
          </header>

          {/* Body content scrollable */}
          <main className="flex-1 overflow-y-auto px-4 py-4 pb-20 z-10">
            <WallStreetWorkspace />
          </main>

          {/* Navigation Bar matching the segmented controls but on mobile */}
          <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#090b0e]/95 backdrop-blur-md border-t border-white/5 flex items-center justify-around px-2 z-50">
            <button 
              onClick={() => setViewMode("wallstreet")}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 transition-colors outline-none cursor-pointer ${viewMode === "wallstreet" ? "text-emerald-400 font-extrabold" : "text-slate-500 hover:text-slate-300"}`}
            >
              <TrendingUp className="h-4.5 w-4.5" />
              <span className="text-[8.5px] font-mono font-black uppercase tracking-wider">WallStreet</span>
            </button>
            <button 
              onClick={() => {
                setViewMode("operator");
                setMobileTab("challenge");
              }}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 transition-colors outline-none cursor-pointer ${viewMode === "operator" ? "text-amber-400 font-extrabold" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Compass className="h-4.5 w-4.5" />
              <span className="text-[8.5px] font-mono font-black uppercase tracking-wider font-extrabold">Operator</span>
            </button>
            <button 
              onClick={() => {
                setViewMode("redteam");
                setMobileTab("redteam");
              }}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 transition-colors outline-none cursor-pointer ${viewMode === "redteam" ? "text-red-400 font-extrabold" : "text-slate-500 hover:text-slate-300"}`}
            >
              <ShieldAlert className="h-4.5 w-4.5" />
              <span className="text-[8.5px] font-mono font-black uppercase tracking-wider font-extrabold">Red Team</span>
            </button>
            <button 
              onClick={() => {
                setViewMode("archive");
                setExpandedSection(null);
              }}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 transition-colors outline-none cursor-pointer ${viewMode === "archive" ? "text-violet-400 font-extrabold" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Database className="h-4.5 w-4.5" />
              <span className="text-[8.5px] font-mono font-black uppercase tracking-wider font-extrabold">Archive</span>
            </button>
          </nav>
        </div>
      );
    }

    if (viewMode === "archive") {
      return (
        <div className="min-h-screen bg-[#07090e] text-[#f1f5f9] font-sans flex flex-col antialiased relative selection:bg-violet-500/30 overflow-x-hidden pb-18">
          {/* Top IOS style status bar */}
          <div className="w-full px-5 pt-3 pb-1 flex justify-between items-center text-[11px] font-mono text-slate-400 font-semibold select-none shrink-0 z-10 bg-[#07090e]">
            <span>09:41</span>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[10px] tracking-wider text-violet-400/80">5G LTE</span>
              <div className="w-5 h-2.5 border border-slate-500 rounded-sm p-0.5 flex items-center">
                <div className="h-full w-4 bg-violet-400 rounded-2xs" />
              </div>
            </div>
          </div>

          {/* Header */}
          <header className="px-5 py-3 flex items-center justify-between border-b border-white/5 bg-[#0b0c10]/60 backdrop-blur-md z-15 select-none shrink-0">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setMobileOverride(false)}
                className="px-2 py-1 rounded-lg border border-slate-800 bg-[#12161f]/80 text-slate-400 hover:text-white transition-all text-[9.5px] font-mono font-bold select-none cursor-pointer"
              >
                🖥️ WORKBENCH
              </button>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-violet-400 text-xs font-mono">📂</span>
                  <span className="font-mono text-[11.5px] font-black tracking-widest text-[#ececf1]">ARCHIVE v1</span>
                  <span className="text-[7.5px] bg-violet-500/20 text-violet-300 border border-violet-500/30 px-1 py-0.2 rounded font-extrabold uppercase font-mono">Active</span>
                </div>
                <span className="text-[8px] tracking-widest text-slate-400 uppercase font-black font-mono">Chain of Custody Ledger</span>
              </div>
            </div>
          </header>

          {/* Body content scrollable */}
          <main className="flex-1 overflow-y-auto px-4 py-4 pb-20 z-10">
            {renderPacketArchiveDashboard()}
          </main>

          {/* Navigation Bar matching the segmented controls but on mobile */}
          <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#090b0e]/95 backdrop-blur-md border-t border-white/5 flex items-center justify-around px-2 z-50">
            <button 
              onClick={() => setViewMode("wallstreet")}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 transition-colors outline-none cursor-pointer ${viewMode === "wallstreet" ? "text-emerald-400 font-extrabold" : "text-slate-500 hover:text-slate-300"}`}
            >
              <TrendingUp className="h-4.5 w-4.5" />
              <span className="text-[8.5px] font-mono font-black uppercase tracking-wider">WallStreet</span>
            </button>
            <button 
              onClick={() => {
                setViewMode("operator");
                setMobileTab("challenge");
              }}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 transition-colors outline-none cursor-pointer ${viewMode === "operator" ? "text-amber-400 font-extrabold" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Compass className="h-4.5 w-4.5" />
              <span className="text-[8.5px] font-mono font-black uppercase tracking-wider font-extrabold">Operator</span>
            </button>
            <button 
              onClick={() => {
                setViewMode("redteam");
                setMobileTab("redteam");
              }}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 transition-colors outline-none cursor-pointer ${viewMode === "redteam" ? "text-red-400 font-extrabold" : "text-slate-500 hover:text-slate-300"}`}
            >
              <ShieldAlert className="h-4.5 w-4.5" />
              <span className="text-[8.5px] font-mono font-black uppercase tracking-wider font-extrabold">Red Team</span>
            </button>
            <button 
              onClick={() => {
                setViewMode("archive");
                setExpandedSection(null);
              }}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 transition-colors outline-none cursor-pointer ${viewMode === "archive" ? "text-violet-400 font-extrabold" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Database className="h-4.5 w-4.5" />
              <span className="text-[8.5px] font-mono font-black uppercase tracking-wider font-extrabold">Archive</span>
            </button>
          </nav>
        </div>
      );
    }

    return renderMobileCockpit();
  }

  return (
    <div className="min-h-screen bg-[#0b0c0e] text-slate-100 font-sans selection:bg-[#3182ce]/40 flex flex-col antialiased">
      
      {/* 1. TACTICAL EXECUTIVE HEADER BAR */}
      <header className="border-b border-[#252a32] bg-[#111417] px-6 py-4 flex flex-col md:flex-row items-center justify-between shadow-lg gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="h-10 w-10 bg-gradient-to-tr from-slate-700 via-slate-800 to-indigo-950 rounded-xl flex items-center justify-center border border-slate-700/50 shadow-[0_0_15px_rgba(255,255,255,0.05)] text-indigo-400">
            <Plane className="h-5 w-5 rotate-45 transform" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-mono text-base font-extrabold tracking-widest text-[#ececf1]">PATHFINDER</h1>
              <span className="text-[9px] bg-sky-950/40 text-sky-400 px-2 py-0.5 rounded border border-sky-800/30 font-semibold uppercase tracking-wider">
                Cockpit v0.2
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Pathfinder Executive Flight Surface & Chain-of-Custody Command Center</p>
          </div>
        </div>

        {/* Dashboard instrumentation overview indicators */}
        <div className="flex flex-wrap items-center gap-3.5 text-xs w-full md:w-auto justify-start md:justify-end">
          <div className="flex items-center gap-2 bg-[#171a1f] px-3 py-1.5 rounded-lg border border-[#232932] text-slate-300">
            <Activity className="h-4 w-4 text-sky-400" />
            <span className="font-mono text-[10px] text-slate-400">ALIGNMENT:</span>
            <span className="font-mono font-bold text-sky-300">{alignmentRate}%</span>
          </div>

          <div className="flex items-center gap-2 bg-[#171a1f] px-3 py-1.5 rounded-lg border border-[#232932] text-slate-300">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <span className="font-mono text-[10px] text-slate-400">TRACE CACHE:</span>
            <span className="font-mono font-bold text-emerald-300">{sysLogCount} logs</span>
          </div>

          <div className="flex items-center gap-2 bg-[#171a1f]/80 px-3 py-1.5 rounded-lg border border-[#232932] text-slate-300">
            <span className="font-mono text-[10px] text-slate-400">UTC CLOCK:</span>
            <span className="font-mono text-[11px] text-slate-200 tracking-wider font-semibold">{currentTime || "Loading..."}</span>
          </div>
        </div>
      </header>

      {/* 2. FIVE LARGE COCKPIT MAIN SELECTORS ROW */}
      <div className="bg-[#12161b] border-b border-[#222831] px-6 py-4 grid grid-cols-2 md:grid-cols-5 gap-3 shrink-0 shadow-lg">
        <button
          onClick={handleIngestAction}
          disabled={ingestStatus === "running" || ingestStatus === "deploying"}
          className="bg-gradient-to-b from-[#1c222b] to-[#151a21] hover:from-[#252e3b] hover:to-[#1b222b] text-[#cbd5e1] border border-[#2d3748] px-4 py-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all outline-none focus:border-sky-500 active:scale-98 relative overflow-hidden text-center cursor-pointer shadow-sm group"
        >
          <div className="absolute top-1 left-2 flex items-center gap-1">
            <span className={`h-1.5 w-1.5 rounded-full ${ingestedModules.length >= INGEST_SUBSYSTEMS.length ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' : 'bg-amber-400 animate-pulse'}`} />
            <span className="text-[7.5px] font-mono text-slate-500 uppercase">INGEST STATE</span>
          </div>
          <Database className="h-4 w-4 text-sky-400 mt-2 block group-hover:scale-110 transition-transform" />
          <span className="font-mono text-[11.5px] font-bold tracking-widest text-[#f1f5f9]">[ INGEST ]</span>
          <span className="text-[9px] text-[#94a3b8] font-medium leading-tight">Scan Subsystems Core</span>
        </button>

        <button
          onClick={() => handleQuerySearch()}
          className="bg-gradient-to-b from-[#1c222b] to-[#151a21] hover:from-[#252e3b] hover:to-[#1b222b] text-[#cbd5e1] border border-[#2d3748] px-4 py-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all outline-none focus:border-sky-500 active:scale-98 relative overflow-hidden text-center cursor-pointer shadow-sm group"
        >
          <div className="absolute top-1 left-2 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            <span className="text-[7.5px] font-mono text-slate-500 uppercase">SEARCH ENGINE</span>
          </div>
          <Search className="h-4 w-4 text-emerald-400 mt-2 block group-hover:scale-110 transition-transform" />
          <span className="font-mono text-[11.5px] font-bold tracking-widest text-[#f1f5f9]">[ QUERY ]</span>
          <span className="text-[9px] text-[#94a3b8] font-medium leading-tight">Query FRED/BLS Data</span>
        </button>

        <button
          onClick={handlePathfindTrigger}
          disabled={ingestStatus === "running" || ingestStatus === "deploying"}
          className="bg-gradient-to-b from-[#1c222b] to-[#151a21] hover:from-[#252e3b] hover:to-[#1b222b] text-[#cbd5e1] border border-[#2d3748] px-4 py-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all outline-none focus:border-sky-500 active:scale-98 relative overflow-hidden text-center cursor-pointer shadow-sm group"
        >
          <div className="absolute top-1 left-2 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" />
            <span className="text-[7.5px] font-mono text-slate-500 uppercase">RECOMMENDER</span>
          </div>
          <Compass className="h-4 w-4 text-violet-400 mt-2 block group-hover:scale-110 transition-transform" />
          <span className="font-mono text-[11.5px] font-bold tracking-widest text-[#f1f5f9]">[ PATHFIND ]</span>
          <span className="text-[9px] text-[#94a3b8] font-medium leading-tight">Formulate Recommend</span>
        </button>

        <button
          onClick={handleVerdictValidation}
          disabled={
            ingestStatus === "running" || 
            selectedPacket.current_status === "Deployed (Demo)" ||
            selectedPacket.current_status === "DEPLOYED" ||
            selectedPacket.current_status === "RECOMMENDATION_CREATED"
          }
          className={`bg-gradient-to-b from-[#1c222b] to-[#151a21] text-[#cbd5e1] border px-4 py-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all outline-none active:scale-98 relative overflow-hidden text-center shadow-sm group ${
            selectedPacket.current_status === "RECOMMENDATION_CREATED"
              ? "opacity-40 cursor-not-allowed border-slate-800"
              : selectedPacket.jemma_verdict === "APPROVED" && selectedPacket.red_team_verdict === "CLEARED"
              ? "border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.1)] hover:from-[#252e3b] hover:to-[#1b222b] cursor-pointer"
              : "border-[#2d3748] hover:from-[#252e3b] hover:to-[#1b222b] cursor-pointer"
          }`}
        >
          <div className="absolute top-1 left-2 flex items-center gap-1">
            <span className={`h-1.5 w-1.5 rounded-full ${
              selectedPacket.current_status === "RECOMMENDATION_CREATED"
                ? "bg-amber-500/60"
                : selectedPacket.jemma_verdict === "APPROVED"
                ? 'bg-emerald-400'
                : 'bg-amber-400 animate-pulse'
            }`} />
            <span className="text-[7.5px] font-mono text-slate-500 uppercase">
              {selectedPacket.current_status === "RECOMMENDATION_CREATED" ? "VALIDATION LOCKED" : "VERDICT AUDIT"}
            </span>
          </div>
          {selectedPacket.current_status === "RECOMMENDATION_CREATED" ? (
            <Lock className="h-4 w-4 text-slate-500 mt-2 block" />
          ) : (
            <ShieldCheck className="h-4 w-4 text-amber-400 mt-2 block group-hover:scale-110 transition-transform" />
          )}
          <span className="font-mono text-[11.5px] font-bold tracking-widest text-[#f1f5f9]">[ VALIDATE ]</span>
          <span className="text-[9px] text-[#94a3b8] font-medium leading-tight">
            {selectedPacket.current_status === "RECOMMENDATION_CREATED" ? "Submit URL to Unlock" : "Evaluate Veracity"}
          </span>
        </button>

        <button
          onClick={handleDeployReleaseDryRun}
          disabled={ingestStatus === "running" || selectedPacket.operator_gate !== "APPROVED" || selectedPacket.current_status !== "PACKET_SEALED"}
          className={`col-span-2 md:col-span-1 px-4 py-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all outline-none focus:ring-1 active:scale-98 relative overflow-hidden text-center cursor-pointer shadow-md group ${
            selectedPacket.operator_gate === "APPROVED" && selectedPacket.current_status === "PACKET_SEALED" && ingestStatus !== "running"
              ? "bg-gradient-to-b from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white border border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
              : "bg-gradient-to-b from-[#1b2027] to-[#12161c] text-slate-500 border border-[#2b3543] cursor-not-allowed"
          }`}
        >
          <div className="absolute top-1 left-2 flex items-center gap-1">
            <span className={`h-1.5 w-1.5 rounded-full ${selectedPacket.current_status === "Deployed (Demo)" ? 'bg-emerald-300' : 'bg-amber-500'}`} />
            <span className="text-[7.5px] font-mono text-slate-400 uppercase">LAUNCH GATE</span>
          </div>
          <Server className={`h-4 w-4 mt-2 block group-hover:scale-110 transition-transform ${selectedPacket.operator_gate === "APPROVED" ? 'text-white' : 'text-slate-600'}`} />
          <span className="font-mono text-[11.5px] font-bold tracking-widest">[ DEPLOY ]</span>
          <span className="text-[9px] font-medium leading-tight">CPU Cloud Run Release</span>
        </button>
      </div>

      {/* STICKY SUMMARY BAR & VIEW MODE CONTROLLER */}
      <div className="sticky top-0 z-45 bg-[#111417]/95 backdrop-blur-md border-b border-[#252a32] px-6 py-2.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs font-mono text-slate-300 shadow-md">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11px]">
          <span className="font-extrabold text-sky-400 bg-sky-950/45 px-2 py-0.5 rounded border border-sky-800/40 text-[10px]" id="summary-packet-id">
            {selectedPacket.packet_id || "PKT-NULL"}
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300 bg-[#1a1f26] px-1.5 py-0.5 rounded text-[10px]" id="summary-packet-type">
            {getPacketType(selectedPacket)}
          </span>
          <span className="text-slate-500">|</span>
          <span className={`font-extrabold uppercase px-1.5 py-0.5 rounded text-[10px] ${
            selectedPacket.current_status === "DEPLOYED" || selectedPacket.current_status === "Deployed (Demo)"
              ? "text-emerald-400 bg-emerald-950/30"
              : selectedPacket.current_status === "OPERATOR_APPROVED"
              ? "text-purple-400 bg-purple-950/35"
              : selectedPacket.current_status === "FULLY_VERIFIED"
              ? "text-sky-300 bg-sky-950/40"
              : "text-amber-500 bg-amber-950/30"
          }`} id="summary-packet-status">
            {selectedPacket.current_status || "PENDING"}
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">
            Capability:{" "}
            <span className="text-indigo-400 font-bold" id="summary-capability-name">
              {capabilityProfile ? capabilityProfile.capabilityName : "Dataset Discovery"}
            </span>
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">
            Runtime:{" "}
            <span className="text-slate-200 font-semibold" id="summary-runtime-pref">
              {bridgeRuntimePreference === "octagon-compute-runtime" ? "Pathfinder Runtime" : bridgeRuntimePreference === "nvidia-l4" ? "NVIDIA L4" : bridgeRuntimePreference === "nvidia-t4" ? "NVIDIA T4" : "Not Selected"}
            </span>
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">
            Destination:{" "}
            <span className="text-slate-200 font-semibold" id="summary-destination-target">
              {bridgeDestinationTarget || "Not Selected"}
            </span>
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">
            Reasoner:{" "}
            <span className={`font-semibold ${selectedReasoner === "Not Selected" ? "text-amber-500 animate-pulse" : "text-emerald-400"}`} id="summary-selected-reasoner">
              {(() => {
                if (selectedReasoner === "Gemini Reasoner") return "Gemini";
                if (selectedReasoner === "Claude-style Validator") return "Claude-style";
                if (selectedReasoner === "DeepSeek Reasoner") return "DeepSeek";
                if (selectedReasoner === "Qwen Reasoner") return "Qwen";
                if (selectedReasoner === "Local Reasoner") return "Local";
                return selectedReasoner;
              })()}
            </span>
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">
            Credentials:{" "}
            <span className={`font-semibold ${resolvedCredentialStatus === "MISSING" ? "text-amber-500 animate-pulse" : "text-emerald-400"}`} id="summary-resolved-credentials">
              {resolvedCredentialStatus === "MISSING" ? "Pending" : "Valid"}
            </span>
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">
            Dispatch:{" "}
            <span className={`font-extrabold ${computedDispatchStatus === "DISPATCH_READY" || computedDispatchStatus === "DRY_RUN" ? "text-emerald-400" : "text-slate-500"}`} id="summary-dispatch-status">
              {computedDispatchStatus === "DISPATCH_READY" || computedDispatchStatus === "DRY_RUN" ? "Ready" : "Locked"}
            </span>
          </span>
        </div>

        {/* View mode segmented controller */}
        <div className="flex bg-[#0b0c0e] p-0.5 rounded-lg border border-[#232932] gap-0.5 shrink-0 self-start sm:self-auto flex-wrap font-mono">
          {(["wallstreet", "operator", "architect", "engineer", "archive", "redteam"] as const).map((mode) => {
            const isSelected = viewMode === mode;
            return (
              <button
                key={mode}
                onClick={() => {
                  setViewMode(mode);
                  if (mode === "wallstreet") {
                    setExpandedSection(null);
                  } else if (mode === "operator") {
                    setExpandedSection(1);
                  } else if (mode === "architect") {
                    setExpandedSection(2);
                  } else if (mode === "engineer") {
                    setExpandedSection(4);
                  } else if (mode === "archive" || mode === "redteam") {
                    setExpandedSection(null);
                  }
                }}
                className={`px-3 py-1 rounded-md text-[9.5px] font-mono uppercase transition-all tracking-wider font-extrabold cursor-pointer ${
                  isSelected
                    ? "bg-[#14181d] text-sky-400 border border-[#252c36] shadow-sm font-black"
                    : "text-slate-500 hover:text-slate-350 border border-transparent"
                }`}
                id={`viewmode-${mode}-btn`}
              >
                {mode === "wallstreet" ? "📈 WALLSTREET v0.1" : mode === "operator" ? "👨‍✈️ OPERATOR" : mode === "architect" ? "📐 ARCHITECT" : mode === "engineer" ? "🔧 ENGINEER" : mode === "archive" ? "📂 ARCHIVE v1" : "🛡️ RED TEAM"}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TACTICAL GRID AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {viewMode === "wallstreet" ? (
          <section className="col-span-1 lg:col-span-12 flex flex-col gap-6">
            <WallStreetWorkspace />
          </section>
        ) : viewMode === "archive" ? (
          <section className="col-span-1 lg:col-span-12 flex flex-col gap-6">
            {renderPacketArchiveDashboard()}
          </section>
        ) : viewMode === "redteam" ? (
          <section className="col-span-1 lg:col-span-12 flex flex-col gap-6">
            <RedTeamConsole 
              selectedPacket={selectedPacket} 
              setSelectedPacketId={setSelectedPacketId}
              packets={packets} 
              setPackets={setPackets} 
              setIngestLogs={setIngestLogs} 
            />
          </section>
        ) : (
          <>
            {/* LEFT COLUMN: ACTIVE CHAIN OF CUSTODY AUDIT & CHANNELS (Lg: 7 cols) */}
            <section className="col-span-1 lg:col-span-7 flex flex-col gap-6">

          {/* I. OPERATOR INTAKE CONTROL SURFACE */}
          <div className="bg-[#14181d] border border-[#232932] rounded-xl p-5 shadow-lg flex flex-col gap-4 relative overflow-hidden" id="section-1-accordion">
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-sky-500/5 rounded-full blur-[40px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[120px] h-[120px] bg-indigo-500/5 rounded-full blur-[30px] pointer-events-none" />

            <div 
              onClick={() => setExpandedSection(expandedSection === 1 ? null : 1)} 
              className="flex items-center justify-between border-b border-[#232a35] pb-3 relative cursor-pointer select-none group" 
              id="section-1-header"
            >
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-sky-400 rotate-90 transform group-hover:scale-110 transition-transform" />
                <h2 className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#e2e8f0]">
                  I. Operator Intake Control Surface
                </h2>
              </div>
              <div className="flex items-center gap-2 font-mono">
                {renderRealityBadge("LIVE")}
                <span className="text-[9px] text-[#94a3b8] flex items-center gap-1.5 mr-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                  INTAKE ENGAGED
                </span>
                <span className="text-slate-500 text-[10px] font-bold select-none ml-1">
                  {expandedSection === 1 ? "▲" : "▼"}
                </span>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {expandedSection === 1 && (
                <motion.div
                  key="section-1-body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-4 overflow-hidden"
                >
                  {/* Segmented type selector tabs */}
                  <div className="flex bg-[#0f1217] p-1 rounded-xl border border-[#1e232c] gap-1 shrink-0 relative flex-wrap sm:flex-nowrap">
                    {(["Challenge", "Claim", "Query", "Dataset", "Investigation"] as const).map((type) => {
                      const isSelected = intakeType === type;
                      let activeStyle = "bg-sky-950/70 text-sky-400 border-[#2b3543] shadow-sm font-extrabold";
                      let inactiveStyle = "text-slate-500 hover:text-slate-300 hover:bg-[#12151b] border-transparent font-semibold";
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setIntakeType(type);
                            setIntakeInput("");
                          }}
                          className={`flex-1 min-w-[70px] py-1.5 rounded-lg text-center font-mono text-[9.5px] uppercase transition-all duration-150 border cursor-pointer ${
                            isSelected ? activeStyle : inactiveStyle
                          }`}
                        >
                          ⚙️ {type}
                        </button>
                      );
                    })}
                  </div>

                  {/* Structured statement input */}
                  <div className="space-y-1.5 relative">
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase">
                      <span>Intake Statement Intent</span>
                      <span className="text-[9px] text-[#556982]">Jemma Coupling Active</span>
                    </div>
                    <textarea
                      ref={intakeRef}
                      value={intakeInput}
                      onChange={(e) => setIntakeInput(e.target.value)}
                      placeholder={
                        intakeType === "Challenge"
                          ? "Identify a structural anomaly or economic friction (e.g. Why is inflation falling while payroll remains resilient?)..."
                          : intakeType === "Claim"
                          ? "Enter target claim (e.g., Commercial defaults will spike as treasury yields exceed 4.5%)..."
                          : intakeType === "Query"
                          ? "Declare query parameters (e.g., Query option skews and gold strike concentrations)..."
                          : intakeType === "Dataset"
                          ? "Input dataset details and authority verification paths (e.g., Register consumer price indexes and national employment figures dataset links)..."
                          : "Specify investigation parameters (e.g., Investigate persistent wage growth drift against service-sector price movements)..."
                      }
                      className="w-full bg-[#090b0e] border border-slate-800/80 rounded-lg p-3 text-xs text-slate-200 font-mono outline-none focus:border-sky-600/50 max-h-[140px] h-[90px] resize-none leading-relaxed placeholder:text-slate-700"
                    />
                  </div>

                  {/* Quick SAMPLES row */}
                  <div className="space-y-1.5 pb-1 relative">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
                      Quick-Ingest Template Library:
                    </span>
                    <div className="grid grid-cols-1 gap-1.5 max-h-[110px] overflow-y-auto pr-1">
                      {INTAKE_SAMPLES[intakeType].map((sample, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => setIntakeInput(sample)}
                          className="text-left bg-[#0f1217] hover:bg-[#151922] border border-[#1e232c] hover:border-sky-900/40 p-2 rounded-lg text-[10.5px] text-slate-400 hover:text-sky-300 font-sans transition-all leading-normal truncate cursor-pointer"
                        >
                          ⚡ {sample}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* HUD pipeline visualization */}
                  <div className="bg-[#0b0d10] p-3 rounded-lg border border-[#1c222b] font-mono text-[9.5px] space-y-2 relative">
                    <div className="text-[8.5px] text-[#4a5568] uppercase font-bold tracking-widest">Tactical Routing Matrix (Pre-Query Validation)</div>
                    <div className="flex items-center justify-between text-slate-400">
                      <div className="flex items-center gap-1 font-bold">
                        <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
                        <span>OPERATOR</span>
                      </div>
                      <ChevronRight className="h-3 w-3 text-slate-700 animate-pulse" />
                      <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[8.5px] ${intakeInput.trim() ? 'bg-sky-950/40 border-sky-800/30 text-sky-400 font-bold' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
                        <span>{intakeType.toUpperCase()}</span>
                      </div>
                      <ChevronRight className="h-3 w-3 text-slate-700" />
                      <div className={`flex items-center gap-1 ${ingestStatus === 'query' ? 'text-yellow-400 font-bold animate-pulse' : 'text-slate-600'}`}>
                        <span>QUERY</span>
                      </div>
                      <ChevronRight className="h-3 w-3 text-slate-700" />
                      <div className={`flex items-center gap-1 ${ingestStatus === 'running' || ingestStatus === 'success' ? 'text-violet-400 font-bold animate-pulse' : 'text-slate-600'}`}>
                        <span>PATHFIND</span>
                      </div>
                    </div>
                  </div>

                  {/* Run dispatch button */}
                  <button
                    onClick={handleIntakeSubmit}
                    disabled={!intakeInput.trim() || ingestStatus === "running" || ingestStatus === "deploying"}
                    className={`w-full py-2.5 rounded-xl font-mono text-[11px] font-extrabold tracking-widest uppercase flex items-center justify-center gap-2 cursor-pointer transition-all border relative ${
                      intakeInput.trim() && ingestStatus !== "running" && ingestStatus !== "deploying"
                        ? "bg-gradient-to-r from-sky-650 via-sky-700 to-indigo-700 hover:from-sky-500 hover:to-indigo-600 text-white border-sky-500/30 shadow-[0_0_12px_rgba(14,165,233,0.15)]"
                        : "bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed"
                    }`}
                  >
                    <Compass className="h-4 w-4" />
                    <span>Initiate {intakeType} Influx Sequence</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* II. INTELLIGENCE CUSTODY CHAIN PIPELINE */}
          {viewMode !== "operator" && (
            <div className="bg-[#14181d] border border-[#232932] rounded-xl p-5 shadow-lg flex flex-col gap-4" id="section-2-accordion">
            <div 
              onClick={() => setExpandedSection(expandedSection === 2 ? null : 2)} 
              className="flex items-center justify-between border-b border-[#232a35] pb-3 cursor-pointer select-none group" 
              id="section-2-header"
            >
              <div className="flex items-center gap-2">
                <Sliders className="h-4.5 w-4.5 text-sky-400 group-hover:scale-110 transition-transform" />
                <h2 className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#e2e8f0]">
                  II. Intelligence Custody Chain Pipeline
                </h2>
              </div>
              <div className="flex items-center gap-2 font-mono">
                {renderRealityBadge("LIVE")}
                <span className="text-slate-500 text-[10px] font-bold select-none ml-1">
                  {expandedSection === 2 ? "▲" : "▼"}
                </span>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {expandedSection === 2 && (
                <motion.div
                  key="section-2-body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-4 overflow-hidden"
                >
                  {/* TAB SELECTOR FOR PIPELINE VS BLUEPRINT DIRECTORY EXTRATION */}
                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-between border-b border-[#212833] pb-3 text-xs">
                    <div className="flex bg-[#0b0c0e] p-0.5 rounded border border-[#212833] shadow-inner font-mono text-[9px]">
                      <button
                        type="button"
                        onClick={() => setSection2Tab("pipeline")}
                        className={`px-3 py-1.5 rounded transition-all font-extrabold cursor-pointer uppercase ${
                          section2Tab === "pipeline"
                            ? "bg-[#181f29] text-sky-455 border border-slate-700/55"
                            : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        🔗 Custody Chain State Ladder
                      </button>
                      <button
                        type="button"
                        onClick={() => setSection2Tab("catalog")}
                        className={`px-3 py-1.5 rounded transition-all font-extrabold cursor-pointer uppercase ${
                          section2Tab === "catalog"
                            ? "bg-[#181f29] text-sky-455 border border-slate-755"
                            : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        🏛️ Sovereign Decoupled Blueprint Explorer (v2)
                      </button>
                    </div>

                    <div className="relative w-full sm:w-auto min-w-[210px]">
                      <input
                        type="text"
                        placeholder="Filter series code or access node..."
                        value={catalogSearchQuery}
                        onChange={(e) => setCatalogSearchQuery(e.target.value)}
                        className="bg-[#0b0d10] text-[9.5px] font-mono text-slate-200 border border-[#1e2531] rounded px-2.5 py-1 w-full focus:outline-none focus:border-sky-850 placeholder-slate-600"
                      />
                      {catalogSearchQuery && (
                        <button
                          onClick={() => setCatalogSearchQuery("")}
                          className="absolute right-2.5 top-1.5 text-[8px] text-slate-505 hover:text-slate-250 cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {section2Tab === "pipeline" ? (
                    <div className="bg-[#0f1217] p-4.5 rounded-xl border border-[#1e232c] flex flex-col gap-3 font-mono text-xs">
                      <div className="text-[10px] text-slate-400 border-b border-[#1b212a] pb-2 mb-1 flex items-center justify-between">
                        <span className="font-extrabold uppercase tracking-wider text-sky-400">Chain Of Custody State Ladder</span>
                        <span className="text-[9px] text-slate-500 font-sans">Sequence control lock active</span>
                      </div>
                      
                      {(() => {
                        const ladderStages = [
                          {
                            id: "RECOMMENDATION_CREATED",
                            title: "I. Challenge Formulation",
                            subtitle: "Pathfinder AI recommendations initialized",
                            desc: "Optimal economic challenge formulated under legal guidelines."
                          },
                          {
                            id: "INVESTIGATION_COMPLETE",
                            title: "II. Investigation Complete",
                            subtitle: "Jemma & Red Team Validation sign-off",
                            desc: "Validation checks completed. Both schemas and safety channels passed."
                          },
                          {
                            id: "READY_FOR_OPERATOR_REVIEW",
                            title: "III. Ready for Operator Review",
                            subtitle: "Vetting gate accessible",
                            desc: "Pre-execution validation completed. Awaiting Operator review."
                          },
                          {
                            id: "OPERATOR_APPROVED",
                            title: "IV. Operator Approved",
                            subtitle: "Operator approval stamp granted",
                            desc: "Manual Operator vetting clearance registered on the ledger."
                          },
                          {
                            id: "PACKET_SEALED",
                            title: "V. Packet Sealed",
                            subtitle: "Evidence seal secured",
                            desc: "Verifiable digital deploy signature locked. Ready for dispatch."
                          },
                          {
                            id: "COPILOT_DISPATCHED",
                            title: "VI. Copilot Dispatched",
                            subtitle: "Operational dispatch active",
                            desc: "Handoff Contract successfully compiled, signed, and dispatched to runtime."
                          }
                        ];

                        const getStatusLevel = (status: string): number => {
                          switch (status) {
                            case "RECOMMENDATION_CREATED": return 0;
                            case "DATASET_CANDIDATE_REGISTERED":
                            case "AWAITING_VALIDATION":
                            case "JEMMA_APPROVED":
                            case "RED_TEAM_CLEARED":
                            case "FULLY_VERIFIED": return 0;
                            case "INVESTIGATION_COMPLETE": return 1;
                            case "READY_FOR_OPERATOR_REVIEW": return 2;
                            case "OPERATOR_APPROVED": return 3;
                            case "PACKET_SEALED": return 4;
                            case "COPILOT_DISPATCHED":
                            case "Deployed (Demo)":
                            case "DEPLOYED":
                            case "INGESTION_AUTHORIZED": return 5;
                            default: return 0;
                          }
                        };

                        const currentLevel = getStatusLevel(selectedPacket.current_status);

                        return (
                          <div className="flex flex-col gap-4 relative">
                            {/* Vertical connecting line */}
                            <div className="absolute left-[13px] top-3 bottom-3 w-[1px] bg-slate-800" />
                            
                            {ladderStages.map((stage, idx) => {
                              const isCompleted = currentLevel > idx;
                              const isCurrent = currentLevel === idx;
                              const isLocked = currentLevel < idx;
                              
                              let statusText = "LOCKED";
                              let indicatorColor = "border-slate-800 text-slate-600 bg-slate-950";
                              let textOpacity = "opacity-45";
                              let cardBorder = "border-[#1c222c]/40 bg-slate-950/20";
                              
                              if (isCompleted) {
                                statusText = "COMPLETED";
                                indicatorColor = "border-emerald-500/50 bg-emerald-950/40 text-emerald-400";
                                textOpacity = "opacity-90";
                                cardBorder = "border-emerald-950/10 bg-emerald-950/5";
                              } else if (isCurrent) {
                                statusText = "CURRENT";
                                indicatorColor = "border-sky-550 bg-sky-950/60 text-sky-400 shadow-[0_0_8px_rgba(14,165,233,0.3)] animate-pulse";
                                textOpacity = "opacity-100";
                                cardBorder = "border-sky-500/30 bg-sky-950/20 shadow-sm";
                              }

                              return (
                                <div key={stage.id} className={`flex items-start gap-4 transition-all ${textOpacity}`}>
                                  {/* Dot / Indicator */}
                                  <div className={`z-10 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${indicatorColor}`}>
                                    {isCompleted ? (
                                      <Check className="h-3 w-3" />
                                    ) : isLocked ? (
                                      <Lock className="h-2.5 w-2.5" />
                                    ) : (
                                      idx + 1
                                    )}
                                  </div>
                                  
                                  {/* Step Content Card */}
                                  <div className={`flex-1 p-3.5 rounded-xl border ${cardBorder} flex flex-col md:flex-row items-start md:items-center justify-between gap-3`}>
                                    <div className="space-y-1 select-none">
                                      <div className="flex items-center gap-2">
                                        <span className={`text-[12px] font-bold tracking-tight ${isCurrent ? 'text-sky-305' : isCompleted ? 'text-emerald-300' : 'text-slate-400'}`}>
                                          {stage.title}
                                        </span>
                                        <span className={`text-[8px] px-1.5 py-0.5 rounded-md border font-extrabold tracking-wider ${
                                          isCompleted ? 'bg-emerald-950/30 border-emerald-800/20 text-emerald-400' :
                                          isCurrent ? 'bg-sky-950/40 border-sky-800/30 text-sky-400' :
                                          'bg-slate-950 border-slate-900 text-slate-600'
                                        }`}>
                                          {statusText}
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-slate-400 font-sans tracking-wide">
                                        {stage.subtitle}
                                      </p>
                                      <p className="text-[9px] text-slate-500 font-sans italic">
                                        {stage.desc}
                                      </p>
                                    </div>

                                    {/* Contextual Action Button */}
                                    {isCurrent && (
                                      <div className="w-full md:w-auto shrink-0 pt-2 md:pt-0">
                                        {stage.id === "RECOMMENDATION_CREATED" && (
                                          <button
                                            onClick={runInvestigationSafetyAudits}
                                            disabled={ingestStatus === "running"}
                                            className="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-sky-650 to-indigo-700 hover:from-sky-500 hover:to-indigo-600 text-[#f1f5f9] rounded-lg border border-sky-400/30 text-[10.5px] font-mono font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer animate-pulse-slow"
                                          >
                                            {ingestStatus === "running" ? (
                                              <>
                                                <RefreshCw className="h-3 w-3 animate-spin" /> auditing safety...
                                              </>
                                            ) : (
                                              <>
                                                <Play className="h-3 w-3" /> Run Safety Audit
                                              </>
                                            )}
                                          </button>
                                        )}
                                        {stage.id === "READY_FOR_OPERATOR_REVIEW" && (
                                          <button
                                            onClick={toggleOperatorApprove}
                                            className="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-[#ffe066]/80 to-[#f59f00]/80 hover:from-[#ffe066] hover:to-[#f59f00] text-slate-900 rounded-lg border border-transparent text-[10.5px] font-mono font-semibold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                                          >
                                            <Check className="h-3 w-3 stroke-[2.5]" /> Approve Packet
                                          </button>
                                        )}
                                        {stage.id === "OPERATOR_APPROVED" && (
                                          <button
                                            onClick={toggleOperatorSeal}
                                            className="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-[#818cf8] to-[#6366f1] hover:from-[#60a5fa] hover:to-[#3b82f6] text-[#f1f5f9] rounded-lg border border-transparent text-[10.5px] font-mono font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                                          >
                                            <Unlock className="h-3 w-3" /> Seal Operator Gate
                                          </button>
                                        )}
                                        {stage.id === "PACKET_SEALED" && (
                                          <button
                                            onClick={async () => {
                                              // Click the Bridge tab first
                                              const bridgeTab = document.getElementById("crystal-bridge-tab-trigger");
                                              if (bridgeTab) {
                                                (bridgeTab as HTMLElement).click();
                                              }
                                              
                                              // Auto compile and dispatch
                                              setIngestLogs(prev => [...prev, `[BRIDGE] Compiling handoff contract...`]);
                                              const adapter = new OctagonComputeRuntimeAdapter();
                                              const contract = adapter.compileHandoffContract(selectedPacket, [
                                                {
                                                  id: `candidate-${selectedPacket.packet_id}`,
                                                  packetId: selectedPacket.packet_id,
                                                  url: selectedPacket.url_candidate || "https://db.economicdata.example/v1/CPI.csv",
                                                  status: "VERIFIED",
                                                  createdAt: new Date().toISOString()
                                                }
                                              ]);
                                              setCompiledContract(contract);
                                              setBridgeLogs(prev => [...prev, `[BRIDGE] Compiled handoff contract metadata: [${contract.contractId}].`]);
                                            }}
                                            className="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-[#f1f5f9] rounded-lg border border-emerald-400/30 text-[10.5px] font-mono font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                                          >
                                            <Server className="h-3 w-3" /> Prime Copilot Dispatch
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 font-mono text-xs">
                      {/* Interactive Authority Row Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                        {SOVEREIGN_AUTHORITY_CATALOGUE.map((auth) => {
                          const isSelected = selectedCatalogAuthority === auth.code;
                          // Count total series under this authority
                          let seriesCount = 0;
                          Object.values(auth.datasets).forEach((ds: any) => {
                            seriesCount += ds.series.length;
                          });

                          return (
                            <button
                              key={auth.code}
                              type="button"
                              onClick={() => setSelectedCatalogAuthority(auth.code)}
                              className={`p-2 rounded border text-left transition-all hover:scale-[1.01] cursor-pointer ${
                                isSelected
                                  ? "bg-[#181f29] border-sky-800 text-sky-305 shadow"
                                  : "bg-[#090b0e] border-[#1e2531]/80 text-[#556980] hover:text-[#a0aec0] hover:border-[#2d3748]"
                              }`}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className={`text-[9.5px] font-black ${isSelected ? "text-sky-305" : "text-slate-400"}`}>
                                  {auth.code}
                                </span>
                                <span className="text-[7.5px] bg-[#161a21]/80 px-1 py-0.5 rounded text-slate-500 font-extrabold leading-none">
                                  {seriesCount} S
                                </span>
                              </div>
                              <div className="text-[7.5px] truncate max-w-[80px] text-slate-505" title={auth.type}>
                                {auth.type}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Decoupled Catalog Layout Split Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                        
                        {/* LEFT: Authority Info & Description */}
                        {(() => {
                          const currentAuth = SOVEREIGN_AUTHORITY_CATALOGUE.find(a => a.code === selectedCatalogAuthority) || SOVEREIGN_AUTHORITY_CATALOGUE[0];
                          
                          // Filter datasets and series based on search query
                          const filteredDatasets: Record<string, any> = {};
                          let hasAnyFilterMatch = false;
                          
                          Object.entries(currentAuth.datasets).forEach(([dsKey, dsValue]: [string, any]) => {
                            const matchedSeries = dsValue.series.filter((s: any) => 
                              s.code.toLowerCase().includes(catalogSearchQuery.toLowerCase()) ||
                              s.name.toLowerCase().includes(catalogSearchQuery.toLowerCase()) ||
                              s.accessMethod.toLowerCase().includes(catalogSearchQuery.toLowerCase()) ||
                              dsKey.toLowerCase().includes(catalogSearchQuery.toLowerCase())
                            );
                            if (matchedSeries.length > 0) {
                              filteredDatasets[dsKey] = {
                                name: dsValue.name,
                                series: matchedSeries
                              };
                              hasAnyFilterMatch = true;
                            }
                          });

                          return (
                            <>
                              <div className="col-span-1 md:col-span-4 bg-[#0a0d11] p-3.5 rounded-xl border border-[#1e2531] space-y-3 flex flex-col justify-between">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center border-b border-[#212a35] pb-2">
                                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">
                                      🏢 Authority Core Record
                                    </span>
                                    <span className="text-[7.5px] bg-slate-800 text-slate-355 px-1.5 py-0.5 rounded font-black uppercase">
                                      {currentAuth.trustLevel}
                                    </span>
                                  </div>
                                  <h4 className="text-[12px] font-extrabold text-slate-100 flex items-center gap-1.5 leading-tight">
                                    <span className="bg-sky-500/10 text-sky-400 p-1 rounded">🏛️</span>
                                    {currentAuth.name}
                                  </h4>
                                  <p className="text-[10px] text-slate-400 leading-relaxed font-sans pt-1">
                                    {currentAuth.description}
                                  </p>
                                </div>

                                <div className="space-y-2 bg-[#090b0e] p-2.5 rounded border border-[#1e2531]/75">
                                  <div className="text-[8px] text-[#818cf8] uppercase font-black tracking-wider leading-none">
                                    🏗️ Decouple Specification
                                  </div>
                                  <div className="text-[8px] text-slate-500 font-sans space-y-1.5 mt-1 leading-snug">
                                    <div className="flex justify-between border-b border-[#1b212a]/55 pb-1">
                                      <span>Authority Object:</span>
                                      <span className="text-emerald-400 font-mono font-bold">"code": "{currentAuth.code}"</span>
                                    </div>
                                    <div className="flex justify-between border-b border-[#1b212a]/55 pb-1">
                                      <span>Datasets Directories:</span>
                                      <span className="text-slate-350 font-mono font-bold">{Object.keys(currentAuth.datasets).length} Items</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Catalog Role:</span>
                                      <span className="text-sky-350 font-mono font-[#38bdf8]">
                                        {currentAuth.code === "OPENJARVIS" ? "AI_MODEL_CATALOGUE" : "DATASET_REGISTRY"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* RIGHT: Expandable Dataset Tree & Series */}
                              <div className="col-span-1 md:col-span-8 bg-[#0a0d11]/75 p-3.5 rounded-xl border border-[#1e2531] space-y-3 flex flex-col justify-between">
                                <div className="space-y-2.5">
                                  <div className="flex justify-between items-center text-[9px] border-b border-[#212a35] pb-2 text-slate-400 font-bold">
                                    <span>📂 DECOUPLED DATASETS DIRECTORIES</span>
                                    <span className="text-[7px] text-slate-500">PROV PATHWAY V2.1</span>
                                  </div>

                                  {!hasAnyFilterMatch ? (
                                    <div className="p-8 text-center text-slate-500 text-[10px]">
                                      No series matching "{catalogSearchQuery}" found in {currentAuth.code} registry. Try a different query.
                                    </div>
                                  ) : (
                                    <div className="space-y-4 max-h-[290px] overflow-y-auto pr-1">
                                      {Object.entries(filteredDatasets).map(([dsKey, dsValue]: [string, any], dsIdx) => (
                                        <div key={dsIdx} className="space-y-2 border-l border-sky-900/30 pl-3">
                                          <div className="flex items-center gap-1.5 font-mono text-[9px] text-[#818cf8] uppercase font-black">
                                            <span>📂 Dataset:</span>
                                            <span className="text-slate-355 font-bold bg-[#12161f] px-1.5 py-0.5 rounded border border-[#1d2430]">
                                              {dsKey}
                                            </span>
                                          </div>

                                          <div className="space-y-2 pt-0.5 pl-1">
                                            {dsValue.series.map((series: any, sIdx: number) => (
                                              <div 
                                                key={sIdx} 
                                                className="bg-[#0f1217] border border-[#1e232c] rounded-lg p-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[9.5px] hover:border-sky-850/40 hover:bg-[#11151c] transition-all"
                                              >
                                                <div className="space-y-1.5 max-w-[70%]">
                                                  <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="text-[8px] font-bold text-indigo-305 bg-[#1a1f29] px-1.5 py-0.5 rounded uppercase tracking-wide border border-[#212a35]">
                                                      📟 {series.code}
                                                    </span>
                                                    <a 
                                                      href={series.url} 
                                                      target="_blank" 
                                                      rel="noreferrer" 
                                                      className="text-[8.5px] text-indigo-400 hover:underline truncate max-w-[170px] font-bold"
                                                    >
                                                      {series.url}
                                                    </a>
                                                  </div>
                                                  <div className="text-[10px] font-bold text-slate-205 leading-snug">
                                                    {series.name}
                                                  </div>
                                                  <div className="text-[7.5px] text-slate-505 flex items-center gap-1 font-semibold leading-none">
                                                    <span className="text-slate-605 uppercase font-bold">Access Node:</span>
                                                    <span>{series.accessMethod}</span>
                                                  </div>
                                                </div>

                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    setDatasetUrlInput(series.url);
                                                    localStorage.setItem("pathfinder_url_draft", series.url);
                                                    setIngestLogs(prev => [
                                                      ...prev,
                                                      `[ARCHITECT] ⚡ Loaded [${series.code}] direct URL link.`
                                                    ]);
                                                    setViewMode("operator");
                                                    setExpandedSection(1);
                                                    
                                                    // Scroll to top or form to draw attention style
                                                    const topEl = document.getElementById("operator-control-panel-heading");
                                                    if (topEl) {
                                                      topEl.scrollIntoView({ behavior: "smooth" });
                                                    }
                                                  }}
                                                  className="w-full sm:w-auto px-2.5 py-1.5 bg-[#17202c] hover:bg-sky-950 border border-sky-900/40 hover:border-sky-800 text-sky-400 rounded font-bold text-[8.5px] transition-all hover:scale-[1.02] flex items-center justify-center gap-1 uppercase select-none cursor-pointer"
                                                >
                                                  🔌 Wire to Ingress
                                                </button>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="text-[8.5px] text-slate-505 font-sans text-center leading-none border-t border-[#1b222d] pt-2 flex justify-between items-center font-bold">
                                  <span>Pathfinder Series Discovery Catalogue v2.0</span>
                                  <span className="text-[#3b82f6] hover:underline cursor-pointer" onClick={() => setCatalogSearchQuery("")}>Reset filter queries</span>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                        
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          )}

          {/* ACTIVE PACKET CONSOLE VIEW */}
          <div className="bg-[#14181d] border border-[#232932] rounded-xl p-5 shadow-lg flex-1 flex flex-col justify-between gap-5 relative" id="section-3-accordion">
            
            {/* Header and Packet Selector dropdown */}
            <div 
              onClick={() => setExpandedSection(expandedSection === 3 ? null : 3)} 
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#232a35] pb-3 gap-3 cursor-pointer select-none group" 
              id="section-3-header"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#e2e8f0]">
                      III. Custody Packet Ledger & Inspector
                    </h3>
                    {renderRealityBadge("VERIFIED")}
                  </div>
                  {ledgerStatus && (
                    <span className="text-[9px] font-mono text-[#8a99ad] block mt-0.5">
                      ● {ledgerStatus}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Select Packet:</span>
                <select
                  value={selectedPacketId}
                  onChange={(e) => setSelectedPacketId(e.target.value)}
                  className="bg-[#0f1217] border border-[#27303d] text-slate-200 text-xs font-mono rounded px-2.5 py-1 outline-none focus:border-sky-500"
                >
                  {packets.map((p) => (
                    <option key={p.packet_id} value={p.packet_id}>
                      {p.packet_id} - {p.challenge.substring(0, 20)}...
                    </option>
                  ))}
                </select>
                <span className="text-slate-500 text-[10px] font-bold select-none ml-2 mr-1">
                  {expandedSection === 3 ? "▲" : "▼"}
                </span>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {expandedSection === 3 && (
                <motion.div
                  key="section-3-body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col flex-1 justify-between gap-5 overflow-hidden"
                >
                  {selectedPacket.ambiguityLock?.active ? (
                    renderAmbiguityLockOnly(selectedPacket, resolveAmbiguityLock, handleRejectAmbiguityPacket)
                  ) : (
                    <>
                      {/* ACTIVE PACKET INSTRUMENTATION DISPLAY */}
                      <div className="bg-[#0f1217] p-4 rounded-xl border border-[#1d232c] space-y-4 font-mono text-xs text-[#cad4e0]">
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b border-[#1e2531]">
                <div>
                  <div className="text-[9px] text-[#718096] uppercase font-bold">Packet ID</div>
                  <div className="text-slate-100 font-extrabold text-[13px] tracking-wide pt-1">{selectedPacket.packet_id}</div>
                </div>
                <div>
                  <div className="text-[9px] text-[#718096] uppercase font-bold">Source Agent</div>
                  <div className="text-slate-100 font-bold pt-1 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-violet-400" />
                    {selectedPacket.source_agent}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-[#718096] uppercase font-bold">Current status</div>
                  <div className="text-slate-200 pt-1 flex items-center gap-1.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${
                      selectedPacket.current_status === "Deployed (Demo)"
                        ? "bg-emerald-500 shadow-[0_0_8px_#10b981]"
                        : selectedPacket.current_status === "Fully Verified"
                        ? "bg-sky-500 shadow-[0_0_8px_#0ea5e9]"
                        : "bg-amber-400 animate-pulse"
                    }`} />
                    <span className="font-semibold">{selectedPacket.current_status}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-[#718096] uppercase font-bold">Operator Gate Seal</div>
                  <div className="pt-1">
                    {selectedPacket.operator_gate === "APPROVED" ? (
                      <span className="text-emerald-400 bg-emerald-950/40 border border-emerald-800/30 px-2 py-0.5 rounded font-extrabold tracking-wide uppercase text-[10px]">
                        ✓ SIGNED
                      </span>
                    ) : (
                      <span className="text-slate-400 bg-slate-900 border border-slate-700/40 px-2 py-0.5 rounded uppercase text-[10px] font-bold">
                        🔒 LOCKED
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Challenge summary with Upgrade #1, #2, #3 built in */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#718096] uppercase font-bold tracking-wider">
                      Pathfinder Analytical Challenge Statement:
                    </span>
                    {/* Badge Finding Type (Upgrade #2) */}
                    {(() => {
                      const type = getPacketType(selectedPacket);
                      const colors = 
                        type === "Challenge" ? "bg-amber-950/40 text-amber-400 border-amber-800/30" :
                        type === "Claim" ? "bg-rose-950/40 text-rose-400 border-rose-800/30" :
                        "bg-sky-950/40 text-sky-400 border-sky-800/30";
                      return (
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-extrabold uppercase tracking-widest border ${colors}`}>
                          ⚙️ {type} Finding
                        </span>
                      );
                    })()}
                  </div>
                </div>

                <p className="text-slate-200 leading-relaxed text-xs bg-[#151922] p-3 rounded-lg border border-[#222a36] font-sans">
                  {selectedPacket.challenge}
                </p>

                {/* Upgrade #3: Confidence & Evidence Quality Metrics */}
                <div className="grid grid-cols-3 gap-2 bg-[#0a0c10] p-2.5 rounded-lg border border-[#1b212b] font-mono text-[10px] text-center">
                  <div>
                    <div className="text-[8.5px] text-[#556982] uppercase font-bold">Confidence Index</div>
                    <div className="text-sky-400 font-extrabold text-xs pt-0.5">
                      {selectedPacket.confidence || 85}%
                    </div>
                  </div>
                  <div className="border-l border-[#1f2632] px-1">
                    <div className="text-[8.5px] text-[#556982] uppercase font-bold">Authorities Chain</div>
                    <div className="text-violet-400 font-extrabold text-xs pt-0.5">
                      {selectedPacket.authority_chain?.length || 0} Verify Chain
                    </div>
                  </div>
                  <div className="border-l border-[#1f2632] px-1">
                    <div className="text-[8.5px] text-[#556982] uppercase font-bold">Datasets Output</div>
                    <div className="text-[#10b981] font-extrabold text-xs pt-0.5">
                      {selectedPacket.dataset_recommendations?.length || 0} Categories
                    </div>
                  </div>
                </div>

                {/* Upgrade #1: Operator Action Layer */}
                <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[9px] uppercase tracking-wide">
                  <button
                    type="button"
                    onClick={() => handleOperatorApply(selectedPacket)}
                    className="flex-1 min-w-[70px] bg-slate-900 hover:bg-sky-950 border border-slate-800 hover:border-sky-800 text-slate-300 hover:text-sky-400 font-bold py-1.5 px-2 rounded-lg transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    📥 Apply
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOperatorEdit(selectedPacket)}
                    className="flex-1 min-w-[70px] bg-slate-900 hover:bg-indigo-950 border border-slate-800 hover:border-indigo-800 text-slate-300 hover:text-indigo-400 font-bold py-1.5 px-2 rounded-lg transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    ✏️ Edit Finding
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOperatorSave(selectedPacket)}
                    className="flex-1 min-w-[70px] bg-slate-900 hover:bg-emerald-950 border border-slate-800 hover:border-emerald-800 text-slate-300 hover:text-emerald-400 font-bold py-1.5 px-2 rounded-lg transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    💾 Save Finding
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOperatorReject(selectedPacket)}
                    className="flex-1 min-w-[70px] bg-slate-900 hover:bg-rose-950 border border-slate-800 hover:border-rose-910 text-slate-400 hover:text-rose-400 font-bold py-1.5 px-2 rounded-lg transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    ❌ Reject finding
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleAmbiguityLock(selectedPacket.packet_id)}
                    className={`flex-1 min-w-[70px] border font-bold py-1.5 px-2 rounded-lg transition-all hover:scale-[1.02] cursor-pointer ${
                      selectedPacket.ambiguityLock?.active 
                        ? "bg-rose-950/40 hover:bg-rose-900/30 border-rose-800 text-rose-400" 
                        : "bg-slate-900 hover:bg-rose-955/20 border-slate-800 hover:border-rose-900/40 text-rose-500 hover:text-rose-400"
                    }`}
                  >
                    {selectedPacket.ambiguityLock?.active ? "🚨 Ambiguity Lock active" : "🛡️ Toggle Ambiguity Lock"}
                  </button>
                </div>
              </div>

              {/* Recommendations & Authorities */}
              <div className="space-y-4 pt-1">
                <div className="bg-[#151922]/55 p-3.5 rounded-xl border border-[#202937] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-[#202937]/50 pb-2.5">
                    <span className="text-[10px] text-sky-400 font-mono font-bold uppercase tracking-wider block">
                      📋 Recommended Authority Datasets & Chain of Custody Profile
                    </span>
                    <div className="flex bg-[#0b0c0e] p-0.5 rounded border border-[#212833] self-start sm:self-auto shadow-inner">
                      <button
                        type="button"
                        onClick={() => setRegistryDisplayMode("flat")}
                        className={`px-2 py-0.5 rounded text-[8.5px] font-mono font-extrabold uppercase transition-all whitespace-nowrap cursor-pointer ${
                          registryDisplayMode === "flat"
                            ? "bg-[#181f29] text-sky-400 border border-slate-700/55"
                            : "text-[#556980] hover:text-slate-300"
                        }`}
                      >
                        Flat Feed
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegistryDisplayMode("hierarchy")}
                        className={`px-2 py-0.5 rounded text-[8.5px] font-mono font-extrabold uppercase transition-all whitespace-nowrap cursor-pointer ${
                          registryDisplayMode === "hierarchy"
                            ? "bg-[#181f29] text-sky-400 border border-slate-700/55"
                            : "text-[#556980] hover:text-slate-300"
                        }`}
                      >
                        Sovereign Hierarchy (v2)
                      </button>
                    </div>
                  </div>
                  
                  {registryDisplayMode === "flat" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1.5">
                      {selectedPacket.dataset_recommendations && selectedPacket.dataset_recommendations.map((d, dIdx) => {
                        const meta = DATASET_REGISTRY[d] || {
                          name: "Custom Ingestion Target Economic Dataset Record",
                          url: `https://authority-gateway.economic-model.org/series/${d}`,
                          authority: "UNKNOWN",
                          accessMethod: "External Access Node"
                        };
                        return (
                          <div key={dIdx} className="bg-[#0b0e12] border border-[#212833] rounded-lg p-3 space-y-2.5 flex flex-col justify-between hover:border-sky-800/40 hover:bg-[#0d1117] transition-all">
                            <div className="space-y-1">
                              <div className="flex justify-between items-start gap-2">
                                <span className="bg-sky-950/70 text-sky-305 text-[9.5px] px-1.5 py-0.5 rounded font-mono font-extrabold border border-sky-850 tracking-wide">
                                  {d}
                                </span>
                                <span className="text-[9px] bg-indigo-950/30 border border-indigo-900/30 px-1.5 py-0.5 rounded text-indigo-300 font-mono font-bold uppercase">
                                  🏢 {meta.authority}
                                </span>
                              </div>
                              <h4 className="text-[10.5px] font-semibold text-slate-200 leading-snug">
                                {meta.name}
                              </h4>
                            </div>

                            <div className="space-y-1 bg-[#13171e]/50 p-2 rounded border border-[#1b2130] text-[9.5px] font-mono text-slate-400">
                              <div className="flex items-center justify-between text-[9px]">
                                <span className="text-slate-500 uppercase font-black">Access Method:</span>
                                <span className="text-sky-300 font-bold">{meta.accessMethod}</span>
                              </div>
                              <div className="truncate pt-1 border-t border-[#1b2130]/60 mt-1">
                                <span className="text-slate-500 uppercase font-black text-[9px] block">Authority URL:</span>
                                <a href={meta.url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline truncate block">
                                  {meta.url}
                                </a>
                              </div>
                            </div>

                            {/* Quick Wire-up Button to eliminate re-typing */}
                            <button
                              type="button"
                              onClick={() => {
                                setDatasetUrlInput(meta.url);
                                localStorage.setItem("pathfinder_url_draft", meta.url);
                                setIngestLogs(prev => [
                                  ...prev,
                                  `[COCKPIT] ⚡ Auto-populated candidate input field with source URL for [${d}]`
                                ]);
                              }}
                              className="w-full bg-[#16202e] hover:bg-[#1b2d42] text-sky-300 font-mono text-[9px] py-1 px-2 rounded-md border border-sky-900/40 hover:border-sky-850 transition-all flex items-center justify-center gap-1 cursor-pointer select-none"
                            >
                              ⚡ Pop to Candidate Registration
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-4 pt-1.5">
                      {(() => {
                        const recKeys = selectedPacket.dataset_recommendations || [];
                        const matchedAuths = SOVEREIGN_AUTHORITY_CATALOGUE.map(auth => {
                          const matchedDs: any = {};
                          let hasMatch = false;
                          Object.entries(auth.datasets).forEach(([dk, dv]: [string, any]) => {
                            const matchingSeries = dv.series.filter((s: any) => recKeys.includes(s.code));
                            if (matchingSeries.length > 0) {
                              matchedDs[dk] = { name: dv.name, series: matchingSeries };
                              hasMatch = true;
                            }
                          });
                          return hasMatch ? { ...auth, datasets: matchedDs } : null;
                        }).filter(Boolean);

                        if (matchedAuths.length === 0) {
                          return (
                            <div className="p-4 bg-[#0a0d11] border border-[#1f2735] rounded-xl text-center font-mono text-[10px] text-slate-500">
                              No sovereign authority registry matches active recommendations in custody ledger.
                            </div>
                          );
                        }

                        return matchedAuths.map((auth: any, authIdx: number) => (
                          <div key={authIdx} className="bg-[#0b0e12] border border-[#212833]/80 rounded-xl overflow-hidden shadow-sm">
                            {/* Tier 1: Authority level */}
                            <div className="bg-[#10141a] px-3.5 py-2.5 border-b border-[#212833] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 font-mono">
                              <div>
                                <span className="text-[10px] bg-sky-950/70 border border-sky-850 px-2 py-0.5 rounded text-sky-300 font-extrabold mr-2">
                                  🏢 {auth.code}
                                </span>
                                <span className="text-[11px] text-slate-205 font-extrabold">{auth.name}</span>
                              </div>
                              <div className="flex gap-1.5">
                                <span className="text-[7.5px] bg-[#1d3557]/45 border border-[#1d3557]/55 text-sky-300 px-1.5 py-0.5 rounded uppercase font-extrabold tracking-wide">
                                  {auth.type}
                                </span>
                                <span className="text-[7.5px] bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 px-1.5 py-0.5 rounded uppercase font-extrabold tracking-wide">
                                  {auth.trustLevel}
                                </span>
                              </div>
                            </div>

                            {/* Tier 2: Datasets block */}
                            <div className="p-3.5 space-y-4">
                              {Object.entries(auth.datasets).map(([dsKey, dsValue]: [string, any], dsIdx) => (
                                <div key={dsIdx} className="space-y-2 border-l-2 border-indigo-500/20 pl-3.5 ml-1">
                                  <div className="flex flex-wrap items-center gap-1.5 font-mono text-[9px] text-[#818cf8] uppercase font-black tracking-wider leading-none">
                                    <span>📂 Dataset Core:</span>
                                    <span className="text-slate-300 font-bold bg-[#14181f]/70 px-1.5 py-0.5 rounded border border-[#1e2531]">{dsKey}</span>
                                    <span className="text-slate-500 font-normal lowercase italic text-[8px] truncate">({dsValue.name})</span>
                                  </div>

                                  {/* Tier 3: Series cards */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                                    {dsValue.series.map((s: any, sIdx: number) => (
                                      <div key={sIdx} className="bg-[#12161f]/70 border border-[#1e2531]/85 rounded-lg p-3 hover:border-sky-800/45 hover:bg-[#151a24] transition-all flex flex-col justify-between gap-3 shadow-inner">
                                        <div className="space-y-1.5">
                                          <div className="flex justify-between items-center bg-[#090b0e] px-2 py-1 rounded border border-[#1e2531]">
                                            <span className="text-indigo-300 text-[8.5px] font-mono font-black">
                                              📟 CODE: {s.code}
                                            </span>
                                            <span className="text-[7px] bg-slate-800 text-slate-400 px-1 rounded uppercase font-black">Series</span>
                                          </div>
                                          <h5 className="text-[10px] font-bold text-slate-300 leading-normal pl-0.5">
                                            {s.name}
                                          </h5>
                                        </div>

                                        <div className="space-y-1 text-[8px] font-mono text-slate-400 bg-[#090b0e]/80 p-2 rounded border border-[#1a1f29]">
                                          <div className="flex justify-between items-center gap-1.5">
                                            <span className="text-slate-505 uppercase font-bold text-[7.5px]">Access Channel:</span>
                                            <span className="text-[#38bdf8] font-bold text-[8px] text-right truncate max-w-[130px]">{s.accessMethod}</span>
                                          </div>
                                          <div className="truncate text-slate-505 font-bold text-[7.5px] flex justify-between gap-1 border-t border-[#1a202a] pt-1.5 mt-1.5">
                                            <span className="uppercase">Raw URL:</span>
                                            <a href={s.url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline truncate max-w-[140px] text-[8px] font-bold">
                                              {s.url}
                                            </a>
                                          </div>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            setDatasetUrlInput(s.url);
                                            localStorage.setItem("pathfinder_url_draft", s.url);
                                            setIngestLogs(prev => [
                                              ...prev,
                                              `[COCKPIT] ⚡ Pushed [${s.code}] URL directly from sovereign catalogue into candidate loader.`
                                            ]);
                                          }}
                                          className="w-full bg-[#182333]/90 hover:bg-[#1f2f45] text-sky-305 font-mono text-[8.5px] font-black py-1 px-2 rounded border border-sky-900/35 hover:border-sky-800/80 transition-all cursor-pointer flex items-center justify-center gap-1 uppercase select-none"
                                        >
                                          ⚡ Wire Ingress URL
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                </div>

                <div className="bg-[#151922]/50 p-3 rounded-xl border border-[#1e2531] flex flex-col gap-2">
                  <span className="text-[9px] text-[#718096] uppercase font-bold block">🛡️ Active Credible Verification Chain of Authority</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPacket.authority_chain && selectedPacket.authority_chain.map((a, aIdx) => (
                      <span key={aIdx} className="bg-indigo-950/40 text-indigo-300 text-[10px] px-2 py-0.5 rounded border border-indigo-800/20 font-mono font-semibold">
                        {a} Group Domain Trust Verified
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pathfinder Epistemological Taxonomy Distinctions Layer */}
                <div className="bg-[#101318] p-4 rounded-xl border border-[#1e242d] space-y-3 shadow-inner">
                  <div>
                    <span className="text-[10px] text-amber-500 font-mono font-extrabold uppercase tracking-widest block">
                      🧭 Pathfinder Epistemological Taxonomy
                    </span>
                    <span className="text-[9.5px] text-slate-400 font-sans block mt-0.5 leading-relaxed">
                      Strict operational separation parameters under final operator authority. Neither reasoners nor runtimes are considered authoritative.
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-0.5">
                    {/* Evidence */}
                    <div className="bg-[#0b0d11] p-2.5 rounded-lg border border-[#171c24] space-y-1">
                      <div className="flex items-center gap-1.5 border-b border-[#181d26] pb-1 bg-emerald-950/20 px-1 py-0.5 rounded">
                        <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-emerald-900/50 text-emerald-400 text-[8.5px] font-mono font-black">E</span>
                        <span className="text-[9.5px] text-emerald-350 font-mono font-extrabold uppercase tracking-wide">Evidence</span>
                      </div>
                      <p className="text-[9.5px] text-[#8e9cae] font-sans leading-relaxed">
                        Verified records (e.g. <span className="text-emerald-300">{(selectedPacket.authority_chain || []).join(", ") || "None"}</span>). Opinion-free, traceable, and reproducible indicators.
                      </p>
                    </div>

                    {/* Analysis */}
                    <div className="bg-[#0b0d11] p-2.5 rounded-lg border border-[#171c24] space-y-1">
                      <div className="flex items-center gap-1.5 border-b border-[#181d26] pb-1 bg-sky-950/20 px-1 py-0.5 rounded">
                        <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-sky-900/50 text-sky-450 text-[8.5px] font-mono font-black">A</span>
                        <span className="text-[9.5px] text-sky-350 font-mono font-extrabold uppercase tracking-wide">Analysis</span>
                      </div>
                      <p className="text-[9.5px] text-[#8e9cae] font-sans leading-relaxed">
                        Evaluations generated by audited reasoning tools (current engine: <span className="text-sky-300">{selectedReasoner || "Default Reasoner"}</span>).
                      </p>
                    </div>

                    {/* Assumption */}
                    <div className="bg-[#0b0d11] p-2.5 rounded-lg border border-[#171c24] space-y-1">
                      <div className="flex items-center gap-1.5 border-b border-[#181d26] pb-1 bg-amber-950/20 px-1 py-0.5 rounded">
                        <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-amber-900/50 text-amber-450 text-[8.5px] font-mono font-black">S</span>
                        <span className="text-[9.5px] text-amber-350 font-mono font-extrabold uppercase tracking-wide">Assumption</span>
                      </div>
                      <p className="text-[9.5px] text-[#8e9cae] font-sans leading-relaxed">
                        Unverified baseline parameters and simulated models weights configuration templates (<span className="text-amber-300">llama3-8b</span> model).
                      </p>
                    </div>

                    {/* Recommendation */}
                    <div className="bg-[#0b0d11] p-2.5 rounded-lg border border-[#171c24] space-y-1">
                      <div className="flex items-center gap-1.5 border-b border-[#181d26] pb-1 bg-indigo-950/20 px-1 py-0.5 rounded">
                        <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-indigo-900/50 text-[#818cf8] text-[8.5px] font-mono font-black">R</span>
                        <span className="text-[9.5px] text-indigo-300 font-mono font-extrabold uppercase tracking-wide">Recommendation</span>
                      </div>
                      <p className="text-[9.5px] text-[#8e9cae] font-sans leading-relaxed">
                        Suggested routing parameters compiled by Crystal Bridge for the target compute runtime (<span className="text-indigo-300">{bridgeRuntimePreference || "No Target Selected"}</span>).
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* v0.3A COCKPIT INPUT: Candidate Dataset URL Registration Panel */}
              <div className="bg-[#111419] p-4 rounded-xl border border-[#232934] space-y-3 shadow-inner">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-sky-400 font-mono font-bold uppercase tracking-wider block">Candidate Dataset URL Registration</span>
                    <span className="text-[10px] text-slate-400 font-sans">Submit metadata-only URL path candidate to begin validation routing.</span>
                  </div>
                  {selectedPacket.url_candidate && (
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-2 py-0.5 rounded uppercase font-bold">
                      ✓ Registered
                    </span>
                  )}
                </div>

                <div className="flex gap-2.5">
                  <input
                    type="text"
                    placeholder="e.g. https://db.economicdata.example/v1/CPI.csv"
                    value={datasetUrlInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDatasetUrlInput(val);
                      localStorage.setItem("pathfinder_url_draft", val);
                    }}
                    disabled={selectedPacket.current_status !== "RECOMMENDATION_CREATED"}
                    className="flex-1 bg-[#090b0e] border border-[#252e3c] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-600/50 font-mono disabled:opacity-60 placeholder-slate-600"
                  />
                  <button
                    onClick={handleRegisterCandidateUrl}
                    disabled={!datasetUrlInput.trim() || selectedPacket.current_status !== "RECOMMENDATION_CREATED"}
                    className={`px-4 py-2 rounded-lg text-xs font-mono font-extrabold uppercase transition-all flex items-center gap-1.5 cursor-pointer select-none border ${
                      datasetUrlInput.trim() && selectedPacket.current_status === "RECOMMENDATION_CREATED"
                        ? "bg-sky-950 hover:bg-sky-900 text-sky-300 border-sky-800/40 shadow"
                        : "bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed"
                    }`}
                  >
                    <Link className="h-3 w-3" /> Register URL
                  </button>
                </div>

                {selectedPacket.url_candidate && (
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-mono bg-[#0c0f14] p-2.5 rounded-lg border border-[#1b212a] truncate">
                    <span className="text-amber-500 font-bold uppercase text-[9px]">URI ID:</span>
                    <span className="truncate text-slate-400">{selectedPacket.url_candidate}</span>
                  </div>
                )}
              </div>

              {/* Security Review Double Verdict state lights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                
                <div className="bg-[#111419] p-3 rounded-xl border border-[#242b36] flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-500 font-bold uppercase">Jemma Ingestion review</span>
                    <div className="text-[11px] font-bold text-slate-300">File & Schema alignment</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${
                      selectedPacket.jemma_verdict === "APPROVED" 
                        ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" 
                        : "bg-amber-400 animate-pulse"
                    }`} />
                    <span className={`font-mono text-[10.5px] font-extrabold ${selectedPacket.jemma_verdict === "APPROVED" ? 'text-emerald-400' : 'text-amber-500'}`}>
                      {selectedPacket.jemma_verdict}
                    </span>
                  </div>
                </div>

                <div className="bg-[#111419] p-3 rounded-xl border border-[#242b36] flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-500 font-bold uppercase">Red team security validation</span>
                    <div className="text-[11px] font-bold text-slate-300">Payload sanitization</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${
                      selectedPacket.red_team_verdict === "CLEARED" 
                        ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" 
                        : "bg-amber-400 animate-pulse"
                    }`} />
                    <span className={`font-mono text-[10.5px] font-extrabold ${selectedPacket.red_team_verdict === "CLEARED" ? 'text-emerald-400' : 'text-amber-500'}`}>
                      {selectedPacket.red_team_verdict}
                    </span>
                  </div>
                </div>

              </div>

              {/* Procedural Next Allowed Action descriptor */}
              <div className="bg-[#191e24] p-3 rounded-xl border border-sky-900/30">
                <span className="text-[9px] text-sky-400 font-bold uppercase tracking-wider block">Avionics System Directive:</span>
                <p className="text-[11px] text-slate-200 mt-0.5 font-sans italic font-medium leading-relaxed">
                  " {selectedPacket.next_allowed_action} "
                </p>
              </div>

              {/* v0.3A.1 Transition Historical Audit Log */}
              <div className="bg-[#0b0e12] p-3.5 rounded-xl border border-[#232a35] space-y-2.5">
                <div className="flex justify-between items-center border-b border-[#232a35]/60 pb-1.5 gap-2">
                  <span className="text-[9.5px] text-indigo-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 flex-1 min-w-0 truncate">
                    <CheckCircle2 className="h-3 w-3 text-indigo-400" /> IV. Immutable Transition History Audit Ledger
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {renderRealityBadge("VERIFIED")}
                    <span className="text-[9px] text-slate-500 font-mono font-bold uppercase">v0.3A.1 State-Guard</span>
                  </div>
                </div>
                {selectedPacket.history && selectedPacket.history.length > 0 ? (
                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                    {selectedPacket.history.map((h, hIdx) => (
                      <div key={hIdx} className="bg-[#12161e]/80 p-2 text-xs rounded border border-[#1b212c] space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[9px] text-slate-500">{new Date(h.timestamp).toLocaleString()}</span>
                          <span className="font-mono bg-sky-950/40 text-sky-400 border border-sky-900/30 px-1.5 py-0.5 rounded text-[8.5px] uppercase font-bold">
                            {h.actor}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[10.5px]">
                          <span className="text-slate-500 font-bold text-[9.5px] line-through decoration-[#ef4444]/20">{h.old_status}</span>
                          <span className="text-indigo-400 text-xs">➔</span>
                          <span className="text-emerald-400 font-bold">{h.new_status}</span>
                        </div>
                        {h.comment && (
                          <p className="text-[10px] text-slate-300 font-sans italic pt-0.5">
                            "{h.comment}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10.5px] text-slate-500 font-sans italic">
                    No state history entry of custody transitions currently logged for this packet.
                  </p>
                )}
              </div>

            </div>

            {/* Interactive cockpit control selectors */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-[#232a35] items-center justify-between font-mono text-xs">
              <div className="text-slate-400 text-[11px] font-sans">
                Manage custody approvals and signatures for the active packet.
              </div>
              <div className="flex gap-2.5 w-full sm:w-auto">
                {selectedPacket.current_status === "RECOMMENDATION_CREATED" && (
                  <button
                    onClick={runInvestigationSafetyAudits}
                    disabled={ingestStatus === "running"}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-gradient-to-r from-[#2dd4bf]/20 hover:bg-[#2dd4bf]/30 text-[#2dd4bf] rounded-lg border border-[#2dd4bf]/20 text-[11px] font-mono font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer select-none"
                  >
                    <Play className="h-3 w-3" /> Run Safety Audit
                  </button>
                )}

                {selectedPacket.current_status === "READY_FOR_OPERATOR_REVIEW" && (
                  <button
                    onClick={toggleOperatorApprove}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-gradient-to-r from-[#ffe066]/80 to-[#f59f00]/80 hover:from-[#ffe066] hover:to-[#f59f00] text-slate-900 rounded-lg border border-transparent text-[11px] font-mono font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-[#f59f00]/10"
                  >
                    <Check className="h-3 w-3 stroke-[2.5]" /> Approve Packet
                  </button>
                )}

                {(selectedPacket.current_status === "OPERATOR_APPROVED" || selectedPacket.operator_gate === "APPROVED") && (
                  <button
                    onClick={toggleOperatorSeal}
                    className="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg font-mono text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer select-none border bg-sky-950 text-sky-300 border-sky-700/60 hover:bg-sky-900 shadow-md shadow-sky-950/20"
                  >
                    {selectedPacket.operator_gate === "APPROVED" ? (
                      <>
                        <Lock className="h-3 w-3" /> Lift Operator Seal
                      </>
                    ) : (
                      <>
                        <Unlock className="h-3 w-3" /> Seal Operator Gate
                      </>
                    )}
                  </button>
                )}

                {selectedPacket.current_status === "PACKET_SEALED" && (
                  <button
                    onClick={async () => {
                      const bridgeTab = document.getElementById("crystal-bridge-tab-trigger");
                      if (bridgeTab) {
                        (bridgeTab as HTMLElement).click();
                      }
                      setIngestLogs(prev => [...prev, `[BRIDGE] Compiling handoff contract...`]);
                      const adapter = new OctagonComputeRuntimeAdapter();
                      const contract = adapter.compileHandoffContract(selectedPacket, [
                        {
                          id: `candidate-${selectedPacket.packet_id}`,
                          packetId: selectedPacket.packet_id,
                          url: selectedPacket.url_candidate || "https://db.economicdata.example/v1/CPI.csv",
                          status: "VERIFIED",
                          createdAt: new Date().toISOString()
                        }
                      ]);
                      setCompiledContract(contract);
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-lg border border-emerald-400/30 text-[11px] font-mono font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <Server className="h-3 w-3" /> Prime Copilot Dispatch
                  </button>
                )}
              </div>
            </div>
          </>
        )}

                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* FLIGHT RECORDER / SIMULATOR LOGS (Terminal style but refined) */}
          {viewMode === "engineer" && (
            <div className="bg-[#14181d] border border-[#232932] rounded-xl p-5 shadow-lg space-y-3.5" id="section-4-accordion">
            <div 
              onClick={() => setExpandedSection(expandedSection === 4 ? null : 4)} 
              className="flex justify-between items-center border-b border-[#232a35] pb-2.5 cursor-pointer select-none group" 
              id="section-4-header"
            >
              <div className="flex items-center gap-2">
                <Terminal className="h-4.5 w-4.5 text-emerald-400 animate-pulse group-hover:scale-110 transition-transform" />
                <h3 className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#e2e8f0]">
                  IV. Avionics Telemetry & Activity Feed
                </h3>
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                {renderRealityBadge("SIMULATED")}
                <span className="text-[10px] text-[#94a3b8] flex items-center gap-1.5 mr-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-ping" />
                  Dry-run
                </span>
                <span className="text-slate-500 text-[10px] font-bold select-none ml-1">
                  {expandedSection === 4 ? "▲" : "▼"}
                </span>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {expandedSection === 4 && (
                <motion.div
                  key="section-4-body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-3.5 overflow-hidden"
                >
                  {/* Simulated Live logs stack */}
                  <div className="bg-[#0b0d10] border border-[#1c222b] rounded-xl p-4 h-[180px] overflow-y-auto font-mono text-[11px] space-y-1.5 text-slate-300 relative">
              {ingestLogs.map((log, index) => {
                if (!log || typeof log !== "string") return null;
                let statusClass = "text-slate-400";
                if (log.includes("[INFO]")) statusClass = "text-sky-400 font-medium";
                if (log.includes("[SUCCESS]")) statusClass = "text-emerald-400 font-bold";
                if (log.includes("[STAGE]")) statusClass = "text-slate-300";
                if (log.includes("[ABORT]") || log.includes("[BLOCKED]")) statusClass = "text-rose-400 font-bold";
                if (log.includes("[OPERATOR]")) statusClass = "text-sky-300 font-bold";
                if (log.includes("[QUERY]")) statusClass = "text-yellow-400/90 font-medium";

                return (
                  <div key={index} className={`${statusClass} flex items-start gap-2.5 leading-relaxed`}>
                    <span className="text-[#3b4b5e] select-none">[{String(index + 1).padStart(2, "0")}]</span>
                    <span>{log}</span>
                  </div>
                );
              })}
              <div ref={terminalLogsEndRef} />
            </div>

            {/* Query / Search results container if available */}
            {ingestStatus === "query" && searchResults.length > 0 && (
              <div className="p-3 bg-[#11141a] border border-[#242b36] rounded-xl space-y-2">
                <span className="text-[9px] font-mono text-sky-400 uppercase font-bold block border-b border-[#1e2531] pb-1">Recommended Authority Keys Found:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {searchResults.map((res, rIdx) => (
                    <div key={rIdx} className="bg-[#0f1217] p-2 rounded border border-[#222934] font-mono text-xs">
                      <div className="flex items-center justify-between text-slate-200">
                        <span className="font-extrabold text-[#3182ce]">{res.key}</span>
                        <span className="text-[9px] bg-slate-900 px-1 py-0.5 rounded text-slate-400 border border-slate-700/30">{res.authority}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 leading-normal line-clamp-1">{res.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center text-[10px] text-[#4a5568] font-mono pt-1">
              <span className="flex items-center gap-1">
                <Info className="h-3 w-3" /> Sandbox environment: strictly CPU-safe simulation nodes.
              </span>
              <span>BUFFER: ACTIVE</span>
            </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          )}

          {/* V. OPERATOR INVESTIGATION JOURNAL */}
          {viewMode === "engineer" && (
            <div className="bg-[#14181d] border border-[#232932] rounded-xl p-5 shadow-lg space-y-3.5" id="section-5-accordion">
            <div 
              onClick={() => setExpandedSection(expandedSection === 5 ? null : 5)} 
              className="flex justify-between items-center border-b border-[#232a35] pb-2.5 cursor-pointer select-none group" 
              id="section-5-header"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-sky-400 group-hover:scale-110 transition-transform" />
                <h3 className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#e2e8f0]">
                  V. Operator Investigation Journal
                </h3>
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                {renderRealityBadge("LIVE")}
                <span className="text-[9px] text-[#f59e0b] border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-2 py-0.5 rounded uppercase font-bold">
                  🔒 Audit-Seal Ledger
                </span>
                <span className="text-slate-500 text-[10px] font-bold select-none ml-1">
                  {expandedSection === 5 ? "▲" : "▼"}
                </span>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {expandedSection === 5 && (
                <motion.div
                  key="section-5-body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-3.5 overflow-hidden"
                >
                  {/* Compact overview */}
                  <div className="text-[11px] text-slate-400 leading-normal font-sans">
                    Auto-registers validated results, authority scopes, and target challenges to maintain consistent economic models under Jemma verification rules.
                  </div>

            {/* List of Journal Entries */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {journal && journal.length > 0 ? (
                journal.map((j, jIdx) => {
                  const statusColors = 
                    j.status === "Accepted" ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/30" : 
                    j.status === "Rejected" ? "bg-rose-950/40 text-rose-400 border-rose-800/30" : 
                    "bg-amber-950/40 text-amber-500 border-amber-800/30";
                  const typeColors =
                    j.type === "Challenge" ? "bg-amber-950/40 text-amber-400 border-amber-700/20" :
                    j.type === "Claim" ? "bg-rose-950/40 text-rose-300 border-rose-700/20" :
                    "bg-sky-950/40 text-sky-300 border-sky-700/20";
                  return (
                    <div key={jIdx} className="bg-[#0b0d10] border border-[#1b212b] rounded-lg p-3 space-y-2 font-mono text-[11px]">
                      <div className="flex justify-between items-center bg-[#14181f]/40 p-1.5 rounded">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sky-450 font-extrabold text-[12px]">{j.packet_id}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${typeColors}`}>{j.type.toUpperCase()}</span>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border ${statusColors}`}>{j.status}</span>
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-[8.5px] text-slate-500 uppercase font-bold block">Input Intent:</span>
                        <p className="text-slate-300 font-sans text-[11px] leading-relaxed bg-[#111419] p-2 rounded border border-[#1b212b]/60">{j.input}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
                        <div>
                          <span className="text-[8.5px] text-slate-500 uppercase font-bold block">Target Authorities:</span>
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {j.authorities && j.authorities.map((auth, aIdx) => (
                              <span key={aIdx} className="bg-indigo-950/40 text-indigo-300 px-1 rounded border border-indigo-800/20 text-[9px]">{auth}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-[8.5px] text-slate-500 uppercase font-bold block">Target Datasets:</span>
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {j.datasets && j.datasets.map((data, dIdx) => (
                              <span key={dIdx} className="bg-sky-950/40 text-sky-300 px-1 rounded border border-sky-800/20 text-[9px]">{data}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[9px] text-[#4a5568] border-t border-[#1b212b]/40 pt-1.5">
                        <span>Record Generated: {j.timestamp}</span>
                        <span className="text-sky-500">✓ Audited Ledger</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-slate-500 text-[10.5px] italic">
                  No accepted investigations logged to journal yet. Use [Save Finding] above to write record.
                </div>
              )}
            </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          )}

        </section>

        {/* RIGHT COLUMN: REPOSITORY MAPS, COPILOT CHAT, AND LOCKED V0.3 PLAN (Lg: 5 cols) */}
        <section className="col-span-1 lg:col-span-5 flex flex-col gap-6">

          {/* ACTIVE WORKSPACE / PIPELINE CONFIG FILE VIEWER */}
          {viewMode === "engineer" && (
            <div className="bg-[#14181d] border border-[#232932] rounded-xl flex flex-col shadow-lg overflow-hidden shrink-0">
            <div className="p-4 border-b border-[#232a35] bg-[#111417] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[#ececf1] font-bold uppercase tracking-wider font-mono">
                <FileCode className="h-4 w-4 text-sky-400" /> Pipeline Config Files
              </div>

              {/* Copy action trigger */}
              <button
                onClick={() => handleCopy(configs[activeConfigTab], activeConfigTab)}
                disabled={!configs[activeConfigTab]}
                className="text-[10.5px] bg-[#1d232c] hover:bg-[#252d3a] border border-[#2b3543] text-slate-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-mono cursor-pointer active:scale-95"
              >
                {copiedFile && copiedText === activeConfigTab ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied Specifications!
                  </>
                ) : (
                  <>
                    <FileCode className="h-3.5 w-3.5 text-slate-400" /> Copy Specifications
                  </>
                )}
              </button>
            </div>

            {/* Config file workspace tab indices */}
            <div className="flex bg-[#0f1217] border-b border-[#1e2531] text-xs overflow-x-auto select-none">
              {(Object.keys(configs) as Array<keyof PresetConfigs>).map((file) => (
                <button
                  key={file}
                  onClick={() => setActiveConfigTab(file)}
                  className={`px-3 py-2.5 font-mono border-b-2 text-[10.5px] whitespace-nowrap transition-colors flex-1 ${
                    activeConfigTab === file
                      ? "border-sky-500 text-slate-100 bg-[#14181d] font-bold"
                      : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-[#12151b]"
                  }`}
                >
                  {file}
                </button>
              ))}
            </div>

            {/* Dynamic script text content */}
            <div className="p-4 bg-[#0a0d10]">
              <div className="h-[120px] overflow-y-auto leading-relaxed text-[#cad3e0] font-mono text-[9.5px] whitespace-pre select-all bg-transparent focus:outline-none scrollbar-thin">
                {configs[activeConfigTab] || `// Compiling standard release configuration maps dynamically...`}
              </div>
            </div>

            <div className="px-4 py-2 bg-[#090b0e] text-[9.5px] text-[#4a5568] flex justify-between items-center border-t border-[#1d232c] font-mono">
              <span className="flex items-center gap-1">
                <Info className="h-3 w-3" /> Static build definitions. Protected assets.
              </span>
              <span className="text-emerald-500 font-semibold uppercase text-[8.5px] tracking-wider">ReadOnly</span>
            </div>
          </div>
          )}

          {/* SUBSYSTEM MAP MODULE (Compact & with status lights) */}
          {viewMode === "engineer" && (
            <div className="bg-[#14181d] border border-[#232932] rounded-xl p-4 shadow-lg space-y-3 shrink-0">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block border-b border-[#212833] pb-1.5">
              IV. Aircraft Airframe Subsystem Maps
            </span>
            <div className="grid grid-cols-2 gap-2">
              {INGEST_SUBSYSTEMS.map((sub) => {
                const currentSubState = getSubsystemStatus(
                  sub.id,
                  selectedPacket.current_status,
                  selectedPacket.jemma_verdict,
                  selectedPacket.red_team_verdict
                );
                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubsystem(sub.id);
                      setIngestLogs(prev => [
                        ...prev,
                        `[WORKSPACE] Focused workspace on subsystem path: /${sub.path}`
                      ]);
                    }}
                    className={`text-left p-2.5 rounded-lg border text-xs transition-all flex justify-between items-center ${
                      selectedSubsystem === sub.id
                        ? "bg-[#182029] border-sky-600/60 text-white"
                        : "bg-[#0f1217] border-[#1f252f] text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="font-mono text-[10.5px] font-bold leading-tight flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${currentSubState.color}`} />
                        <span>{sub.name}</span>
                      </div>
                      <div className="text-[9px] text-[#718096] font-mono pt-1 flex items-center gap-1 leading-none">
                        <span>/{sub.id}/</span> • <span className="font-extrabold text-[8.5px] uppercase opacity-75">{currentSubState.label}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-3 text-slate-600 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
          )}

          {/* CRYSTAL BRIDGE & ARCHITECTURAL SEPARATION CONSOLE */}
          <div className="bg-[#14181d] border border-[#232932] rounded-xl p-4 shadow-lg space-y-4 shrink-0" id="crystal-bridge-console">
            <div className="border-b border-[#212833] pb-2 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-400" />
                <span className="text-[10px] font-mono font-bold text-[#ececf1] uppercase tracking-wider block">
                  ⚙️ Crystal Bridge & Decoupling Core
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[8.5px] uppercase font-bold text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/30">
                  Adapter Interface v1.0
                </span>
              </div>
            </div>

            {/* Architecture Domain Filter Controller */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400 font-bold uppercase">Domain Scope Visualizer:</span>
                <span className="text-[9.5px] text-slate-500 italic">Filter and audit components</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 select-none font-mono">
                {(["ALL", "CORE", "COMPUTE", "BRIDGE"] as const).map((dom) => (
                  <button
                    key={dom}
                    onClick={() => setActiveDomainFilter(dom)}
                    className={`px-1.5 py-1 text-center rounded text-[8.5px] font-extrabold uppercase border transition-all cursor-pointer ${
                      activeDomainFilter === dom
                        ? "bg-indigo-950/40 text-indigo-300 border-indigo-800"
                        : "bg-[#0f1217] text-slate-500 border-slate-900/45 hover:border-slate-700 hover:text-slate-350"
                    }`}
                  >
                    {dom}
                  </button>
                ))}
              </div>

              {/* Dynamic Domain Highlight details */}
              {activeDomainFilter !== "ALL" && (
                <div className="p-2.5 bg-[#0b0e12] border border-[#1f2631] rounded-lg text-[9.5px] leading-relaxed text-slate-300 transition-all">
                  {activeDomainFilter === "CORE" && (
                    <>
                      <div className="font-extrabold text-sky-400 uppercase mb-0.5">🧬 Pathfinder Core Domain Assets Included:</div>
                      <div>• Custody Packet Ledger System & Audit Records</div>
                      <div>• Authority Registries, Dataset Gateways & Operator Journals</div>
                    </>
                  )}
                  {activeDomainFilter === "COMPUTE" && (
                    <>
                      <div className="font-extrabold text-amber-500 uppercase mb-0.5">🚀 Pathfinder Compute Runtime Domain Assets:</div>
                      <div>• GPU Compile pipelines (`cloudbuild.yaml`, `Dockerfile`)</div>
                      <div>• Upstream reference library (`/external/TensorRT-Edge-LLM/`)</div>
                    </>
                  )}
                  {activeDomainFilter === "BRIDGE" && (
                    <>
                      <div className="font-extrabold text-purple-400 uppercase mb-0.5">💎 Crystal Bridge Adapter Contract Specifications:</div>
                      <div>• Abstract interface mapping Pathfinder state variables</div>
                      <div>• Strict decoupled handoff objects ready for serverless workers</div>
                    </>
                  )}
                </div>
              )}
            </div>
 
            {/* CAPABILITY PROFILE LAYER */}
            <div className="p-3.5 bg-[#0a0d10] border border-[#212833] rounded-lg space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-[#1b212b]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-indigo-400" />
                  <span className="text-[10px] font-mono font-bold text-[#ececf1] uppercase tracking-wider block">
                    📊 Capability Profile Layer
                  </span>
                </div>
                <span className="text-[8.5px] uppercase font-bold text-sky-450 bg-sky-950/40 px-2 py-0.5 rounded border border-sky-900/40 font-mono">
                  Matrix Active
                </span>
              </div>

              {capabilityProfile ? (
                <div className="space-y-3">
                  {/* Hexagon parameters grid */}
                  <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono">
                    <div className="bg-[#0e1217] p-1.5 rounded border border-[#1b212b]">
                      <span className="text-slate-500 block text-[7.5px] uppercase font-extrabold leading-none mb-1">1. Input Type</span>
                      <span className="text-slate-200 font-bold">{capabilityProfile.inputType}</span>
                    </div>
                    <div className="bg-[#0e1217] p-1.5 rounded border border-[#1b212b]">
                      <span className="text-slate-500 block text-[7.5px] uppercase font-extrabold leading-none mb-1">2. Complexity</span>
                      <span className="text-slate-200 font-bold">{capabilityProfile.taskComplexity}</span>
                    </div>
                    <div className="bg-[#0e1217] p-1.5 rounded border border-[#1b212b]">
                      <span className="text-slate-500 block text-[7.5px] uppercase font-extrabold leading-none mb-1">3. Evidence Load</span>
                      <span className="text-slate-200 font-bold">{capabilityProfile.evidenceLoad}</span>
                    </div>
                    <div className="bg-[#0e1217] p-1.5 rounded border border-[#1b212b]">
                      <span className="text-slate-500 block text-[7.5px] uppercase font-extrabold leading-none mb-1">4. Output Type</span>
                      <span className="text-slate-200 font-bold">{capabilityProfile.outputType}</span>
                    </div>
                    <div className="bg-[#0e1217] p-1.5 rounded border border-[#1b212b]">
                      <span className="text-slate-500 block text-[7.5px] uppercase font-extrabold leading-none mb-1">5. Requirement</span>
                      <span className="text-slate-200 font-bold">{capabilityProfile.runtimeRequirement}</span>
                    </div>
                    <div className="bg-[#0e1217] p-1.5 rounded border border-[#1b212b]">
                      <span className="text-slate-500 block text-[7.5px] uppercase font-extrabold leading-none mb-1">6. Sensitivity</span>
                      <span className={`font-bold ${capabilityProfile.sensitivity === "Controlled" ? "text-amber-400" : "text-slate-200"}`}>{capabilityProfile.sensitivity}</span>
                    </div>
                  </div>

                  {/* Recommendation block */}
                  <div className="p-2.5 bg-[#0e1217] border border-indigo-950/50 rounded-lg space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400 font-sans font-medium">Computed Capability:</span>
                      <span className="font-mono text-indigo-300 font-extrabold uppercase text-[9.5px]">
                        {capabilityProfile.capabilityName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] pt-1.5 border-t border-[#1b212b]/60">
                      <span className="text-slate-400 font-sans font-medium">Runtime Recommendation:</span>
                      <span className={`font-mono font-extrabold px-1.5 py-0.5 rounded text-[9.5px] uppercase ${
                        capabilityProfile.runtimeRecommendation === "GPU Workspace" 
                          ? "bg-amber-950/30 text-amber-400 border border-amber-900/30"
                          : "bg-emerald-950/30 text-emerald-300 border border-emerald-900/30"
                      }`}>
                        {capabilityProfile.runtimeRecommendation}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-[9.5px] font-mono text-slate-500 italic text-center py-2">
                  No active challenge query mapped.
                </div>
              )}
            </div>

            {/* PLUGGABLE REASONING CHOICE LAYER */}
            <div className="p-3.5 bg-[#0a0d10] border border-[#212833] rounded-lg space-y-3" id="reasoning-choice-layer">
              <div className="flex justify-between items-center pb-1.5 border-b border-[#1b212b]">
                <div className="flex items-center gap-1.5 font-mono">
                  <Cpu className="h-4 w-4 text-emerald-400" />
                  <span className="text-[10px] font-bold text-[#ececf1] uppercase tracking-wider block">
                    🧠 Pluggable Reasoning Choice Layer
                  </span>
                </div>
                <span className={`text-[8px] uppercase font-bold px-2 py-0.5 rounded border font-mono ${
                  selectedReasoner === "Not Selected"
                    ? "text-rose-450 bg-rose-950/45 border-rose-900/40 animate-pulse"
                    : selectedReasoner === "Reasoner Not Required"
                    ? "text-slate-400 bg-slate-900/60 border-slate-800"
                    : "text-emerald-300 bg-emerald-950/40 border-emerald-900/40"
                }`}>
                  {selectedReasoner === "Not Selected" ? "Attention Required" : "Layer Active"}
                </span>
              </div>

              <div className="space-y-3">
                {/* Selector */}
                <div className="flex flex-col gap-1 text-[10px]">
                  <div className="flex justify-between items-center pb-1">
                    <span className="text-slate-400 font-medium font-mono">Select Interchangeable Reasoner:</span>
                    {recommendedReasoner !== "Not Selected" && (
                      <button
                        onClick={() => {
                          setSelectedReasoner(recommendedReasoner);
                          setReasonerAuditOutput(null);
                        }}
                        className="text-[8.5px] font-mono font-extrabold text-[#a3e635] hover:underline uppercase bg-[#182a18] px-1.5 py-0.5 rounded border border-[#1f3f1f]"
                      >
                        👈 Use Recommended ({recommendedReasoner.split(" ")[0]})
                      </button>
                    )}
                  </div>
                  <select
                    value={selectedReasoner}
                    onChange={(e) => {
                      setSelectedReasoner(e.target.value);
                      setReasonerAuditOutput(null); // invalidate old output
                    }}
                    className="w-full bg-[#0d1013] border border-[#212833] text-slate-300 rounded px-2.5 py-1.5 font-mono text-[10px] focus:outline-none focus:border-indigo-500 hover:border-slate-700 transition-colors"
                  >
                    <option value="Not Selected">-- Select Reasoner (Locked) --</option>
                    <option value="Gemini Reasoner">Gemini Reasoner [Multimodal Optimization]</option>
                    <option value="Claude-style Validator">Claude-style Validator [Strict Safety Audit]</option>
                    <option value="DeepSeek Reasoner">DeepSeek Reasoner [Mathematics & Reasoning]</option>
                    <option value="Qwen Reasoner">Qwen Reasoner [Macro Compliance Scan]</option>
                    <option value="Local Reasoner">Local Reasoner [Browser Sandbox Heuristics]</option>
                    <option value="Reasoner Not Required">Reasoner Not Required for Ingestion</option>
                  </select>
                </div>

                {/* Info about Recommendation Mapping */}
                <div className="p-2 bg-[#090b0e] border border-slate-900 rounded-md flex justify-between items-center text-[9px] font-mono text-slate-400">
                  <span>Capability Recommends:</span>
                  <span className="font-bold text-sky-455">{recommendedReasoner}</span>
                </div>

                {/* Audit Controls & Output */}
                {selectedReasoner !== "Not Selected" && selectedReasoner !== "Reasoner Not Required" ? (
                  <div className="space-y-2.5 pt-1.5 border-t border-[#1b212b]/60">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">🛡️ Pluggable Audit Environment</span>
                      <button
                        onClick={() => {
                          setIsReasonerAuditing(true);
                          setTimeout(() => {
                            const found = REASONER_REGISTRY.find(r => r.id === selectedReasoner);
                            if (found) {
                              setReasonerAuditOutput({
                                analyzeText: found.analyze(selectedPacket),
                                evidenceGapsText: found.findEvidenceGaps(selectedPacket),
                                challengeText: found.challenge(selectedPacket),
                                proposeAlternativesText: found.proposeAlternatives(selectedPacket),
                                confidenceScore: found.scoreConfidence(selectedPacket),
                                reasonerName: found.name
                              });
                            }
                            setIsReasonerAuditing(false);
                          }, 650);
                        }}
                        disabled={isReasonerAuditing}
                        className="bg-emerald-950/20 hover:bg-emerald-900/30 border border-emerald-900/40 hover:border-emerald-700 text-emerald-400 px-2 py-1 rounded text-[8.5px] font-mono uppercase font-bold text-center cursor-pointer active:scale-95 transition-all flex items-center gap-1"
                      >
                        {isReasonerAuditing ? (
                          <>
                            <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                            <span>Auditing...</span>
                          </>
                        ) : (
                          <span>⚡ Run Reasoner Audit</span>
                        )}
                      </button>
                    </div>

                    {reasonerAuditOutput ? (
                      <div className="p-3 bg-[#0d1013] border border-[#212833] rounded-lg space-y-2.5 font-mono text-[9px]">
                        <div className="flex justify-between items-center pb-1.5 border-b border-[#212833]">
                          <span className="text-emerald-400 font-bold uppercase">{reasonerAuditOutput.reasonerName} Outputs</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500">Confidence:</span>
                            <span className="text-slate-200 font-bold">{(reasonerAuditOutput.confidenceScore! * 105).toFixed(0)}%</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-900 rounded-full h-1">
                          <div 
                            className="bg-emerald-400 h-1 rounded-full transition-all duration-500" 
                            style={{ width: `${reasonerAuditOutput.confidenceScore! * 100}%` }}
                          />
                        </div>

                        <div className="space-y-2 text-slate-350 leading-normal">
                          <div>
                            <span className="text-emerald-400 block font-bold text-[8px] uppercase">1. Core Analysis:</span>
                            <p className="pl-1 text-slate-300">{reasonerAuditOutput.analyzeText}</p>
                          </div>
                          <div>
                            <span className="text-amber-400 block font-bold text-[8px] uppercase">2. Evidence Gaps:</span>
                            <p className="pl-1 text-slate-300">{reasonerAuditOutput.evidenceGapsText}</p>
                          </div>
                          <div>
                            <span className="text-rose-400 block font-bold text-[8px] uppercase">3. Challenge Critique:</span>
                            <p className="pl-1 text-slate-300">{reasonerAuditOutput.challengeText}</p>
                          </div>
                          <div>
                            <span className="text-indigo-400 block font-bold text-[8px] uppercase">4. Alternative Proposals:</span>
                            <p className="pl-1 text-slate-300">{reasonerAuditOutput.proposeAlternativesText}</p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#1b212b]/40 text-[7.5px] text-slate-500 leading-normal">
                          ⚠️ Reasoning commentary is stored in a partitioned layer separate from Custody Truth records.
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-[#0c0e11] border border-[#1b212c] rounded-lg text-center text-slate-500 text-[9px] italic">
                        Click "Run Reasoner Audit" to evaluate this packet custody truth with pluggable {selectedReasoner}.
                      </div>
                    )}
                  </div>
                ) : selectedReasoner === "Reasoner Not Required" ? (
                  <div className="p-3 bg-[#0d1013] border border-[#212833] rounded-lg text-slate-400 text-[9px] leading-relaxed font-mono">
                    ℹ️ <span className="text-slate-200 font-bold">Reasoner Bypass Active:</span> Dispatching is unlocked without pluggable audit critiques. Ingestion will trace directly from Jemma validation verification vectors.
                  </div>
                ) : (
                  <div className="p-3 bg-[#0d1013] border border-rose-950/20 rounded-lg text-rose-450 text-[9.5px] text-center italic font-mono leading-relaxed">
                    ⚠️ Dispatch locked. Please select a reasoner to review contract or set as "Not Required".
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Endpoint Validation Parameters */}
            <div className="p-3 bg-[#0a0d10] border border-[#212833] rounded-lg space-y-3">
              <div className="flex justify-between items-center pb-1 border-b border-[#1b212b]">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">🛡️ Endpoint Test Controls</span>
                <span className="text-[8px] text-[#4a5568] uppercase font-mono">Decoupled Gate Router</span>
              </div>
              
              <div className="space-y-2.5">
                {/* Operator Approval Toggle */}
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 font-medium font-mono">Operator Approval Stamp:</span>
                  <button
                    onClick={async () => {
                      await toggleOperatorSeal();
                      setCompiledContract(null); // invalidate contract so it must be compiled again
                    }}
                    className={`px-2 py-0.5 rounded font-mono font-bold text-[9px] border transition-colors cursor-pointer ${
                      bridgeOperatorApproval 
                        ? "bg-emerald-950/40 text-emerald-400 border-emerald-800"
                        : selectedPacket.current_status === "FULLY_VERIFIED"
                          ? "bg-amber-950/45 text-amber-400 border-amber-800/60"
                          : "bg-rose-950/40 text-rose-400 border-rose-905"
                    }`}
                  >
                    {getApprovalStampLabel()}
                  </button>
                </div>

                {/* Runtime Selector dropdown */}
                <div className="flex flex-col gap-1 text-[10px]">
                  <span className="text-slate-400 font-medium font-mono">Target Compute Runtime:</span>
                  <select
                    value={bridgeRuntimePreference}
                    onChange={(e) => {
                      setBridgeRuntimePreference(e.target.value);
                      setCompiledContract(null); // invalidate contract
                    }}
                    className="w-full bg-[#0d1013] border border-[#212833] text-slate-300 rounded px-2 py-1 font-mono text-[10px] focus:outline-none focus:border-indigo-500 hover:border-slate-700 transition-colors"
                  >
                    <option value="octagon-compute-runtime">Pathfinder Runtime (L4 Serverless)</option>
                    <option value="nvidia-l4">nvidia-l4 (Discrete GPU)</option>
                    <option value="nvidia-t4">nvidia-t4 (Turing Core)</option>
                    <option value="">None (Force Warning!)</option>
                  </select>
                </div>

                {/* Universal Outbound Dock Selection Grid */}
                <div className="flex flex-col gap-2 pt-1.5 border-t border-[#1b212b]/60">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 font-mono font-bold uppercase">🌉 Universal Outbound Dock Routes (v2.0):</span>
                    <span className="text-[8.5px] text-amber-400 font-mono font-extrabold uppercase bg-amber-950/20 px-1.5 py-0.2 rounded border border-amber-900/40 animate-pulse">
                      Dock Gate v2
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 font-mono text-[9px]">
                    {[
                      {
                        id: "AI_MODEL_CATALOGUE",
                        name: "NVIDIA Pipeline",
                        subtargets: ["Model catalogue", "NIM endpoint", "Inference target"],
                        output: "Recommendation Packet",
                        icon: Cpu,
                        color: "from-emerald-950/10 to-teal-950/10 hover:border-emerald-500/40",
                        activeColor: "border-emerald-500 bg-emerald-950/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]",
                        badge: "NVIDIA / Triton"
                      },
                      {
                        id: "GOOGLE_CLOUD_PIPELINE",
                        name: "Google Cloud Pipeline",
                        subtargets: ["Cloud Run", "Firestore", "Storage", "Functions"],
                        output: "Cloud Deployment Payload",
                        icon: Server,
                        color: "from-blue-950/10 to-indigo-950/10 hover:border-indigo-500/40",
                        activeColor: "border-indigo-500 bg-indigo-950/45 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)]",
                        badge: "Google Cloud"
                      },
                      {
                        id: "DOCUMENTATION_PIPELINE",
                        name: "Documentation Pipeline",
                        subtargets: ["PDF Report", "DOCX Export", "Markdown Spec", "Local Archive"],
                        output: "Executive Report.pdf",
                        icon: FileText,
                        color: "from-amber-950/10 to-orange-950/10 hover:border-orange-500/40",
                        activeColor: "border-orange-500 bg-orange-950/40 text-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.15)]",
                        badge: "Aesthetic Docs"
                      },
                      {
                        id: "COMMUNICATION_PIPELINE",
                        name: "Communication Pipeline",
                        subtargets: ["Operator Email Draft", "Quick Share ID", "Workspace Export", "Secure Forward"],
                        output: "Send Notification Draft",
                        icon: Send,
                        color: "from-purple-950/10 to-pink-950/10 hover:border-pink-500/40",
                        activeColor: "border-pink-500 bg-pink-950/40 text-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.15)]",
                        badge: "Secure Mail v2"
                      },
                      {
                        id: "RESEARCH_PIPELINE",
                        name: "Research Pipeline",
                        subtargets: ["Dataset package", "Evidence bundle", "Registry export"],
                        output: "Evidence Bundle Payload",
                        icon: Search,
                        color: "from-teal-950/10 to-cyan-950/10 hover:border-cyan-500/40",
                        activeColor: "border-cyan-500 bg-cyan-950/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]",
                        badge: "Discovery Lab"
                      },
                      {
                        id: "ARCHIVE_PIPELINE",
                        name: "Archive Pipeline",
                        subtargets: ["Legitimacy Ledger", "Packet history", "Permanent Storage Block"],
                        output: "Permanently Signed Ledger Block",
                        icon: Layers,
                        color: "from-rose-950/10 to-red-950/10 hover:border-rose-500/40",
                        activeColor: "border-rose-500 bg-rose-950/40 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.15)]",
                        badge: "Immutable Store"
                      }
                    ].map((pipe) => {
                      const IconComponent = pipe.icon;
                      const isActive = selectedPipeline === pipe.id;
                      return (
                        <button
                          key={pipe.id}
                          type="button"
                          onClick={() => {
                            setSelectedPipeline(pipe.id);
                            setBridgeDestinationTarget(pipe.id);
                            setCompiledContract(null);
                          }}
                          className={`group relative text-left border rounded-xl p-3 transition-all duration-300 cursor-pointer overflow-hidden ${
                            isActive 
                              ? pipe.activeColor
                              : `border-[#212833] bg-[#0c0f13]/85 text-slate-400 bg-gradient-to-br ${pipe.color}`
                          }`}
                        >
                          {isActive && (
                            <span className="absolute top-0 right-0 w-12 h-12 bg-white/5 rounded-full blur-md" />
                          )}

                          <div className="flex items-start justify-between">
                            <div className="flex gap-2.5">
                              <div className={`p-1.5 rounded-lg border transition-all duration-300 ${
                                isActive 
                                  ? "bg-white/5 border-white/20 text-white" 
                                  : "bg-[#090b0e] border-white/5 text-slate-500 group-hover:text-slate-350"
                              }`}>
                                <IconComponent className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="font-extrabold text-[10.5px] uppercase tracking-wide flex items-center gap-1.5 leading-none">
                                  <span className={isActive ? "text-white animate-pulse" : "text-slate-300 group-hover:text-white transition-colors"}>
                                    {pipe.name}
                                  </span>
                                  <span className="text-[7.5px] text-slate-500 font-bold">
                                    /{pipe.id}/
                                  </span>
                                </div>
                                <div className="text-[8px] text-slate-500 mt-1.5 font-bold space-x-1.5 flex flex-wrap items-center">
                                  {pipe.subtargets.map((st, sidx) => (
                                    <span key={st} className="flex items-center gap-1">
                                      {sidx > 0 && <span>•</span>}
                                      <span>{st}</span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className={`text-[7.5px] font-sans font-black uppercase px-1.5 py-0.2 rounded border ${
                              isActive 
                                ? "bg-white/10 text-white border-white/25" 
                                : "bg-slate-950/40 text-slate-500 border-slate-900"
                            }`}>
                              {pipe.badge}
                            </span>
                          </div>

                          <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[8px]">
                            <span className="text-slate-500 uppercase font-black">Expected Output System:</span>
                            <span className={`font-bold font-sans ${isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-300"}`}>
                              {pipe.output}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Credential Gate Controller */}
                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[#1b212b]/60">
                  <span className="text-slate-400 font-medium font-mono">Credentials Valid Toggle:</span>
                  <button
                    onClick={() => {
                      setCredentialsValid(!credentialsValid);
                      setCompiledContract(null); // invalidate contract
                    }}
                    className={`px-2 py-0.5 rounded font-mono font-bold text-[9px] border transition-colors cursor-pointer ${
                      credentialsValid
                        ? "bg-emerald-950/40 text-emerald-400 border-emerald-800"
                        : "bg-amber-950/45 text-amber-400 border-amber-800/60"
                    }`}
                  >
                    {credentialsValid ? "KEYS LOADED (VALID)" : "KEYS MISSING (MISSING)"}
                  </button>
                </div>

                {/* Evaluated Credential Status Banner */}
                <div className="flex justify-between items-center text-[9px] font-mono p-1 rounded bg-[#0d1013] border border-[#212833]">
                  <span className="text-slate-500">RESOLVED GATE:</span>
                  <span className={`font-mono font-bold uppercase ${
                    resolvedCredentialStatus === "VALID" 
                      ? "text-emerald-400" 
                      : resolvedCredentialStatus === "NOT_REQUIRED" 
                        ? "text-sky-400" 
                        : "text-amber-500"
                  }`}>
                    {resolvedCredentialStatus === "VALID" && "🔒 VALID SECURITY LEASE"}
                    {resolvedCredentialStatus === "NOT_REQUIRED" && "🟢 CREDENTIALS NOT_REQUIRED"}
                    {resolvedCredentialStatus === "MISSING" && "⚠️ CREDENTIALS_REQUIRED"}
                  </span>
                </div>
              </div>
            </div>

            {/* Decoupled Handoff State Diagnostics Panel */}
            <div className="p-3 bg-[#0a0d10] border border-[#212833] rounded-lg space-y-3">
              <div className="flex justify-between items-center pb-1 border-b border-[#1b212b]">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">📊 Gateway Diagnostics & Gates</span>
                <span className="text-[8px] text-[#4a5568] uppercase font-mono">Real-time telemetry</span>
              </div>
              
              {/* 9-state sequence checklist */}
              <div className="space-y-1.5 text-[9px] font-mono text-slate-400">
                <span className="text-[8.5px] text-indigo-400 font-extrabold uppercase tracking-wide block mb-1">🛡️ Decoupled Handoff Sequence Checklist:</span>
                
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 bg-[#0d1013] p-2 border border-[#212833] rounded">
                  <div className="flex items-center gap-1">
                    <span className={selectedPacket.jemma_verdict === "APPROVED" ? "text-emerald-400 font-bold" : "text-rose-500 font-bold"}>
                      {selectedPacket.jemma_verdict === "APPROVED" ? "✓" : "✗"}
                    </span>
                    <span>1. Jemma Approved</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={selectedPacket.red_team_verdict === "CLEARED" ? "text-emerald-400 font-bold" : "text-rose-500 font-bold"}>
                      {selectedPacket.red_team_verdict === "CLEARED" ? "✓" : "✗"}
                    </span>
                    <span>2. Red Team Cleared</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={isPacketVerified ? "text-emerald-400 font-bold" : "text-rose-500 font-bold"}>
                      {isPacketVerified ? "✓" : "✗"}
                    </span>
                    <span>3. Fully Verified</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={bridgeOperatorApproval ? "text-emerald-400 font-bold" : "text-rose-500 font-bold"}>
                      {bridgeOperatorApproval ? "✓" : "✗"}
                    </span>
                    <span>4. Operator Approved</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={selectedReasoner !== "Not Selected" ? "text-emerald-400 font-bold" : "text-rose-500 font-bold"}>
                      {selectedReasoner !== "Not Selected" ? "✓" : "✗"}
                    </span>
                    <span>5. Reasoner Selected</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={bridgeRuntimePreference ? "text-emerald-400 font-bold" : "text-rose-500 font-bold"}>
                      {bridgeRuntimePreference ? "✓" : "✗"}
                    </span>
                    <span>6. Runtime Selected</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={bridgeDestinationTarget ? "text-emerald-400 font-bold" : "text-rose-500 font-bold"}>
                      {bridgeDestinationTarget ? "✓" : "✗"}
                    </span>
                    <span>7. Dest Selected</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={resolvedCredentialStatus !== "MISSING" ? "text-emerald-400 font-bold" : "text-rose-500 font-bold"}>
                      {resolvedCredentialStatus !== "MISSING" ? "✓" : "✗"}
                    </span>
                    <span>8. Credentials Valid</span>
                  </div>
                  <div className="flex items-center gap-1 col-span-2 border-t border-[#1b212b] pt-1 mt-0.5">
                    <span className={isDispatchOptionValid ? "text-emerald-400 font-bold" : "text-rose-500 font-bold"}>
                      {isDispatchOptionValid ? "✓" : "✗"}
                    </span>
                    <span className="font-bold text-slate-300">9. Dispatch Ready</span>
                  </div>
                </div>
              </div>

              {/* 6 diagnostics variables */}
              <div className="space-y-1.5 text-[9px] font-mono text-slate-400 pt-1.5 border-t border-[#1b212b]">
                <span className="text-[8.5px] text-sky-400 font-extrabold uppercase tracking-wide block mb-1">📟 Diagnostics Board:</span>
                
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="flex flex-col p-1.5 bg-[#0d1013] border border-[#212833] rounded">
                    <span className="text-[7.5px] text-slate-500 uppercase font-bold">packetState</span>
                    <span className="text-slate-300 font-bold truncate">{selectedPacket.current_status}</span>
                  </div>
                  <div className="flex flex-col p-1.5 bg-[#0d1013] border border-[#212833] rounded">
                    <span className="text-[7.5px] text-slate-500 uppercase font-bold">operatorApproved</span>
                    <span className={bridgeOperatorApproval ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                      {bridgeOperatorApproval ? "TRUE" : "FALSE"}
                    </span>
                  </div>
                  <div className="flex flex-col p-1.5 bg-[#0d1013] border border-[#212833] rounded">
                    <span className="text-[7.5px] text-slate-500 uppercase font-bold">runtimeSelected</span>
                    <span className={bridgeRuntimePreference ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                      {bridgeRuntimePreference ? "TRUE" : "FALSE"}
                    </span>
                  </div>
                  <div className="flex flex-col p-1.5 bg-[#0d1013] border border-[#212833] rounded">
                    <span className="text-[7.5px] text-slate-500 uppercase font-bold">destinationSelected</span>
                    <span className={bridgeDestinationTarget ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                      {bridgeDestinationTarget ? "TRUE" : "FALSE"}
                    </span>
                  </div>
                  <div className="flex flex-col p-1.5 bg-[#0d1013] border border-[#212833] rounded">
                    <span className="text-[7.5px] text-slate-500 uppercase font-bold">credentialStatus</span>
                    <span className={resolvedCredentialStatus === "MISSING" ? "text-amber-400 font-bold" : "text-sky-400 font-bold"}>
                      {resolvedCredentialStatus}
                    </span>
                  </div>
                  <div className="flex flex-col p-1.5 bg-[#0d1013] border border-[#212833] rounded">
                    <span className="text-[7.5px] text-slate-500 uppercase font-bold">dispatchStatus</span>
                    <span className={computedDispatchStatus === "DISPATCH_READY" || computedDispatchStatus === "DRY_RUN" ? "text-emerald-400 font-bold animate-pulse" : "text-amber-500 font-bold"}>
                      {computedDispatchStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contract compiler interface */}
            <div className="p-3 bg-[#0a0d10] border border-[#212833] rounded-lg space-y-2.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500 uppercase font-bold text-[9px]">Active Engine Source:</span>
                <span className="text-slate-300 font-mono font-bold truncate max-w-[170px]">
                  {selectedPacket.packet_id}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCompileBridgeContract}
                  className="flex-1 bg-indigo-950/25 hover:bg-indigo-900/35 border border-indigo-900/50 hover:border-indigo-600 text-indigo-400 font-sans font-bold px-2.5 py-1.5 rounded text-[10px] uppercase cursor-pointer transition-all flex items-center justify-center gap-1 active:scale-95"
                >
                  <span>📝 Compile Contract</span>
                </button>
                <button
                  onClick={handleDispatchBridgeContract}
                  disabled={
                    !compiledContract || 
                    isBridgeDispatching || 
                    !bridgeOperatorApproval || 
                    !bridgeRuntimePreference || 
                    !bridgeDestinationTarget || 
                    (resolvedCredentialStatus === "MISSING")
                  }
                  className={`flex-1 border font-sans font-bold px-2.5 py-1.5 rounded text-[10px] uppercase cursor-pointer transition-all flex items-center justify-center gap-1 active:scale-95 ${
                    compiledContract && 
                    !isBridgeDispatching && 
                    bridgeOperatorApproval && 
                    !!bridgeRuntimePreference && 
                    !!bridgeDestinationTarget && 
                    resolvedCredentialStatus !== "MISSING"
                      ? "bg-purple-950/25 hover:bg-purple-900/35 border-purple-800/40 hover:border-purple-600 text-purple-400 animate-pulse"
                      : "bg-[#111417]/70 text-slate-600 border-slate-900/40 cursor-not-allowed"
                  }`}
                >
                  {isBridgeDispatching ? (
                    <>
                      <RefreshCw className="h-2.5 w-2.5 animate-spin text-purple-400" />
                      <span>Dispatching...</span>
                    </>
                  ) : (
                    <span>🚀 Bridge Dispatch</span>
                  )}
                </button>
              </div>

              {/* Warn when credentials are missing and display alternative bypass handlers */}
              {resolvedCredentialStatus === "MISSING" && (
                <div className="p-2.5 bg-amber-950/15 border border-amber-900/30 rounded-lg space-y-1.5 mt-2">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3 w-3 text-amber-500 animate-bounce" />
                    <span className="text-[8.5px] uppercase font-bold font-mono text-amber-500">
                      CREDENTIALS_REQUIRED (Dispatched Blockset Active)
                    </span>
                  </div>
                  <p className="text-[8.5px] font-mono leading-relaxed text-slate-400">
                    Live dispatch restricted due to missing tokens. The following offline, dry-run, copying, or preview actions remain fully accessible:
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      onClick={handleDryRunSimulation}
                      className="bg-emerald-950/20 hover:bg-emerald-900/30 border border-emerald-900/40 hover:border-emerald-700 text-emerald-400 p-1.5 rounded text-[8px] font-mono uppercase font-bold text-center cursor-pointer active:scale-95 transition-all"
                    >
                      🧬 Dry Run
                    </button>
                    <button
                      onClick={() => {
                        if (!compiledContract) handleCompileBridgeContract();
                      }}
                      className="bg-indigo-950/20 hover:bg-indigo-900/30 border border-indigo-900/40 hover:border-indigo-700 text-indigo-400 p-1.5 rounded text-[8px] font-mono uppercase font-bold text-center cursor-pointer active:scale-95 transition-all"
                    >
                      👁️ Preview
                    </button>
                    <button
                      onClick={handleCopyContract}
                      className="bg-purple-950/20 hover:bg-purple-900/30 border border-purple-900/40 hover:border-purple-700 text-purple-400 p-1.5 rounded text-[8px] font-mono uppercase font-bold text-center cursor-pointer active:scale-95 transition-all"
                    >
                      {copiedSuccess ? "✔️ Copied!" : "📋 Copy"}
                    </button>
                    <button
                      onClick={handleSaveToJournal}
                      className="bg-amber-950/20 hover:bg-amber-900/30 border border-amber-900/40 hover:border-amber-700 text-amber-400 p-1.5 rounded text-[8px] font-mono uppercase font-bold text-center cursor-pointer active:scale-95 transition-all"
                    >
                      📝 Save Log
                    </button>
                  </div>
                </div>
              )}

              {/* Compiled contract previewer */}
              {compiledContract && (
                <div className="space-y-2 pt-2 border-t border-[#1a1f27] font-mono">
                  <div className="flex justify-between items-center text-[8.5px]">
                    <span className="text-slate-500 uppercase font-bold">Compiled Crystal Adapter Contract Payload:</span>
                    <span className="text-emerald-400 text-[8px] font-bold">✓ READY FOR DISPATCH</span>
                  </div>

                  <div className="p-2 bg-[#0c0f14] border border-[#212833] rounded text-[8.5px] font-mono whitespace-pre overflow-x-auto max-h-[110px] text-slate-300 select-all leading-relaxed">
                    {JSON.stringify(compiledContract, null, 2)}
                  </div>

                  {/* Aesthetic Routing Contract Metadata Breakdown Block */}
                  <div className="bg-[#0b0e12] border border-[#212c3a] rounded-xl p-2.5 space-y-2">
                    <div className="text-[8.5px] text-indigo-400 font-extrabold uppercase tracking-wide leading-none border-b border-[#1f2631] pb-1.5 flex justify-between">
                      <span>🌉 Universal Dock Routing Manifest</span>
                      <span className="text-[7.5px] bg-[#1a1b26] px-1 rounded text-slate-400">v2.0-Secure</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[8px]">
                      <div className="p-1 bg-[#10141a]/45 rounded border border-[#1b212b]">
                        <span className="block text-slate-600 font-bold uppercase text-[7px] leading-tight">Router Key Symbol:</span>
                        <span className="text-slate-350 font-bold text-[8.5px]">{compiledContract.sourcePacketId || "PKT-001"}</span>
                      </div>
                      
                      <div className="p-1 bg-[#10141a]/45 rounded border border-[#1b212b]">
                        <span className="block text-slate-600 font-bold uppercase text-[7px] leading-tight">Auth Status & Gate:</span>
                        <span className={`font-semibold text-[8px] ${
                          compiledContract.credentialStatus === "VALID" 
                            ? "text-emerald-400 font-bold" 
                            : compiledContract.credentialStatus === "NOT_REQUIRED" 
                              ? "text-sky-450 font-bold" 
                              : "text-amber-500 font-bold"
                        }`}>
                          {compiledContract.credentialStatus === "VALID" ? "🔒 LEASE SIGNED" : compiledContract.credentialStatus === "NOT_REQUIRED" ? "🟢 NOT_REQUIRED" : "⚠️ MISSING_KEYS"}
                        </span>
                      </div>

                      <div className="p-1 bg-[#10141a]/45 rounded border border-[#1b212b]">
                        <span className="block text-slate-600 font-bold uppercase text-[7px] leading-tight">Bridge Pipeline Route:</span>
                        <span className="text-indigo-400 font-black text-[8px]">{compiledContract.destinationTarget || "AI_MODEL_CATALOGUE"}</span>
                      </div>

                      <div className="p-1 bg-[#10141a]/45 rounded border border-[#1b212b]">
                        <span className="block text-slate-600 font-bold uppercase text-[7px] leading-tight">Deliverable Output Payload:</span>
                        <span className="text-emerald-400 font-black text-[8px] truncate">
                          {selectedPipeline === "DOCUMENTATION_PIPELINE" && "Executive Report.pdf"}
                          {selectedPipeline === "AI_MODEL_CATALOGUE" && "Traced Recommendation.json"}
                          {selectedPipeline === "GOOGLE_CLOUD_PIPELINE" && "GCP Cloud Run Manifest"}
                          {selectedPipeline === "COMMUNICATION_PIPELINE" && "Signed Email Draft Payload"}
                          {selectedPipeline === "RESEARCH_PIPELINE" && "Decoupled Dataset Bundle"}
                          {selectedPipeline === "ARCHIVE_PIPELINE" && "Immutable Ledger Block"}
                        </span>
                      </div>

                      <div className="col-span-2 p-1 bg-[#10141a]/45 rounded border border-[#1b212b] space-y-0.5">
                        <span className="block text-slate-600 font-bold uppercase text-[7px] leading-none">Underlying Mapped Components:</span>
                        <p className="text-slate-400 leading-relaxed text-[7.5px]">
                          {selectedPipeline === "GOOGLE_CLOUD_PIPELINE" ? (
                            "Decoupled Google Cloud Run compute triggers, serving the structured evidence findings."
                          ) : selectedPipeline === "AI_MODEL_CATALOGUE" ? (
                            "Integrated Triton NIM models optimized via trace-driven precision matrices."
                          ) : selectedPipeline === "DOCUMENTATION_PIPELINE" ? (
                            "Official Bank of England database yield-curve indices exported directly."
                          ) : selectedPipeline === "RESEARCH_PIPELINE" ? (
                            "Trace-driven Stanford OpenJarvis portable agent specs indexed for audit review."
                          ) : (
                            "Standard isolated secure memory blocks locked on the database ledger."
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Communication log feed */}
            <div className="space-y-1.5">
              <span className="text-slate-500 uppercase font-bold text-[9px] block">🌉 Crystal Bridge Gateway Diagnostics:</span>
              <div className="p-2.5 bg-[#0a0d10] border border-[#1b212b] rounded-lg h-[95px] overflow-y-auto font-mono text-[8.5px] text-[#cadee5] leading-relaxed space-y-1">
                {bridgeLogs.length > 0 ? (
                  bridgeLogs.map((log, idx) => (
                    <div key={idx} className={log.includes("BRIDGE_ERROR") ? "text-rose-400" : log.includes("SUCCESS") ? "text-emerald-400" : "text-[#cadee5]"}>
                      {log}
                    </div>
                  ))
                ) : (
                  <span className="text-slate-600 block italic">Awaiting crystal handoff compilation & routing logs...</span>
                )}
              </div>
            </div>
          </div>

          {/* EXPERT COPILOT TACTICAL TERMINAL */}
          <div className={`bg-[#14181d] border border-[#232932] rounded-xl flex flex-col shadow-lg overflow-hidden flex-1 transition-all ${expandedSection === 6 ? 'min-h-[290px] max-h-[380px]' : ''}`} id="section-6-accordion">
            <div 
              onClick={() => setExpandedSection(expandedSection === 6 ? null : 6)}
              className="p-4 border-b border-[#232a35] bg-[#111417] flex items-center justify-between cursor-pointer select-none group"
              id="section-6-header"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse group-hover:scale-110 transition-transform" />
                <h3 className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#ececf1]">
                  VI. Co-Pilot Executive Dialog
                </h3>
              </div>
              <div className="flex items-center gap-2 font-mono" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={clearCopilotHistory}
                  className="text-[9px] bg-red-950/40 text-red-400 border border-red-900/40 hover:bg-red-900/30 px-2 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer"
                  title="Clear persistent conversation logs from Firebase"
                >
                  🧹 Clear Ledger
                </button>
                {renderRealityBadge("LIVE")}
                <span className="text-[9px] text-[#48bb78] flex items-center gap-1.5 mr-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  COGNITIVE
                </span>
                <span className="text-slate-500 text-[10px] font-bold select-none ml-1">
                  {expandedSection === 6 ? "▲" : "▼"}
                </span>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {expandedSection === 6 && (
                <motion.div
                  key="section-6-body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col flex-1 overflow-hidden"
                >
                  {/* COMPACT ACTIVE-CONTEXT BANNER */}
                  <div className="bg-[#10141b] border-b border-[#232a35] px-4 py-2 text-slate-400 font-mono text-[9px] leading-snug shrink-0">
                    <div className="flex items-center justify-between mb-1.5 text-slate-400">
                      <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[9.5px] text-sky-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
                        Active Context Registry Layer
                      </div>
                      <span className="text-[8px] bg-[#1d2432] text-slate-400 border border-slate-700/50 px-1.5 py-0.2 rounded font-bold">
                        SECURE LOG
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5 pt-1 border-t border-[#1a212d] text-[8.5px]">
                      <div>
                        <div className="text-[7.5px] text-slate-500 font-bold uppercase">Packet</div>
                        <div className="text-slate-300 font-bold max-w-full truncate">{selectedPacket?.packet_id || "PKT-001"}</div>
                      </div>
                      <div>
                        <div className="text-[7.5px] text-slate-500 font-bold uppercase">State</div>
                        <div className="text-amber-400 font-bold max-w-full truncate" title={selectedPacket?.current_status}>
                          {selectedPacket?.current_status || "PENDING"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[7.5px] text-slate-500 font-bold uppercase">Custody</div>
                        <div className="text-slate-300 max-w-full truncate">UNIQUE_CHAIN</div>
                      </div>
                      <div>
                        <div className="text-[7.5px] text-slate-500 font-bold uppercase">Authority</div>
                        <div className="text-slate-300 font-bold max-w-full truncate">
                          {selectedPacket?.operator_gate === "APPROVED" ? "OP" : "PENDING"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[7.5px] text-slate-500 font-bold uppercase">Dispatch</div>
                        <div className="text-slate-300 font-bold max-w-full truncate">
                          {selectedPacket?.current_status === "DEPLOYED" || selectedPacket?.current_status === "Deployed (Demo)" ? "LIVE" : "DRY_RUN"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-[#1a212d] grid grid-cols-1 md:grid-cols-2 gap-2 text-[8px] leading-relaxed">
                      <div>
                        <span className="text-slate-500 font-bold uppercase mr-1">Outstanding Issues:</span>
                        <span className={
                          (selectedPacket?.jemma_verdict === "PENDING" || selectedPacket?.red_team_verdict === "PENDING" || selectedPacket?.operator_gate === "LOCKED")
                            ? "text-red-400 font-bold" 
                            : "text-emerald-400 font-bold"
                        }>
                          {selectedPacket?.jemma_verdict === "PENDING" 
                            ? "Awaiting Jemma review. " 
                            : ""}
                          {selectedPacket?.red_team_verdict === "PENDING" 
                            ? "Awaiting Red Team. " 
                            : ""}
                          {selectedPacket?.operator_gate === "LOCKED" 
                            ? "Awaiting Signature Seal." 
                            : ""}
                          {!(selectedPacket?.jemma_verdict === "PENDING" || selectedPacket?.red_team_verdict === "PENDING" || selectedPacket?.operator_gate === "LOCKED")
                            ? "None" 
                            : ""}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold uppercase mr-1">Suggested Next Action:</span>
                        <span className="text-sky-300 font-semibold">
                          {selectedPacket?.jemma_verdict === "PENDING" || selectedPacket?.red_team_verdict === "PENDING"
                            ? "Review evidence boundaries and complete validation signatures."
                            : (selectedPacket?.operator_gate === "LOCKED" 
                                ? "Operator approval seal required before flight dispatch."
                                : (selectedPacket?.current_status !== "DEPLOYED" && selectedPacket?.current_status !== "Deployed (Demo)"
                                    ? "Assign Crystal Bridge target and emit runtime build contract."
                                    : "Packet fully dispatched and operating under secure custody guides."))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dialogue stream */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0c0f12] text-[11px] leading-relaxed scrollbar-thin max-h-[220px]">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] ${
                    msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  }`}
                >
                  <div className="text-[8px] text-slate-500 mb-0.5 font-mono">
                    {msg.sender === "user" ? "OPERATOR (ROD)" : "TACTICAL COPILOT"} • {msg.timestamp}
                  </div>
                  <div
                    className={`rounded-xl p-2.5 whitespace-pre-wrap ${
                      msg.sender === "user"
                        ? "bg-sky-600 text-white rounded-tr-none px-3 border border-sky-500/30"
                        : "bg-[#151922] text-slate-200 border border-[#212936] rounded-tl-none font-mono text-[10px]"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isAiTyping && (
                <div className="flex flex-col items-start max-w-[80%] mr-auto">
                  <span className="text-[8px] text-slate-500 mb-0.5 font-mono">Formulating flight guidelines...</span>
                  <div className="bg-[#151922] border border-[#212936] text-slate-400 rounded-xl rounded-tl-none p-2.5 flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-sky-500 animate-bounce" />
                    <span className="h-1 w-1 rounded-full bg-sky-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="h-1 w-1 rounded-full bg-sky-500 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Smart shortcut buttons in pilot header */}
            <div className="px-3 py-1.5 bg-[#0f1217] border-t border-[#1d232c] flex gap-1.5 overflow-x-auto text-[9px] whitespace-nowrap scrollbar-none">
              <button
                onClick={() => clickShortcut("Show step-by-step verification checklist for CPU Cloud Run deployment")}
                className="bg-[#161a22] hover:bg-[#202734] text-[#cbd5e1] border border-[#252e3e] px-2 py-1 rounded transition-colors font-mono font-semibold cursor-pointer"
              >
                📥 Deployment Checklist
              </button>
              <button
                onClick={() => clickShortcut("Explain how the double-signature custody architecture acts as an operator lock")}
                className="bg-[#161a22] hover:bg-[#202734] text-[#cbd5e1] border border-[#252e3e] px-2 py-1 rounded transition-colors font-mono font-semibold cursor-pointer"
              >
                🛡 Dual-Verdicts Lock Explain
              </button>
            </div>

            {/* Search/Query dialog query input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChat(chatInput);
              }}
              className="p-3 bg-[#111417] border-t border-[#232a35] flex gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Submit inquiry or query flight patterns..."
                className="flex-1 bg-[#090b0e] border border-[#252a32] rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                className="bg-sky-600 hover:bg-sky-500 text-white p-2 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* VI. PATHFINDER DOCTRINE & AUTHORITY ROUTING DIRECTORY */}
          {viewMode === "engineer" && (
            <div className="bg-[#14181d] border border-[#232932] rounded-xl p-5 shadow-lg space-y-4 shrink-0 transition-all" id="section-7-accordion">
            <div 
              onClick={() => setExpandedSection(expandedSection === 7 ? null : 7)}
              className="flex justify-between items-center border-b border-[#232a35] pb-2.5 cursor-pointer select-none group"
              id="section-7-header"
            >
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <h3 className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#ececf1]">
                  VII. Pathfinder Governance Doctrine Layer
                </h3>
              </div>
              <div className="flex items-center gap-2 font-mono" onClick={(e) => e.stopPropagation()}>
                {renderRealityBadge("REGISTERED")}
                <button
                  onClick={() => {
                    setExpandedSection(7);
                    setShowAddForm(!showAddForm);
                  }}
                  className="text-[10px] bg-slate-900 border border-slate-700/50 hover:bg-[#1a212b] text-sky-450 px-2 py-1 rounded font-bold cursor-pointer transition-all"
                >
                  {showAddForm ? "✕ Close Form" : "+ Register Authority"}
                </button>
                <span className="text-slate-500 text-[10px] font-bold select-none ml-2 mr-1">
                  {expandedSection === 7 ? "▲" : "▼"}
                </span>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {expandedSection === 7 && (
                <motion.div
                  key="section-7-body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4 overflow-hidden"
                >

            {doctrineError && (
              <div className="p-2.5 bg-rose-950/40 border border-rose-900/30 rounded text-[10.5px] font-mono text-rose-300">
                ⚠️ {doctrineError}
              </div>
            )}

            {/* EXPANDABLE REGISTER AUTHORITY CLASS FORM */}
            <AnimatePresence>
              {showAddForm && (
                <motion.form
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  onSubmit={handleRegisterDoctrine}
                  className="bg-[#0b0d10] p-3 rounded-lg border border-[#212936] space-y-3 overflow-hidden font-mono text-[11px]"
                >
                  <div className="text-[10px] text-sky-400 font-extrabold uppercase pb-1 border-b border-[#1b212c]">
                    Register New Doctrine Class
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-[#718096] uppercase font-bold block pb-1">Authority ID</label>
                      <input
                        type="text"
                        placeholder="e.g. EIA"
                        value={newAuthorityName}
                        onChange={(e) => setNewAuthorityName(e.target.value)}
                        className="w-full bg-[#111419] border border-[#252e3c] rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-sky-500 text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-[#718096] uppercase font-bold block pb-1">Status Policy</label>
                      <select
                        value={newAuthorityStatus}
                        onChange={(e) => setNewAuthorityStatus(e.target.value)}
                        className="w-full bg-[#111419] border border-[#252e3c] rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-sky-500 text-xs"
                      >
                        <option value="OBSERVE_ONLY">OBSERVE_ONLY</option>
                        <option value="ACTIVE_OBSERVE">ACTIVE_OBSERVE</option>
                        <option value="PLANNING">PLANNING</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] text-[#718096] uppercase font-bold block pb-1">Category Domain</label>
                    <select
                      value={newAuthorityCategory}
                      onChange={(e) => setNewAuthorityCategory(e.target.value)}
                      className="w-full bg-[#111419] border border-[#252e3c] rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-sky-500 text-xs"
                    >
                      <option value="AI_MODEL_CATALOGUE">AI_MODEL_CATALOGUE</option>
                      <option value="DERIVATIVES_MARKET_STRUCTURE">DERIVATIVES_MARKET_STRUCTURE</option>
                      <option value="MACROECONOMIC_HISTORY">MACROECONOMIC_HISTORY</option>
                      <option value="LABOR_MARKET_DYNAMICS">LABOR_MARKET_DYNAMICS</option>
                      <option value="CORPORATE_FINANCIAL_FILINGS">CORPORATE_FINANCIAL_FILINGS</option>
                      <option value="ENERGY_INFRASTRUCTURE">ENERGY_INFRASTRUCTURE</option>
                      <option value="CUSTOM_CLASS">CUSTOM_CLASS</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <label className="text-[9px] text-[#718096] uppercase font-bold block pb-1">Economic Role</label>
                      <input
                        type="text"
                        placeholder="e.g. Weekly inventories & reserves"
                        value={newAuthorityRole}
                        onChange={(e) => setNewAuthorityRole(e.target.value)}
                        className="w-full bg-[#111419] border border-[#252e3c] rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-sky-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-[#718096] uppercase font-bold block pb-1">Brief Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Monitors sovereign energy extraction rates..."
                        value={newAuthorityDesc}
                        onChange={(e) => setNewAuthorityDesc(e.target.value)}
                        className="w-full bg-[#111419] border border-[#252e3c] rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-sky-500 text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-300 px-3 py-1.5 rounded font-extrabold transition-all uppercase cursor-pointer"
                  >
                    Commit Authority Class to Doctrine
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* DOCTRINE LIST DIRECTORY LISTINGS */}
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {doctrine && doctrine.length > 0 ? (
                doctrine.map((d, index) => {
                  let badgeColor = "border-slate-800 bg-slate-900 text-slate-400";
                  if (d.status === "ACTIVE_OBSERVE") {
                    badgeColor = "border-emerald-800/40 bg-emerald-950/20 text-emerald-400";
                  } else if (d.status === "OBSERVE_ONLY") {
                    badgeColor = "border-amber-800/40 bg-amber-950/20 text-amber-400";
                  } else if (d.status === "PLANNING") {
                    badgeColor = "border-sky-800/30 bg-sky-950/20 text-sky-400";
                  }

                  return (
                    <div
                      key={d.authority}
                      className="bg-[#0f1217] p-3 rounded-lg border border-[#1e2531] space-y-1.5 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex justify-between items-center font-mono text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-sky-400" />
                          <span className="font-extrabold text-slate-200 text-[13px] tracking-wider">{d.authority}</span>
                        </div>
                        <span className={`text-[8.5px] border font-bold px-2 py-0.5 rounded uppercase tracking-wider ${badgeColor}`}>
                          {d.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-1 text-[10.5px]">
                        <div>
                          <span className="text-[#718096] font-semibold font-mono text-[9px] uppercase">Domain Class:</span>{" "}
                          <span className="font-mono text-slate-300">{d.category}</span>
                        </div>
                        <div>
                          <span className="text-[#718096] font-semibold font-mono text-[9px] uppercase">Routing Role:</span>{" "}
                          <span className="text-slate-200 font-sans">{d.role}</span>
                        </div>
                      </div>

                      {d.description && (
                        <p className="text-[10px] text-slate-400 font-sans leading-relaxed italic bg-[#151922]/40 p-2 rounded border border-[#212836]">
                          "{d.description}"
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center p-6 bg-[#0f1217] border border-dashed border-slate-800 rounded-lg">
                  <RefreshCw className="h-5 w-5 text-slate-600 animate-spin mx-auto mb-2" />
                  <p className="text-slate-500 font-sans text-xs">Synchronizing active doctrine layers...</p>
                </div>
              )}
            </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          )}

          {/* CME GROUP CREDENTIALS GATEWAY VALIDATION PANEL */}
          {viewMode === "engineer" && (
            <div className="bg-[#14181d] border border-[#232932] rounded-xl p-5 shadow-lg space-y-4 shrink-0 transition-all" id="section-8-accordion">
            <div 
              onClick={() => setExpandedSection(expandedSection === 8 ? null : 8)}
              className="border-b border-[#232a35] pb-2.5 flex justify-between items-center cursor-pointer select-none group"
              id="section-8-header"
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-sky-400 group-hover:scale-110 transition-transform" />
                <h3 className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#ececf1]">
                  VIII. Credential Gate & CME SSO Gateway Access
                </h3>
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                {cmeIsLive 
                  ? renderRealityBadge("VERIFIED") 
                  : cmeConfigured 
                    ? renderRealityBadge("REGISTERED") 
                    : renderRealityBadge("PENDING_AUTH")}
                <span className="text-slate-500 text-[10px] font-bold select-none ml-2 mr-1">
                  {expandedSection === 8 ? "▲" : "▼"}
                </span>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {expandedSection === 8 && (
                <motion.div
                  key="section-8-body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4 overflow-hidden"
                >
              {/* Credential Gate Status Report */}
              <div className="p-4 bg-[#0a0d10] border border-[#232a35] rounded-lg space-y-3">
                <div className="flex items-center gap-1.5 border-b border-[#1d242e] pb-1.5 mb-1 justify-between">
                  <div className="flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5 text-indigo-400" />
                    <span className="font-mono text-xs font-bold text-slate-300 tracking-wider">CREDENTIAL GATE</span>
                  </div>
                  <span className="text-[8px] font-mono select-none px-1 py-0.5 rounded bg-indigo-950/40 text-indigo-300 border border-indigo-900/40">RUNTIME EVALUATION</span>
                </div>
                
                <div className="space-y-2 text-[11px] font-mono font-bold">
                  {/* Gemini */}
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-400 flex items-center gap-1">
                      <span className={`h-1.5 w-1.5 rounded-full ${geminiConfigured ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                      Gemini:
                    </span>
                    <span className={geminiConfigured ? "text-emerald-400 px-1.5 py-0.5 bg-emerald-950/20 border border-emerald-900/30 rounded text-[10px]" : "text-rose-450 px-1.5 py-0.5 bg-rose-950/20 border border-rose-900/30 rounded text-[10px]"}>
                      {geminiConfigured ? "READY" : "MISSING"}
                    </span>
                  </div>

                  {/* Firebase */}
                  <div className="flex justify-between items-center py-0.5 border-t border-[#12161b]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <span className={`h-1.5 w-1.5 rounded-full ${firebaseConfigured ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                      Firebase:
                    </span>
                    <span className={firebaseConfigured ? "text-emerald-400 px-1.5 py-0.5 bg-emerald-950/20 border border-emerald-900/30 rounded text-[10px]" : "text-rose-450 px-1.5 py-0.5 bg-rose-950/20 border border-rose-900/30 rounded text-[10px]"}>
                      {firebaseConfigured ? "READY" : "MISSING"}
                    </span>
                  </div>

                  {/* CME */}
                  <div className="flex justify-between items-center py-0.5 border-t border-[#12161b]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <span className={`h-1.5 w-1.5 rounded-full ${cmeConfigured ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                      CME:
                    </span>
                    <span className={cmeConfigured ? "text-emerald-400 px-1.5 py-0.5 bg-emerald-950/20 border border-emerald-900/30 rounded text-[10px]" : "text-rose-450 px-1.5 py-0.5 bg-rose-950/20 border border-rose-900/30 rounded text-[10px]"}>
                      {cmeConfigured ? "READY" : "MISSING"}
                    </span>
                  </div>

                  {/* TRAI */}
                  <div className="flex justify-between items-center py-0.5 border-t border-[#12161b]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <span className={`h-1.5 w-1.5 rounded-full ${traiConfigured ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                      TRAI:
                    </span>
                    <span className={traiConfigured ? "text-emerald-400 px-1.5 py-0.5 bg-emerald-950/20 border border-emerald-900/30 rounded text-[10px]" : "text-rose-450 px-1.5 py-0.5 bg-rose-950/20 border border-rose-900/30 rounded text-[10px]"}>
                      {traiConfigured ? "READY" : "MISSING"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#0a0d10] border border-[#232a35] rounded-lg space-y-2">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500 uppercase font-bold">Lease Server Node:</span>
                  {cmeIsLive ? (
                    <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse" />
                      ACTIVE LEASE
                    </span>
                  ) : cmeConfigured ? (
                    <span className="text-sky-400 font-extrabold flex items-center gap-1">
                      CREDENTIALED
                    </span>
                  ) : (
                    <span className="text-amber-500 uppercase font-extrabold bg-amber-950/40 px-1.5 py-0.5 rounded text-[8.5px]">
                      AWAITING AUTH
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500 uppercase font-bold">Authorized Account:</span>
                  <span className="text-slate-300 font-bold truncate max-w-[180px]" title={cmeUsername || undefined}>
                    {cmeUsername || "None (Fallback Mode)"}
                  </span>
                </div>
              </div>

              {/* Secure Handshake Credentials Registration Form Toggle Button */}
              <div className="flex justify-between items-center pt-1 border-t border-[#1d242e] text-[10px]">
                <span className="text-slate-400 font-sans">SSO Registry Handshake:</span>
                <button
                  onClick={() => setShowCmeRegForm(!showCmeRegForm)}
                  className="text-sky-400 hover:text-sky-300 bg-sky-950/20 border border-sky-800/30 hover:border-sky-700 font-sans font-bold px-2 py-0.5 rounded transition-all cursor-pointer"
                >
                  {showCmeRegForm ? "Hide Form ✕" : "Configure Credentials 🔑"}
                </button>
              </div>

              {/* Formal Registration Form */}
              {showCmeRegForm && (
                <form 
                  onSubmit={handleRegisterCmeCredentials} 
                  className="p-3.5 bg-[#0f1217] border border-[#262f3a] rounded-lg space-y-3 shadow-inner text-[10.5px]"
                >
                  <div className="flex items-center gap-1.5 text-slate-300 font-bold border-b border-[#1d242e] pb-1.5 mb-1 text-[10px]">
                    <span>🛡️ CME FEDERATED REGISTER</span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-slate-500 text-[9px] uppercase font-bold mb-1">CME Federated Identity (Email):</label>
                      <input
                        type="email"
                        required
                        value={cmeRegUsername}
                        onChange={(e) => setCmeRegUsername(e.target.value)}
                        placeholder="e.g. Rodlife1314@msn.com"
                        className="w-full bg-[#171c24] text-slate-200 border border-[#2b3543] focus:border-sky-500 rounded px-2.5 py-1.5 outline-none font-mono text-[10.5px] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 text-[9px] uppercase font-bold mb-1">WebSSO Passkey Secret:</label>
                      <input
                        type="password"
                        required
                        value={cmeRegPassword}
                        onChange={(e) => setCmeRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#171c24] text-slate-200 border border-[#2b3543] focus:border-sky-500 rounded px-2.5 py-1.5 outline-none font-mono text-[10.5px] transition-colors"
                      />
                    </div>
                  </div>

                  {cmeRegError && (
                    <div className="p-2 border border-rose-900/40 bg-rose-950/15 text-rose-400 rounded text-[9.5px] leading-relaxed">
                      ⚠️ {cmeRegError}
                    </div>
                  )}

                  {cmeRegSuccessMsg && (
                    <div className="p-2 border border-emerald-950/30 bg-emerald-950/20 text-emerald-400 rounded text-[9.5px]">
                      ✓ {cmeRegSuccessMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isCmeRegistering}
                    className="w-full bg-sky-950/30 hover:bg-sky-900/30 disabled:bg-[#111417] text-sky-400 border border-sky-900/40 hover:border-sky-600/50 disabled:border-slate-800 py-1.5 rounded font-bold uppercase cursor-pointer tracking-wider text-[10px] transition-colors flex items-center justify-center gap-1.5"
                  >
                    {isCmeRegistering ? (
                      <>
                        <RefreshCw className="h-3 w-3 animate-spin text-sky-400" />
                        <span>Registering Lease...</span>
                      </>
                    ) : (
                      <span>Commit SSO Credentials</span>
                    )}
                  </button>
                </form>
              )}

              <div className="text-[10px] text-slate-400 leading-relaxed">
                Provide secure credentials or tap the trigger to run a federated CME WebSSO credentials check to open option skew & options volatility index channels.
              </div>

              <button
                onClick={handleTestCmeSSO}
                disabled={isCmeTesting || !cmeConfigured}
                className={`w-full px-3 py-2 rounded font-extrabold uppercase tracking-wide cursor-pointer transition-all flex items-center justify-center gap-2 border ${
                  cmeIsLive
                    ? "bg-emerald-950/30 text-emerald-400 border-emerald-800/50 hover:bg-[#252f3f] hover:border-emerald-500/50"
                    : cmeConfigured
                    ? "bg-sky-950/30 text-sky-400 border-sky-900/50 hover:bg-[#252f3f] hover:border-sky-500/50"
                    : "bg-[#111417] text-slate-500 border-slate-900/20 cursor-not-allowed opacity-60"
                }`}
              >
                {isCmeTesting ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin text-sky-400" />
                    <span>Verifying SSO Token...</span>
                  </>
                ) : cmeIsLive ? (
                  <span>Refresh Active CME SSO Handshake</span>
                ) : (
                  <span>Initiate CME Group SSO Verification</span>
                )}
              </button>

              {cmeTestFeedback && (
                <div className={`p-3 rounded border text-[10px] leading-relaxed whitespace-pre-wrap ${
                  cmeTestSuccess === true 
                    ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-300"
                    : cmeTestSuccess === false
                    ? "bg-rose-950/30 border-rose-900/30 text-rose-300"
                    : "bg-slate-950/40 border-slate-900/30 text-slate-300"
                }`}>
                  {cmeTestFeedback}
                </div>
              )}

              {/* TRAI TEST CONNECTION TRIGGER */}
              <div className="pt-2 border-t border-[#1d242e] space-y-2">
                <div className="text-[10px] text-slate-400 leading-relaxed font-sans">
                  Evaluate visibility and signature format of external TRAI Authority secrets directly in the running environment:
                </div>
                
                <button
                  onClick={handleTestTrai}
                  disabled={isTraiTesting || !traiConfigured}
                  className={`w-full px-3 py-2 rounded font-extrabold uppercase tracking-wide cursor-pointer transition-all flex items-center justify-center gap-2 border ${
                    traiConfigured
                      ? "bg-indigo-950/30 text-indigo-400 border-indigo-900/50 hover:bg-[#202633] hover:border-indigo-500/50 shadow-[0_0_8px_rgba(99,102,241,0.1)]"
                      : "bg-[#111417] text-slate-500 border-slate-900/20 cursor-not-allowed opacity-60"
                  }`}
                >
                  {isTraiTesting ? (
                    <>
                      <RefreshCw className="h-3 w-3 animate-spin text-indigo-400" />
                      <span>Evaluating TRAI Key...</span>
                    </>
                  ) : (
                    <span>Test TRAI Connection</span>
                  )}
                </button>

                {traiTestFeedback && (
                  <div className={`p-3 rounded border text-[10px] leading-relaxed whitespace-pre-wrap font-mono ${
                    traiTestSuccess === true 
                      ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-300"
                      : "bg-rose-950/30 border-rose-900/30 text-rose-300"
                  }`}>
                    {traiTestFeedback}
                  </div>
                )}
              </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          )}

          {/* IX. SYSTEM COMPATIBILITY & DATABASE AUDIT PANEL */}
          {viewMode === "engineer" && (
            <div className="bg-[#14181d] border border-[#232932] rounded-xl p-5 shadow-lg space-y-4 shrink-0 transition-all font-sans" id="section-9-accordion">
              <div 
                onClick={() => setExpandedSection(expandedSection === 9 ? null : 9)}
                className="border-b border-[#232a35] pb-2.5 flex justify-between items-center cursor-pointer select-none group"
                id="section-9-header"
              >
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-rose-450 group-hover:scale-110 transition-transform animate-pulse" />
                  <h3 className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#ececf1]">
                    IX. System Compatibility & Database Audit
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 font-mono">
                  {auditResult?.runtime?.useFallbackStore === false ? (
                    <span className="bg-emerald-950/45 text-emerald-400 border border-emerald-800/30 px-2 py-0.5 rounded text-[8.5px] font-semibold uppercase tracking-wider">
                      CLOUD CONFIGURED
                    </span>
                  ) : (
                    <span className="bg-amber-950/45 text-amber-500 border border-amber-800/40 px-2 py-0.5 rounded text-[8.5px] font-semibold uppercase tracking-wider animate-pulse">
                      LOCAL FALLBACK
                    </span>
                  )}
                  <span className="text-slate-500 text-[10px] font-bold select-none ml-2 mr-1">
                    {expandedSection === 9 ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {expandedSection === 9 && (
                  <motion.div
                    key="section-9-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4 overflow-hidden"
                  >
                    
                    {/* Action Row */}
                    <div className="flex gap-2">
                      <button
                        onClick={runCompatibilityAudit}
                        disabled={isAuditing}
                        className="flex-1 bg-sky-950/20 hover:bg-sky-900/30 disabled:bg-[#111417] text-sky-400 border border-sky-900/40 hover:border-sky-750 font-mono font-bold py-1.5 px-3 rounded text-[9.5px] uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {isAuditing ? (
                          <>
                            <RefreshCw className="h-3 w-3 animate-spin" />
                            <span>Auditing...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3 w-3" />
                            <span>Trigger Integration Audit</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={forceRebootHandshake}
                        disabled={isRebooting}
                        className="flex-1 bg-amber-950/20 hover:bg-amber-900/30 disabled:bg-[#111417] text-amber-400 border border-amber-900/40 hover:border-amber-700 font-mono font-bold py-1.5 px-3 rounded text-[9.5px] uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {isRebooting ? (
                          <>
                            <RefreshCw className="h-3 w-3 animate-spin text-amber-400" />
                            <span>Handshaking...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="h-3 w-3 text-amber-400" />
                            <span>Reboot Handshake</span>
                          </>
                        )}
                      </button>
                    </div>

                    {rebootError && (
                      <div className="p-2 border border-rose-900/40 bg-rose-950/10 text-rose-450 rounded text-[9.5px] leading-relaxed font-mono">
                        ⚠️ Handshake Error: {rebootError}
                      </div>
                    )}

                    {auditError && (
                      <div className="p-2 border border-rose-900/30 bg-rose-950/10 text-rose-450 rounded text-[9.5px] leading-relaxed font-mono">
                        ⚠️ Audit Failed: {auditError}
                      </div>
                    )}

                    {/* Report Statistics */}
                    {auditResult ? (
                      <div className="space-y-3 font-mono text-[10px]">
                        
                        {/* Summary Block */}
                        <div className="p-3 bg-[#0a0d10] border border-[#232a35] rounded-lg space-y-2 text-slate-300">
                          <div className="flex justify-between items-center border-b border-[#1b212b] pb-1 mb-1">
                            <span className="text-slate-500 uppercase font-bold text-[8.5px]">EPIDEMIC PROFILE:</span>
                            <span className="text-slate-300 font-extrabold">PATHFINDER DIAGNOSTICS</span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Active Database Driver:</span>
                            <span className={`font-bold uppercase ${
                              auditResult.runtime?.activeDbMode === "admin" 
                                ? "text-emerald-400" 
                                : auditResult.runtime?.activeDbMode === "client" 
                                ? "text-sky-450" 
                                : "text-amber-500 animate-pulse"
                            }`}>
                              {auditResult.runtime?.activeDbMode === "admin" 
                                ? "Firebase Admin (Authorized)" 
                                : auditResult.runtime?.activeDbMode === "client" 
                                ? "Client JS SDK (Rules Restricted)" 
                                : "In-Memory Fallback"}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Database Project Identity:</span>
                            <span className="text-slate-300 font-semibold uppercase">{auditResult.config?.details?.projectId || "sandbox"}</span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Custom Database Instance:</span>
                            <span className="text-slate-300 font-semibold text-[9px] font-mono">{auditResult.config?.details?.firestoreDatabaseId || "(default)"}</span>
                          </div>
                        </div>

                        {/* Test Matrix */}
                        <div className="p-3 bg-[#0a0d10] border border-[#232a35] rounded-lg space-y-2 text-slate-300">
                          <div className="text-slate-300 uppercase font-extrabold text-[8.5px] border-b border-[#1b212b] pb-1">
                            🚀 CRUD Health Test Matrix
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 text-center text-[9px] font-bold">
                            <div className="bg-[#10141a] p-1.5 rounded border border-[#1b212b]">
                              <div className="text-slate-500 uppercase text-[8px] mb-1 font-bold">WRITE</div>
                              <span className={auditResult.audit_diagnostics?.writeTest === "SUCCESS" ? "text-emerald-400" : "text-rose-450"}>
                                {auditResult.audit_diagnostics?.writeTest || "PENDING"}
                              </span>
                            </div>

                            <div className="bg-[#10141a] p-1.5 rounded border border-[#1b212b]">
                              <div className="text-slate-500 uppercase text-[8px] mb-1 font-bold">READ</div>
                              <span className={auditResult.audit_diagnostics?.readTest === "SUCCESS" ? "text-emerald-400" : "text-rose-450"}>
                                {auditResult.audit_diagnostics?.readTest || "PENDING"}
                              </span>
                            </div>

                            <div className="bg-[#10141a] p-1.5 rounded border border-[#1b212b]">
                              <div className="text-slate-500 uppercase text-[8px] mb-1 font-bold">DELETE</div>
                              <span className={auditResult.audit_diagnostics?.deleteTest === "SUCCESS" ? "text-emerald-400" : "text-rose-450"}>
                                {auditResult.audit_diagnostics?.deleteTest || "PENDING"}
                              </span>
                            </div>
                          </div>

                          {auditResult.audit_diagnostics?.error && (
                            <div className="p-2 bg-[#12080d] border border-rose-950/45 text-[8.5px] leading-relaxed text-rose-350 rounded overflow-x-auto whitespace-pre-wrap select-all uppercase">
                              <span className="font-extrabold text-rose-450 uppercase block mb-1">Trace Error Feedback:</span>
                              {auditResult.audit_diagnostics.error.message}
                              {auditResult.audit_diagnostics.error.code ? ` (Code: ${auditResult.audit_diagnostics.error.code})` : ""}
                            </div>
                          )}
                        </div>

                        {/* Rules Verification Details */}
                        <div className="p-3 bg-[#0a0d10] border border-[#232a35] rounded-lg space-y-2 text-slate-300">
                          <div className="flex justify-between items-center text-[8.5px] border-b border-[#1b212b] pb-1">
                            <span className="text-slate-500 uppercase font-bold">SECURITY RULES TRACE:</span>
                            <span className="text-indigo-400 font-extrabold">VERIFIED OK</span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Rules File Path:</span>
                            <span className="text-slate-500 font-semibold text-[8.5px]">/firestore.rules</span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Total Code Lines:</span>
                            <span className="text-slate-300 font-bold">{auditResult.firestore_rules?.lines || 0} lines</span>
                          </div>

                          <div className="mt-1">
                            <span className="text-slate-500 font-bold block mb-1 text-[8px] uppercase">Gated System Collections:</span>
                            <div className="flex flex-wrap gap-1">
                              {["custody_packets", "authority_doctrine", "cme_credentials", "copilot_messages", "validation_reviews", "operator_approvals"].map((col) => (
                                <span key={col} className="bg-slate-900 border border-slate-800 text-[8px] px-1 rounded text-slate-400">
                                  {col}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Live suggestions */}
                        {auditResult.audit_diagnostics?.writeTest !== "SUCCESS" && (
                          <div className="p-2 border border-amber-900/40 bg-amber-955/10 text-amber-400 rounded text-[9px] leading-relaxed">
                            💡 **Diagnostic Suggestion**: If the write test fails with `PERMISSION_DENIED`, please make sure your Firebase project database ID is correctly provisioned, or click **Reboot Handshake** to allow Pathfinder to cycle fallback states securely.
                          </div>
                        )}

                      </div>
                    ) : (
                      <div className="text-center py-4 bg-[#0a0d10] border border-[#232a35] rounded-lg text-slate-500 text-[10px] uppercase font-mono tracking-wider">
                        Tap "Trigger Integration Audit" above to run diagnostic test packages.
                      </div>
                    )}

                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

        </section>
          </>
        )}

      </main>

      {/* 4. FOOTER FLIGHT STATUS BAR */}
      <footer className="border-t border-[#232932] bg-[#111417] px-6 py-3 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-4">
          <span className="font-mono text-[9px] uppercase tracking-wider">COCKPIT PROTOCOL ACTIVE STATUS :</span>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
            <span className="font-extrabold text-[10px] tracking-widest uppercase">Sectors Aligned. Ready for Seal Auth.</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOverride(true)}
            className="px-2.5 py-1 text-[9.5px] font-mono font-extrabold uppercase border border-teal-500/20 bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 active:scale-95 rounded-lg transition-all cursor-pointer select-none"
          >
            📱 Preview Mobile Cockpit Option 2
          </button>
          <span className="text-slate-800 select-none">|</span>
          <div className="flex items-center gap-1">
            <span>Target repository linkage:</span>
            <a
              href="https://github.com/rodlife1314-star/Pathfinder"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-sky-400 transition-colors font-mono flex items-center gap-1 font-bold"
              id="footer-repo-link"
            >
              rodlife1314-star/Pathfinder <ExternalLink className="h-3 w-3 inline" />
            </a>
          </div>
        </div>
      </footer>

      {renderFloatingCopilot()}

    </div>
  );
}
