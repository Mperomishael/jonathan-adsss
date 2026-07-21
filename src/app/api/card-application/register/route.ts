import { NextRequest, NextResponse } from 'next/server'
import * as admin from 'firebase-admin'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    console.log('[Card Application] Registering new applicant:', email)

    // Check if user already exists
    let existingUser
    try {
      existingUser = await admin.auth().getUserByEmail(email)
      console.log('[Card Application] User already exists:', email)
      return NextResponse.json(
        { error: 'This email is already registered. Please log in instead.' },
        { status: 409 }
      )
    } catch (e: any) {
      if (e.code !== 'auth/user-not-found') {
        throw e
      }
      // User doesn't exist, continue with registration
    }

    // Create temporary password (users will be prompted to change it)
    const tempPassword = Math.random().toString(36).slice(-12) + 'Temp1!'

    // Create Firebase Auth user
    const userRecord = await admin.auth().createUser({
      email,
      password: tempPassword,
      displayName: email.split('@')[0],
      emailVerified: false,
    })

    console.log('[Card Application] Firebase user created:', userRecord.uid)

    // Create user document in Firestore
    const userRef = admin.firestore().collection('users').doc(userRecord.uid)
    
    await userRef.set({
      uid: userRecord.uid,
      email,
      createdAt: new Date().toISOString(),
      status: 'pending',
      approved: false,
      whitelisted: false,
      cardLevel: 'basic',
      cardNumber: '',
      paymentStatus: 'unpaid',
      paymentMethod: '',
      transactionId: '',
      membershipLevel: 'basic',
      cardsGenerated: 0,
      maxCards: 1,
      fanStatus: 'pending',
      profile: {
        verified: false,
      },
    }, { merge: true })

    console.log('[Card Application] User document created in Firestore')

    // Create card application record
    const applicationsRef = admin.firestore().collection('cardApplications').doc(email)
    
    await applicationsRef.set({
      email,
      uid: userRecord.uid,
      appliedAt: new Date().toISOString(),
      status: 'pending', // pending, approved, rejected
      reviewedAt: null,
      reviewedBy: null,
      notes: '',
    })

    console.log('[Card Application] Application record created')

    return NextResponse.json(
      {
        success: true,
        message: `Account created successfully! Check your email for login details. An admin will review your application shortly.`,
        uid: userRecord.uid,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[Card Application] Registration error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: 500 }
    )
  }
}
