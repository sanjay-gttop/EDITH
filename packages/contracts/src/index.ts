import { z } from 'zod';

// ============================================================================
// 1. COMMON SCHEMAS
// ============================================================================

export const ResourceStatusEnum = z.enum([
  'AVAILABLE',
  'CLAIMED',
  'DISPATCHED',
  'IN_USE',
  'PENDING_SYNC',
  'CONFLICT',
  'HUMAN_REVIEW',
  'RESOLVED',
]);

export const SyncStatusEnum = z.enum([
  'ONLINE',
  'OFFLINE',
  'PENDING_SYNC',
  'SYNCING',
  'ACCEPTED',
  'CONFLICT',
  'REJECTED',
  'SYNCHRONIZED',
]);

export const ChannelEnum = z.enum(['WEB', 'SMS', 'API']);

export const UserRoleEnum = z.enum([
  'RESPONDER',
  'DISPATCHER',
  'SUPERVISOR',
  'ADMINISTRATOR',
]);

export const CoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  heading: z.number().optional(),
  speed_kmh: z.number().optional(),
});

// Standard Structured Error Contract
export const ErrorDetailSchema = z.object({
  code: z.string(),
  message: z.string(),
  correlation_id: z.string().uuid(),
  timestamp: z.string().datetime(),
  details: z.record(z.unknown()).optional(),
});

export const StandardErrorResponseSchema = z.object({
  error: ErrorDetailSchema,
});
export type StandardErrorResponse = z.infer<typeof StandardErrorResponseSchema>;

// ============================================================================
// 2. ENDPOINT: POST /requests
// ============================================================================

export const CreateRequestInputSchema = z.object({
  incident_id: z.string().min(1),
  severity: z.enum(['CRITICAL', 'URGENT', 'STANDARD', 'NON_EMERGENCY']),
  location: CoordinatesSchema,
  reporting_channel: ChannelEnum.default('WEB'),
  notes: z.string().max(1000).optional(),
});
export type CreateRequestInput = z.infer<typeof CreateRequestInputSchema>;

export const CreateRequestResponseSchema = z.object({
  request_id: z.string(),
  incident_id: z.string(),
  status: z.enum(['PENDING', 'DISPATCHED', 'FULFILLED', 'CANCELLED']),
  created_at: z.string().datetime(),
});
export type CreateRequestResponse = z.infer<typeof CreateRequestResponseSchema>;

// ============================================================================
// 3. ENDPOINT: GET /resources & GET /resources/{id}
// ============================================================================

export const ListResourcesQuerySchema = z.object({
  status: ResourceStatusEnum.optional(),
  agency_id: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  next_token: z.string().optional(),
});
export type ListResourcesQuery = z.infer<typeof ListResourcesQuerySchema>;

export const ResourceItemSchema = z.object({
  resource_id: z.string(),
  resource_type: z.string(),
  call_sign: z.string(),
  status: ResourceStatusEnum,
  version: z.number().int().nonnegative(),
  agency_id: z.string(),
  assigned_incident_id: z.string().nullable(),
  assigned_actor_id: z.string().nullable(),
  location: CoordinatesSchema,
  fuel_percent: z.number().min(0).max(100).optional(),
  equipment_level: z.string().optional(),
  updated_at: z.string().datetime(),
  _is_demo_seed: z.boolean().optional(),
});
export type ResourceItem = z.infer<typeof ResourceItemSchema>;

export const ListResourcesResponseSchema = z.object({
  resources: z.array(ResourceItemSchema),
  total: z.number().int().nonnegative(),
  server_time: z.string().datetime(),
  next_token: z.string().optional(),
});
export type ListResourcesResponse = z.infer<typeof ListResourcesResponseSchema>;

// ============================================================================
// 4. ENDPOINT: POST /claims
// ============================================================================

export const ClaimResourceInputSchema = z.object({
  resource_id: z.string().min(1),
  incident_id: z.string().min(1),
  actor_id: z.string().min(1),
  device_id: z.string().min(1),
  client_event_id: z.string().min(1),
  observed_version: z.number().int().nonnegative(),
  channel: ChannelEnum.default('WEB'),
  created_at_client: z.string().datetime(),
});
export type ClaimResourceInput = z.infer<typeof ClaimResourceInputSchema>;

export const ClaimResultResponseSchema = z.object({
  claim_id: z.string(),
  resource_id: z.string(),
  status: ResourceStatusEnum,
  version: z.number().int().positive(),
  authoritative_state: ResourceItemSchema,
  server_time: z.string().datetime(),
});
export type ClaimResultResponse = z.infer<typeof ClaimResultResponseSchema>;

