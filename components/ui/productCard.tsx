import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductModal from "./productModal";
import ProductFilters from "./ProductFilters";
import { ProductSkeletonGrid } from "./ProductSkeleton";
import FilterLoadingAnimation from "./FilterLoadingAnimation";
import SizeSelectionModal from "./SizeSelectionModal";
import ConfirmModal from "./ConfirmModal";
import { useUIStore } from "@/store/uiStore";
import { useProductsContext } from "@/contexts/ProductsContext";
import { useFilteredProducts } from "@/hooks/useFilteredProducts";
import { useProductUrl } from "@/hooks/useProductUrl";
import { getCurrentPrice, getSavingsAmount, isDiscountActive, getDiscountPercentage, getMainImage, getAllImages } from "@/components/types/Product";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthContext } from "@/contexts/AuthContext";

export default function ProductsCards() {
  const { genderFilter, setGenderFilter, selectedProduct, setSelectedProduct, setSelectedSize, setCurrentImageIndex, openAuthModal } = useUIStore();
  const { products, loading, error, fetchProducts, fetchProductsByGender } = useProductsContext();
  const { openProductFromUrl, generateProductUrl } = useProductUrl();
  const { filteredProducts, isFiltering } = useFilteredProducts();
  const { isInWishlist, toggleWishlist, isLoading } = useWishlistStore();
  const { user } = useAuthContext();
  
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedProductForWishlist, setSelectedProductForWishlist] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [productToRemove, setProductToRemove] = useState<any>(null);

 

  const limitedProducts = filteredProducts;
  const hasMoreProducts = filteredProducts.length === 8; 

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setSelectedSize("");
    setCurrentImageIndex(0);
  };

  const handleWishlistToggle = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    
    if (!user) {
      openAuthModal();
      return;
    }

    if (isInWishlist(product.id)) {
      setProductToRemove(product);
      setIsConfirmModalOpen(true);
      return;
    }

    setSelectedProductForWishlist(product);
    setShowSizeModal(true);
  };

  const handleConfirmRemove = async () => {
    if (productToRemove) {
      await toggleWishlist(productToRemove);
    }
    setIsConfirmModalOpen(false);
    setProductToRemove(null);
  };

  const handleCancelRemove = () => {
    setIsConfirmModalOpen(false);
    setProductToRemove(null);
  };

  return (
    <>
      <section id="new-in" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-8">
            <h3 className="text-3xl font-bold">NEW IN</h3>
          </div>
          
          <ProductFilters />
          
          {!loading && !error && !isFiltering && (
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Mostrando {limitedProducts.length} producto{limitedProducts.length !== 1 ? 's' : ''} destacado{limitedProducts.length !== 1 ? 's' : ''}
              </p>
              {hasMoreProducts && (
                <Link
                  href="/products"
                  className="text-sm text-[#4a5a3f] hover:text-[#3a4a2f] font-medium transition-colors"
                >
                  Ver todos →
                </Link>
              )}
            </div>
          )}
          
          {loading ? (
            <ProductSkeletonGrid count={8} />
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-600">Error al cargar los productos: {error}</p>
            </div>
          ) : isFiltering ? (
            <FilterLoadingAnimation />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
              {limitedProducts.map((product, index) => (
                <article
                  key={product.id}
                  className="pointer pt3 pb4 flex flex-column h-100 group cursor-pointer animate-fadeIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => handleProductClick(product)}
                >
                  <div className="relative mb-4">
                    <div className="dib relative hoverEffect w-full h-64 sm:h-80 overflow-hidden">
                      <Image
                        src={getMainImage(product) || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="w-full h-full object-contain sm:object-cover transition-opacity duration-300 group-hover:opacity-0 bg-white"
                      />
                      {getAllImages(product).length > 1 && (
                        <Image
                          src={getAllImages(product)[1] || getMainImage(product) || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="w-full h-full absolute top-0 left-0 z-10 object-contain sm:object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white"
                        />
                      )}
                    </div>
                    
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
                              {getCurrentPrice(product).toLocaleString()}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!loading && !error && !isFiltering && hasMoreProducts && (
            <div className="flex justify-center mt-12">
              <Link
                href="/products"
                className="px-8 py-3 bg-[#4a5a3f] text-white font-medium rounded-1xl transition-all duration-300 hover:bg-[#3a4a2f] hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Ver todos los productos
              </Link>
            </div>
          )}
        </div>
      </section>
       {selectedProduct && (
        <ProductModal />
      )}
      
      <SizeSelectionModal
        isOpen={showSizeModal}
        onClose={() => {
          setShowSizeModal(false);
          setSelectedProductForWishlist(null);
        }}
        product={selectedProductForWishlist}
      />
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={handleCancelRemove}
        onConfirm={handleConfirmRemove}
        title="Quitar de la Lista de Deseos"
        message={`¿Estás seguro de que quieres quitar "${productToRemove?.name || 'este producto'}" de tu lista de deseos?`}
        confirmText="Quitar"
        cancelText="Cancelar"
        isDestructive={true}
      />
    </>
  );
}
