import Image from "next/image";
import ProductModal from "./productModal";
import ProductFilters from "./ProductFilters";
import { ProductSkeletonGrid } from "./ProductSkeleton";
import FilterLoadingAnimation from "./FilterLoadingAnimation";
import { useUIStore } from "@/store/uiStore";
import { useProductsContext } from "@/contexts/ProductsContext";
import { useFilteredProducts } from "@/hooks/useFilteredProducts";
import { useProductUrl } from "@/hooks/useProductUrl";

export default function ProductsCards() {
  const { genderFilter, setGenderFilter, selectedProduct, setSelectedProduct, setSelectedSize, setCurrentImageIndex } = useUIStore();
  const { loading, error, fetchProducts, fetchProductsByGender } = useProductsContext();
  const { openProductFromUrl, generateProductUrl } = useProductUrl();
  const { filteredProducts, isFiltering } = useFilteredProducts();

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setSelectedSize("");
    setCurrentImageIndex(0);
  };

  return (
    <>
      <section id="new-in" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold">NEW IN</h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setGenderFilter("TODOS");
                  fetchProducts();
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  genderFilter === "TODOS"
                    ? "bg-black text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                TODOS
              </button>
              <button
                onClick={() => {
                  setGenderFilter("HOMBRE");
                  fetchProductsByGender("HOMBRE");
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  genderFilter === "HOMBRE"
                    ? "bg-black text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                HOMBRE
              </button>
              <button
                onClick={() => {
                  setGenderFilter("MUJER");
                  fetchProductsByGender("MUJER");
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  genderFilter === "MUJER"
                    ? "bg-black text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                MUJER
              </button>
            </div>
          </div>
          
          <ProductFilters />
          
          {!loading && !error && !isFiltering && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Mostrando {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
              </p>
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
              {filteredProducts.map((product, index) => (
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
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-column justify-end items-center">
                    <span className="text-sm font-medium text-gray-700 mb-2">
                      {product.name}
                    </span>

                    <div className="flex flex-column justify-start">
                      <div className="pt1 pb3">
                        <span className="text-lg font-medium text-gray-900">
                          <span className="text-sm">$</span>
                          <span className="text-sm">&nbsp;</span>
                          <span className="text-lg">
                            {product.price.toLocaleString()}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
       {selectedProduct && (
        <ProductModal />
      )}
    </>
  );
}
