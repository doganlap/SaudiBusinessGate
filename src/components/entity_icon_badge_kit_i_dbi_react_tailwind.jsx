import React from 'react';
import { 
  Building2, Users, Database, Server, Cloud, Shield, 
  Zap, Globe, FileText, Settings, Activity, TrendingUp,
  CheckCircle, XCircle, AlertCircle, Clock, Star,
  Tag, Award, Target, Layers, Box, Package
} from 'lucide-react';

/**
 * ==========================================
 * ENTITY ICON BADGE KIT
 * ==========================================
 * 
 * A comprehensive component kit for displaying entities
 * with icons, badges, and status indicators.
 * 
 * Features:
 * - Multiple entity types (Organization, User, System, etc.)
 * - Status badges (Active, Inactive, Pending, etc.)
 * - Size variants (sm, md, lg, xl)
 * - Color themes
 * - Customizable icons and labels
 * - Badge positioning
 */

// Entity Type Icons Map
const ENTITY_ICONS = {
  organization: Building2,
  user: Users,
  database: Database,
  server: Server,
  cloud: Cloud,
  security: Shield,
  automation: Zap,
  global: Globe,
  document: FileText,
  settings: Settings,
  activity: Activity,
  analytics: TrendingUp,
  system: Server,
  application: Box,
  service: Layers,
  package: Package,
  default: Box
};

// Status Badge Configurations
const STATUS_BADGES = {
  active: {
    label: 'Active',
    color: '#10B981',
    bgColor: '#10B98115',
    icon: CheckCircle
  },
  inactive: {
    label: 'Inactive',
    color: '#6B7280',
    bgColor: '#6B728015',
    icon: XCircle
  },
  pending: {
    label: 'Pending',
    color: '#F59E0B',
    bgColor: '#F59E0B15',
    icon: Clock
  },
  warning: {
    label: 'Warning',
    color: '#F59E0B',
    bgColor: '#F59E0B15',
    icon: AlertCircle
  },
  error: {
    label: 'Error',
    color: '#EF4444',
    bgColor: '#EF444415',
    icon: XCircle
  },
  success: {
    label: 'Success',
    color: '#10B981',
    bgColor: '#10B98115',
    icon: CheckCircle
  },
  featured: {
    label: 'Featured',
    color: '#8B5CF6',
    bgColor: '#8B5CF615',
    icon: Star
  },
  new: {
    label: 'New',
    color: '#3B82F6',
    bgColor: '#3B82F615',
    icon: Tag
  },
  premium: {
    label: 'Premium',
    color: '#F59E0B',
    bgColor: '#F59E0B15',
    icon: Award
  }
};

// Size Configurations
const SIZE_CONFIG = {
  sm: {
    iconSize: 16,
    fontSize: '12px',
    padding: '4px 8px',
    badgeFontSize: '10px',
    gap: '6px'
  },
  md: {
    iconSize: 20,
    fontSize: '14px',
    padding: '6px 12px',
    badgeFontSize: '11px',
    gap: '8px'
  },
  lg: {
    iconSize: 24,
    fontSize: '16px',
    padding: '8px 16px',
    badgeFontSize: '12px',
    gap: '10px'
  },
  xl: {
    iconSize: 32,
    fontSize: '20px',
    padding: '12px 24px',
    badgeFontSize: '14px',
    gap: '12px'
  }
};

/**
 * Entity Icon Badge Component
 * Main component for displaying entities with icons and badges
 */
export const EntityIconBadge = ({
  entityType = 'default',
  label,
  status,
  size = 'md',
  color,
  icon: CustomIcon,
  badgePosition = 'top-right',
  showBadge = true,
  onClick,
  className = '',
  style = {}
}) => {
  const IconComponent = CustomIcon || ENTITY_ICONS[entityType] || ENTITY_ICONS.default;
  const config = SIZE_CONFIG[size] || SIZE_CONFIG.md;
  const statusConfig = status ? STATUS_BADGES[status] : null;
  const entityColor = color || '#3B82F6';

  const containerStyle = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    gap: config.gap,
    padding: config.padding,
    borderRadius: '8px',
    backgroundColor: 'var(--surface)',
    border: `1px solid var(--border)`,
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.2s ease',
    fontSize: config.fontSize,
    fontWeight: '600',
    color: 'var(--fg)',
    ...style
  };

  const iconStyle = {
    width: config.iconSize,
    height: config.iconSize,
    color: entityColor,
    flexShrink: 0
  };

  const badgeStyle = {
    position: 'absolute',
    ...(badgePosition === 'top-right' && { top: '-4px', right: '-4px' }),
    ...(badgePosition === 'top-left' && { top: '-4px', left: '-4px' }),
    ...(badgePosition === 'bottom-right' && { bottom: '-4px', right: '-4px' }),
    ...(badgePosition === 'bottom-left' && { bottom: '-4px', left: '-4px' }),
    padding: '2px 6px',
    borderRadius: '10px',
    fontSize: config.badgeFontSize,
    fontWeight: '700',
    backgroundColor: statusConfig?.bgColor || entityColor + '15',
    color: statusConfig?.color || entityColor,
    border: `1px solid ${statusConfig?.color || entityColor}30`,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    whiteSpace: 'nowrap',
    zIndex: 10,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  return (
    <div
      className={className}
      style={containerStyle}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.borderColor = entityColor;
          e.currentTarget.style.backgroundColor = entityColor + '10';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = `0 4px 12px ${entityColor}30`;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.backgroundColor = 'var(--surface)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      <IconComponent style={iconStyle} />
      {label && <span>{label}</span>}
      {showBadge && statusConfig && (
        <div style={badgeStyle}>
          {statusConfig.icon && <statusConfig.icon size={config.badgeFontSize} />}
          <span>{statusConfig.label}</span>
        </div>
      )}
    </div>
  );
};

