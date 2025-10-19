import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3'

const s3 = new S3Client({ region: 'us-east-1' })

export const handler = async (event) => {
  try {
    for (const record of event.Records) {
      const msg = JSON.parse(record.body)
      const { bucket, key } = msg

      const meta = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
      console.log(`📦 Processed: ${key} | Size: ${meta.ContentLength} bytes`)
    }
    return { statusCode: 200 }
  } catch (err) {
    console.error('SQS Processor error:', err)
    throw err
  }
}