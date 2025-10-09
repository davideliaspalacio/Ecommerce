export default function ProductSkeleton() {
  return (
    <article className="pointer pt3 pb4 flex flex-column h-100 group">
      {/* Imagen skeleton */}
      <div className="relative mb-4">
        <div className="dib relative w-full h-80 overflow-hidden bg-gray-300 rounded-lg animate-skeleton-pulse">
          {/* Efecto de shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        </div>
      </div>

      {/* Información del producto skeleton */}
      <div className="flex flex-column justify-end items-center">
        {/* Nombre del producto */}
        <div className="w-3/4 h-4 bg-gray-300 rounded mb-2 animate-skeleton-pulse"></div>
        
        {/* Precio */}
        <div className="flex flex-column justify-start">
          <div className="pt1 pb3">
            <div className="w-20 h-6 bg-gray-300 rounded animate-skeleton-pulse"></div>
          </div>
        </div>
      </div>
    </article>
  );
}

export interface ProductSkeletonGridProps {
  count?: number;
}

export function ProductSkeletonGrid({ count = 8 }: ProductSkeletonGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductSkeleton key={index} />
      ))}
    </div>
  );
}
