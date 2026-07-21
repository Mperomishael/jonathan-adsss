import admin from 'firebase-admin'
import * as fs from 'fs'
import * as path from 'path'

// Initialize Firebase Admin
const serviceAccountPath = process.env.FIREBASE_ADMIN_KEY_PATH || './firebase-service-account.json'

if (!fs.existsSync(serviceAccountPath)) {
  console.error('Service account file not found at:', serviceAccountPath)
  console.error('Set FIREBASE_ADMIN_KEY_PATH environment variable or ensure firebase-service-account.json exists')
  process.exit(1)
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))

// Initialize with the correct credential method
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
  projectId: serviceAccount.project_id,
})

const auth = admin.auth()
const db = admin.firestore()

const SUPER_ADMINS = [
  {
    email: 'empiredigitalsworldwide@gmail.com',
    password: 'Bigadmin222',
  },
  {
    email: 'empiredigitalsceo@gmail.com',
    password: 'Bigadmin222',
  },
]

async function initializeSuperAdmins() {
  console.log('🚀 Initializing super-admin accounts...\n')

  for (const adminConfig of SUPER_ADMINS) {
    try {
      console.log(`Processing: ${adminConfig.email}`)

      // Check if user exists
      let user
      try {
        user = await auth.getUserByEmail(adminConfig.email)
        console.log(`✓ User already exists: ${adminConfig.email}`)
      } catch (err: any) {
        if (err.code === 'auth/user-not-found') {
          // Create new user
          user = await auth.createUser({
            email: adminConfig.email,
            password: adminConfig.password,
          })
          console.log(`✓ Created new user: ${adminConfig.email}`)
        } else {
          throw err
        }
      }

      // Update Firestore admin record
      const adminRef = db.collection('admins').doc(adminConfig.email)
      const adminDoc = await adminRef.get()

      if (adminDoc.exists) {
        console.log(`✓ Admin record already exists in Firestore`)
      } else {
        await adminRef.set({
          email: adminConfig.email,
          role: 'super-admin',
          verified: true,
          createdAt: new Date().toISOString(),
        })
        console.log(`✓ Created admin record in Firestore`)
      }

      console.log(`✓ ${adminConfig.email} is ready to use\n`)
    } catch (error: any) {
      console.error(`✗ Error processing ${adminConfig.email}:`, error.message)
    }
  }

  console.log('✅ Super-admin initialization complete!')
  console.log('\nYou can now login with:')
  SUPER_ADMINS.forEach((admin) => {
    console.log(`  Email: ${admin.email}`)
    console.log(`  Password: ${admin.password}`)
    console.log()
  })

  process.exit(0)
}

initializeSuperAdmins().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
