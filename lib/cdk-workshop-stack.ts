import * as cdk from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { HitCounter } from './hit-counter';
import { TableViewer } from 'cdk-dynamo-table-viewer';
import * as path from 'path';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkWorkshopStack extends cdk.Stack {
  public readonly hcViewerUrl: cdk.CfnOutput;
  public readonly hcEndpoint: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambda = new NodejsFunction(this, "LambdaHandler", {
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, "../lambda/hello.ts"),
      handler: "handler"
    });
    
    const hitCounter = new HitCounter(this, 'HitCounter', {
      downstream: lambda
    });
    
    const gateway = new cdk.aws_apigateway.LambdaRestApi(this, "APIEndPoint", {
      handler: hitCounter.handler
    });

    const tableViewer = new TableViewer(this, 'DynamoDataTableView', {
      title: 'Hits Counter',
      table: hitCounter.table,
      sortBy: "hits"
    });

    this.hcEndpoint = new cdk.CfnOutput(this, 'GatewayUrl', {
      value: gateway.url
    });

    // this.hcViewerUrl = new cdk.CfnOutput(this, 'TableViewerUrl', {
    //   value: tableViewer.endpoint
    // });
  }
}
