// eventHandler.js

import { connectDB } from "../utils/db"
import { error, success } from "../utils/response"

export const handler = async (event) => {
  const method = event.httpMethod
  const client = await connectDB()

  try {
    if (method === 'GET') {
      const res = await client.query('SELECT id, name, date, location, price FROM events ORDER BY date ASC')
      return success(res.rows)
    }

    if (method === 'POST') {
      const body = JSON.parse(event.body)
      const { name, date, location, price } = body
      await pool.query('INSERT INTO events(name, date, location, price) VALUES($1,$2,$3,$4)', [name, date, location, price])
      return success({ message: 'Event created' }, 201)
    }

    if (method === 'PUT') {
      const body = JSON.parse(event.body)
      await pool.query('UPDATE events SET name=$1, date=$2, location=$3, price=$4 WHERE id=$5', [body.name, body.date, body.location, body.price, body.id])
      return success({ message: 'Event updated' })
    }

    if (method === 'DELETE') {
      const id = event.pathParameters?.id
      await pool.query('DELETE FROM events WHERE id=$1', [id])
      return success({ message: 'Event deleted' })
    }

    return error({ error: 'Method not allowed' }, 405)
  } catch (err) {
    console.error(err)
    return error({ error: 'Internal server error' })
  }
}

