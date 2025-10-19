import { Client } from 'pg'
import { getDBParams } from './ssm.js'

export async function connectDB() {
  const { dbname, username, password, endpoint } = await getDBParams()
  const client = new Client({
    host: endpoint,
    database: dbname,
    user: username,
    password,
    port: 5432,
  })
  await client.connect()
  return client
}