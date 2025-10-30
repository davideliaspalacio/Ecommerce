"use client";

import { Suspense } from "react";
import Header from "@/components/ui/header";
import FooterSection from "@/components/ui/footerSection";
import ShoppingCart from "@/components/ui/shoppingCart";

import { useProductsContext } from "@/contexts/ProductsContext";
import { useUIStore } from "@/store/uiStore";
function CollectionsLoading() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Colecciones</h1>
        </div>
        <div className="flex justify-center items-center py-16">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
        </div>
      </div>
    </section>
  );
}

export default function CollectionsPage() {
  const {  loading } = useProductsContext();
  const { setGenderFilter } = useUIStore();


  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <CollectionsLoading />
        <FooterSection />
        <ShoppingCart />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <FooterSection />
      <ShoppingCart />
    </div>
  );
}
