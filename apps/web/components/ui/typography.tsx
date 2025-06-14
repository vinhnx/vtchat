import type React from "react"

interface TypographyProps {
  children: React.ReactNode
  className?: string
}

export const TypographyH2 = ({ children, className = "" }: TypographyProps) => {
  return (
    <h2 className={`scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 ${className}`}>
      {children}
    </h2>
  )
}

export const TypographyLarge = ({ children, className = "" }: TypographyProps) => {
  return (
    <div className={`text-lg font-semibold ${className}`}>
      {children}
    </div>
  )
}

export const TypographyP = ({ children, className = "" }: TypographyProps) => {
  return (
    <p className={`leading-7 [&:not(:first-child)]:mt-6 ${className}`}>
      {children}
    </p>
  )
}

export const TypographyMuted = ({ children, className = "" }: TypographyProps) => {
  return (
    <p className={`text-sm text-muted-foreground ${className}`}>
      {children}
    </p>
  )
}
