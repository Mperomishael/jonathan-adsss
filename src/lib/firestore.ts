/**
 * Firestore-backed data layer.
 * Collections: products | gallery | pageSettings (fanCard, site, cryptoWallets) | settings | payments | users | admins
 *
 * Price conventions:
 * - Product.price           → DOLLARS (e.g. 29.99)
 * - FanCardSettings.price / tiers.*.price → DOLLARS (e.g. 49.99)
 *   No hardcoded prices — only values saved from Admin are used.
 */
import { adminDb } from './firebase-admin'

export { adminDb }

// ─── Core types ───────────────────────────────────────────────────────────────

export interface Product {
  id: string
  name: string
  price: number // DOLLARS (e.g. 29.99)
  description: string
  image: string
  category: string
  inStock: boolean
  stock?: number
  createdAt: string
}

export interface GalleryImage {
  id: string
  src: string
  alt: string
  category: string
  createdAt: string
}

export type FanTierId = 'regular' | 'gold' | 'diamond'

export interface FanTierConfig {
  enabled?: boolean
  price?: number // DOLLARS — set only via Admin
  label?: string
}

export interface FanCardSettings {
  price?: number // DOLLARS — admin only
  background: string
  accentColor: string
  logoUrl: string
  footerText: string
  antiScreenshot?: boolean
  tiers?: {
    regular: FanTierConfig
    gold: FanTierConfig
    diamond: FanTierConfig
  }
  updatedAt?: string
  updatedBy?: string
}

export interface SiteSettings {
  announcementBar: string
  contactEmail: string
  socialLinks: { facebook: string; twitter: string; instagram: string; youtube: string }
  whatsappNumber: string
  cashappHandle: string
  venmoHandle: string
  updatedAt?: string
  updatedBy?: string
}

// ─── DB helper ────────────────────────────────────────────────────────────────

export function getDb() {
  if (!adminDb) {
    throw new Error('Firebase admin is not initialized. Check FIREBASE_ADMIN_* environment variables.')
  }
  return adminDb
}

/** Normalize product price to dollars. Legacy integer cents (>= 1000) converted once. */
function normalizeProductPrice(raw: unknown): number {
  const n = Number(raw || 0)
  if (!Number.isFinite(n) || n < 0) return 0
  if (Number.isInteger(n) && n >= 1000) return Math.round(n) / 100
  return Math.round(n * 100) / 100
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  const snap = await getDb().collection('products').orderBy('createdAt', 'desc').get()
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      name: data.name || '',
      description: data.description || '',
      price: normalizeProductPrice(data.price),
      image: data.image || '',
      category: data.category || 'merchandise',
      inStock: data.inStock !== false,
      stock: typeof data.stock === 'number' ? data.stock : data.inStock === false ? 0 : 99,
      createdAt: data.createdAt || '',
    } as Product
  })
}

export async function getProduct(id: string): Promise<Product | null> {
  const doc = await getDb().collection('products').doc(id).get()
  if (!doc.exists) return null
  const data = doc.data() || {}
  return {
    id: doc.id,
    name: data.name || '',
    description: data.description || '',
    price: normalizeProductPrice(data.price),
    image: data.image || '',
    category: data.category || 'merchandise',
    inStock: data.inStock !== false,
    stock: typeof data.stock === 'number' ? data.stock : data.inStock === false ? 0 : 99,
    createdAt: data.createdAt || '',
  } as Product
}

export async function createProduct(
  data: Omit<Product, 'id' | 'createdAt'>
): Promise<Product> {
  const now = new Date().toISOString()
  const payload = {
    name: data.name,
    description: data.description || '',
    price: normalizeProductPrice(data.price),
    image: data.image || '/images/shop/WhatsApp_Image_2026-04-23_at_19.13.27.jpeg',
    category: data.category || 'merchandise',
    inStock: data.inStock !== false,
    stock: typeof data.stock === 'number' ? data.stock : 99,
    createdAt: now,
  }
  const ref = await getDb().collection('products').add(payload)
  return { id: ref.id, ...payload }
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
  const patch: Record<string, unknown> = { ...data }
  delete patch.id
  if (patch.price !== undefined) {
    patch.price = normalizeProductPrice(patch.price)
  }
  await getDb().collection('products').doc(id).update(patch)
}

export async function deleteProduct(id: string): Promise<void> {
  await getDb().collection('products').doc(id).delete()
}

// ─── Gallery ──────────────────────────────────────────────────────────────────

export async function getGallery(): Promise<GalleryImage[]> {
  const snap = await getDb().collection('gallery').orderBy('createdAt', 'desc').get()
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as GalleryImage))
}

