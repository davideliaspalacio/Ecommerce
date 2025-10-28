import Image from "next/image";

interface CartLoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
}

export default function CartLoadingSpinner({ size = "md" }: CartLoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} animate-spin`}>
        <Image
          src="/favicon.png"
          alt="Loading..."
          width={size === "sm" ? 16 : size === "md" ? 24 : 32}
          height={size === "sm" ? 16 : size === "md" ? 24 : 32}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
