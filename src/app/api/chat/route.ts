import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const threadId = req.nextUrl.searchParams.get('threadId')
  if (!threadId) return NextResponse.json({ messages: [] })

  const db = getDb()
  const snap = await db
    .collection('chatThreads')
    .doc(threadId)
    .collection('messages')
    .orderBy('createdAt', 'asc')
    .limit(200)
    .get()

  const messages = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  return NextResponse.json({ messages })
}

export async function POST(req: NextRequest) {
  try {
    const { threadId, text, sender, guestName } = await req.json()
    if (!text?.trim()) {
      return NextResponse.json({ error: 'Empty message' }, { status: 400 })
    }

    const db = getDb()
    const now = new Date().toISOString()
    let id = threadId as string | undefined

    if (!id) {
      const ref = await db.collection('chatThreads').add({
        guestName: guestName || 'Guest',
        createdAt: now,
        updatedAt: now,
        lastMessage: text.trim(),
        unreadAdmin: sender === 'user' ? 1 : 0,
        unreadUser: sender === 'admin' ? 1 : 0,
      })
      id = ref.id
    } else {
      await db.collection('chatThreads').doc(id).set(
        {
          updatedAt: now,
          lastMessage: text.trim(),
          ...(sender === 'user'
            ? { unreadAdmin: (await getUnread(db, id, 'unreadAdmin')) + 1 }
            : { unreadUser: (await getUnread(db, id, 'unreadUser')) + 1 }),
        },
        { merge: true }
      )
    }

    const msgRef = await db.collection('chatThreads').doc(id).collection('messages').add({
      text: text.trim(),
      sender: sender === 'admin' ? 'admin' : 'user',
      createdAt: now,
    })

    return NextResponse.json({ threadId: id, messageId: msgRef.id })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e.message || 'Chat failed' }, { status: 500 })
  }
}

async function getUnread(db: FirebaseFirestore.Firestore, id: string, field: string) {
  const doc = await db.collection('chatThreads').doc(id).get()
  return Number(doc.data()?.[field] || 0)
}