// ============================================================================
// 5. OFFLINE EVENT & POST /sync
// ============================================================================

export const OfflineEventContractSchema = z.object({
  client_event_id: z.string().min(1),
  resource_id: z.string().min(1),
  incident_id: z.string().min(1),
  actor_id: z.string().min(1),
  device_id: z.string().min(1),
  event_type: z.enum(['CLAIM', 'DISPATCH', 'RELEASE', 'STATUS_UPDATE']),
  created_at_client: z.string().datetime(),
  observed_version: z.number().int().nonnegative(),
  channel: ChannelEnum,
  payload: z.record(z.unknown()),
  sync_status: z.enum(['PENDING_SYNC', 'ACCEPTED', 'CONFLICT', 'REJECTED']),
});
export type OfflineEventContract = z.infer<typeof OfflineEventContractSchema>;

export const SyncBatchInputSchema = z.object({
  device_id: z.string().min(1),
  client_timestamp: z.string().datetime(),
  events: z.array(OfflineEventContractSchema).min(1).max(50),
});
export type SyncBatchInput = z.infer<typeof SyncBatchInputSchema>;

export const SyncEventResultSchema = z.object({
  client_event_id: z.string(),
  resource_id: z.string(),
  sync_status: z.enum(['ACCEPTED', 'CONFLICT', 'REJECTED']),
  message: z.string(),
  conflict_id: z.string().optional(),
  authoritative_resource: ResourceItemSchema.optional(),
});
export type SyncEventResult = z.infer<typeof SyncEventResultSchema>;

export const SyncBatchResponseSchema = z.object({
  device_id: z.string(),
  processed_count: z.number().int().nonnegative(),
  results: z.array(SyncEventResultSchema),
  server_time: z.string().datetime(),
});
export type SyncBatchResponse = z.infer<typeof SyncBatchResponseSchema>;

// ============================================================================
// 6. ENDPOINT: GET & POST /conflicts
// ============================================================================

export const ConflictEvidenceSchema = z.object({
  claim_id: z.string(),
  actor_id: z.string(),
  device_id: z.string(),
  client_event_id: z.string(),
  created_at_client: z.string().datetime(),
  received_at_server: z.string().datetime(),
  channel: ChannelEnum,
  observed_version: z.number().int().nonnegative(),
  payload: z.record(z.unknown()),
});
export type ConflictEvidenceContract = z.infer<typeof ConflictEvidenceSchema>;

export const ConflictItemSchema = z.object({
  conflict_id: z.string(),
  resource_id: z.string(),
  claim_ids: z.array(z.string()),
  detected_at: z.string().datetime(),
  status: z.enum(['DETECTED', 'UNDER_REVIEW', 'RESOLVED']),
  evidence: z.array(ConflictEvidenceSchema),
  resolution: z
    .object({
      winning_claim_id: z.string(),
      resolved_by: z.string(),
      resolved_at: z.string().datetime(),
      notes: z.string(),
      target_state: ResourceStatusEnum,
    })
    .optional(),
});
export type ConflictItem = z.infer<typeof ConflictItemSchema>;

export const ResolveConflictInputSchema = z.object({
  winning_claim_id: z.string().min(1),
  resolution_notes: z.string().min(1).max(2000),
  target_state: ResourceStatusEnum.default('CLAIMED'),
});
export type ResolveConflictInput = z.infer<typeof ResolveConflictInputSchema>;

export const ResolveConflictResponseSchema = z.object({
  conflict_id: z.string(),
  status: z.literal('RESOLVED'),
  resolved_resource: ResourceItemSchema,
  server_time: z.string().datetime(),
});
export type ResolveConflictResponse = z.infer<typeof ResolveConflictResponseSchema>;

// ============================================================================
// 7. ENDPOINT: GET /events/{entity_id}
// ============================================================================

export const DomainEventContractSchema = z.object({
  event_id: z.string(),
  event_type: z.string(),
  entity_id: z.string(),
  actor_id: z.string(),
  timestamp: z.string().datetime(),
  payload: z.record(z.unknown()),
  correlation_id: z.string(),
});
export type DomainEventContract = z.infer<typeof DomainEventContractSchema>;

export const ListEventsResponseSchema = z.object({
  entity_id: z.string(),
  events: z.array(DomainEventContractSchema),
  total: z.number().int().nonnegative(),
});
export type ListEventsResponse = z.infer<typeof ListEventsResponseSchema>;
