'use client'
import { motion } from 'framer-motion'
import { Play, ExternalLink } from 'lucide-react'

const clips = [
  {
    id: 1,
    image: '/images/clips/Jonathan Roumie.jfif',
    title: 'EXCLUSIVE TRAILER',
    url: 'https://youtu.be/0pioowzlZ-o?si=7s2M89NdwIb2E_Pl',
  },
  {
    id: 2,
    image: '/images/clips/download (1).jfif',
    title: 'BEHIND THE SCENES',
    url: 'https://youtu.be/sTEgHOa3Ph0?si=5U-9vBayvLMJiqkD',
  },
  {
    id: 3,
    image: '/images/clips/download (2).jfif',
    title: 'ACTION HIGHLIGHTS',
    url: 'https://youtu.be/wVH2q6i0ttY?si=N8PL10c-Oh3fWUdN',
  },
  {
    id: 4,
    image: '/images/clips/download (4).jfif',
    title: 'FEATURED CLIPS',
    url: 'https://youtu.be/C_DTl2ERz3c?si=3I2J9S2_AuPKFOHO',
  },
]

export default function YouTubeClips() {
  return (
    <section className="bg-gradient-to-b from-black to-black/90 py-12 sm:py-16 md:py-20 px-4 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }} 
          viewport={{ once: true }} 
          className="text-center mb-8 sm:mb-10 md:mb-12"
        >
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-black tracking-widest mb-2">
            YOUTUBE CLIPS &amp; TRAILERS
          </h2>
          <p className="text-gray-400">Watch exclusive scenes and movie trailers</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {clips.map((clip, index) => (
            <motion.a
              key={clip.id}
              href={clip.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-xl"
            >
              <div className="relative aspect-video bg-black overflow-hidden">
                <img 
                  src={clip.image} 
                  alt={clip.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300" />
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-16 h-16 rounded-full border-3 border-white flex items-center justify-center bg-red-600/20 backdrop-blur-sm"
                  >
                    <Play size={28} className="text-white fill-white ml-1" />
                  </motion.div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <h3 className="text-white font-black text-lg md:text-xl tracking-widest">
                    {clip.title}
                  </h3>
                  <ExternalLink size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.3 }} 
          viewport={{ once: true }} 
          className="text-center mt-8 sm:mt-10 md:mt-12"
        >
          <p className="text-gray-400 mb-4 sm:mb-6 max-w-2xl mx-auto text-sm sm:text-base">
            Subscribe to the official Jonathan Roumie YouTube channel for exclusive content, behind-the-scenes videos, and more.
          </p>
          <a 
            href="https://www.youtube.com/@JonathanRoumie" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-2 sm:gap-3 bg-red-600 hover:bg-red-700 text-white px-4 sm:px-8 py-2 sm:py-4 rounded-lg font-bold tracking-widest transition-colors text-sm sm:text-base"
          >
            <span>VISIT CHANNEL</span>
            <ExternalLink size={18} />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
