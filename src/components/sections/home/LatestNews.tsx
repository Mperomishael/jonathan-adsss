'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'

const fallbackNewsItems = [
  { id: 1, image: '/images/gallery/gallery-1.jpg', title: 'Latest Jonathan Roumie Updates', date: 'Today' },
  { id: 2, image: '/images/gallery/gallery-2.jpg', title: 'Exclusive Behind The Scenes', date: 'Yesterday' },
  { id: 3, image: '/images/gallery/gallery-3.jpg', title: 'New Content Release', date: '2 days ago' },
  { id: 4, image: '/images/gallery/gallery-4.jpg', title: 'Community Highlights', date: '3 days ago' },
  { id: 5, image: '/images/gallery/gallery-5.jpg', title: 'Fan Spotlight', date: '4 days ago' },
  { id: 6, image: '/images/gallery/gallery-6.jpg', title: 'Special Announcement', date: '5 days ago' },
]

export default function LatestNews() {
  const [newsItems, setNewsItems] = useState(fallbackNewsItems)

  useEffect(() => {
    let mounted = true

    fetch('/api/gallery')
      .then((res) => res.json())
      .then((data) => {
        if (!mounted || !Array.isArray(data)) return

        const galleryItems = data.slice(0, 6).map((item: any, index: number) => ({
          id: item.id ?? index + 1,
          image: item.src || '/images/gallery/gallery-1.jpg',
          title: item.alt || `Gallery update ${index + 1}`,
          date: ['Today', 'Yesterday', '2 days ago', '3 days ago', '4 days ago', '5 days ago'][index] || 'Recently',
        }))

        setNewsItems(galleryItems)
      })
      .catch(() => {
        if (mounted) setNewsItems(fallbackNewsItems)
      })

    return () => {
      mounted = false
    }
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
            LATEST NEWS
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">Stay updated with the latest updates</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {newsItems.map((item, index) => (
            <motion.article 
              key={item.id} 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: index * 0.1 }} 
              viewport={{ once: true }} 
              className="group cursor-pointer bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20"
            >
              <div className="relative overflow-hidden aspect-video bg-black">
                <Image 
                  src={item.image} 
                  alt={item.title} 
                  fill 
                  className="object-cover transition-transform duration-300 group-hover:scale-105" 
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="p-4 space-y-2">
                <p className="text-gray-400 text-xs tracking-widest">{item.date}</p>
                <h3 className="text-white font-bold text-base sm:text-lg tracking-wide group-hover:text-red-400 transition-colors line-clamp-2">
                  {item.title}
                </h3>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.3 }} 
          viewport={{ once: true }} 
          className="flex justify-center mt-8 sm:mt-10 md:mt-12"
        >
          <button className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-lg font-bold tracking-widest transition-colors text-sm sm:text-base">
            VIEW ALL NEWS
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>
    </section>
  )
}
