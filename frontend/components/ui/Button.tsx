import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'switch';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const variantClass = variant === 'switch' ? 'btn-switch' : `btn btn-${variant}`;

  return (
    <button
      className={`${variantClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <svg
            style={{ animation: 'spin 1s linear infinite', width: 16, height: 16 }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};
