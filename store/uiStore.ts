import { create } from 'zustand';

interface UIStore {
  // Estados de UI
  isMobileMenuOpen: boolean;
  isAuthModalOpen: boolean;
  isPurchaseModalOpen: boolean;
  isSuccessModalOpen: boolean;
  isEpaycoCheckoutOpen: boolean;
  genderFilter: "TODOS" | "HOMBRE" | "MUJER";
  selectedProduct: any | null;
  selectedSize: string;
  currentImageIndex: number;
  
  // Filtros avanzados
  selectedCategories: string[];
  selectedPriceRange: { min: number; max: number } | null;
  showFilters: boolean;
  
  // Filtros aplicados (los que realmente se usan para filtrar)
  appliedCategories: string[];
  appliedPriceRange: { min: number; max: number } | null;

  // Acciones de menú móvil
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;

  // Acciones de modales
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openPurchaseModal: () => void;
  closePurchaseModal: () => void;
  openSuccessModal: () => void;
  closeSuccessModal: () => void;
  openEpaycoCheckout: () => void;
  closeEpaycoCheckout: () => void;

  // Acciones de filtros
  setGenderFilter: (filter: "TODOS" | "HOMBRE" | "MUJER") => void;
  setSelectedCategories: (categories: string[]) => void;
  setSelectedPriceRange: (range: { min: number; max: number } | null) => void;
  toggleCategory: (category: string) => void;
  toggleFilters: () => void;
  clearAllFilters: () => void;
  applyFilters: () => void;
  resetSelectedFilters: () => void;

  // Acciones de producto seleccionado
  setSelectedProduct: (product: any | null) => void;
  setSelectedSize: (size: string) => void;
  setCurrentImageIndex: (index: number) => void;

  // Reset de estados
  resetUI: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // Estado inicial
  isMobileMenuOpen: false,
  isAuthModalOpen: false,
  isPurchaseModalOpen: false,
  isSuccessModalOpen: false,
  isEpaycoCheckoutOpen: false,
  genderFilter: "TODOS",
  selectedProduct: null,
  selectedSize: "",
  currentImageIndex: 0,
  selectedCategories: [],
  selectedPriceRange: null,
  showFilters: false,
  appliedCategories: [],
  appliedPriceRange: null,

  // Menú móvil
  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  // Modales
  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  openPurchaseModal: () => set({ isPurchaseModalOpen: true }),
  closePurchaseModal: () => set({ isPurchaseModalOpen: false }),
  openSuccessModal: () => set({ isSuccessModalOpen: true }),
  closeSuccessModal: () => set({ isSuccessModalOpen: false }),
  openEpaycoCheckout: () => set({ isEpaycoCheckoutOpen: true }),
  closeEpaycoCheckout: () => set({ isEpaycoCheckoutOpen: false }),

  // Filtros
  setGenderFilter: (filter) => set({ genderFilter: filter }),
  setSelectedCategories: (categories) => set({ selectedCategories: categories }),
  setSelectedPriceRange: (range) => set({ selectedPriceRange: range }),
  toggleCategory: (category) => set((state) => ({
    selectedCategories: state.selectedCategories.includes(category)
      ? state.selectedCategories.filter(c => c !== category)
      : [...state.selectedCategories, category]
  })),
  toggleFilters: () => set((state) => ({ showFilters: !state.showFilters })),
  clearAllFilters: () => set({
    selectedCategories: [],
    selectedPriceRange: null,
    appliedCategories: [],
    appliedPriceRange: null,
    genderFilter: "TODOS"
  }),
  applyFilters: () => set((state) => ({
    appliedCategories: [...state.selectedCategories],
    appliedPriceRange: state.selectedPriceRange
  })),
  resetSelectedFilters: () => set((state) => ({
    selectedCategories: [...state.appliedCategories],
    selectedPriceRange: state.appliedPriceRange
  })),

  // Producto seleccionado
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setSelectedSize: (size) => set({ selectedSize: size }),
  setCurrentImageIndex: (index) => set({ currentImageIndex: index }),

  // Reset
  resetUI: () => set({
    isMobileMenuOpen: false,
    isAuthModalOpen: false,
    isPurchaseModalOpen: false,
    isSuccessModalOpen: false,
    isEpaycoCheckoutOpen: false,
    genderFilter: "TODOS",
    selectedProduct: null,
    selectedSize: "",
    currentImageIndex: 0,
    selectedCategories: [],
    selectedPriceRange: null,
    showFilters: false,
    appliedCategories: [],
    appliedPriceRange: null,
  }),
}));
