# ResQSync // Command — Official 3-Minute Video Demo Script

> **Video Duration:** Exactly 03:00  
> **Target Audience:** Hackathon Judges, Disaster Response Coordinators, Cloud Architects  
> **Key Message:** One resource. One shared state. Every responder. Zero silent overwrites. Zero double allocations.

---

## Script & Production Breakdown

### [00:00 - 00:30] — ACT I: The Crisis & The Split-Brain Dilemma

**Visual on Screen:**
- Dramatic opening shot of natural catastrophe satellite imagery, transitioning immediately to the ResQSync Command Center UI (`http://localhost:5173`).
- Camera zooms in on Ambulance Unit `AMB-A12` (`Medic-12`) displayed as `AVAILABLE` (Version: 1) on the MapLibre incident board.

**Presenter Voiceover:**
> *"When a hurricane or earthquake obliterates regional communications, emergency response breaks down in one fatal way: the Split-Brain Disaster Trap.*  
> *Two disconnected dispatchers see the same ambulance available. Both claim it for separate critical emergencies.  
> Traditional apps either freeze completely when offline, or use naive 'Last-Write-Wins' that silently overwrites one patient's ambulance when reconnected, leaving victims stranded.*  
> *This is ResQSync // Command: an authoritative, offline-first coordination engine built on 22 AWS services that guarantees ZERO active double allocations and 100% competing evidence preservation."*

---

### [00:30 - 01:15] — ACT II: The Signature Disaster Scenario

**Visual on Screen:**
- Presenter clicks the **"(toggle)"** button next to **Network: Online** in the top navigation bar.
- Badge instantly shifts to amber: `Offline (Local buffering active)`.
- Notice the blue banner: *"Offline browser state is never globally authoritative. Local claims are preserved in IndexedDB as verifiable evidence with client_event_id."*
- Presenter acts as **Responder Alpha**:
  - Clicks unit `AMB-A12` (`Medic-12`).
  - Unit badge transitions to purple: `Pending Sync` (v1).
  - Switches to **Sync Center** tab: shows `evt-alpha-9901` securely buffered in IndexedDB with cryptographic idempotency key.
- Simultaneously, presenter opens a second window representing **HQ Dispatcher Bravo** (Online):
  - Bravo claims `AMB-A12` online via Amazon API Gateway.
  - Central DynamoDB table commits Bravo's claim. Authoritative version moves from `v1` to `v2` (Status: `CLAIMED`).

**Presenter Voiceover:**
> *"Watch our signature scenario live.  
> Field responder Alpha's vehicle loses cellular backhaul. Alpha claims Medic-12 for a local trauma triage. The claim is securely recorded in IndexedDB as verifiable evidence with a cryptographic event ID—not an authoritative overwrite.  
> Meanwhile at headquarters, Dispatcher Bravo remains online and claims Medic-12 for another critical incident. Central DynamoDB commits Bravo's claim, advancing the authoritative version to 2."*

---

### [01:15 - 01:55] — ACT III: Reconnection & Explicit Conflict Adjudication

**Visual on Screen:**
- Presenter returns to Alpha's window and clicks **"(toggle)"** to restore network connectivity (`Online`).
- Presenter clicks **"Flush & Reconcile Now"** in the Sync Center.
- The event is sent to the high-throughput **SQS FIFO Sync Queue**.
- In the top navigation, the badge on **Conflicts & Adjudication** pulses: `1 Active`.
- Presenter navigates to the **Conflicts & Adjudication** tab:
  - Side-by-side evidence comparison opens:
    - **Claim Alpha:** Claimant `USR-ALPHA`, Role `RESPONDER`, buffered offline, triage patient count: 3.
    - **Claim Bravo:** Claimant `USR-BRAVO`, Role `DISPATCHER`, committed online, triage patient count: 1.
  - State of unit `AMB-A12` is displayed as `HUMAN_REVIEW` (v2).
  - Presenter demonstrates **RBAC Security Enforcement**:
    - With role set to `RESPONDER`, clicking resolve shows an error: *"Only SUPERVISOR or ADMINISTRATOR roles can resolve conflicts."*
    - Presenter switches role dropdown to `SUPERVISOR`.
    - Clicks **"Assign to Alpha"** and types: *"Alpha has 3 code-red triage patients requiring immediate transport. Bravo re-routed to standby unit Medic-08."*
    - Clicks **"Confirm Adjudication"**.
  - Authoritative version instantly increments to `v3`.
  - Both client screens converge: Unit `AMB-A12` is now `CLAIMED` by Alpha, and Bravo is redirected.
  - Neither claim was deleted. Both are archived in immutable S3 and Aurora ledgers!

