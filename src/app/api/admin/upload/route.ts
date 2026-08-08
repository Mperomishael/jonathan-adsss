import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/firebase-admin'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const ALLOWED_FOLDERS = new Set(['products', 'gallery', 'fan-card', 'catalog', 'content'])
const MAX_BYTES = 8 * 1024 * 1024

/**
 * Local web upload — saves under public/uploads/{folder}/
 * Works on local `next dev` / self-host. On Vercel the filesystem is ephemeral
 * across deploys; prefer keeping important assets under public/images or re-upload after deploy.
 */
export async function POST(req: NextRequest) {
  if (!(await verifyAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const form = await req.formData()
    const file = form.get('file')
    const folderRaw = String(form.get('folder') || 'products')
    const folder = ALLOWED_FOLDERS.has(folderRaw) ? folderRaw : 'products'

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const blob = file as File
    if (!blob.type?.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }
    if (blob.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Image must be under 8MB' }, { status: 400 })
    }

    const extFromName = path.extname(blob.name || '').toLowerCase()
    const extFromType =
      blob.type === 'image/png'
        ? '.png'
        : blob.type === 'image/webp'
          ? '.webp'
          : blob.type === 'image/gif'
            ? '.gif'
            : '.jpg'
    const ext = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(extFromName)
      ? extFromName
      : extFromType

    const safeBase = (blob.name || 'image')
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .slice(0, 60)
    const filename = `${Date.now()}-${randomBytes(4).toString('hex')}-${safeBase}${ext}`

    const dir = path.join(process.cwd(), 'public', 'uploads', folder)
    await mkdir(dir, { recursive: true })
    const fullPath = path.join(dir, filename)

    const buffer = Buffer.from(await blob.arrayBuffer())
    await writeFile(fullPath, buffer)

    const url = `/uploads/${folder}/${filename}`
    return NextResponse.json({ url, path: url })
  } catch (e: any) {
    console.error('[upload]', e)
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 500 })
  }
}
