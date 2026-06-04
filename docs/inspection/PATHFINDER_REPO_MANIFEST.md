# Pathfinder Repository Inspection Manifest

## I. Overview & Chain of Custody Audit
**Date of Audit**: June 4, 2026
**Lead Inspector/Persona**: Pathfinder AI Intelligence (Routing Layer: Crystal Bridge)
**Audit Target**: `rodlife1314-star/Pathfinder` repository

---

## II. Repository Tree Map
Below is the top-level repository map of Pathfinder, detailing critical subdirectories and configuration files up to depth 4 (excluding `node_modules`, `.git`, `dist`, etc.):

```
.
├── CONFIGURATION_LEDGER.json
├── DEPLOYMENT_NOTES.md
├── STRUCTURED_INGESTION.md
├── Dockerfile
├── Dockerfile.export
├── cloudbuild.yaml
├── cloudbuild.export.yaml
├── firestore.rules
├── firebase.json
├── firebase-applet-config.json
├── firebase-blueprint.json
├── index.html
├── metadata.json
├── package.json
├── package-lock.json
├── server.ts
├── tsconfig.json
├── env.example
├── config/
│   ├── model_profile_template.json
│   ├── quantization_profile_template.json
│   └── runtime_config_template.json
├── deploy/
│   ├── entrypoint.sh
│   └── github_and_cloudrun_commands.sh
├── external/
│   └── TensorRT-Edge-LLM/
├── schemas/
│   ├── deployment_manifest_schema.json
│   ├── inference_schema.json
│   └── model_manifest_schema.json
├── src/
│   ├── App.tsx
│   ├── crystal_bridge.ts
│   ├── index.css
│   ├── main.tsx
│   ├── types.ts
│   └── jemma_tenzor/
│       ├── ARCHITECTURE_MAP.md
│       ├── __init__.py
│       ├── validation/
│       │   ├── __init__.py
│       │   ├── dependency_validation.py
│       │   ├── environment_validation.py
│       │   ├── gpu_availability_validation.py
│       │   └── model_manifest_validation.py
│       ├── docs/
│       ├── examples/
│       ├── inference/
│       ├── python/
│       ├── runtime/
│       └── scripts/
└── tests/
    ├── test_allocator_boundary.py
    ├── test_gateway_route.py
    ├── test_mock_inference.py
    └── test_tokenizer_reference.py
```

---

## III. Runtime Map
Pathfinder operates as an isolated full-stack system dividing intelligence routing from serverless weight compilation and GPU runtime clusters.

### 1. Intelligence Portal & Control Surface
* **Path**: `/` (Root directory & `/src`)
* **Purpose**: Hosts the primary operator dashboard, active custody ledger, co-pilot interface, and governance doctrine. Handles authentication triggers, audit logs, and coordinates Crystal Bridge contract assemblies.
* **Framework/Language**: TypeScript (React v18 + Vite, Tailwind CSS v4)
* **Entry Point**: `/index.html` -> `/src/main.tsx` -> `/src/App.tsx`
* **Build Command**: `vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs`
* **Dev Command**: `tsx server.ts`
* **Deploy Command**: `gcloud run deploy` (configured on Cloud Run via GCP Cloud Build YAML triggers)

### 2. Backend Orchestrator & Database Proxy
* **Path**: `/server.ts`
* **Purpose**: Coordinates full-blown persistent data streams using Firebase Firestore (using both Admin & Web client modules), supports instant fallback to fallback in-memory stores, manages API triggers, provides grounding logs, and processes CME Open Interest SSO credential mappings.
* **Framework/Language**: TypeScript (Express Server)
* **Entry Point**: `/server.ts`
* **Start Command**: `node dist/server.cjs`

### 3. Serverless GPU Compiler Cluster (Pathfinder-Compute-Runtime)
* **Path**: `/deploy/` and `/config/`
* **Purpose**: Handles on-demand model compilation for TensorRT-LLM networks inside custom container images with serverless triggers.
* **Language/Framework**: Docker, Bash, Python v3
* **Deploy Command**: `bash deploy/github_and_cloudrun_commands.sh`

---

## IV. UI Tab Surface Map
The Pathfinder control portal leverages a selective user mode architecture with rich telemetry.

| Label | Component Name | Source File Path | Action Buttons | Action Target / Mutation Type |
|---|---|---|---|---|
| **👨‍✈️ OPERATOR** | Web Dashboard Mode | `/src/App.tsx` | Sliders, Run Safety Audits, Approve, Seal Packet | Changes state, writes verification reviews, mutates packet statuses in database. |
| **📐 ARCHITECT** | System Architecture & Registries | `/src/App.tsx` | View Toggle, Ingress Wiring button | Changes search state, triggers immediate URL wiring to Custody intake. |
| **🔧 ENGINEER** | Low-level Compilation Terminal | `/src/App.tsx` | Copy Specification, Focus Area buttons | Modifies the active config tab view, writes localized diagnostic workspace logs. |
| **📂 ARCHIVE v1** | Historical Audit Catalog | `/src/App.tsx` | Search, Lineage Graph selector | Re-focuses current inspector active packet, no API state mutators. |

