import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, Search, Filter, Grid, List, ExternalLink, 
  Code, Zap, Database, Cloud, Shield, Globe, 
  TrendingUp, Clock, Star, Tag, ChevronRight,
  Video, FileText, Presentation, Layers, Settings,
  Mail, Activity, Eye
} from 'lucide-react';

/**
 * ==========================================
 * ADVANCED AUTOMATION PLATFORM
 * Demo & POC Showcase for ICT Solutions
 * ==========================================
 * 
 * Features:
 * - Interactive demo showcase
 * - POC management and display
 * - Advanced filtering and search
 * - Multiple view modes (grid/list)
 * - Category-based organization
 * - Real-time demo player
 * - Solution comparison
 * - Analytics and tracking
 */

const DemoShowcasePlatform = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDemo, setSelectedDemo] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Sample demo/POC data
  const [demos, setDemos] = useState([
    {
      id: 1,
      title: 'Document Processing Automation',
      description: 'AI-powered document processing with OCR, classification, and automated workflows',
      category: 'automation',
      type: 'demo',
      status: 'live',
      thumbnail: '📄',
      icon: FileText,
      color: 'var(--primary)',
      tags: ['AI', 'OCR', 'Workflow', 'Azure'],
      duration: '15 min',
      views: 1247,
      rating: 4.8,
      featured: true,
      demoUrl: '/demos/document-processing',
      pocDetails: {
        technologies: ['Azure Cognitive Services', 'n8n', 'MongoDB', 'React'],
        useCases: ['Invoice Processing', 'Contract Analysis', 'Form Extraction'],
        benefits: ['90% time reduction', '99% accuracy', '24/7 automation']
      }
    },
    {
      id: 2,
      title: 'Enterprise Integration Hub',
      description: 'Unified integration platform connecting SAP, SharePoint, Azure, and custom systems',
      category: 'integration',
      type: 'poc',
      status: 'live',
      thumbnail: '🔗',
      icon: Layers,
      color: 'var(--secondary)',
      tags: ['SAP', 'SharePoint', 'API', 'Integration'],
      duration: '20 min',
      views: 892,
      rating: 4.9,
      featured: true,
      demoUrl: '/demos/integration-hub',
      pocDetails: {
        technologies: ['n8n', 'REST APIs', 'OAuth2', 'GraphQL'],
        useCases: ['Data Synchronization', 'Workflow Automation', 'System Integration'],
        benefits: ['Real-time sync', 'Reduced manual work', 'Centralized management']
      }
    },
    {
      id: 3,
      title: 'AI-Powered Email Automation',
      description: 'Intelligent email classification, routing, and automated response system',
      category: 'automation',
      type: 'demo',
      status: 'live',
      thumbnail: '📧',
      icon: Mail,
      color: 'var(--accent)',
      tags: ['AI', 'Email', 'Classification', 'Automation'],
      duration: '12 min',
      views: 654,
      rating: 4.7,
      featured: false,
      demoUrl: '/demos/email-automation',
      pocDetails: {
        technologies: ['OpenAI GPT-4', 'Gmail API', 'Outlook API', 'n8n'],
        useCases: ['Email Routing', 'Auto-Response', 'Priority Classification'],
        benefits: ['80% faster response', 'Smart categorization', '24/7 availability']
      }
    },
    {
      id: 4,
      title: 'Cloud Infrastructure Monitoring',
      description: 'Real-time monitoring and alerting for Azure, AWS, and hybrid cloud environments',
      category: 'monitoring',
      type: 'poc',
      status: 'live',
      thumbnail: '☁️',
      icon: Cloud,
      color: 'var(--info)',
      tags: ['Cloud', 'Monitoring', 'Azure', 'AWS'],
      duration: '18 min',
      views: 432,
      rating: 4.6,
      featured: false,
      demoUrl: '/demos/cloud-monitoring',
      pocDetails: {
        technologies: ['Azure Monitor', 'Prometheus', 'Grafana', 'Kubernetes'],
        useCases: ['Infrastructure Monitoring', 'Cost Optimization', 'Performance Tracking'],
        benefits: ['Real-time alerts', 'Cost savings', 'Proactive management']
      }
    },
    {
      id: 5,
      title: 'Security Compliance Dashboard',
      description: 'Comprehensive GRC platform with automated compliance checking and reporting',
      category: 'security',
      type: 'demo',
      status: 'live',
      thumbnail: '🛡️',
      icon: Shield,
      color: 'var(--error)',
      tags: ['Security', 'Compliance', 'GRC', 'Reporting'],
      duration: '25 min',
      views: 1123,
      rating: 4.9,
      featured: true,
      demoUrl: '/demos/security-compliance',
      pocDetails: {
        technologies: ['React', 'Node.js', 'MongoDB', 'Azure AD'],
        useCases: ['Compliance Auditing', 'Risk Assessment', 'Policy Management'],
        benefits: ['Automated compliance', 'Real-time reporting', 'Risk mitigation']
      }
    },
    {
      id: 6,
      title: 'Data Analytics & BI Platform',
      description: 'Advanced business intelligence with real-time dashboards and predictive analytics',
      category: 'analytics',
      type: 'poc',
      status: 'live',
      thumbnail: '📊',
      icon: TrendingUp,
      color: 'var(--warning)',
      tags: ['BI', 'Analytics', 'Data Visualization', 'ML'],
      duration: '22 min',
      views: 789,
      rating: 4.8,
      featured: false,
      demoUrl: '/demos/analytics-platform',
      pocDetails: {
        technologies: ['Power BI', 'Python', 'SQL Server', 'Machine Learning'],
        useCases: ['Business Intelligence', 'Predictive Analytics', 'Data Visualization'],
        benefits: ['Data-driven decisions', 'Real-time insights', 'Predictive capabilities']
      }
    },
    {
      id: 7,
      title: 'Workflow Automation Engine',
      description: 'Low-code workflow automation platform for business process optimization',
      category: 'automation',
      type: 'demo',
      status: 'live',
      thumbnail: '⚙️',
      icon: Zap,
      color: 'var(--info)',
      tags: ['Workflow', 'Low-Code', 'BPM', 'Automation'],
      duration: '16 min',
      views: 567,
      rating: 4.7,
      featured: false,
      demoUrl: '/demos/workflow-engine',
      pocDetails: {
        technologies: ['n8n', 'Node.js', 'PostgreSQL', 'Redis'],
        useCases: ['Process Automation', 'Task Management', 'Approval Workflows'],
        benefits: ['Faster processes', 'Reduced errors', 'Better visibility']
      }
    },
    {
      id: 8,
      title: 'API Gateway & Management',
      description: 'Enterprise API gateway with rate limiting, authentication, and analytics',
      category: 'integration',
      type: 'poc',
      status: 'live',
      thumbnail: '🌐',
      icon: Globe,
      color: 'var(--secondary)',
      tags: ['API', 'Gateway', 'Security', 'Management'],
      duration: '14 min',
      views: 345,
      rating: 4.5,
      featured: false,
      demoUrl: '/demos/api-gateway',
      pocDetails: {
        technologies: ['Kong', 'OAuth2', 'Redis', 'Elasticsearch'],
        useCases: ['API Management', 'Rate Limiting', 'Security', 'Analytics'],
        benefits: ['Secure APIs', 'Better performance', 'Centralized management']
      }
    }
  ]);

  const categories = [
    { id: 'all', label: 'All Categories', icon: Grid, count: demos.length },
    { id: 'automation', label: 'Automation', icon: Zap, count: demos.filter(d => d.category === 'automation').length },
    { id: 'integration', label: 'Integration', icon: Layers, count: demos.filter(d => d.category === 'integration').length },
    { id: 'monitoring', label: 'Monitoring', icon: Activity, count: demos.filter(d => d.category === 'monitoring').length },
    { id: 'security', label: 'Security', icon: Shield, count: demos.filter(d => d.category === 'security').length },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, count: demos.filter(d => d.category === 'analytics').length }
  ];

  const types = [
    { id: 'all', label: 'All Types', count: demos.length },
    { id: 'demo', label: 'Demos', count: demos.filter(d => d.type === 'demo').length },
    { id: 'poc', label: 'POCs', count: demos.filter(d => d.type === 'poc').length }
  ];

  // Filter demos
  const filteredDemos = demos.filter(demo => {
    const matchesSearch = demo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         demo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         demo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || demo.category === selectedCategory;
    const matchesType = selectedType === 'all' || demo.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const featuredDemos = filteredDemos.filter(d => d.featured);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg)',
      padding: '32px',
      paddingTop: '24px'
    }}>
      {/* Header Section */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{
              fontSize: '36px',
              fontWeight: '800',
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-600) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '8px',
              lineHeight: 1.2
            }}>
              🚀 Demo & POC Showcase
            </h1>
            <p style={{
              fontSize: '16px',
              color: 'var(--fg-muted)',
              maxWidth: '600px',
              lineHeight: 1.6
            }}>
              Explore our advanced ICT solutions through interactive demos and proof-of-concepts. 
              Experience cutting-edge automation, integration, and digital transformation capabilities.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.backgroundColor = 'var(--accent)10';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.backgroundColor = 'var(--surface)';
              }}
            >
              {viewMode === 'grid' ? <List size={18} /> : <Grid size={18} />}
              {viewMode === 'grid' ? 'List View' : 'Grid View'}
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}>
          {/* Search Bar */}
          <div style={{
            flex: 1,
            minWidth: '300px',
            position: 'relative'
          }}>
            <Search size={18} style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--fg-muted)',
              pointerEvents: 'none'
            }} />
            <input
              type="text"
              placeholder="Search demos and POCs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 48px',
                borderRadius: '12px',
                border: '2px solid var(--border)',
                backgroundColor: 'var(--surface)',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent)20';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: '12px 20px',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              backgroundColor: showFilters ? 'var(--accent)' : 'var(--surface)',
              color: showFilters ? 'white' : 'var(--fg)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
          >
            <Filter size={18} />
            Filters
            {showFilters && <span style={{ fontSize: '12px' }}>▼</span>}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div style={{
            padding: '20px',
            backgroundColor: 'var(--surface)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            marginBottom: '24px',
            display: 'flex',
            gap: '24px',
            flexWrap: 'wrap'
          }}>
            {/* Category Filter */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '700',
                color: 'var(--fg-muted)',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Category
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '2px solid',
                      borderColor: selectedCategory === cat.id ? 'var(--accent)' : 'var(--border)',
                      backgroundColor: selectedCategory === cat.id ? 'var(--accent)10' : 'transparent',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedCategory !== cat.id) {
                        e.currentTarget.style.borderColor = 'var(--accent)';
                        e.currentTarget.style.backgroundColor = 'var(--accent)10';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedCategory !== cat.id) {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <cat.icon size={14} />
                    {cat.label}
                    <span style={{
                      fontSize: '11px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: selectedCategory === cat.id ? 'var(--accent)' : 'var(--bg-muted)',
                      color: selectedCategory === cat.id ? 'white' : 'var(--fg-muted)'
                    }}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '700',
                color: 'var(--fg-muted)',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Type
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {types.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '2px solid',
                      borderColor: selectedType === type.id ? 'var(--accent)' : 'var(--border)',
                      backgroundColor: selectedType === type.id ? 'var(--accent)10' : 'transparent',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedType !== type.id) {
                        e.currentTarget.style.borderColor = 'var(--accent)';
                        e.currentTarget.style.backgroundColor = 'var(--accent)10';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedType !== type.id) {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {type.label}
                    <span style={{
                      fontSize: '11px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: selectedType === type.id ? 'var(--accent)' : 'var(--bg-muted)',
                      color: selectedType === type.id ? 'white' : 'var(--fg-muted)',
                      marginLeft: '6px'
                    }}>
                      {type.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div style={{
          fontSize: '14px',
          color: 'var(--fg-muted)',
          marginBottom: '24px'
        }}>
          Showing <strong style={{ color: 'var(--fg)' }}>{filteredDemos.length}</strong> of {demos.length} solutions
        </div>
      </div>

      {/* Featured Demos */}
      {featuredDemos.length > 0 && searchQuery === '' && selectedCategory === 'all' && (
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <Star size={20} style={{ color: 'var(--warning)' }} />
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: 'var(--fg)'
            }}>
              Featured Solutions
            </h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '20px'
          }}>
            {featuredDemos.map(demo => (
              <DemoCard
                key={demo.id}
                demo={demo}
                viewMode="grid"
                onClick={() => setSelectedDemo(demo)}
                navigate={navigate}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Demos Grid/List */}
      <div>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: 'var(--fg)',
          marginBottom: '20px'
        }}>
          {featuredDemos.length > 0 && searchQuery === '' && selectedCategory === 'all' ? 'All Solutions' : 'Solutions'}
        </h2>
        
        {viewMode === 'grid' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px'
          }}>
            {filteredDemos.map(demo => (
              <DemoCard
                key={demo.id}
                demo={demo}
                viewMode="grid"
                onClick={() => setSelectedDemo(demo)}
                navigate={navigate}
              />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredDemos.map(demo => (
              <DemoCard
                key={demo.id}
                demo={demo}
                viewMode="list"
                onClick={() => setSelectedDemo(demo)}
                navigate={navigate}
              />
            ))}
          </div>
        )}

        {filteredDemos.length === 0 && (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: 'var(--fg-muted)'
          }}>
            <Search size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              No solutions found
            </p>
            <p style={{ fontSize: '14px' }}>
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      {/* Demo Detail Modal */}
      {selectedDemo && (
        <DemoDetailModal
          demo={selectedDemo}
          onClose={() => setSelectedDemo(null)}
          navigate={navigate}
        />
      )}
    </div>
  );
};

