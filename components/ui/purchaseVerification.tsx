import { useState } from "react";
import SuccessModal from "./successModal";

interface PurchaseVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseComplete: () => void;
  onCloseCart?: () => void;
}

export default function PurchaseVerification({ isOpen, onClose, onPurchaseComplete, onCloseCart }: PurchaseVerificationProps) {
  const [isPurchaseModalClosing, setIsPurchaseModalClosing] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const closePurchaseModal = () => {
    setIsPurchaseModalClosing(true);
  };
  const openSuccessModal = () => {
    setIsSuccessModalOpen(true);
  };
  const handleNeedHelp = () => {
    closePurchaseModal();
    const helpMessage = encodeURIComponent('¡Hola! Necesito ayuda adicional con mi compra. ¿Podrían asistirme?');
    const phoneNumber = '573182600115';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${helpMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePurchaseComplete = () => {
    onPurchaseComplete();
    closePurchaseModal();
    openSuccessModal();

  };

  if (!isOpen) return null;

  return (
    <>
    <div
      className={`fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 ${
        isPurchaseModalClosing ? "animate-fade-out" : "animate-fade-in"
      }`}
      onClick={closePurchaseModal}
    >
      <div
        className={`bg-white w-full max-w-md rounded-2xl shadow-2xl ${
          isPurchaseModalClosing ? "animate-scale-out" : "animate-scale-in"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#4a5a3f] text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-xl font-bold">¿CÓMO VA TU COMPRA?</h2>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¡WhatsApp abierto!
            </h3>
            <p className="text-gray-600 text-sm">
              Te hemos redirigido a WhatsApp para completar tu compra. ¿Ya
              finalizaste tu pedido o necesitas ayuda adicional?
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handlePurchaseComplete}
              className="w-full bg-green-600 text-white py-3 font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>SÍ, YA COMPRÉ</span>
            </button>

            <button
              onClick={handleNeedHelp}
              className="w-full bg-[#4a5a3f] text-white py-3 font-medium rounded-lg hover:bg-[#3d4a34] transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
              </svg>
              <span>NECESITO AYUDA</span>
            </button>

            <button
              onClick={closePurchaseModal}
              className="w-full border border-gray-300 text-gray-700 py-3 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              CERRAR
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <SuccessModal />
      )}

    </>
  );
}