---

## V. API Endpoint Map
All backend routes are declared in `/server.ts` and leverage robust validation hooks.

| Method | Route | Source File | Handler Name | Purpose | Mutates State |
|---|---|---|---|---|---|
| **GET** | `/api/health` | `server.ts` | Inline handler | Returns online status, runtime type, active targets. | No |
| **GET** | `/api/packets` | `server.ts` | `getPacketsList()` | Scans active custody packets indexes (Firestore or memory). | No |
| **GET** | `/api/packets/:packetId` | `server.ts` | Inline handler | Returns specific details of a requested custody packet object. | No |
| **GET** | `/api/packets/:packetId/lineage` | `server.ts` | Inline handler | Maps full structural parent-child ancestry lines. | No |
| **GET** | `/api/packets/:packetId/export` | `server.ts` | Inline handler | Compiles findings of packet into Markdown or JSON outputs. | No |
| **GET** | `/api/doctrine` | `server.ts` | `getDoctrineList()` | Scans primary administrative doctrine authorities. | No |
| **GET** | `/api/credentials/status` | `server.ts` | Inline handler | Checks connection verification across providers (CME/TRAI). | No |
| **GET** | `/api/audit` | `server.ts` | Inline handler | Pulls system stats for the Reality Integrity Audit grid. | No |
| **GET** | `/api/copilot/messages` | `server.ts` | `getCopilotMessages()` | Pulls historical operator-copilot dialog logs. | No |
| **POST** | `/api/packets` | `server.ts` | Inline handler | Standard ingest for new Challenge, Claim, or Query items. | **Yes** (Registers packet) |
| **POST** | `/api/packets/begin-validation` | `server.ts` | Inline handler | Transitions initialized packet to candidate registration status. | **Yes** (Advances packet state) |
| **POST** | `/api/packets/verdict` | `server.ts` | `saveValidationReview()` | Applies Jemma/RedTeam verification signatures on the ledger. | **Yes** (Adds review record) |
| **POST** | `/api/packets/approve` | `server.ts` | `saveOperatorApproval()` | Stamps operator vetting clear-pass directly. | **Yes** (Overwrites approval gate) |
| **POST** | `/api/packets/seal` | `server.ts` | Inline handler | Digitally seals evidence payload before final build. | **Yes** (Locks custody status) |
| **POST** | `/api/packets/deploy` | `server.ts` | Inline handler | Launches container synthesis or runs simulation pipelines. | **Yes** |
| **POST** | `/api/packets/resolve-ambiguity` | `server.ts` | Inline handler | Manually unlocks low-confidence bounds. | **Yes** |
| **POST** | `/api/packets/toggle-ambiguity` | `server.ts` | Inline handler | Updates specific ambiguity terms locks directly. | **Yes** |
| **POST** | `/api/copilot` | `server.ts` | Inline handler | Processes operators chat input via lazy initialized Gemini. | **Yes** (Stores message history) |
| **POST** | `/api/doctrine` | `server.ts` | `saveDoctrineAuthority()` | Modifies or appends specific routing authority profiles. | **Yes** (Modifies collections) |
| **POST** | `/api/credentials/cme` | `server.ts` | `saveCmeCredentials()` | Securely registers CME options portal access info. | **Yes** |
| **POST** | `/api/credentials/cme/test` | `server.ts` | Inline handler | Verifies CME SSO connection handshake sequences. | **Yes** (Modifies active tokens) |
| **POST** | `/api/credentials/trai/test` | `server.ts` | Inline handler | Audits TRAI validation connection loops. | No |
| **DELETE** | `/api/copilot/messages` | `server.ts` | `clearCopilotMessages()` | Resets active dialog channels between operator and copilot. | **Yes** |

---

## VI. Pathfinder Domain Mapping
Here are the essential file structures and code locations responsible for implementing Pathfinder's core intellectual features.

### 1. Custody Packet Ledger
* **Locations**: `/src/types.ts` (lines 49-109), `/server.ts` (lines 581-641), and `/src/App.tsx` (lines 6004-6200).
* **Details**: Encapsulates state tracking, source identifiers, raw prompts, confidence variables, and parent-child linkage. Maintains a transition history array containing audit event signatures.

### 2. Sourcing Authority Registries & Governance Doctrine
* **Locations**: `/server.ts` (lines 226-267, lines 771-814) and `/src/App.tsx` (lines 7990-8150).
* **Details**: Implements sovereign data providers (FRED, BLS, SEC, open NVIDIA Nim Registries) defining classification rules, licensing bounds, and automatic ingress permissions.

### 3. Crystal Bridge Connector Protocol
* **Locations**: `/src/crystal_bridge.ts` and `/src/App.tsx` (lines 6976-7110).
* **Details**: Decouples intelligence formulation from backend builders. Compiles abstract Jemma findings into deterministic `RuntimeHandoffContract` modules, complete with file checksums, memory parameters, and operator seals.

### 4. Pathfinder Copilot
* **Locations**: `/server.ts` (lines 1425-1440, lines 1920-2100) and `/src/App.tsx` (lines 7800-7980).
* **Details**: Operator AI assistance leveraging the `@google/genai` TypeScript SDK on the server, grounded in the status of active custody packets.

