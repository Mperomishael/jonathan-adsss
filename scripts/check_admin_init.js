const fs = require('fs')
const path = require('path')

function loadEnv(file) {
  const p = path.resolve(file)
  if (!fs.existsSync(p)) return {}
  const lines = fs.readFileSync(p, 'utf8').split(/\n/) 
  const env = {}
  for (let line of lines) {
    line = line.trim()
    if (!line || line.startsWith('#')) continue
    const idx = line.indexOf('=')
    if (idx === -1) continue
    let key = line.slice(0, idx)
    let val = line.slice(idx + 1)
    // remove surrounding quotes if present
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    env[key] = val
  }
  return env
}

(async () => {
  try {
    const env = loadEnv('./.env.local')
    Object.assign(process.env, env)

    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
    let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY

    if (!projectId || !clientEmail || !privateKey) {
      console.error('Missing FIREBASE_ADMIN_* env values')
      process.exit(2)
    }

    // Replace literal \n sequences with actual newlines
    privateKey = privateKey.replace(/\\n/g, '\n')

    const admin = require('firebase-admin')
    try {
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      })
    } catch (e) {
      // if already initialized, get the app
      if (e.message && e.message.includes('already exists')) {
        // ignore
      } else {
        throw e
      }
    }

    const db = admin.firestore()
    const auth = admin.auth()

    console.log('Firebase Admin initialized successfully')
    // try a simple read to verify permissions (list collections)
    const collections = await db.listCollections()
    console.log('Found', collections.length, 'top-level collections')
    process.exit(0)
  } catch (err) {
    console.error('Firebase Admin init failed:', err && err.message ? err.message : err)
    process.exit(1)
  }
})()
