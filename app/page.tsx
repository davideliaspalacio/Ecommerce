"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

type Product = {
  id: number
  name: string
  price: string
  image: string
  imageBack: string
  category: string
  gender: "HOMBRE" | "MUJER"
  description: string
  specifications: string[]
  sizes: string[]
}

type CartItem = {
  product: Product
  size: string
  quantity: number
}

const products: Product[] = [
  {
    id: 1,
    name: "CAMISETA OVERSIZE NEGRO ILUSTRACIÓN",
    price: "$129.000",
    image: "https://b2cmattelsa.vtexassets.com/arquivos/ids/682164-500-748?v=638939242540700000&width=500&height=748&aspect=true",
    imageBack: "https://b2cmattelsa.vtexassets.com/arquivos/ids/682165-500-748?v=638939242540830000&width=500&height=748&aspect=true",
    category: "CAMISETA",
    gender: "HOMBRE",
    description:
      "Camiseta Oversize confeccionada en un Jersey Premium de alto gramaje de 260gr de peso. Con estampación en frente y espalda en la técnica de plastisol.",
    specifications: ["Ilustración", "100% Algodón", "Alto Gramaje", "Tela Premium", "Oversize"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: 2,
    name: "GORRA BASEBALL VERDE Y BLANCO",
    price: "$19.000",
    image: "https://b2cmattelsa.vtexassets.com/arquivos/ids/683474-500-748?v=638939241393270000&width=500&height=748&aspect=true",
    imageBack: "https://b2cmattelsa.vtexassets.com/arquivos/ids/683475-500-748?v=638939241393400000&width=500&height=748&aspect=true",
    category: "CAMISETA",
    gender: "MUJER",
    description: "Gorra baseball de alta calidad con diseño streetwear. Ajustable y cómoda para uso diario.",
    specifications: ["Diseño Streetwear", "Ajustable", "100% Algodón", "Bordado de calidad"],
    sizes: ["ÚNICA"],
  },
  {
    id: 3,
    name: "CAMISETA OVERSIZE GRIS MINIMAL",
    price: "$32.000",
    image: "https://b2cmattelsa.vtexassets.com/arquivos/ids/683326-500-748?v=638939052809100000&width=500&height=748&aspect=true",
    imageBack: "https://b2cmattelsa.vtexassets.com/arquivos/ids/683327-500-748?v=638939052809270000&width=500&height=748&aspect=true",
    category: "CAMISETA",
    gender: "HOMBRE",
    description: "Camiseta oversize con diseño minimalista. Perfecta para un look urbano y relajado.",
    specifications: ["Diseño Minimal", "100% Algodón", "Oversize Fit", "Tela Premium"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: 4,
    name: "SUDADERA NEGRA PARADISE PRINT",
    price: "$45.000",
    image: "https://b2cmattelsa.vtexassets.com/arquivos/ids/683062-500-748?v=638939241746500000&width=500&height=748&aspect=true",
    imageBack: "https://b2cmattelsa.vtexassets.com/arquivos/ids/683063-500-748?v=638939241746530000&width=500&height=748&aspect=true",
    category: "SUDADERA",
    gender: "HOMBRE",
    description: "Sudadera con capucha y estampado Paradise. Confeccionada en algodón premium de alto gramaje.",
    specifications: ["Estampado Paradise", "100% Algodón", "Con Capucha", "Alto Gramaje", "Oversize"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: 5,
    name: "TOP CROP BLANCO BÁSICO",
    price: "$59.000",
    image: "https://b2cmattelsa.vtexassets.com/arquivos/ids/681959-500-748?v=638939243678000000&width=500&height=748&aspect=true",
    imageBack: "https://b2cmattelsa.vtexassets.com/arquivos/ids/681960-500-748?v=638939243678300000&width=500&height=748&aspect=true",
    category: "TOP",
    gender: "MUJER",
    description: "Top corto de algodón suave, ideal para combinar con jean o jogger.",
    specifications: ["Corte crop", "Algodón suave", "Ajuste cómodo"],
    sizes: ["XS", "S", "M", "L"],
  },
  {
    id: 6,
    name: "JEAN MOM AZUL CLÁSICO",
    price: "$159.000",
    image: "https://b2cmattelsa.vtexassets.com/arquivos/ids/682722-500-748?v=638938970103470000&width=500&height=748&aspect=true",
    imageBack: "https://b2cmattelsa.vtexassets.com/arquivos/ids/682723-500-748?v=638938970103800000&width=500&height=748&aspect=true",
    category: "JEAN",
    gender: "MUJER",
    description: "Jean tiro alto estilo mom con lavado azul clásico.",
    specifications: ["Tiro alto", "Lavado azul", "Tela con stretch"],
    sizes: ["24", "26", "28", "30"],
  },
  {
    id: 7,
    name: "CAMISETA BABY TEE NEGRA",
    price: "$69.000",
    image: "https://b2cmattelsa.vtexassets.com/arquivos/ids/684035-1200-auto?v=638941828602070000&width=1200&height=auto&aspect=true",
    imageBack: "https://b2cmattelsa.vtexassets.com/arquivos/ids/684036-500-748?v=638941828602400000&width=500&height=748&aspect=true",
    category: "CAMISETA",
    gender: "MUJER",
    description: "Baby tee ajustada con cuello redondo y algodón elástico.",
    specifications: ["Ajuste slim", "Algodón con spandex", "Cuello redondo"],
    sizes: ["XS", "S", "M", "L"],
  },
  {
    id: 8,
    name: "JOGGER CARGO OLIVA",
    price: "$139.000",
    image: "https://b2cmattelsa.vtexassets.com/arquivos/ids/684067-500-748?v=638941832221070000&width=500&height=748&aspect=true",
    imageBack: "https://b2cmattelsa.vtexassets.com/arquivos/ids/684068-500-748?v=638941832221070000&width=500&height=748&aspect=true",
    category: "JOGGER",
    gender: "HOMBRE",
    description: "Jogger cargo en sarga oliva con múltiples bolsillos y ajuste en bota.",
    specifications: ["Sarga", "Bolsillos cargo", "Cordón en pretina"],
    sizes: ["S", "M", "L", "XL"],
  },
]

export default function HomePage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [showAbout, setShowAbout] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [genderFilter, setGenderFilter] = useState<"TODOS" | "HOMBRE" | "MUJER">("TODOS")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showCartAnimation, setShowCartAnimation] = useState(false)
  const [isCartClosing, setIsCartClosing] = useState(false)
  const [isProductModalClosing, setIsProductModalClosing] = useState(false)

  const addToCart = () => {
    if (!selectedProduct || !selectedSize) return

    const existingItemIndex = cart.findIndex(
      (item) => item.product.id === selectedProduct.id && item.size === selectedSize,
    )

    if (existingItemIndex > -1) {
      const newCart = [...cart]
      newCart[existingItemIndex].quantity += 1
      setCart(newCart)
    } else {
      setCart([...cart, { product: selectedProduct, size: selectedSize, quantity: 1 }])
    }

    // Animación de éxito
    setShowCartAnimation(true)
    setTimeout(() => setShowCartAnimation(false), 2000)

    setSelectedProduct(null)
    setIsCartOpen(true)
  }

  const removeFromCart = (productId: number, size: string) => {
    setCart(cart.filter((item) => !(item.product.id === productId && item.size === size)))
  }

  const updateQuantity = (productId: number, size: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId, size)
      return
    }

    setCart(
      cart.map((item) =>
        item.product.id === productId && item.size === size ? { ...item, quantity: newQuantity } : item,
      ),
    )
  }

  const getTotal = () => {
    return cart.reduce((total, item) => {
      const price = Number.parseInt(item.product.price.replace(/[$.]/g, ""))
      return total + price * item.quantity
    }, 0)
  }

  const closeCart = () => {
    setIsCartClosing(true)
    setTimeout(() => {
      setIsCartOpen(false)
      setIsCartClosing(false)
    }, 400) // Duración de la animación de salida
  }

  const closeProductModal = () => {
    setIsProductModalClosing(true)
    setTimeout(() => {
      setSelectedProduct(null)
      setIsProductModalClosing(false)
    }, 300) // Duración de la animación de salida
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-700 hover:text-black transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>

            {/* Desktop Left Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => setGenderFilter("HOMBRE")}
                className={`text-sm font-medium transition-colors ${
                  genderFilter === "HOMBRE" ? "text-black" : "text-gray-700 hover:text-black"
                }`}
              >
                HOMBRES
              </button>
              <button
                onClick={() => setGenderFilter("MUJER")}
                className={`text-sm font-medium transition-colors ${
                  genderFilter === "MUJER" ? "text-black" : "text-gray-700 hover:text-black"
                }`}
              >
                MUJER
              </button>
              <button
                onClick={() => setGenderFilter("TODOS")}
                className={`text-sm font-medium transition-colors ${
                  genderFilter === "TODOS" ? "text-black" : "text-gray-700 hover:text-black"
                }`}
              >
                TODOS
              </button>
            </div>

            {/* Center Logo */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2">
              <h1 className="text-xl md:text-2xl font-bold tracking-wider">ENOUGH</h1>
            </Link>

            {/* Right Icons */}
            <div className="flex items-center gap-2 md:gap-4">
              <button className="hidden sm:block text-gray-700 hover:text-black transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
              <button className="hidden sm:block text-gray-700 hover:text-black transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>
              <button className="hidden sm:block text-gray-700 hover:text-black transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setIsCartOpen(true)}
                className="text-gray-700 hover:text-black transition-all duration-300 hover:scale-110 relative"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                {cart.length > 0 && (
                  <span className={`absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${showCartAnimation ? 'animate-bounce scale-110' : ''}`}>
                    {cart.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
              <div className="flex flex-col space-y-4 pt-4">
                <button
                  onClick={() => {
                    setGenderFilter("HOMBRE")
                    setIsMobileMenuOpen(false)
                  }}
                  className={`text-left text-sm font-medium transition-colors py-2 ${
                    genderFilter === "HOMBRE" ? "text-black" : "text-gray-700 hover:text-black"
                  }`}
                >
                  HOMBRES
                </button>
                <button
                  onClick={() => {
                    setGenderFilter("MUJER")
                    setIsMobileMenuOpen(false)
                  }}
                  className={`text-left text-sm font-medium transition-colors py-2 ${
                    genderFilter === "MUJER" ? "text-black" : "text-gray-700 hover:text-black"
                  }`}
                >
                  MUJER
                </button>
                <button
                  onClick={() => {
                    setGenderFilter("TODOS")
                    setIsMobileMenuOpen(false)
                  }}
                  className={`text-left text-sm font-medium transition-colors py-2 ${
                    genderFilter === "TODOS" ? "text-black" : "text-gray-700 hover:text-black"
                  }`}
                >
                  TODOS
                </button>
                <div className="flex items-center gap-4 pt-2">
                  <button className="text-gray-700 hover:text-black transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>
                  <button className="text-gray-700 hover:text-black transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </button>
                  <button className="text-gray-700 hover:text-black transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen mt-16">
        <div className="absolute inset-0">
          {/* Mobile Image - Solo en celulares */}
          <Image
            src="https://b2cmattelsa.vtexassets.com/assets/vtex.file-manager-graphql/images/e1552ff0-e34a-4465-ba26-2e99a5baea0d___79b0e1b5d2d178c0fd90bba812248425.jpg"
            alt="Hero Mobile"
            fill
            className="object-cover block md:hidden"
            priority
          />
          {/* Desktop Image - Solo en PC */}
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

      {/* New In Section */}
      <section id="new-in" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold">NEW IN</h3>
            <button className="px-6 py-2 border border-gray-900 text-sm font-medium hover:bg-gray-900 hover:text-white transition-colors">
              VIEW TODOS
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products
              .filter((p) => (genderFilter === "TODOS" ? true : p.gender === genderFilter))
              .map((product) => (
              <article
                key={product.id}
                className="pointer pt3 pb4 flex flex-column h-100 group cursor-pointer"
                onClick={() => {
                  setSelectedProduct(product)
                  setSelectedSize("")
                  setCurrentImageIndex(0)
                }}
              >
                {/* Image Container */}
                <div className="relative mb-4">
                  <div className="dib relative hoverEffect">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={500}
                      height={748}
                      className="w-100 h-100 object-contain transition-opacity duration-300 group-hover:opacity-0"
                      style={{ maxHeight: 'unset', maxWidth: '500px' }}
                    />
                    <Image
                      src={product.imageBack || product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={500}
                      height={748}
                      className="w-100 h-100 absolute top-0 left-0 z-10 object-contain opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ maxHeight: 'unset', maxWidth: '500px' }}
                    />
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex flex-column justify-end items-center">
                  <span className="text-sm font-medium text-gray-700 mb-2">{product.category}</span>
                  
                  <div className="flex flex-column justify-start">
                    <div className="pt1 pb3">
                      <span className="text-lg font-medium text-gray-900">
                        <span className="text-sm">$</span>
                        <span className="text-sm">&nbsp;</span>
                        <span className="text-lg">{product.price.replace('$', '').replace('.', '')}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="relative h-[900px] bg-gray-900">
        <div className="absolute inset-0">
          {/* Mobile Image - Solo en dispositivos pequeños */}
          <Image
            src="https://b2cmattelsa.vtexassets.com/assets/vtex.file-manager-graphql/images/8c319409-5eff-4197-9cca-9e7f2c7608de___80f2c3f1cb08ef28a55fd1eb44a65455.jpg"
            alt="Promo Mobile"
            fill
            className="object-cover opacity-90 block md:hidden"
            priority
          />
          {/* Desktop Image - Solo en PC */}
          <Image
            src="https://b2cmattelsa.vtexassets.com/assets/vtex.file-manager-graphql/images/66c42849-ed6a-4302-990b-096f3f0daf83___6480ef11da81da16a5e3e0ca7e944fed.jpg"
            alt="Promo Desktop"
            fill
            className="object-cover opacity-90 hidden md:block"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#4a5a3f] text-white py-12">
        <div className="container mx-auto px-4">
          {/* Brand Name */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold tracking-wider">ENOUGH®</h2>
          </div>

          {/* Social Media Icons */}
          <div className="flex justify-center gap-4 mb-8">
            {/* WhatsApp */}
            <a href="https://wa.me/573005071000" className="text-white hover:text-gray-300 transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
            </a>
            
            {/* Facebook */}
            <a href="#" className="text-white hover:text-gray-300 transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            
            {/* Instagram */}
            <a href="#" className="text-white hover:text-gray-300 transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-4.358-.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            
            {/* X (Twitter) */}
            <a href="#" className="text-white hover:text-gray-300 transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            
            {/* Spotify */}
            <a href="#" className="text-white hover:text-gray-300 transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.44-.482.138-.96-.162-1.098-.539-.138-.42.162-.96.54-1.02 4.26-1.26 9.6-.66 13.2 1.68.479.24.6.78.36 1.02zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </a>
            
            {/* TikTok */}
            <a href="#" className="text-white hover:text-gray-300 transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
          </div>

          {/* Three Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* SOBRE LA MARCA */}
            <div>
              <h5 className="font-semibold mb-3 text-base">SOBRE LA MARCA</h5>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                    SOBRE NOSOTROS
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                    LO QUE HAY DETRÁS DE UNA CAMISETA
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                    CULTURA
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                    TRABAJA AQUÍ
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                    LA VIDA EN MATTELSA
                  </Link>
                </li>
              </ul>
            </div>

            {/* AYUDA */}
            <div>
              <h5 className="font-semibold mb-3 text-base">AYUDA</h5>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                    ENVÍOS
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                    SEGUIMIENTO DE PEDIDOS
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                    PREGUNTAS FRECUENTES
                  </Link>
                </li>
              </ul>
            </div>

            {/* CONTACTO */}
            <div>
              <h5 className="font-semibold mb-3 text-base">CONTACTO</h5>
              <ul className="space-y-2 text-xs">
                <li className="text-gray-300">
                  300 507 10 00
                </li>
                <li className="text-gray-300">
                  PBX: 01 8000 41 37 57
                </li>
                <li>
                  <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                    ESCRÍBENOS TU PQRS
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-600 mb-6"></div>

          {/* Legal Links */}
          <div className="flex flex-wrap justify-center gap-6 text-xs">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              TÉRMINOS Y CONDICIONES
            </Link>
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              POLÍTICA DE PRIVACIDAD
            </Link>
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              SUPERINTENDENCIA
            </Link>
          </div>
        </div>
      </footer>

      {/* Success Notification */}
      {showCartAnimation && (
        <div className="fixed top-20 right-6 z-[60] bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-slide-in-right">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">¡Producto agregado al carrito!</span>
          </div>
        </div>
      )}

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/573005071000"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        aria-label="Contactar por WhatsApp"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
        </svg>
      </a>

      {isCartOpen && (
        <div className={`fixed inset-0 z-[100] ${isCartClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
          {/* Overlay */}
          <div className={`absolute inset-0 bg-black/50 ${isCartClosing ? 'animate-fade-out' : 'animate-fade-in'}`} onClick={closeCart} />

          {/* Panel del carrito */}
          <div className={`absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col ${isCartClosing ? 'animate-slide-out-right' : 'animate-slide-in-right'}`}>
            {/* Header del carrito */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">CARRITO DE COMPRAS</h2>
              <button
                onClick={closeCart}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido del carrito */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <p className="text-gray-500 text-lg mb-2">Tu carrito está vacío</p>
                  <p className="text-gray-400 text-sm">Agrega productos para comenzar tu compra</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <div key={`${item.product.id}-${item.size}-${index}`} className="flex gap-4 pb-4 border-b animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="relative w-24 h-24 bg-gray-100 flex-shrink-0">
                        <Image
                          src={item.product.image || "/placeholder.svg"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm mb-1 line-clamp-2">{item.product.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">Talla: {item.size}</p>
                        <p className="font-medium">{item.product.price}</p>

                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center border border-gray-300 rounded">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                              className="px-3 py-1 hover:bg-gray-100 transition-colors"
                            >
                              -
                            </button>
                            <span className="px-3 py-1 border-x border-gray-300">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                              className="px-3 py-1 hover:bg-gray-100 transition-colors"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.product.id, item.size)}
                            className="text-sm text-red-600 hover:text-red-700 transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer del carrito con total */}
            {cart.length > 0 && (
              <div className="border-t p-6 space-y-4">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>TOTAL</span>
                  <span>${getTotal().toLocaleString("es-CO")}</span>
                </div>

                <button className="w-full bg-[#4a5a3f] text-white py-3 font-medium hover:bg-[#3d4a34] transition-colors">
                  FINALIZAR COMPRA POR WHATSAPP
                </button>

                <button
                  onClick={closeCart}
                  className="w-full border border-gray-300 py-3 font-medium hover:border-black transition-colors"
                >
                  SEGUIR COMPRANDO
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className={`fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 ${isProductModalClosing ? 'animate-fade-out' : 'animate-fade-in'}`} onClick={closeProductModal}>
          <div className={`bg-white w-full max-w-6xl max-h-[90vh] overflow-y-auto relative ${isProductModalClosing ? 'animate-scale-out' : 'animate-scale-in'}`} onClick={(e) => e.stopPropagation()}>
            {/* Banner Premium */}
            <div className="bg-[#4a5a3f] text-white px-6 py-3 flex items-center justify-between">
              <p className="text-sm">TELA PREMIUM | Una vez la tocas, notarás la diferencia</p>
              <button
                onClick={closeProductModal}
                className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8 p-8">
              {/* Imágenes del producto */}
              <div className="space-y-4">
                <div className="relative aspect-square bg-gray-100">
                  <Image
                    src={currentImageIndex === 0 ? selectedProduct.image : selectedProduct.imageBack}
                    alt={selectedProduct.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setCurrentImageIndex(0)}
                    className={`relative aspect-square bg-gray-100 border-2 ${
                      currentImageIndex === 0 ? "border-black" : "border-transparent"
                    }`}
                  >
                    <Image
                      src={selectedProduct.image || "/placeholder.svg"}
                      alt="Frente"
                      fill
                      className="object-cover"
                    />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(1)}
                    className={`relative aspect-square bg-gray-100 border-2 ${
                      currentImageIndex === 1 ? "border-black" : "border-transparent"
                    }`}
                  >
                    <Image
                      src={selectedProduct.imageBack || "/placeholder.svg"}
                      alt="Espalda"
                      fill
                      className="object-cover"
                    />
                  </button>
                </div>
              </div>

              {/* Información del producto */}
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Item: {selectedProduct.id}9060</p>
                  <h2 className="text-2xl font-bold mb-2">{selectedProduct.name}</h2>
                  <p className="text-2xl font-medium">{selectedProduct.price}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-3">El modelo mide 1.83m y tiene una talla M</p>
                  <div className="flex gap-2 mb-4">
                    {selectedProduct.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-6 py-2 border ${
                          selectedSize === size
                            ? "border-black bg-black text-white"
                            : "border-gray-300 hover:border-black"
                        } transition-colors`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={addToCart}
                  disabled={!selectedSize}
                  className={`w-full py-3 text-white font-medium transition-all duration-300 ${
                    selectedSize 
                      ? "bg-[#4a5a3f] hover:bg-[#3d4a34] hover:scale-105 active:scale-95" 
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  {selectedSize ? "AGREGAR AL CARRITO" : "SELECCIONA UNA TALLA"}
                </button>

                {/* Sección "Sobre el producto" */}
                <div className="border-t pt-4">
                  <button
                    onClick={() => setShowAbout(!showAbout)}
                    className="w-full flex items-center justify-between py-2 font-medium"
                  >
                    <span>SOBRE EL PRODUCTO</span>
                    <svg
                      className={`w-5 h-5 transition-transform ${showAbout ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showAbout && (
                    <div className="pt-4 space-y-4 text-sm text-gray-700">
                      <p>{selectedProduct.description}</p>

                      <div>
                        <p className="font-medium mb-2">ESPECIFICACIONES</p>
                        <ul className="space-y-1">
                          {selectedProduct.specifications.map((spec, index) => (
                            <li key={index}>• {spec}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">COMPOSICIÓN Y CUIDADOS</p>
                        <p className="text-gray-600">Tela principal/Main fabric</p>
                        <p>• 100% algodón/cotton</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
