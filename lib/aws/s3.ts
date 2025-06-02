import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function generateUploadUrl(fileName: string, fileType: string): Promise<string> {
  const key = `uploads/${Date.now()}-${fileName}`
  
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    ContentType: fileType,
  })

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
  return signedUrl
}

export async function uploadToS3(file: File): Promise<string> {
  const fileName = file.name
  const fileType = file.type
  
  // Generate upload URL
  const uploadUrl = await generateUploadUrl(fileName, fileType)
  
  // Upload file to S3
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': fileType,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to upload file to S3')
  }

  // Return the public URL
  const key = uploadUrl.split('?')[0].split('/').slice(-2).join('/')
  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
}

export async function deleteFromS3(fileUrl: string): Promise<void> {
  // Extract key from URL
  const url = new URL(fileUrl)
  const key = url.pathname.substring(1) // Remove leading slash

  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
  })

  await s3Client.send(command)
}