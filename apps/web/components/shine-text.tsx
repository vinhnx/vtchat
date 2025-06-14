import type React from "react"
interface ShineTextProps {
  children: React.ReactNode
  className?: string
}

export const ShineText = ({ children, className = "" }: ShineTextProps) => {
  return (
    <span
      className={`inline-flex animate-background-shine bg-[linear-gradient(110deg,#939393,45%,#1e293b,55%,#939393)] bg-[length:250%_100%] bg-clip-text text-transparent ${className}`}
    >
      {children}
    </span>
  )
}
