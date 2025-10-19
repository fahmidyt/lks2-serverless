// websocket.js
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi'

export const handler = async (event) => {
  const routeKey = event.requestContext.routeKey
  const domain = event.requestContext.domainName
  const stage = event.requestContext.stage
  const endpoint = `https://${domain}/${stage}`

  // ApiGatewayManagementApi requires endpoint that matches the websocket domain/stage
  const client = new ApiGatewayManagementApiClient({ endpoint })

  try {
    if (routeKey === '$connect') {
      return { statusCode: 200 }
    }

    if (routeKey === '$disconnect') {
      return { statusCode: 200 }
    }

    // custom route 'ticketUpdate'
    if (routeKey === 'ticketUpdate') {
      const body = JSON.parse(event.body || '{}')
      const { connectionId, message } = body

      if (!connectionId || !message) {
        return { statusCode: 400, body: 'connectionId & message required' }
      }

      await client.send(new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: Buffer.from(JSON.stringify({ message }))
      }))

      return { statusCode: 200, body: 'Sent' }
    }

    return { statusCode: 400, body: 'Invalid route' }
  } catch (err) {
    console.error('Websocket error', err)
    return { statusCode: 500, body: 'Server error' }
  }
}
