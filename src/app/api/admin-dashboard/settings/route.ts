import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const configPath = path.join(process.cwd(), 'src/lib/dynamic-settings.json')

async function readConfig() {
  try {
    const data = await fs.readFile(configPath, 'utf8')
    return JSON.parse(data)
  } catch {
    return {
      price: 25.00,
      paymentMethods: {
        btc: { enabled: true, address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' },
        usdt: { enabled: true, address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
        cashapp: { enabled: true, tag: '$JonathanRoumieFan' }
      },
      admin: {
        username: 'admin',
        password: 'Bigadmin123'
      }
    }
  }
}

async function writeConfig(config: any) {
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8')
}

export async function GET() {
  const config = await readConfig()
  const publicConfig = {
    price: config.price,
    paymentMethods: config.paymentMethods
  }
  return NextResponse.json(publicConfig)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const current = await readConfig()

    if (body.action === 'login') {
      const { username, password } = body
      if (username === current.admin.username && password === current.admin.password) {
        return NextResponse.json({ success: true, token: 'session_token_admin_authorized' })
      }
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
    }

    const authHeader = req.headers.get('Authorization')
    if (authHeader !== 'Bearer session_token_admin_authorized' && body.action !== 'login') {
      return NextResponse.json({ error: 'Unauthorized operation session' }, { status: 401 })
    }

    if (body.action === 'change_password') {
      const { currentPassword, newPassword } = body
      if (currentPassword !== current.admin.password) {
        return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 })
      }
      if (!newPassword || newPassword.length < 4) {
        return NextResponse.json({ error: 'New password is too short' }, { status: 400 })
      }
      current.admin.password = newPassword
      await writeConfig(current)
      return NextResponse.json({ success: true, message: 'Password updated successfully' })
    }

    const updated = {
      ...current,
      price: typeof body.price === 'number' ? body.price : current.price,
      paymentMethods: {
        btc: {
          enabled: body.paymentMethods?.btc?.enabled ?? current.paymentMethods.btc.enabled,
          address: body.paymentMethods?.btc?.address ?? current.paymentMethods.btc.address,
        },
        usdt: {
          enabled: body.paymentMethods?.usdt?.enabled ?? current.paymentMethods.usdt.enabled,
          address: body.paymentMethods?.usdt?.address ?? current.paymentMethods.usdt.address,
        },
        cashapp: {
          enabled: body.paymentMethods?.cashapp?.enabled ?? current.paymentMethods.cashapp.enabled,
          tag: body.paymentMethods?.cashapp?.tag ?? current.paymentMethods.cashapp.tag,
        }
      }
    }

    await writeConfig(updated)
    return NextResponse.json({ success: true, config: { price: updated.price, paymentMethods: updated.paymentMethods } })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update settings' }, { status: 500 })
  }
}
