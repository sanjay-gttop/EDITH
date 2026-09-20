import type { SQSEvent, SQSBatchResponse } from 'aws-lambda';
import type { OfflineEvent } from '@resqsync/domain';

/**
 * Asynchronous worker processing high-volume offline synchronization batches from SQS.
 * Produces structured operational evidence logs for CloudWatch and monitors DLQ metrics.
 */
export async function handler(event: SQSEvent): Promise<SQSBatchResponse> {
  const batchItemFailures: { itemIdentifier: string }[] = [];

  for (const record of event.Records) {
    try {
      const offlineEvent: OfflineEvent = JSON.parse(record.body);
      const structuredLog = {
        timestamp: new Date().toISOString(),
        service: 'resqsync-sync-worker',
        workload_type: 'ECS',
        level: 'INFO',
        message: 'Reconciling SQS offline batch event',
        context: {
          message_id: record.messageId,
          client_event_id: offlineEvent.client_event_id,
          resource_id: offlineEvent.resource_id,
          actor_id: offlineEvent.actor_id,
        },
      };
      console.log(JSON.stringify(structuredLog));
    } catch (err) {
      const errorLog = {
        timestamp: new Date().toISOString(),
        service: 'resqsync-sync-worker',
        workload_type: 'ECS',
        level: 'ERROR',
        message: `Failed to process SQS event record ${record.messageId}`,
        context: { message_id: record.messageId },
        error: {
          message: (err as Error).message,
          name: (err as Error).name,
        },
      };
      console.log(JSON.stringify(errorLog));

      // Emit EMF metric for worker failure
      const emfWorkerError = {
        _aws: {
          Timestamp: Date.now(),
          CloudWatchMetrics: [
            {
              Namespace: 'ResQSync/Operations',
              Dimensions: [['Service', 'Environment']],
              Metrics: [{ Name: 'event_processing_failures', Unit: 'Count' }],
            },
          ],
        },
        Service: 'resqsync-sync-worker',
        Environment: process.env.NODE_ENV || 'production',
        event_processing_failures: 1,
      };
      console.log(JSON.stringify(emfWorkerError));

      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  return { batchItemFailures };
}
