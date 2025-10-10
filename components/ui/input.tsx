import * as React from "react"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

function Input({ className = "", type = "text", ...props }: InputProps) {
  return (
    <input
      type={type}
      className={`h-9 w-full rounded-1xl border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm transition-colors outline-none placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  )
}

export { Input }
