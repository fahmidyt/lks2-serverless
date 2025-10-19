import { SSMClient, GetParametersByPathCommand } from '@aws-sdk/client-ssm'
import pkg from 'pg'
const { Pool } = pkg

let pool
const ssm = new SSMClient({ region: 'us-east-1' })

async function getDBConfig() {
  const data = await ssm.send(new GetParametersByPathCommand({
    Path: '/lks2/database/',
    WithDecryption: true
  }))
  const params = {}
  data.Parameters.forEach(p => {
    const key = p.Name.split('/').pop()
    params[key] = p.Value
  })
  return params
}

async function getPool() {
  if (!pool) {
    const conf = await getDBConfig()
    pool = new Pool({
      host: conf.endpoint,
      user: conf.username,
      password: conf.password,
      database: conf.dbname
    })
  }
  return pool
}

export const handler = async (event) => {
  const method = event.httpMethod
  const pool = await getPool()

  try {
    if (method === 'GET') {
      const { rows } = await pool.query('SELECT * FROM events ORDER BY date ASC')
      return response(200, rows)
    }

    if (method === 'POST') {
      const body = JSON.parse(event.body)
      const { name, date, location, price } = body
      await pool.query(
        'INSERT INTO events (name, date, location, price) VALUES ($1, $2, $3, $4)',
        [name, date, location, price]
      )
      return response(201, { message: 'Event created' })
    }

    if (method === 'PUT') {
      const body = JSON.parse(event.body)
      await pool.query(
        'UPDATE events SET name=$1, date=$2, location=$3, price=$4 WHERE id=$5',
        [body.name, body.date, body.location, body.price, body.id]
      )
      return response(200, { message: 'Event updated' })
    }

    if (method === 'DELETE') {
      const id = event.pathParameters?.id
      await pool.query('DELETE FROM events WHERE id=$1', [id])
      return response(200, { message: 'Event deleted' })
    }

    return response(405, { error: 'Method not allowed' })
  } catch (err) {
    console.error(err)
    return response(500, { error: 'Server error' })
  }
}

function response(statusCode, body) {
  return { statusCode, body: JSON.stringify(body) }
}