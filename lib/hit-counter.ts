import * as cdk from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as path from "path";

export interface HitCounterProps {
    //the lambda function that'll be invoked once counter is hit
    downstream: cdk.aws_lambda.IFunction;
    readCapacity?: number
}

export class HitCounter extends Construct {

    public readonly handler: cdk.aws_lambda.IFunction;
    public readonly table: cdk.aws_dynamodb.ITable;

    constructor(scope: Construct, id: string, props: HitCounterProps) {
        if (props.readCapacity !== undefined && (props.readCapacity < 5 || props.readCapacity > 20)) {
            throw new Error("readCapacity must be greater than 5 or less than 20!");
        }
        super(scope, id);

        const table = new cdk.aws_dynamodb.Table(this, "CountTable", {
            partitionKey: { name: "path", type: cdk.aws_dynamodb.AttributeType.STRING },
            billingMode: props.readCapacity !== undefined ? cdk.aws_dynamodb.BillingMode.PROVISIONED : cdk.aws_dynamodb.BillingMode.PAY_PER_REQUEST,
            encryption: cdk.aws_dynamodb.TableEncryption.AWS_MANAGED,
            ...(props.readCapacity !== undefined && {readCapacity: props.readCapacity})
        });

        this.table = table;

        this.handler = new NodejsFunction(this, "HitCounterHandler", {
            runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
            handler: "handler",
            entry: path.join(__dirname, "../lambda/hitcounter.ts"),
            environment: {
                AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
                DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
                HITS_TABLE_NAME: table.tableName
            }
        })

        //grant access to handler so it can read-write data to dynamoDB table
        table.grantReadWriteData(this.handler);
        //grant access to handler so it can invoke other functions
        props.downstream.grantInvoke(this.handler);
    }
}