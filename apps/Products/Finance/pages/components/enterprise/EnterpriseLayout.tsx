'use client'

import React, { useState } from 'react'
import { EnterpriseNavigation, EnterpriseTopBar } from './EnterpriseNavigation'

interface EnterpriseLayoutProps {
  children: React.ReactNode
}

export function EnterpriseLayout({ children }: EnterpriseLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="enterprise-flex enterprise-h-screen enterprise-bg-gray-50">
      <EnterpriseNavigation 
        isCollapsed={isCollapsed} 
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)} 
      />
      
      {/* Main Content Area */}
      <div 
        className={`enterprise-flex-1 enterprise-flex enterprise-flex-col enterprise-transition-all enterprise-duration-300 ${
          isCollapsed ? 'enterprise-ml-16' : 'enterprise-ml-64'
        }`}
      >
        <EnterpriseTopBar />
        
        {/* Page Content */}
        <main className="enterprise-flex-1 enterprise-overflow-auto enterprise-pt-16">
          <div className="enterprise-p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}