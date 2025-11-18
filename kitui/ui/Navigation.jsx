import React from 'react';
import { Link } from 'react-router-dom';

export const Breadcrumbs = ({ items = [], separator = '›', theme = 'default' }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span style={{ color: 'var(--fg-muted)', margin: '0 4px' }}>{separator}</span>}
          {index === items.length - 1 ? (
            <span style={{ color: 'var(--fg)', fontWeight: '600' }}>{item.label}</span>
          ) : (
            <Link
              to={item.path}
              style={{
                color: 'var(--fg-muted)',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-accent)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--fg-muted)'}
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

