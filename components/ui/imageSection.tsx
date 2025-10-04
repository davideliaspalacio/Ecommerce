import Image from "next/image"

export default function ImageSection() {
  return (
    <section className="relative h-screen mt-16">
    <div className="absolute inset-0">
      <Image
        src="https://b2cmattelsa.vtexassets.com/assets/vtex.file-manager-graphql/images/e1552ff0-e34a-4465-ba26-2e99a5baea0d___79b0e1b5d2d178c0fd90bba812248425.jpg"
        alt="Hero Mobile"
        fill
        className="object-cover block md:hidden"
        priority
      />
      <Image
        src="https://b2cmattelsa.vtexassets.com/assets/vtex.file-manager-graphql/images/14368c0a-01c5-4903-b25b-3284500e5334___7da05d1b77e25b8351c18a2831085762.jpg"
        alt="Hero Desktop"
        fill
        className="object-cover hidden md:block"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />
    </div>

    <div className="relative h-full flex items-center">

    </div>

    {/* Scroll Indicator */}
        <button
          onClick={() => {
            const el = document.getElementById("new-in")
            if (el) el.scrollIntoView({ behavior: "smooth" })
          }}
          className="absolute bottom-8 right-8 w-12 h-12 rounded-full border-2 border-white/50 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
        >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  </section>
  )
}