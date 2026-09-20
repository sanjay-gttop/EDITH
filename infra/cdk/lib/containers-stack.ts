import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import { Construct } from 'constructs';

export interface ContainersStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
}

export class ContainersStack extends cdk.Stack {
  public readonly cluster: ecs.ICluster;

  constructor(scope: Construct, id: string, props: ContainersStackProps) {
    super(scope, id, props);

    this.cluster = new ecs.Cluster(this, 'ResQSyncCluster', {
      vpc: props.vpc,
      clusterName: 'resqsync-services-cluster',
      containerInsights: true,
    });

    new cdk.CfnOutput(this, 'ClusterName', {
      value: this.cluster.clusterName,
      description: 'ECS Fargate Worker Cluster Name',
    });
  }
}
