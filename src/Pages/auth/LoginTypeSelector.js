import React, { useState } from 'react';
import { User, Users } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const LoginTypeSelector = () => {
  const [selectedType, setSelectedType] = useState(null);
const navigate = useNavigate();

  const registrationTypes = [
    {
      id: 'participant',
      title: 'Login as a Participant',
      description: 'I want to login for myself',
      icon: User,
    },
    {
      id: 'parent',
      title: 'Login as Parent/Guardian',
      description: 'I want to login as a parent/guardian',
      icon: Users,
    }
  ];

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    switch(type) {
      case 'participant':
        navigate('/ParticipetnVer');
        break;
      case 'parent':
        navigate('/ParentVer');
        break;
      default:
        break;
    }
  };

  return (
    <div className="container-modern py-5" style={{ minHeight: 'calc(100vh - 76px)' }}>
      {/* Page Header */}
      <div className="page-header-modern mb-4">
        <h1 className="page-title-modern">Sign In</h1>
        <p className="page-subtitle-modern">Choose how you'd like to sign in for the karate tournament</p>
      </div>

      {/* Registration Type Cards */}
      <div className="row justify-content-center g-4">
        {registrationTypes.map((type) => {
          const IconComponent = type.icon;
          return (
            <div className="col-12 col-md-6" key={type.id}>
              <div
                className={`card-modern h-100 shadow-sm ${selectedType === type.id ? 'border border-dark' : ''} cursor-pointer`}
                style={{ transition: 'box-shadow 0.3s', boxShadow: selectedType === type.id ? 'var(--shadow-medium)' : 'var(--shadow-light)' }}
              >
                <div className="card-modern-body text-center">
                  <div className="d-flex justify-content-center align-items-center mb-3">
                    <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 56, height: 56 }}>
                      <IconComponent size={32} />
                    </div>
                  </div>
                  <h3 className="fw-bold mb-2" style={{ color: 'var(--dark-grey)' }}>{type.title}</h3>
                  <p className="mb-4" style={{ color: 'var(--text-grey)' }}>{type.description}</p>
                  {type.id === 'participant' ? (
                    <>
                      <button className="btn-modern w-100" style={{ minWidth: 0, paddingLeft: 0, paddingRight: 0 }} onClick={() => handleTypeSelect(type.id)}>Sign In</button>
                    </>
                  ) : (
                    <>
                      <button className="btn-modern w-100" style={{ minWidth: 0, paddingLeft: 0, paddingRight: 0 }} onClick={() => handleTypeSelect(type.id)}>Sign In</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="mt-5 text-center">
        <p className="text-muted">
          Need help? Contact us at{' '}
          <a href="mailto:support@tournament.com" className="text-dark fw-bold text-decoration-underline">
            support@tournament.com
          </a>
        </p>
      </div>

      {/* Selected Type Display (for demo) */}
      {selectedType && (
        <div className="mt-4 card-modern p-3 text-center border border-success">
          <span className="fw-bold text-success">
            Selected: {registrationTypes.find(t => t.id === selectedType)?.title}
          </span>
        </div>
      )}
    </div>
  );
};

export default LoginTypeSelector;