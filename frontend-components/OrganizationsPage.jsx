import React, { useState, useEffect } from 'react';
import databaseManagerService from '../services/databaseManagerService';
import EnhancedOrganizationForm from '../components/EnhancedOrganizationForm';

const OrganizationsPage = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);

  useEffect(() => {
    // Fetch organizations from Database Manager
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await databaseManagerService.getOrganizations();
      setOrganizations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
      setError('Failed to load organizations. Please check your connection to the database.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this organization?')) {
      return;
    }

    try {
      await apiService.deleteOrganization(id);
      setOrganizations(organizations.filter(org => org.id !== id));
      alert('Organization deleted successfully');
    } catch (error) {
      console.error('Failed to delete organization:', error);
      alert('Failed to delete organization');
    }
  };

  const handleEdit = (org) => {
    setEditingOrg(org);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingOrg(null);
    setShowModal(true);
  };

  const handleSave = async (formData) => {
    try {
      if (editingOrg) {
        // Update existing
        await apiService.updateOrganization(editingOrg.id, formData);
        alert('Organization updated successfully');
      } else {
        // Create new
        await apiService.createOrganization(formData);
        alert('Organization created successfully');
      }
      setShowModal(false);
      await fetchOrganizations();
    } catch (error) {
      console.error('Failed to save organization:', error);
      alert(`Failed to save organization: ${error.message}`);
    }
  };

  const filteredOrganizations = organizations.filter(org => 
    org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '32px', backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '36px',
          fontWeight: '700',
          marginBottom: '8px', 
          color: 'var(--fg)',
          background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-600) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🏢 Organizations
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--fg-muted)', margin: 0 }}>
          Manage and view all registered organizations in the system
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: 'var(--shadow)'
        }}>
          <div style={{ fontSize: '14px', color: 'var(--fg-muted)', marginBottom: '8px', fontWeight: '600' }}>
            Total Organizations
          </div>
          <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--accent)' }}>
            {organizations.length || '0'}
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: 'var(--shadow)'
        }}>
          <div style={{ fontSize: '14px', color: 'var(--fg-muted)', marginBottom: '8px', fontWeight: '600' }}>
            Active Organizations
          </div>
          <div style={{ fontSize: '36px', fontWeight: '700', color: '#10B981' }}>
            {organizations.filter(o => o.is_active).length || '0'}
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: 'var(--shadow)'
        }}>
          <div style={{ fontSize: '14px', color: 'var(--fg-muted)', marginBottom: '8px', fontWeight: '600' }}>
            Countries
          </div>
          <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--fg)' }}>
            {[...new Set(organizations.map(o => o.country))].length || '0'}
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="🔍 Search organizations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: '1',
            minWidth: '300px',
            padding: '12px 16px',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            backgroundColor: 'var(--surface)',
            color: 'var(--fg)',
            fontSize: '14px'
          }}
        />
        <button 
          onClick={handleAdd}
          style={{
            padding: '12px 24px',
            backgroundColor: 'var(--accent)',
            color: 'var(--fg-inverse)',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
          ➕ Add Organization
        </button>
      </div>

      {/* Organizations Table */}
      <div style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow)'
      }}>
        {error ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <p style={{ color: 'var(--error, #DC2626)', fontWeight: '600', marginBottom: '8px' }}>
              {error}
            </p>
            <button 
              onClick={fetchOrganizations}
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--accent)',
                color: 'var(--fg-inverse)',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}>
              Retry
            </button>
          </div>
        ) : loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--fg-muted)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            Loading organizations from database...
          </div>
        ) : filteredOrganizations.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--fg-muted)' }}>
            No organizations found
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-muted)' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: 'var(--fg)', borderBottom: '1px solid var(--border)' }}>
                  Organization Name
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: 'var(--fg)', borderBottom: '1px solid var(--border)' }}>
                  Sector ⭐
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: 'var(--fg)', borderBottom: '1px solid var(--border)' }}>
                  Employees
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: 'var(--fg)', borderBottom: '1px solid var(--border)' }}>
                  Controls
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: 'var(--fg)', borderBottom: '1px solid var(--border)' }}>
                  Status
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: 'var(--fg)', borderBottom: '1px solid var(--border)' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrganizations.map((org, index) => (
                <tr key={org.id || index} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px', fontSize: '14px', color: 'var(--fg)', fontWeight: '600' }}>
                    <div>{org.name || 'N/A'}</div>
                    {org.name_ar && (
                      <div style={{ fontSize: '12px', color: 'var(--fg-muted)', marginTop: '4px', direction: 'rtl' }}>
                        {org.name_ar}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px' }}>
                    {org.sector ? (
                      <span style={{
                        padding: '4px 10px',
                        backgroundColor: '#DBEAFE',
                        color: '#1E40AF',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}>
                        {org.sector}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--fg-muted)', fontSize: '13px' }}>Not set</span>
                    )}
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: 'var(--fg-muted)' }}>
                    {org.employee_count ? (
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--fg)' }}>
                          {org.employee_count.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '11px' }}>
                          {org.employee_count > 1000 ? 'Enterprise' : 
                           org.employee_count > 250 ? 'Large' : 
                           org.employee_count > 50 ? 'Medium' : 'Small'}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--fg-muted)', fontSize: '13px' }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px' }}>
                    {org.estimated_control_count ? (
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--accent)' }}>
                          {org.estimated_control_count}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--fg-muted)' }}>
                          {org.mandatory_control_count || 0} mandatory
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--fg-muted)', fontSize: '13px' }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px' }}>
                    <span style={{
                      padding: '4px 12px',
                      backgroundColor: 
                        org.onboarding_status === 'active' ? '#D1FAE5' :
                        org.onboarding_status === 'approved' ? '#DBEAFE' :
                        org.onboarding_status === 'configured' ? '#FEF3C7' :
                        '#F3F4F6',
                      color: 
                        org.onboarding_status === 'active' ? '#065F46' :
                        org.onboarding_status === 'approved' ? '#1E40AF' :
                        org.onboarding_status === 'configured' ? '#92400E' :
                        '#1F2937',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {org.onboarding_status || (org.is_active ? 'Active' : 'Inactive')}
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px' }}>
                    <button 
                      onClick={() => handleEdit(org)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: 'var(--bg-muted)',
                        color: 'var(--accent)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginRight: '8px'
                      }}>
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(org.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#FEE2E2',
                        color: '#991B1B',
                        border: '1px solid #FCA5A5',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}>
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <EnhancedOrganizationForm
          organization={editingOrg}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

// Modal Component for Add/Edit
const OrganizationModal = ({ organization, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: organization?.name || '',
    name_ar: organization?.name_ar || '',
    industry: organization?.industry || '',
    country: organization?.country || 'Saudi Arabia',
    city: organization?.city || '',
    is_active: organization?.is_active !== undefined ? organization.is_active : true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'var(--surface)',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{ marginBottom: '24px', color: 'var(--fg)' }}>
          {organization ? 'Edit Organization' : 'Add New Organization'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--fg)' }}>
              Organization Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                backgroundColor: 'var(--bg)',
                color: 'var(--fg)',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--fg)' }}>
              Arabic Name
            </label>
            <input
              type="text"
              value={formData.name_ar}
              onChange={(e) => setFormData({...formData, name_ar: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                backgroundColor: 'var(--bg)',
                color: 'var(--fg)',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--fg)' }}>
              Industry *
            </label>
            <input
              type="text"
              required
              value={formData.industry}
              onChange={(e) => setFormData({...formData, industry: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                backgroundColor: 'var(--bg)',
                color: 'var(--fg)',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--fg)' }}>
              City *
            </label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                backgroundColor: 'var(--bg)',
                color: 'var(--fg)',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              />
              <span style={{ fontWeight: '600', color: 'var(--fg)' }}>Active</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 24px',
                backgroundColor: 'var(--bg-muted)',
                color: 'var(--fg)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '12px 24px',
                backgroundColor: 'var(--accent)',
                color: 'var(--fg-inverse)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {organization ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrganizationsPage;

