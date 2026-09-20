import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export interface ComputeStackProps extends cdk.StackProps {
  authoritativeTable: dynamodb.ITable;
}

export class ComputeStack extends cdk.Stack {
  public readonly apiLambda: lambda.IFunction;

  constructor(scope: Construct, id: string, props: ComputeStackProps) {
    super(scope, id, props);

    // Least privilege execution role
    const lambdaRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // Authoritative table read/write grant
    props.authoritativeTable.grantReadWriteData(lambdaRole);

    this.apiLambda = new lambda.Function(this, 'CoreApiHandler', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        exports.handler = async (event) => {
          return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'HEALTHY', message: 'ResQSync Core Lambda Handler' }),
          };
        };
      `),
      role: lambdaRole,
      environment: {
        TABLE_NAME: props.authoritativeTable.tableName,
        NODE_OPTIONS: '--enable-source-maps',
      },
      timeout: cdk.Duration.seconds(10),
      memorySize: 512,
    });

    new cdk.CfnOutput(this, 'ApiLambdaArn', {
      value: this.apiLambda.functionArn,
      description: 'Core API Lambda Handler ARN',
    });
  }
}
