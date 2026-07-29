'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Shield, Trash2, Edit, Check, X, AlertCircle } from 'lucide-react'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'

interface AdminUser {
  id: string
  email: string
  role: 'super-admin' | 'admin' | 'moderator'
  verified: boolean
  createdAt: string
}

// Hardcoded super admin emails that cannot be removed
const PROTECTED_ADMINS = [
  'empiredigitalsworldwide@gmail.com',
  'empiredigitalsceo@gmail.com',
]

export default function AdminManagementPage() {
  const { getToken, user, adminRole } = useAdminAuth()
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [adding, setAdding] = useState(false)

  if (adminRole !== 'super-admin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">You need Super Admin privileges to manage admin users.</p>
        </div>
      </div>
    )
  }

  const loadAdmins = async () => {
    const token = await getToken()
    try {
      const response = await fetch('/api/admin/admins', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setAdmins(data)
      }
    } catch (error) {
      console.error('Failed to load admins:', error)
    }
    setLoading(false)
  }

  const addAdmin = async () => {
    if (!newAdminEmail) return

    setAdding(true)
    const token = await getToken()

    try {
      const response = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email: newAdminEmail, role: 'admin' })
      })

      if (response.ok) {
        setNewAdminEmail('')
        setShowAddForm(false)
        loadAdmins()
      } else {
        alert('Failed to add admin')
      }
    } catch (error) {
      console.error('Failed to add admin:', error)
      alert('Failed to add admin')
    }
    setAdding(false)
  }

  const changeRole = async (adminId: string, newRole: 'super-admin' | 'admin' | 'moderator') => {
    const token = await getToken()
    try {
      const response = await fetch(`/api/admin/admins/${adminId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      })

      if (response.ok) {
        loadAdmins()
      } else {
        alert('Failed to change role')
      }
    } catch (error) {
      console.error('Failed to change role:', error)
      alert('Failed to change role')
    }
  }

  const removeAdmin = async (adminId: string, adminEmail: string) => {
    if (adminEmail === user?.email) {
      alert('You cannot remove yourself')
      return
    }

    if (PROTECTED_ADMINS.includes(adminEmail)) {
      alert(`Cannot remove ${adminEmail} - this is a protected super admin account`)
      return
    }

    if (!confirm(`Remove ${adminEmail} from admin access?`)) return

    const token = await getToken()
    try {
      const response = await fetch(`/api/admin/admins/${adminId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        loadAdmins()
      } else {
        alert('Failed to remove admin')
      }
    } catch (error) {
      console.error('Failed to remove admin:', error)
      alert('Failed to remove admin')
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super-admin': return 'text-red-400 bg-red-900/30'
      case 'admin': return 'text-blue-400 bg-blue-900/30'
      case 'moderator': return 'text-green-400 bg-green-900/30'
      default: return 'text-gray-400 bg-gray-900/30'
    }
  }

  useEffect(() => {
    loadAdmins()
  }, [])

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">ADMIN MANAGEMENT</h1>
            <p className="text-gray-400">Manage admin users and their permissions</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            <UserPlus size={16} />
            Add Admin
          </button>
        </div>
      </div>

      {/* Add Admin Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8"
        >
          <h3 className="text-white font-semibold mb-4">Add New Admin</h3>
          <div className="flex gap-4">
            <input
              type="email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              placeholder="admin@example.com"
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500"
            />
            <button
              onClick={addAdmin}
              disabled={adding || !newAdminEmail}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {adding ? 'Adding...' : 'Add'}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Admins List */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Current Admins</h2>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-400">Loading admins...</div>
        ) : admins.length === 0 ? (
          <div className="p-6 text-center text-gray-400">No admins found</div>
        ) : (
          <div className="divide-y divide-white/10">
            {admins.map((admin) => (
              <div key={admin.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-red-900/30 border border-red-800/50 rounded-full flex items-center justify-center">
                    <Shield size={20} className="text-red-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold">{admin.email}</h3>
                      {PROTECTED_ADMINS.includes(admin.email) && (
                        <span className="bg-red-600 text-white text-xs px-2 py-1 rounded font-semibold">PROTECTED</span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">
                      Added {new Date(admin.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <select
                      value={admin.role}
                      onChange={(e) => changeRole(admin.id, e.target.value as 'super-admin' | 'admin' | 'moderator')}
                      className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-red-500"
                    >
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                      <option value="super-admin">Super Admin</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    {admin.verified ? (
                      <Check size={16} className="text-green-400" />
                    ) : (
                      <X size={16} className="text-red-400" />
                    )}

                    <button
                      onClick={() => removeAdmin(admin.id, admin.email)}
                      disabled={admin.email === user?.email || PROTECTED_ADMINS.includes(admin.email)}
                      className="text-red-400 hover:text-red-300 disabled:text-gray-600 disabled:cursor-not-allowed p-1 transition-colors"
                      title={PROTECTED_ADMINS.includes(admin.email) ? 'This is a protected super admin' : ''}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Permissions Info */}
      <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Permission Levels</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-3 h-3 bg-red-400 rounded-full mt-2"></div>
            <div>
              <h3 className="text-white font-semibold">Super Admin</h3>
              <p className="text-gray-400 text-sm">Full system access, can manage other admins, system settings</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-3 h-3 bg-blue-400 rounded-full mt-2"></div>
            <div>
              <h3 className="text-white font-semibold">Admin</h3>
              <p className="text-gray-400 text-sm">Can manage content, users, orders, payments</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full mt-2"></div>
            <div>
              <h3 className="text-white font-semibold">Moderator</h3>
              <p className="text-gray-400 text-sm">Limited access to user management and content moderation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