// Demo Card Component
const DemoCard = ({ demo, viewMode, onClick, navigate }) => {
  const Icon = demo.icon;

  if (viewMode === 'list') {
    return (
      <div
        onClick={onClick}
        style={{
          padding: '20px',
          backgroundColor: 'var(--surface)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          cursor: 'pointer',
          display: 'flex',
          gap: '20px',
          alignItems: 'center',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = demo.color;
          e.currentTarget.style.boxShadow = `0 8px 24px ${demo.color}20`;
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '12px',
          background: `linear-gradient(135deg, ${demo.color} 0%, ${demo.color}CC 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '36px',
          flexShrink: 0
        }}>
          {demo.thumbnail}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: 'var(--fg)',
              margin: 0
            }}>
              {demo.title}
            </h3>
            <span style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              backgroundColor: demo.type === 'demo' ? 'var(--primary)' : 'var(--secondary)',
              color: 'white'
            }}>
              {demo.type.toUpperCase()}
            </span>
            {demo.featured && (
              <Star size={16} style={{ color: 'var(--warning)', fill: 'var(--warning)' }} />
            )}
          </div>
          <p style={{
            fontSize: '14px',
            color: 'var(--fg-muted)',
            marginBottom: '12px',
            lineHeight: 1.5
          }}>
            {demo.description}
          </p>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--fg-muted)' }}>
              <Clock size={14} />
              {demo.duration}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--fg-muted)' }}>
              <Eye size={14} />
              {demo.views} views
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--fg-muted)' }}>
              <Star size={14} style={{ fill: 'var(--warning)', color: 'var(--warning)' }} />
              {demo.rating}
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {demo.tags.slice(0, 3).map(tag => (
                <span key={tag} style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '600',
                  backgroundColor: 'var(--bg-muted)',
                  color: 'var(--fg-muted)'
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <ChevronRight size={24} style={{ color: 'var(--fg-muted)', flexShrink: 0 }} />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      style={{
        padding: '24px',
        backgroundColor: 'var(--surface)',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = demo.color;
        e.currentTarget.style.boxShadow = `0 12px 32px ${demo.color}30`;
        e.currentTarget.style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Featured Badge */}
      {demo.featured && (
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          padding: '6px 12px',
          borderRadius: '8px',
          backgroundColor: 'var(--warning)',
          color: 'white',
          fontSize: '11px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          zIndex: 1
        }}>
          <Star size={12} fill="white" />
          Featured
        </div>
      )}

      {/* Type Badge */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        padding: '6px 12px',
        borderRadius: '8px',
        backgroundColor: demo.type === 'demo' ? 'var(--primary)' : 'var(--secondary)',
        color: 'white',
        fontSize: '11px',
        fontWeight: '700',
        textTransform: 'uppercase',
        zIndex: 1
      }}>
        {demo.type}
      </div>

      {/* Thumbnail */}
      <div style={{
        width: '100%',
        height: '180px',
        borderRadius: '12px',
        background: `linear-gradient(135deg, ${demo.color}20 0%, ${demo.color}10 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '64px',
        marginBottom: '20px',
        border: `2px solid ${demo.color}30`
      }}>
        {demo.thumbnail}
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: 'var(--fg)',
          marginBottom: '8px',
          lineHeight: 1.3
        }}>
          {demo.title}
        </h3>
        <p style={{
          fontSize: '14px',
          color: 'var(--fg-muted)',
          marginBottom: '16px',
          lineHeight: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {demo.description}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {demo.tags.slice(0, 4).map(tag => (
            <span key={tag} style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '600',
              backgroundColor: `${demo.color}15`,
              color: demo.color
            }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '16px',
          borderTop: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--fg-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={14} />
              {demo.duration}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Eye size={14} />
              {demo.views}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={14} style={{ fill: 'var(--warning)', color: 'var(--warning)' }} />
              {demo.rating}
            </div>
          </div>
          <button style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: demo.color,
            color: 'white',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = `0 4px 12px ${demo.color}50`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          >
            <Play size={14} fill="white" />
            View Demo
          </button>
        </div>
      </div>
    </div>
  );
};

// Demo Detail Modal
const DemoDetailModal = ({ demo, onClose, navigate }) => {
  const Icon = demo.icon;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          backgroundColor: 'var(--surface)',
          borderRadius: '20px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.3s ease'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid var(--border)',
          background: `linear-gradient(135deg, ${demo.color} 0%, ${demo.color}CC 100%)`,
          color: 'white',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
          >
            ×
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px'
            }}>
              {demo.thumbnail}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: '800',
                  margin: 0,
                  color: 'white'
                }}>
                  {demo.title}
                </h2>
                <span style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  color: 'white'
                }}>
                  {demo.type.toUpperCase()}
                </span>
              </div>
              <p style={{
                fontSize: '16px',
                color: 'rgba(255,255,255,0.9)',
                margin: 0,
                lineHeight: 1.5
              }}>
                {demo.description}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px'
        }}>
          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-muted)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--fg)', marginBottom: '4px' }}>
                {demo.rating}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--fg-muted)' }}>
                Rating
              </div>
            </div>
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-muted)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--fg)', marginBottom: '4px' }}>
                {demo.views}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--fg-muted)' }}>
                Views
              </div>
            </div>
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-muted)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--fg)', marginBottom: '4px' }}>
                {demo.duration}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--fg-muted)' }}>
                Duration
              </div>
            </div>
          </div>

          {/* POC Details */}
          {demo.pocDetails && (
            <>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: 'var(--fg)',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Code size={18} />
                  Technologies
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {demo.pocDetails.technologies.map((tech, idx) => (
                    <span key={idx} style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      backgroundColor: `${demo.color}15`,
                      color: demo.color
                    }}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: 'var(--fg)',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Layers size={18} />
                  Use Cases
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {demo.pocDetails.useCases.map((useCase, idx) => (
                    <div key={idx} style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-muted)',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <ChevronRight size={16} style={{ color: demo.color }} />
                      {useCase}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: 'var(--fg)',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <TrendingUp size={18} />
                  Key Benefits
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  {demo.pocDetails.benefits.map((benefit, idx) => (
                    <div key={idx} style={{
                      padding: '16px',
                      borderRadius: '10px',
                      backgroundColor: `${demo.color}10`,
                      border: `2px solid ${demo.color}30`,
                      fontSize: '14px',
                      fontWeight: '600',
                      textAlign: 'center',
                      color: demo.color
                    }}>
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Tags */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: 'var(--fg)',
              marginBottom: '12px'
            }}>
              Tags
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {demo.tags.map(tag => (
                <span key={tag} style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  backgroundColor: 'var(--bg-muted)',
                  color: 'var(--fg-muted)'
                }}>
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
              color: 'var(--fg)',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-muted)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface)';
            }}
          >
            Close
          </button>
          <button
            onClick={() => {
              if (demo.demoUrl.startsWith('http')) {
                window.open(demo.demoUrl, '_blank');
              } else {
                navigate(demo.demoUrl);
                onClose();
              }
            }}
            style={{
              padding: '12px 24px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: demo.color,
              color: 'white',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = `0 4px 16px ${demo.color}50`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Play size={16} fill="white" />
            Launch Demo
            <ExternalLink size={14} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};


export default DemoShowcasePlatform;

