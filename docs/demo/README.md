# ResQSync // Demonstration & Verification Guide

## Local Triage & Offline Simulation Walkthrough

This guide walks through verifying the core value proposition of ResQSync:
**Offline-first disaster resource coordination with deterministic DynamoDB reconciliation.**

---

## 1. Local Environment Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run All Monorepo Checks**:
   ```bash
   npm run typecheck
   npm run lint
   npm run test:unit
   ```

3. **Start the Web Application**:
   ```bash
   npm run web:dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 2. Demonstration Scenarios

### Scenario A: Online Claim (Happy Path)
1. View available ambulances in the registry (e.g., `AMB-A12`).
2. Click **Claim Resource**.
3. State transitions immediately:
   `AVAILABLE` → `CLAIMED` (Version increments from 1 to 2).

### Scenario B: Offline Partition & Delayed Synchronization
1. Disconnect network in browser DevTools (**Network tab → Offline**).
2. UI header updates to display **`OFFLINE`** system banner with warning icon.
3. Frontline responder initiates claim on `AMB-A07`.
4. State transitions locally to **`PENDING_SYNC`** with amber status badge.
5. Notice that the UI explicitly indicates *Last Known State* and *Pending Synchronization* — never falsely claiming global authority.
6. Refresh or restart the browser. Notice the claim event remains preserved in IndexedDB via Dexie.
7. Re-enable network in browser DevTools (**Online**).
8. System status switches to **`SYNCING`**, submits event batch to `/sync`, receives **`ACCEPTED`**, and updates status badge to **`CLAIMED` (Synchronized)**.

### Scenario C: Concurrent Partition Conflict & Evidence Preservation
1. Two responders in separate offline zones claim `AMB-A19` while both are offline.
2. Responder 1 reconnects first. Server updates `AMB-A19` to `CLAIMED` (Version 2).
3. Responder 2 reconnects later. Server detects version mismatch and competing claim.
4. Server does **NOT** silently overwrite Responder 1, nor does it silently discard Responder 2's submission.
5. Server creates a `Conflict` record (`CONF-xxxx`), retaining both responders' timestamps, device IDs, and rationale.
6. Resource escalates to **`HUMAN_REVIEW`**.
7. Supervisor navigates to the **Conflicts** tab, reviews side-by-side evidence, and resolves the conflict with formal audit logging.
