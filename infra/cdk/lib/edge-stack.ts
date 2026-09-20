import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs';

export interface EdgeStackProps extends cdk.StackProps {
  stage?: 'dev' | 'demo' | 'prod';
}

export class EdgeStack extends cdk.Stack {
  public readonly distribution: cloudfront.IDistribution;
  public readonly siteBucket: s3.IBucket;

  constructor(scope: Construct, id: string, props?: EdgeStackProps) {
    super(scope, id, props);

    const isProd = props?.stage === 'prod';
    const removalPolicy = isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY;

    this.siteBucket = new s3.Bucket(this, 'WebHostingBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy,
      autoDeleteObjects: !isProd,
    });

    this.distribution = new cloudfront.Distribution(this, 'EdgeDistribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(this.siteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.seconds(0),
        },
      ],
    });

    new cdk.CfnOutput(this, 'FrontendUrl', {
      value: `https://${this.distribution.distributionDomainName}`,
      description: 'Production Frontend CloudFront HTTPS URL',
      exportName: `ResQSync-FrontendUrl-${props?.stage || 'demo'}`,
    });

    new cdk.CfnOutput(this, 'CloudFrontDistributionId', {
      value: this.distribution.distributionId,
      description: 'CloudFront Distribution ID',
    });

    new cdk.CfnOutput(this, 'WebsiteBucketName', {
      value: this.siteBucket.bucketName,
      description: 'S3 Website Bucket Name',
    });
  }
}
