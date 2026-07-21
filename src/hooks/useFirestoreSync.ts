'use client'

import { useState } from 'react'
import { db } from '@/lib/firebase'
import { doc, setDoc, updateDoc } from 'firebase/firestore'

interface SyncOptions {
  merge?: boolean
  onSuccess?: () => void
  onError?: (error: string) => void
}

/**
 * Hook for syncing data to Firestore
 * @param collectionPath - Firestore collection path
 * @returns { sync, isSyncing, error }
 */
export function useFirestoreSync(collectionPath: string) {
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sync = async (docId: string, data: any, options: SyncOptions = {}) => {
    setIsSyncing(true)
    setError(null)
    try {
      if (!db) {
        throw new Error('Firestore not initialized')
      }

      const docRef = doc(db, collectionPath, docId)
      console.log(`[Firestore] Syncing to ${collectionPath}/${docId}:`, data)

      if (options.merge === false) {
        await setDoc(docRef, data)
      } else {
        await updateDoc(docRef, data)
      }

      console.log(`[Firestore] Sync successful for ${collectionPath}/${docId}`)
      options.onSuccess?.()
    } catch (e: any) {
      const errorMsg = e.message || 'Sync failed'
      console.error(`[Firestore] Sync error for ${collectionPath}/${docId}:`, errorMsg)
      setError(errorMsg)
      options.onError?.(errorMsg)
      throw e
    } finally {
      setIsSyncing(false)
    }
  }

  return { sync, isSyncing, error }
}
