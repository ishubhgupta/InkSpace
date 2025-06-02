import { NextRequest, NextResponse } from 'next/server'
import { generateUploadUrl } from '@/lib/aws/s3'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileName, fileType } = body

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: 'fileName and fileType are required' },
        { status: 400 }
      )
    }

    const uploadUrl = await generateUploadUrl(fileName, fileType)

    return NextResponse.json({ uploadUrl })
  } catch (error) {
    console.error('Error generating upload URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    )
  }
}