**Presenter Voiceover:**
> *"Now Alpha re-establishes connection.  
> Unlike conventional systems that silently overwrite, ResQSync's Lambda reconciler detects a version conflict: Alpha's claim was based on stale version 1.  
> The system declares an explicit conflict, locks the resource into HUMAN_REVIEW, and alerts the Incident Commander.  
> Notice that RBAC is strictly enforced: responders cannot self-adjudicate. Only authenticated supervisors can resolve conflicts.  
> Supervisor reviews both clinical rationales, awards Medic-12 to Alpha's multi-casualty site, and re-routes Bravo to standby unit Rescue-08.  
> Version advances to 3, and all clients immediately converge. Zero double allocations. Zero lost evidence."*

---

### [01:55 - 02:35] — ACT IV: AWS Infrastructure & Operational Evidence Tour

**Visual on Screen:**
- Presenter clicks the **System Health** tab:
  - Shows live **CloudWatch EMF Metrics**:
    - `Authoritative API Latency: 14 ms`
    - `Sync Reconnect Latency: 24 ms`
    - `Double Allocations: 0`
    - `Competing Claims Preserved: 100%`
  - Shows the **AWS Workload Status Grid**:
    - DynamoDB, EventBridge, SQS FIFO, Lambda, SageMaker, ECS Fargate, CloudFront, Cognito all green (`HEALTHY`).
  - Shows the explicit disclosure badge: `[SIMULATION TELEMETRY]` for synthetic chaos drop-tests vs authoritative production metrics.
- Presenter navigates to **Emergency Intake**:
  - Highlights **Amazon SageMaker Dispatch AI Assistant**:
    - Shows `92% Match Confidence` ranking ALS ambulances based on patient entrapment notes.
- Presenter navigates to **Audit & Replay**:
  - Clicks **"Interactive Replay Scrubber"**:
    - Scrubs backwards and forwards through the exact 5-step deterministic state machine progression (`AVAILABLE` -> `PENDING_SYNC` -> `CLAIMED` -> `HUMAN_REVIEW` -> `RESOLVED`).

**Presenter Voiceover:**
> *"Behind this seamless experience is an enterprise AWS architecture.  
> In our System Health console, CloudWatch Embedded Metric Format tracks operational latencies in real-time.  
> DynamoDB enforces conditional optimistic concurrency; SQS FIFO and ECS Fargate workers process reconnection bursts without packet loss.  
> Amazon SageMaker analyzes triage transcripts to provide dispatch recommendations with 92% confidence scores.  
> And our immutable audit ledger allows full post-incident scrub-and-replay for FEMA disaster after-action reviews."*

---

### [02:35 - 03:00] — ACT V: The Climax & Final Value Proposition

**Visual on Screen:**
- Camera returns to the full Command Center Dispatch Map showing coordinated ambulance icons moving toward emergency zones.
- Split-screen shows responsive mobile tablet view and terminal showing:
  - `Test Files: 7 passed`
  - `Tests: 42 passed`
  - `Playwright E2E: 13 passed`
  - `CDK Stacks: 11 synthesized`
- Final title card:
  - **ResQSync // Command**
  - *One resource. One shared state. Every responder.*
  - GitHub URL & AWS Architecture link.

**Presenter Voiceover:**
> *"ResQSync transforms disaster logistics from chaotic guesswork into deterministic mathematical certainty.  
> 11 reproducible AWS CDK stacks. 100% automated test coverage across unit, integration, chaos, and end-to-end suites. Zero double allocations.  
> In a crisis, responders shouldn't have to fight for the same ambulance. With ResQSync, they never will.  
> Thank you."*

---

## Presenter Checklist Before Recording

1. Ensure the web application is running: `npm run web:dev` at `http://localhost:5173`.
2. Confirm browser zoom is set to 100% (1440x900 or 1920x1080 resolution).
3. Verify test ambulance `AMB-A12` is ready in initial state (`AVAILABLE` or `HUMAN_REVIEW`). If needed, click **Settings > Reset Demo State**.
4. Test audio microphone levels and record in 1080p 60fps.
