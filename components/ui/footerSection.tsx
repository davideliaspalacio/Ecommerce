import Link from "next/link"
import Image from "next/image"

export default function FooterSection() {
  return (
    <footer className="bg-[#4a5a3f] text-white py-6">
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
  )
}