"use client"

import { Suspense } from "react"
import ProductsCards from "@/components/ui/productCard"
import ShoppingCart from "@/components/ui/shoppingCart"
import Header from "@/components/ui/header"
import ImageSection from "@/components/ui/imageSection"
import FooterSection from "@/components/ui/footerSection"
import WhatAppButton from "@/components/ui/whatAppButton"

// Componente de loading para el Suspense
function ProductsLoading() {
  return (
    <section id="new-in" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-3xl font-bold">NEW IN</h3>
        </div>
        <div className="flex justify-center items-center py-16">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <ImageSection />
      <Suspense fallback={<ProductsLoading />}>
        <ProductsCards />
      </Suspense>
      <FooterSection />
      <WhatAppButton />
      <ShoppingCart />
    </div>
  )
}
