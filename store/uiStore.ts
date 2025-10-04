import { create } from 'zustand';

interface UIStore {
  // Estados de UI
  isMobileMenuOpen: boolean;
  isAuthModalOpen: boolean;
  isPurchaseModalOpen: boolean;
  isSuccessModalOpen: boolean;
  genderFilter: "TODOS" | "HOMBRE" | "MUJER";
  selectedProduct: any | null;
  selectedSize: string;
  currentImageIndex: number;

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

  // Acciones de filtros
  setGenderFilter: (filter: "TODOS" | "HOMBRE" | "MUJER") => void;

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
  genderFilter: "TODOS",
  selectedProduct: null,
  selectedSize: "",
  currentImageIndex: 0,

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

  // Filtros
  setGenderFilter: (filter) => set({ genderFilter: filter }),

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
    genderFilter: "TODOS",
    selectedProduct: null,
    selectedSize: "",
    currentImageIndex: 0,
  }),
}));
