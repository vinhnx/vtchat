"use client"

import * as React from "react"
import { cn } from "../lib/utils"

interface CustomScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: "default" | "thin" | "hidden"
  orientation?: "vertical" | "horizontal" | "both"
}

const CustomScrollArea = React.forwardRef<HTMLDivElement, CustomScrollAreaProps>(
  ({ className, children, variant = "default", orientation = "vertical", ...props }, ref) => {
    const getScrollClasses = () => {
      switch (variant) {
        case "thin":
          return "thin-scrollbar"
        case "hidden":
          return "no-scrollbar"
        default:
          return "custom-scrollbar"
      }
    }

    const getOrientationClasses = () => {
      switch (orientation) {
        case "horizontal":
          return "overflow-x-auto"
        case "both":
          return "overflow-auto"
        default:
          return "overflow-y-auto"
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative",
          getScrollClasses(),
          getOrientationClasses(),
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CustomScrollArea.displayName = "CustomScrollArea"

export { CustomScrollArea, type CustomScrollAreaProps }
