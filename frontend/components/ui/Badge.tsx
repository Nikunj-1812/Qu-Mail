import React from 'react';
import { SecurityLevel } from '@/types/mail';

interface BadgeProps {
  level?: SecurityLevel;
  variant?: 'level-1' | 'level-2' | 'level-3' | 'default' | 'success' | 'danger';
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({ level, variant, children, className = '', style }) => {
  let badgeClass = 'badge';

  if (level) {
    badgeClass += ` badge-level-${level}`;
  } else if (variant) {
    badgeClass += ` badge-${variant}`;
  } else {
    badgeClass += ' badge-level-2';
  }

  return <span className={`${badgeClass} ${className}`} style={style}>{children}</span>;
};

