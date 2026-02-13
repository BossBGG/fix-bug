"use client"

import * as React from "react"

interface CustomTooltipProps {
  children: React.ReactNode
  fieldValue?: string
  fieldLabel: string
  variant?: 'label' | 'table' | 'textarea' | 'select'
}

export function CustomTooltip({ 
  children, 
  fieldValue,
  fieldLabel,
  variant = 'label'
}: CustomTooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [opacity, setOpacity] = React.useState(0)
  const [position, setPosition] = React.useState({ top: 0, left: 0 })
  const containerRef = React.useRef<HTMLDivElement>(null)
  const displayText = fieldValue || fieldLabel

  const handleClick = () => {
    setIsVisible(false)
    setOpacity(0)
  }

  const handleMouseEnter = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setPosition({ top: rect.bottom + 5, left: rect.left })
    }
    setIsVisible(true)
    setTimeout(() => setOpacity(1), 10)
  }

  const handleMouseLeave = () => {
    setOpacity(0)
    setTimeout(() => setIsVisible(false), 200)
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}
      {isVisible && (
        <div 
          className="fixed z-[9999] pointer-events-none transition-opacity duration-200"
          style={{ top: `${position.top}px`, left: `${position.left}px`, opacity }}
        >
          <div className="bg-gray-900/95 text-white rounded px-1.5 py-1 text-xs max-w-xs break-words">
            {displayText}
          </div>
        </div>
      )}
    </div>
  )
}
