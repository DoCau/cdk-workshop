import { Stage, StageProps } from "aws-cdk-lib";
import { CdkWorkshopStack } from "./cdk-workshop-stack";
import { Construct } from "constructs";

export class WorkshopPipelineStage extends Stage {
    constructor(scope: Construct, id: string, props?: StageProps){
        super(scope, id, props);

        new CdkWorkshopStack(this, 'WebService');
    }
}