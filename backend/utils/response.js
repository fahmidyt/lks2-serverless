export const success = (data, statusCode = 200) => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization,deviceid,Content-Type',
  },
  body: JSON.stringify(data),
})

export const error = (message, statusCode = 500) => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
  body: JSON.stringify({ error: message }),
})