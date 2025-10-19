import jwt from 'jsonwebtoken'
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb'

const dynamo = new DynamoDBClient({ region: 'us-east-1' })
const TABLE_NAME = process.env.TOKEN_TABLE || 'lks2-user-tokens'

export const handler = async (event) => {
  try {
    const token = event.authorizationToken?.replace('Bearer ', '')
    if (!token) throw new Error('Unauthorized')

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.sub

    // Check token existence in DynamoDB
    const res = await dynamo.send(new GetItemCommand({
      TableName: TABLE_NAME,
      Key: {
        token: { S: token },
        userId: { S: userId }
      }
    }))

    if (!res.Item) throw new Error('Invalid token')

    return {
      principalId: userId,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: event.methodArn
          }
        ]
      },
      context: { userId }
    }
  } catch (err) {
    console.error('Auth error:', err)
    throw new Error('Unauthorized')
  }
}