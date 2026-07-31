'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface GalleryImage {
  id: string
  src: string
  alt: string
  category?: string
}

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/gallery')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setImages(data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="bg-gradient-to-b from-black to-black/90 py-12 sm:py-16 md:py-20 px-4 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-10 md:mb-12"
        >
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-black tracking-widest mb-2">
            GALLERY
          </h2>
          <p className="text-gray-400">Exclusive photos and moments</p>
        </motion.div>

        {loading ? (
          <p className="text-center text-gray-500 text-sm">Loading gallery...</p>
        ) : images.length === 0 ? (
          <p className="text-center text-gray-500 text-sm">No images yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="relative group cursor-pointer overflow-hidden rounded-lg aspect-square"
              >
                <Image
                  src={image.src}
                  alt={image.alt || 'Gallery'}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="flex justify-center mt-8 sm:mt-10 md:mt-12"
        >
          <button className="bg-white/10 hover:bg-white/20 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-bold tracking-widest transition-colors text-sm sm:text-base">
            VIEW ALL
          </button>
        </motion.div>
      </div>
    </section>
  )
}
