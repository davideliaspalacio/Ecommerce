import * as React from "react"

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
}

function Separator({
  className = "",
  orientation = "horizontal",
  ...props
}: SeparatorProps) {
  return (
    <div
      className={`bg-gray-200 ${
        orientation === "horizontal" ? "h-px w-full" : "w-px h-full"
      } ${className}`}
      {...props}
    />
  )
}

export { Separator }
