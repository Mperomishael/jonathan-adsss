/**
 * Lightweight file-based store (works on Vercel via /tmp or env-injected data).
 * In production swap for a real DB (Supabase / PlanetScale).
 * All mutable state is kept in module-level Maps so the Next.js
 * server process acts as an in-memory cache between requests.
 */

export interface Product {
  id: string
  name: string
  price: number        // in cents (USD)
  description: string
  image: string
  category: string
  inStock: boolean
  createdAt: string
}

export interface GalleryImage {
  id: string
  src: string
  alt: string
  category: string
  createdAt: string
}

export interface FanCardSettings {
  price: number        // in cents
  background: string   // CSS gradient or solid color
  accentColor: string
  logoUrl: string
  footerText: string
}

export interface SiteSettings {
  heroSlides: { id: number; image: string; title: string; subtitle?: string }[]
  announcementBar: string
  contactEmail: string
  socialLinks: { facebook: string; twitter: string; instagram: string; youtube: string }
}

// --- Default data ---

const defaultProducts: Product[] = [
  { id: '1', name: 'Black Bloodsport Hoodie', price: 6999, description: 'Official Bloodsport hoodie in black.', image: '/images/shop/hoodie-black.jpg', category: 'Hoodies', inStock: true, createdAt: new Date().toISOString() },
  { id: '2', name: 'Gray Bloodsport Hoodie', price: 6999, description: 'Official Bloodsport hoodie in gray.', image: '/images/shop/hoodie-gray.jpg', category: 'Hoodies', inStock: true, createdAt: new Date().toISOString() },
]

const defaultGallery: GalleryImage[] = [
  { id: '1', src: '/images/gallery/gallery-1.jpg', alt: 'Jonathan Roumie on stage', category: 'Events', createdAt: new Date().toISOString() },
  { id: '2', src: '/images/gallery/gallery-2.jpg', alt: 'Jonathan Roumie art', category: 'Art', createdAt: new Date().toISOString() },
  { id: '3', src: '/images/gallery/gallery-3.jpg', alt: 'Jonathan Roumie at gym', category: 'Training', createdAt: new Date().toISOString() },
  { id: '4', src: '/images/gallery/gallery-4.jpg', alt: 'Jonathan Roumie training', category: 'Training', createdAt: new Date().toISOString() },
  { id: '5', src: '/images/gallery/gallery-5.jpg', alt: 'Jonathan Roumie with fans', category: 'Fans', createdAt: new Date().toISOString() },
  { id: '6', src: '/images/gallery/gallery-6.jpg', alt: 'Jonathan Roumie interview', category: 'Media', createdAt: new Date().toISOString() },
  { id: '7', src: '/images/gallery/gallery-7.jpg', alt: 'Jonathan Roumie collectible', category: 'Collectibles', createdAt: new Date().toISOString() },
  { id: '8', src: '/images/gallery/gallery-8.jpg', alt: 'Jonathan Roumie dramatic pose', category: 'Art', createdAt: new Date().toISOString() },
]

const defaultFanCardSettings: FanCardSettings = {
  price: 5000,
  background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
  accentColor: '#FF0000',
  logoUrl: '/images/jvcd-avatar.jpg',
  footerText: 'OFFICIAL JONATHAN ROUMIE WORLD FAN CARD',
}

const defaultSiteSettings: SiteSettings = {
  heroSlides: [
    { id: 1, image: '/images/hero/hero-1.jpg', title: 'JONATHAN', subtitle: 'ROUMIE' },
    { id: 2, image: '/images/hero/hero-2.jpg', title: 'ACTION' },
    { id: 3, image: '/images/hero/hero-3.jpg', title: 'ADVENTURE' },
  ],
  announcementBar: 'Officially Licensed Jonathan Roumie Merchandise',
  contactEmail: 'contact@jonathanroumieworld.com',
  socialLinks: { facebook: '#', twitter: '#', instagram: '#', youtube: '#' },
}

// --- In-memory store (replace with DB in prod) ---
let products: Product[] = [...defaultProducts]
let gallery: GalleryImage[] = [...defaultGallery]
let fanCardSettings: FanCardSettings = { ...defaultFanCardSettings }
let siteSettings: SiteSettings = { ...defaultSiteSettings }

// --- Products ---
export const getProducts = () => products
export const getProduct = (id: string) => products.find((p) => p.id === id)
export const createProduct = (data: Omit<Product, 'id' | 'createdAt'>): Product => {
  const p: Product = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() }
  products = [p, ...products]
  return p
}
export const updateProduct = (id: string, data: Partial<Product>): Product | null => {
  const idx = products.findIndex((p) => p.id === id)
  if (idx === -1) return null
  products[idx] = { ...products[idx], ...data }
  return products[idx]
}
export const deleteProduct = (id: string): boolean => {
  const before = products.length
  products = products.filter((p) => p.id !== id)
  return products.length < before
}

// --- Gallery ---
export const getGallery = () => gallery
export const addGalleryImage = (data: Omit<GalleryImage, 'id' | 'createdAt'>): GalleryImage => {
  const img: GalleryImage = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() }
  gallery = [img, ...gallery]
  return img
}
export const deleteGalleryImage = (id: string): boolean => {
  const before = gallery.length
  gallery = gallery.filter((g) => g.id !== id)
  return gallery.length < before
}

// --- Fan Card Settings ---
export const getFanCardSettings = () => fanCardSettings
export const updateFanCardSettings = (data: Partial<FanCardSettings>): FanCardSettings => {
  fanCardSettings = { ...fanCardSettings, ...data }
  return fanCardSettings
}

// --- Site Settings ---
export const getSiteSettings = () => siteSettings
export const updateSiteSettings = (data: Partial<SiteSettings>): SiteSettings => {
  siteSettings = { ...siteSettings, ...data }
  return siteSettings
}
