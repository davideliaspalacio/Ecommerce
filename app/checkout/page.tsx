"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCartStore } from "@/store/cartStore";
import { getCurrentPrice, isDiscountActive, getDiscountPercentage } from "@/components/types/Product";
import { ShippingInfoType } from "@/components/types/Order";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Truck, CreditCard, Lock, Check  } from "lucide-react";
import CreditCardForm from "@/components/ui/CreditCardForm";
import PaymentSuccessModal from "@/components/ui/PaymentSuccessModal";

const colombianDepartments = [
  "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bolívar", "Boyacá",
  "Caldas", "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó", "Córdoba",
  "Cundinamarca", "Guainía", "Guaviare", "Huila", "La Guajira", "Magdalena",
  "Meta", "Nariño", "Norte de Santander", "Putumayo", "Quindío", "Risaralda",
  "San Andrés y Providencia", "Santander", "Sucre", "Tolima", "Valle del Cauca",
  "Vaupés", "Vichada"
];

const SHIPPING_COST = 15000;

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { cart, getTotal, clearCart } = useCartStore();
  const [step, setStep] = useState<'shipping' | 'review' | 'payment'>('shipping');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  
  const [formData, setFormData] = useState<ShippingInfoType>({
    full_name: "",
    phone: "",
    email: user?.email || "",
    document_type: "cc",
    document_number: "",
    address: "",
    city: "",
    department: "",
    postal_code: "",
    neighborhood: "",
    additional_info: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ShippingInfoType, string>>>({});

  // Redirigir si no hay usuario o carrito vacío (pero NUNCA si estamos mostrando el modal)
  useEffect(() => {
    console.log('🔍 useEffect ejecutándose:', { user: !!user, cartLength: cart.length, paymentCompleted, showSuccessModal });
    
    if (!user) {
      console.log('❌ No hay usuario, redirigiendo...');
      router.push("/");
      return;
    }
    
    // Solo redirigir si no hay carrito Y no estamos mostrando el modal de éxito
    if (cart.length === 0 && !showSuccessModal) {
      console.log('❌ Carrito vacío y sin modal, redirigiendo...');
      router.push("/");
      return;
    }
    
    console.log('✅ No redirigiendo, condiciones OK');
  }, [user, cart, router, showSuccessModal]);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const handleContinueToReview = () => {
    if (validate()) {
      setStep('review');
    }
  };

  const handleContinueToPayment = async () => {
    if (!user || cart.length === 0) {
      setError("Error al procesar el pago. Por favor intenta nuevamente.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const subtotal = getTotal();
      const tax = Math.round(subtotal * 0.19);
      const total = subtotal + tax + SHIPPING_COST;

      const orderResponse = await fetch("/api/epayco/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          user_email: user.email,
          user_name: user.user_metadata?.full_name || user.email?.split("@")[0],
          user_phone: user.user_metadata?.phone || "",
          shipping_info: formData,
          items: cart,
          subtotal,
          tax,
          shipping_cost: SHIPPING_COST,
          total,
          payment_method: "epayco",
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Error al crear la orden");
      }

      const { order } = await orderResponse.json();
      setCreatedOrderId(order.id);
      
      // Avanzar al paso de pago
      setStep('payment');
    } catch (err: any) {
      console.error("Error creando orden:", err);
      setError(err.message || "Error al crear la orden");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardSubmit = async (cardData: any) => {
    if (!createdOrderId) {
      setError("Error: No se encontró la orden");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Procesar el pago con los datos de la tarjeta
      const paymentResponse = await fetch("/api/epayco/process-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: createdOrderId,
          card_data: {
            card_number: cardData.card_number,
            card_exp_year: cardData.card_exp_year,
            card_exp_month: cardData.card_exp_month,
            card_cvc: cardData.card_cvc,
          },
          customer_data: {
            doc_type: cardData.doc_type,
            doc_number: cardData.doc_number,
            name: formData.full_name.split(' ')[0],
            last_name: formData.full_name.split(' ').slice(1).join(' ') || '',
            email: formData.email,
            phone: formData.phone,
            cell_phone: formData.phone,
          },
          dues: '1', // Pago en una sola cuota
        }),
      });

      const result = await paymentResponse.json();
      
      console.log('Resultado del pago:', result);

      if (!result.success) {
        // Mostrar información de debug si está disponible
        const errorMessage = result.message || result.error || "Error procesando el pago";
        const errorDetails = result.details ? ` (${result.details})` : '';
        
        console.error('Error en el pago:', {
          error: result.error,
          message: result.message,
          details: result.details,
          debug: result.debug,
        });
        
        setError(errorMessage + errorDetails);
        return;
      }

      // Pago exitoso
      if (result.payment_status === 'approved') {
        console.log('🎉 Pago aprobado, mostrando modal...', result.data);
        
        // Guardar datos del pago y mostrar modal PRIMERO
        setPaymentData(result.data);
        setShowSuccessModal(true);
        
        console.log('✅ Modal configurado, estado:', { showSuccessModal: true, paymentData: !!result.data });
        
        // NO limpiar el carrito automáticamente - que lo haga el modal
        // clearCart();
      } else if (result.payment_status === 'pending') {
        // Pago pendiente
        setError("Tu pago está pendiente de confirmación. Te notificaremos cuando se procese.");
        
        setTimeout(() => {
          router.push(`/my-orders/${createdOrderId}`);
        }, 2000);
      } else {
        // Pago rechazado
        setError(result.data?.respuesta || "El pago fue rechazado. Por favor verifica los datos de tu tarjeta.");
      }
    } catch (err: any) {
      console.error("Error procesando pago:", err);
      setError(err.message || "Error al procesar el pago. Por favor verifica tu conexión e intenta nuevamente.");
      
      // Log adicional para debugging
      console.error('Stack trace:', err.stack);
    } finally {
      setIsProcessing(false);
    }
  };

  const subtotal = getTotal();
  const tax = Math.round(subtotal * 0.19);
  const total = subtotal + tax + SHIPPING_COST;
  
  // Calcular ahorro total
  const totalSavings = cart.reduce((acc, item) => {
    if (isDiscountActive(item.product)) {
      const originalPrice = item.product.original_price || getCurrentPrice(item.product);
      const currentPrice = getCurrentPrice(item.product);
      return acc + ((originalPrice - currentPrice) * item.quantity);
    }
    return acc;
  }, 0);

  if (!user || cart.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="gap-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Volver a la tienda</span>
            <span className="sm:hidden">Volver</span>
          </Button>
          <div className="flex items-center gap-2 text-green-600">
            <Lock className="h-4 w-4" />
            <span className="text-sm font-medium hidden sm:inline">Pago seguro</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`flex items-center gap-1 transition-colors ${step === 'shipping' ? 'text-black' : 'text-[#3d4a34]'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step === 'shipping' ? 'bg-[#3d4a34] text-white' : 'bg-[#3d4a34] text-white'}`}>
                {(step === 'review' || step === 'payment') ? <Check className="h-4 w-4" /> : '1'}
              </div>
              <span className="font-medium text-xs sm:text-sm hidden sm:inline">Envío</span>
            </div>
            <div className="flex-1 h-[2px] bg-gray-300">
              <div className={`h-full transition-all duration-500 ${(step === 'review' || step === 'payment') ? 'bg-[#3d4a34] w-full' : 'bg-[#3d4a34] w-0'}`}></div>
            </div>
            <div className={`flex items-center gap-1 transition-colors ${step === 'review' ? 'text-black' : (step === 'payment' ? 'text-[#3d4a34]' : 'text-gray-400')}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step === 'review' ? 'bg-[#3d4a34] text-white' : (step === 'payment' ? 'bg-[#3d4a34] text-white' : 'bg-gray-300')}`}>
                {step === 'payment' ? <Check className="h-4 w-4" /> : '2'}
              </div>
              <span className="font-medium text-xs sm:text-sm hidden sm:inline">Revisar</span>
            </div>
            <div className="flex-1 h-[2px] bg-gray-300">
              <div className={`h-full transition-all duration-500 ${step === 'payment' ? 'bg-[#3d4a34] w-full' : 'bg-[#3d4a34] w-0'}`}></div>
            </div>
            <div className={`flex items-center gap-1 transition-colors ${step === 'payment' ? 'text-black' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step === 'payment' ? 'bg-[#3d4a34] text-white' : 'bg-gray-300'}`}>
                3
              </div>
              <span className="font-medium text-xs sm:text-sm hidden sm:inline">Pagar</span>
            </div>
          </div>

          {step === 'shipping' ? (
            <Card className="border border-gray-200">
              <CardHeader className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Truck className="h-5 w-5" />
                  Información de envío
                </CardTitle>
                <CardDescription className="text-sm">
                  Ingresa la dirección donde deseas recibir tu pedido
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {/* Nombre completo */}
                <div className="space-y-2">
                  <Label htmlFor="full_name">
                    Nombre completo <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Juan Pérez García"
                    className={errors.full_name ? "border-red-500" : ""}
                  />
                  {errors.full_name && (
                    <p className="text-red-500 text-sm">{errors.full_name}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                  )}
                </div>

                {/* Teléfono */}
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Teléfono <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="3001234567"
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm">{errors.phone}</p>
                  )}
                </div>

                {/* Tipo de documento */}
                <div className="space-y-2">
                  <Label htmlFor="document_type">
                    Tipo de documento <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="document_type"
                    name="document_type"
                    value={formData.document_type}
                    onChange={handleChange}
                    className="flex h-9 w-full rounded-1xl border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm transition-colors outline-none focus:border-black focus:ring-1 focus:ring-black"
                  >
                    <option value="cc">Cédula de Ciudadanía</option>
                    <option value="ce">Cédula de Extranjería</option>
                    <option value="nit">NIT</option>
                    <option value="passport">Pasaporte</option>
                  </select>
                </div>

                {/* Número de documento */}
                <div className="space-y-2">
                  <Label htmlFor="document_number">
                    Número de documento <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="document_number"
                    name="document_number"
                    value={formData.document_number}
                    onChange={handleChange}
                    placeholder="1234567890"
                    className={errors.document_number ? "border-red-500" : ""}
                  />
                  {errors.document_number && (
                    <p className="text-red-500 text-sm">{errors.document_number}</p>
                  )}
                </div>

                {/* Dirección */}
                <div className="space-y-2">
                  <Label htmlFor="address">
                    Dirección completa <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Calle 123 # 45-67"
                    className={errors.address ? "border-red-500" : ""}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm">{errors.address}</p>
                  )}
                </div>

                {/* Ciudad */}
                <div className="space-y-2">
                  <Label htmlFor="city">
                    Ciudad <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Bogotá"
                    className={errors.city ? "border-red-500" : ""}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm">{errors.city}</p>
                  )}
                </div>

                {/* Barrio */}
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Barrio o sector</Label>
                  <Input
                    id="neighborhood"
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleChange}
                    placeholder="Ej: Centro, Chapinero"
                  />
                </div>

                {/* Departamento */}
                <div className="space-y-2">
                  <Label htmlFor="department">
                    Departamento <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={`flex h-9 w-full rounded-1xl border bg-white px-3 py-1 text-sm shadow-sm transition-colors outline-none focus:border-black focus:ring-1 focus:ring-black ${errors.department ? "border-red-500" : "border-gray-300"}`}
                  >
                    <option value="">Seleccionar...</option>
                    {colombianDepartments.map(dept => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="text-red-500 text-sm">{errors.department}</p>
                  )}
                </div>

                {/* Código postal */}
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Código postal (opcional)</Label>
                  <Input
                    id="postal_code"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    placeholder="110111"
                  />
                </div>

                {/* Información adicional */}
                <div className="space-y-2">
                  <Label htmlFor="additional_info">Información adicional (opcional)</Label>
                  <textarea
                    id="additional_info"
                    name="additional_info"
                    value={formData.additional_info}
                    onChange={handleChange}
                    rows={3}
                    className="flex w-full rounded-1xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 outline-none focus:border-black focus:ring-1 focus:ring-black"
                    placeholder="Ej: Casa de color azul, al lado del parque"
                  />
                </div>
              </CardContent>
              <CardFooter className="pt-4">
                <Button 
                  onClick={handleContinueToReview}
                  className="w-full !bg-[#3d4a34] !hover:bg-[#3d4a34] text-white cursor-pointer"
                  size="lg"
                >
                  Continuar
                </Button>
              </CardFooter>
            </Card>
          ) : step === 'review' ? (
            <Card className="border border-gray-200">
              <CardHeader className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Check className="h-5 w-5" />
                  Revisar pedido
                </CardTitle>
                <CardDescription className="text-sm">
                  Verifica tu información antes de proceder al pago
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-4">
                {/* Resumen de envío */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Envío a:
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep('shipping')}
                      className="text-sm h-auto p-1 hover:bg-gray-100"
                    >
                      Editar
                    </Button>
                  </div>
                  <div className="text-sm text-gray-700 space-y-1 bg-gray-50 p-3 rounded-md">
                    <p className="font-medium">{formData.full_name}</p>
                    <p>{formData.email}</p>
                    <p>{formData.address}</p>
                    <p>
                      {formData.neighborhood && `${formData.neighborhood}, `}
                      {formData.city}, {formData.department}
                    </p>
                    {formData.postal_code && <p>Codigo Postal: {formData.postal_code}</p>}
                  </div>
                </div>

                {/* Resumen del pedido */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Resumen del pedido</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cart.map((item, index) => {
                      const hasDiscount = isDiscountActive(item.product);
                      const currentPrice = getCurrentPrice(item.product);
                      const originalPrice = item.product.original_price || currentPrice;
                      
                      return (
                        <div
                          key={`${item.product.id}-${item.size}-${index}`}
                          className="pb-3 border-b last:border-0"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                              <p className="text-xs text-gray-500">Talla: {item.size} • Cantidad: {item.quantity}</p>
                            </div>
                            {hasDiscount && (
                              <Badge variant="destructive" className="ml-2 text-xs">
                                -{getDiscountPercentage(item.product)}% OFF
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                              {hasDiscount && (
                                <span className="text-xs text-gray-400 line-through">
                                  ${(originalPrice * item.quantity).toLocaleString("es-CO")}
                                </span>
                              )}
                              <span className={`text-sm font-semibold ${hasDiscount ? 'text-[#3d4a34]' : 'text-gray-900'}`}>
                                ${(currentPrice * item.quantity).toLocaleString("es-CO")}
                              </span>
                            </div>
                            {hasDiscount && (
                              <span className="text-xs text-[#3d4a34] font-medium">
                                Ahorras ${((originalPrice - currentPrice) * item.quantity).toLocaleString("es-CO")}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {/* Desglose de precio */}
                <div className="space-y-2 text-sm">
                  {totalSavings > 0 && (
                    <div className="flex justify-between bg-green-50 -mx-3 px-3 py-2 rounded-md">
                      <span className="text-[#3d4a34] font-medium"> Ahorro total en promociones</span>
                      <span className="font-bold text-[#3d4a34]">-${totalSavings.toLocaleString("es-CO")}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${subtotal.toLocaleString("es-CO")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Envío</span>
                    <span className="font-medium">${SHIPPING_COST.toLocaleString("es-CO")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">IVA (19%)</span>
                    <span className="font-medium">${tax.toLocaleString("es-CO")}</span>
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="bg-gray-50 -mx-6 px-6 py-4 rounded-b-lg">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total a pagar</span>
                    <span className="text-[#3d4a34]">${total.toLocaleString("es-CO")}</span>
                  </div>
                  {totalSavings > 0 && (
                    <p className="text-xs text-[#3d4a34] mt-1 text-right">
                      ¡Estás ahorrando ${totalSavings.toLocaleString("es-CO")}! 
                    </p>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex-col space-y-3 pt-4">
                <Button
                  onClick={handleContinueToPayment}
                  disabled={isProcessing}
                  className="w-full !bg-[#3d4a34] !hover:bg-[#3d4a34] text-white cursor-pointer"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Continuar a pago
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setStep('shipping')}
                  disabled={isProcessing}
                  className="w-full cursor-pointer"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver
                  </Button>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <Lock className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">Pago seguro procesado por</span>
                    <img 
                      src="/logoEpayco.png" 
                      alt="ePayco" 
                      className="h-5 w-auto"
                    />
                  </div>
                </CardFooter>
            </Card>
          ) : step === 'payment' ? (
            <Card className="border border-gray-200">
              <CardHeader className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Lock className="h-5 w-5" />
                  Pagar con tarjeta
                </CardTitle>
                <CardDescription className="text-sm">
                  Pago seguro procesado por ePayco
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {/* Resumen compacto */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total a pagar</span>
                    <span className="text-lg font-bold text-[#3d4a34]">
                      ${total.toLocaleString("es-CO")}
                    </span>
                  </div>
                </div>

                {/* Formulario de tarjeta */}
                <CreditCardForm
                  onSubmit={handleCardSubmit}
                  onCancel={() => setStep('review')}
                  isProcessing={isProcessing}
                />

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </main>

      {/* Modal de éxito de pago */}
      {console.log('🔍 Estado del modal:', { showSuccessModal, paymentData: !!paymentData })}
      {showSuccessModal && paymentData && (
        <PaymentSuccessModal
          isOpen={showSuccessModal}
          onClose={() => {
            console.log('🚪 Usuario cerró el modal...');
            setShowSuccessModal(false);
            // Redirigir después de cerrar el modal
            setTimeout(() => {
              router.push('/');
            }, 300);
          }}
          onClearCart={() => {
            console.log('🛒 Limpiando carrito desde modal...');
            clearCart();
          }}
          data={paymentData}
          total={getTotal() + Math.round(getTotal() * 0.19) + SHIPPING_COST}
        />
      )}
    </div>
  );
}