export async function addGalleryImage(
  data: Omit<GalleryImage, 'id' | 'createdAt'>
): Promise<GalleryImage> {
  const now = new Date().toISOString()
  const ref = await getDb().collection('gallery').add({ ...data, createdAt: now })
  return { id: ref.id, ...data, createdAt: now }
}

export async function deleteGalleryImage(id: string): Promise<void> {
  await getDb().collection('gallery').doc(id).delete()
}

// ─── Fan Card Settings ────────────────────────────────────────────────────────

/** Labels only — NO price defaults. Prices come only from Admin saves. */
const EMPTY_TIERS: {
  regular: FanTierConfig
  gold: FanTierConfig
  diamond: FanTierConfig
} = {
  regular: { enabled: true, label: 'Regular Fan' },
  gold: { enabled: true, label: 'Gold Fan' },
  diamond: { enabled: true, label: 'Diamond Fan' },
}

const EMPTY_FAN_CARD: FanCardSettings = {
  background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
  accentColor: '#FF0000',
  logoUrl: '/images/jvcd-avatar.jpg',
  footerText: 'OFFICIAL JONATHAN ROUMIE WORLD FAN CARD',
  antiScreenshot: true,
  tiers: EMPTY_TIERS,
}

/** Coerce stored value to dollars. Never invent a price. */
function asDollars(raw: unknown): number | undefined {
  if (raw === null || raw === undefined || raw === '') return undefined
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 0) return undefined
  // Legacy cents only if clearly large integer typical of old storage (e.g. 5000)
  // Admin now always stores dollars — prefer dollars as-is for normal ranges.
  if (Number.isInteger(n) && n >= 1000) return Math.round(n) / 100
  return Math.round(n * 100) / 100
}

export async function getFanCardSettings(): Promise<FanCardSettings> {
  const doc = await getDb().collection('pageSettings').doc('fanCard').get()
  if (!doc.exists) {
    return { ...EMPTY_FAN_CARD, tiers: { ...EMPTY_TIERS } }
  }
  const data = doc.data() as FanCardSettings
  const tr = data.tiers?.regular || {}
  const tg = data.tiers?.gold || {}
  const td = data.tiers?.diamond || {}
  const regularPrice = asDollars(tr.price ?? data.price)
  const goldPrice = asDollars(tg.price)
  const diamondPrice = asDollars(td.price)
  return {
    ...EMPTY_FAN_CARD,
    ...data,
    antiScreenshot: data.antiScreenshot !== false,
    // Prefer dollars from admin; omit price key if never set
    ...(regularPrice !== undefined ? { price: regularPrice } : {}),
    tiers: {
      regular: {
        enabled: tr.enabled !== false,
        label: tr.label || 'Regular Fan',
        ...(regularPrice !== undefined ? { price: regularPrice } : {}),
      },
      gold: {
        enabled: tg.enabled !== false,
        label: tg.label || 'Gold Fan',
        ...(goldPrice !== undefined ? { price: goldPrice } : {}),
      },
      diamond: {
        enabled: td.enabled !== false,
        label: td.label || 'Diamond Fan',
        ...(diamondPrice !== undefined ? { price: diamondPrice } : {}),
      },
    },
  }
}

export async function updateFanCardSettings(data: Partial<FanCardSettings>): Promise<void> {
  await getDb().collection('pageSettings').doc('fanCard').set(
    { ...data, updatedAt: new Date().toISOString() },
    { merge: true }
  )
}

// ─── Site Settings ────────────────────────────────────────────────────────────

const DEFAULT_SITE: SiteSettings = {
  announcementBar: 'Officially Licensed Jonathan Roumie Merchandise',
  contactEmail: 'contact@jonathanroumieworld.com',
  socialLinks: { facebook: '#', twitter: '#', instagram: '#', youtube: '#' },
  whatsappNumber: '',
  cashappHandle: '',
  venmoHandle: '',
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const doc = await getDb().collection('pageSettings').doc('siteSettings').get()
  return doc.exists ? (doc.data() as SiteSettings) : { ...DEFAULT_SITE }
}

export async function updateSiteSettings(data: Partial<SiteSettings>): Promise<void> {
  await getDb().collection('pageSettings').doc('siteSettings').set(
    { ...data, updatedAt: new Date().toISOString() },
    { merge: true }
  )
}

// ─── Extended domain types ────────────────────────────────────────────────────

export interface Admin {
  id: string
  email: string
  role: 'super-admin' | 'admin' | 'moderator'
  verified: boolean
  createdAt: string
}

export interface FanCard {
  id: string
  title: string
  price: number
  image: string
  description: string
  antiScreenshot: boolean
  createdAt: string
  updatedAt: string
  updatedBy: string
}

