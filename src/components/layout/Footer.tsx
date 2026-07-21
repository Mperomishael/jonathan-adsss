'use client'

import { ChevronUp } from 'lucide-react'

interface FooterProps {
  variant?: 'main' | 'shop'
}

export default function Footer({ variant = 'main' }: FooterProps) {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  if (variant === 'shop') {
    return (
      <footer className="bg-[#2a3a4a] text-white py-12">
        <div className="px-4 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-lg italic text-jcvd-teal">
              &ldquo;You can act. You can transform. You can choose to change the world.&rdquo;
            </p>
            <p className="text-sm mt-2">- Jonathan Roumie</p>
          </div>

          <div className="bg-gray-300 text-gray-800 p-6 rounded mb-8">
            <h3 className="text-xl font-semibold mb-2">Subscribe to our newsletter</h3>
            <p className="text-sm mb-4">
              Enter your email address below to have our latest news and deals delivered straight to your inbox.
            </p>
            <div className="flex">
              <input type="email" placeholder="Email" className="flex-1 px-4 py-2 bg-white border-0" />
              <button className="bg-jcvd-teal text-white px-4 py-2 hover:bg-opacity-90 transition-colors">
                &rarr;
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
            {['Home', 'Sizing Charts', 'FAQ - Shipping & Exchange / Return Policy', 'Contact', 'Search', 'Terms of Service', 'Privacy Policy'].map((link) => (
              <a key={link} href="#" className="hover:text-jcvd-teal transition-colors">{link}</a>
            ))}
          </div>

          <div className="flex justify-center gap-4 mb-6">
            {['f', 't', 'ig'].map((icon) => (
              <a key={icon} href="#" className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                {icon}
              </a>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {['AMEX', 'Apple Pay', 'Bancontact', 'Diners', 'Discover', 'G Pay', 'iDEAL', 'Maestro', 'Mastercard', 'PayPal', 'Shop Pay', 'VISA'].map((method) => (
              <div key={method} className="bg-white text-black text-xs px-2 py-1 rounded">{method}</div>
            ))}
          </div>

          <p className="text-center text-xs text-jcvd-gray">&copy; 2026 Jonathan Roumie Shop. All prices displayed in USD.</p>
        </div>
      </footer>
    )
  }

  return (
    <footer className="bg-black text-white py-6 sm:py-8 border-t border-white/5">
      <div className="flex flex-col items-center px-4">
        <div className="mb-3 sm:mb-4">
          <span className="text-lg sm:text-2xl font-bold tracking-wider">JONATHAN <span className="font-normal">ROUMIE</span></span>
        </div>
        <p className="text-jcvd-gray text-xs sm:text-sm tracking-wide mb-1 sm:mb-2 text-center">
          OFFICIAL JONATHAN ROUMIE WEBSITE &copy; 2026
        </p>
        <a href="#" className="text-jcvd-gray text-xs sm:text-sm tracking-wide hover:text-white transition-colors mb-4 sm:mb-6">
          *TERMS &amp; CONDITIONS
        </a>
        <button onClick={scrollToTop} className="border border-white/30 p-2 hover:bg-white/10 transition-colors" aria-label="Back to top">
          <ChevronUp size={24} />
        </button>
      </div>
    </footer>
  )
}
