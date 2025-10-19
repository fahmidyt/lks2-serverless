import AWS from 'aws-sdk'
const ssm = new AWS.SSM()

export async function getDBParams() {
  const keys = ['dbname', 'username', 'password', 'endpoint']
  const path = '/lks2/database/'
  const results = {}

  for (const key of keys) {
    const param = await ssm.getParameter({ Name: `${path}${key}`, WithDecryption: true }).promise()
    results[key] = param.Parameter.Value
  }

  return results
}