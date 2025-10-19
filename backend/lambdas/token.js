// token.js
import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'

const dynamo = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' })
const TOKEN_TABLE = process.env.TOKEN_TABLE || 'lks2-user-tokens'
const JWT_SECRET = process.env.JWT_SECRET || 'change-me'

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}')
    const { username, password } = body

    // NOTE: in exam sandbox we often accept any credentials — replace with real auth if needed
    if (!username || !password) {
      return response(400, { error: 'username & password required' })
    }

    // create simple JWT
    const token = jwt.sign({ sub: username }, JWT_SECRET, { expiresIn: '6h', jwtid: randomUUID() })

    // store token in DynamoDB (session store)
    await dynamo.send(new PutItemCommand({
      TableName: TOKEN_TABLE,
      Item: {
        token: { S: token },
        userId: { S: username },
        createdAt: { S: new Date().toISOString() }
      }
    }))

    return response(200, { token })
  } catch (err) {
    console.error(err)
    return response(500, { error: 'internal error' })
  }
}

function response(statusCode, body) {
  return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
}
