import jwt from 'jsonwebtoken'

const SECRET = 'lks2-secret' // ideally from SSM

export const handler = async (event) => {
  const token = event.authorizationToken
  const deviceId = event.headers?.deviceid || 'unknown'

  try {
    const decoded = jwt.verify(token, SECRET)
    return {
      principalId: decoded.userId,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: event.methodArn,
          },
        ],
      },
      context: { deviceId },
    }
  } catch (err) {
    throw new Error('Unauthorized')
  }
}