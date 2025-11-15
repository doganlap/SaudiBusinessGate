'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface NavigationContextType {
  isCollapsed: boolean
  toggleNavigation: () => void
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
  activePath: string
  setActivePath: (path: string) => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activePath, setActivePath] = useState('')

  const toggleNavigation = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <NavigationContext.Provider
      value={{
        isCollapsed,
        toggleNavigation,
        mobileOpen,
        setMobileOpen,
        activePath,
        setActivePath
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}