### 5. Pluggable Reasoners & Core Diagnostics
* **Locations**: `/src/crystal_bridge.ts` (lines 286-402) and `/src/App.tsx` (lines 7113-7250).
* **Details**: Houses the `IReasoner` interface and multiple implementations (ClaudeStyle, Qwen, DeepSeek, Gemini, Local) containing logic for mathematical analysis, gap scanning, and alternative proposals.

### 6. Ambiguity Locks & Confidence Threshold Guards
* **Locations**: `/server.ts` (lines 175-180, lines 2844-2900) and `/src/App.tsx` (lines 4630-4750).
* **Details**: Active protection policy locking packets with confidence scores < 90% or encountering unrecognized data dictionaries, requiring explicit Operator override.

### 7. Reality Integrity Auditing
* **Locations**: `/server.ts` (lines 2183-2285).
* **Details**: Live administrative diagnostic monitoring consistency indexes across databases, transaction counters, network response rates, and reporting discrepancy errors.

---

## VII. Current Red Team Gap Analysis
A comprehensive audit of Red Team mechanics reveals the following:

1. **Is Red Team a real mounted UI tab?**
   * **No**. There is no independent top-level view tab dedicated exclusively to Red Team operations. The Red Team interface exists solely within the sidebar packet inspector details (lines 4423-4475 in `/src/App.tsx`) when reviewing an individual custody packet.
2. **Is there a RedTeamTab component?**
   * **No**. There is no standalone `RedTeamTab.tsx` or nested `RedTeamTab` functional component in `/src/App.tsx`.
3. **Is there an API endpoint for running Red Team validation?**
   * **No dedicated endpoint**. The general `/api/packets/verdict` endpoint is called which registers Jemma or Red Team reviews generically via `reviewType: "RED_TEAM"` (lines 2650-2710 in `server.ts`).
4. **Is there an API endpoint for marking Red Team VERIFIED?**
   * **No separate endpoint**. The interface writes a verdict directly to `/api/packets/verdict` with a payload of `{ verdict: "CLEARED", reviewer: "Operator Red Team Core", reviewType: "RED_TEAM" }`.
5. **Where is `CLEARED` (UNVERIFIED) generated?**
   * Pre-packaged fallback packets (`PKT-001`, `PKT-520`, `PKT-680`, `PKT-788`) inside `server.ts` have `red_team_verdict: "CLEARED"` pre-populated.
   * New user-created intake packets are initialized with `red_team_verdict: "PENDING"`. Clicking **"RUN RED TEAM CHECK"** on the UI sidebar manually forces the state to `CLEARED` by issuing a verdict post request.
6. **What exact files need changing to make Red Team operational in an enterprise environment?**
   * `src/App.tsx`: Needs a dedicated view state and a custom `RedTeamTab` dashboard to visualize vulnerability counts, threat profiles, and penetration vectors across multiple packets.
   * `server.ts`: Needs a custom `/api/audit/red-team/scan` endpoint integrating semantic threat analysis (SQL injection, parameter tampering, and adversarial formatting screeners) using active Google GenAI safety model channels instead of simple mock overrides.

---

## VIII. Evidence Citations Reference
* **Custody Packet Fields**: `/src/types.ts` lines 49-109
* **Fallbacks Memory Ledger Database**: `/server.ts` lines 21-270
* **Doctrine Registries**: `/server.ts` lines 226-267 and `/src/App.tsx` lines 7991-8150
* **API Endpoints Definitions**: `/server.ts` lines 1269 to 2921 (Vite/Express boundary line 2970)
* **Crystal Interface Compilation & Adapter Definitions**: `/src/crystal_bridge.ts` lines 10-161
* **Reasoning Models Definitions**: `/src/crystal_bridge.ts` lines 286-402
* **Red Team Click Override Handlers**: `/src/App.tsx` lines 4423-4475
* **Reality Audits Controller**: `/server.ts` lines 2183-2285

---

## IX. Implementation Roadmap Recommendations

### 1. Minimal Safe Patch (Immediate)
Add an independent secondary toggle under the existing **"Operator Investigation Journal" (Section V)** or the Sidebar details in `/src/App.tsx` to automatically run programmatic regex-based keyword safety checks (looking for terms like `DROP TABLE`, `;`, `delete`, `http://`) before registering Red Team clearance, saving verification logs.

### 2. Medium Patch
Extract all inline Red Team validation blocks inside `/src/App.tsx` into a modular `src/components/RedTeamConsole.tsx` dashboard UI component. Wire this new component to are dedicated `/api/packets/red-team/screener` endpoint inside `server.ts` that issues specialized security verdicts based on model safety evaluations.

### 3. Full Architecture Patch
Mount a dedicated **🛡️ RED TEAM** workspace tab parallel to OPERATOR and ARCHITECT. Design an active attack simulator engine in a python runtime module within `/src/jemma_tenzor/validation` to perform payload injections against candidates URLs, compiling formal vulnerability logs to Firestore.
