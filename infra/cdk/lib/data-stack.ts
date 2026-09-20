import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface DataStackProps extends cdk.StackProps {
  stage?: 'dev' | 'demo' | 'prod';
}

export class DataStack extends cdk.Stack {
  public readonly authoritativeTable: dynamodb.Table;
  public readonly evidenceBucket: s3.IBucket;

  constructor(scope: Construct, id: string, props?: DataStackProps) {
    super(scope, id, props);

    const isProd = props?.stage === 'prod';
    const removalPolicy = isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY;

    // Primary Authoritative DynamoDB Single-Table
    this.authoritativeTable = new dynamodb.Table(this, 'AuthoritativeTable', {
      tableName: `ResQSync-Authoritative${props?.stage && props.stage !== 'prod' ? `-${props.stage}` : ''}`,
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: isProd,
      },
      removalPolicy,
    });

    // Global Secondary Index 1: Fast queries by status & timestamp
    this.authoritativeTable.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Immutable S3 Evidence Bucket for unverified/conflicting client evidence with 30-day chaos log expiration
    this.evidenceBucket = new s3.Bucket(this, 'EvidenceBucket', {
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy,
      autoDeleteObjects: !isProd,
      lifecycleRules: [
        {
          id: 'AutoExpireTemporaryChaosLogs',
          prefix: 'chaos-logs/',
          expiration: cdk.Duration.days(30),
        },
      ],
    });

    new cdk.CfnOutput(this, 'AuthoritativeTableName', {
      value: this.authoritativeTable.tableName,
      description: 'Authoritative DynamoDB Single-Table Name',
      exportName: `ResQSync-AuthoritativeTableName-${props?.stage || 'demo'}`,
    });

    new cdk.CfnOutput(this, 'AuthoritativeTableArn', {
      value: this.authoritativeTable.tableArn,
      description: 'Authoritative DynamoDB Single-Table ARN',
      exportName: `ResQSync-AuthoritativeTableArn-${props?.stage || 'demo'}`,
    });

    new cdk.CfnOutput(this, 'EvidenceBucketName', {
      value: this.evidenceBucket.bucketName,
      description: 'Evidence Archive S3 Bucket Name',
      exportName: `ResQSync-EvidenceBucketName-${props?.stage || 'demo'}`,
    });

    new cdk.CfnOutput(this, 'EvidenceBucketArn', {
      value: this.evidenceBucket.bucketArn,
      description: 'Evidence Archive S3 Bucket ARN',
    });
  }
}
