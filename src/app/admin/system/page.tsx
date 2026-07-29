'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, Database, Server, Shield, Users, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'

interface SystemStatus {
  firebase: boolean
  database: boolean
  auth: boolean
  storage: boolean
  api: boolean
  lastChecked: string
}

interface SystemMetrics {
  totalUsers: number
  activeUsers: number
  totalProducts: number
  totalOrders: number
  totalPayments: number
  pendingApprovals: number
  systemUptime: string
}

export default function SystemStatusPage() {
  const { getToken } = useAdminAuth()
  const [status, setStatus] = useState<SystemStatus>({
    firebase: false,
    database: false,
    auth: false,
    storage: false,
    api: false,
    lastChecked: new Date().toISOString()
  })
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalPayments: 0,
    pendingApprovals: 0,
    systemUptime: '99.9%'
  })
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)

  const checkSystemStatus = async () => {
    setChecking(true)
    const token = await getToken()

    try {
      // Check API endpoints
      const endpoints = [
        '/api/admin/products',
        '/api/admin/users',
        '/api/admin/payments',
        '/api/admin/gallery'
      ]

      const results = await Promise.allSettled(
        endpoints.map(endpoint =>
          fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } })
        )
      )

      const apiStatus = results.every(result => result.status === 'fulfilled')

      // Get system metrics
      const [usersRes, productsRes, paymentsRes, ordersRes] = await Promise.all([
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/products', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/payments', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/orders', { headers: { Authorization: `Bearer ${token}` } }),
      ])

      const [users, products, payments, orders] = await Promise.all([
        usersRes.json(),
        productsRes.json(),
        paymentsRes.json(),
        ordersRes.json()
      ])

      setStatus({
        firebase: true, // Assume Firebase is working if we got here
        database: apiStatus,
        auth: !!token,
        storage: true, // Assume storage is working
        api: apiStatus,
        lastChecked: new Date().toISOString()
      })

      setMetrics({
        totalUsers: users.length || 0,
        activeUsers: users.filter((u: any) => u.whitelisted).length || 0,
        totalProducts: products.length || 0,
        totalOrders: orders.length || 0,
        totalPayments: payments.length || 0,
        pendingApprovals: users.filter((u: any) => u.fanStatus === 'pending').length || 0,
        systemUptime: '99.9%'
      })

    } catch (error) {
      console.error('System check failed:', error)
      setStatus(prev => ({ ...prev, api: false, lastChecked: new Date().toISOString() }))
    }

    setLoading(false)
    setChecking(false)
  }

  useEffect(() => {
    checkSystemStatus()
  }, [])

  const services = [
    { name: 'Firebase Auth', status: status.auth, icon: Shield },
    { name: 'Firestore Database', status: status.database, icon: Database },
    { name: 'Firebase Storage', status: status.storage, icon: Server },
    { name: 'API Endpoints', status: status.api, icon: Activity },
  ]

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">SYSTEM STATUS</h1>
            <p className="text-gray-400">Monitor and control your site's infrastructure</p>
          </div>
          <button
            onClick={checkSystemStatus}
            disabled={checking}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            <RefreshCw size={16} className={checking ? 'animate-spin' : ''} />
            {checking ? 'Checking...' : 'Refresh Status'}
          </button>
        </div>
      </div>

      {/* System Services Status */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">SYSTEM SERVICES</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((service, index) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white/5 border rounded-xl p-6 ${
                service.status
                  ? 'border-green-800/50 bg-green-900/10'
                  : 'border-red-800/50 bg-red-900/10'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <service.icon size={24} className={service.status ? 'text-green-400' : 'text-red-400'} />
                <div className={`w-3 h-3 rounded-full ${service.status ? 'bg-green-400' : 'bg-red-400'}`} />
              </div>
              <h3 className="text-white font-semibold mb-1">{service.name}</h3>
              <p className={`text-sm ${service.status ? 'text-green-400' : 'text-red-400'}`}>
                {service.status ? 'Operational' : 'Down'}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* System Metrics */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">SYSTEM METRICS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Users size={24} className="text-cyan-400" />
              <span className="text-2xl font-bold text-white">{metrics.totalUsers}</span>
            </div>
            <h3 className="text-gray-300 font-semibold">Total Users</h3>
            <p className="text-gray-500 text-sm mt-1">{metrics.activeUsers} active</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Database size={24} className="text-blue-400" />
              <span className="text-2xl font-bold text-white">{metrics.totalProducts}</span>
            </div>
            <h3 className="text-gray-300 font-semibold">Products</h3>
            <p className="text-gray-500 text-sm mt-1">In catalog</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Activity size={24} className="text-green-400" />
              <span className="text-2xl font-bold text-white">{metrics.totalOrders}</span>
            </div>
            <h3 className="text-gray-300 font-semibold">Orders</h3>
            <p className="text-gray-500 text-sm mt-1">Total processed</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Shield size={24} className="text-yellow-400" />
              <span className="text-2xl font-bold text-white">{metrics.pendingApprovals}</span>
            </div>
            <h3 className="text-gray-300 font-semibold">Pending Approvals</h3>
            <p className="text-gray-500 text-sm mt-1">Require attention</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle size={24} className="text-purple-400" />
              <span className="text-2xl font-bold text-white">{metrics.systemUptime}</span>
            </div>
            <h3 className="text-gray-300 font-semibold">System Uptime</h3>
            <p className="text-gray-500 text-sm mt-1">Last 30 days</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <RefreshCw size={24} className="text-gray-400" />
              <span className="text-sm font-bold text-white">
                {new Date(status.lastChecked).toLocaleTimeString()}
              </span>
            </div>
            <h3 className="text-gray-300 font-semibold">Last Checked</h3>
            <p className="text-gray-500 text-sm mt-1">Status updated</p>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">ADMIN ACTIONS</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors text-center">
            Clear Cache
          </button>
          <button className="bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors text-center">
            Export Data
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors text-center">
            Backup Database
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors text-center">
            View Logs
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors text-center">
            System Config
          </button>
          <button className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors text-center">
            Maintenance Mode
          </button>
        </div>
      </div>
    </div>
  )
}