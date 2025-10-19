import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'
import pkg from 'pg'
const { Pool } = pkg

const dynamo = new DynamoDBClient({ region: 'us-east-1' })
const TABLE_NAME = process.env.TICKET_TABLE || 'lks2-ticket-cache'

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
})

export const handler = async (event) => {
  const body = JSON.parse(event.body)
  const { ticketCode, userId } = body

  try {
    const res = await pool.query('SELECT * FROM tickets WHERE code=$1', [ticketCode])
    const ticket = res.rows[0]
    if (!ticket) return response(404, { error: 'Ticket not found' })
    if (ticket.used) return response(400, { error: 'Ticket already used' })

    // Mark ticket as used
    await pool.query('UPDATE tickets SET used=true, validated_by=$1 WHERE code=$2', [userId, ticketCode])

    // Cache validation result to DynamoDB
    await dynamo.send(new PutItemCommand({
      TableName: TABLE_NAME,
      Item: {
        ticketCode: { S: ticketCode },
        validatedBy: { S: userId },
        timestamp: { S: new Date().toISOString() }
      }
    }))

    return response(200, { message: 'Ticket validated successfully' })
  } catch (err) {
    console.error(err)
    return response(500, { error: 'Internal server error' })
  }
}

function response(statusCode, body) {
  return { statusCode, body: JSON.stringify(body) }
}