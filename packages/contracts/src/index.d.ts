import { z } from 'zod';
export declare const ResourceStatusEnum: z.ZodEnum<["AVAILABLE", "CLAIMED", "DISPATCHED", "IN_USE", "PENDING_SYNC", "CONFLICT", "HUMAN_REVIEW", "RESOLVED"]>;
export declare const SyncStatusEnum: z.ZodEnum<["ONLINE", "OFFLINE", "PENDING_SYNC", "SYNCING", "ACCEPTED", "CONFLICT", "REJECTED", "SYNCHRONIZED"]>;
export declare const ChannelEnum: z.ZodEnum<["WEB", "SMS", "API"]>;
export declare const UserRoleEnum: z.ZodEnum<["RESPONDER", "DISPATCHER", "SUPERVISOR", "ADMINISTRATOR"]>;
export declare const CoordinatesSchema: z.ZodObject<{
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    address: z.ZodOptional<z.ZodString>;
    heading: z.ZodOptional<z.ZodNumber>;
    speed_kmh: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    latitude: number;
    longitude: number;
    address?: string | undefined;
    heading?: number | undefined;
    speed_kmh?: number | undefined;
}, {
    latitude: number;
    longitude: number;
    address?: string | undefined;
    heading?: number | undefined;
    speed_kmh?: number | undefined;
}>;
export declare const ErrorDetailSchema: z.ZodObject<{
    code: z.ZodString;
    message: z.ZodString;
    correlation_id: z.ZodString;
    timestamp: z.ZodString;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    correlation_id: string;
    code: string;
    message: string;
    timestamp: string;
    details?: Record<string, unknown> | undefined;
}, {
    correlation_id: string;
    code: string;
    message: string;
    timestamp: string;
    details?: Record<string, unknown> | undefined;
}>;
export declare const StandardErrorResponseSchema: z.ZodObject<{
    error: z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        correlation_id: z.ZodString;
        timestamp: z.ZodString;
        details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        correlation_id: string;
        code: string;
        message: string;
        timestamp: string;
        details?: Record<string, unknown> | undefined;
    }, {
        correlation_id: string;
        code: string;
        message: string;
        timestamp: string;
        details?: Record<string, unknown> | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    error: {
        correlation_id: string;
        code: string;
        message: string;
        timestamp: string;
        details?: Record<string, unknown> | undefined;
    };
}, {
    error: {
        correlation_id: string;
        code: string;
        message: string;
        timestamp: string;
        details?: Record<string, unknown> | undefined;
    };
}>;
export type StandardErrorResponse = z.infer<typeof StandardErrorResponseSchema>;
export declare const CreateRequestInputSchema: z.ZodObject<{
    incident_id: z.ZodString;
    severity: z.ZodEnum<["CRITICAL", "URGENT", "STANDARD", "NON_EMERGENCY"]>;
    location: z.ZodObject<{
        latitude: z.ZodNumber;
        longitude: z.ZodNumber;
        address: z.ZodOptional<z.ZodString>;
        heading: z.ZodOptional<z.ZodNumber>;
        speed_kmh: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        latitude: number;
        longitude: number;
        address?: string | undefined;
        heading?: number | undefined;
        speed_kmh?: number | undefined;
    }, {
        latitude: number;
        longitude: number;
        address?: string | undefined;
        heading?: number | undefined;
        speed_kmh?: number | undefined;
    }>;
    reporting_channel: z.ZodDefault<z.ZodEnum<["WEB", "SMS", "API"]>>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    incident_id: string;
    severity: "CRITICAL" | "URGENT" | "STANDARD" | "NON_EMERGENCY";
    location: {
        latitude: number;
        longitude: number;
        address?: string | undefined;
        heading?: number | undefined;
        speed_kmh?: number | undefined;
    };
    reporting_channel: "WEB" | "SMS" | "API";
    notes?: string | undefined;
}, {
    incident_id: string;
    severity: "CRITICAL" | "URGENT" | "STANDARD" | "NON_EMERGENCY";
    location: {
        latitude: number;
        longitude: number;
        address?: string | undefined;
        heading?: number | undefined;
        speed_kmh?: number | undefined;
    };
    notes?: string | undefined;
    reporting_channel?: "WEB" | "SMS" | "API" | undefined;
}>;
export type CreateRequestInput = z.infer<typeof CreateRequestInputSchema>;
export declare const CreateRequestResponseSchema: z.ZodObject<{
    request_id: z.ZodString;
    incident_id: z.ZodString;
    status: z.ZodEnum<["PENDING", "DISPATCHED", "FULFILLED", "CANCELLED"]>;
    created_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "DISPATCHED" | "PENDING" | "FULFILLED" | "CANCELLED";
    incident_id: string;
    request_id: string;
    created_at: string;
}, {
    status: "DISPATCHED" | "PENDING" | "FULFILLED" | "CANCELLED";
    incident_id: string;
    request_id: string;
    created_at: string;
}>;
export type CreateRequestResponse = z.infer<typeof CreateRequestResponseSchema>;
export declare const ListResourcesQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["AVAILABLE", "CLAIMED", "DISPATCHED", "IN_USE", "PENDING_SYNC", "CONFLICT", "HUMAN_REVIEW", "RESOLVED"]>>;
    agency_id: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    next_token: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    status?: "AVAILABLE" | "CLAIMED" | "DISPATCHED" | "IN_USE" | "PENDING_SYNC" | "CONFLICT" | "HUMAN_REVIEW" | "RESOLVED" | undefined;
    agency_id?: string | undefined;
    next_token?: string | undefined;
}, {
    status?: "AVAILABLE" | "CLAIMED" | "DISPATCHED" | "IN_USE" | "PENDING_SYNC" | "CONFLICT" | "HUMAN_REVIEW" | "RESOLVED" | undefined;
    agency_id?: string | undefined;
    limit?: number | undefined;
    next_token?: string | undefined;
}>;
export type ListResourcesQuery = z.infer<typeof ListResourcesQuerySchema>;
export declare const ResourceItemSchema: z.ZodObject<{
    resource_id: z.ZodString;
    resource_type: z.ZodString;
    call_sign: z.ZodString;
    status: z.ZodEnum<["AVAILABLE", "CLAIMED", "DISPATCHED", "IN_USE", "PENDING_SYNC", "CONFLICT", "HUMAN_REVIEW", "RESOLVED"]>;
    version: z.ZodNumber;
    agency_id: z.ZodString;
    assigned_incident_id: z.ZodNullable<z.ZodString>;
    assigned_actor_id: z.ZodNullable<z.ZodString>;
    location: z.ZodObject<{
        latitude: z.ZodNumber;
        longitude: z.ZodNumber;
        address: z.ZodOptional<z.ZodString>;
        heading: z.ZodOptional<z.ZodNumber>;
        speed_kmh: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        latitude: number;
        longitude: number;
        address?: string | undefined;
        heading?: number | undefined;
        speed_kmh?: number | undefined;
    }, {
        latitude: number;
        longitude: number;
        address?: string | undefined;
        heading?: number | undefined;
        speed_kmh?: number | undefined;
    }>;
    fuel_percent: z.ZodOptional<z.ZodNumber>;
    equipment_level: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodString;
    _is_demo_seed: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    resource_id: string;
    status: "AVAILABLE" | "CLAIMED" | "DISPATCHED" | "IN_USE" | "PENDING_SYNC" | "CONFLICT" | "HUMAN_REVIEW" | "RESOLVED";
    assigned_actor_id: string | null;
    assigned_incident_id: string | null;
    resource_type: string;
    call_sign: string;
    version: number;
    agency_id: string;
    updated_at: string;
    location: {
        latitude: number;
        longitude: number;
        address?: string | undefined;
        heading?: number | undefined;
        speed_kmh?: number | undefined;
    };
    fuel_percent?: number | undefined;
    equipment_level?: string | undefined;
    _is_demo_seed?: boolean | undefined;
}, {
    resource_id: string;
    status: "AVAILABLE" | "CLAIMED" | "DISPATCHED" | "IN_USE" | "PENDING_SYNC" | "CONFLICT" | "HUMAN_REVIEW" | "RESOLVED";
    assigned_actor_id: string | null;
    assigned_incident_id: string | null;
    resource_type: string;
    call_sign: string;
    version: number;
    agency_id: string;
    updated_at: string;
    location: {
        latitude: number;
        longitude: number;
        address?: string | undefined;
        heading?: number | undefined;
        speed_kmh?: number | undefined;
    };
    fuel_percent?: number | undefined;
    equipment_level?: string | undefined;
    _is_demo_seed?: boolean | undefined;
}>;
export type ResourceItem = z.infer<typeof ResourceItemSchema>;
export declare const ListResourcesResponseSchema: z.ZodObject<{
    resources: z.ZodArray<z.ZodObject<{
        resource_id: z.ZodString;
        resource_type: z.ZodString;
        call_sign: z.ZodString;
        status: z.ZodEnum<["AVAILABLE", "CLAIMED", "DISPATCHED", "IN_USE", "PENDING_SYNC", "CONFLICT", "HUMAN_REVIEW", "RESOLVED"]>;
        version: z.ZodNumber;
        agency_id: z.ZodString;
        assigned_incident_id: z.ZodNullable<z.ZodString>;
        assigned_actor_id: z.ZodNullable<z.ZodString>;
        location: z.ZodObject<{
            latitude: z.ZodNumber;
            longitude: z.ZodNumber;
            address: z.ZodOptional<z.ZodString>;
            heading: z.ZodOptional<z.ZodNumber>;
            speed_kmh: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            latitude: number;
            longitude: number;
            address?: string | undefined;
            heading?: number | undefined;
            speed_kmh?: number | undefined;
        }, {
            latitude: number;
            longitude: number;
            address?: string | undefined;
            heading?: number | undefined;
            speed_kmh?: number | undefined;
        }>;
        fuel_percent: z.ZodOptional<z.ZodNumber>;
        equipment_level: z.ZodOptional<z.ZodString>;
        updated_at: z.ZodString;
        _is_demo_seed: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        resource_id: string;
        status: "AVAILABLE" | "CLAIMED" | "DISPATCHED" | "IN_USE" | "PENDING_SYNC" | "CONFLICT" | "HUMAN_REVIEW" | "RESOLVED";
        assigned_actor_id: string | null;
        assigned_incident_id: string | null;
        resource_type: string;
        call_sign: string;
        version: number;
        agency_id: string;
        updated_at: string;
        location: {
            latitude: number;
            longitude: number;
            address?: string | undefined;
            heading?: number | undefined;
            speed_kmh?: number | undefined;
        };
        fuel_percent?: number | undefined;
        equipment_level?: string | undefined;
        _is_demo_seed?: boolean | undefined;
    }, {
        resource_id: string;
        status: "AVAILABLE" | "CLAIMED" | "DISPATCHED" | "IN_USE" | "PENDING_SYNC" | "CONFLICT" | "HUMAN_REVIEW" | "RESOLVED";
        assigned_actor_id: string | null;
        assigned_incident_id: string | null;
        resource_type: string;
        call_sign: string;
        version: number;
        agency_id: string;
        updated_at: string;
        location: {
            latitude: number;
            longitude: number;
            address?: string | undefined;
            heading?: number | undefined;
            speed_kmh?: number | undefined;
        };
        fuel_percent?: number | undefined;
        equipment_level?: string | undefined;
        _is_demo_seed?: boolean | undefined;
    }>, "many">;
    total: z.ZodNumber;
    server_time: z.ZodString;
    next_token: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    resources: {
        resource_id: string;
        status: "AVAILABLE" | "CLAIMED" | "DISPATCHED" | "IN_USE" | "PENDING_SYNC" | "CONFLICT" | "HUMAN_REVIEW" | "RESOLVED";
        assigned_actor_id: string | null;
        assigned_incident_id: string | null;
        resource_type: string;
        call_sign: string;
        version: number;
        agency_id: string;
        updated_at: string;
        location: {
            latitude: number;
            longitude: number;
            address?: string | undefined;
            heading?: number | undefined;
            speed_kmh?: number | undefined;
        };
        fuel_percent?: number | undefined;
        equipment_level?: string | undefined;
        _is_demo_seed?: boolean | undefined;
    }[];
    total: number;
    server_time: string;
    next_token?: string | undefined;
}, {
    resources: {
        resource_id: string;
        status: "AVAILABLE" | "CLAIMED" | "DISPATCHED" | "IN_USE" | "PENDING_SYNC" | "CONFLICT" | "HUMAN_REVIEW" | "RESOLVED";
        assigned_actor_id: string | null;
        assigned_incident_id: string | null;
        resource_type: string;
        call_sign: string;
        version: number;
        agency_id: string;
        updated_at: string;
        location: {
            latitude: number;
            longitude: number;
            address?: string | undefined;
            heading?: number | undefined;
            speed_kmh?: number | undefined;
        };
        fuel_percent?: number | undefined;
        equipment_level?: string | undefined;
        _is_demo_seed?: boolean | undefined;
    }[];
    total: number;
    server_time: string;
    next_token?: string | undefined;
}>;
export type ListResourcesResponse = z.infer<typeof ListResourcesResponseSchema>;
export declare const ClaimResourceInputSchema: z.ZodObject<{
    resource_id: z.ZodString;
    incident_id: z.ZodString;
    actor_id: z.ZodString;
    device_id: z.ZodString;
    client_event_id: z.ZodString;
    observed_version: z.ZodNumber;
    channel: z.ZodDefault<z.ZodEnum<["WEB", "SMS", "API"]>>;
    created_at_client: z.ZodString;
}, "strip", z.ZodTypeAny, {
    actor_id: string;
    resource_id: string;
    client_event_id: string;
    incident_id: string;
    device_id: string;
    observed_version: number;
    created_at_client: string;
    channel: "WEB" | "SMS" | "API";
}, {
    actor_id: string;
    resource_id: string;
    client_event_id: string;
    incident_id: string;
    device_id: string;
    observed_version: number;
    created_at_client: string;
    channel?: "WEB" | "SMS" | "API" | undefined;
}>;
export type ClaimResourceInput = z.infer<typeof ClaimResourceInputSchema>;
export declare const ClaimResultResponseSchema: z.ZodObject<{
    claim_id: z.ZodString;
    resource_id: z.ZodString;
    status: z.ZodEnum<["AVAILABLE", "CLAIMED", "DISPATCHED", "IN_USE", "PENDING_SYNC", "CONFLICT", "HUMAN_REVIEW", "RESOLVED"]>;
    version: z.ZodNumber;
    authoritative_state: z.ZodObject<{
        resource_id: z.ZodString;
        resource_type: z.ZodString;
        call_sign: z.ZodString;
        status: z.ZodEnum<["AVAILABLE", "CLAIMED", "DISPATCHED", "IN_USE", "PENDING_SYNC", "CONFLICT", "HUMAN_REVIEW", "RESOLVED"]>;
        version: z.ZodNumber;
        agency_id: z.ZodString;
        assigned_incident_id: z.ZodNullable<z.ZodString>;
        assigned_actor_id: z.ZodNullable<z.ZodString>;
        location: z.ZodObject<{
            latitude: z.ZodNumber;
            longitude: z.ZodNumber;
            address: z.ZodOptional<z.ZodString>;
            heading: z.ZodOptional<z.ZodNumber>;
            speed_kmh: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            latitude: number;
            longitude: number;
            address?: string | undefined;
            heading?: number | undefined;
            speed_kmh?: number | undefined;
        }, {
            latitude: number;
            longitude: number;
            address?: string | undefined;
            heading?: number | undefined;
            speed_kmh?: number | undefined;
        }>;
        fuel_percent: z.ZodOptional<z.ZodNumber>;
        equipment_level: z.ZodOptional<z.ZodString>;
        updated_at: z.ZodString;
        _is_demo_seed: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        resource_id: string;
        status: "AVAILABLE" | "CLAIMED" | "DISPATCHED" | "IN_USE" | "PENDING_SYNC" | "CONFLICT" | "HUMAN_REVIEW" | "RESOLVED";
        assigned_actor_id: string | null;
        assigned_incident_id: string | null;
        resource_type: string;
        call_sign: string;
        version: number;
        agency_id: string;
        updated_at: string;
        location: {
            latitude: number;
            longitude: number;
            address?: string | undefined;
            heading?: number | undefined;
            speed_kmh?: number | undefined;
        };
        fuel_percent?: number | undefined;
        equipment_level?: string | undefined;
        _is_demo_seed?: boolean | undefined;
    }, {
        resource_id: string;
        status: "AVAILABLE" | "CLAIMED" | "DISPATCHED" | "IN_USE" | "PENDING_SYNC" | "CONFLICT" | "HUMAN_REVIEW" | "RESOLVED";
        assigned_actor_id: string | null;
        assigned_incident_id: string | null;
        resource_type: string;
        call_sign: string;
        version: number;
        agency_id: string;
        updated_at: string;
        location: {
            latitude: number;
            longitude: number;
            address?: string | undefined;
            heading?: number | undefined;
            speed_kmh?: number | undefined;
        };
        fuel_percent?: number | undefined;
        equipment_level?: string | undefined;
        _is_demo_seed?: boolean | undefined;
    }>;
    server_time: z.ZodString;
}, "strip", z.ZodTypeAny, {
    resource_id: string;
    status: "AVAILABLE" | "CLAIMED" | "DISPATCHED" | "IN_USE" | "PENDING_SYNC" | "CONFLICT" | "HUMAN_REVIEW" | "RESOLVED";
    claim_id: string;
    version: number;
    server_time: string;
    authoritative_state: {
        resource_id: string;
        status: "AVAILABLE" | "CLAIMED" | "DISPATCHED" | "IN_USE" | "PENDING_SYNC" | "CONFLICT" | "HUMAN_REVIEW" | "RESOLVED";
        assigned_actor_id: string | null;
        assigned_incident_id: string | null;
        resource_type: string;
        call_sign: string;
        version: number;
        agency_id: string;
        updated_at: string;
        location: {
            latitude: number;
            longitude: number;
            address?: string | undefined;
            heading?: number | undefined;
            speed_kmh?: number | undefined;
        };
        fuel_percent?: number | undefined;
        equipment_level?: string | undefined;
        _is_demo_seed?: boolean | undefined;
    };
}, {
    resource_id: string;
    status: "AVAILABLE" | "CLAIMED" | "DISPATCHED" | "IN_USE" | "PENDING_SYNC" | "CONFLICT" | "HUMAN_REVIEW" | "RESOLVED";
    claim_id: string;
    version: number;
    server_time: string;
    authoritative_state: {
        resource_id: string;
        status: "AVAILABLE" | "CLAIMED" | "DISPATCHED" | "IN_USE" | "PENDING_SYNC" | "CONFLICT" | "HUMAN_REVIEW" | "RESOLVED";
        assigned_actor_id: string | null;
        assigned_incident_id: string | null;
        resource_type: string;
        call_sign: string;
        version: number;
        agency_id: string;
        updated_at: string;
        location: {
            latitude: number;
            longitude: number;
            address?: string | undefined;
            heading?: number | undefined;
            speed_kmh?: number | undefined;
        };
        fuel_percent?: number | undefined;
        equipment_level?: string | undefined;
        _is_demo_seed?: boolean | undefined;
    };
}>;
export type ClaimResultResponse = z.infer<typeof ClaimResultResponseSchema>;
export declare const OfflineEventContractSchema: z.ZodObject<{
    client_event_id: z.ZodString;
    resource_id: z.ZodString;
    incident_id: z.ZodString;
    actor_id: z.ZodString;
    device_id: z.ZodString;
    event_type: z.ZodEnum<["CLAIM", "DISPATCH", "RELEASE", "STATUS_UPDATE"]>;
    created_at_client: z.ZodString;
    observed_version: z.ZodNumber;
    channel: z.ZodEnum<["WEB", "SMS", "API"]>;
    payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    sync_status: z.ZodEnum<["PENDING_SYNC", "ACCEPTED", "CONFLICT", "REJECTED"]>;
}, "strip", z.ZodTypeAny, {
    actor_id: string;
    resource_id: string;
    client_event_id: string;
    incident_id: string;
    device_id: string;
    observed_version: number;
    created_at_client: string;
    channel: "WEB" | "SMS" | "API";
    event_type: "CLAIM" | "DISPATCH" | "RELEASE" | "STATUS_UPDATE";
    payload: Record<string, unknown>;
    sync_status: "PENDING_SYNC" | "CONFLICT" | "ACCEPTED" | "REJECTED";
}, {
    actor_id: string;
    resource_id: string;
    client_event_id: string;
    incident_id: string;
    device_id: string;
    observed_version: number;
    created_at_client: string;
    channel: "WEB" | "SMS" | "API";
    event_type: "CLAIM" | "DISPATCH" | "RELEASE" | "STATUS_UPDATE";
    payload: Record<string, unknown>;
    sync_status: "PENDING_SYNC" | "CONFLICT" | "ACCEPTED" | "REJECTED";
}>;
export type OfflineEventContract = z.infer<typeof OfflineEventContractSchema>;
export declare const SyncBatchInputSchema: z.ZodObject<{
    device_id: z.ZodString;
    client_timestamp: z.ZodString;
    events: z.ZodArray<z.ZodObject<{
        client_event_id: z.ZodString;
        resource_id: z.ZodString;
        incident_id: z.ZodString;
        actor_id: z.ZodString;
        device_id: z.ZodString;
        event_type: z.ZodEnum<["CLAIM", "DISPATCH", "RELEASE", "STATUS_UPDATE"]>;
        created_at_client: z.ZodString;
        observed_version: z.ZodNumber;
        channel: z.ZodEnum<["WEB", "SMS", "API"]>;
        payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        sync_status: z.ZodEnum<["PENDING_SYNC", "ACCEPTED", "CONFLICT", "REJECTED"]>;
    }, "strip", z.ZodTypeAny, {
        actor_id: string;
        resource_id: string;
        client_event_id: string;
        incident_id: string;
        device_id: string;
        observed_version: number;
        created_at_client: string;
        channel: "WEB" | "SMS" | "API";
        event_type: "CLAIM" | "DISPATCH" | "RELEASE" | "STATUS_UPDATE";
        payload: Record<string, unknown>;
        sync_status: "PENDING_SYNC" | "CONFLICT" | "ACCEPTED" | "REJECTED";
    }, {
        actor_id: string;
        resource_id: string;
        client_event_id: string;
        incident_id: string;
        device_id: string;
        observed_version: number;
        created_at_client: string;
        channel: "WEB" | "SMS" | "API";
        event_type: "CLAIM" | "DISPATCH" | "RELEASE" | "STATUS_UPDATE";
        payload: Record<string, unknown>;
        sync_status: "PENDING_SYNC" | "CONFLICT" | "ACCEPTED" | "REJECTED";
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    device_id: string;
    client_timestamp: string;
    events: {
        actor_id: string;
        resource_id: string;
        client_event_id: string;
        incident_id: string;
        device_id: string;
        observed_version: number;
        created_at_client: string;
        channel: "WEB" | "SMS" | "API";
        event_type: "CLAIM" | "DISPATCH" | "RELEASE" | "STATUS_UPDATE";
        payload: Record<string, unknown>;
        sync_status: "PENDING_SYNC" | "CONFLICT" | "ACCEPTED" | "REJECTED";
    }[];
}, {
    device_id: string;
    client_timestamp: string;
    events: {
        actor_id: string;
        resource_id: string;
        client_event_id: string;
        incident_id: string;
        device_id: string;
        observed_version: number;
        created_at_client: string;
        channel: "WEB" | "SMS" | "API";
        event_type: "CLAIM" | "DISPATCH" | "RELEASE" | "STATUS_UPDATE";
        payload: Record<string, unknown>;
        sync_status: "PENDING_SYNC" | "CONFLICT" | "ACCEPTED" | "REJECTED";
    }[];
}>;
export type SyncBatchInput = z.infer<typeof SyncBatchInputSchema>;
export declare const SyncEventResultSchema: z.ZodObject<{
    client_event_id: z.ZodString;
    resource_id: z.ZodString;
    sync_status: z.ZodEnum<["ACCEPTED", "CONFLICT", "REJECTED"]>;
    message: z.ZodString;
    conflict_id: z.ZodOptional<z.ZodString>;
    authoritative_resource: z.ZodOptional<z.ZodObject<{
        resource_id: z.ZodString;
        resource_type: z.ZodString;
        call_sign: z.ZodString;
        status: z.ZodEnum<["AVAILABLE", "CLAIMED", "DISPATCHED", "IN_USE", "PENDING_SYNC", "CONFLICT", "HUMAN_REVIEW", "RESOLVED"]>;
        version: z.ZodNumber;
        agency_id: z.ZodString;
        assigned_incident_id: z.ZodNullable<z.ZodString>;
        assigned_actor_id: z.ZodNullable<z.ZodString>;
        location: z.ZodObject<{
            latitude: z.ZodNumber;
            longitude: z.ZodNumber;
            address: z.ZodOptional<z.ZodString>;
            heading: z.ZodOptional<z.ZodNumber>;
            speed_kmh: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            latitude: number;
            longitude: number;
            address?: string | undefined;
            heading?: number | undefined;
            speed_kmh?: number | undefined;
        }, {
            latitude: number;
            longitude: number;
            address?: string | undefined;
            heading?: number | undefined;
            speed_kmh?: number | undefined;
        }>;
        fuel_percent: z.ZodOptional<z.ZodNumber>;
        equipment_level: z.ZodOptional<z.ZodString>;
        updated_at: z.ZodString;
        _is_demo_seed: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        resource_id: string;
        status: "AVAILABLE" | "CLAIMED" | "DISPATCHED" | "IN_USE" | "PENDING_SYNC" | "CONFLICT" | "HUMAN_REVIEW" | "RESOLVED";
        assigned_actor_id: string | null;
        assigned_incident_id: string | null;
        resource_type: string;
        call_sign: string;
        version: number;
        agency_id: string;
        updated_at: string;
        location: {
            latitude: number;
            longitude: number;
            address?: string | undefined;
            heading?: number | undefined;
            speed_kmh?: number | undefined;
        };
        fuel_percent?: number | undefined;
        equipment_level?: string | undefined;
        _is_demo_seed?: boolean | undefined;
    }, {
        resource_id: string;
        status: "AVAILABLE" | "CLAIMED" | "DISPATCHED" | "IN_USE" | "PENDING_SYNC" | "CONFLICT" | "HUMAN_REVIEW" | "RESOLVED";
        assigned_actor_id: string | null;
        assigned_incident_id: string | null;
        resource_type: string;
        call_sign: string;
        version: number;
        agency_id: string;
        updated_at: string;
        location: {
            latitude: number;
            longitude: number;
            address?: string | undefined;
            heading?: number | undefined;
            speed_kmh?: number | undefined;
        };
        fuel_percent?: number | undefined;
        equipment_level?: string | undefined;
        _is_demo_seed?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    resource_id: string;
    client_event_id: string;
    message: string;
    sync_status: "CONFLICT" | "ACCEPTED" | "REJECTED";
    conflict_id?: string | undefined;
    authoritative_resource?: {
        resource_id: string;
        status: "AVAILABLE" | "CLAIMED" | "DISPATCHED" | "IN_USE" | "PENDING_SYNC" | "CONFLICT" | "HUMAN_REVIEW" | "RESOLVED";
        assigned_actor_id: string | null;
        assigned_incident_id: string | null;
        resource_type: string;
        call_sign: string;
        version: number;
        agency_id: string;
        updated_at: string;
        location: {
            latitude: number;
            longitude: number;
            address?: string | undefined;
            heading?: number | undefined;
            speed_kmh?: number | undefined;
        };
        fuel_percent?: number | undefined;
        equipment_level?: string | undefined;
        _is_demo_seed?: boolean | undefined;
    } | undefined;
}, {
    resource_id: string;
    client_event_id: string;
    message: string;
    sync_status: "CONFLICT" | "ACCEPTED" | "REJECTED";
    conflict_id?: string | undefined;
    authoritative_resource?: {
        resource_id: string;
        status: "AVAILABLE" | "CLAIMED" | "DISPATCHED" | "IN_USE" | "PENDING_SYNC" | "CONFLICT" | "HUMAN_REVIEW" | "RESOLVED";
        assigned_actor_id: string | null;
        assigned_incident_id: string | null;
        resource_type: string;
        call_sign: string;
        version: number;
        agency_id: string;
        updated_at: string;
        location: {
            latitude: number;
            longitude: number;
            address?: string | undefined;
            heading?: number | undefined;
            speed_kmh?: number | undefined;
        };
        fuel_percent?: number | undefined;
        equipment_level?: string | undefined;
        _is_demo_seed?: boolean | undefined;
    } | undefined;
}>;
export type SyncEventResult = z.infer<typeof SyncEventResultSchema>;
export declare const SyncBatchResponseSchema: z.ZodObject<{
    device_id: z.ZodString;
    processed_count: z.ZodNumber;
    results: z.ZodArray<z.ZodObject<{
        client_event_id: z.ZodString;
        resource_id: z.ZodString;
        sync_status: z.ZodEnum<["ACCEPTED", "CONFLICT", "REJECTED"]>;
        message: z.ZodString;
        conflict_id: z.ZodOptional<z.ZodString>;
        authoritative_resource: z.ZodOptional<z.ZodObject<{
            resource_id: z.ZodString;
            resource_type: z.ZodString;
            call_sign: z.ZodString;
            status: z.ZodEnum<["AVAILABLE", "CLAIMED", "DISPATCHED", "IN_USE", "PENDING_SYNC", "CONFLICT", "HUMAN_REVIEW", "RESOLVED"]>;
            version: z.ZodNumber;
            agency_id: z.ZodString;
            assigned_incident_id: z.ZodNullable<z.ZodString>;
            assigned_actor_id: z.ZodNullable<z.ZodString>;
            location: z.ZodObject<{
                latitude: z.ZodNumber;
                longitude: z.ZodNumber;
                address: z.ZodOptional<z.ZodString>;
                heading: z.ZodOptional<z.ZodNumber>;
                speed_kmh: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                latitude: number;
                longitude: number;
                address?: string | undefined;
                heading?: number | undefined;
                speed_kmh?: number | undefined;
            }, {
                latitude: number;
                longitude: number;
                address?: string | undefined;
                heading?: number | undefined;
                speed_kmh?: number | undefined;
            }>;
            fuel_percent: z.ZodOptional<z.ZodNumber>;
            equipment_level: z.ZodOptional<z.ZodString>;
            updated_at: z.ZodString;
            _is_demo_seed: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            resource_id: string;
            status: "AVAILABLE" | "CLAIMED" | "DISPATCHED" | "IN_USE" | "PENDING_SYNC" | "CONFLICT" | "HUMAN_REVIEW" | "RESOLVED";
            assigned_actor_id: string | null;
            assigned_incident_id: string | null;
            resource_type: string;
            call_sign: string;
            version: number;
            agency_id: string;
            updated_at: string;
            location: {
                latitude: number;
                longitude: number;
                address?: string | undefined;
                heading?: number | undefined;
                speed_kmh?: number | undefined;
            };
            fuel_percent?: number | undefined;
            equipment_level?: string | undefined;
            _is_demo_seed?: boolean | undefined;
        }, {
            resource_id: string;
            status: "AVAILABLE" | "CLAIMED" | "DISPATCHED" | "IN_USE" | "PENDING_SYNC" | "CONFLICT" | "HUMAN_REVIEW" | "RESOLVED";
            assigned_actor_id: string | null;
            assigned_incident_id: string | null;
            resource_type: string;
            call_sign: string;
            version: number;
            agency_id: string;
            updated_at: string;
            location: {
                latitude: number;
                longitude: number;
                address?: string | undefined;
                heading?: number | undefined;
                speed_kmh?: number | undefined;
            };
            fuel_percent?: number | undefined;
            equipment_level?: string | undefined;
            _is_demo_seed?: boolean | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        resource_id: string;
        client_event_id: string;
        message: string;
        sync_status: "CONFLICT" | "ACCEPTED" | "REJECTED";
        conflict_id?: string | undefined;
        authoritative_resource?: {
            resource_id: string;
            status: "AVAILABLE" | "CLAIMED" | "DISPATCHED" | "IN_USE" | "PENDING_SYNC" | "CONFLICT" | "HUMAN_REVIEW" | "RESOLVED";
            assigned_actor_id: string | null;
            assigned_incident_id: string | null;
            resource_type: string;
            call_sign: string;
            version: number;
            agency_id: string;
            updated_at: string;
            location: {
                latitude: number;
                longitude: number;
                address?: string | undefined;
                heading?: number | undefined;
                speed_kmh?: number | undefined;
            };
            fuel_percent?: number | undefined;
            equipment_level?: string | undefined;
            _is_demo_seed?: boolean | undefined;
        } | undefined;
    }, {
        resource_id: string;
        client_event_id: string;
        message: string;
        sync_status: "CONFLICT" | "ACCEPTED" | "REJECTED";
        conflict_id?: string | undefined;
        authoritative_resource?: {
            resource_id: string;
            status: "AVAILABLE" | "CLAIMED" | "DISPATCHED" | "IN_USE" | "PENDING_SYNC" | "CONFLICT" | "HUMAN_REVIEW" | "RESOLVED";
            assigned_actor_id: string | null;
            assigned_incident_id: string | null;
            resource_type: string;
            call_sign: string;
            version: number;
            agency_id: string;
            updated_at: string;
            location: {
                latitude: number;
                longitude: number;
                address?: string | undefined;
                heading?: number | undefined;
                speed_kmh?: number | undefined;
            };
            fuel_percent?: number | undefined;
            equipment_level?: string | undefined;
            _is_demo_seed?: boolean | undefined;
        } | undefined;
    }>, "many">;
    server_time: z.ZodString;
}, "strip", z.ZodTypeAny, {
    device_id: string;
    server_time: string;
    processed_count: number;
    results: {
        resource_id: string;
        client_event_id: string;
        message: string;
        sync_status: "CONFLICT" | "ACCEPTED" | "REJECTED";
        conflict_id?: string | undefined;
        authoritative_resource?: {
            resource_id: string;
            status: "AVAILABLE" | "CLAIMED" | "DISPATCHED" | "IN_USE" | "PENDING_SYNC" | "CONFLICT" | "HUMAN_REVIEW" | "RESOLVED";
            assigned_actor_id: string | null;
            assigned_incident_id: string | null;
            resource_type: string;
            call_sign: string;
            version: number;
            agency_id: string;
            updated_at: string;
            location: {
                latitude: number;
                longitude: number;
                address?: string | undefined;
                heading?: number | undefined;
                speed_kmh?: number | undefined;
            };
            fuel_percent?: number | undefined;
            equipment_level?: string | undefined;
            _is_demo_seed?: boolean | undefined;
        } | undefined;
    }[];
}, {
    device_id: string;
    server_time: string;
    processed_count: number;
    results: {
        resource_id: string;
        client_event_id: string;
        message: string;
        sync_status: "CONFLICT" | "ACCEPTED" | "REJECTED";
        conflict_id?: string | undefined;
        authoritative_resource?: {
            resource_id: string;
            status: "AVAILABLE" | "CLAIMED" | "DISPATCHED" | "IN_USE" | "PENDING_SYNC" | "CONFLICT" | "HUMAN_REVIEW" | "RESOLVED";
            assigned_actor_id: string | null;
            assigned_incident_id: string | null;
            resource_type: string;
            call_sign: string;
            version: number;
            agency_id: string;
            updated_at: string;
            location: {
                latitude: number;
                longitude: number;
                address?: string | undefined;
                heading?: number | undefined;
                speed_kmh?: number | undefined;
            };
            fuel_percent?: number | undefined;
            equipment_level?: string | undefined;
            _is_demo_seed?: boolean | undefined;
        } | undefined;
    }[];
}>;
export type SyncBatchResponse = z.infer<typeof SyncBatchResponseSchema>;
export declare const ConflictResolutionActionEnum: z.ZodEnum<["ASSIGN_TO_ALPHA", "ASSIGN_TO_BRAVO", "REQUEST_INFORMATION"]>;
export type ConflictResolutionActionType = z.infer<typeof ConflictResolutionActionEnum>;
export declare const ConflictTimelineEventSchema: z.ZodObject<{
    step: z.ZodString;
    timestamp: z.ZodString;
    actor_id: z.ZodOptional<z.ZodString>;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    timestamp: string;
    step: string;
    description: string;
    actor_id?: string | undefined;
}, {
    timestamp: string;
    step: string;
    description: string;
    actor_id?: string | undefined;
}>;
export type ConflictTimelineEventContract = z.infer<typeof ConflictTimelineEventSchema>;
export declare const ConflictEvidenceSchema: z.ZodObject<{
    claim_id: z.ZodString;
    actor_id: z.ZodString;
    team_id: z.ZodOptional<z.ZodString>;
    device_id: z.ZodString;
    client_event_id: z.ZodString;
    created_at_client: z.ZodString;
    received_at_server: z.ZodString;
    channel: z.ZodEnum<["WEB", "SMS", "API"]>;
    observed_version: z.ZodNumber;
    connectivity_status: z.ZodOptional<z.ZodEnum<["ONLINE", "OFFLINE"]>>;
    request_id: z.ZodOptional<z.ZodString>;
    payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    actor_id: string;
    client_event_id: string;
    claim_id: string;
    device_id: string;
    observed_version: number;
    created_at_client: string;
    channel: "WEB" | "SMS" | "API";
    payload: Record<string, unknown>;
    received_at_server: string;
    team_id?: string | undefined;
    request_id?: string | undefined;
    connectivity_status?: "ONLINE" | "OFFLINE" | undefined;
}, {
    actor_id: string;
    client_event_id: string;
    claim_id: string;
    device_id: string;
    observed_version: number;
    created_at_client: string;
    channel: "WEB" | "SMS" | "API";
    payload: Record<string, unknown>;
    received_at_server: string;
    team_id?: string | undefined;
    request_id?: string | undefined;
    connectivity_status?: "ONLINE" | "OFFLINE" | undefined;
}>;
export type ConflictEvidenceContract = z.infer<typeof ConflictEvidenceSchema>;
export declare const ConflictItemSchema: z.ZodObject<{
    conflict_id: z.ZodString;
    resource_id: z.ZodString;
    claim_ids: z.ZodArray<z.ZodString, "many">;
    detected_at: z.ZodString;
    status: z.ZodEnum<["DETECTED", "UNDER_REVIEW", "RESOLVED"]>;
    evidence: z.ZodArray<z.ZodObject<{
        claim_id: z.ZodString;
        actor_id: z.ZodString;
        team_id: z.ZodOptional<z.ZodString>;
        device_id: z.ZodString;
        client_event_id: z.ZodString;
        created_at_client: z.ZodString;
        received_at_server: z.ZodString;
        channel: z.ZodEnum<["WEB", "SMS", "API"]>;
        observed_version: z.ZodNumber;
        connectivity_status: z.ZodOptional<z.ZodEnum<["ONLINE", "OFFLINE"]>>;
        request_id: z.ZodOptional<z.ZodString>;
        payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        actor_id: string;
        client_event_id: string;
        claim_id: string;
        device_id: string;
        observed_version: number;
        created_at_client: string;
        channel: "WEB" | "SMS" | "API";
        payload: Record<string, unknown>;
        received_at_server: string;
        team_id?: string | undefined;
        request_id?: string | undefined;
        connectivity_status?: "ONLINE" | "OFFLINE" | undefined;
    }, {
        actor_id: string;
        client_event_id: string;
        claim_id: string;
        device_id: string;
        observed_version: number;
        created_at_client: string;
        channel: "WEB" | "SMS" | "API";
        payload: Record<string, unknown>;
        received_at_server: string;
        team_id?: string | undefined;
        request_id?: string | undefined;
        connectivity_status?: "ONLINE" | "OFFLINE" | undefined;
    }>, "many">;
    timeline: z.ZodOptional<z.ZodArray<z.ZodObject<{
        step: z.ZodString;
        timestamp: z.ZodString;
        actor_id: z.ZodOptional<z.ZodString>;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        timestamp: string;
        step: string;
        description: string;
        actor_id?: string | undefined;
    }, {
        timestamp: string;
        step: string;
        description: string;
        actor_id?: string | undefined;
    }>, "many">>;
    resolution: z.ZodOptional<z.ZodObject<{
        action: z.ZodOptional<z.ZodEnum<["ASSIGN_TO_ALPHA", "ASSIGN_TO_BRAVO", "REQUEST_INFORMATION"]>>;
        winning_claim_id: z.ZodOptional<z.ZodString>;
        resolved_by: z.ZodString;
        resolved_at: z.ZodString;
        notes: z.ZodString;
        target_state: z.ZodEnum<["AVAILABLE", "CLAIMED", "DISPATCHED", "IN_USE", "PENDING_SYNC", "CONFLICT", "HUMAN_REVIEW", "RESOLVED"]>;
    }, "strip", z.ZodTypeAny, {
        resolved_by: string;
        resolved_at: string;
        notes: string;
        target_state: "AVAILABLE" | "CLAIMED" | "DISPATCHED" | "IN_USE" | "PENDING_SYNC" | "CONFLICT" | "HUMAN_REVIEW" | "RESOLVED";
        winning_claim_id?: string | undefined;
        action?: "ASSIGN_TO_ALPHA" | "ASSIGN_TO_BRAVO" | "REQUEST_INFORMATION" | undefined;
    }, {
        resolved_by: string;
        resolved_at: string;
        notes: string;
        target_state: "AVAILABLE" | "CLAIMED" | "DISPATCHED" | "IN_USE" | "PENDING_SYNC" | "CONFLICT" | "HUMAN_REVIEW" | "RESOLVED";
        winning_claim_id?: string | undefined;
        action?: "ASSIGN_TO_ALPHA" | "ASSIGN_TO_BRAVO" | "REQUEST_INFORMATION" | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    resource_id: string;
    status: "RESOLVED" | "DETECTED" | "UNDER_REVIEW";
    conflict_id: string;
    claim_ids: string[];
    detected_at: string;
    evidence: {
        actor_id: string;
        client_event_id: string;
        claim_id: string;
        device_id: string;
        observed_version: number;
        created_at_client: string;
        channel: "WEB" | "SMS" | "API";
        payload: Record<string, unknown>;
        received_at_server: string;
        team_id?: string | undefined;
        request_id?: string | undefined;
        connectivity_status?: "ONLINE" | "OFFLINE" | undefined;
    }[];
    timeline?: {
        timestamp: string;
        step: string;
        description: string;
        actor_id?: string | undefined;
    }[] | undefined;
    resolution?: {
        resolved_by: string;
        resolved_at: string;
        notes: string;
        target_state: "AVAILABLE" | "CLAIMED" | "DISPATCHED" | "IN_USE" | "PENDING_SYNC" | "CONFLICT" | "HUMAN_REVIEW" | "RESOLVED";
        winning_claim_id?: string | undefined;
        action?: "ASSIGN_TO_ALPHA" | "ASSIGN_TO_BRAVO" | "REQUEST_INFORMATION" | undefined;
    } | undefined;
}, {
    resource_id: string;
    status: "RESOLVED" | "DETECTED" | "UNDER_REVIEW";
    conflict_id: string;
    claim_ids: string[];
    detected_at: string;
    evidence: {
        actor_id: string;
        client_event_id: string;
        claim_id: string;
        device_id: string;
        observed_version: number;
        created_at_client: string;
        channel: "WEB" | "SMS" | "API";
        payload: Record<string, unknown>;
        received_at_server: string;
        team_id?: string | undefined;
        request_id?: string | undefined;
        connectivity_status?: "ONLINE" | "OFFLINE" | undefined;
    }[];
    timeline?: {
        timestamp: string;
        step: string;
        description: string;
        actor_id?: string | undefined;
    }[] | undefined;
    resolution?: {
        resolved_by: string;
        resolved_at: string;
        notes: string;
        target_state: "AVAILABLE" | "CLAIMED" | "DISPATCHED" | "IN_USE" | "PENDING_SYNC" | "CONFLICT" | "HUMAN_REVIEW" | "RESOLVED";
        winning_claim_id?: string | undefined;
        action?: "ASSIGN_TO_ALPHA" | "ASSIGN_TO_BRAVO" | "REQUEST_INFORMATION" | undefined;
    } | undefined;
}>;
export type ConflictItem = z.infer<typeof ConflictItemSchema>;
export declare const ResolveConflictInputSchema: z.ZodObject<{
    action: z.ZodDefault<z.ZodEnum<["ASSIGN_TO_ALPHA", "ASSIGN_TO_BRAVO", "REQUEST_INFORMATION"]>>;
    winning_claim_id: z.ZodOptional<z.ZodString>;
    resolution_notes: z.ZodString;
    target_state: z.ZodDefault<z.ZodEnum<["AVAILABLE", "CLAIMED", "DISPATCHED", "IN_USE", "PENDING_SYNC", "CONFLICT", "HUMAN_REVIEW", "RESOLVED"]>>;
}, "strip", z.ZodTypeAny, {
    target_state: "AVAILABLE" | "CLAIMED" | "DISPATCHED" | "IN_USE" | "PENDING_SYNC" | "CONFLICT" | "HUMAN_REVIEW" | "RESOLVED";
    action: "ASSIGN_TO_ALPHA" | "ASSIGN_TO_BRAVO" | "REQUEST_INFORMATION";
    resolution_notes: string;
    winning_claim_id?: string | undefined;
}, {
    resolution_notes: string;
    winning_claim_id?: string | undefined;
    target_state?: "AVAILABLE" | "CLAIMED" | "DISPATCHED" | "IN_USE" | "PENDING_SYNC" | "CONFLICT" | "HUMAN_REVIEW" | "RESOLVED" | undefined;
    action?: "ASSIGN_TO_ALPHA" | "ASSIGN_TO_BRAVO" | "REQUEST_INFORMATION" | undefined;
}>;
export type ResolveConflictInput = z.infer<typeof ResolveConflictInputSchema>;
export declare const ResolveConflictResponseSchema: z.ZodObject<{
    conflict_id: z.ZodString;
    status: z.ZodEnum<["UNDER_REVIEW", "RESOLVED"]>;
    action: z.ZodEnum<["ASSIGN_TO_ALPHA", "ASSIGN_TO_BRAVO", "REQUEST_INFORMATION"]>;
    resolved_resource: z.ZodObject<{
        resource_id: z.ZodString;
        resource_type: z.ZodString;
        call_sign: z.ZodString;
        status: z.ZodEnum<["AVAILABLE", "CLAIMED", "DISPATCHED", "IN_USE", "PENDING_SYNC", "CONFLICT", "HUMAN_REVIEW", "RESOLVED"]>;
        version: z.ZodNumber;
        agency_id: z.ZodString;
        assigned_incident_id: z.ZodNullable<z.ZodString>;
        assigned_actor_id: z.ZodNullable<z.ZodString>;
        location: z.ZodObject<{
            latitude: z.ZodNumber;
            longitude: z.ZodNumber;
            address: z.ZodOptional<z.ZodString>;
            heading: z.ZodOptional<z.ZodNumber>;
            speed_kmh: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            latitude: number;
            longitude: number;
            address?: string | undefined;
            heading?: number | undefined;
            speed_kmh?: number | undefined;
        }, {
            latitude: number;
            longitude: number;
            address?: string | undefined;
            heading?: number | undefined;
            speed_kmh?: number | undefined;
        }>;
        fuel_percent: z.ZodOptional<z.ZodNumber>;
        equipment_level: z.ZodOptional<z.ZodString>;
        updated_at: z.ZodString;
        _is_demo_seed: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        resource_id: string;
        status: "AVAILABLE" | "CLAIMED" | "DISPATCHED" | "IN_USE" | "PENDING_SYNC" | "CONFLICT" | "HUMAN_REVIEW" | "RESOLVED";
        assigned_actor_id: string | null;
        assigned_incident_id: string | null;
        resource_type: string;
        call_sign: string;
        version: number;
        agency_id: string;
        updated_at: string;
        location: {
            latitude: number;
            longitude: number;
            address?: string | undefined;
            heading?: number | undefined;
            speed_kmh?: number | undefined;
        };
        fuel_percent?: number | undefined;
        equipment_level?: string | undefined;
        _is_demo_seed?: boolean | undefined;
    }, {
        resource_id: string;
        status: "AVAILABLE" | "CLAIMED" | "DISPATCHED" | "IN_USE" | "PENDING_SYNC" | "CONFLICT" | "HUMAN_REVIEW" | "RESOLVED";
        assigned_actor_id: string | null;
        assigned_incident_id: string | null;
        resource_type: string;
        call_sign: string;
        version: number;
        agency_id: string;
        updated_at: string;
        location: {
            latitude: number;
            longitude: number;
            address?: string | undefined;
            heading?: number | undefined;
            speed_kmh?: number | undefined;
        };
        fuel_percent?: number | undefined;
        equipment_level?: string | undefined;
        _is_demo_seed?: boolean | undefined;
    }>;
    server_time: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "RESOLVED" | "UNDER_REVIEW";
    action: "ASSIGN_TO_ALPHA" | "ASSIGN_TO_BRAVO" | "REQUEST_INFORMATION";
    conflict_id: string;
    server_time: string;
    resolved_resource: {
        resource_id: string;
        status: "AVAILABLE" | "CLAIMED" | "DISPATCHED" | "IN_USE" | "PENDING_SYNC" | "CONFLICT" | "HUMAN_REVIEW" | "RESOLVED";
        assigned_actor_id: string | null;
        assigned_incident_id: string | null;
        resource_type: string;
        call_sign: string;
        version: number;
        agency_id: string;
        updated_at: string;
        location: {
            latitude: number;
            longitude: number;
            address?: string | undefined;
            heading?: number | undefined;
            speed_kmh?: number | undefined;
        };
        fuel_percent?: number | undefined;
        equipment_level?: string | undefined;
        _is_demo_seed?: boolean | undefined;
    };
}, {
    status: "RESOLVED" | "UNDER_REVIEW";
    action: "ASSIGN_TO_ALPHA" | "ASSIGN_TO_BRAVO" | "REQUEST_INFORMATION";
    conflict_id: string;
    server_time: string;
    resolved_resource: {
        resource_id: string;
        status: "AVAILABLE" | "CLAIMED" | "DISPATCHED" | "IN_USE" | "PENDING_SYNC" | "CONFLICT" | "HUMAN_REVIEW" | "RESOLVED";
        assigned_actor_id: string | null;
        assigned_incident_id: string | null;
        resource_type: string;
        call_sign: string;
        version: number;
        agency_id: string;
        updated_at: string;
        location: {
            latitude: number;
            longitude: number;
            address?: string | undefined;
            heading?: number | undefined;
            speed_kmh?: number | undefined;
        };
        fuel_percent?: number | undefined;
        equipment_level?: string | undefined;
        _is_demo_seed?: boolean | undefined;
    };
}>;
export type ResolveConflictResponse = z.infer<typeof ResolveConflictResponseSchema>;
export declare const DomainEventContractSchema: z.ZodObject<{
    event_id: z.ZodString;
    event_type: z.ZodString;
    entity_id: z.ZodString;
    actor_id: z.ZodString;
    timestamp: z.ZodString;
    payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    correlation_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    correlation_id: string;
    actor_id: string;
    timestamp: string;
    event_type: string;
    payload: Record<string, unknown>;
    event_id: string;
    entity_id: string;
}, {
    correlation_id: string;
    actor_id: string;
    timestamp: string;
    event_type: string;
    payload: Record<string, unknown>;
    event_id: string;
    entity_id: string;
}>;
export type DomainEventContract = z.infer<typeof DomainEventContractSchema>;
export declare const ListEventsResponseSchema: z.ZodObject<{
    entity_id: z.ZodString;
    events: z.ZodArray<z.ZodObject<{
        event_id: z.ZodString;
        event_type: z.ZodString;
        entity_id: z.ZodString;
        actor_id: z.ZodString;
        timestamp: z.ZodString;
        payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        correlation_id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        correlation_id: string;
        actor_id: string;
        timestamp: string;
        event_type: string;
        payload: Record<string, unknown>;
        event_id: string;
        entity_id: string;
    }, {
        correlation_id: string;
        actor_id: string;
        timestamp: string;
        event_type: string;
        payload: Record<string, unknown>;
        event_id: string;
        entity_id: string;
    }>, "many">;
    total: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    total: number;
    events: {
        correlation_id: string;
        actor_id: string;
        timestamp: string;
        event_type: string;
        payload: Record<string, unknown>;
        event_id: string;
        entity_id: string;
    }[];
    entity_id: string;
}, {
    total: number;
    events: {
        correlation_id: string;
        actor_id: string;
        timestamp: string;
        event_type: string;
        payload: Record<string, unknown>;
        event_id: string;
        entity_id: string;
    }[];
    entity_id: string;
}>;
export type ListEventsResponse = z.infer<typeof ListEventsResponseSchema>;
//# sourceMappingURL=index.d.ts.map