-- Aurora Global Database Cluster Schema
-- Read replicas for cross-region multi-agency emergency operations
CREATE TABLE IF NOT EXISTS global_incident_registry (
    incident_id VARCHAR(64) PRIMARY KEY,
    region VARCHAR(32) NOT NULL,
    severity_level VARCHAR(16) NOT NULL,
    declared_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(32) NOT NULL
);
