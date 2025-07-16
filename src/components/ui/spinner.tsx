"use client"

import React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg"
  text?: string
  fullScreen?: boolean
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6", 
  lg: "h-8 w-8"
}

export function Spinner({ className, size = "md", text, fullScreen = false }: SpinnerProps) {
  const spinner = (
    <div className={cn("flex items-center gap-2", fullScreen && "justify-center min-h-screen")}>
      <Loader2 className={cn("animate-spin", sizeClasses[size], className)} />
      {text && <span className="text-muted-foreground">{text}</span>}
    </div>
  )

  return spinner
}