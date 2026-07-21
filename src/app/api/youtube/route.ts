import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const clips = [
    {
      id: 1,
      title: 'Blood Sport Action Scene',
      thumbnail: '/images/clips/bloodsportclip.jpg',
      videoId: 'dQw4w9WgXcQ'
    },
    {
      id: 2,
      title: 'We Die Young Clip',
      thumbnail: '/images/clips/wedieyoung.jpg',
      videoId: 'dQw4w9WgXcQ'
    }
  ]
  return NextResponse.json(clips)
}
