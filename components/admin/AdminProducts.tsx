"use client";

import { useState } from "react";
import React from "react";
import { useProductsContext } from "@/contexts/ProductsContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { CreateProductType } from "@/components/types/Product";
import AdminRouteGuard from "./AdminRouteGuard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function AdminProducts() {
  const { products, loading, createProduct, updateProduct, deleteProduct } =
    useProductsContext();
  const { profile } = useAuthContext();
  const [isCreating, setIsCreating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [newTag, setNewTag] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [discountFilter, setDiscountFilter] = useState<string>("all");
  const [imageType, setImageType] = useState<'url' | 'upload'>('url');
  const [imageBackType, setImageBackType] = useState<'url' | 'upload'>('url');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<CreateProductType>({
    name: "",
    price: 0,
    image: "",
    image_back: "",
    category: "CAMISETA",
    gender: "UNISEX",
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
          setFormData({ ...formData, image: imageUrl });
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
          setFormData({ ...formData, image_back: imageUrl });
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
        if (new Date(formData.discount_start_date) >= new Date(formData.discount_end_date)) {
          alert('La fecha de fin debe ser posterior a la fecha de inicio');
          setIsSubmitting(false);
          return;
        }
      }
    }

    try {
      if (editingProduct) {
        console.log('Updating product:', editingProduct, formData);
        const result = await updateProduct(editingProduct, formData);
        if (result.error) {
          console.error('Error updating product:', result.error);
          alert(`Error al actualizar el producto: ${result.error.message}`);
          return;
        }
        setEditingProduct(null);
      } else {
        console.log('Creating product:', formData);
        const result = await createProduct(formData);
        if (result.error) {
          console.error('Error creating product:', result.error);
          alert(`Error al crear el producto: ${result.error.message}`);
          return;
        }
        console.log('Product created successfully:', result.data);
      }

      // Reset form
      setNewTag("");
      setImageType('url');
      setImageBackType('url');
      setFormData({
        name: "",
        price: 0,
        image: "",
        image_back: "",
        category: "CAMISETA",
        gender: "UNISEX",
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
    setFormData({
      name: product.name,
      price: product.price,
      image: product.image,
      image_back: product.image_back || "",
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
      await deleteProduct(productToDelete);
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
            setFormData({
              name: "",
              price: 0,
              image: "",
              image_back: "",
              category: "CAMISETA",
              gender: "UNISEX",
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
                        Fecha de Inicio (opcional)
                      </label>
                      <div className="space-y-2">
                        <input
                          type="date"
                          value={formData.discount_start_date ? formData.discount_start_date.split('T')[0] : ""}
                          onChange={(e) => {
                            const dateValue = e.target.value;
                            const currentTime = new Date().toTimeString().slice(0, 5);
                            const fullDateTime = dateValue ? `${dateValue}T${currentTime}` : undefined;
                            setFormData({
                              ...formData,
                              discount_start_date: fullDateTime,
                            });
                          }}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] cursor-pointer"
                        />
                        <div className="flex gap-2">
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
                        Fecha de Fin (opcional)
                      </label>
                      <div className="space-y-2">
                        <input
                          type="date"
                          value={formData.discount_end_date ? formData.discount_end_date.split('T')[0] : ""}
                          onChange={(e) => {
                            const dateValue = e.target.value;
                            const currentTime = new Date().toTimeString().slice(0, 5);
                            const fullDateTime = dateValue ? `${dateValue}T${currentTime}` : undefined;
                            setFormData({
                              ...formData,
                              discount_end_date: fullDateTime,
                            });
                          }}
                          min={formData.discount_start_date ? formData.discount_start_date.split('T')[0] : new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] cursor-pointer"
                        />
                        <div className="flex gap-2">
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
                            className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors cursor-pointer date-quick-btn"
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
                                  Math.ceil((new Date(formData.discount_end_date).getTime() - new Date(formData.discount_start_date).getTime()) / (1000 * 60 * 60 * 24))
                                } días
                              </p>
                              <p>
                                <span className="font-medium">Estado:</span> {
                                  new Date(formData.discount_start_date) > new Date() ? '🟡 Programado' :
                                  new Date(formData.discount_end_date) < new Date() ? '🔴 Expirado' : '🟢 Activo'
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
                        value={formData.image}
                        onChange={(e) =>
                          setFormData({ ...formData, image: e.target.value })
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
                  
                  {formData.image && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Vista previa:</p>
                      <div className="relative inline-block">
                        <img
                          src={formData.image}
                          alt="Vista previa"
                          className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image: "" })}
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen Trasera (Opcional)
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setImageBackType('url')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                        imageBackType === 'url'
                          ? 'bg-[#4a5a3f] text-white shadow-md'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      📎 Usar URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageBackType('upload')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                        imageBackType === 'upload'
                          ? 'bg-[#4a5a3f] text-white shadow-md'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      📁 Subir Archivo
                    </button>
                  </div>
                  
                  {imageBackType === 'url' ? (
                    <div>
                      <input
                        type="url"
                        value={formData.image_back}
                        onChange={(e) =>
                          setFormData({ ...formData, image_back: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] cursor-text"
                        placeholder="https://ejemplo.com/imagen-trasera.jpg"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Ingresa la URL completa de la imagen trasera
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleImageBackUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploadingImage}
                        id="image-back-upload"
                      />
                      <label
                        htmlFor="image-back-upload"
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
                            <p className="text-sm text-gray-600 font-medium">Haz clic para subir imagen trasera</p>
                            <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP, GIF • Máximo 5MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                  )}
                  
                  {formData.image_back && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Vista previa trasera:</p>
                      <div className="relative inline-block">
                        <img
                          src={formData.image_back}
                          alt="Vista previa trasera"
                          className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image_back: "" })}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors cursor-pointer"
                          title="Eliminar imagen trasera"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
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
              <option value="all">Todos ({products.length})</option>
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
                        src={product.image}
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
