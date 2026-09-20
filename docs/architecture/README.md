# ResQSync // Architecture Guide

## 1. Core Principles

1. **One Resource. One Shared State. Every Responder.**  
   Frontline responders must never wonder whether an ambulance is assigned to someone else. The system provides immediate local feedback while maintaining absolute eventual consistency with the central authority.

2. **DynamoDB is the Authoritative Resource State.**  
   Offline client state is considered **unverified evidence** until processed by AWS Lambda and written to Amazon DynamoDB using conditional expressions (`attribute_exists`, `version = :expected_version`, `status = :available`).

3. **Client Timestamps are Evidence, Not Authority.**  
   Responders' device clocks may drift, be maliciously altered, or be desynchronized across cell towers. Client timestamps are retained in audit records for human review, but never determine winner-takes-all state ordering.

4. **Zero Silent Overwrites & Full Evidence Preservation.**  
   When two offline responders claim the same ambulance while partitioned, the server does not overwrite the loser's claim. It creates a first-class `Conflict` record containing all submitted evidence, escalates the resource to `HUMAN_REVIEW`, and alerts supervisors.

---

## 2. Deterministic Resource State Machine

```
      ┌─────────────┐
      │  AVAILABLE  │
      └──────┬──────┘
             │
      ┌──────┴─────────────────────────────────┐
      │ (online claim)                         │ (offline claim)
      ▼                                        ▼
┌───────────┐                         ┌─────────────────┐
│  CLAIMED  │                         │  PENDING_SYNC   │
└─────┬─────┘                         └────────┬────────┘
      │                                        │
      │ (dispatch)                ┌────────────┴────────────┐
      ▼                           ▼                         ▼
┌─────────────┐            ┌──────────────┐          ┌──────────────┐
│ DISPATCHED  │            │   ACCEPTED   │          │   CONFLICT   │
└─────┬───────┘            └──────┬───────┘          └──────┬───────┘
      │                           │                         │
      │ (arrival/triage)          ▼                         ▼
      ▼                     ┌───────────┐            ┌──────────────┐
┌───────────┐               │  CLAIMED  │            │ HUMAN_REVIEW │
│  IN_USE   │               └───────────┘            └──────┬───────┘
└─────┬─────┘                                               │
      │                                                     ▼
      │ (release/complete)                           ┌──────────────┐
      ▼                                              │   RESOLVED   │
┌───────────┐                                        └──────┬───────┘
│ AVAILABLE │◄──────────────────────────────────────────────┘
└───────────┘
```

---

## 3. Authoritative DynamoDB Single-Table Design

Table name: `ResQSync-Authoritative`

### Primary Partition & Sort Keys

| Entity | PK | SK | Description | Key Attributes |
| :--- | :--- | :--- | :--- | :--- |
| **Resource** | `RESOURCE#<resource_id>` | `STATE` | Current authoritative state | `status`, `version`, `assigned_incident_id`, `assigned_actor_id`, `location`, `updated_at` |
| **Claim Event** | `RESOURCE#<resource_id>` | `EVENT#<iso_timestamp>#<client_event_id>` | Append-only event history | `client_event_id`, `actor_id`, `device_id`, `channel`, `decision`, `conflict_id`, `payload` |
| **Conflict** | `CONFLICT#<conflict_id>` | `STATE` | Active or resolved conflict | `resource_id`, `claim_ids`, `status`, `detected_at`, `evidence`, `resolution` |
| **Request** | `REQUEST#<request_id>` | `STATE` | Citizen / agency emergency request | `status`, `severity`, `location`, `assigned_resource_id` |
| **Idempotency Record** | `IDEMPOTENCY#<client_event_id>` | `STATE` | Prevents duplicate processing | `client_event_id`, `resource_id`, `created_at`, `processed_at`, `result_summary` |

### Secondary Indexes
- **GSI1**: `GSI1PK = STATUS#<status>`, `GSI1SK = UPDATED#<iso_timestamp>` (Fast filtering for dispatchers)
- **GSI2**: `GSI2PK = INCIDENT#<incident_id>`, `GSI2SK = RESOURCE#<resource_id>`

---

## 4. Multi-Stack AWS CDK Topology

ResQSync infrastructure is partitioned into 11 isolated CDK stacks to maintain security boundaries and enable independent lifecycle management:

1. **NetworkStack**: VPC, public/private subnets, VPC endpoints for DynamoDB/S3.
2. **AuthStack**: Amazon Cognito User Pool, User Pool Client, RBAC Groups (`RESPONDER`, `DISPATCHER`, `SUPERVISOR`, `ADMINISTRATOR`).
3. **EdgeStack**: Amazon CloudFront distribution, Route 53 latency records, AWS WAF rules.
4. **DataStack**: Authoritative DynamoDB table with DynamoDB Streams, S3 evidence bucket.
5. **ApiStack**: Amazon API Gateway HTTP API with Cognito JWT authorizer.
6. **ComputeStack**: AWS Lambda execution environments, IAM least-privilege roles.
7. **EventsStack**: Amazon EventBridge custom event bus, SQS Dead Letter Queues, SNS SMS topics.
8. **AiStack**: SageMaker real-time endpoint placeholder for predictive demand allocation.
9. **ObservabilityStack**: CloudWatch dashboards, metric filters, synthesized alarms.
10. **ContainersStack**: Amazon ECS / Fargate task definitions for long-running synchronization workers.
11. **SimulationStack**: Simulation gateway for chaos testing, latency injection, and simulated network partitions.
