import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';

export class ObservabilityStack extends cdk.Stack {
  public readonly dashboard: cloudwatch.Dashboard;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const namespace = 'ResQSync/Operations';

    // Dashboard: ResQSync System Health
    this.dashboard = new cloudwatch.Dashboard(this, 'ResQSyncSystemHealthDashboard', {
      dashboardName: 'ResQSync-System-Health',
    });

    // 1. Dashboard Header Widget
    this.dashboard.addWidgets(
      new cloudwatch.TextWidget({
        markdown: `# ResQSync // System Health & Operational Evidence
CloudWatch operational telemetry for authoritative disaster resource allocation, offline sync, and automated reconciliation.

> **Evidence Guarantee**: Authoritative DynamoDB state is the single source of truth. Offline metrics represent verifiable field evidence.`,
        width: 24,
        height: 2,
      }),
    );

    // 2. Row 1: API & Claims Telemetry
    const apiLatencyMetric = new cloudwatch.Metric({
      namespace,
      metricName: 'api_latency',
      statistic: 'Average',
      period: cdk.Duration.minutes(1),
      label: 'API Request Latency (ms)',
    });

    const claimSuccessMetric = new cloudwatch.Metric({
      namespace,
      metricName: 'claim_success_count',
      statistic: 'Sum',
      period: cdk.Duration.minutes(1),
      label: 'Claims Succeeded',
      color: '#2ca02c',
    });

    const claimConflictMetric = new cloudwatch.Metric({
      namespace,
      metricName: 'claim_conflict_count',
      statistic: 'Sum',
      period: cdk.Duration.minutes(1),
      label: 'Claim Conflicts Detected',
      color: '#d62728',
    });

    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'API Performance & Latency',
        left: [apiLatencyMetric],
        width: 12,
        height: 6,
      }),
      new cloudwatch.GraphWidget({
        title: 'Claims vs Conflicts Throughput',
        left: [claimSuccessMetric, claimConflictMetric],
        width: 12,
        height: 6,
      }),
    );

    // 3. Row 2: Offline Synchronization & Conflict Resolution
    const syncSuccessMetric = new cloudwatch.Metric({
      namespace,
      metricName: 'sync_success_count',
      statistic: 'Sum',
      period: cdk.Duration.minutes(1),
      label: 'Batches Synchronized',
      color: '#1f77b4',
    });

    const syncLatencyMetric = new cloudwatch.Metric({
      namespace,
      metricName: 'sync_latency_ms',
      statistic: 'Average',
      period: cdk.Duration.minutes(1),
      label: 'Sync Reconnect Latency (ms)',
    });

    const pendingSyncMetric = new cloudwatch.Metric({
      namespace,
      metricName: 'pending_sync_count',
      statistic: 'Average',
      period: cdk.Duration.minutes(1),
      label: 'IndexedDB Pending Queue Depth',
      color: '#ff7f0e',
    });

    const resolutionCountMetric = new cloudwatch.Metric({
      namespace,
      metricName: 'resolution_count',
      statistic: 'Sum',
      period: cdk.Duration.minutes(1),
      label: 'Supervisor Resolutions',
      color: '#9467bd',
    });

    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'Offline Sync Reconnect & IndexedDB Queue',
        left: [syncSuccessMetric, pendingSyncMetric],
        right: [syncLatencyMetric],
        width: 12,
        height: 6,
      }),
      new cloudwatch.GraphWidget({
        title: 'Conflict Lifecycle & Adjudication',
        left: [claimConflictMetric, resolutionCountMetric],
        width: 12,
        height: 6,
      }),
    );

    // 4. Row 3: SQS Queues, DLQs & Workers
    const queueDepthMetric = new cloudwatch.Metric({
      namespace,
      metricName: 'queue_depth',
      statistic: 'Average',
      period: cdk.Duration.minutes(1),
      label: 'SQS Sync Ingestion Depth',
    });

    const dlqDepthMetric = new cloudwatch.Metric({
      namespace,
      metricName: 'dead_letter_count',
      statistic: 'Sum',
      period: cdk.Duration.minutes(1),
      label: 'DLQ Dead Letters',
      color: '#d62728',
    });

    const workerFailureMetric = new cloudwatch.Metric({
      namespace,
      metricName: 'event_processing_failures',
      statistic: 'Sum',
      period: cdk.Duration.minutes(1),
      label: 'Sync Worker Failures',
      color: '#e377c2',
    });

    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'SQS Ingestion & Dead Letter Queue (DLQ)',
        left: [queueDepthMetric, dlqDepthMetric],
        width: 12,
        height: 6,
      }),
      new cloudwatch.GraphWidget({
        title: 'Worker Processing Failures',
        left: [workerFailureMetric],
        width: 12,
        height: 6,
      }),
    );

    // 5. Row 4: SageMaker AI Optimization & Lambda Errors
    const aiExtractionMetric = new cloudwatch.Metric({
      namespace,
      metricName: 'ai_extraction_count',
      statistic: 'Sum',
      period: cdk.Duration.minutes(1),
      label: 'AI Extractions & Recommendations',
      color: '#8c564b',
    });

    const aiLowConfidenceMetric = new cloudwatch.Metric({
      namespace,
      metricName: 'ai_low_confidence_count',
      statistic: 'Sum',
      period: cdk.Duration.minutes(1),
      label: 'Low-Confidence Fallbacks (<0.75)',
      color: '#bcbd22',
    });

    const lambdaErrorsMetric = new cloudwatch.Metric({
      namespace,
      metricName: 'lambda_errors',
      statistic: 'Sum',
      period: cdk.Duration.minutes(1),
      label: 'Lambda Runtime Errors',
      color: '#d62728',
    });

    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'SageMaker AI Allocation Model Telemetry',
        left: [aiExtractionMetric, aiLowConfidenceMetric],
        width: 12,
        height: 6,
      }),
      new cloudwatch.GraphWidget({
        title: 'Lambda & Server Errors',
        left: [lambdaErrorsMetric],
        width: 12,
        height: 6,
      }),
    );

    // 6. Demo-Safe Sensible Alarms (Prevent false alarms during simulation)
    new cloudwatch.Alarm(this, 'HighConflictSpikeAlarm', {
      metric: claimConflictMetric,
      threshold: 50,
      evaluationPeriods: 5,
      alarmDescription: 'Alerts when conflict rate exceeds demo thresholds (>50/5min)',
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    new cloudwatch.Alarm(this, 'DeadLetterQueueDepthAlarm', {
      metric: dlqDepthMetric,
      threshold: 5,
      evaluationPeriods: 5,
      alarmDescription: 'Alerts when SQS Dead Letter Queue accumulates unprocessed events (>5/5min)',
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    new cloudwatch.Alarm(this, 'LambdaErrorRateAlarm', {
      metric: lambdaErrorsMetric,
      threshold: 10,
      evaluationPeriods: 5,
      alarmDescription: 'Alerts when Lambda handlers experience persistent runtime failures (>10/5min)',
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    new cdk.CfnOutput(this, 'SystemHealthDashboardName', {
      value: this.dashboard.dashboardName,
      description: 'CloudWatch System Health Dashboard Name',
    });
  }
}
