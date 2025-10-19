// ticketValidator.js
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'
import { connectDB } from '../utils/db'
import { error, success } from '../utils/response'

const dynamo = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' })
const TICKET_TABLE = process.env.TICKET_TABLE || 'lks2-ticket-cache'


export const handler = async (event) => {
  const client = await connectDB()

  try {
    const body = JSON.parse(event.body || '{}')
    const { ticketCode, userId } = body
    if (!ticketCode) return error({ error: 'ticketCode required' }, 400)

    const res = await client.query('SELECT id, code, used FROM tickets WHERE code=$1 LIMIT 1', [ticketCode])
    const ticket = res.rows[0]
    if (!ticket) return error({ error: 'Ticket not found' }, 404)
    if (ticket.used) return error({ error: 'Ticket already used' }, 400)

    await client.query('UPDATE tickets SET used=true, validated_by=$1, validated_at=NOW() WHERE code=$2', [userId || 'system', ticketCode])

    await dynamo.send(new PutItemCommand({
      TableName: TICKET_TABLE,
      Item: {
        ticketCode: { S: ticketCode },
        validatedBy: { S: userId || 'system' },
        timestamp: { S: new Date().toISOString() }
      }
    }))

    return success({ message: 'Ticket validated successfully' })
  } catch (err) {
    console.error(err)
    return error({ error: 'Internal server error' })
  }
}
