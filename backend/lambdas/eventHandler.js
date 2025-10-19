// eventHandler.js
import { SSMClient, GetParametersCommand } from '@aws-sdk/client-ssm'
import pkg from 'pg'
const { Pool } = pkg

const ssm = new SSMClient({ region: process.env.AWS_REGION || 'us-east-1' })
let pool

async function getDBConfig() {
  if (process.env.DB_HOST && process.env.DB_NAME) {
    // use env fallback
    return {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME
    }
  }

  // read from SSM path /lks2/database/
  const res = await ssm.send(new GetParametersCommand({
    Names: [
      '/lks2/database/dbname',
      '/lks2/database/username',
      '/lks2/database/password',
      '/lks2/database/endpoint'
    ],
    WithDecryption: true
  }))

  const map = {}
  res.Parameters.forEach(p => {
    const key = p.Name.split('/').pop()
    map[key] = p.Value
  })

  return {
    host: map.endpoint,
    user: map.username,
    password: map.password,
    database: map.dbname
  }
}

async function getPool() {
  if (!pool) {
    const conf = await getDBConfig()
    pool = new Pool({
      host: conf.host,
      user: conf.user,
      password: conf.password,
      database: conf.database,
      max: 5,
      idleTimeoutMillis: 10000
    })
  }
  return pool
}

export const handler = async (event) => {
  const method = event.httpMethod
  const pool = await getPool()

  try {
    if (method === 'GET') {
      const res = await pool.query('SELECT id, name, date, location, price FROM events ORDER BY date ASC')
      return response(200, res.rows)
    }

    if (method === 'POST') {
      const body = JSON.parse(event.body)
      const { name, date, location, price } = body
      await pool.query('INSERT INTO events(name, date, location, price) VALUES($1,$2,$3,$4)', [name, date, location, price])
      return response(201, { message: 'Event created' })
    }

    if (method === 'PUT') {
      const body = JSON.parse(event.body)
      await pool.query('UPDATE events SET name=$1, date=$2, location=$3, price=$4 WHERE id=$5', [body.name, body.date, body.location, body.price, body.id])
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
    return response(500, { error: 'Internal server error' })
  }
}

function response(statusCode, body) {
  return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
}
