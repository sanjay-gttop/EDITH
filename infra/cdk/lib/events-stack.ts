import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as sns from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';

export interface EventsStackProps extends cdk.StackProps {
  stage?: 'dev' | 'demo' | 'prod';
}

export class EventsStack extends cdk.Stack {
  public readonly eventBus: events.IEventBus;
  public readonly deadLetterQueue: sqs.IQueue;
  public readonly syncQueue: sqs.IQueue;
  public readonly alertsTopic: sns.ITopic;

  constructor(scope: Construct, id: string, props?: EventsStackProps) {
    super(scope, id, props);

    this.eventBus = new events.EventBus(this, 'ResQSyncEventBus', {
      eventBusName: `resqsync-events${props?.stage && props.stage !== 'prod' ? `-${props.stage}` : ''}`,
    });

    this.deadLetterQueue = new sqs.Queue(this, 'SyncDeadLetterQueue', {
      queueName: `resqsync-sync-dlq${props?.stage && props.stage !== 'prod' ? `-${props.stage}` : ''}.fifo`,
      fifo: true,
      retentionPeriod: cdk.Duration.days(14),
      enforceSSL: true,
    });

    // High-Throughput SQS FIFO Queue for offline batch reconciliation
    this.syncQueue = new sqs.Queue(this, 'SyncIngestionQueue', {
      queueName: `resqsync-sync-queue${props?.stage && props.stage !== 'prod' ? `-${props.stage}` : ''}.fifo`,
      fifo: true,
      contentBasedDeduplication: true,
      deadLetterQueue: {
        queue: this.deadLetterQueue,
        maxReceiveCount: 5,
      },
      retentionPeriod: cdk.Duration.days(7),
      enforceSSL: true,
    });

    this.alertsTopic = new sns.Topic(this, 'CriticalAlertsTopic', {
      topicName: `resqsync-critical-alerts${props?.stage && props.stage !== 'prod' ? `-${props.stage}` : ''}`,
      displayName: 'ResQSync Operational Alerts',
    });

    new cdk.CfnOutput(this, 'EventBusName', {
      value: this.eventBus.eventBusName,
      description: 'EventBridge Bus Name',
      exportName: `ResQSync-EventBusName-${props?.stage || 'demo'}`,
    });

    new cdk.CfnOutput(this, 'EventBusArn', {
      value: this.eventBus.eventBusArn,
      description: 'EventBridge Bus ARN',
    });

    new cdk.CfnOutput(this, 'SyncQueueUrl', {
      value: this.syncQueue.queueUrl,
      description: 'SQS FIFO Sync Queue URL',
      exportName: `ResQSync-SyncQueueUrl-${props?.stage || 'demo'}`,
    });

    new cdk.CfnOutput(this, 'DlqUrl', {
      value: this.deadLetterQueue.queueUrl,
      description: 'Dead Letter Queue URL',
    });

    new cdk.CfnOutput(this, 'AlertsTopicArn', {
      value: this.alertsTopic.topicArn,
      description: 'SNS Critical Alerts Topic ARN',
    });
  }
}
