import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi'

export const handler = async (event) => {
  const routeKey = event.requestContext.routeKey
  const domain = event.requestContext.domainName
  const stage = event.requestContext.stage
  const client = new ApiGatewayManagementApiClient({ endpoint: `https://${domain}/${stage}` })

  if (routeKey === '$connect') return { statusCode: 200 }
  if (routeKey === '$disconnect') return { statusCode: 200 }

  if (routeKey === 'ticketUpdate') {
    const body = JSON.parse(event.body)
    const { connectionId, message } = body

    try {
      await client.send(
        new PostToConnectionCommand({
          ConnectionId: connectionId,
          Data: Buffer.from(JSON.stringify({ message }))
        })
      )
      return { statusCode: 200, body: 'Message sent' }
    } catch (err) {
      console.error('WebSocket send failed:', err)
      return { statusCode: 500, body: 'Failed to send message' }
    }
  }

  return { statusCode: 400, body: 'Invalid route' }
}