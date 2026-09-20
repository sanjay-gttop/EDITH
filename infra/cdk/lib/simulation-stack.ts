import * as cdk from 'aws-cdk-lib';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

export class SimulationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // SSM Parameter controlling network partition simulation flag
    const partitionFlag = new ssm.StringParameter(this, 'PartitionSimulationFlag', {
      parameterName: '/resqsync/simulation/partition-active',
      stringValue: 'false',
      description: 'Controls whether simulated network partition drops packets across responder test devices',
    });

    new cdk.CfnOutput(this, 'SimulationParameterName', {
      value: partitionFlag.parameterName,
      description: 'Simulation Active SSM Parameter',
    });
  }
}
