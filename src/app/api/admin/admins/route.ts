import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/firebase-admin'
import { getAdmins, createAdmin } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!await verifyAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const admins = await getAdmins()
    return NextResponse.json(admins)
  } catch (error) {
    console.error('Failed to get admins:', error)
    return NextResponse.json({ error: 'Failed to get admins' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!await verifyAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { email, role = 'admin' } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if admin already exists
    const existingAdmins = await getAdmins()
    if (existingAdmins.some(admin => admin.email === email)) {
      return NextResponse.json({ error: 'Admin already exists' }, { status: 400 })
    }

    const admin = await createAdmin(email, role)
    return NextResponse.json(admin)
  } catch (error) {
    console.error('Failed to create admin:', error)
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 })
  }
}