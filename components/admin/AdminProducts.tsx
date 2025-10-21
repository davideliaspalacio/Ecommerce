"use client";

import { useState } from "react";
import React from "react";
import { useProductsContext } from "@/contexts/ProductsContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { CreateProductType, ProductType } from "@/components/types/Product";
import { apiClient } from "@/lib/api-client";
import AdminRouteGuard from "./AdminRouteGuard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function AdminProducts() {
  const { createProduct, updateProduct, deleteProduct } = useProductsContext();
  const { profile } = useAuthContext();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [newTag, setNewTag] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [discountFilter, setDiscountFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [imageType, setImageType] = useState<'url' | 'upload'>('url');
  const [imageBackType, setImageBackType] = useState<'url' | 'upload'>('url');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [imageUploadType, setImageUploadType] = useState<'url' | 'upload'>('url');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<CreateProductType>({
    name: "",
    price: 0,
    images: [],
    main_image: "",
    image: "", 
    category: "camiseta",
    gender: "unisex",
    description: "",
    specifications: [],
    sizes: [],
    status: "active",
    stock_quantity: 0,
    sku: "",
    weight: undefined,
    dimensions: undefined,
    tags: [],
    original_price: undefined,
    discount_percentage: undefined,
    is_on_discount: false,
    discount_start_date: undefined,
    discount_end_date: undefined,
  });

  const formatoPeso = (valor: number): string => {
    return valor.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    });
  };

  // Función para calcular el precio final con descuento
  const calcularPrecioFinal = (product: any): number => {
    if (product.is_on_discount && product.original_price && product.discount_percentage) {
      return Math.round(product.original_price * (1 - product.discount_percentage / 100));
    }
    return product.price;
  };

  // Función para calcular el ahorro
  const calcularAhorro = (product: any): number => {
    if (product.is_on_discount && product.original_price && product.discount_percentage) {
      return product.original_price - calcularPrecioFinal(product);
    }
    return 0;
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag.trim()]
      });
      setNewTag("");
    }
  };

  const removeTag = (index: number) => {
    const newTags = formData.tags?.filter((_, i) => i !== index) || [];
    setFormData({
      ...formData,
      tags: newTags
    });
  };

  // Función para cargar productos con paginación
  const loadProducts = async (page: number = 1, reset: boolean = false) => {
    try {
      if (reset) {
        setCurrentPage(1);
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      const response = await apiClient.getProducts({
        page: page,
        limit: 20 // Mostrar 20 productos por página en admin
      });

      if (!response.success) {
        throw new Error(response.error || 'Error al cargar los productos');
      }

      const newProducts = response.data || [];
      const total = response.total || 0;
      const totalPages = response.totalPages || 1;

      setTotalProducts(total);
      setTotalPages(totalPages);
      
      if (reset) {
        setProducts(newProducts);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
      }
      
    } catch (error) {
      console.error('Error loading products:', error);
      alert('Error al cargar los productos: ' + (error as Error).message);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Cargar más productos
  const loadMoreProducts = async () => {
    if (currentPage < totalPages && !isLoadingMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      await loadProducts(nextPage, false);
    }
  };

  // Cargar productos iniciales
  React.useEffect(() => {
    loadProducts(1, true);
  }, []);

  // Filtrar productos por estado y descuento
  const filteredProducts = products.filter(product => {
    // Filtro por estado
    const statusMatch = statusFilter === "all" || product.status === statusFilter;
    
    // Filtro por descuento
    let discountMatch = true;
    if (discountFilter !== "all") {
      switch (discountFilter) {
        case "with_discount":
          discountMatch = !!(product.is_on_discount && product.original_price && product.discount_percentage);
          break;
        case "active_discount":
          if (!product.is_on_discount || !product.discount_start_date || !product.discount_end_date) {
            discountMatch = false;
          } else {
            const now = new Date();
            const start = new Date(product.discount_start_date);
            const end = new Date(product.discount_end_date);
            discountMatch = start <= now && end >= now;
          }
          break;
        case "scheduled_discount":
          if (!product.is_on_discount || !product.discount_start_date) {
            discountMatch = false;
          } else {
            discountMatch = new Date(product.discount_start_date) > new Date();
          }
          break;
        case "expired_discount":
          if (!product.is_on_discount || !product.discount_end_date) {
            discountMatch = false;
          } else {
            discountMatch = new Date(product.discount_end_date) < new Date();
          }
          break;
        default:
          discountMatch = true;
      }
    }
    
    return statusMatch && discountMatch;
  });

  // Función para subir imagen a Supabase Storage
  const uploadImage = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al subir la imagen');
      }

      return result.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Validar archivo de imagen
  const validateImageFile = (file: File): boolean => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    
    if (file.size > maxSize) {
      alert('El archivo es demasiado grande. Máximo 5MB.');
      return false;
    }
    
    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de archivo no válido. Solo se permiten JPG, PNG, WebP y GIF.');
      return false;
    }
    
    return true;
  };

  const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
    try {
      setUploadingImages(true);
      setUploadProgress(0);
      
      const imageUrls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        try {
          const imageUrl = await uploadImage(files[i]);
          imageUrls.push(imageUrl);
          
          const progress = ((i + 1) / files.length) * 100;
          setUploadProgress(progress);
        } catch (error) {
          console.error(`Error uploading image ${i + 1}:`, error);
          throw new Error(`Error al subir la imagen ${i + 1}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }
      
      return imageUrls;
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    } finally {
      setUploadingImages(false);
      setUploadProgress(0);
    }
  };

  const validateMultipleImages = (files: File[]): boolean => {
    const maxFiles = 4;
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    
    if (files.length > maxFiles) {
      alert(`Máximo ${maxFiles} imágenes permitidas`);
      return false;
    }
    
    for (let file of files) {
      if (!allowedTypes.includes(file.type)) {
        alert('Solo se permiten archivos JPG, PNG, WebP y GIF');
        return false;
      }
      if (file.size > maxSize) {
        alert('Cada archivo debe ser menor a 5MB');
        return false;
      }
    }
    
    return true;
  };

  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    console.log('Archivos seleccionados:', files);
    console.log('Estado actual de formData.images:', formData.images);
    console.log('Imagen principal actual:', formData.main_image);
    
    if (files.length === 0) return;
    
    if (!validateMultipleImages(files)) {
      e.target.value = '';
      return;
    }
    
    try {
      console.log('Iniciando subida de múltiples imágenes...');
      const imageUrls = await uploadMultipleImages(files);
      console.log('URLs de imágenes subidas:', imageUrls);
      
      setUploadedImageUrls(imageUrls);
      
      const existingImages = formData.images.filter(img => img && img.trim() !== '');
      const allImages = [...existingImages, ...imageUrls];
      
      let mainImage = formData.main_image || '';
      
      if (!mainImage && imageUrls.length > 0) {
        mainImage = imageUrls[0];
      }
      
      const updatedFormData = {
        ...formData,
        images: allImages,
        main_image: mainImage,
        image: mainImage, 
      };
      
      setFormData(updatedFormData);
      
      console.log('FormData actualizado:', {
        images: updatedFormData.images,
        main_image: updatedFormData.main_image,
      });
      
      e.target.value = '';
    } catch (error) {
      console.error('Error uploading images:', error);
      alert(`Error al subir las imágenes: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    const validImages = formData.images.filter(img => img && img.trim() !== '');
    const imageToRemove = validImages[index];
    const newImages = validImages.filter((_, i) => i !== index);
    
    let newMainImage = formData.main_image;
    
    if (imageToRemove === formData.main_image) {
      newMainImage = newImages[0] || '';
    }
    
    setFormData({
      ...formData,
      images: newImages, // Use the filtered array directly
      main_image: newMainImage,
      image: newMainImage, 
    });
  };

  const setMainImage = (index: number) => {
    const validImages = formData.images.filter(img => img && img.trim() !== '');
    const [mainImg] = validImages.splice(index, 1);
    const newImages = [mainImg, ...validImages];
    
    setFormData({
      ...formData,
      images: newImages, // Use the reordered array directly
      main_image: mainImg,
      image: mainImg,
    });
  };

  // Manejar cambio de archivo de imagen principal
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!validateImageFile(file)) {
        e.target.value = ''; // Limpiar el input
        setUploadingImage(false); // Asegurar que se resetee el estado
        return;
      }
      
      try {
        setUploadingImage(true);
        setUploadProgress(0);
        
        // Simular progreso de subida
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) return prev;
            return prev + Math.random() * 10;
          });
        }, 200);
        
        // Timeout de seguridad de 30 segundos
        const timeoutId = setTimeout(() => {
          setUploadingImage(false);
          setUploadProgress(0);
          clearInterval(progressInterval);
          alert('La subida de imagen está tardando demasiado. Inténtalo de nuevo.');
        }, 30000);
        
        const imageUrl = await uploadImage(file);
        clearTimeout(timeoutId);
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        // Pequeño delay para mostrar el 100%
        setTimeout(() => {
          const existingImages = formData.images.filter(img => img && img.trim() !== '');
          const updatedImages = [...existingImages];
          
          if (updatedImages.length === 0) {
            updatedImages[0] = imageUrl;
          } else {
            updatedImages[0] = imageUrl;
          }
          
          setFormData({ 
            ...formData, 
            main_image: imageUrl,
            image: imageUrl, 
            images: updatedImages
          });
          setUploadingImage(false);
          setUploadProgress(0);
        }, 500);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Error al subir la imagen. Inténtalo de nuevo.');
        e.target.value = ''; // Limpiar el input
        setUploadingImage(false);
        setUploadProgress(0);
      }
    }
  };

  // Manejar cambio de archivo de imagen trasera
  const handleImageBackUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!validateImageFile(file)) {
        e.target.value = ''; // Limpiar el input
        setUploadingImage(false); // Asegurar que se resetee el estado
        return;
      }
      
      try {
        setUploadingImage(true);
        setUploadProgress(0);
        
        // Simular progreso de subida
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) return prev;
            return prev + Math.random() * 10;
          });
        }, 200);
        
        // Timeout de seguridad de 30 segundos
        const timeoutId = setTimeout(() => {
          setUploadingImage(false);
          setUploadProgress(0);
          clearInterval(progressInterval);
          alert('La subida de imagen está tardando demasiado. Inténtalo de nuevo.');
        }, 30000);
        
        const imageUrl = await uploadImage(file);
        clearTimeout(timeoutId);
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        // Pequeño delay para mostrar el 100%
        setTimeout(() => {
          const existingImages = formData.images.filter(img => img && img.trim() !== '');
          const updatedImages = [...existingImages];
          
          if (updatedImages.length === 0) {
            updatedImages[0] = formData.main_image || ''; 
            updatedImages[1] = imageUrl;
          } else if (updatedImages.length === 1) {
            updatedImages[1] = imageUrl;
          } else {
            updatedImages[1] = imageUrl;
          }
          
          setFormData({ 
            ...formData, 
            images: updatedImages
          });
          setUploadingImage(false);
          setUploadProgress(0);
        }, 500);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Error al subir la imagen. Inténtalo de nuevo.');
        e.target.value = ''; // Limpiar el input
        setUploadingImage(false);
        setUploadProgress(0);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validaciones de descuento
    if (formData.is_on_discount) {
      if (!formData.original_price || !formData.discount_percentage) {
        alert('Para activar descuento, debes ingresar precio original y porcentaje de descuento');
        setIsSubmitting(false);
        return;
      }
      
      if (formData.original_price <= formData.price) {
        alert('El precio original debe ser mayor al precio actual');
        setIsSubmitting(false);
        return;
      }
      
      if (formData.discount_percentage < 1 || formData.discount_percentage > 99) {
        alert('El porcentaje de descuento debe estar entre 1 y 99');
        setIsSubmitting(false);
        return;
      }
      
      if (formData.discount_start_date && formData.discount_end_date) {
        const startDate = new Date(formData.discount_start_date);
        const endDate = new Date(formData.discount_end_date);
        
        if (startDate >= endDate) {
          alert('La fecha de fin debe ser posterior a la fecha de inicio');
          setIsSubmitting(false);
          return;
        }
        
        // Validar que la duración mínima sea de al menos 1 minuto
        const diffMs = endDate.getTime() - startDate.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        
        if (diffMinutes < 1) {
          alert('La duración del descuento debe ser de al menos 1 minuto');
          setIsSubmitting(false);
          return;
        }
      }
    }

    try {
      // Filter out null/empty values from images array before sending to API
      const cleanFormData = {
        ...formData,
        images: formData.images.filter(img => img && img.trim() !== '')
      };

      if (editingProduct) {
        const result = await updateProduct(editingProduct, cleanFormData);
        if (result.error) {
          console.error('Error updating product:', result.error);
          alert(`Error al actualizar el producto: ${result.error.message}`);
          return;
        }
        // Actualizar la lista local
        setProducts(prev => 
          prev.map(product => product.id === editingProduct ? result.data : product)
        );
        setEditingProduct(null);
      } else {
        const result = await createProduct(cleanFormData);
        if (result.error) {
          console.error('Error creating product:', result.error);
          alert(`Error al crear el producto: ${result.error.message}`);
          return;
        }
        // Agregar el nuevo producto a la lista local
        setProducts(prev => [result.data, ...prev]);
      }

      // Reset form
      setNewTag("");
      setImageType('url');
      setImageBackType('url');
      setImageUploadType('url');
      setUploadedImageUrls([]);
      setSelectedImages([]);
      setFormData({
        name: "",
        price: 0,
        images: [],
        main_image: "",
        image: "", // Include for API compatibility
        category: "camiseta",
        gender: "unisex",
        description: "",
        specifications: [],
        sizes: [],
        status: "active",
        stock_quantity: 0,
        sku: "",
        weight: undefined,
        dimensions: undefined,
        tags: [],
        original_price: undefined,
        discount_percentage: undefined,
        is_on_discount: false,
        discount_start_date: undefined,
        discount_end_date: undefined,
      });
      setIsCreating(false);
    } catch (error) {
      console.error('Unexpected error:', error);
      alert(`Error inesperado: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product.id);
    setNewTag("");
    setImageType('url');
    setImageBackType('url');
    setImageUploadType('url');
    setUploadedImageUrls([]);
    setSelectedImages([]);
    setFormData({
      name: product.name,
      price: product.price,
      images: product.images || [],
      main_image: product.main_image || "",
      image: product.main_image || product.image || "", 
      category: product.category,
      gender: product.gender,
      description: product.description || "",
      specifications: product.specifications || [],
      sizes: product.sizes || [],
      status: product.status,
      stock_quantity: product.stock_quantity || 0,
      sku: product.sku || "",
      weight: product.weight || undefined,
      dimensions: product.dimensions || undefined,
      tags: product.tags || [],
      original_price: product.original_price || undefined,
      discount_percentage: product.discount_percentage || undefined,
      is_on_discount: product.is_on_discount || false,
      discount_start_date: product.discount_start_date || undefined,
      discount_end_date: product.discount_end_date || undefined,
    });
    setIsCreating(true);
  };


  
  const handleDelete = (id: string) => {
    setProductToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      setIsDeleting(true);
      setIsClosing(true);
      const result = await deleteProduct(productToDelete);
      
      if (!result.error) {
        // Remover el producto de la lista local
        setProducts(prev => prev.filter(product => product.id !== productToDelete));
      }
      
      setTimeout(() => {
        setShowDeleteModal(false);
        setProductToDelete(null);
        setIsClosing(false);
        setIsDeleting(false);
      }, 300);
    }
  };

  const cancelDelete = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowDeleteModal(false);
      setProductToDelete(null);
      setIsClosing(false);
    }, 300);
  };

  // Cerrar modal con tecla Escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showDeleteModal) {
        cancelDelete();
      }
    };

    if (showDeleteModal) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevenir scroll del body
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showDeleteModal]);

  const handleStatusChange = async (productId: string, newStatus: string) => {
    try {
      const result = await updateProduct(productId, { status: newStatus as any });
      if (result.error) {
        console.error('Error updating product status:', result.error);
        alert(`Error al actualizar el estado: ${result.error.message}`);
      } else {
        // Actualizar el estado en la lista local
        setProducts(prev => 
          prev.map(product => 
            product.id === productId ? { ...product, status: newStatus as any } : product
          )
        );
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert(`Error inesperado: ${error}`);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Cargando productos..." fullScreen />
  }

  return (
    <AdminRouteGuard>
      <div className="p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <label 
            className="text-sm font-medium text-gray-600 hover:text-[#4a5a3f] cursor-pointer transition-colors" 
            onClick={() => window.location.href = "/admin"}
          >
            ← Volver al Dashboard
          </label>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Administrar Productos</h2>
        </div>
        <button
          onClick={() => {
            setIsCreating(true);
            setEditingProduct(null);
            setNewTag("");
            setImageType('url');
            setImageBackType('url');
            setImageUploadType('url');
            setUploadedImageUrls([]);
            setSelectedImages([]);
            setFormData({
              name: "",
              price: 0,
              images: [],
              main_image: "",
              image: "", // Include for API compatibility
              category: "camiseta",
              gender: "unisex",
              description: "",
              specifications: [],
              sizes: [],
              status: "active",
              stock_quantity: 0,
              sku: "",
              weight: undefined,
              dimensions: undefined,
              tags: [],
              original_price: undefined,
              discount_percentage: undefined,
              is_on_discount: false,
              discount_start_date: undefined,
              discount_end_date: undefined,
            });
          }}
          className="w-full sm:w-auto bg-[#4a5a3f] text-white px-6 py-2 rounded-md hover:bg-[#3d4a34] transition-colors cursor-pointer text-center"
        >
          + Nuevo Producto
        </button>
      </div>

      {/* Formulario de creación/edición */}
      {isCreating && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h3 className="text-xl font-bold mb-4">
            {editingProduct ? "Editar Producto" : "Nuevo Producto"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] cursor-text"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    $
                  </span>
                  <input
                    type="text"
                    value={
                      formData.price === 0
                        ? ""
                        : formData.price.toLocaleString("es-CO")
                    }
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d]/g, "");
                      setFormData({
                        ...formData,
                        price: value ? Number(value) : 0,
                      });
                    }}
                    placeholder="0"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] cursor-text"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Formato: {formatoPeso(formData.price || 0)}
                </p>
              </div>
              
              {/* Discount Section */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="is_on_discount"
                    checked={formData.is_on_discount || false}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        is_on_discount: e.target.checked,
                        original_price: e.target.checked ? formData.original_price : undefined,
                        discount_percentage: e.target.checked ? formData.discount_percentage : undefined,
                        discount_start_date: e.target.checked ? formData.discount_start_date : undefined,
                        discount_end_date: e.target.checked ? formData.discount_end_date : undefined,
                      });
                    }}
                    className="w-4 h-4 text-[#4a5a3f] border-gray-300 rounded focus:ring-[#4a5a3f] cursor-pointer"
                  />
                  <label htmlFor="is_on_discount" className="text-sm font-medium text-gray-700 cursor-pointer">
                    🏷️ Aplicar descuento a este producto
                  </label>
                </div>
                
                {formData.is_on_discount && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Precio Original (antes del descuento)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                          $
                        </span>
                        <input
                          type="text"
                          value={
                            formData.original_price === 0 || !formData.original_price
                              ? ""
                              : formData.original_price.toLocaleString("es-CO")
                          }
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, "");
                            setFormData({
                              ...formData,
                              original_price: value ? Number(value) : undefined,
                            });
                          }}
                          placeholder="0"
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] cursor-text"
                          required={formData.is_on_discount}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Debe ser mayor al precio actual
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Porcentaje de Descuento
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={formData.discount_percentage || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData({
                              ...formData,
                              discount_percentage: value ? Number(value) : undefined,
                            });
                          }}
                          placeholder="0"
                          className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] cursor-text"
                          required={formData.is_on_discount}
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                          %
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        1-99% de descuento
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha y Hora de Inicio (opcional)
                      </label>
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <input
                            type="date"
                            value={formData.discount_start_date ? formData.discount_start_date.split('T')[0] : ""}
                            onChange={(e) => {
                              const dateValue = e.target.value;
                              const currentTime = formData.discount_start_date ? 
                                formData.discount_start_date.split('T')[1] : 
                                new Date().toTimeString().slice(0, 5);
                              const fullDateTime = dateValue ? `${dateValue}T${currentTime}` : undefined;
                              setFormData({
                                ...formData,
                                discount_start_date: fullDateTime,
                              });
                            }}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] cursor-pointer"
                          />
                          <input
                            type="time"
                            value={formData.discount_start_date ? formData.discount_start_date.split('T')[1] : ""}
                            onChange={(e) => {
                              const timeValue = e.target.value;
                              const currentDate = formData.discount_start_date ? 
                                formData.discount_start_date.split('T')[0] : 
                                new Date().toISOString().split('T')[0];
                              const fullDateTime = timeValue ? `${currentDate}T${timeValue}` : undefined;
                              setFormData({
                                ...formData,
                                discount_start_date: fullDateTime,
                              });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] cursor-pointer"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const now = new Date();
                              const today = now.toISOString().split('T')[0];
                              const currentTime = now.toTimeString().slice(0, 5);
                              setFormData({
                                ...formData,
                                discount_start_date: `${today}T${currentTime}`,
                              });
                            }}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors cursor-pointer date-quick-btn"
                          >
                            ⏰ Ahora
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const in5Min = new Date();
                              in5Min.setMinutes(in5Min.getMinutes() + 5);
                              setFormData({
                                ...formData,
                                discount_start_date: in5Min.toISOString().slice(0, 16),
                              });
                            }}
                            className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors cursor-pointer date-quick-btn"
                          >
                            ⏱️ +5 min
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const in15Min = new Date();
                              in15Min.setMinutes(in15Min.getMinutes() + 15);
                              setFormData({
                                ...formData,
                                discount_start_date: in15Min.toISOString().slice(0, 16),
                              });
                            }}
                            className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors cursor-pointer date-quick-btn"
                          >
                            ⏱️ +15 min
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const in30Min = new Date();
                              in30Min.setMinutes(in30Min.getMinutes() + 30);
                              setFormData({
                                ...formData,
                                discount_start_date: in30Min.toISOString().slice(0, 16),
                              });
                            }}
                            className="px-3 py-1 text-xs bg-cyan-100 text-cyan-700 rounded-md hover:bg-cyan-200 transition-colors cursor-pointer date-quick-btn"
                          >
                            ⏱️ +30 min
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const in1Hour = new Date();
                              in1Hour.setHours(in1Hour.getHours() + 1);
                              setFormData({
                                ...formData,
                                discount_start_date: in1Hour.toISOString().slice(0, 16),
                              });
                            }}
                            className="px-3 py-1 text-xs bg-teal-100 text-teal-700 rounded-md hover:bg-teal-200 transition-colors cursor-pointer date-quick-btn"
                          >
                            ⏰ +1 hora
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const tomorrow = new Date();
                              tomorrow.setDate(tomorrow.getDate() + 1);
                              const tomorrowDate = tomorrow.toISOString().split('T')[0];
                              const currentTime = new Date().toTimeString().slice(0, 5);
                              setFormData({
                                ...formData,
                                discount_start_date: `${tomorrowDate}T${currentTime}`,
                              });
                            }}
                            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors cursor-pointer date-quick-btn"
                          >
                            🌅 Mañana
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                discount_start_date: undefined,
                              });
                            }}
                            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors cursor-pointer date-quick-btn"
                          >
                            🗑️ Limpiar
                          </button>
                        </div>
                        {formData.discount_start_date && (
                          <p className="text-xs text-gray-500">
                            Inicia: {new Date(formData.discount_start_date).toLocaleString('es-CO', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha y Hora de Fin (opcional)
                      </label>
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <input
                            type="date"
                            value={formData.discount_end_date ? formData.discount_end_date.split('T')[0] : ""}
                            onChange={(e) => {
                              const dateValue = e.target.value;
                              const currentTime = formData.discount_end_date ? 
                                formData.discount_end_date.split('T')[1] : 
                                new Date().toTimeString().slice(0, 5);
                              const fullDateTime = dateValue ? `${dateValue}T${currentTime}` : undefined;
                              setFormData({
                                ...formData,
                                discount_end_date: fullDateTime,
                              });
                            }}
                            min={formData.discount_start_date ? formData.discount_start_date.split('T')[0] : new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] cursor-pointer"
                          />
                          <input
                            type="time"
                            value={formData.discount_end_date ? formData.discount_end_date.split('T')[1] : ""}
                            onChange={(e) => {
                              const timeValue = e.target.value;
                              const currentDate = formData.discount_end_date ? 
                                formData.discount_end_date.split('T')[0] : 
                                new Date().toISOString().split('T')[0];
                              const fullDateTime = timeValue ? `${currentDate}T${timeValue}` : undefined;
                              setFormData({
                                ...formData,
                                discount_end_date: fullDateTime,
                              });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] cursor-pointer"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const in15Min = new Date();
                              in15Min.setMinutes(in15Min.getMinutes() + 15);
                              setFormData({
                                ...formData,
                                discount_end_date: in15Min.toISOString().slice(0, 16),
                              });
                            }}
                            className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors cursor-pointer date-quick-btn"
                          >
                            ⏱️ +15 min
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const in30Min = new Date();
                              in30Min.setMinutes(in30Min.getMinutes() + 30);
                              setFormData({
                                ...formData,
                                discount_end_date: in30Min.toISOString().slice(0, 16),
                              });
                            }}
                            className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors cursor-pointer date-quick-btn"
                          >
                            ⏱️ +30 min
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const in1Hour = new Date();
                              in1Hour.setHours(in1Hour.getHours() + 1);
                              setFormData({
                                ...formData,
                                discount_end_date: in1Hour.toISOString().slice(0, 16),
                              });
                            }}
                            className="px-3 py-1 text-xs bg-teal-100 text-teal-700 rounded-md hover:bg-teal-200 transition-colors cursor-pointer date-quick-btn"
                          >
                            ⏰ +1 hora
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const in2Hours = new Date();
                              in2Hours.setHours(in2Hours.getHours() + 2);
                              setFormData({
                                ...formData,
                                discount_end_date: in2Hours.toISOString().slice(0, 16),
                              });
                            }}
                            className="px-3 py-1 text-xs bg-cyan-100 text-cyan-700 rounded-md hover:bg-cyan-200 transition-colors cursor-pointer date-quick-btn"
                          >
                            ⏰ +2 horas
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const in7Days = new Date();
                              in7Days.setDate(in7Days.getDate() + 7);
                              const date7Days = in7Days.toISOString().split('T')[0];
                              const currentTime = new Date().toTimeString().slice(0, 5);
                              setFormData({
                                ...formData,
                                discount_end_date: `${date7Days}T${currentTime}`,
                              });
                            }}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors cursor-pointer date-quick-btn"
                          >
                            📅 +7 días
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const in30Days = new Date();
                              in30Days.setDate(in30Days.getDate() + 30);
                              const date30Days = in30Days.toISOString().split('T')[0];
                              const currentTime = new Date().toTimeString().slice(0, 5);
                              setFormData({
                                ...formData,
                                discount_end_date: `${date30Days}T${currentTime}`,
                              });
                            }}
                            className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors cursor-pointer date-quick-btn"
                          >
                            📆 +30 días
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                discount_end_date: undefined,
                              });
                            }}
                            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors cursor-pointer date-quick-btn"
                          >
                            🗑️ Limpiar
                          </button>
                        </div>
                        {formData.discount_end_date && (
                          <p className="text-xs text-gray-500">
                            Termina: {new Date(formData.discount_end_date).toLocaleString('es-CO', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                        {/* Validación de fechas */}
                        {formData.discount_start_date && formData.discount_end_date && 
                         new Date(formData.discount_start_date) >= new Date(formData.discount_end_date) && (
                          <p className="text-xs text-red-600 font-medium">
                            ⚠️ La fecha de fin debe ser posterior a la fecha de inicio
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Discount Info & Validation */}
                    {formData.is_on_discount && (
                      <div className="md:col-span-2 space-y-4">
                        {/* Price Preview */}
                        {formData.original_price && formData.discount_percentage && (
                          <div className="p-4 discount-preview">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Vista previa del precio:</h4>
                            <div className="flex items-center gap-4 mb-2">
                              <div className="text-lg font-medium original-price">
                                {formatoPeso(formData.original_price)}
                              </div>
                              <div className="text-xl font-bold discount-price">
                                {formatoPeso(Math.round(formData.original_price * (1 - formData.discount_percentage / 100)))}
                              </div>
                              <div className="px-2 py-1 discount-badge text-sm font-medium rounded-full">
                                -{formData.discount_percentage}%
                              </div>
                            </div>
                            <p className="text-sm savings-text font-medium">
                              Ahorro: {formatoPeso(formData.original_price - Math.round(formData.original_price * (1 - formData.discount_percentage / 100)))}
                            </p>
                          </div>
                        )}

                        {/* Discount Status & Duration */}
                        {formData.discount_start_date && formData.discount_end_date && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <h5 className="text-sm font-medium text-blue-900 mb-2">📅 Información del Descuento</h5>
                            <div className="space-y-1 text-xs text-blue-800">
                              <p>
                                <span className="font-medium">Duración:</span> {
                                  (() => {
                                    const start = new Date(formData.discount_start_date);
                                    const end = new Date(formData.discount_end_date);
                                    const diffMs = end.getTime() - start.getTime();
                                    const diffMinutes = Math.floor(diffMs / (1000 * 60));
                                    const diffHours = Math.floor(diffMinutes / 60);
                                    const diffDays = Math.floor(diffHours / 24);
                                    
                                    if (diffDays > 0) {
                                      return `${diffDays} día${diffDays > 1 ? 's' : ''} ${diffHours % 24}h ${diffMinutes % 60}m`;
                                    } else if (diffHours > 0) {
                                      return `${diffHours} hora${diffHours > 1 ? 's' : ''} ${diffMinutes % 60}m`;
                                    } else {
                                      return `${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
                                    }
                                  })()
                                }
                              </p>
                              <p>
                                <span className="font-medium">Estado:</span> {
                                  new Date(formData.discount_start_date) > new Date() ? '🟡 Programado' :
                                  new Date(formData.discount_end_date) < new Date() ? '🔴 Expirado' : '🟢 Activo'
                                }
                              </p>
                              <p>
                                <span className="font-medium">Inicio:</span> {
                                  new Date(formData.discount_start_date).toLocaleString('es-CO', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                }
                              </p>
                              <p>
                                <span className="font-medium">Fin:</span> {
                                  new Date(formData.discount_end_date).toLocaleString('es-CO', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                }
                              </p>
                              {formData.discount_start_date && formData.discount_end_date && 
                               new Date(formData.discount_start_date) >= new Date(formData.discount_end_date) && (
                                <p className="text-red-600 font-medium">
                                  ⚠️ Error: La fecha de fin debe ser posterior a la fecha de inicio
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Quick Setup Buttons */}
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">⚡ Configuración Rápida</h5>
                          <div className="space-y-3">
                            {/* Promociones por minutos/horas */}
                            <div>
                              <p className="text-xs font-medium text-gray-600 mb-2">⏱️ Promociones Cortas:</p>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const now = new Date();
                                    const in15Min = new Date();
                                    in15Min.setMinutes(in15Min.getMinutes() + 15);
                                    
                                    setFormData({
                                      ...formData,
                                      discount_start_date: now.toISOString().slice(0, 16),
                                      discount_end_date: in15Min.toISOString().slice(0, 16),
                                    });
                                  }}
                                  className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors cursor-pointer date-quick-btn"
                                >
                                  ⚡ Flash: 15 min
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const now = new Date();
                                    const in30Min = new Date();
                                    in30Min.setMinutes(in30Min.getMinutes() + 30);
                                    
                                    setFormData({
                                      ...formData,
                                      discount_start_date: now.toISOString().slice(0, 16),
                                      discount_end_date: in30Min.toISOString().slice(0, 16),
                                    });
                                  }}
                                  className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors cursor-pointer date-quick-btn"
                                >
                                  ⚡ Flash: 30 min
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const now = new Date();
                                    const in1Hour = new Date();
                                    in1Hour.setHours(in1Hour.getHours() + 1);
                                    
                                    setFormData({
                                      ...formData,
                                      discount_start_date: now.toISOString().slice(0, 16),
                                      discount_end_date: in1Hour.toISOString().slice(0, 16),
                                    });
                                  }}
                                  className="px-3 py-1 text-xs bg-teal-100 text-teal-700 rounded-md hover:bg-teal-200 transition-colors cursor-pointer date-quick-btn"
                                >
                                  ⚡ Flash: 1 hora
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const now = new Date();
                                    const in2Hours = new Date();
                                    in2Hours.setHours(in2Hours.getHours() + 2);
                                    
                                    setFormData({
                                      ...formData,
                                      discount_start_date: now.toISOString().slice(0, 16),
                                      discount_end_date: in2Hours.toISOString().slice(0, 16),
                                    });
                                  }}
                                  className="px-3 py-1 text-xs bg-cyan-100 text-cyan-700 rounded-md hover:bg-cyan-200 transition-colors cursor-pointer date-quick-btn"
                                >
                                  ⚡ Flash: 2 horas
                                </button>
                              </div>
                            </div>
                            
                            {/* Promociones por días */}
                            <div>
                              <p className="text-xs font-medium text-gray-600 mb-2">📅 Promociones por Días:</p>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const now = new Date();
                                    const in7Days = new Date();
                                    in7Days.setDate(in7Days.getDate() + 7);
                                    
                                    setFormData({
                                      ...formData,
                                      discount_start_date: now.toISOString().slice(0, 16),
                                      discount_end_date: in7Days.toISOString().slice(0, 16),
                                    });
                                  }}
                                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors cursor-pointer date-quick-btn"
                                >
                                  🚀 Iniciar ahora por 7 días
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const tomorrow = new Date();
                                    tomorrow.setDate(tomorrow.getDate() + 1);
                                    const in30Days = new Date();
                                    in30Days.setDate(in30Days.getDate() + 30);
                                    
                                    setFormData({
                                      ...formData,
                                      discount_start_date: tomorrow.toISOString().slice(0, 16),
                                      discount_end_date: in30Days.toISOString().slice(0, 16),
                                    });
                                  }}
                                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors cursor-pointer date-quick-btn"
                                >
                                  📅 Mañana por 30 días
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData({
                                      ...formData,
                                      discount_start_date: undefined,
                                      discount_end_date: undefined,
                                    });
                                  }}
                                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors cursor-pointer date-quick-btn"
                                >
                                  🗑️ Limpiar fechas
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] cursor-pointer"
                >
                  <option value="CAMISETA">Camiseta</option>
                  <option value="SUDADERA">Sudadera</option>
                  <option value="TOP">Top</option>
                  <option value="JEAN">Jean</option>
                  <option value="JOGGER">Jogger</option>
                  <option value="GORRA">Gorra</option>
                  <option value="ACCESORIO">Accesorio</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Género
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] cursor-pointer"
                >
                  <option value="HOMBRE">Hombre</option>
                  <option value="MUJER">Mujer</option>
                  <option value="UNISEX">Unisex</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen Principal *
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setImageType('url')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                        imageType === 'url'
                          ? 'bg-[#4a5a3f] text-white shadow-md'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      📎 Usar URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageType('upload')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                        imageType === 'upload'
                          ? 'bg-[#4a5a3f] text-white shadow-md'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      📁 Subir Archivo
                    </button>
                  </div>
                  
                  {imageType === 'url' ? (
                    <div>
                      <input
                        type="url"
                        value={formData.main_image}
                        onChange={(e) =>
                          setFormData({ ...formData, main_image: e.target.value, image: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] cursor-text"
                        placeholder="https://ejemplo.com/imagen.jpg"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Ingresa la URL completa de la imagen
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        required
                        disabled={uploadingImage}
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer transition-colors ${
                          uploadingImage
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-gray-300 hover:border-[#4a5a3f] hover:bg-gray-50'
                        }`}
                      >
                        {uploadingImage ? (
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                            <p className="text-sm text-blue-600 font-medium mb-2">Subiendo imagen...</p>
                            
                            {/* Barra de progreso */}
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{Math.round(uploadProgress)}%</p>
                            
                            <button
                              type="button"
                              onClick={() => {
                                setUploadingImage(false);
                                setUploadProgress(0);
                                // Limpiar el input de archivo
                                const fileInput = document.getElementById('image-upload') as HTMLInputElement;
                                if (fileInput) fileInput.value = '';
                              }}
                              className="px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-sm text-gray-600 font-medium">Haz clic para subir imagen</p>
                            <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP, GIF • Máximo 5MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                  )}
                  
                  {formData.main_image && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Vista previa:</p>
                      <div className="relative inline-block">
                        <img
                          src={formData.main_image}
                          alt="Vista previa"
                          className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, main_image: "", image: "" })}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors cursor-pointer"
                          title="Eliminar imagen"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              
              {/* New Multiple Images Section */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Múltiples Imágenes (Máximo 4) *
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setImageUploadType('url')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                        imageUploadType === 'url'
                          ? 'bg-[#4a5a3f] text-white shadow-md'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      📎 Usar URLs
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadType('upload')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                        imageUploadType === 'upload'
                          ? 'bg-[#4a5a3f] text-white shadow-md'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      📁 Subir Archivos
                    </button>
                  </div>
                  
                  {imageUploadType === 'upload' ? (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleMultipleImageUpload}
                        multiple
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploadingImages}
                        id="multiple-image-upload"
                      />
                      <label
                        htmlFor="multiple-image-upload"
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer transition-colors ${
                          uploadingImages
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-gray-300 hover:border-[#4a5a3f] hover:bg-gray-50'
                        }`}
                      >
                        {uploadingImages ? (
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                            <p className="text-sm text-blue-600 font-medium mb-2">Subiendo imágenes...</p>
                            
                            {/* Barra de progreso */}
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{Math.round(uploadProgress)}%</p>
                            
                            <button
                              type="button"
                              onClick={() => {
                                setUploadingImages(false);
                                setUploadProgress(0);
                                // Limpiar el input de archivo
                                const fileInput = document.getElementById('multiple-image-upload') as HTMLInputElement;
                                if (fileInput) fileInput.value = '';
                              }}
                              className="px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-sm text-gray-600 font-medium">Haz clic para subir imágenes</p>
                            <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP, GIF • Máximo 4 archivos • 5MB cada uno</p>
                          </div>
                        )}
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="URL de imagen 1 (principal)"
                          value={formData.main_image}
                          onChange={(e) =>
                            setFormData({ 
                              ...formData, 
                              main_image: e.target.value,
                              image: e.target.value, // Include for API compatibility
                              images: e.target.value ? [e.target.value, ...formData.images.slice(1)] : formData.images.slice(1)
                            })
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] cursor-text"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const currentImages = formData.images.filter(img => img && img.trim() !== '');
                            const newImages = [...currentImages];
                            if (formData.main_image && !newImages.includes(formData.main_image)) {
                              newImages[0] = formData.main_image;
                            }
                            setFormData({ ...formData, images: newImages });
                          }}
                          className="px-4 py-2 bg-[#4a5a3f] text-white rounded-md hover:bg-[#3d4a34] transition-colors cursor-pointer"
                        >
                          Agregar
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="URL de imagen 2 (trasera)"
                          value={formData.images[1] || ''}
                          onChange={(e) => {
                            const currentImages = formData.images.filter(img => img && img.trim() !== '');
                            const newImages = [...currentImages];
                            if (e.target.value) {
                              newImages[1] = e.target.value;
                            } else {
                              newImages.splice(1, 1);
                            }
                            setFormData({ 
                              ...formData, 
                              images: newImages
                            });
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] cursor-text"
                        />
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="URL de imagen 3"
                          value={formData.images[2] || ''}
                          onChange={(e) => {
                            const currentImages = formData.images.filter(img => img && img.trim() !== '');
                            const newImages = [...currentImages];
                            if (e.target.value) {
                              newImages[2] = e.target.value;
                            } else {
                              newImages.splice(2, 1);
                            }
                            setFormData({ ...formData, images: newImages });
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] cursor-text"
                        />
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="URL de imagen 4"
                          value={formData.images[3] || ''}
                          onChange={(e) => {
                            const currentImages = formData.images.filter(img => img && img.trim() !== '');
                            const newImages = [...currentImages];
                            if (e.target.value) {
                              newImages[3] = e.target.value;
                            } else {
                              newImages.splice(3, 1);
                            }
                            setFormData({ ...formData, images: newImages });
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] cursor-text"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Image Gallery Preview */}
                  <div className="mt-4">
                    {formData.images.filter(img => img && img.trim() !== '').length > 0 ? (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Galería de imágenes ({formData.images.filter(img => img && img.trim() !== '').length}):
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {formData.images
                            .filter(img => img && img.trim() !== '')
                            .map((image, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={image}
                                alt={`Imagen ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                                onError={(e) => {
                                  console.error('Error loading image:', image);
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                                  {index !== 0 && (
                                    <button
                                      type="button"
                                      onClick={() => setMainImage(index)}
                                      className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors cursor-pointer"
                                      title="Establecer como principal"
                                    >
                                      ⭐
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors cursor-pointer"
                                    title="Eliminar imagen"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                              {index === 0 && (
                                <div className="absolute top-1 left-1 bg-yellow-500 text-white text-xs px-1 py-0.5 rounded">
                                  Principal
                                </div>
                              )}
                              {index === 1 && (
                                <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                                  Trasera
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-gray-500 font-medium">No hay imágenes en la galería</p>
                        <p className="text-xs text-gray-400 mt-1">Sube imágenes o ingresa URLs para verlas aquí</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad en Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock_quantity?.toString() || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, stock_quantity: Number(e.target.value) || 0 })
                  }
                  onFocus={(e) => {
                    if (e.target.value === "0") {
                      e.target.value = "";
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] cursor-text"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] cursor-text"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU
                </label>
                <input
                  type="text"
                  value={formData.sku || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] cursor-text"
                  placeholder="Código único del producto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peso (gramos)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.weight?.toString() || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: Number(e.target.value) || undefined })
                  }
                  onFocus={(e) => {
                    if (e.target.value === "0") {
                      e.target.value = "";
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] cursor-text"
                  placeholder="Peso en gramos"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dimensiones (cm)
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Ancho</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.dimensions?.width?.toString() || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dimensions: {
                          ...formData.dimensions,
                          width: Number(e.target.value) || 0,
                          height: formData.dimensions?.height || 0,
                          depth: formData.dimensions?.depth || 0,
                        }
                      })
                    }
                    onFocus={(e) => {
                      if (e.target.value === "0") {
                        e.target.value = "";
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] cursor-text"
                    placeholder="Ancho"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Alto</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.dimensions?.height?.toString() || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dimensions: {
                          ...formData.dimensions,
                          width: formData.dimensions?.width || 0,
                          height: Number(e.target.value) || 0,
                          depth: formData.dimensions?.depth || 0,
                        }
                      })
                    }
                    onFocus={(e) => {
                      if (e.target.value === "0") {
                        e.target.value = "";
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] cursor-text"
                    placeholder="Alto"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Profundidad</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.dimensions?.depth?.toString() || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dimensions: {
                          ...formData.dimensions,
                          width: formData.dimensions?.width || 0,
                          height: formData.dimensions?.height || 0,
                          depth: Number(e.target.value) || 0,
                        }
                      })
                    }
                    onFocus={(e) => {
                      if (e.target.value === "0") {
                        e.target.value = "";
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] cursor-text"
                    placeholder="Profundidad"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especificaciones (una por línea)
              </label>
              <textarea
                value={formData.specifications?.join('\n') || ""}
                onChange={(e) => {
                  const specs = e.target.value.split('\n').filter(spec => spec.trim() !== '');
                  setFormData({ ...formData, specifications: specs });
                }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] cursor-text"
                rows={3}
                placeholder="Diseño Streetwear&#10;100% Algodón&#10;Ajustable"
              />
              <p className="text-xs text-gray-500 mt-1">
                Escribe cada especificación en una línea separada
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tallas Disponibles
              </label>
              
              {/* Tallas por letras */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Tallas por letras:</p>
                <div className="flex flex-wrap gap-2">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        const currentSizes = formData.sizes || [];
                        if (currentSizes.includes(size)) {
                          setFormData({
                            ...formData,
                            sizes: currentSizes.filter(s => s !== size)
                          });
                        } else {
                          setFormData({
                            ...formData,
                            sizes: [...currentSizes, size]
                          });
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                        formData.sizes?.includes(size)
                          ? 'bg-[#4a5a3f] text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tallas numéricas */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Tallas numéricas:</p>
                <div className="flex flex-wrap gap-2">
                  {['28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48', '50'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        const currentSizes = formData.sizes || [];
                        if (currentSizes.includes(size)) {
                          setFormData({
                            ...formData,
                            sizes: currentSizes.filter(s => s !== size)
                          });
                        } else {
                          setFormData({
                            ...formData,
                            sizes: [...currentSizes, size]
                          });
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                        formData.sizes?.includes(size)
                          ? 'bg-[#4a5a3f] text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tallas personalizadas */}
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Tallas personalizadas:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ej: 2XL, 3XL, ÚNICA, etc."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] cursor-text"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const customSize = e.currentTarget.value.trim();
                        if (customSize && !formData.sizes?.includes(customSize)) {
                          setFormData({
                            ...formData,
                            sizes: [...(formData.sizes || []), customSize]
                          });
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder*="personalizadas"]') as HTMLInputElement;
                      const customSize = input?.value.trim();
                      if (customSize && !formData.sizes?.includes(customSize)) {
                        setFormData({
                          ...formData,
                          sizes: [...(formData.sizes || []), customSize]
                        });
                        input.value = '';
                      }
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer"
                  >
                    Agregar
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Haz clic en las tallas disponibles para este producto
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] cursor-text"
                  placeholder="Escribe un tag y presiona Enter"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-[#4a5a3f] text-white rounded-md hover:bg-[#3d4a34] transition-colors cursor-pointer"
                >
                  Agregar
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="ml-2 text-gray-500 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Escribe un tag y presiona Enter o el botón Agregar
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-md transition-colors cursor-pointer flex items-center gap-2 ${
                  isSubmitting 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-[#4a5a3f] text-white hover:bg-[#3d4a34]'
                }`}
              >
                {isSubmitting && <LoadingSpinner size="sm" color="white" />}
                {isSubmitting ? 'Procesando...' : (editingProduct ? "Actualizar" : "Crear")} Producto
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingProduct(null);
                  setImageUploadType('url');
                  setUploadedImageUrls([]);
                  setSelectedImages([]);
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Estado:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] cursor-pointer"
            >
              <option value="all">Todos ({totalProducts})</option>
              <option value="active">Activos ({products.filter(p => p.status === 'active').length})</option>
              <option value="inactive">Inactivos ({products.filter(p => p.status === 'inactive').length})</option>
              <option value="draft">Borradores ({products.filter(p => p.status === 'draft').length})</option>
              <option value="out_of_stock">Sin Stock ({products.filter(p => p.status === 'out_of_stock').length})</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Descuentos:
            </label>
            <select
              value={discountFilter}
              onChange={(e) => setDiscountFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] cursor-pointer"
            >
              <option value="all">Todos los productos</option>
              <option value="with_discount">Con descuento ({products.filter(p => p.is_on_discount && p.original_price && p.discount_percentage).length})</option>
              <option value="active_discount">Descuentos activos ({products.filter(p => {
                if (!p.is_on_discount || !p.discount_start_date || !p.discount_end_date) return false;
                const now = new Date();
                const start = new Date(p.discount_start_date);
                const end = new Date(p.discount_end_date);
                return start <= now && end >= now;
              }).length})</option>
              <option value="scheduled_discount">Descuentos programados ({products.filter(p => {
                if (!p.is_on_discount || !p.discount_start_date) return false;
                return new Date(p.discount_start_date) > new Date();
              }).length})</option>
              <option value="expired_discount">Descuentos expirados ({products.filter(p => {
                if (!p.is_on_discount || !p.discount_end_date) return false;
                return new Date(p.discount_end_date) < new Date();
              }).length})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de productos */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio Final
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descuento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-12 w-12 rounded-lg object-cover"
                        src={product.main_image || product.image || '/placeholder.svg'}
                        alt={product.name}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.gender}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex flex-col">
                      <div className="text-lg font-bold text-[#4a5a3f]">
                        {formatoPeso(calcularPrecioFinal(product))}
                      </div>
                      {product.is_on_discount && product.original_price && product.discount_percentage && (
                        <div className="text-sm text-gray-500 line-through">
                          {formatoPeso(product.original_price)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.is_on_discount && product.original_price && product.discount_percentage ? (
                      <div className="flex flex-col items-center">
                        <div className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full mb-1">
                          -{product.discount_percentage}% OFF
                        </div>
                        <div className="text-xs text-green-600 font-medium">
                          Ahorras: {formatoPeso(calcularAhorro(product))}
                        </div>
                        {/* Estado del descuento */}
                        {product.discount_start_date && product.discount_end_date && (
                          <div className="text-xs mt-1">
                            {new Date(product.discount_start_date) > new Date() ? (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                                🟡 Programado
                              </span>
                            ) : new Date(product.discount_end_date) < new Date() ? (
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full">
                                🔴 Expirado
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                🟢 Activo
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 text-center">
                        Sin descuento
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`font-medium ${
                      product.stock_quantity > 10 
                        ? "text-green-600" 
                        : product.stock_quantity > 0 
                        ? "text-yellow-600" 
                        : "text-red-600"
                    }`}>
                      {product.stock_quantity || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.sku || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <select
                        value={product.status}
                        onChange={(e) => handleStatusChange(product.id, e.target.value)}
                        className={`text-xs font-semibold rounded px-2 py-1 border-0 focus:ring-2 focus:ring-[#4a5a3f] cursor-pointer ${
                          product.status === "active"
                            ? "bg-green-100 text-green-800"
                            : product.status === "inactive"
                            ? "bg-red-100 text-red-800"
                            : product.status === "draft"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                        <option value="draft">Borrador</option>
                        <option value="out_of_stock">Sin Stock</option>
                      </select>
                      <span className="text-xs text-gray-500">
                        {product.status === "active" && "Visible"}
                        {product.status === "inactive" && "Oculto"}
                        {product.status === "draft" && "En desarrollo"}
                        {product.status === "out_of_stock" && "Agotado"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-[#4a5a3f] hover:text-[#3d4a34] cursor-pointer"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900 cursor-pointer"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Información de paginación y botón de cargar más */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {products.length} de {totalProducts} productos
              {totalPages > 1 && (
                <span className="ml-2">
                  (Página {currentPage} de {totalPages})
                </span>
              )}
            </div>
            
            {currentPage < totalPages && (
              <button
                onClick={loadMoreProducts}
                disabled={isLoadingMore}
                className={`px-4 py-2 rounded-md transition-colors cursor-pointer flex items-center gap-2 ${
                  isLoadingMore 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-[#4a5a3f] text-white hover:bg-[#3d4a34]'
                }`}
              >
                {isLoadingMore && <LoadingSpinner size="sm" color="white" />}
                {isLoadingMore ? 'Cargando...' : 'Cargar más productos'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div 
          className={`fixed inset-0 bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300 ${
            isClosing ? 'animate-out fade-out' : 'animate-in fade-in'
          }`}
          onClick={cancelDelete}
        >
          <div 
            className={`bg-white rounded-1xl p-6 max-w-md w-full mx-4 shadow-2xl transition-all duration-300 ${
              isClosing 
                ? 'animate-out zoom-out-95 slide-out-to-bottom-4' 
                : 'animate-in zoom-in-95 slide-in-from-bottom-4'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Eliminar Producto</h3>
                <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que quieres eliminar este producto? Esta acción eliminará permanentemente 
              el producto y todos sus datos asociados.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className={`px-4 py-2 rounded-md transition-colors cursor-pointer flex items-center gap-2 ${
                  isDeleting 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-[#4a5a3f] text-white hover:bg-[#3d4a34]'
                }`}
              >
                {isDeleting && <LoadingSpinner size="sm" color="white" />}
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminRouteGuard>
  );
}
