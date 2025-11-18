import React, { useState, useEffect } from 'react';
import AssessmentWizard from './assessment/AssessmentWizard';
import ProgressDashboard from './assessment/ProgressDashboard';
import BulkActionsToolbar from './assessment/BulkActionsToolbar';
import SmartTemplateSelector from './assessment/SmartTemplateSelector';
import apiService from '../services/apiService';
import {
  BarChart3, FileCheck, Zap, Sparkles, RefreshCw
} from 'lucide-react';

/**
 * ==========================================
 * ENHANCED ASSESSMENT PAGE
 * ==========================================
 * 
 * Demonstration of all UX enhancements
 * - Guided wizard
 * - Progress tracking
 * - Bulk operations
 * - Template selection
 * - Evidence management
 */

const EnhancedAssessmentPage = () => {
  const [view, setView] = useState('list'); // list, wizard, progress, templates
  const [selectedItems, setSelectedItems] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load assessments from database
  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const result = await apiService.assessments.getAll();
      const assessmentsData = result?.data || result || [];
      setAssessments(assessmentsData);
    } catch (error) {
      console.error('Error loading assessments:', error);
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = (action) => {
    console.log('Bulk action:', action, 'on', selectedItems.length, 'items');
    if (action === 'clear') {
      setSelectedItems([]);
    }
  };

  const handleWizardComplete = (data) => {
    console.log('Assessment created:', data);
    // Reload assessments to show the new one
    loadAssessments();
    setView('list');
  };

  const handleTemplateSelect = (template) => {
    console.log('Template selected:', template);
    setView('wizard');
  };

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      {/* Navigation Tabs */}
      {view === 'list' && (
        <div style={{ padding: '32px' }}>
          {/* Page Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: 'var(--fg)' }}>
              Enhanced Assessment Experience
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--fg-muted)' }}>
              Try our improved UX with wizards, templates, and smart features
            </p>
          </div>

          {/* Feature Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {[
              {
                title: 'Create with Wizard',
                description: '5-step guided process with auto-save and validation',
                icon: Sparkles,
                color: '#3B82F6',
                action: () => setView('wizard'),
                badge: '60% Faster'
              },
              {
                title: 'Use Template',
                description: 'Start with pre-built templates for common frameworks',
                icon: FileCheck,
                color: '#10B981',
                action: () => setView('templates'),
                badge: '6 Templates'
              },
              {
                title: 'Track Progress',
                description: 'Visual progress tracking with bottleneck identification',
                icon: BarChart3,
                color: '#8B5CF6',
                action: () => setView('progress'),
                badge: 'Real-time'
              },
              {
                title: 'Quick Actions',
                description: 'Bulk operations for multiple controls at once',
                icon: Zap,
                color: '#F59E0B',
                action: () => alert('Select items first!'),
                badge: '8 Actions'
              }
            ].map((feature, index) => {
              const FeatureIcon = feature.icon;
              return (
                <div
                  key={index}
                  onClick={feature.action}
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderRadius: '16px',
                    padding: '32px',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    backgroundColor: feature.color + '20',
                    color: feature.color,
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '700'
                  }}>
                    {feature.badge}
                  </div>

                  {/* Icon */}
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, ${feature.color}20 0%, ${feature.color}40 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px'
                  }}>
                    <FeatureIcon size={32} color={feature.color} />
                  </div>

                  {/* Content */}
                  <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px', color: 'var(--fg)' }}>
                    {feature.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--fg-muted)', lineHeight: 1.6 }}>
                    {feature.description}
                  </p>

                  {/* Arrow */}
                  <div style={{
                    marginTop: '20px',
                    fontSize: '24px',
                    color: feature.color,
                    fontWeight: '700'
                  }}>
                    →
                  </div>
                </div>
              );
            })}
          </div>

          {/* Assessment List with Bulk Selection */}
          <div style={{ marginTop: '48px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>
                  Your Assessments
                </h2>
                <div style={{ fontSize: '14px', color: 'var(--fg-muted)' }}>
                  {loading ? 'Loading...' : `${assessments.length} assessments found • Select multiple to see bulk actions`}
                </div>
              </div>
              <button
                onClick={loadAssessments}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: loading ? 0.6 : 1
                }}
              >
                <RefreshCw size={16} /> Refresh
              </button>
            </div>
            
            {loading ? (
              <div style={{
                padding: '48px',
                textAlign: 'center',
                backgroundColor: 'var(--surface)',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                color: 'var(--fg-muted)'
              }}>
                Loading assessments from database...
              </div>
            ) : assessments.length === 0 ? (
              <div style={{
                padding: '48px',
                textAlign: 'center',
                backgroundColor: 'var(--surface)',
                borderRadius: '12px',
                border: '2px dashed var(--border)',
                color: 'var(--fg-muted)'
              }}>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                  No assessments yet
                </div>
                <div style={{ fontSize: '14px', marginBottom: '20px' }}>
                  Create your first assessment using the wizard or template
                </div>
              </div>
            ) : (
              <div style={{
                backgroundColor: 'var(--surface)',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                overflow: 'hidden'
              }}>
                {assessments.map((assessment) => {
                  const isSelected = selectedItems.includes(assessment.id);
                  return (
                    <div
                      key={assessment.id}
                      onClick={() => {
                        setSelectedItems(prev =>
                          prev.includes(assessment.id) 
                            ? prev.filter(i => i !== assessment.id) 
                            : [...prev, assessment.id]
                        );
                      }}
                      style={{
                        padding: '16px 24px',
                        borderBottom: '1px solid var(--border)',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? 'var(--accent)10' : 'transparent',
                        transition: 'background-color 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                            {assessment.name}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--fg-muted)' }}>
                            {assessment.framework_name || 'No framework'} • 
                            {assessment.organization_name ? ` ${assessment.organization_name} • ` : ' '}
                            {assessment.due_date ? `Due ${new Date(assessment.due_date).toLocaleDateString()}` : 'No due date'}
                          </div>
                        </div>
                        <div style={{
                          padding: '4px 12px',
                          backgroundColor: 
                            assessment.status === 'completed' ? '#D1FAE5' :
                            assessment.status === 'in_progress' ? '#FEF3C7' :
                            assessment.status === 'draft' ? '#E0E7FF' : '#F3F4F6',
                          color: 
                            assessment.status === 'completed' ? '#065F46' :
                            assessment.status === 'in_progress' ? '#92400E' :
                            assessment.status === 'draft' ? '#3730A3' : '#1F2937',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          textTransform: 'capitalize'
                        }}>
                          {assessment.status || 'draft'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bulk Actions Toolbar */}
          <BulkActionsToolbar 
            selectedCount={selectedItems.length} 
            onAction={handleBulkAction}
          />
        </div>
      )}

      {/* Wizard View */}
      {view === 'wizard' && (
        <AssessmentWizard 
          onComplete={handleWizardComplete}
          onCancel={() => setView('list')}
        />
      )}

      {/* Progress View */}
      {view === 'progress' && (
        <div>
          <div style={{ padding: '24px', backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
            <button
              onClick={() => setView('list')}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--fg)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              ← Back to List
            </button>
          </div>
          <ProgressDashboard />
        </div>
      )}

      {/* Templates View */}
      {view === 'templates' && (
        <SmartTemplateSelector 
          onSelect={handleTemplateSelect}
          onCancel={() => setView('list')}
        />
      )}
    </div>
  );
};

export default EnhancedAssessmentPage;

