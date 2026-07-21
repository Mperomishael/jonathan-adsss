import { getFanCardSettings } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const settings = await getFanCardSettings()
    return Response.json({ price: settings.price })
  } catch {
    return Response.json({ price: 499 }) // cents fallback
  }
}