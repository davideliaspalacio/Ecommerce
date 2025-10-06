"use client";

import React from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import Link from "next/link";
import AdminRouteGuard from "./AdminRouteGuard";

export default function AdminDashboard() {
  const { profile } = useAuthContext();


  const adminSections = [
    {
      title: "Productos",
      description: "Gestionar catálogo de productos, inventario y precios",
      href: "/admin/products",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: "bg-gray-200",
      stats: "Gestión completa"
    },
    {
      title: "Clientes",
      description: "Administrar usuarios, perfiles y datos de clientes",
      href: "/admin/customers",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: "bg-gray-200",
      stats: "Base de datos"
    },
    {
      title: "Estadísticas",
      description: "Reportes, métricas y análisis de productos",
      href: "/admin/analytics",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: "bg-gray-200",
      stats: "Reportes y KPIs"
    }
  ];

  return (
    <AdminRouteGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <button 
                className="group flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#4a5a3f] transition-all duration-200 hover:translate-x-1" 
                onClick={() => window.location.href = "/"}
              >
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Regresar al sitio
              </button>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-[#4a5a3f] to-gray-700 bg-clip-text text-transparent">
                  Panel de Administración
                </h1>
                <p className="text-gray-600 mt-2">Gestiona tu tienda desde un solo lugar</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="w-8 h-8 bg-gradient-to-r from-[#4a5a3f] to-[#3d4a34] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {profile?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Admin</p>
                  <p className="text-xs text-gray-500">{profile?.email}</p>
                </div>
              </div>
            </div>
          </div>


          {/* Admin Sections Grid */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Módulos de Administración</h2>
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Gestiona todos los aspectos de tu tienda
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminSections.map((section, index) => (
                <Link
                  key={index}
                  href={section.href}
                  className="group relative overflow-hidden bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-14 h-14 ${section.color} bg-opacity-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-sm`}>
                        {section.icon}
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 group-hover:bg-[#4a5a3f] group-hover:text-white transition-colors duration-300">
                          {section.stats}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#4a5a3f] transition-colors duration-300">
                      {section.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm leading-relaxed mb-6">
                      {section.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-[#4a5a3f] text-sm font-medium group-hover:translate-x-1 transition-transform duration-300">
                        Acceder
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <div className="w-8 h-8 bg-gray-100 group-hover:bg-[#4a5a3f] rounded-lg flex items-center justify-center transition-colors duration-300">
                        <svg className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>


        </div>
      </div>
    </AdminRouteGuard>
  );
}
