import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline" | "secondary"
}

function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variantClasses = {
    default: "bg-green-100 text-green-800 hover:bg-green-200",
    outline: "border border-gray-200 text-gray-600 hover:bg-gray-100",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  }
  
  return (
    <div
      className={`
        inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    />
  )
}

export { Badge }