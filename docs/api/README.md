# ResQSync // API Specification

## Base URL
- Production: `https://api.resqsync.org/v1`
- Local Development: `http://localhost:3000/v1`

---

## 1. Authentication & Headers

| Header | Type | Description |
| :--- | :--- | :--- |
| `Authorization` | Bearer `<token>` | Cognito JWT Access Token with role claims |
| `X-Client-Id` | String | Unique hardware or browser instance ID |
| `X-Correlation-Id` | UUID | Distributed tracing ID |

---

## 2. Core Endpoints

### 2.1 Emergency Requests
- **`POST /requests`**  
  Intake a new emergency dispatch request.
  - **Body**: `{ incident_id, location: { lat, lon, address }, severity, notes }`
  - **Response 201**: `{ request_id, status: 'PENDING', created_at }`

### 2.2 Resource Queries
- **`GET /resources`**  
  List all tracked ambulances and disaster resources.
  - **Query**: `?status=AVAILABLE&agency_id=AGY-01`
  - **Response 200**: `{ resources: [ Resource ], total, server_time }`

- **`GET /resources/{id}`**  
  Fetch current authoritative state of a single resource.
  - **Response 200**: `Resource`
  - **Response 404**: `StandardErrorResponse`

### 2.3 Resource Claims
- **`POST /claims`**  
  Online claim attempt using optimistic concurrency control.
  - **Body**:
    ```json
    {
      "resource_id": "AMB-A12",
      "actor_id": "USR-RESP-04",
      "request_id": "REQ-901",
      "device_id": "DEV-TAB-01",
      "client_event_id": "evt-client-9921",
      "observed_version": 4
    }
    ```
  - **Response 200 (Success)**: `{ claim_id, resource_id, status: 'CLAIMED', version: 5, server_time }`
  - **Response 409 (Conflict/Stale)**: `{ error: 'RESOURCE_CONFLICT', current_state: Resource }`

### 2.4 Offline Batch Synchronization
- **`POST /sync`**  
  Batch upload offline events queued in IndexedDB.
  - **Body**:
    ```json
    {
      "device_id": "DEV-TAB-01",
      "events": [ OfflineEvent ]
    }
    ```
  - **Response 200**:
    ```json
    {
      "processed_count": 2,
      "results": [
        { "client_event_id": "evt-01", "sync_status": "ACCEPTED", "resource_id": "AMB-A12" },
        { "client_event_id": "evt-02", "sync_status": "CONFLICT", "conflict_id": "CONF-881" }
      ]
    }
    ```

### 2.5 Conflict Management
- **`GET /conflicts`**  
  List unresolved competing claims.
- **`GET /conflicts/{id}`**  
  Retrieve specific conflict details with full preserved evidence.
- **`POST /conflicts/{id}/resolve`**  
  Supervisor resolution of competing claims.
  - **Body**: `{ winning_claim_id, resolution_notes, override_resource_status }`
  - **Authorization**: Required Role `SUPERVISOR` or `ADMINISTRATOR`.

### 2.6 Audit & Event History
- **`GET /events/{entity_id}`**  
  Fetch append-only chronological history for an ambulance or incident.

---

## 3. Standard Error Contract

```json
{
  "error": {
    "code": "STALE_VERSION_REJECTED",
    "message": "Resource version 4 does not match authoritative version 5",
    "correlation_id": "7b7e8d2e-6489-4091-a1d2-e56598c1c4f0",
    "timestamp": "2026-09-20T10:00:00Z",
    "details": {
      "resource_id": "AMB-A12",
      "current_version": 5,
      "submitted_version": 4
    }
  }
}
```
