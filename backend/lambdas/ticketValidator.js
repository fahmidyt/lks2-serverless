// ticketValidator.js
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'
import pkg from 'pg'
const { Pool } = pkg

const dynamo = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' })
const TICKET_TABLE = process.env.TICKET_TABLE || 'lks2-ticket-cache'

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  max: 2
})

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}')
    const { ticketCode, userId } = body
    if (!ticketCode) return response(400, { error: 'ticketCode required' })

    const res = await pool.query('SELECT id, code, used FROM tickets WHERE code=$1 LIMIT 1', [ticketCode])
    const ticket = res.rows[0]
    if (!ticket) return response(404, { error: 'Ticket not found' })
    if (ticket.used) return response(400, { error: 'Ticket already used' })

    await pool.query('UPDATE tickets SET used=true, validated_by=$1, validated_at=NOW() WHERE code=$2', [userId || 'system', ticketCode])

    await dynamo.send(new PutItemCommand({
      TableName: TICKET_TABLE,
      Item: {
        ticketCode: { S: ticketCode },
        validatedBy: { S: userId || 'system' },
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
  return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
}
