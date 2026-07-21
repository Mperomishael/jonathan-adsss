import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const news = [
    {
      id: 1,
      title: 'Birthday Celebration',
      image: '/images/news/birthday.jpg',
      date: '2024-04-15',
      excerpt: 'Jonathan celebrates with fans worldwide'
    },
    {
      id: 2,
      title: 'Exclusive Interview',
      image: '/images/news/interview.jpg',
      date: '2024-04-10',
      excerpt: 'Behind the scenes interview'
    },
    {
      id: 3,
      title: 'New Movie Announcement',
      image: '/images/news/movie.jpg',
      date: '2024-04-05',
      excerpt: 'Upcoming film projects revealed'
    }
  ]
  return NextResponse.json(news)
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
