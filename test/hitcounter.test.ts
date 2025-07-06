import * as cdk from 'aws-cdk-lib';
import { HitCounter } from '../lib/hit-counter';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import { Capture, Match, Template } from 'aws-cdk-lib/assertions';

let stack = new cdk.Stack();
let template: Template;
beforeAll(() => {
    //Create mock construct and assign it to stack
    new HitCounter(stack, 'MyTestConstruct', {
        downstream: new NodejsFunction(stack, "TestFunction", {
            runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
            entry: path.join(__dirname, "../lambda/hello.ts"),
            handler: "handler"
        })
    });
    //Create a template for testing
    template = Template.fromStack(stack);
});

test('DynamoDB Table Created', () => {
    template.resourceCountIs("AWS::DynamoDB::Table", 1);
});

test('Lambda Has Environment Variables', () => {
    const envCapture = new Capture({
        Variables: {
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
            DOWNSTREAM_FUNCTION_NAME: {
                Ref: Match.stringLikeRegexp("TestFunction*")
            },
            HITS_TABLE_NAME: {
                Ref: Match.stringLikeRegexp("MyTestConstructCountTable*")
            }
        }
    });
    template.hasResourceProperties("AWS::Lambda::Function", {
        Environment: envCapture
    });
    console.log(envCapture.asObject());

    expect(envCapture.asObject()).toEqual({
        Variables: {
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
            DOWNSTREAM_FUNCTION_NAME: {
                Ref: expect.stringMatching("TestFunction*")
            },
            HITS_TABLE_NAME: {
                Ref: expect.stringMatching("MyTestConstructCountTable*")
            }
        }
    });
});

test('DynamoDB Table Created With Encryption', () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
        SSESpecification: {
            SSEEnabled: true
        }
    });
});

describe('Validate Min And Max readCapacity', () => {
    test('readCapacity Cant Be Less Than 5', () => {
        const stack1 = new cdk.Stack();

        expect(() => {
            new HitCounter(stack1, 'MyTestConstruct', {
                downstream: new NodejsFunction(stack1, "TestFunction", {
                    runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
                    entry: path.join(__dirname, "../lambda/hello.ts"),
                    handler: "handler",
                }),
                readCapacity: 3
            });
        }).toThrowError("readCapacity must be greater than 5 or less than 20!");
    });

    test('readCapacity Cant Be More Than 20', () => {
        const stack2 = new cdk.Stack();

        expect(() => {
            new HitCounter(stack2, 'MyTestConstruct', {
                downstream: new NodejsFunction(stack2, "TestFunction", {
                    runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
                    entry: path.join(__dirname, "../lambda/hello.ts"),
                    handler: "handler",
                }),
                readCapacity: 25
            });
        }).toThrowError("readCapacity must be greater than 5 or less than 20!");
    });

    test('readCapacity Can Be Valid With Value 12', () => {
        const stack3 = new cdk.Stack();
        
        expect(() => {
            new HitCounter(stack3, 'MyTestConstruct', {
                downstream: new NodejsFunction(stack3, "TestFunction", {
                    runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
                    entry: path.join(__dirname, "../lambda/hello.ts"),
                    handler: "handler",
                }),
                readCapacity: 12
            });
        }).not.toThrowError("readCapacity must be greater than 5 or less than 20!");
    });
});