"use client";

import { useState } from "react";
import { ShippingInfoType } from "@/components/types/Order";

interface ShippingFormProps {
  onSubmit: (shippingInfo: ShippingInfoType) => void;
  onCancel: () => void;
  initialData?: Partial<ShippingInfoType>;
}

const colombianDepartments = [
  "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bolívar", "Boyacá",
  "Caldas", "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó", "Córdoba",
  "Cundinamarca", "Guainía", "Guaviare", "Huila", "La Guajira", "Magdalena",
  "Meta", "Nariño", "Norte de Santander", "Putumayo", "Quindío", "Risaralda",
  "San Andrés y Providencia", "Santander", "Sucre", "Tolima", "Valle del Cauca",
  "Vaupés", "Vichada"
];

export default function ShippingForm({ onSubmit, onCancel, initialData }: ShippingFormProps) {
  const [formData, setFormData] = useState<ShippingInfoType>({
    full_name: initialData?.full_name || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    document_type: initialData?.document_type || "cc",
    document_number: initialData?.document_number || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    department: initialData?.department || "",
    postal_code: initialData?.postal_code || "",
    neighborhood: initialData?.neighborhood || "",
    additional_info: initialData?.additional_info || "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ShippingInfoType, string>>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name as keyof ShippingInfoType]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ShippingInfoType, string>> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = "El nombre completo es requerido";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono es requerido";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Ingresa un teléfono válido de 10 dígitos";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Ingresa un email válido";
    }

    if (!formData.document_number.trim()) {
      newErrors.document_number = "El número de documento es requerido";
    }

    if (!formData.address.trim()) {
      newErrors.address = "La dirección es requerida";
    }

    if (!formData.city.trim()) {
      newErrors.city = "La ciudad es requerida";
    }

    if (!formData.department) {
      newErrors.department = "El departamento es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-900">
          📦 <strong>Información de envío:</strong> Por favor completa todos los campos para procesar tu pedido.
        </p>
      </div>

      {/* Nombre completo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre completo <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] ${
            errors.full_name ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Ej: Juan Pérez García"
        />
        {errors.full_name && (
          <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>
        )}
      </div>

      {/* Teléfono y Email */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] ${
              errors.phone ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="3001234567"
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="correo@ejemplo.com"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>
      </div>

      {/* Tipo y número de documento */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de documento <span className="text-red-500">*</span>
          </label>
          <select
            name="document_type"
            value={formData.document_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a5a3f]"
          >
            <option value="cc">Cédula de Ciudadanía</option>
            <option value="ce">Cédula de Extranjería</option>
            <option value="nit">NIT</option>
            <option value="passport">Pasaporte</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de documento <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="document_number"
            value={formData.document_number}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] ${
              errors.document_number ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="1234567890"
          />
          {errors.document_number && (
            <p className="text-red-500 text-xs mt-1">{errors.document_number}</p>
          )}
        </div>
      </div>

      {/* Dirección */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dirección completa <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] ${
            errors.address ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Calle 123 # 45-67"
        />
        {errors.address && (
          <p className="text-red-500 text-xs mt-1">{errors.address}</p>
        )}
      </div>

      {/* Barrio (opcional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Barrio o sector
        </label>
        <input
          type="text"
          name="neighborhood"
          value={formData.neighborhood}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a5a3f]"
          placeholder="Ej: Centro, Chapinero, etc."
        />
      </div>

      {/* Ciudad y Departamento */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ciudad <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] ${
              errors.city ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Ej: Bogotá, Medellín"
          />
          {errors.city && (
            <p className="text-red-500 text-xs mt-1">{errors.city}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Departamento <span className="text-red-500">*</span>
          </label>
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a5a3f] ${
              errors.department ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Seleccionar...</option>
            {colombianDepartments.map(dept => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          {errors.department && (
            <p className="text-red-500 text-xs mt-1">{errors.department}</p>
          )}
        </div>
      </div>

      {/* Código postal (opcional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Código postal (opcional)
        </label>
        <input
          type="text"
          name="postal_code"
          value={formData.postal_code}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a5a3f]"
          placeholder="110111"
        />
      </div>

      {/* Información adicional */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Información adicional (opcional)
        </label>
        <textarea
          name="additional_info"
          value={formData.additional_info}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a5a3f]"
          placeholder="Ej: Casa de color azul, al lado del parque, etc."
        />
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:border-black transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-3 bg-[#4a5a3f] text-white rounded-lg font-medium hover:bg-[#3d4a34] transition-colors"
        >
          Continuar al pago
        </button>
      </div>
    </form>
  );
}

