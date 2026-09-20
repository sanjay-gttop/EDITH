import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as sns from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';

export class EventsStack extends cdk.Stack {
  public readonly eventBus: events.IEventBus;
  public readonly deadLetterQueue: sqs.IQueue;
  public readonly alertsTopic: sns.ITopic;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.eventBus = new events.EventBus(this, 'ResQSyncEventBus', {
      eventBusName: 'resqsync-events',
    });

    this.deadLetterQueue = new sqs.Queue(this, 'SyncDeadLetterQueue', {
      queueName: 'resqsync-sync-dlq',
      retentionPeriod: cdk.Duration.days(14),
      enforceSSL: true,
    });

    this.alertsTopic = new sns.Topic(this, 'CriticalAlertsTopic', {
      topicName: 'resqsync-critical-alerts',
      displayName: 'ResQSync Operational Alerts',
    });

    new cdk.CfnOutput(this, 'EventBusArn', {
      value: this.eventBus.eventBusArn,
      description: 'EventBridge Bus ARN',
    });

    new cdk.CfnOutput(this, 'DlqUrl', {
      value: this.deadLetterQueue.queueUrl,
      description: 'Dead Letter Queue URL',
    });
  }
}
