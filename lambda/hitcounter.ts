import { APIGatewayProxyEvent } from "aws-lambda";
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';

export const handler = async function (event: APIGatewayProxyEvent): Promise<string> {
    console.log("request: ", JSON.stringify(event, undefined, 2));

    //create clients
    const dynamoClient = new DynamoDBClient({});
    const dynamoDocClient = DynamoDBDocumentClient.from(dynamoClient);
    const lambdaClient = new LambdaClient();

    //update Dynamo entry for "path" with hits++
    const updateInput = {
        TableName: process.env.HITS_TABLE_NAME,
        Key: { path: event.path },
        UpdateExpression: "ADD hits :incr",
        ExpressionAttributeValues: {":incr": 1}
    };

    const updateCommand = new UpdateCommand(updateInput);
    await dynamoDocClient.send(updateCommand);

    //call downstream function and capture response
    const invokeInput = {
        FunctionName: process.env.DOWNSTREAM_FUNCTION_NAME,
        Payload: JSON.stringify(event)
    };
    const command = new InvokeCommand(invokeInput);
    const response = await lambdaClient.send(command);

    console.log("response: ", JSON.stringify(response, undefined, 2));

    return JSON.parse(Buffer.from(response.Payload || "").toString("utf8"));
}