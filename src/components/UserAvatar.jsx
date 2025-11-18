import React from 'react';

const UserAvatar = ({ user, size = 'md' }) => {
  const sizeMap = {
    sm: '32px',
    md: '40px',
    lg: '56px'
  };

  const fontSizeMap = {
    sm: '12px',
    md: '14px',
    lg: '20px'
  };

  const avatarSize = sizeMap[size] || sizeMap.md;
  const fontSize = fontSizeMap[size] || fontSizeMap.md;

  const initials = user?.initials || 
    `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || 
    'U';

  return (
    <div
      style={{
        width: avatarSize,
        height: avatarSize,
        borderRadius: '50%',
        backgroundColor: user?.avatar_color || '#3B82F6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: fontSize,
        fontWeight: '700',
        flexShrink: 0
      }}
      title={`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'User'}
    >
      {initials}
    </div>
  );
};

export default UserAvatar;

