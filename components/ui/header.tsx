"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthModal from "./authModal";
import ConfirmModal from "./ConfirmModal";
import WishlistModal from "./wishlistModal";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useUIStore } from "@/store/uiStore";
import { useAuthContext } from "@/contexts/AuthContext";
import { usePendingOrder } from "@/hooks/usePendingOrder";
import PendingOrderModal from "./PendingOrderModal";
import { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const { cart, isCartOpen, openCart, getItemCount, showCartAnimation } = useCartStore();
  const { wishlist, openWishlist, getWishlistCount } = useWishlistStore();
  const { 
    isMobileMenuOpen, 
    toggleMobileMenu, 
    isAuthModalOpen, 
    openAuthModal, 
    closeAuthModal,
    isPendingOrderModalOpen,
    openPendingOrderModal,
    closePendingOrderModal
  } = useUIStore();
  const { user, profile, signOut, loading } = useAuthContext();
  const { 
    pendingOrder, 
    timeRemaining, 
    isExpired, 
    isLoading: pendingOrderLoading,
    checkPendingOrder,
    cancelPendingOrder,
    clearError
  } = usePendingOrder();
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

  // Handlers for pending order
  const handleContinueOrder = () => {
    // Close the modal first
    closePendingOrderModal();
    // Redirect to checkout page with payment step
    window.location.href = '/checkout?step=payment';
  };

  const handleCancelOrder = async () => {
    const success = await cancelPendingOrder();
    if (success) {
      closePendingOrderModal();
    }
  };

  // Format time remaining
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Show pending order modal when there's a pending order (but NOT on checkout page)
  useEffect(() => {
    const isCheckoutPage = window.location.pathname === '/checkout';
    
    // NUNCA mostrar modal en checkout - siempre cerrarlo
    if (isCheckoutPage) {
      if (isPendingOrderModalOpen) {
        closePendingOrderModal();
      }
      return;
    }
    
    // Solo mostrar modal en otras páginas
    if (pendingOrder && !isExpired && !isPendingOrderModalOpen) {
      openPendingOrderModal();
    }
  }, [pendingOrder, isExpired, isPendingOrderModalOpen, openPendingOrderModal, closePendingOrderModal]);

  // Listen for custom event to close modal
  useEffect(() => {
    const handleCloseModal = () => {
      closePendingOrderModal();
    };

    window.addEventListener('closePendingOrderModal', handleCloseModal);
    return () => {
      window.removeEventListener('closePendingOrderModal', handleCloseModal);
    };
  }, [closePendingOrderModal]);
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
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
            <Link href="/" className="absolute left-1/2 -translate-x-1/2 group flex items-center gap-2">
               <img src="/favicon.png" alt="ENOUGHH" className="w-8 h-8 md:w-10 md:h-10 animate-bounce" />
               <h1 className="text-xl md:text-2xl font-bold tracking-wider text-gray-900 group-hover:text-[#4a5a3f] transition-colors duration-300">
                 ENOUGHH
               </h1>
               <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#4a5a3f] transition-all duration-300 group-hover:w-full"></div>
            </Link>
            {/* Navegación Principal */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link
                href="/"
                className={`transition-colors font-medium text-sm relative group ${
                  pathname === "/" 
                    ? "text-[#4a5a3f]" 
                    : "text-gray-700 hover:text-[#4a5a3f]"
                }`}
              >
                Inicio
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#4a5a3f] transition-all duration-300 ${
                  pathname === "/" ? "w-full" : "w-0 group-hover:w-full"
                }`}></span>
              </Link>
              <Link
                href="/products"
                className={`transition-colors font-medium text-sm relative group ${
                  pathname === "/products" 
                    ? "text-[#4a5a3f]" 
                    : "text-gray-700 hover:text-[#4a5a3f]"
                }`}
              >
                Productos
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#4a5a3f] transition-all duration-300 ${
                  pathname === "/products" ? "w-full" : "w-0 group-hover:w-full"
                }`}></span>
              </Link>
              <Link
                href="/my-orders"
                className={`transition-colors font-medium text-sm relative group ${
                  pathname === "/my-orders" 
                    ? "text-[#4a5a3f]" 
                    : "text-gray-700 hover:text-[#4a5a3f]"
                }`}
              >
                Mis Órdenes
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#4a5a3f] transition-all duration-300 ${
                  pathname === "/my-orders" ? "w-full" : "w-0 group-hover:w-full"
                }`}></span>
              </Link>
              <Link
                href="#"
                className="text-gray-700 hover:text-[#4a5a3f] transition-colors font-medium text-sm relative group"
              >
                Colecciones
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#4a5a3f] transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                href="#"
                className="text-gray-700 hover:text-[#4a5a3f] transition-colors font-medium text-sm relative group"
              >
                Sobre Nosotros
              </Link>
            </nav>

            <div className="flex items-center gap-2 md:gap-4 ml-auto">
              {/* Botón de búsqueda */}
              <button className="hidden sm:block text-gray-700 hover:text-[#4a5a3f] transition-colors cursor-pointer p-2 rounded-full hover:bg-gray-100">
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

              {/* Pending Order Indicator */}
              {isMounted && pendingOrder && !isExpired && (
                <button
                  onClick={openPendingOrderModal}
                  className="text-orange-600 hover:text-orange-700 transition-all duration-300 hover:scale-110 relative cursor-pointer"
                  title="Tienes una orden pendiente"
                >
                  <Clock className="w-5 h-5" />
                  {timeRemaining && (
                    <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium animate-pulse">
                      {formatTime(timeRemaining).split(':')[0]}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 bg-white/95 backdrop-blur-sm">
              <div className="flex flex-col space-y-1 pt-4">
                {/* Navegación Principal Móvil */}
                <div className="px-2 py-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Navegación</h3>
                  <div className="space-y-1">
                    <Link
                      href="/"
                      className={`flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors rounded-1xl font-medium ${
                        pathname === "/" 
                          ? "text-[#4a5a3f] bg-green-50" 
                          : "text-gray-700 hover:text-[#4a5a3f]"
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span>Inicio</span>
                    </Link>
                    
                    <Link
                      href="/products"
                      className={`flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors rounded-1xl font-medium ${
                        pathname === "/products" 
                          ? "text-[#4a5a3f] bg-green-50" 
                          : "text-gray-700 hover:text-[#4a5a3f]"
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span>Productos</span>
                    </Link>
                    
                    <Link
                      href="#"
                      className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:text-[#4a5a3f] hover:bg-gray-50 transition-colors rounded-1xl font-medium"
                      onClick={toggleMobileMenu}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span>Colecciones</span>
                    </Link>
                    
                    <Link
                      href="#"
                      className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:text-[#4a5a3f] hover:bg-gray-50 transition-colors rounded-1xl font-medium"
                      onClick={toggleMobileMenu}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Sobre Nosotros</span>
                    </Link>
                  </div>
                </div>

                {user && (
                  <div className="px-2 py-2 border-t border-gray-100">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Mi Cuenta</h3>
                    <div className="space-y-1">
                      <Link
                        href="/my-orders"
                        className={`flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors rounded-1xl font-medium ${
                          pathname === "/my-orders" 
                            ? "text-[#4a5a3f] bg-green-50" 
                            : "text-gray-700 hover:text-[#4a5a3f]"
                        }`}
                        onClick={toggleMobileMenu}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span>Mis Órdenes</span>
                      </Link>
                    </div>
                  </div>
                )}
                <div className="px-2 py-2 border-t border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Acciones</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button className="p-2 text-gray-700 hover:text-[#4a5a3f] hover:bg-gray-50 transition-colors rounded-1xl">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </button>
                      <button 
                        onClick={openWishlist}
                        className="p-2 text-gray-700 hover:text-red-500 hover:bg-gray-50 transition-colors rounded-1xl relative"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {isMounted && getWishlistCount() > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                            {getWishlistCount()}
                          </span>
                        )}
                      </button>
                      <button 
                        onClick={openCart}
                        className="p-2 text-gray-700 hover:text-black hover:bg-gray-50 transition-colors rounded-1xl relative"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        {isMounted && cart.length > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                            {getItemCount()}
                          </span>
                        )}
                      </button>

                      {/* Pending Order Indicator - Mobile */}
                      {isMounted && pendingOrder && !isExpired && (
                        <button 
                          onClick={() => {
                            openPendingOrderModal();
                            toggleMobileMenu();
                          }}
                          className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 transition-colors rounded-1xl relative"
                          title="Tienes una orden pendiente"
                        >
                          <Clock className="w-5 h-5" />
                          {timeRemaining && (
                            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium animate-pulse">
                              {formatTime(timeRemaining).split(':')[0]}
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                    
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                    ) : user ? (
                      <div className="flex items-center gap-3">
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
                        className="px-4 py-2 bg-[#4a5a3f] text-white rounded-1xl hover:bg-[#3a4a2f] transition-colors font-medium"
                      >
                        Iniciar Sesión
                      </button>
                    )}
                  </div>
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
      <PendingOrderModal
        isOpen={isPendingOrderModalOpen}
        onClose={closePendingOrderModal}
        onCancelOrder={handleCancelOrder}
        onContinueOrder={handleContinueOrder}
        pendingOrder={pendingOrder}
        timeRemaining={timeRemaining}
        isExpired={isExpired}
        isLoading={pendingOrderLoading}
      />
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
