'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { doc, onSnapshot, DocumentSnapshot } from 'firebase/firestore'

/**
 * Hook for subscribing to real-time Firestore document updates
 * @param collectionPath - Firestore collection path (e.g. 'pageSettings')
 * @param docId - Document ID to listen to
 * @returns { data, loading, error }
 */
export function useFirestoreListener<T>(collectionPath: string, docId: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!db || !collectionPath || !docId) {
      setLoading(false)
      return
    }

    try {
      const docRef = doc(db, collectionPath, docId)
      console.log(`[Firestore] Listening to ${collectionPath}/${docId}`)

      const unsubscribe = onSnapshot(
        docRef,
        (snapshot: DocumentSnapshot) => {
          if (snapshot.exists()) {
            console.log(`[Firestore] ${collectionPath}/${docId} updated:`, snapshot.data())
            setData(snapshot.data() as T)
            setError(null)
          } else {
            console.warn(`[Firestore] ${collectionPath}/${docId} does not exist`)
            setData(null)
            setError(null)
          }
          setLoading(false)
        },
        (err) => {
          console.error(`[Firestore] Error listening to ${collectionPath}/${docId}:`, err.message)
          setError(err.message)
          setLoading(false)
        }
      )

      return () => {
        console.log(`[Firestore] Unsubscribing from ${collectionPath}/${docId}`)
        unsubscribe()
      }
    } catch (e: any) {
      console.error('[Firestore] Setup error:', e.message)
      setError(e.message)
      setLoading(false)
    }
  }, [collectionPath, docId])

  return { data, loading, error }
}
