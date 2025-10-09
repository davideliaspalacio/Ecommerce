import { useUIStore } from '@/store/uiStore';
import { useProductFilters } from '@/hooks/useProductFilters';
import { X, Filter, Check } from 'lucide-react';

export default function ProductFilters() {
  const {
    selectedCategories,
    selectedPriceRange,
    appliedCategories,
    appliedPriceRange,
    showFilters,
    toggleCategory,
    setSelectedPriceRange,
    toggleFilters,
    clearAllFilters,
    applyFilters,
    resetSelectedFilters
  } = useUIStore();

  const { categories, priceRanges } = useProductFilters();

  const hasActiveFilters = appliedCategories.length > 0 || 
                          appliedPriceRange !== null;

  const hasPendingChanges = 
    JSON.stringify(selectedCategories.sort()) !== JSON.stringify(appliedCategories.sort()) ||
    JSON.stringify(selectedPriceRange) !== JSON.stringify(appliedPriceRange);

  return (
    <div className="mb-6">
      {/* Botón para mostrar/ocultar filtros */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={toggleFilters}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filtros
          {hasActiveFilters && (
            <span className="bg-black text-white text-xs rounded-full px-2 py-1">
              {appliedCategories.length + (appliedPriceRange ? 1 : 0)}
            </span>
          )}
          {hasPendingChanges && (
            <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-1 animate-pulse">
              Pendiente
            </span>
          )}
        </button>
        
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Filtrar productos</h3>
            <button
              onClick={toggleFilters}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Filtro por categorías */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Categorías</h4>
              <div className="space-y-2">
                {categories.map((category) => (
                  <label
                    key={category}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="rounded border-gray-300 text-black focus:ring-black"
                    />
                    <span className="text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filtro por rango de precios */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Rango de precios</h4>
              <div className="space-y-2">
                {priceRanges.map((range, index) => (
                  <label
                    key={index}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="priceRange"
                      checked={selectedPriceRange?.min === range.min && selectedPriceRange?.max === range.max}
                      onChange={() => setSelectedPriceRange(range)}
                      className="border-gray-300 text-black focus:ring-black"
                    />
                    <span className="text-sm text-gray-700">{range.label}</span>
                  </label>
                ))}
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="priceRange"
                    checked={selectedPriceRange === null}
                    onChange={() => setSelectedPriceRange(null)}
                    className="border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-sm text-gray-700">Todos los precios</span>
                </label>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex gap-2">
              <button
                onClick={applyFilters}
                disabled={!hasPendingChanges}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  hasPendingChanges
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                Aplicar filtros
              </button>
              
              {hasPendingChanges && (
                <button
                  onClick={resetSelectedFilters}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Cancelar cambios
                </button>
              )}
            </div>
            
            {hasPendingChanges && (
              <div className="text-sm text-orange-600 font-medium">
                Tienes cambios sin aplicar
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
