import React, { useEffect } from 'react';
import { Modal } from 'react-bootstrap';

const ModernModal = ({ 
  show, 
  onHide, 
  title, 
  children, 
  size = 'lg',
  centered = true,
  backdrop = true,
  keyboard = true,
  variant = 'default',
  footerActions = null,
  headerIcon = null
}) => {
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return {
          headerBg: 'bg-success',
          headerText: 'text-white',
          borderColor: 'border-success'
        };
      case 'warning':
        return {
          headerBg: 'bg-warning',
          headerText: 'text-dark',
          borderColor: 'border-warning'
        };
      case 'danger':
        return {
          headerBg: 'bg-danger',
          headerText: 'text-white',
          borderColor: 'border-danger'
        };
      case 'info':
        return {
          headerBg: 'bg-info',
          headerText: 'text-white',
          borderColor: 'border-info'
        };
      default:
        return {
          headerBg: 'bg-light',
          headerText: 'text-dark',
          borderColor: 'border-light'
        };
    }
  };

  const variantClasses = getVariantClasses();

  return (
    <>
      <Modal 
        show={show} 
        onHide={onHide}
        size={size}
        centered={centered}
        backdrop={backdrop}
        keyboard={keyboard}
        className="modern-modal"
      >
        <div className="modal-ultra-modern">
          <Modal.Header 
            className={`${variantClasses.headerBg} ${variantClasses.headerText} border-0`}
            closeButton
            style={{
              borderRadius: 'var(--border-radius-lg) var(--border-radius-lg) 0 0',
              padding: '20px 24px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Modal.Title className="d-flex align-items-center fw-bold" style={{ fontSize: '18px' }}>
              {headerIcon && (
                <div className="me-3 float-element">
                  <i className={headerIcon} style={{ fontSize: '24px' }}></i>
                </div>
              )}
              {title}
            </Modal.Title>
            
            {/* Header gradient overlay */}
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.7), rgba(255,255,255,0.3))',
                zIndex: 1
              }}
            ></div>
          </Modal.Header>
          
          <Modal.Body 
            style={{
              padding: '24px',
              backgroundColor: '#fafafa',
              position: 'relative'
            }}
          >
            <div className="animate-fade-in">
              {children}
            </div>
          </Modal.Body>
          
          {footerActions && (
            <Modal.Footer 
              className="bg-light border-0 d-flex justify-content-between align-items-center"
              style={{
                borderRadius: '0 0 var(--border-radius-lg) var(--border-radius-lg)',
                padding: '16px 24px'
              }}
            >
              {footerActions}
            </Modal.Footer>
          )}
        </div>
      </Modal>

      <style jsx>{`
        .modal-ultra-modern {
          background: white;
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow-heavy);
          overflow: hidden;
          position: relative;
        }

        .modal-ultra-modern::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.05) 100%);
          pointer-events: none;
          z-index: 0;
        }

        .modal-ultra-modern > * {
          position: relative;
          z-index: 1;
        }

        .modern-modal .modal-dialog {
          transition: all var(--transition-medium);
          animation: modalSlideIn 0.3s ease-out;
        }

        .modern-modal .modal-backdrop {
          backdrop-filter: blur(8px);
          background: rgba(0, 0, 0, 0.4);
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-50px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 768px) {
          .modern-modal .modal-dialog {
            margin: 10px;
          }
          
          .modal-ultra-modern {
            border-radius: var(--border-radius-md);
          }
        }
      `}</style>
    </>
  );
};

// Pre-built Modal Types
export const ConfirmModal = ({ 
  show, 
  onHide, 
  onConfirm, 
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning'
}) => {
  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onHide();
  };

  const footerActions = (
    <>
      <button 
        className="btn btn-outline-secondary click-ripple"
        onClick={onHide}
        style={{ minWidth: '80px' }}
      >
        {cancelText}
      </button>
      <button 
        className="btn-ultra-modern"
        onClick={handleConfirm}
        style={{ minWidth: '80px' }}
      >
        {confirmText}
      </button>
    </>
  );

  return (
    <ModernModal
      show={show}
      onHide={onHide}
      title={title}
      size="md"
      variant={variant}
      headerIcon="fas fa-question-circle"
      footerActions={footerActions}
    >
      <p style={{ fontSize: '16px', lineHeight: '1.5', marginBottom: 0 }}>
        {message}
      </p>
    </ModernModal>
  );
};

export const AlertModal = ({ 
  show, 
  onHide, 
  title = 'Alert',
  message,
  okText = 'OK',
  variant = 'info'
}) => {
  const footerActions = (
    <button 
      className="btn-ultra-modern"
      onClick={onHide}
      style={{ minWidth: '80px' }}
    >
      {okText}
    </button>
  );

  const getIcon = () => {
    switch (variant) {
      case 'success': return 'fas fa-check-circle';
      case 'danger': return 'fas fa-exclamation-circle';
      case 'warning': return 'fas fa-exclamation-triangle';
      default: return 'fas fa-info-circle';
    }
  };

  return (
    <ModernModal
      show={show}
      onHide={onHide}
      title={title}
      size="md"
      variant={variant}
      headerIcon={getIcon()}
      footerActions={footerActions}
    >
      <p style={{ fontSize: '16px', lineHeight: '1.5', marginBottom: 0 }}>
        {message}
      </p>
    </ModernModal>
  );
};

export default ModernModal;