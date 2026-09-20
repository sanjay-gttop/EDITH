/**
 * CloudWatch Embedded Metric Format (EMF) emitter for ResQSync operations.
 * Allows structured logging and zero-latency asynchronous metric publication
 * directly to CloudWatch without requiring synchronous PutMetricData API calls.
 */

export interface MetricDefinition {
  name: string;
  unit: 'Count' | 'Milliseconds' | 'Bytes' | 'Percent';
  value: number;
}

export interface EmfMetricPayload {
  namespace?: string;
  dimensions?: Record<string, string>;
  metrics: MetricDefinition[];
  properties?: Record<string, unknown>;
}

export type WorkloadType =
  | 'Lambda'
  | 'APIGateway'
  | 'ECS'
  | 'EKS'
  | 'EC2'
  | 'AppRunner'
  | 'SageMaker'
  | 'StepFunctions';

export class MetricsEmitter {
  constructor(
    private readonly defaultNamespace: string = 'ResQSync/Operations',
    private readonly defaultDimensions: Record<string, string> = {
      Service: 'resqsync-core',
      Environment: process.env.NODE_ENV || 'production',
    },
  ) {}

  /**
   * Emit CloudWatch Embedded Metric Format log record to stdout
   */
  emit(payload: EmfMetricPayload): void {
    const timestamp = Date.now();
    const dimensions = { ...this.defaultDimensions, ...(payload.dimensions || {}) };
    const namespace = payload.namespace || this.defaultNamespace;

    const dimensionKeys = Object.keys(dimensions);
    const metricDefinitions = payload.metrics.map(m => ({
      Name: m.name,
      Unit: m.unit,
    }));

    const emfRecord: Record<string, unknown> = {
      _aws: {
        Timestamp: timestamp,
        CloudWatchMetrics: [
          {
            Namespace: namespace,
            Dimensions: [dimensionKeys],
            Metrics: metricDefinitions,
          },
        ],
      },
      ...dimensions,
      ...(payload.properties || {}),
    };

    // Add metric values as top-level properties
    for (const metric of payload.metrics) {
      emfRecord[metric.name] = metric.value;
    }

    console.log(JSON.stringify(emfRecord));
  }

  // Pre-configured operational metrics
  recordClaimSuccess(resourceId: string, latencyMs?: number): void {
    this.emit({
      metrics: [
        { name: 'claim_success_count', unit: 'Count', value: 1 },
        ...(latencyMs !== undefined ? [{ name: 'api_latency', unit: 'Milliseconds' as const, value: latencyMs }] : []),
      ],
      properties: { resource_id: resourceId },
    });
  }

  recordClaimConflict(resourceId: string, conflictId: string): void {
    this.emit({
      metrics: [{ name: 'claim_conflict_count', unit: 'Count', value: 1 }],
      properties: { resource_id: resourceId, conflict_id: conflictId },
    });
  }

  recordSyncSuccess(count: number, latencyMs: number): void {
    this.emit({
      metrics: [
        { name: 'sync_success_count', unit: 'Count', value: count },
        { name: 'sync_latency_ms', unit: 'Milliseconds', value: latencyMs },
      ],
    });
  }

  recordPendingSync(count: number): void {
    this.emit({
      metrics: [{ name: 'pending_sync_count', unit: 'Count', value: count }],
    });
  }

  recordResolution(conflictId: string, action: string): void {
    this.emit({
      metrics: [{ name: 'resolution_count', unit: 'Count', value: 1 }],
      properties: { conflict_id: conflictId, action },
    });
  }

  recordLambdaError(handlerName: string, errorName: string): void {
    this.emit({
      metrics: [{ name: 'lambda_errors', unit: 'Count', value: 1 }],
      properties: { handler: handlerName, error_name: errorName },
    });
  }

  recordQueueMetrics(queueDepth: number, deadLetterCount: number): void {
    this.emit({
      metrics: [
        { name: 'queue_depth', unit: 'Count', value: queueDepth },
        { name: 'dead_letter_count', unit: 'Count', value: deadLetterCount },
      ],
    });
  }

  recordWorkerFailure(reason: string): void {
    this.emit({
      metrics: [{ name: 'event_processing_failures', unit: 'Count', value: 1 }],
      properties: { failure_reason: reason },
    });
  }

  recordAiMetrics(extractionCount: number, lowConfidenceCount: number): void {
    this.emit({
      metrics: [
        { name: 'ai_extraction_count', unit: 'Count', value: extractionCount },
        { name: 'ai_low_confidence_count', unit: 'Count', value: lowConfidenceCount },
      ],
    });
  }
}

export const metrics = new MetricsEmitter();
