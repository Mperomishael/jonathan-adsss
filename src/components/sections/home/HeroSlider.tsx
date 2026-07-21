'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Slide {
  id: number
  image: string
  title: string
  subtitle?: string
}

const defaultSlides: Slide[] = [
  { id: 1, image: '/images/hero/18d4b710-e20d-4e9a-b966-9e792a5523df.jpeg', title: 'JONATHAN', subtitle: 'ROUMIE' },
  { id: 2, image: '/images/hero/Johnathan Roumie.jfif', title: 'ACTION', subtitle: 'CINEMA' },
  { id: 3, image: '/images/hero/Jonathan Roumie.jpeg', title: 'ADVENTURE', subtitle: 'AWAITS' },
  { id: 4, image: '/images/hero/download (6).jfif', title: 'EXCLUSIVE', subtitle: 'CONTENT' },
  { id: 5, image: '/images/hero/download (7).jfif', title: 'LATEST', subtitle: 'PROJECTS' },
  { id: 6, image: '/images/hero/download (9).jfif', title: 'LEGENDARY', subtitle: 'ROLES' },
]

export default function HeroSlider({ slides = defaultSlides }: { slides?: Slide[] }) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = useCallback(() => setCurrentSlide((prev) => (prev + 1) % slides.length), [slides.length])
  const prevSlide = useCallback(() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length), [slides.length])

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [nextSlide])

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-white text-2xl sm:text-3xl md:text-5xl font-bold tracking-widest mb-2"
            >
              {slides[currentSlide].title}
            </motion.h1>
            {slides[currentSlide].subtitle && (
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-white text-xl sm:text-2xl md:text-4xl font-bold tracking-widest mb-4 sm:mb-6"
              >
                {slides[currentSlide].subtitle}
              </motion.h2>
            )}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="border border-white/50 px-4 sm:px-6 py-2 sm:py-3 cursor-pointer hover:bg-white/10 transition-colors"
            >
              <span className="text-white text-xs sm:text-sm tracking-widest block mb-1">CLICK TO WATCH</span>
              <span className="text-jcvd-red text-base sm:text-xl font-bold tracking-widest">TRAILER</span>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <button onClick={prevSlide} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-1 sm:p-2 z-10" aria-label="Previous slide">
        <ChevronLeft size={24} className="sm:w-10 sm:h-10" />
      </button>
      <button onClick={nextSlide} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-1 sm:p-2 z-10" aria-label="Next slide">
        <ChevronRight size={24} className="sm:w-10 sm:h-10" />
      </button>

      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full border border-white transition-colors ${index === currentSlide ? 'bg-jcvd-red border-jcvd-red' : 'bg-transparent'}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
