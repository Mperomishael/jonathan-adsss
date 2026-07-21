import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import HeroSlider from '@/components/sections/home/HeroSlider'
import { WelcomeBanner } from '@/components/sections/home/WelcomeBanner'
import YouTubeClips from '@/components/sections/home/YouTubeClips'
import LatestNews from '@/components/sections/home/LatestNews'
import Gallery from '@/components/sections/home/Gallery'
import SocialSection from '@/components/sections/home/SocialSection'
import FanCardSection from '@/components/sections/home/FanCardSection'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      <Header variant="main" />
      <main className="pt-0">
        <HeroSlider />
        <WelcomeBanner />
        
        {/* Fan Card Section - Adaptive for auth status */}
        <FanCardSection />

        {/* Store CTA with Image */}
        <section className="py-12 sm:py-16 md:py-24 px-4 bg-gradient-to-b from-transparent via-blue-900/5 to-transparent">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12 items-center">
              <div className="order-2 md:order-1">
                <img
                  src="/images/shop/WhatsApp_Image_2026-04-23_at_19.13.27.jpeg"
                  alt="Store"
                  className="w-full h-48 sm:h-64 md:h-80 object-cover rounded-xl sm:rounded-2xl shadow-2xl"
                />
              </div>
              <div className="order-1 md:order-2 space-y-4 sm:space-y-6">
                <h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-widest leading-tight">
                  EXCLUSIVE STORE
                </h2>
                <p className="text-gray-400 text-sm sm:text-base md:text-lg">
                  Shop exclusive merchandise, apparel, and limited edition collectibles.
                </p>
                <Link
                  href="/shop"
                  className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold tracking-widest transition-all text-sm sm:text-base"
                >
                  VISIT STORE →
                </Link>
              </div>
            </div>
          </div>
        </section>

        <YouTubeClips />
        <LatestNews />
        <Gallery />
        <SocialSection />
      </main>
      <Footer variant="main" />
    </div>
  )
}
