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
  });

  const formatoPeso = (valor: number): string => {
    return valor.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    });
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

  // Filtrar productos por estado
  const filteredProducts = statusFilter === "all" 
    ? products 
    : products.filter(product => product.status === statusFilter);

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
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            Filtrar por estado:
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
                  Precio
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
                    {formatoPeso(product.price)}
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
