#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from '../lib/network-stack';
import { AuthStack } from '../lib/auth-stack';
import { EdgeStack } from '../lib/edge-stack';
import { DataStack } from '../lib/data-stack';
import { ComputeStack } from '../lib/compute-stack';
import { ApiStack } from '../lib/api-stack';
import { EventsStack } from '../lib/events-stack';
import { AiStack } from '../lib/ai-stack';
import { ObservabilityStack } from '../lib/observability-stack';
import { ContainersStack } from '../lib/containers-stack';
import { SimulationStack } from '../lib/simulation-stack';

const app = new cdk.App();

const env: cdk.Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

// 1. Network Stack (VPC, Subnets, Gateway Endpoints)
const networkStack = new NetworkStack(app, 'ResQSyncNetworkStack', { env });

// 2. Auth Stack (Cognito User Pool, App Client, Groups)
new AuthStack(app, 'ResQSyncAuthStack', { env });

// 3. Edge Stack (CloudFront, S3 Website)
new EdgeStack(app, 'ResQSyncEdgeStack', { env });

// 4. Data Stack (Authoritative DynamoDB Single-Table, S3 Evidence)
const dataStack = new DataStack(app, 'ResQSyncDataStack', { env });

// 5. Events Stack (EventBridge Bus, DLQ, SNS)
new EventsStack(app, 'ResQSyncEventsStack', { env });

// 6. Compute Stack (Lambda Execution Role, Core Lambda Handler)
const computeStack = new ComputeStack(app, 'ResQSyncComputeStack', {
  env,
  authoritativeTable: dataStack.authoritativeTable,
});

// 7. API Stack (API Gateway HTTP API)
new ApiStack(app, 'ResQSyncApiStack', {
  env,
  apiLambda: computeStack.apiLambda,
});

// 8. AI Stack (SageMaker Role & Configuration)
new AiStack(app, 'ResQSyncAiStack', { env });

// 9. Observability Stack (CloudWatch Dashboard & Metrics)
new ObservabilityStack(app, 'ResQSyncObservabilityStack', { env });

// 10. Containers Stack (ECS Fargate Cluster)
new ContainersStack(app, 'ResQSyncContainersStack', {
  env,
  vpc: networkStack.vpc,
});

// 11. Simulation Stack (Chaos & Partition Parameters)
new SimulationStack(app, 'ResQSyncSimulationStack', { env });

app.synth();
