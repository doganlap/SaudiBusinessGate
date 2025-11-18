import React from 'react';
import {
  EntityIconBadge,
  EntityBadge,
  EntityIcon,
  EntityList,
  EntityGrid,
  EntityCard
} from './entity_icon_badge_kit_i_dbi_react_tailwind';

/**
 * ==========================================
 * ENTITY BADGE KIT - USAGE EXAMPLES
 * ==========================================
 * 
 * This file demonstrates how to use the Entity Icon Badge Kit
 * components in your application.
 */

export const EntityBadgeKitExamples = () => {
  // Sample entities data
  const sampleEntities = [
    { id: 1, type: 'organization', label: 'Acme Corp', status: 'active', color: '#3B82F6' },
    { id: 2, type: 'user', label: 'John Doe', status: 'active', color: '#10B981' },
    { id: 3, type: 'server', label: 'Production Server', status: 'warning', color: '#F59E0B' },
    { id: 4, type: 'database', label: 'Main Database', status: 'active', color: '#8B5CF6' },
    { id: 5, type: 'cloud', label: 'AWS Cloud', status: 'success', color: '#06B6D4' },
    { id: 6, type: 'security', label: 'Security System', status: 'active', color: '#EF4444' }
  ];

  return (
    <div style={{ padding: '32px', backgroundColor: 'var(--bg)' }}>
      <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '32px' }}>
        Entity Icon Badge Kit Examples
      </h1>

      {/* Basic Entity Icon Badge */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>
          Basic Entity Icon Badge
        </h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <EntityIconBadge entityType="organization" label="Organization" status="active" />
          <EntityIconBadge entityType="user" label="User" status="active" />
          <EntityIconBadge entityType="server" label="Server" status="warning" />
          <EntityIconBadge entityType="database" label="Database" status="active" />
        </div>
      </section>

      {/* Size Variants */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>
          Size Variants
        </h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <EntityIconBadge entityType="organization" label="Small" size="sm" status="active" />
          <EntityIconBadge entityType="organization" label="Medium" size="md" status="active" />
          <EntityIconBadge entityType="organization" label="Large" size="lg" status="active" />
          <EntityIconBadge entityType="organization" label="Extra Large" size="xl" status="active" />
        </div>
      </section>

      {/* Status Badges */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>
          Status Badges
        </h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <EntityBadge status="active" />
          <EntityBadge status="inactive" />
          <EntityBadge status="pending" />
          <EntityBadge status="warning" />
          <EntityBadge status="error" />
          <EntityBadge status="success" />
          <EntityBadge status="featured" />
          <EntityBadge status="new" />
          <EntityBadge status="premium" />
        </div>
      </section>

      {/* Entity Icons Only */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>
          Entity Icons Only
        </h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <EntityIcon entityType="organization" size="lg" />
          <EntityIcon entityType="user" size="lg" />
          <EntityIcon entityType="server" size="lg" />
          <EntityIcon entityType="database" size="lg" />
          <EntityIcon entityType="cloud" size="lg" />
          <EntityIcon entityType="security" size="lg" />
        </div>
      </section>

      {/* Entity List */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>
          Entity List
        </h2>
        <EntityList entities={sampleEntities} size="md" />
      </section>

      {/* Entity Grid */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>
          Entity Grid
        </h2>
        <EntityGrid entities={sampleEntities} columns={3} size="md" />
      </section>

      {/* Entity Cards */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>
          Entity Cards
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <EntityCard
            entityType="organization"
            label="Acme Corporation"
            description="Leading technology company specializing in enterprise solutions"
            status="active"
            badges={[{ status: 'featured' }, { status: 'premium' }]}
          />
          <EntityCard
            entityType="server"
            label="Production Server"
            description="Main production server hosting critical applications"
            status="warning"
            badges={[{ status: 'active' }]}
          />
          <EntityCard
            entityType="database"
            label="Customer Database"
            description="Primary database containing customer information"
            status="active"
            badges={[{ status: 'active' }, { status: 'new' }]}
          />
        </div>
      </section>

      {/* Custom Colors */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>
          Custom Colors
        </h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <EntityIconBadge entityType="organization" label="Blue" color="#3B82F6" status="active" />
          <EntityIconBadge entityType="user" label="Green" color="#10B981" status="active" />
          <EntityIconBadge entityType="server" label="Purple" color="#8B5CF6" status="active" />
          <EntityIconBadge entityType="database" label="Orange" color="#F59E0B" status="active" />
          <EntityIconBadge entityType="cloud" label="Cyan" color="#06B6D4" status="active" />
        </div>
      </section>
    </div>
  );
};

export default EntityBadgeKitExamples;

