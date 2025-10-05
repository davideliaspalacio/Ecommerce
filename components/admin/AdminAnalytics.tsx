"use client";

import React from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useProductsContext } from "@/contexts/ProductsContext";
import AdminRouteGuard from "./AdminRouteGuard";

export default function AdminAnalytics() {
  const { profile } = useAuthContext();
  const { products } = useProductsContext();

  // Calcular estadísticas basadas en los productos
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'active').length;
  const inactiveProducts = products.filter(p => p.status === 'inactive').length;
  const outOfStockProducts = products.filter(p => p.status === 'out_of_stock').length;
  
  // Estadísticas adicionales
  const productsWithImages = products.filter(p => p.image && p.image !== '').length;
  const productsWithSizes = products.filter(p => p.sizes && p.sizes.length > 0).length;
  const productsWithTags = products.filter(p => p.tags && p.tags.length > 0).length;
  const productsWithCompleteInfo = products.filter(p => 
    p.name && p.description && p.price && p.image && p.sizes && p.sizes.length > 0
  ).length;

  // Estadísticas por categoría
  const categoryStats = products.reduce((acc, product) => {
    const category = product.category;
    if (!acc[category]) {
      acc[category] = { count: 0, totalValue: 0 };
    }
    acc[category].count += 1;
    acc[category].totalValue += product.price;
    return acc;
  }, {} as Record<string, { count: number; totalValue: number }>);

  // Estadísticas por género
  const genderStats = products.reduce((acc, product) => {
    const gender = product.gender;
    if (!acc[gender]) {
      acc[gender] = { count: 0, totalValue: 0 };
    }
    acc[gender].count += 1;
    acc[gender].totalValue += product.price;
    return acc;
  }, {} as Record<string, { count: number; totalValue: number }>);

  // Productos más caros y más baratos
  const sortedByPrice = [...products].sort((a, b) => b.price - a.price);
  const mostExpensive = sortedByPrice[0];
  const cheapest = sortedByPrice[sortedByPrice.length - 1];

  // Precio promedio y estadísticas de precios
  const averagePrice = products.length > 0 
    ? products.reduce((sum, product) => sum + product.price, 0) / products.length 
    : 0;
  
  const minPrice = products.length > 0 ? Math.min(...products.map(p => p.price)) : 0;
  const maxPrice = products.length > 0 ? Math.max(...products.map(p => p.price)) : 0;
  const totalValue = products.reduce((sum, product) => sum + product.price, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };


  return (
    <AdminRouteGuard>
      <div className="p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <label 
            className="text-sm font-medium text-gray-600 hover:text-[#4a5a3f] cursor-pointer transition-colors" 
            onClick={() => window.location.href = "/admin"}
          >
            ← Volver al Dashboard
          </label>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Estadísticas y Analytics</h1>
        </div>
        <div className="text-sm text-gray-500">
          Análisis basado en productos actuales
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-md shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Productos</p>
              <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-md flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-md shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Productos Activos</p>
              <p className="text-2xl font-bold text-green-600">{activeProducts}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-md flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-md shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sin Stock</p>
              <p className="text-2xl font-bold text-red-600">{outOfStockProducts}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-md flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-md shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Precio Promedio</p>
              <p className="text-2xl font-bold text-purple-600">{formatPrice(averagePrice)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-md flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-md shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Con Imágenes</p>
              <p className="text-2xl font-bold text-blue-600">{productsWithImages}</p>
              <p className="text-xs text-gray-500">{totalProducts > 0 ? Math.round((productsWithImages / totalProducts) * 100) : 0}% del total</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-md flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-md shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Con Tallas</p>
              <p className="text-2xl font-bold text-green-600">{productsWithSizes}</p>
              <p className="text-xs text-gray-500">{totalProducts > 0 ? Math.round((productsWithSizes / totalProducts) * 100) : 0}% del total</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-md flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-md shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Con Tags</p>
              <p className="text-2xl font-bold text-purple-600">{productsWithTags}</p>
              <p className="text-xs text-gray-500">{totalProducts > 0 ? Math.round((productsWithTags / totalProducts) * 100) : 0}% del total</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-md flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-md shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completos</p>
              <p className="text-2xl font-bold text-[#4a5a3f]">{productsWithCompleteInfo}</p>
              <p className="text-xs text-gray-500">{totalProducts > 0 ? Math.round((productsWithCompleteInfo / totalProducts) * 100) : 0}% del total</p>
            </div>
            <div className="w-12 h-12 bg-[#4a5a3f]/10 rounded-md flex items-center justify-center">
              <svg className="w-6 h-6 text-[#4a5a3f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts and Recommendations */}
      <div className="bg-white p-6 rounded-md shadow-lg mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas y Recomendaciones</h3>
        <div className="space-y-4">
          {outOfStockProducts > 0 && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-red-800">Productos sin stock</p>
                <p className="text-sm text-red-700">
                  Tienes {outOfStockProducts} producto{outOfStockProducts !== 1 ? 's' : ''} sin stock. 
                  Considera reponer el inventario o desactivar estos productos.
                </p>
              </div>
            </div>
          )}

          {productsWithImages < totalProducts && (
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-yellow-800">Productos sin imágenes</p>
                <p className="text-sm text-yellow-700">
                  {totalProducts - productsWithImages} producto{totalProducts - productsWithImages !== 1 ? 's' : ''} no tienen imágenes. 
                  Las imágenes mejoran significativamente las ventas.
                </p>
              </div>
            </div>
          )}

          {productsWithSizes < totalProducts && (
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-blue-800">Productos sin tallas</p>
                <p className="text-sm text-blue-700">
                  {totalProducts - productsWithSizes} producto{totalProducts - productsWithSizes !== 1 ? 's' : ''} no tienen tallas definidas. 
                  Esto puede afectar la experiencia de compra.
                </p>
              </div>
            </div>
          )}

          {productsWithCompleteInfo < totalProducts && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-md">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-800">Calidad de datos</p>
                <p className="text-sm text-gray-700">
                  Solo {Math.round((productsWithCompleteInfo / totalProducts) * 100)}% de tus productos tienen información completa. 
                  Considera completar los datos faltantes para mejorar la experiencia del cliente.
                </p>
              </div>
            </div>
          )}

          {totalProducts === 0 && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-md">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-800">No hay productos</p>
                <p className="text-sm text-gray-700">
                  No tienes productos en tu catálogo. Comienza agregando algunos productos para ver estadísticas aquí.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Price Summary */}
      {totalProducts > 0 && (
        <div className="bg-white p-6 rounded-md shadow-lg mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Precios</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Precio Mínimo</p>
              <p className="text-2xl font-bold text-green-600">{formatPrice(minPrice)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Precio Promedio</p>
              <p className="text-2xl font-bold text-blue-600">{formatPrice(averagePrice)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Precio Máximo</p>
              <p className="text-2xl font-bold text-red-600">{formatPrice(maxPrice)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-purple-600">{formatPrice(totalValue)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-md shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Categoría</h3>
          <div className="space-y-4">
            {Object.entries(categoryStats).map(([category, stats]) => {
              const percentage = totalProducts > 0 ? (stats.count / totalProducts) * 100 : 0;
              return (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#4a5a3f]"></div>
                    <span className="text-sm font-medium text-gray-700">{category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#4a5a3f] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{stats.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="bg-white p-6 rounded-md shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Género</h3>
          <div className="space-y-4">
            {Object.entries(genderStats).map(([gender, stats]) => {
              const percentage = totalProducts > 0 ? (stats.count / totalProducts) * 100 : 0;
              return (
                <div key={gender} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium text-gray-700">{gender}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{stats.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Product Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Most Expensive Products */}
        <div className="bg-white p-6 rounded-md shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos Más Caros</h3>
          <div className="space-y-3">
            {sortedByPrice.slice(0, 5).map((product, index) => (
              <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                <div className="w-8 h-8 bg-[#4a5a3f] text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-12 h-12 rounded-md object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.category}</p>
                </div>
                <p className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cheapest Products */}
        <div className="bg-white p-6 rounded-md shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos Más Baratos</h3>
          <div className="space-y-3">
            {sortedByPrice.slice(-5).reverse().map((product, index) => (
              <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-12 h-12 rounded-md object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.category}</p>
                </div>
                <p className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Value Analysis */}
      <div className="bg-white p-6 rounded-md shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Valor Total por Categoría</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Promedio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Porcentaje
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(categoryStats).map(([category, stats]) => {
                const percentage = totalProducts > 0 ? (stats.count / totalProducts) * 100 : 0;
                const averageValue = stats.count > 0 ? stats.totalValue / stats.count : 0;
                return (
                  <tr key={category}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stats.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(stats.totalValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(averageValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-[#4a5a3f] h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </AdminRouteGuard>
  );
}
