"use client";

import { useState } from "react";
import { useProductsContext } from "@/contexts/ProductsContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { CreateProductType } from "@/components/types/Product";

export default function AdminProducts() {
  const { products, loading, createProduct, updateProduct, deleteProduct } =
    useProductsContext();
  const { profile } = useAuthContext();
  const [isCreating, setIsCreating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
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
    sku: "",
    tags: [],
  });

  const formatoPeso = (valor: number): string => {
    return valor.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    });
  };
  if (profile?.role !== "admin") {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Acceso Denegado
        </h2>
        <p>No tienes permisos para acceder a esta sección.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingProduct) {
      await updateProduct(editingProduct, formData);
      setEditingProduct(null);
    } else {
      await createProduct(formData);
    }

    // Reset form
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
      sku: "",
      tags: [],
    });
    setIsCreating(false);
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product.id);
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
      sku: product.sku || "",
      tags: product.tags || [],
    });
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      await deleteProduct(id);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <label className="block text-sm font-medium  mb-2 cursor-pointer hover:text-[#4a5a3f]" onClick={() => window.location.href = "/"}>
          regresar a la pagina principal
        </label>
        <h2 className="text-3xl font-bold">Administrar Productos</h2>
        <button
          onClick={() => {
            setIsCreating(true);
            setEditingProduct(null);
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
              sku: "",
              tags: [],
            });
          }}
          className="bg-[#4a5a3f] text-white px-6 py-2 rounded-lg hover:bg-[#3d4a34] transition-colors cursor-pointer"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f]"
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
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f]"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f]"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f]"
                >
                  <option value="HOMBRE">Hombre</option>
                  <option value="MUJER">Mujer</option>
                  <option value="UNISEX">Unisex</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de Imagen
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de Imagen Trasera
                </label>
                <input
                  type="url"
                  value={formData.image_back}
                  onChange={(e) =>
                    setFormData({ ...formData, image_back: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f]"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a5a3f]"
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-[#4a5a3f] text-white px-6 py-2 rounded-lg hover:bg-[#3d4a34] transition-colors"
              >
                {editingProduct ? "Actualizar" : "Crear"} Producto
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingProduct(null);
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

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
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.status === "active"
                          ? "bg-green-100 text-green-800"
                          : product.status === "inactive"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-[#4a5a3f] hover:text-[#3d4a34] mr-4 cursor-pointer"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-900 cursor-pointer"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
