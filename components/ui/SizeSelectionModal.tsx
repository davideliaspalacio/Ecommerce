import { useState } from "react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUIStore } from "@/store/uiStore";

interface SizeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  product: any;
}

export default function SizeSelectionModal({ isOpen, onClose, onSuccess, product }: SizeSelectionModalProps) {
  const [selectedSize, setSelectedSize] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { user } = useAuthContext();
  const { openAuthModal } = useUIStore();

  
  const isProductInWishlist = product ? isInWishlist(product.id) : false;

  const getAvailableSizes = () => {
    // Priorizar variantes sobre sizes
    if (product?.variants && Array.isArray(product.variants)) {
      return product.variants.map((variant: any) => variant.variant_value);
    }
    if (product?.sizes && Array.isArray(product.sizes)) {
      return product.sizes;
    }
    if (product?.available_sizes && Array.isArray(product.available_sizes)) {
      return product.available_sizes;
    }
    return ["XS", "S", "M", "L", "XL", "XXL"];
  };
  
  const availableSizes = getAvailableSizes();

  const handleWishlistAction = async () => {
    if (!user) {
      openAuthModal();
      onClose();
      return;
    }

    if (isProductInWishlist) {
      setIsLoading(true);
      try {
        await toggleWishlist(product);
        onSuccess?.();
        onClose();
      } catch (error) {
        console.error("Error removing from wishlist:", error);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!selectedSize) {
      alert("Por favor selecciona una talla");
      return;
    }

    // Encontrar la variante correspondiente a la talla seleccionada
    const selectedVariant = product?.variants?.find(
      (variant: any) => variant.variant_value === selectedSize
    );

    setIsLoading(true);
    try {
      await toggleWishlist(product, selectedSize, selectedVariant?.id);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error adding to wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-1xl p-6 max-w-sm w-full animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#4a5a3f]">
            {isProductInWishlist ? "Quitar De La Lista" : "Agregar A La Lista"}
          </h3>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="w-full h-px bg-[#4a5a3f] mb-4"></div>

        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-[#4a5a3f] text-sm">
            {product?.name || "Producto"}
          </h4>
          <span className="text-[#4a5a3f] font-medium text-sm">
            ${product?.price?.toLocaleString() || "0"}
          </span>
        </div>

        {!isProductInWishlist && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">Selecciona una talla:</p>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size: string) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 text-sm font-medium rounded-1xl transition-all duration-200 ${
                    selectedSize === size
                      ? 'bg-[#4a5a3f] text-white border-2 border-[#4a5a3f]'
                      : 'bg-white text-[#4a5a3f] border-2 border-gray-200 hover:border-[#4a5a3f] hover:bg-gray-50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleWishlistAction}
          disabled={isLoading || (!isProductInWishlist && !selectedSize)}
          className={`w-full py-3 px-4 rounded-1xl font-medium transition-all duration-200 ${
            isLoading || (!isProductInWishlist && !selectedSize)
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isProductInWishlist
              ? 'bg-red-500 text-white hover:bg-red-600 hover:scale-105'
              : 'bg-[#4a5a3f] text-white hover:bg-[#3d4a34] hover:scale-105'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <img 
                src="/favicon.png" 
                alt="ENOUGHH" 
                className="w-4 h-4 animate-spin"
              />
              <span>{isProductInWishlist ? "Quitando..." : "Agregando..."}</span>
            </div>
          ) : (
            isProductInWishlist ? "Quitar De La Lista" : "Agregar A La Lista"
          )}
        </button>
      </div>
    </div>
  );
}
