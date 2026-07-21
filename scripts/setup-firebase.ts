/**
 * Firebase Setup Script
 * 
 * This script initializes the required Firestore collections and documents
 * for the admin management system.
 * 
 * Run this ONCE when setting up your Firebase project:
 * npx ts-node scripts/setup-firebase.ts
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import * as path from 'path'

// Initialize Firebase Admin
const serviceAccountPath = path.resolve(process.env.FIREBASE_ADMIN_KEY_PATH || './firebase-service-account.json')

try {
  const serviceAccount = require(serviceAccountPath)
  
  initializeApp({
    credential: cert(serviceAccount),
  })
} catch (e) {
  console.error('ERROR: Could not load service account key.')
  console.error('Set FIREBASE_ADMIN_KEY_PATH environment variable pointing to your service account JSON file.')
  console.error('Download from: Firebase Console > Project Settings > Service Accounts > Generate New Private Key')
  process.exit(1)
}

const db = getFirestore()

async function setupFirebase() {
  console.log('🚀 Setting up Firebase collections...\n')

  try {
    // 1. Create admins collection with the two super admins
    console.log('1️⃣ Creating admins collection...')
    
    const superAdminEmails = [
      'empiredigitalsworldwide@gmail.com',
      'empiredigitalsceo@gmail.com',
    ]

    for (const email of superAdminEmails) {
      await db.collection('admins').doc(email).set(
        {
          email,
          role: 'super-admin',
          verified: true,
          createdAt: new Date().toISOString(),
          status: 'active',
        },
        { merge: true }
      )
      console.log(`   ✓ Added admin: ${email}`)
    }

    // 2. Create pageSettings collection with default fan card settings
    console.log('\n2️⃣ Creating pageSettings collection...')
    
    await db.collection('pageSettings').doc('fanCard').set(
      {
        price: 5000, // $50.00 in cents
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
        accentColor: '#FF0000',
        logoUrl: '/images/jvcd-avatar.jpg',
        footerText: 'OFFICIAL JONATHAN ROUMIE WORLD FAN CARD',
        antiScreenshot: true,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    )
    console.log('   ✓ Created fanCard settings')

    // 3. Create wallet settings
    await db.collection('pageSettings').doc('wallets').set(
      {
        btc: '',
        usdt: '',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    )
    console.log('   ✓ Created wallet settings')

    // 4. Create page control settings
    await db.collection('pageSettings').doc('pageControl').set(
      {
        maintenanceMode: false,
        showFanCard: true,
        showWallets: true,
        showRewards: true,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    )
    console.log('   ✓ Created page control settings')

    console.log('\n✅ Firebase setup completed successfully!\n')
    console.log('📝 Next steps:')
    console.log('   1. Ensure your two admin emails are registered in Firebase Authentication')
    console.log('   2. Visit /admin to test the login')
    console.log('   3. Start managing your fan card, wallets, and rewards in real-time!')
    
  } catch (error) {
    console.error('\n❌ Error during setup:', error)
    process.exit(1)
  }

  process.exit(0)
}

setupFirebase()
