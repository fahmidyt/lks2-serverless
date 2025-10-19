// auth.js
import jwt from 'jsonwebtoken'
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb'

const dynamo = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' })
const TOKEN_TABLE = process.env.TOKEN_TABLE || 'lks2-user-tokens'
const JWT_SECRET = process.env.JWT_SECRET || 'change-me'

export const handler = async (event) => {
  try {
    const tokenHeader = event.authorizationToken || ''
    const token = tokenHeader.replace('Bearer ', '').trim()
    if (!token) throw new Error('Unauthorized')

    // verify JWT
    const decoded = jwt.verify(token, JWT_SECRET)
    const userId = decoded.sub

    // check token exists in DynamoDB
    const res = await dynamo.send(new GetItemCommand({
      TableName: TOKEN_TABLE,
      Key: {
        token: { S: token },
        userId: { S: userId }
      }
    }))

    if (!res.Item) throw new Error('Token not found')

    const principalId = userId
    const policyDocument = {
      Version: '2012-10-17',
      Statement: [{
        Action: 'execute-api:Invoke',
        Effect: 'Allow',
        Resource: event.methodArn
      }]
    }

    return {
      principalId,
      policyDocument,
      context: { userId }
    }
  } catch (err) {
    console.error('Authorizer error', err && err.message)
    throw new Error('Unauthorized') // API Gateway expects an error for denied calls
  }
}
