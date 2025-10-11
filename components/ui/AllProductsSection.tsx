"use client"

import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import ProductModal from "./productModal";
import { ProductSkeletonGrid } from "./ProductSkeleton";
import { useUIStore } from "@/store/uiStore";
import { useProductsPagination } from "@/hooks/useProductsPagination";
import { useProductUrl } from "@/hooks/useProductUrl";
import { getCurrentPrice, getSavingsAmount, isDiscountActive, getDiscountPercentage } from "@/components/types/Product";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthContext } from "@/contexts/AuthContext";

export default function AllProductsSection() {
  const { selectedProduct, setSelectedProduct, setSelectedSize, setCurrentImageIndex, openAuthModal } = useUIStore();
  const { products, loading, error, hasMore, loadMore, totalCount } = useProductsPagination(8);
  const { openProductFromUrl, generateProductUrl } = useProductUrl();
  const { isInWishlist, toggleWishlist, isLoading } = useWishlistStore();
  const { user } = useAuthContext();
  const observerRef = useRef<HTMLDivElement>(null);

  // Función para cargar más productos cuando se hace scroll
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !loading) {
      loadMore();
    }
  }, [hasMore, loading, loadMore]);

  // Configurar el Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: '100px'
    });

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [handleObserver]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setSelectedSize("");
    setCurrentImageIndex(0);
  };

  const handleWishlistToggle = async (e: React.MouseEvent, product: any) => {
    e.stopPropagation(); // Evitar que se abra el modal
    
    if (!user) {
      openAuthModal();
      return;
    }

    await toggleWishlist(product);
  };

  return (
    <>
      <section className="py-16 bg-gray-50 mt-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold">TODOS LOS PRODUCTOS</h3>
            <div className="text-sm text-gray-600">
              {totalCount > 0 && `${totalCount} productos disponibles`}
            </div>
          </div>
          
          {loading && products.length === 0 ? (
            <ProductSkeletonGrid count={8} />
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-600">Error al cargar los productos: {error}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
                {products
                  .filter((product, index, self) => 
                    index === self.findIndex(p => p.id === product.id)
                  )
                  .map((product, index) => (
                  <article
                    key={product.id}
                    className="pointer pt3 pb4 flex flex-column h-100 group cursor-pointer animate-fadeIn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="relative mb-4">
                      <div className="dib relative hoverEffect w-full h-80 overflow-hidden">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          width={500}
                          height={748}
                          className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
                        />
                        <Image
                          src={
                            product.image_back ||
                            product.image ||
                            "/placeholder.svg"
                          }
                          alt={product.name}
                          width={500}
                          height={748}
                          className="w-full h-full absolute top-0 left-0 z-10 object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        />
                      </div>
                      
                      {/* Botón de Wishlist */}
                      <button
                        onClick={(e) => handleWishlistToggle(e, product)}
                        disabled={isLoading} 
                        className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 z-20 cursor-pointer ${
                          isInWishlist(product.id)
                            ? 'bg-red-500 text-white hover:bg-red-600 scale-110'
                            : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                      >
                        <svg
                          className={`w-5 h-5 transition-all duration-300 ${
                            isInWishlist(product.id) ? 'fill-current' : 'stroke-current'
                          }`}
                          fill={isInWishlist(product.id) ? 'currentColor' : 'none'}
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

                    {/* Product Info */}
                    <div className="flex flex-column justify-end items-center">
                      <span className="text-sm font-medium text-gray-700 mb-2">
                        {product.name}
                      </span>

                      <div className="flex flex-column justify-start">
                        <div className="pt1 pb3">
                          {isDiscountActive(product) ? (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold discount-price">
                                  <span className="text-sm">$</span>
                                  <span className="text-sm">&nbsp;</span>
                                  <span className="text-lg">
                                    {getCurrentPrice(product).toLocaleString()}
                                  </span>
                                </span>
                                <span className="px-2 py-1 discount-badge text-xs font-bold rounded-full">
                                  -{getDiscountPercentage(product)}%
                                </span>
                              </div>
                              <div className="text-sm original-price">
                                <span className="text-xs">$</span>
                                <span className="text-xs">&nbsp;</span>
                                <span className="text-sm">
                                  {product.original_price?.toLocaleString()}
                                </span>
                              </div>
                              <div className="text-xs savings-text font-medium">
                                Ahorras ${getSavingsAmount(product).toLocaleString('es-CO')}
                              </div>
                            </div>
                          ) : (
                            <span className="text-lg font-medium text-gray-900">
                              <span className="text-sm">$</span>
                              <span className="text-sm">&nbsp;</span>
                              <span className="text-lg">
                                {product.price.toLocaleString()}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Elemento de observación para scroll infinito */}
              {hasMore && (
                <div ref={observerRef} className="flex justify-center mt-12 py-8">
                  {loading ? (
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-6 h-6 border-2 border-gray-300 border-t-[#4a5a3f] rounded-full animate-spin"></div>
                      <span className="text-sm font-medium">Cargando más productos...</span>
                    </div>
                  ) : (
                    <div className="w-8 h-8 border-2 border-gray-200 rounded-full"></div>
                  )}
                </div>
              )}

              {/* Mostrar mensaje cuando no hay más productos */}
              {!hasMore && products.length > 0 && (
                <div className="text-center mt-12 py-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-1xl">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-gray-600 text-sm font-medium">
                      Has visto todos los productos disponibles
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
      
      {selectedProduct && (
        <ProductModal />
      )}
    </>
  );
}