export interface User {
  id: string
  email: string
  googleId?: string
  whitelisted: boolean
  fanStatus: 'pending' | 'approved' | 'rejected'
  registeredAt: string
  paymentStatus: 'unpaid' | 'pending' | 'confirmed'
  fanTier?: FanTierId
}

export interface Payment {
  id: string
  userId?: string
  email?: string
  name?: string
  amount: number
  currency: 'USDT' | 'BTC' | 'PayPal' | 'Stripe' | 'Venmo' | 'ChipperCash' | 'CashApp'
  status: 'pending' | 'confirmed' | 'failed'
  tier?: FanTierId
  qrCode?: string
  transactionId?: string
  shippingAddress?: string
  waybill?: boolean
  createdAt: string
  updatedAt: string
}

export interface CryptoWallet {
  id: string
  type: 'BTC' | 'USDT'
  address: string
  verified: boolean
  updatedAt: string
  updatedBy: string
}

export interface PageContent {
  id: string
  section: string
  content: string
  image?: string
  updatedAt: string
  updatedBy: string
}

// ─── Admin Management ─────────────────────────────────────────────────────────

export async function getAdmins(): Promise<Admin[]> {
  const snap = await getDb().collection('admins').orderBy('createdAt', 'desc').get()
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Admin))
}

export async function getAdmin(email: string): Promise<Admin | null> {
  const normalized = email.toLowerCase().trim()
  let snap = await getDb().collection('admins').where('email', '==', normalized).limit(1).get()
  if (snap.docs.length > 0) {
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as Admin
  }
  snap = await getDb().collection('admins').where('email', '==', email.trim()).limit(1).get()
  return snap.docs.length > 0
    ? ({ id: snap.docs[0].id, ...snap.docs[0].data() } as Admin)
    : null
}

export async function createAdmin(
  email: string,
  role: 'super-admin' | 'admin' | 'moderator' = 'admin'
): Promise<Admin> {
  const now = new Date().toISOString()
  const ref = await getDb().collection('admins').add({
    email,
    role,
    verified: true,
    createdAt: now,
  })
  return { id: ref.id, email, role, verified: true, createdAt: now }
}

export async function updateAdmin(id: string, data: Partial<Admin>): Promise<void> {
  await getDb().collection('admins').doc(id).update(data)
}

export async function deleteAdmin(id: string): Promise<void> {
  await getDb().collection('admins').doc(id).delete()
}

// ─── Fan Card catalog ─────────────────────────────────────────────────────────

export async function getFanCards(): Promise<FanCard[]> {
  const snap = await getDb().collection('fanCards').orderBy('createdAt', 'desc').get()
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FanCard))
}

export async function getFanCard(id: string): Promise<FanCard | null> {
  const doc = await getDb().collection('fanCards').doc(id).get()
  return doc.exists ? ({ id: doc.id, ...doc.data() } as FanCard) : null
}

export async function createFanCard(
  data: Omit<FanCard, 'id' | 'createdAt' | 'updatedAt'>
): Promise<FanCard> {
  const now = new Date().toISOString()
  const ref = await getDb().collection('fanCards').add({
    ...data,
    createdAt: now,
    updatedAt: now,
  })
  return { id: ref.id, ...data, createdAt: now, updatedAt: now }
}

export async function updateFanCard(id: string, data: Partial<FanCard>): Promise<void> {
  await getDb().collection('fanCards').doc(id).update({
    ...data,
    updatedAt: new Date().toISOString(),
  })
}

export async function deleteFanCard(id: string): Promise<void> {
  await getDb().collection('fanCards').doc(id).delete()
}

// ─── User Management ──────────────────────────────────────────────────────────

export async function getUsers(): Promise<User[]> {
  const snap = await getDb().collection('users').orderBy('registeredAt', 'desc').get()
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as User))
}

export async function getUser(id: string): Promise<User | null> {
  const doc = await getDb().collection('users').doc(id).get()
  return doc.exists ? ({ id: doc.id, ...doc.data() } as User) : null
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const snap = await getDb().collection('users').where('email', '==', email).limit(1).get()
  return snap.docs.length > 0
    ? ({ id: snap.docs[0].id, ...snap.docs[0].data() } as User)
    : null
}

export async function createUser(email: string, googleId?: string): Promise<User> {
  const now = new Date().toISOString()
  const ref = await getDb().collection('users').add({
    email,
    googleId,
    whitelisted: false,
    fanStatus: 'pending',
    registeredAt: now,
    paymentStatus: 'unpaid',
  })
  return {
    id: ref.id,
    email,
    googleId,
    whitelisted: false,
    fanStatus: 'pending',
    registeredAt: now,
    paymentStatus: 'unpaid',
  }
}

