import { APIGatewayProxyEvent } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEvent) => {
    return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/plain' },
        body: `Hello, CDK! You've hit ${event.path}\n`
    }
};