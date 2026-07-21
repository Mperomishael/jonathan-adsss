import { auth } from './firebase'
import { User, updateProfile, updateEmail, updatePassword, reauthenticateWithPopup, GoogleAuthProvider, sendEmailVerification as firebaseSendEmailVerification } from 'firebase/auth'

/**
 * Firebase Authentication Utilities
 * Comprehensive set of auth helpers for user management
 */

// ─── User Profile Management ──────────────────────────────────────────────────
export async function updateUserProfile(user: User, displayName: string, photoURL?: string) {
  try {
    await updateProfile(user, {
      displayName,
      photoURL: photoURL || undefined,
    })
  } catch (err: any) {
    throw new Error(`Failed to update profile: ${err.message}`)
  }
}

export async function updateUserEmail(user: User, newEmail: string) {
  try {
    await updateEmail(user, newEmail)
  } catch (err: any) {
    throw new Error(`Failed to update email: ${err.message}`)
  }
}

export async function updateUserPassword(user: User, newPassword: string) {
  try {
    await updatePassword(user, newPassword)
  } catch (err: any) {
    throw new Error(`Failed to update password: ${err.message}`)
  }
}

// ─── Reauthentication ─────────────────────────────────────────────────────────
export async function reauthenticateUser(user: User) {
  if (!user.providerData.length) {
    throw new Error('User has no authentication provider')
  }

  const provider = user.providerData[0].providerId
  
  if (provider === 'google.com') {
    const googleProvider = new GoogleAuthProvider()
    await reauthenticateWithPopup(user, googleProvider)
  } else {
    throw new Error(`Reauthentication not supported for ${provider}`)
  }
}

// ─── User Metadata ────────────────────────────────────────────────────────────
export function getUserMetadata(user: User) {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
    isAnonymous: user.isAnonymous,
    createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime) : null,
    lastSignInAt: user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime) : null,
    providers: user.providerData.map((p) => ({
      uid: p.uid,
      email: p.email,
      displayName: p.displayName,
      providerId: p.providerId,
    })),
  }
}

// ─── Auth State Helpers ────────────────────────────────────────────────────────
export function isUserAuthenticated(user: User | null): boolean {
  return user !== null && !user.isAnonymous
}

export function isUserAnonymous(user: User | null): boolean {
  return user?.isAnonymous || false
}

export function getUserEmail(user: User | null): string | null {
  return user?.email || null
}

export function getUserID(user: User | null): string | null {
  return user?.uid || null
}

// ─── Auth Providers ───────────────────────────────────────────────────────────
export function getAuthProviders(user: User): string[] {
  return user.providerData.map((p) => p.providerId)
}

export function hasGoogleAuth(user: User): boolean {
  return getAuthProviders(user).includes('google.com')
}

export function hasEmailAuth(user: User): boolean {
  return getAuthProviders(user).includes('password') || !!user.email
}

export function hasPhoneAuth(user: User): boolean {
  return getAuthProviders(user).includes('phone')
}

// ─── ID Token Management ──────────────────────────────────────────────────────
export async function getIdToken(user: User | null, forceRefresh = false): Promise<string | null> {
  if (!user) return null
  try {
    return await user.getIdToken(forceRefresh)
  } catch {
    return null
  }
}

// ─── Custom Claims (admin role, etc.) ──────────────────────────────────────────
export async function getUserCustomClaims(user: User) {
  try {
    const tokenResult = await user.getIdTokenResult()
    return tokenResult.claims
  } catch {
    return {}
  }
}

// ─── Email Verification ────────────────────────────────────────────────────────
export async function sendEmailVerification(user: User) {
  try {
    await user.reload()
    if (!user.emailVerified) {
      await firebaseSendEmailVerification(user)
    }
  } catch (err: any) {
    throw new Error(`Failed to send verification email: ${err.message}`)
  }
}

// ─── Delete Account ────────────────────────────────────────────────────────────
export async function deleteUserAccount(user: User) {
  try {
    await user.delete()
  } catch (err: any) {
    throw new Error(`Failed to delete account: ${err.message}`)
  }
}
