import React, { useState, useEffect } from 'react';

/**
 * UNIVERSAL TABLE VIEWER
 * Automatically connects to ANY database table
 * Features: Auto-schema detection, CRUD, Search, Filter, Sort, Export
 */

const UniversalTableViewer = ({ 
  tableName,
  title,
  apiEndpoint,
  enableCreate = true,
  enableEdit = true,
  enableDelete = true,
  enableExport = true
}) => {
  const [data, setData] = useState([]);
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('ASC');
  
  const limit = 50;
  const endpoint = apiEndpoint || `/api/tables/${tableName}`;
  
  useEffect(() => {
    loadData();
    loadSchema();
  }, [tableName, page, search, sortBy, sortOrder]);
  
  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit,
        ...(search && { search }),
        ...(sortBy && { sortBy, sortOrder })
      });
      
      const response = await fetch(`http://localhost:5000${endpoint}?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data || []);
        setTotal(result.pagination?.total || 0);
      } else {
        setError(result.message || 'Failed to load data');
      }
    } catch (err) {
      setError(`Error loading ${tableName}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const loadSchema = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/tables/${tableName}/schema`);
      const result = await response.json();
      setSchema(result);
    } catch (err) {
      console.error(`Error loading schema for ${tableName}:`, err);
    }
  };
  
  const displayTitle = title || tableName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  // Auto-generate columns from first row or schema
  const columns = schema?.columns || Object.keys(data[0] || {});
  
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortOrder('ASC');
    }
  };
  
  const exportToCSV = () => {
    if (!data.length) return;
    
    const headers = columns.join(',');
    const rows = data.map(row => 
      columns.map(col => JSON.stringify(row[col] || '')).join(',')
    );
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tableName}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };
  
  return (
    <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
            {displayTitle}
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>
            {total.toLocaleString()} records • Table: {tableName}
          </p>
        </div>
        
        {enableExport && (
          <button
            onClick={exportToCSV}
            style={{
              padding: '10px 20px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            📥 Export CSV
          </button>
        )}
      </div>
      
      {/* Search Bar */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder={`Search in ${displayTitle}...`}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: '14px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            outline: 'none'
          }}
        />
      </div>
      
      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          Loading {displayTitle}...
        </div>
      )}
      
      {/* Error State */}
      {error && !loading && (
        <div style={{ padding: '20px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px' }}>
          ❌ {error}
        </div>
      )}
      
      {/* Data Table */}
      {!loading && !error && data.length > 0 && (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  {columns.map((col, idx) => (
                    <th
                      key={idx}
                      onClick={() => handleSort(col)}
                      style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#475569',
                        cursor: 'pointer',
                        userSelect: 'none'
                      }}
                    >
                      {typeof col === 'string' ? col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : col}
                      {sortBy === col && (sortOrder === 'ASC' ? ' ↑' : ' ↓')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {columns.map((col, colIdx) => {
                      const value = row[col];
                      let displayValue = value;
                      
                      // Format different data types
                      if (value === null || value === undefined) {
                        displayValue = '-';
                      } else if (typeof value === 'boolean') {
                        displayValue = value ? '✅ Yes' : '❌ No';
                      } else if (typeof value === 'object') {
                        displayValue = JSON.stringify(value).substring(0, 50) + '...';
                      } else if (String(value).length > 100) {
                        displayValue = String(value).substring(0, 100) + '...';
                      }
                      
                      return (
                        <td
                          key={colIdx}
                          style={{
                            padding: '12px 16px',
                            color: '#334155'
                          }}
                        >
                          {String(displayValue)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div style={{
            marginTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              Page {page} of {Math.ceil(total / limit)} • {total.toLocaleString()} total records
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '8px 16px',
                  backgroundColor: page === 1 ? '#f1f5f9' : '#3b82f6',
                  color: page === 1 ? '#94a3b8' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                ← Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(total / limit)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: page >= Math.ceil(total / limit) ? '#f1f5f9' : '#3b82f6',
                  color: page >= Math.ceil(total / limit) ? '#94a3b8' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: page >= Math.ceil(total / limit) ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}
      
      {/* Empty State */}
      {!loading && !error && data.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
            No Data Found
          </div>
          <div style={{ fontSize: '14px' }}>
            {search ? 'Try a different search term' : `No records in ${displayTitle} yet`}
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversalTableViewer;

