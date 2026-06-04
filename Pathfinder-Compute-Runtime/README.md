# Pathfinder Compute Runtime (Separated Repository Module)
**Autonomous Hardware Orchestration, Model Compiling, and GPU Serverless Engine Targets**

This directory acts as the fully isolated, preserved home for all **Pathfinder Runtime / TensorRT-LLM** deployment machinery and high-performance computing configurations. By establishing this clean-room isolation layer, **Pathfinder Core** remains lightweight, purely intelligence-focused, and highly publishable, while keeping the full dynamic GPU deployment suite for production scaling.

---

## 🗺️ Architectural Separation Overview

Our system is divided into three distinct zones:

```
                  ┌─────────────────────────────────────┐
                  │        PATHFINDER CORE (SPA)        │
                  │   Data Custody, Audits & Ledger     │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │           CRYSTAL BRIDGE            │
                  │ IRuntimeAdapter / Handoff Contract  │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │     PATHFINDER COMPUTE RUNTIME      │
                  │ CUDA 12.4, TensorRT, serverless GPU │
                  └─────────────────────────────────────┘
```

---

## 🏷️ Identified Domains & Preserved Assets

The following files have been audited and logically assigned to the **Pathfinder Compute Runtime** domain:

### 1. Deployment Pipelines
- **`cloudbuild.yaml`**: Preserved compilation pipeline initiating parallel TRT weight parsing on high-performance machines.
- **`cloudbuild.export.yaml`**: CPU-safe pipeline testing dry-run conversion triggers.
- **`Dockerfile`**: Native CUDA-12.4 runtime container hosting Triton/FastAPI option skew inference servers.
- **`Dockerfile.export`**: Model verification and script compilation check environments.

### 2. Upstream References
- **`/external/TensorRT-Edge-LLM/`**: The complete upstream TensorRT-LLM baseline library package, preserved safely down to custom GEMM configurations, plugins, benchmarks, and tokenizer formats.
- **`requirements.txt`**: Complete python ecosystem requirements for high-performance execution.

### 3. Orchestrated Subsystems (`/src/jemma_tenzor/` Core)
- **`runtime/`**: CUDA memory models (`engine_manager.py` & `vram_allocator.py`).
- **`inference/`**: Live stream connectors (`server_gateway.py` & `streaming_client.py`).
- **`validation/`**: Multi-layered checks matching model parameters offline.

### 4. Setup Scripts
- **`/deploy/entrypoint.sh`**: Container execution controller.
- **`/deploy/github_and_cloudrun_commands.sh`**: Direct trigger setup CLI.

---

## 💎 Crystal Bridge Integration

Communication from **Pathfinder Core** is mapped strictly through abstract adapters rather than hardcoded references.

### 🔌 Adapter interface (`/src/crystal_bridge.ts`)
```typescript
export interface IRuntimeAdapter {
  id: string;
  name: string;
  supportedHardware: string[];
  compileHandoffContract(packet: CustodyPacket, candidates: DatasetCandidate[]): RuntimeHandoffContract;
  dispatchHandoff(contract: RuntimeHandoffContract): Promise<any>;
}
```

This guarantees Pathfinder is 100% portable. If you deploy Pathfinder without GPU resources, the system degrades elegantly to **RESTRICTED LOCAL / FALLBACK** mode without causing breaking import errors or runtime crashes.
