'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, AlertCircle, Edit2, Check, X, Loader2 } from 'lucide-react'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'

interface CardApplication {
  email: string
  uid: string
  appliedAt: string
  status: 'pending' | 'approved' | 'rejected'
  reviewedAt: string | null
  reviewedBy: string | null
  notes: string
}

interface UserData {
  uid: string
  email: string
  cardLevel: 'silver' | 'gold' | 'diamond' | null
  cardNumber: string | null
  paymentStatus: 'unpaid' | 'processing' | 'confirmed'
  approved: boolean
  whitelisted: boolean
}

const CARD_LEVELS = [
  { value: 'silver', label: 'Silver Fan', color: 'bg-gray-500/20 text-gray-300' },
  { value: 'gold', label: 'Gold Fan', color: 'bg-yellow-600/20 text-yellow-300' },
  { value: 'diamond', label: 'Diamond Fan', color: 'bg-blue-600/20 text-blue-300' },
]

export default function CardApplicationsPage() {
  const { getToken } = useAdminAuth()
  const [applications, setApplications] = useState<CardApplication[]>([])
  const [users, setUsers] = useState<Map<string, UserData>>(new Map())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [editingEmail, setEditingEmail] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<UserData>>({})

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    const token = await getToken()
    try {
      const response = await fetch('/api/admin/applications', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications || [])
        
        // Load user data for each application
        const usersMap = new Map()
        for (const app of data.applications) {
          const userRes = await fetch(`/api/admin/users/${app.uid}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (userRes.ok) {
            const userData = await userRes.json()
            usersMap.set(app.email, userData)
          }
        }
        setUsers(usersMap)
      }
    } catch (error) {
      console.error('[Admin] Load applications error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (email: string) => {
    setSaving(email)
    const token = await getToken()
    
    try {
      const userData = users.get(email)
      if (!userData) {
        console.error('User data not found')
        return
      }

      const cardLevel = editData.cardLevel || 'silver'
      const cardNumber = `JRW-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

      const response = await fetch('/api/admin/applications/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          uid: userData.uid,
          cardLevel,
          cardNumber,
        }),
      })

      if (response.ok) {
        setApplications((prev) =>
          prev.map((app) =>
            app.email === email ? { ...app, status: 'approved' } : app
          )
        )
        setEditingEmail(null)
        setEditData({})
      }
    } catch (error) {
      console.error('[Admin] Approve error:', error)
    } finally {
      setSaving(null)
    }
  }

  const handleReject = async (email: string) => {
    setSaving(email)
    const token = await getToken()

    try {
      const userData = users.get(email)
      const response = await fetch('/api/admin/applications/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, uid: userData?.uid }),
      })

      if (response.ok) {
        setApplications((prev) =>
          prev.map((app) =>
            app.email === email ? { ...app, status: 'rejected' } : app
          )
        )
      }
    } catch (error) {
      console.error('[Admin] Reject error:', error)
    } finally {
      setSaving(null)
    }
  }

  if (loading) return <div className="text-gray-500">Loading applications...</div>

  const pendingApps = applications.filter((a) => a.status === 'pending')
  const approvedApps = applications.filter((a) => a.status === 'approved')
  const rejectedApps = applications.filter((a) => a.status === 'rejected')

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-white text-2xl font-black tracking-widest mb-2">CARD APPLICATIONS</h1>
        <p className="text-gray-400">Review and approve user applications for fan cards</p>
      </motion.div>

      {/* Pending Applications */}
      <section className="bg-white/3 border border-white/5 rounded-2xl p-6">
        <h2 className="text-white text-lg font-bold tracking-widest mb-6 flex items-center gap-2">
          <Clock size={20} className="text-yellow-400" />
          PENDING REVIEW ({pendingApps.length})
        </h2>

        {pendingApps.length === 0 ? (
          <p className="text-gray-500 text-sm">No pending applications</p>
        ) : (
          <div className="space-y-4">
            {pendingApps.map((app) => {
              const userData = users.get(app.email)
              const isEditing = editingEmail === app.email

              return (
                <motion.div
                  key={app.email}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/2 border border-white/5 rounded-xl p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-white font-semibold">{app.email}</p>
                      <p className="text-gray-400 text-xs">
                        Applied {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                    </div>

                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-gray-400 text-xs block mb-2">Card Level</label>
                          <select
                            value={editData.cardLevel || 'silver'}
                            onChange={(e) =>
                              setEditData({ ...editData, cardLevel: e.target.value as any })
                            }
                            className="bg-white/5 border border-white/10 text-white px-3 py-2 rounded-lg text-sm"
                          >
                            {CARD_LEVELS.map((level) => (
                              <option key={level.value} value={level.value}>
                                {level.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(app.email)}
                            disabled={saving === app.email}
                            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                          >
                            {saving === app.email ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Check size={14} />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setEditingEmail(null)
                              setEditData({})
                            }}
                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingEmail(app.email)
                            setEditData({ cardLevel: 'silver' })
                          }}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                        >
                          <Edit2 size={14} />
                          Review
                        </button>
                        <button
                          onClick={() => handleReject(app.email)}
                          disabled={saving === app.email}
                          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                        >
                          {saving === app.email ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <X size={14} />
                          )}
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </section>

      {/* Approved Applications */}
      {approvedApps.length > 0 && (
        <section className="bg-white/3 border border-white/5 rounded-2xl p-6">
          <h2 className="text-white text-lg font-bold tracking-widest mb-6 flex items-center gap-2">
            <CheckCircle size={20} className="text-green-400" />
            APPROVED ({approvedApps.length})
          </h2>

          <div className="space-y-3">
            {approvedApps.map((app) => {
              const userData = users.get(app.email)
              return (
                <motion.div
                  key={app.email}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-900/10 border border-green-800/20 rounded-xl p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="text-white font-semibold">{app.email}</p>
                    <p className="text-green-300 text-xs">
                      {userData?.cardLevel?.toUpperCase()} - Card: {userData?.cardNumber}
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                    userData?.paymentStatus === 'confirmed'
                      ? 'bg-green-900/30 text-green-300'
                      : 'bg-yellow-900/30 text-yellow-300'
                  }`}>
                    {userData?.paymentStatus === 'confirmed' ? 'VERIFIED' : 'AWAITING PAYMENT'}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
