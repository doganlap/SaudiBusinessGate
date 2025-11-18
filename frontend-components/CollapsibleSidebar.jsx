import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, LayoutDashboard, FileCheck, Shield, FolderOpen, Scale,
  GitBranch, CheckSquare, Users, Building2, FileText, Key,
  Workflow, Clock, BarChart3, TrendingDown, FileDown,
  Target, MessageSquare, Upload,
  Bot, Brain, Cpu, MessageCircle, Edit, BarChart2,
  Activity, Database, Eye, ShieldAlert, HardDrive,
  Plug, Mail, Package, Palette, Settings as SettingsIcon,
  HeartPulse, ChevronRight, ChevronLeft
} from 'lucide-react';

/**
 * ==========================================
 * COLLAPSIBLE SIDEBAR - AUTO-HIDE
 * ==========================================
 * 
 * Features:
 * - Auto-hide by default
 * - Icon-only mode when collapsed
 * - Full mode when expanded
 * - Smooth animations
 * - Grouped icons
 * - Sub-items visible
 */

// Navigation sections with professional icons
const NAVIGATION_SECTIONS = {
  main: {
    title: 'Main Navigation',
    Icon: Home,
    links: [
      { name: 'Real Data Dashboard', path: '/dashboard', Icon: Home },
      { name: 'Executive Dashboard', path: '/executive', Icon: LayoutDashboard }
    ]
  },
  assessments: {
    title: 'Assessment Management',
    Icon: FileCheck,
    links: [
      { name: 'All Assessments', path: '/db/assessments', Icon: BarChart3 },
      { name: 'Frameworks', path: '/db/frameworks', Icon: FileCheck },
      { name: 'Controls', path: '/db/controls', Icon: Shield },
      { name: 'Evidence Manager', path: '/evidence', Icon: FolderOpen },
      { name: 'Regulators', path: '/db/regulators', Icon: Scale }
    ]
  },
  assessmentProcess: {
    title: 'Assessment Process',
    Icon: Workflow,
    links: [
      { name: 'Assessment Workflow', path: '/workflow/assessments', Icon: Workflow },
      { name: 'Enhanced Assessment UX', path: '/workflow/assessments/enhanced', Icon: Activity },
      { name: 'Assessment Templates', path: '/assessment/templates', Icon: CheckSquare },
      { name: 'Response Management', path: '/assessment/responses', Icon: FileText },
      { name: 'Control Mapping', path: '/assessment/mapping', Icon: GitBranch },
      { name: 'Scheduling', path: '/assessment/scheduling', Icon: Clock }
    ]
  },
  reporting: {
    title: 'Reporting & Analytics',
    Icon: BarChart2,
    links: [
      { name: 'Compliance Reports', path: '/compliance/reporting', Icon: BarChart2 },
      { name: 'Risk Dashboard', path: '/reporting/risk-dashboard', Icon: TrendingDown },
      { name: 'Compliance Metrics', path: '/reporting/metrics', Icon: BarChart3 },
      { name: 'Audit Reports', path: '/reporting/audit', Icon: FileText },
      { name: 'Export & Download', path: '/reporting/export', Icon: FileDown }
    ]
  },
  collaboration: {
    title: 'Team Collaboration',
    Icon: Users,
    links: [
      { name: 'Customer Onboarding', path: '/collaboration/onboarding', Icon: Target },
      { name: 'Import Organizations', path: '/collaboration/import', Icon: Upload },
      { name: 'Teams', path: '/db/teams', Icon: Users },
      { name: 'Organizations', path: '/db/organizations', Icon: Building2 },
      { name: 'Responsibilities', path: '/db/responsibilities', Icon: FileText },
      { name: 'Authorities', path: '/db/authorities', Icon: Key },
      { name: 'Task Assignment', path: '/collaboration/tasks', Icon: CheckSquare },
      { name: 'Comments & Notes', path: '/collaboration/comments', Icon: MessageSquare }
    ]
  },
  // AI section moved to RightAgentPanel
  admin: {
    title: 'Admin & System Tools',
    Icon: SettingsIcon,
    links: [
      { name: 'System Health Check', path: '/admin/health-check', Icon: HeartPulse },
      { name: '📊 Component Registry', path: '/admin/component-registry', Icon: BarChart3, badge: 'NEW' },
      { name: '⚙️ Process Manager', path: '/admin/process-manager', Icon: Activity, badge: 'NEW' },
      { name: 'User Management', path: '/admin/users', Icon: Users },
      { name: 'Database Manager', path: '/admin/database', Icon: Database },
      { name: 'System Monitor', path: '/admin/monitor', Icon: Activity },
      { name: 'Audit Logs Viewer', path: '/admin/audit-logs', Icon: Eye },
      { name: 'Security Settings', path: '/admin/security', Icon: ShieldAlert },
      { name: 'Backup & Restore', path: '/admin/backup', Icon: HardDrive },
      { name: 'API Manager', path: '/admin/api-manager', Icon: Plug },
      { name: 'Email Configuration', path: '/admin/email-config', Icon: Mail },
      { name: 'Vendor Management', path: '/db/vendors', Icon: Package },
      { name: 'Theme Designer', path: '/themes', Icon: Palette },
      { name: 'System Settings', path: '/admin/settings', Icon: SettingsIcon }
    ]
  },
  demo: {
    title: '🎨 Demo & Examples',
    Icon: Palette,
    color: '#F59E0B',
    badge: 'DEMO',
    links: [
      { name: '🎨 Theme Showcase', path: '/themes', Icon: Palette },
      { name: '📊 Analytics Demo', path: '/analytics', Icon: BarChart2 },
      { name: '🌐 Web3 Demo', path: '/web3', Icon: Cpu },
      { name: '🚀 Advanced Demo', path: '/advanced', Icon: Activity },
      { name: '⚙️ Settings Demo', path: '/settings', Icon: SettingsIcon }
    ]
  }
};

const CollapsibleSidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true); // Default: collapsed/hidden
  const [expandedSections, setExpandedSections] = useState({
    main: false,
    assessments: false,
    assessmentProcess: false,
    reporting: false,
    collaboration: false,
    ai: false,
    admin: false,
    demo: false
  });
  const [hoveredLink, setHoveredLink] = useState(null);
  const [hoveredSection, setHoveredSection] = useState(null);

  // Auto-hide on route change (mobile behavior)
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsCollapsed(true);
    }
  }, [location]);

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div
          onClick={() => setIsCollapsed(true)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 998,
            display: window.innerWidth < 1024 ? 'block' : 'none'
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: isCollapsed ? '64px' : '280px',
          height: '100vh',
          backgroundColor: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '4px 0 12px rgba(0,0,0,0.05)',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          zIndex: 999
        }}
      >
        {/* Toggle Button */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: isCollapsed ? 'center' : 'flex-end',
          alignItems: 'center',
          gap: '12px'
        }}>
          {!isCollapsed && (
            <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--fg)', flex: 1 }}>
              Navigation
            </span>
          )}
          <button
            onClick={toggleSidebar}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'var(--accent)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: isCollapsed ? '16px 4px' : '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: isCollapsed ? '16px' : '12px'
        }}>
          {Object.entries(NAVIGATION_SECTIONS).map(([sectionKey, section], sectionIndex) => {
            const isExpanded = expandedSections[sectionKey];
            const SectionIcon = section.Icon;

            return (
              <div key={sectionKey}>
                {/* Divider between sections (collapsed mode) */}
                {isCollapsed && sectionIndex > 0 && (
                  <div style={{
                    height: '1px',
                    backgroundColor: 'var(--border)',
                    margin: '0 8px 16px 8px',
                    opacity: 0.3
                  }} />
                )}
                
                {/* Section Header - ICON ONLY when collapsed */}
                {isCollapsed ? (
                  <div
                    onMouseEnter={() => setHoveredSection(sectionKey)}
                    onMouseLeave={() => setHoveredSection(null)}
                    style={{
                      position: 'relative',
                      marginBottom: '4px'
                    }}
                  >
                    <button
                      onClick={() => toggleSection(sectionKey)}
                      style={{
                        width: '48px',
                        height: '48px',
                        border: section.special ? '2px solid #8B5CF6' : 'none',
                        backgroundColor: isExpanded ? (section.color || 'var(--accent)') : (hoveredSection === sectionKey ? 'var(--bg-muted)' : 'transparent'),
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        boxShadow: section.special ? '0 4px 12px rgba(139, 92, 246, 0.3)' : 'none',
                        animation: section.special ? 'pulse 2s ease-in-out infinite' : 'none'
                      }}
                      title={section.title}
                    >
                      <SectionIcon 
                        size={section.special ? 24 : 20}
                        color={isExpanded ? 'white' : (section.special ? '#8B5CF6' : (hoveredSection === sectionKey ? 'var(--accent)' : 'var(--fg-muted)'))}
                      />
                      {section.badge && (
                        <span style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          width: '18px',
                          height: '18px',
                          backgroundColor: '#EF4444',
                          color: 'white',
                          fontSize: '11px',
                          fontWeight: '700',
                          borderRadius: '9px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid var(--surface)'
                        }}>
                          {section.badge}
                        </span>
                      )}
                    </button>

                    {/* Sub-items as icons when collapsed and expanded */}
                    {isExpanded && (
                      <div style={{
                        marginTop: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}>
                        {section.links.map((link) => {
                          const LinkIcon = link.Icon;
                          const isActive = location.pathname === link.path;
                          
                          return (
                            <Link
                              key={link.path}
                              to={link.path}
                              style={{
                                width: '48px',
                                height: '40px',
                                borderRadius: '10px',
                                backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                                textDecoration: 'none'
                              }}
                              title={link.name}
                            >
                              <LinkIcon 
                                size={16} 
                                color={isActive ? 'white' : 'var(--fg-muted)'}
                              />
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Full sidebar mode */
                  <div>
                    {/* Divider between sections */}
                    {sectionIndex > 0 && (
                      <div style={{
                        height: '1px',
                        backgroundColor: 'var(--border)',
                        margin: '16px 0',
                        opacity: 0.5
                      }} />
                    )}
                    
                    <button
                      onClick={() => toggleSection(sectionKey)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: section.special ? '2px solid #8B5CF6' : 'none',
                        backgroundColor: isExpanded ? (section.color ? section.color + '15' : 'var(--bg-muted)') : 'transparent',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        boxShadow: section.special ? '0 2px 8px rgba(139, 92, 246, 0.2)' : 'none'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: section.special ? '#8B5CF6' : 'var(--fg)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        <span style={{
                          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)',
                          transition: 'transform 0.2s ease',
                          display: 'inline-flex'
                        }}>
                          <ChevronRight size={14} />
                        </span>
                        <SectionIcon size={section.special ? 18 : 16} />
                        <span style={{ flex: 1 }}>{section.title}</span>
                        {section.badge && (
                          <span style={{
                            fontSize: '11px',
                            padding: '3px 8px',
                            backgroundColor: '#EF4444',
                            color: 'white',
                            borderRadius: '10px',
                            fontWeight: '700',
                            marginRight: '4px'
                          }}>
                            {section.badge}
                          </span>
                        )}
                        <span style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          backgroundColor: section.special ? '#8B5CF6' : 'var(--accent)',
                          color: 'white',
                          borderRadius: '10px',
                          fontWeight: '700'
                        }}>
                          {section.links.length}
                        </span>
                      </div>
                    </button>

                    {/* Section Links */}
                    {isExpanded && (
                      <ul style={{
                        listStyle: 'none',
                        margin: '8px 0 0 0',
                        padding: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}>
                        {section.links.map((link, linkIndex) => {
                          const globalIndex = `${sectionKey}-${linkIndex}`;
                          const LinkIcon = link.Icon;
                          const isActive = location.pathname === link.path;

                          return (
                            <li key={link.path}>
                              <Link
                                to={link.path}
                                onMouseEnter={() => setHoveredLink(globalIndex)}
                                onMouseLeave={() => setHoveredLink(null)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px',
                                  padding: '10px 12px 10px 24px',
                                  borderRadius: '8px',
                                  textDecoration: 'none',
                                  color: 'var(--fg)',
                                  fontSize: '13px',
                                  fontWeight: '500',
                                  transition: 'all 0.2s ease',
                                  backgroundColor: isActive ? 'var(--accent)10' : (hoveredLink === globalIndex ? 'var(--bg-muted)' : 'transparent'),
                                  borderLeft: (isActive || hoveredLink === globalIndex) ? '3px solid var(--accent)' : '3px solid transparent',
                                  transform: hoveredLink === globalIndex ? 'translateX(4px)' : 'translateX(0)'
                                }}
                              >
                                <LinkIcon 
                                  size={16} 
                                  color={isActive ? 'var(--accent)' : (hoveredLink === globalIndex ? 'var(--accent)' : 'var(--fg-muted)')}
                                />
                                <span style={{ flex: 1 }}>{link.name}</span>
                                {link.badge && (
                                  <span style={{
                                    fontSize: '9px',
                                    padding: '3px 6px',
                                    backgroundColor: '#10B981',
                                    color: 'white',
                                    borderRadius: '6px',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                  }}>
                                    {link.badge}
                                  </span>
                                )}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer - Only show when expanded */}
        {!isCollapsed && (
          <div style={{
            padding: '16px',
            borderTop: '1px solid var(--border)',
            fontSize: '11px',
            color: 'var(--fg-muted)',
            textAlign: 'center'
          }}>
            © 2025 ShahinKSA GRC
          </div>
        )}
      </aside>
    </>
  );
};

export default CollapsibleSidebar;

