import * as React from "react"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

function Card({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`bg-white rounded-1xl border border-gray-200 shadow-sm ${className}`}
      {...props}
    />
  )
}

function CardHeader({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`px-6 pt-6 ${className}`}
      {...props}
    />
  )
}

function CardTitle({ className = "", ...props }: CardProps) {
  return (
    <h3
      className={`text-lg font-semibold leading-none ${className}`}
      {...props}
    />
  )
}

function CardDescription({ className = "", ...props }: CardProps) {
  return (
    <p
      className={`text-sm text-gray-600 mt-1 ${className}`}
      {...props}
    />
  )
}

function CardContent({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`px-6 py-4 ${className}`}
      {...props}
    />
  )
}

function CardFooter({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`px-6 pb-6 ${className}`}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
}
