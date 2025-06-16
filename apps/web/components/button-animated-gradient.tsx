"use client"
import { useRef, useState } from "react"
import type React from "react"

interface ButtonAnimatedGradientProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  variant?: "primary" | "secondary" // Added variant prop
}

export const ButtonAnimatedGradient = ({
  children,
  onClick,
  className = "",
  variant = "primary", // Default to primary
}: ButtonAnimatedGradientProps) => {
  const divRef = useRef<HTMLButtonElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!divRef.current || isFocused) return

    const div = divRef.current
    const rect = div.getBoundingClientRect()

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleFocus = () => {
    setIsFocused(true)
    setOpacity(1)
  }

  const handleBlur = () => {
    setIsFocused(false)
    setOpacity(0)
  }

  const handleMouseEnter = () => {
    setOpacity(1)
  }

  const handleMouseLeave = () => {
    setOpacity(0)
  }

  if (variant === "secondary") {
    return (
      <button
        onClick={onClick}
        className={`relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md border border-gray-700 bg-gray-900/50 px-6 font-medium text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-50 ${className}`}
      >
        {children}
      </button>
    )
  }

  return (
    <button
      ref={divRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md border border-gray-800 bg-gradient-to-r from-gray-900 to-gray-950 px-6 font-medium text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-50 ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(300px circle at ${position.x}px ${position.y}px, rgba(255,255,255,.1), #0000000f)`,
        }}
      />
      {children}
    </button>
  )
}
