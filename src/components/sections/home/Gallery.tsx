'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'

const galleryImages = [
  { id: 1, src: '/images/gallery/gallery-1.jpg', alt: 'Jonathan Roumie' },
  { id: 2, src: '/images/gallery/gallery-2.jpg', alt: 'Jonathan Roumie' },
  { id: 3, src: '/images/gallery/gallery-3.jpg', alt: 'Jonathan Roumie' },
  { id: 4, src: '/images/gallery/gallery-4.jpg', alt: 'Jonathan Roumie' },
  { id: 5, src: '/images/gallery/gallery-5.jpg', alt: 'Jonathan Roumie' },
  { id: 6, src: '/images/gallery/gallery-6.jpg', alt: 'Jonathan Roumie' },
  { id: 7, src: '/images/gallery/gallery-7.jpg', alt: 'Jonathan Roumie' },
  { id: 8, src: '/images/gallery/gallery-8.jpg', alt: 'Jonathan Roumie' },
]

export default function Gallery() {
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {galleryImages.map((image, index) => (
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
                alt={image.alt} 
                fill 
                className="object-cover transition-transform duration-300 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
            </motion.div>
          ))}
        </div>

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
