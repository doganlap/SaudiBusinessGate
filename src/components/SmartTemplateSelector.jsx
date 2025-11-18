import React, { useState, useEffect } from 'react';
import {
  FileCheck, Star, Clock, Search, CheckSquare,
  Calendar, Building2, Shield
} from 'lucide-react';
import apiService from '../services/apiService';

/**
 * ==========================================
 * SMART TEMPLATE SELECTOR
 * ==========================================
 * 
 * Pre-built assessment templates
 * - By framework, industry, type
 * - One-click apply
 * - Customizable
 */

const TEMPLATES = [
  {
    id: 'nca-annual',
    name: 'NCA ECC Annual Assessment',
    framework: 'NCA Essential Cybersecurity Controls',
    controls: 114,
    estimatedTime: '3-4 weeks',
    popularity: 95,
    industry: 'All Sectors',
    description: 'Complete annual assessment for NCA ECC compliance covering all 114 essential controls.',
    icon: Shield,
    color: '#3B82F6',
    recommended: true
  },
  {
    id: 'sama-banking',
    name: 'SAMA Cyber Security Framework',
    framework: 'SAMA CSF',
    controls: 167,
    estimatedTime: '4-5 weeks',
    popularity: 88,
    industry: 'Financial Services',
    description: 'Comprehensive cybersecurity framework assessment for SAMA-regulated institutions.',
    icon: Building2,
    color: '#10B981',
    recommended: true
  },
  {
    id: 'iso27001-audit',
    name: 'ISO 27001 Internal Audit',
    framework: 'ISO 27001:2022',
    controls: 93,
    estimatedTime: '2-3 weeks',
    popularity: 92,
    industry: 'Technology',
    description: 'Internal audit template based on ISO 27001:2022 Annex A controls.',
    icon: FileCheck,
    color: '#8B5CF6',
    recommended: false
  },
  {
    id: 'quarterly-check',
    name: 'Quarterly Compliance Check',
    framework: 'Multi-Framework',
    controls: 45,
    estimatedTime: '1 week',
    popularity: 78,
    industry: 'All Sectors',
    description: 'Quick quarterly review of critical controls across multiple frameworks.',
    icon: Calendar,
    color: '#F59E0B',
    recommended: false
  },
  {
    id: 'citc-cloud',
    name: 'CITC Cloud Computing Assessment',
    framework: 'CITC CCRF',
    controls: 78,
    estimatedTime: '2-3 weeks',
    popularity: 75,
    industry: 'Cloud Services',
    description: 'Cloud computing regulatory framework assessment for CITC compliance.',
    icon: Shield,
    color: '#EC4899',
    recommended: false
  },
  {
    id: 'sdaia-privacy',
    name: 'SDAIA Data Privacy Assessment',
    framework: 'SDAIA PDPL',
    controls: 56,
    estimatedTime: '1-2 weeks',
    popularity: 82,
    industry: 'Data Processing',
    description: 'Personal Data Protection Law compliance assessment.',
    icon: Shield,
    color: '#06B6D4',
    recommended: false
  }
];

const SmartTemplateSelector = ({ onSelect, onCancel }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load templates from database
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true);
        const result = await apiService.assessmentTemplates.getAll();
        const templatesData = result?.data || result || [];
        
        // If no templates in database, use the hardcoded ones
        if (templatesData.length === 0) {
          setTemplates(TEMPLATES);
        } else {
          // Transform database templates to match expected format
          const transformedTemplates = templatesData.map(t => ({
            id: t.id,
            name: t.name,
            framework: t.framework_name || 'Unknown',
            controls: t.section_count || 0,
            estimatedTime: t.estimated_duration || 'N/A',
            popularity: 85, // Default popularity
            industry: 'All Sectors',
            description: t.description || 'Assessment template',
            icon: Shield,
            color: '#3B82F6',
            recommended: t.is_default || false
          }));
          setTemplates(transformedTemplates);
        }
      } catch (error) {
        console.error('Error loading templates:', error);
        // Fallback to hardcoded templates
        setTemplates(TEMPLATES);
      } finally {
        setLoading(false);
      }
    };
    loadTemplates();
  }, []);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.framework.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'recommended' && template.recommended) ||
                         template.industry.toLowerCase().includes(selectedFilter.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{ padding: '32px', backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
          Choose Assessment Template
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--fg-muted)' }}>
          Start with a pre-built template or create from scratch
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ 
          padding: '48px', 
          textAlign: 'center', 
          fontSize: '16px', 
          color: 'var(--fg-muted)' 
        }}>
          Loading templates from database...
        </div>
      )}

      {!loading && (
        <>

      {/* Search and Filters */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '32px',
        flexWrap: 'wrap'
      }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
          <Search size={18} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--fg-muted)'
          }} />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 40px',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>

        {/* Filter Buttons */}
        {['all', 'recommended', 'financial', 'technology'].map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            style={{
              padding: '12px 20px',
              backgroundColor: selectedFilter === filter ? 'var(--accent)' : 'var(--bg-muted)',
              color: selectedFilter === filter ? 'white' : 'var(--fg)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {filter === 'all' ? 'All Templates' : filter}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {filteredTemplates.map((template) => {
          const TemplateIcon = template.icon;
          return (
            <div
              key={template.id}
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              onClick={() => onSelect(template)}
            >
              {/* Recommended Badge */}
              {template.recommended && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  backgroundColor: '#FEF3C7',
                  color: '#92400E',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Star size={12} fill="#F59E0B" color="#F59E0B" />
                  Recommended
                </div>
              )}

              {/* Icon */}
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                backgroundColor: template.color + '20',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <TemplateIcon size={28} color={template.color} />
              </div>

              {/* Content */}
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: 'var(--fg)' }}>
                {template.name}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--fg-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
                {template.description}
              </p>

              {/* Meta Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: 'var(--fg-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={14} />
                  {template.framework}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--fg-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckSquare size={14} />
                  {template.controls} controls
                </div>
                <div style={{ fontSize: '12px', color: 'var(--fg-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} />
                  {template.estimatedTime}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--fg-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={14} />
                  {template.industry}
                </div>
              </div>

              {/* Popularity Bar */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', color: 'var(--fg-muted)', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Popularity</span>
                  <span style={{ fontWeight: '700' }}>{template.popularity}%</span>
                </div>
                <div style={{
                  height: '4px',
                  backgroundColor: 'var(--bg-muted)',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${template.popularity}%`,
                    backgroundColor: template.color,
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>

              {/* Action Button */}
              <button
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: template.color,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Use Template
              </button>
            </div>
          );
        })}
      </div>

      {/* Custom Template Option */}
      <div style={{
        backgroundColor: 'var(--surface)',
        borderRadius: '12px',
        padding: '32px',
        border: '2px dashed var(--border)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <FileCheck size={32} color="var(--accent)" />
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
          Start from Scratch
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--fg-muted)', marginBottom: '20px' }}>
          Create a custom assessment without a template
        </p>
        <button
          onClick={() => onSelect(null)}
          style={{
            padding: '12px 32px',
            backgroundColor: 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Create Custom
        </button>
      </div>
      </>
      )}
    </div>
  );
};

export default SmartTemplateSelector;

