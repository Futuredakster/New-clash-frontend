import React from 'react';

const LoadingSpinner = ({ size = 'md', message = 'Loading...', variant = 'primary' }) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return { spinner: '24px', text: '14px' };
      case 'lg': return { spinner: '64px', text: '18px' };
      default: return { spinner: '40px', text: '16px' };
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'white': return 'text-white';
      case 'dark': return 'text-dark';
      default: return 'text-primary';
    }
  };

  const sizeClasses = getSizeClasses();
  const variantClass = getVariantClasses();

  return (
    <div className="d-flex flex-column align-items-center justify-content-center p-4">
      <div 
        className={`loading-shimmer ${variantClass}`}
        style={{
          width: sizeClasses.spinner,
          height: sizeClasses.spinner,
          border: `3px solid currentColor`,
          borderRadius: '50%',
          borderTopColor: 'transparent',
          animation: 'spin 1s linear infinite, pulse 2s ease-in-out infinite',
          marginBottom: '12px'
        }}
      ></div>
      {message && (
        <div 
          className={`${variantClass} fw-medium`}
          style={{ 
            fontSize: sizeClasses.text,
            opacity: 0.8,
            animation: 'fadeIn 0.5s ease-out'
          }}
        >
          {message}
        </div>
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;