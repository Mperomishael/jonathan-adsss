import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest, getDecodedToken } from '@/lib/firebase-admin'
import { getAllPageContent, updatePageContent } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!await verifyAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const content = await getAllPageContent()
    return NextResponse.json(content)
  } catch (error: any) {
    console.error('Get catalog error:', error)
    return NextResponse.json({ error: error.message || 'Failed to get catalog' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  if (!await verifyAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const decoded = await getDecodedToken(req)
    const updatedBy = decoded?.email || 'admin'
    const { section, content, image } = await req.json()

    if (!section) {
      return NextResponse.json({ error: 'Section is required' }, { status: 400 })
    }

    await updatePageContent(section, { content, image }, updatedBy)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Update catalog error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update catalog' }, { status: 500 })
  }
}
