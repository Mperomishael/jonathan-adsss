import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/firebase-admin'
import { updateAdmin, deleteAdmin } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!await verifyAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { role } = await req.json()
    const adminId = params.id

    if (!role) {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 })
    }

    const updatedAdmin = await updateAdmin(adminId, { role })
    return NextResponse.json(updatedAdmin)
  } catch (error) {
    console.error('Failed to update admin:', error)
    return NextResponse.json({ error: 'Failed to update admin' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!await verifyAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const adminId = params.id
    await deleteAdmin(adminId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete admin:', error)
    return NextResponse.json({ error: 'Failed to delete admin' }, { status: 500 })
  }
}