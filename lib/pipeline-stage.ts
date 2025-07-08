import { Stage, StageProps } from "aws-cdk-lib";
import * as cdk from 'aws-cdk-lib';
import { CdkWorkshopStack } from "./cdk-workshop-stack";
import { Construct } from "constructs";

export class WorkshopPipelineStage extends Stage {
    public readonly hcViewerUrl: cdk.CfnOutput;
    public readonly hcEndpoint: cdk.CfnOutput;

    constructor(scope: Construct, id: string, props?: StageProps) {
        super(scope, id, props);

        const service = new CdkWorkshopStack(this, 'WebService');

        this.hcEndpoint = service.hcEndpoint;
        this.hcViewerUrl = service.hcViewerUrl;
    }
}