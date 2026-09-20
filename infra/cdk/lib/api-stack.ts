import * as cdk from 'aws-cdk-lib';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export interface ApiStackProps extends cdk.StackProps {
  apiLambda: lambda.IFunction;
  stage?: 'dev' | 'demo' | 'prod';
}

export class ApiStack extends cdk.Stack {
  public readonly httpApi: apigwv2.HttpApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const lambdaIntegration = new integrations.HttpLambdaIntegration(
      'ApiLambdaIntegration',
      props.apiLambda,
    );

    this.httpApi = new apigwv2.HttpApi(this, 'ResQSyncHttpApi', {
      apiName: `resqsync-http-api${props.stage && props.stage !== 'prod' ? `-${props.stage}` : ''}`,
      description: 'ResQSync Authoritative Disaster Coordination API',
      corsPreflight: {
        allowHeaders: ['Authorization', 'Content-Type', 'X-Client-Id', 'X-Correlation-Id'],
        allowMethods: [
          apigwv2.CorsHttpMethod.GET,
          apigwv2.CorsHttpMethod.POST,
          apigwv2.CorsHttpMethod.PUT,
          apigwv2.CorsHttpMethod.DELETE,
          apigwv2.CorsHttpMethod.OPTIONS,
        ],
        allowOrigins: ['*'],
      },
    });

    // Default catch-all proxy route to core Lambda integration
    this.httpApi.addRoutes({
      path: '/{proxy+}',
      methods: [apigwv2.HttpMethod.ANY],
      integration: lambdaIntegration,
    });

    new cdk.CfnOutput(this, 'HttpApiEndpoint', {
      value: this.httpApi.apiEndpoint,
      description: 'API Gateway HTTP Endpoint URL',
      exportName: `ResQSync-HttpApiEndpoint-${props.stage || 'demo'}`,
    });

    new cdk.CfnOutput(this, 'HttpApiId', {
      value: this.httpApi.apiId,
      description: 'API Gateway HTTP API ID',
    });
  }
}
