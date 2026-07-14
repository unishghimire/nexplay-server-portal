import React from 'react'
import { cn } from '../../lib/utils'

export const Spinner = ({ size = 'md', className, ...props }) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-t-transparent border-indigo-500",
        sizes[size],
        className
      )}
      {...props}
    />
  )
}
