'use client'

import { initializeApp, getApps } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  signInAnonymously,
  signOut,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = typeof window !== 'undefined'
  ? getApps().length
    ? getApps()[0]
    : initializeApp(firebaseConfig)
  : null

export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null
export const storage = app ? getStorage(app) : null

const provider = app ? new GoogleAuthProvider() : null

if (provider) {
  provider.setCustomParameters({ prompt: 'select_account' })
}

if (auth) {
  void setPersistence(auth, browserLocalPersistence).catch(() => {})
}

export async function loginWithGoogleRedirect(): Promise<void> {
  if (!auth || !provider) throw new Error('Firebase not initialized')
  await signInWithRedirect(auth, provider)
}

export const signInWithGoogle = loginWithGoogleRedirect

export function onAuthChange(callback: (user: any) => void) {
  if (!auth) {
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(auth, callback)
}

export async function userSignOut() {
  if (!auth) throw new Error('Firebase not initialized')
  return signOut(auth)
}

export async function signInAnonymouslyUser() {
  if (!auth) throw new Error('Firebase not initialized')
  return signInAnonymously(auth)
}
