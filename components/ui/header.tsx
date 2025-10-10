"use client";

import Link from "next/link";
import AuthModal from "./authModal";
import ConfirmModal from "./ConfirmModal";
import WishlistModal from "./wishlistModal";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useUIStore } from "@/store/uiStore";
import { useAuthContext } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

export default function Header() {
  const { cart, isCartOpen, openCart, getItemCount, showCartAnimation } = useCartStore();
  const { wishlist, openWishlist, getWishlistCount } = useWishlistStore();
  const { 
    isMobileMenuOpen, 
    toggleMobileMenu, 
    isAuthModalOpen, 
    openAuthModal, 
    closeAuthModal 
  } = useUIStore();
  const { user, profile, signOut, loading } = useAuthContext();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSignOutClick = () => {
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSignOut = async () => {
    await signOut();
    setIsConfirmModalOpen(false);
  };
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
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
              <button className="hidden sm:block text-gray-700 hover:text-black transition-colors cursor-pointer">
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
              {loading ? (
                <div className="hidden sm:block w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              ) : user ? (
                <div className="hidden sm:flex items-center gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-8 h-8 bg-[#4a5a3f] rounded-full flex items-center justify-center text-white font-medium">
                      {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-700 font-medium">
                        {profile?.full_name || user.email}
                      </span>
                      {profile?.role === 'admin' && (
                        <Link 
                          href="/admin" 
                          className="text-xs text-[#4a5a3f] hover:underline"
                        >
                          Panel Admin
                        </Link>
                      )}
                      <Link 
                        href="/my-orders" 
                        className="text-xs text-gray-600 hover:text-[#4a5a3f] hover:underline"
                      >
                        📦 Mis Órdenes
                      </Link>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOutClick}
                    className="text-gray-500 hover:text-red-600 transition-colors text-sm"
                    title="Cerrar sesión"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={openAuthModal}
                  className="hidden sm:block text-gray-700 hover:text-black transition-colors cursor-pointer"
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
              )}

              {/* Botón de Mis Órdenes (solo si está logueado) */}
              {user && (
                <Link
                  href="/my-orders"
                  className="hidden sm:block text-gray-700 hover:text-[#4a5a3f] transition-colors relative"
                  title="Mis órdenes"
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
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </Link>
              )}
              
              {/* Botón de Wishlist */}
              <button
                onClick={openWishlist}
                className="text-gray-700 hover:text-red-500 transition-all duration-300 hover:scale-110 relative cursor-pointer"
                title="Mis favoritos"
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
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                {isMounted && getWishlistCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {getWishlistCount()}
                  </span>
                )}
              </button>
              
              <button
                onClick={openCart}
                className="text-gray-700 hover:text-black transition-all duration-300 hover:scale-110 relative cursor-pointer"
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
                {isMounted && cart.length > 0 && (
                  <span
                    className={`absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                      showCartAnimation ? "animate-bounce scale-110" : ""
                    }`}
                  >
                    {getItemCount()}
                  </span>
                )}
              </button>
            </div>
          </div>
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
              <div className="flex flex-col space-y-4 pt-4">
                {/* Enlace móvil a Mis Órdenes */}
                {user && (
                  <Link
                    href="/my-orders"
                    className="text-gray-700 hover:text-[#4a5a3f] transition-colors flex items-center justify-center gap-2 font-medium"
                    onClick={toggleMobileMenu}
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
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    <span>Mis Órdenes</span>
                  </Link>
                )}
                <div className="flex items-center gap-4 pt-2 justify-center">
                  <button className="text-gray-700 hover:text-black transition-colors cursor-pointer">
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
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                  ) : user ? (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#4a5a3f] rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {profile?.full_name || user.email}
                        </div>
                        <div className="flex flex-col gap-1">
                          {profile?.role === 'admin' && (
                            <Link 
                              href="/admin" 
                              className="text-xs text-[#4a5a3f] hover:underline"
                              onClick={() => toggleMobileMenu()}
                            >
                              Panel Admin
                            </Link>
                          )}
                          <button
                            onClick={() => {
                              handleSignOutClick();
                              toggleMobileMenu();
                            }}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            Cerrar sesión
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        openAuthModal();
                        toggleMobileMenu();
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
                  )}
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
        onClose={closeAuthModal}
      />
      <WishlistModal />
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmSignOut}
        title="Cerrar sesión"
        message="¿Estás seguro de que quieres cerrar sesión? Tendrás que volver a iniciar sesión para acceder a tu cuenta."
        confirmText="Sí, cerrar sesión"
        cancelText="Cancelar"
        isDestructive={true}
      />
    </>
  );
}
