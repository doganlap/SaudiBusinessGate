import React from 'react';
import EnterpriseHeader from './EnterpriseHeader';
import EnterpriseFooter from './EnterpriseFooter';
import CollapsibleSidebar from './CollapsibleSidebar';
import RightAgentPanel from './RightAgentPanel';

/**
 * ==========================================
 * MASTER LAYOUT - MAIN APPLICATION LAYOUT
 * ==========================================
 * 
 * Features:
 * - Auto-hide collapsible sidebar (default: collapsed)
 * - Enterprise header with all features
 * - Professional footer
 * - Proper content alignment
 * - Responsive design
 * - Theme support
 */

export const MasterLayout = ({ children }) => (
  <div
    style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      backgroundColor: 'var(--bg)',
      transition: 'background-color 0.3s ease',
      position: 'relative'
    }}
  >
    {/* Collapsible Sidebar - Auto-hide by default */}
    <CollapsibleSidebar />
    
    {/* Main Content Area */}
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minWidth: 0 // Important for flex child with overflow
      }}
    >
      {/* Enterprise Header */}
      <EnterpriseHeader systemHealth="healthy" />
      
      {/* Main Content */}
      <main
        style={{
          flex: 1,
          overflow: 'auto',
          backgroundColor: 'var(--bg)',
          transition: 'background-color 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        {/* Content Container - Properly aligned */}
        <div style={{ 
          flex: 1,
          maxWidth: '100%',
          margin: '0 auto',
          width: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {children}
        </div>
        
        {/* Enterprise Footer */}
        <EnterpriseFooter language="en" />
      </main>
    </div>

    {/* Right Agent Panel - 6-Agent AI System */}
    <RightAgentPanel />
  </div>
);

export default MasterLayout;
