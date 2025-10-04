"use client";

import Link from "next/link";
import { CartItemType } from "@/components/types/CartItem";
import AuthModal from "./authModal";

interface HeaderProps {
  cart: CartItemType[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  genderFilter: "TODOS" | "HOMBRE" | "MUJER";
  setGenderFilter: (filter: "TODOS" | "HOMBRE" | "MUJER") => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  showCartAnimation: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
}

export default function Header({
  cart,
  isCartOpen,
  setIsCartOpen,
  genderFilter,
  setGenderFilter,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  showCartAnimation,
  isAuthModalOpen,
  setIsAuthModalOpen,
}: HeaderProps) {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-700 hover:text-black transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isMobileMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
            <Link href="/" className="absolute left-1/2 -translate-x-1/2">
              <h1 className="text-xl md:text-2xl font-bold tracking-wider">
                ENOUGH
              </h1>
            </Link>
            <div className="flex items-center gap-2 md:gap-4 ml-auto">
              <button className="hidden sm:block text-gray-700 hover:text-black transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="hidden sm:block text-gray-700 hover:text-black transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setIsCartOpen(true)}
                className="text-gray-700 hover:text-black transition-all duration-300 hover:scale-110 relative"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                {cart.length > 0 && (
                  <span
                    className={`absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                      showCartAnimation ? "animate-bounce scale-110" : ""
                    }`}
                  >
                    {cart.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
              <div className="flex flex-col space-y-4 pt-4">
                <div className="flex items-center gap-4 pt-2 justify-center">
                  <button className="text-gray-700 hover:text-black transition-colors">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-gray-700 hover:text-black transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </button>
                  <button className="text-gray-700 hover:text-black transition-colors">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
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
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
