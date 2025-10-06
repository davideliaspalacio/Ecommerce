import Image from "next/image";
import ProductModal from "./productModal";
import { useUIStore } from "@/store/uiStore";
import { useProductsContext } from "@/contexts/ProductsContext";
import { useProductUrl } from "@/hooks/useProductUrl";

export default function ProductsCards() {
  const { genderFilter, setGenderFilter, selectedProduct, setSelectedProduct, setSelectedSize, setCurrentImageIndex } = useUIStore();
  const { products, loading, error, fetchProducts, fetchProductsByGender } = useProductsContext();
  const { openProductFromUrl, generateProductUrl } = useProductUrl();

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
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-600">Error al cargar los productos: {error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products
                .filter((p) =>
                  genderFilter === "TODOS" ? true : p.gender === genderFilter
                )
                .map((product) => (
                <article
                  key={product.id}
                  className="pointer pt3 pb4 flex flex-column h-100 group cursor-pointer"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="relative mb-4">
                    <div className="dib relative hoverEffect">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        width={500}
                        height={748}
                        className="w-100 h-100 object-contain transition-opacity duration-300 group-hover:opacity-0"
                        style={{ maxHeight: "unset", maxWidth: "500px" }}
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
                        className="w-100 h-100 absolute top-0 left-0 z-10 object-contain opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ maxHeight: "unset", maxWidth: "500px" }}
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
