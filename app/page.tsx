"use client"

import ProductsCards from "@/components/ui/productCard"
import ShoppingCart from "@/components/ui/shoppingCart"
import Header from "@/components/ui/header"
import { useState } from "react"
import {CartItemType} from "@/components/types/CartItem"
import ImageSection from "@/components/ui/imageSection"
import FooterSection from "@/components/ui/footerSection"
import WhatAppButton from "@/components/ui/whatAppButton"

export default function HomePage() {
  const [cart, setCart] = useState<CartItemType[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [genderFilter, setGenderFilter] = useState<"TODOS" | "HOMBRE" | "MUJER">("TODOS")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showCartAnimation, setShowCartAnimation] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  return (
    <div className="min-h-screen bg-white">
      <Header
        cart={cart}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        genderFilter={genderFilter}
        setGenderFilter={setGenderFilter}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        showCartAnimation={showCartAnimation}
        isAuthModalOpen={isAuthModalOpen}
        setIsAuthModalOpen={setIsAuthModalOpen}
      />
      <ImageSection />
      <ProductsCards cart={cart} setCart={setCart} setIsCartOpen={setIsCartOpen}/>
      <FooterSection />
      <WhatAppButton />
      <ShoppingCart cart={cart} setCart={setCart} isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen}/>
    </div>
  )
}
