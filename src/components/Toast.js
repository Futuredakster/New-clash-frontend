import React, { useState, useEffect } from 'react';

const Toast = ({ 
  message, 
  type = 'info', 
  duration = 4000, 
  onClose,
  position = 'top-right',
  show = false 
}) => {
  const [isVisible, setIsVisible] = useState(show);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsAnimating(true);
      
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  const getTypeClasses = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'status-success',
          icon: 'fas fa-check-circle',
          color: 'text-white'
        };
      case 'error':
        return {
          bg: 'status-error',
          icon: 'fas fa-exclamation-circle',
          color: 'text-white'
        };
      case 'warning':
        return {
          bg: 'status-warning',
          icon: 'fas fa-exclamation-triangle',
          color: 'text-white'
        };
      default:
        return {
          bg: 'status-info',
          icon: 'fas fa-info-circle',
          color: 'text-white'
        };
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'toast-position-top-left';
      case 'top-center':
        return 'toast-position-top-center';
      case 'bottom-left':
        return 'toast-position-bottom-left';
      case 'bottom-center':
        return 'toast-position-bottom-center';
      case 'bottom-right':
        return 'toast-position-bottom-right';
      default:
        return 'toast-position-top-right';
    }
  };

  const typeClasses = getTypeClasses();
  const positionClass = getPositionClasses();

  if (!isVisible) return null;

  return (
    <>
      <div 
        className={`toast-ultra-modern ${positionClass} ${isAnimating ? 'toast-show' : 'toast-hide'}`}
        style={{
          position: 'fixed',
          zIndex: 9999,
          minWidth: '300px',
          maxWidth: '400px'
        }}
      >
        <div 
          className={`${typeClasses.bg} ${typeClasses.color} d-flex align-items-center p-3`}
          style={{
            borderRadius: 'var(--border-radius-lg)',
            boxShadow: 'var(--shadow-heavy)',
            backdrop: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="me-3">
            <i className={`${typeClasses.icon}`} style={{ fontSize: '20px' }}></i>
          </div>
          
          <div className="flex-grow-1">
            <div className="fw-semibold mb-1" style={{ fontSize: '14px' }}>
              {message}
            </div>
          </div>
          
          <button
            className="btn btn-link p-0 ms-2"
            onClick={handleClose}
            style={{ 
              color: 'inherit',
              fontSize: '16px',
              border: 'none',
              background: 'none',
              opacity: 0.8
            }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>

      <style jsx>{`
        .toast-ultra-modern {
          animation-duration: 0.3s;
          animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .toast-show {
          animation-name: toastSlideIn;
          opacity: 1;
          transform: translateX(0) scale(1);
        }

        .toast-hide {
          animation-name: toastSlideOut;
          opacity: 0;
          transform: translateX(100%) scale(0.95);
        }

        .toast-position-top-right {
          top: 20px;
          right: 20px;
        }

        .toast-position-top-left {
          top: 20px;
          left: 20px;
        }

        .toast-position-top-center {
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
        }

        .toast-position-bottom-right {
          bottom: 20px;
          right: 20px;
        }

        .toast-position-bottom-left {
          bottom: 20px;
          left: 20px;
        }

        .toast-position-bottom-center {
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
        }

        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateX(100%) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        @keyframes toastSlideOut {
          from {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateX(100%) scale(0.8);
          }
        }

        @media (max-width: 480px) {
          .toast-ultra-modern {
            left: 10px !important;
            right: 10px !important;
            min-width: auto;
            max-width: none;
            transform: none !important;
          }

          .toast-position-top-center,
          .toast-position-bottom-center {
            left: 10px;
            transform: none;
          }
        }
      `}</style>
    </>
  );
};

// Toast Provider Context
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    
    setToasts(prevToasts => [...prevToasts, newToast]);
    
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            show={true}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Toast Context
const ToastContext = React.createContext();

// Hook to use toast
export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default Toast;