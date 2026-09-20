-- Relational read-model schema for incident analytics and agency audits
CREATE TABLE IF NOT EXISTS agency_analytics (
    agency_id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    total_resources INTEGER DEFAULT 0,
    active_incidents INTEGER DEFAULT 0,
    avg_reconciliation_time_ms INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_reconciliation_log (
    log_id UUID PRIMARY KEY,
    conflict_id VARCHAR(64),
    resource_id VARCHAR(64) NOT NULL,
    resolved_by VARCHAR(64) NOT NULL,
    resolution_type VARCHAR(64) NOT NULL,
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
