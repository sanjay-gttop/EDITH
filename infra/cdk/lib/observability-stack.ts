import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';

export class ObservabilityStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const dashboard = new cloudwatch.Dashboard(this, 'ResQSyncOpsDashboard', {
      dashboardName: 'ResQSync-Operations',
    });

    dashboard.addWidgets(
      new cloudwatch.TextWidget({
        markdown: '# ResQSync Operational Telemetry\nReal-time monitoring of offline synchronization, reconciliation conflicts, and API latencies.',
        width: 24,
        height: 2,
      }),
    );

    new cdk.CfnOutput(this, 'DashboardName', {
      value: dashboard.dashboardName,
      description: 'Operations CloudWatch Dashboard Name',
    });
  }
}
