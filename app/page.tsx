"use client"

import ProductsCards from "@/components/ui/productCard"
import ShoppingCart from "@/components/ui/shoppingCart"
import Header from "@/components/ui/header"
import ImageSection from "@/components/ui/imageSection"
import FooterSection from "@/components/ui/footerSection"
import WhatAppButton from "@/components/ui/whatAppButton"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <ImageSection />
      <ProductsCards />
      <FooterSection />
      <WhatAppButton />
      <ShoppingCart />
    </div>
  )
}
