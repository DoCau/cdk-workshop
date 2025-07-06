import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs';

export class WorkshopPipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        new cdk.aws_codecommit.Repository(this, 'WorkshopRepo', {
            repositoryName: 'WorkshopRepo'
        });
    }
}