export async function updateUser(id: string, data: Partial<User>): Promise<void> {
  await getDb().collection('users').doc(id).update(data)
}

export async function whitelistUser(userId: string, _admin: string): Promise<void> {
  await getDb().collection('users').doc(userId).update({
    whitelisted: true,
    fanStatus: 'approved',
  })
}

// ─── Payment Management ───────────────────────────────────────────────────────

export async function getPayments(): Promise<Payment[]> {
  const snap = await getDb().collection('payments').orderBy('createdAt', 'desc').get()
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Payment))
}

export async function getPaymentsByUser(userId: string): Promise<Payment[]> {
  const snap = await getDb()
    .collection('payments')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get()
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Payment))
}

export async function getPayment(id: string): Promise<Payment | null> {
  const doc = await getDb().collection('payments').doc(id).get()
  return doc.exists ? ({ id: doc.id, ...doc.data() } as Payment) : null
}

export async function createPayment(
  data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Payment> {
  const now = new Date().toISOString()
  const ref = await getDb().collection('payments').add({
    ...data,
    createdAt: now,
    updatedAt: now,
  })
  return { id: ref.id, ...data, createdAt: now, updatedAt: now }
}

export async function confirmPayment(paymentId: string, transactionId: string): Promise<void> {
  await getDb().collection('payments').doc(paymentId).update({
    status: 'confirmed',
    transactionId,
    updatedAt: new Date().toISOString(),
  })
}

export async function updatePayment(id: string, data: Partial<Payment>): Promise<void> {
  await getDb().collection('payments').doc(id).update({
    ...data,
    updatedAt: new Date().toISOString(),
  })
}

// ─── Crypto Wallets (pageSettings/cryptoWallets) ──────────────────────────────

export interface CryptoWalletsData {
  btc?: { address: string; verified?: boolean }
  usdt?: { address: string; verified?: boolean }
  updatedAt?: string
  updatedBy?: string
}

export async function getCryptoWallets(): Promise<CryptoWalletsData> {
  try {
    const doc = await getDb().collection('pageSettings').doc('cryptoWallets').get()
    return doc.exists
      ? (doc.data() as CryptoWalletsData)
      : { btc: { address: '' }, usdt: { address: '' } }
  } catch (error) {
    console.error('[Firestore] Error fetching crypto wallets:', error)
    return { btc: { address: '' }, usdt: { address: '' } }
  }
}

export async function getCryptoWallet(
  type: 'BTC' | 'USDT'
): Promise<{ address: string; verified: boolean } | null> {
  try {
    const data = await getCryptoWallets()
    const wallet = data[type.toLowerCase() as 'btc' | 'usdt']
    return wallet
      ? { address: wallet.address || '', verified: wallet.verified || false }
      : null
  } catch (error) {
    console.error('[Firestore] Error fetching crypto wallet:', error)
    return null
  }
}

export async function setCryptoWallet(
  type: 'BTC' | 'USDT',
  address: string,
  updatedBy: string
): Promise<void> {
  const key = type.toLowerCase()
  const payload = {
    [key]: { address, verified: false },
    updatedAt: new Date().toISOString(),
    updatedBy,
  }
  try {
    await getDb().collection('pageSettings').doc('cryptoWallets').update(payload)
  } catch (error: any) {
    if (error.code === 'not-found' || error.message?.includes('No document')) {
      await getDb().collection('pageSettings').doc('cryptoWallets').set(payload, { merge: true })
    } else {
      throw error
    }
  }
}

// ─── Page Content ─────────────────────────────────────────────────────────────

export async function getPageContent(section: string): Promise<PageContent | null> {
  const snap = await getDb()
    .collection('pageContent')
    .where('section', '==', section)
    .limit(1)
    .get()
  return snap.docs.length > 0
    ? ({ id: snap.docs[0].id, ...snap.docs[0].data() } as PageContent)
    : null
}

export async function getAllPageContent(): Promise<PageContent[]> {
  const snap = await getDb().collection('pageContent').get()
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as PageContent))
}

export async function updatePageContent(
  section: string,
  data: Partial<PageContent>,
  updatedBy: string
): Promise<void> {
  const existing = await getPageContent(section)
  const now = new Date().toISOString()
  if (existing) {
    await getDb().collection('pageContent').doc(existing.id).update({
      ...data,
      section,
      updatedAt: now,
      updatedBy,
    })
  } else {
    await getDb().collection('pageContent').add({
      section,
      ...data,
      updatedAt: now,
      updatedBy,
    })
  }
}
