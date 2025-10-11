"use client"

import { Suspense } from "react"
import AllProductsSection from "@/components/ui/AllProductsSection"
import ShoppingCart from "@/components/ui/shoppingCart"
import Header from "@/components/ui/header"
import FooterSection from "@/components/ui/footerSection"

// Componente de loading para el Suspense
function ProductsLoading() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-3xl font-bold">TODOS LOS PRODUCTOS</h3>
        </div>
        <div className="flex justify-center items-center py-16">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
        </div>
      </div>
    </section>
  )
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Suspense fallback={<ProductsLoading />}>
        <AllProductsSection />
      </Suspense>
      <FooterSection />
      <ShoppingCart />
    </div>
  )
}