/**
 * Entity Badge Only Component
 * Just the badge without icon
 */
export const EntityBadge = ({
  status,
  label,
  size = 'md',
  color,
  icon,
  onClick,
  className = '',
  style = {}
}) => {
  const statusConfig = status ? STATUS_BADGES[status] : null;
  const config = SIZE_CONFIG[size] || SIZE_CONFIG.md;
  const badgeColor = color || statusConfig?.color || '#3B82F6';
  const BadgeIcon = icon || statusConfig?.icon;

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: config.padding,
    borderRadius: '8px',
    fontSize: config.fontSize,
    fontWeight: '600',
    backgroundColor: statusConfig?.bgColor || badgeColor + '15',
    color: statusConfig?.color || badgeColor,
    border: `1px solid ${(statusConfig?.color || badgeColor)}30`,
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.2s ease',
    ...style
  };

  return (
    <div
      className={className}
      style={badgeStyle}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = `0 4px 12px ${badgeColor}30`;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {BadgeIcon && <BadgeIcon size={config.iconSize} />}
      <span>{label || statusConfig?.label}</span>
    </div>
  );
};

/**
 * Entity Icon Only Component
 * Just the icon without label
 */
export const EntityIcon = ({
  entityType = 'default',
  size = 'md',
  color,
  icon: CustomIcon,
  onClick,
  className = '',
  style = {}
}) => {
  const IconComponent = CustomIcon || ENTITY_ICONS[entityType] || ENTITY_ICONS.default;
  const config = SIZE_CONFIG[size] || SIZE_CONFIG.md;
  const entityColor = color || '#3B82F6';

  const iconStyle = {
    width: config.iconSize,
    height: config.iconSize,
    color: entityColor,
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.2s ease',
    ...style
  };

  return (
    <IconComponent
      className={className}
      style={iconStyle}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.color = entityColor;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'scale(1)';
        }
      }}
    />
  );
};

/**
 * Entity List Component
 * Display multiple entities in a list
 */
export const EntityList = ({
  entities = [],
  size = 'md',
  showBadges = true,
  onClick,
  className = '',
  style = {}
}) => {
  const listStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    ...style
  };

  return (
    <div className={className} style={listStyle}>
      {entities.map((entity, index) => (
        <EntityIconBadge
          key={entity.id || index}
          entityType={entity.type}
          label={entity.label}
          status={entity.status}
          size={size}
          color={entity.color}
          icon={entity.icon}
          showBadge={showBadges}
          onClick={() => onClick && onClick(entity)}
        />
      ))}
    </div>
  );
};

/**
 * Entity Grid Component
 * Display multiple entities in a grid
 */
export const EntityGrid = ({
  entities = [],
  columns = 3,
  size = 'md',
  showBadges = true,
  onClick,
  className = '',
  style = {}
}) => {
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: '16px',
    ...style
  };

  return (
    <div className={className} style={gridStyle}>
      {entities.map((entity, index) => (
        <EntityIconBadge
          key={entity.id || index}
          entityType={entity.type}
          label={entity.label}
          status={entity.status}
          size={size}
          color={entity.color}
          icon={entity.icon}
          showBadge={showBadges}
          onClick={() => onClick && onClick(entity)}
        />
      ))}
    </div>
  );
};

/**
 * Entity Card Component
 * Full card with icon, label, description, and badges
 */
export const EntityCard = ({
  entityType = 'default',
  label,
  description,
  status,
  badges = [],
  size = 'md',
  color,
  icon: CustomIcon,
  onClick,
  className = '',
  style = {}
}) => {
  const IconComponent = CustomIcon || ENTITY_ICONS[entityType] || ENTITY_ICONS.default;
  const config = SIZE_CONFIG[size] || SIZE_CONFIG.md;
  const entityColor = color || '#3B82F6';
  const statusConfig = status ? STATUS_BADGES[status] : null;

  const cardStyle = {
    padding: '20px',
    borderRadius: '12px',
    backgroundColor: 'var(--surface)',
    border: `1px solid var(--border)`,
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.2s ease',
    ...style
  };

  return (
    <div
      className={className}
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.borderColor = entityColor;
          e.currentTarget.style.boxShadow = `0 8px 24px ${entityColor}20`;
          e.currentTarget.style.transform = 'translateY(-4px)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <IconComponent size={config.iconSize} style={{ color: entityColor }} />
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: config.fontSize, fontWeight: '700', margin: 0, color: 'var(--fg)' }}>
            {label}
          </h3>
          {statusConfig && (
            <EntityBadge status={status} size="sm" style={{ marginTop: '4px' }} />
          )}
        </div>
      </div>
      {description && (
        <p style={{ fontSize: '14px', color: 'var(--fg-muted)', margin: '0 0 12px 0', lineHeight: 1.5 }}>
          {description}
        </p>
      )}
      {badges.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {badges.map((badge, index) => (
            <EntityBadge
              key={index}
              status={badge.status}
              label={badge.label}
              size="sm"
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Export all components
export default {
  EntityIconBadge,
  EntityBadge,
  EntityIcon,
  EntityList,
  EntityGrid,
  EntityCard,
  ENTITY_ICONS,
  STATUS_BADGES,
  SIZE_CONFIG
};

