# ResQSync // Command

> **Offline-first disaster resource coordination focused initially on ambulance allocation.**  
> *Core Principle:* One resource. One shared state. Every responder.

---

## Overview

ResQSync is an operational command and dispatch platform designed for high-consequence disaster response environments. When cellular connectivity and regional power infrastructure degrade, frontline responders continue to claim, dispatch, and track critical resources (such as ambulances, rescue teams, and supplies) locally using offline-first edge architecture.

When network connectivity intermittently recovers, local actions are synchronized deterministically with the authoritative central store in Amazon DynamoDB.

### Authoritative Architecture Rule

> **DynamoDB is the authoritative resource state.**  
> Offline browser and mobile state is evidence of responder intent, but **never** globally authoritative. Competing claims across disconnected network partitions are surfaced as deterministic conflicts and resolved with complete evidence preservation.

---

## Repository Structure

```
resqsync/
├── apps/
│   └── web/                   # React + TypeScript + Vite + Tailwind + MapLibre + Dexie
├── services/
│   ├── api/                   # Core AWS Lambda handlers (claims, sync, resources, conflicts)
│   ├── ai-adapter/            # SageMaker & AI allocation adapter skeleton
│   ├── channel-adapter/       # Multi-channel adapter (SMS, Web, API)
│   ├── sync-worker/           # Asynchronous reconciliation worker
│   ├── replay-control-plane/  # Incident replay and audit service
│   └── simulation-gateway/    # Disaster load & network partition simulator
├── packages/
│   ├── domain/                # Pure deterministic domain models & state machine
│   ├── contracts/             # Strongly typed API contracts & Zod schemas
│   ├── ui/                    # Reusable accessible UI components & state badges
│   └── offline/               # Dexie IndexedDB schemas & sync queues
├── infra/
│   └── cdk/                   # AWS CDK TypeScript infrastructure (11 isolated stacks)
├── data/
│   ├── dynamodb/              # Single-table schema definitions & demo seeds
│   ├── rds/                   # Relational reporting schemas
│   ├── aurora/                # Global Aurora cluster definitions
│   └── s3/                    # Evidence & audit storage bucket specifications
├── tests/
│   ├── unit/                  # Vitest state machine, idempotency, & contract tests
│   ├── integration/           # API and DynamoDB reconciliation tests
│   ├── e2e/                   # Playwright end-to-end smoke & offline tests
│   └── chaos/                 # Partition, stale version, and conflict tests
├── docs/
│   ├── architecture/          # Architecture RFCs, DynamoDB schema, state machine
│   ├── api/                   # REST API specification & contract documentation
│   └── demo/                  # Local demo execution & triage guide
├── .github/
│   └── workflows/             # CI/CD pipelines
├── README.md
├── LICENSE
├── .gitignore
└── package.json
```

---

## State Machine Overview

### Resource Lifecycle

```
AVAILABLE
   │
   ├─► Online Claim ────► CLAIMED ──► DISPATCHED ──► IN_USE ──► AVAILABLE
   │
   └─► Offline Claim ───► PENDING_SYNC
                               │
                               ├─► ACCEPTED ────► CLAIMED
                               │
                               └─► CONFLICT ────► HUMAN_REVIEW ────► RESOLVED
```

### Deterministic Rules

1. **Pure Domain Logic**: All state transitions (`canClaim`, `transitionResourceState`, `resolveConflict`) are pure functions free of side-effects or I/O.
2. **Idempotency**: Every offline event carries a unique `client_event_id`. Duplicate submissions are idempotent and never double-allocate resources.
3. **Evidence Preservation**: When conflicts occur, neither claim is discarded. Competing claims are stored in a dedicated `Conflict` entity with timestamps, actor IDs, and channel metadata.
4. **No Timestamp Dominance**: Client timestamps are recorded strictly as evidence/context, never as proof of global ordering.

---

## Quickstart

### Prerequisites
- Node.js >= 20
- npm >= 10

### Installation

```bash
# Install all dependencies across the monorepo
npm install

# Run typecheck across all packages, apps, services, and infra
npm run typecheck

# Run linter
npm run lint

# Run unit tests (Vitest)
npm run test:unit

# Run Playwright E2E smoke tests
npm run test:e2e

# Synthesize AWS CDK Stacks
npm run cdk:synth

# Launch Web Application locally
npm run web:dev
```

---

## Milestone Roadmap

- [x] **Milestone 1**: Establish ResQSync project foundation (monorepo, domain, contracts, web shell, Lambda handlers, CDK multi-stack, tests, docs).
- [ ] **Milestone 2**: Authoritative resource state machine (deterministic pure functions, conflict models, state badges).
- [ ] **Milestone 3**: Authoritative DynamoDB claim API (DynamoDB conditional updates, API Gateway, seed data, real frontend integration).
- [ ] **Milestone 4**: Cognito authentication & role authorization (RESPONDER, DISPATCHER, SUPERVISOR, ADMINISTRATOR).
- [ ] **Milestone 5**: Durable offline-first synchronization (IndexedDB, Dexie.js, Service Worker, Sync Center, network partition tests).

---

## License

Apache License 2.0. See [LICENSE](LICENSE) for details.
