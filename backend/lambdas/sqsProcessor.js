// sqsProcessor.js
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3'

const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' })

export const handler = async (event) => {
  try {
    for (const record of event.Records) {
      // For S3 -> SQS notifications, message body may contain S3 info; here we expect a JSON with bucket/key
      const body = JSON.parse(record.body || '{}')
      const { bucket, key } = body

      if (!bucket || !key) {
        console.log('SQS record missing bucket/key, raw:', record.body)
        continue
      }

      const head = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
      console.log(`Processed object ${key} size=${head.ContentLength}, contentType=${head.ContentType}`)
      // Additional processing: e.g., generate thumbnails, persist metadata to DB, etc.
    }

    return { statusCode: 200 }
  } catch (err) {
    console.error('SQS processor error', err)
    throw err
  }
}
