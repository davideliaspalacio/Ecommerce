"use client"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useRef } from "react"

export default function FooterSection() {
  const greenFooterRef = useRef<HTMLDivElement>(null)
  const bottomLogoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = bottomLogoRef.current
    if (!el) return

    let timer: number | undefined
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && entry.intersectionRatio === 1) {
          timer = window.setTimeout(() => {
            const green = greenFooterRef.current
            if (!green) return
            const rect = green.getBoundingClientRect()
            const footerBottom = rect.bottom + window.scrollY
            const target = Math.max(footerBottom - window.innerHeight, 0)
            window.scrollTo({ top: target, behavior: "smooth" })
          }, 200)
        } else if (timer) {
          window.clearTimeout(timer)
        }
      },
      { threshold: 1.0 }
    )

    observer.observe(el)
    return () => {
      if (timer) window.clearTimeout(timer)
      observer.disconnect()
    }
  }, [])

  return (
    <>
      <footer className="bg-[#4a5a3f] text-white py-12" ref={greenFooterRef}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image src="/favicon.png" alt="ENOUGHH logo" width={28} height={28} className="rounded" />
              <span className="text-sm font-semibold tracking-wide">ENOUGHH®</span>
            </div>

            <nav className="flex items-center gap-4 text-[11px] sm:text-xs text-gray-200">
              <Link href="/" className="hover:text-white transition-colors">TÉRMINOS</Link>
              <span className="opacity-40">•</span>
              <Link href="/" className="hover:text-white transition-colors">PRIVACIDAD</Link>
              <span className="opacity-40">•</span>
              <Link href="/" className="hover:text-white transition-colors">SUPERINTENDENCIA</Link>
            </nav>

            <div className="text-[11px] sm:text-xs text-gray-300">
              © {new Date().getFullYear()} ENOUGHH®. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>

      <div className="bg-white py-12" ref={bottomLogoRef}>
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
              <Image
                src="/favicon.png"
                alt="ENOUGHH spinning logo"
                width={150}
                height={150}
                className="animate-spin animation-duration-[500ms]"
              />

          </div>
        </div>
      </div>
    </>
  )
}