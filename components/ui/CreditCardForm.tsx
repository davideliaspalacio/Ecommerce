"use client";

import { useState } from "react";
import { CreditCard, Lock } from "lucide-react";

interface CreditCardFormProps {
  onSubmit: (cardData: any) => void;
  onCancel: () => void;
  isProcessing: boolean;
}

export default function CreditCardForm({
  onSubmit,
  onCancel,
  isProcessing,
}: CreditCardFormProps) {
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: "",
    expMonth: "",
    expYear: "",
    cvv: "",
    docType: "CC",
    docNumber: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Formatear número de tarjeta
    if (name === "cardNumber") {
      const cleaned = value.replace(/\s/g, "");
      const formatted = cleaned.replace(/(\d{4})/g, "$1 ").trim();
      setFormData({ ...formData, [name]: formatted });
      return;
    }
    
    // Limitar CVV a 3-4 dígitos
    if (name === "cvv" && value.length > 4) {
      return;
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validar campos
    const cardNumberClean = formData.cardNumber.replace(/\s/g, "");
    
    if (cardNumberClean.length < 15 || cardNumberClean.length > 16) {
      setError("Número de tarjeta inválido");
      return;
    }
    
    if (formData.cvv.length < 3) {
      setError("CVV inválido");
      return;
    }
    
    if (!formData.expMonth || !formData.expYear) {
      setError("Fecha de expiración inválida");
      return;
    }

    if (!formData.docNumber) {
      setError("Número de documento requerido");
      return;
    }

    if (!formData.cardName) {
      setError("Nombre en la tarjeta requerido");
      return;
    }

    // Enviar los datos de la tarjeta al componente padre
    // El backend se encargará de la tokenización y procesamiento
    onSubmit({
      card_number: cardNumberClean,
      card_exp_year: formData.expYear,
      card_exp_month: formData.expMonth,
      card_cvc: formData.cvv,
      card_name: formData.cardName,
      doc_type: formData.docType,
      doc_number: formData.docNumber,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Número de tarjeta */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Número de tarjeta
        </label>
        <div className="relative">
          <input
            type="text"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleInputChange}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            required
            disabled={isProcessing}
            className="w-full px-4 py-3 border border-gray-300 rounded-1xl focus:ring-2 focus:ring-[#4a5a3f] focus:border-transparent disabled:bg-gray-100"
          />
          <CreditCard className="absolute right-3 top-3 h-6 w-6 text-gray-400" />
        </div>
      </div>

      {/* Nombre en la tarjeta */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Nombre en la tarjeta
        </label>
        <input
          type="text"
          name="cardName"
          value={formData.cardName}
          onChange={handleInputChange}
          placeholder="JUAN PEREZ"
          required
          disabled={isProcessing}
          className="w-full px-4 py-3 border border-gray-300 rounded-1xl focus:ring-2 focus:ring-[#4a5a3f] focus:border-transparent uppercase disabled:bg-gray-100"
        />
      </div>

      {/* Fecha de expiración y CVV */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium mb-2">Mes</label>
          <select
            name="expMonth"
            value={formData.expMonth}
            onChange={handleInputChange}
            required
            disabled={isProcessing}
            className="w-full px-4 py-3 border border-gray-300 rounded-1xl focus:ring-2 focus:ring-[#4a5a3f] focus:border-transparent disabled:bg-gray-100"
          >
            <option value="">MM</option>
            {Array.from({ length: 12 }, (_, i) => {
              const month = (i + 1).toString().padStart(2, "0");
              return (
                <option key={month} value={month}>
                  {month}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Año</label>
          <select
            name="expYear"
            value={formData.expYear}
            onChange={handleInputChange}
            required
            disabled={isProcessing}
            className="w-full px-4 py-3 border border-gray-300 rounded-1xl focus:ring-2 focus:ring-[#4a5a3f] focus:border-transparent disabled:bg-gray-100"
          >
            <option value="">AA</option>
            {Array.from({ length: 15 }, (_, i) => {
              const year = (new Date().getFullYear() + i).toString().slice(-2);
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">CVV</label>
          <input
            type="text"
            name="cvv"
            value={formData.cvv}
            onChange={handleInputChange}
            placeholder="123"
            maxLength={4}
            required
            disabled={isProcessing}
            className="w-full px-4 py-3 border border-gray-300 rounded-1xl focus:ring-2 focus:ring-[#4a5a3f] focus:border-transparent disabled:bg-gray-100"
          />
        </div>
      </div>

      {/* Información del titular */}
      <div className="border-t pt-4 mt-4">
        <h3 className="font-medium mb-3">Información del titular</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de documento</label>
            <select
              name="docType"
              value={formData.docType}
              onChange={handleInputChange}
              required
              disabled={isProcessing}
              className="w-full px-4 py-3 border border-gray-300 rounded-1xl focus:ring-2 focus:ring-[#4a5a3f] focus:border-transparent disabled:bg-gray-100"
            >
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="CE">Cédula de Extranjería</option>
              <option value="NIT">NIT</option>
              <option value="TI">Tarjeta de Identidad</option>
              <option value="PP">Pasaporte</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Número de documento</label>
            <input
              type="text"
              name="docNumber"
              value={formData.docNumber}
              onChange={handleInputChange}
              placeholder="123456789"
              required
              disabled={isProcessing}
              className="w-full px-4 py-3 border border-gray-300 rounded-1xl focus:ring-2 focus:ring-[#4a5a3f] focus:border-transparent disabled:bg-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Seguridad */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center gap-2 text-sm text-black">
          <Lock className="h-4 w-4" />
          <span>Transacción segura procesada por ePayco</span>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:border-black transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isProcessing}
          className="flex-1 px-4 py-3 bg-[#4a5a3f] text-white rounded-lg font-medium hover:bg-[#3d4a34] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Procesando...
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5" />
              Pagar Ahora
            </>
          )}
        </button>
      </div>
    </form>
  );
}

