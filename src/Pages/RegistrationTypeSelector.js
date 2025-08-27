import React, { useState } from 'react';
import { User, Users } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const RegistrationTypeSelector = () => {
  const [selectedType, setSelectedType] = useState(null);
const navigate = useNavigate();

  const registrationTypes = [
    {
      id: 'participant',
      title: 'Register Myself',
      description: 'I want to compete in the tournament',
      icon: User,
    },
    {
      id: 'parent',
      title: 'Register as Parent/Guardian',
      description: 'I want to register my children for the tournament',
      icon: Users,
    }
  ];

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    switch(type) {
      case 'participant':
        navigate('/ParticipantLogin');
        break;
      case 'parent':
        navigate('/ParentRegistration');
        break;
      default:
        break;
    }
  };

  return (
    <div className="container-modern py-5" style={{ minHeight: 'calc(100vh - 76px)' }}>
      {/* Page Header */}
      <div className="page-header-modern mb-4">
        <h1 className="page-title-modern">Join the Tournament</h1>
        <p className="page-subtitle-modern">Choose how you'd like to register for the karate tournament</p>
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
                      <button className="btn-modern w-100" style={{ minWidth: 0, paddingLeft: 0, paddingRight: 0 }} onClick={() => handleTypeSelect(type.id)}>Get Started</button>
                      <div className="text-center mt-3">
                        <small className="text-muted">
                          Signed up already?{' '}
                          <Link to="/PartEmailVer" className="text-dark fw-bold">login here</Link>
                        </small>
                      </div>
                    </>
                  ) : (
                    <>
                      <button className="btn-modern w-100" style={{ minWidth: 0, paddingLeft: 0, paddingRight: 0 }} onClick={() => handleTypeSelect(type.id)}>Get Started</button>
                      <div className="text-center mt-3">
                        <small className="text-muted">
                          Signed up already?{' '}
                          <Link to="/ParentEmailVer" className="text-dark fw-bold">login here</Link>
                        </small>
                      </div>
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

export default RegistrationTypeSelector;