import React, { useState, useContext, useEffect } from 'react';
import { User, Users, Calendar, Award, ArrowRight, ArrowLeft, Check, Plus, Trash2 } from 'lucide-react';
import { link } from '../constant';
import {AuthContext} from '../helpers/AuthContext';
import { useNavigate } from 'react-router-dom';

const ParentRegistrationForm = () => {
    const { parentState, setParentState } = useContext(AuthContext);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Parent data
  const [parentData, setParentData] = useState({
    name: '',
    email: ''
  });

  // Children data
  const [children, setChildren] = useState([
    {
      id: Date.now(),
      name: '',
      date_of_birth: '',
      belt_color: 'White'
    }
  ]);

  const [errors, setErrors] = useState({});

  const beltColors = [
    'White', 'Yellow', 'Orange', 'Green', 'Purple', 'Brown', 'Black'
  ];

  const steps = [
    { number: 1, title: 'Parent Info', icon: User },
    { number: 2, title: 'Add Children', icon: Users },
    { number: 3, title: 'Review & Submit', icon: Check }
  ];

  // Check if parent is already authenticated on page load
  useEffect(() => {
    if (parentState.status && parentState.id) {
      setCurrentStep(2);
      setParentData({
        name: parentState.name,
        email: ''
      });
    }
  }, [parentState.status, parentState.id, parentState.name]);

  // Handle parent form changes
  const handleParentChange = (field, value) => {
    setParentData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle child form changes
  const handleChildChange = (childId, field, value) => {
    setChildren(prev => prev.map(child => 
      child.id === childId ? { ...child, [field]: value } : child
    ));
  };

  // Add new child
  const addChild = () => {
    setChildren(prev => [...prev, {
      id: Date.now(),
      name: '',
      date_of_birth: '',
      belt_color: 'White'
    }]);
  };

  // Remove child
  const removeChild = (childId) => {
    if (children.length > 1) {
      setChildren(prev => prev.filter(child => child.id !== childId));
    }
  };

  // Validate step 1
  const validateStep1 = () => {
    const newErrors = {};
    if (!parentData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!parentData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(parentData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate step 2
  const validateStep2 = () => {
    const newErrors = {};
    children.forEach((child, index) => {
      if (!child.name.trim()) {
        newErrors[`child_${child.id}_name`] = 'Child name is required';
      }
      if (!child.date_of_birth) {
        newErrors[`child_${child.id}_dob`] = 'Date of birth is required';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = async () => {
    if (currentStep === 1 && validateStep1()) {
      // Create parent account when moving from step 1 to 2
      await createParentAccount();
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  // Create parent account
  const createParentAccount = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${link}/parents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: parentData.name,
          email: parentData.email
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create parent account');
      }

      const result = await response.json();
      
      // Store the token and parent info
      localStorage.setItem('parentToken', result.parentToken);
      setParentState({
        id:result.id,
        name:result.name,
        status:true
       })
      
      
      // Move to next step
      setCurrentStep(2);
      
    } catch (error) {
      console.error('Parent registration error:', error);
      setErrors({ parent: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Submit registration (create children)
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('parentToken');
      const parentId = parentState.id;
      
      if (!token || !parentId) {
        throw new Error('Parent account not found. Please restart registration.');
      }
      
      // Create children participants
      const response = await fetch(`${link}/parents/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'parentAccessToken': token
        },
        body: JSON.stringify({
          parent_id: parentId,
          children: children.map(child => ({
            name: child.name,
            date_of_birth: child.date_of_birth,
            belt_color: child.belt_color
          }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to register children');
      }

      const result = await response.json();
      
      alert(`Registration complete! ${children.length} children registered successfully.`);
      navigate("/CompetitorView");


      
    } catch (error) {
      console.error('Children registration error:', error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-modern py-5" style={{ minHeight: 'calc(100vh - 76px)' }}>
      {/* Page Header */}
      <div className="page-header-modern mb-4">
        <h1 className="page-title-modern">Parent Registration</h1>
        <p className="page-subtitle-modern">Register your family for the karate tournament</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;
            return (
              <div key={step.number} className="d-flex align-items-center">
                <div className={`d-flex align-items-center justify-content-center rounded-circle border ${isActive ? 'bg-primary border-primary text-white' : isCompleted ? 'bg-success border-success text-white' : 'bg-white border-secondary text-secondary'}`} style={{ width: 48, height: 48, fontSize: 20 }}>
                  <StepIcon size={20} />
                </div>
                <div className="ms-3">
                  <div className={`fw-medium small ${isActive ? 'text-primary' : 'text-secondary'}`}>Step {step.number}</div>
                  <div className={`small ${isActive ? 'text-dark' : 'text-muted'}`}>{step.title}</div>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="mx-4 text-secondary" size={20} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="card-modern p-4">
        {/* Step 1: Parent Info */}
        {currentStep === 1 && (
          <div className="mb-4">
            <h2 className="fw-bold mb-3" style={{ color: 'var(--dark-grey)' }}>Your Information</h2>
            <div className="mb-3">
              <label className="form-label-modern">Your Name *</label>
              <input
                type="text"
                value={parentData.name}
                onChange={(e) => handleParentChange('name', e.target.value)}
                className={`form-control-modern ${errors.name ? 'border-danger' : ''}`}
                placeholder="Enter your full name"
              />
              {errors.name && <div className="text-danger small mt-1">{errors.name}</div>}
            </div>
            <div className="mb-3">
              <label className="form-label-modern">Email Address *</label>
              <input
                type="email"
                value={parentData.email}
                onChange={(e) => handleParentChange('email', e.target.value)}
                className={`form-control-modern ${errors.email ? 'border-danger' : ''}`}
                placeholder="Enter your email address"
              />
              {errors.email && <div className="text-danger small mt-1">{errors.email}</div>}
            </div>
            {errors.parent && (
              <div className="alert alert-danger mt-3">{errors.parent}</div>
            )}
          </div>
        )}

        {/* Step 2: Add Children */}
        {currentStep === 2 && (
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="fw-bold mb-0" style={{ color: 'var(--dark-grey)' }}>Add Your Children</h2>
              <button
                onClick={addChild}
                className="btn btn-success d-flex align-items-center"
                type="button"
              >
                <Plus size={16} className="me-2" />
                Add Child
              </button>
            </div>
            {children.map((child, index) => (
              <div key={child.id} className="card mb-3 p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h3 className="fw-bold mb-0" style={{ color: 'var(--dark-grey)' }}>Child {index + 1}</h3>
                  {children.length > 1 && (
                    <button
                      onClick={() => removeChild(child.id)}
                      className="btn btn-outline-danger btn-sm"
                      type="button"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label-modern">Child's Name *</label>
                    <input
                      type="text"
                      value={child.name}
                      onChange={(e) => handleChildChange(child.id, 'name', e.target.value)}
                      className={`form-control-modern ${errors[`child_${child.id}_name`] ? 'border-danger' : ''}`}
                      placeholder="Enter child's name"
                    />
                    {errors[`child_${child.id}_name`] && (
                      <div className="text-danger small mt-1">{errors[`child_${child.id}_name`]}</div>
                    )}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label-modern">Date of Birth *</label>
                    <input
                      type="date"
                      value={child.date_of_birth}
                      onChange={(e) => handleChildChange(child.id, 'date_of_birth', e.target.value)}
                      className={`form-control-modern ${errors[`child_${child.id}_dob`] ? 'border-danger' : ''}`}
                    />
                    {errors[`child_${child.id}_dob`] && (
                      <div className="text-danger small mt-1">{errors[`child_${child.id}_dob`]}</div>
                    )}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label-modern">Belt Color</label>
                    <select
                      value={child.belt_color}
                      onChange={(e) => handleChildChange(child.id, 'belt_color', e.target.value)}
                      className="form-control-modern"
                    >
                      {beltColors.map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div className="mb-4">
            <h2 className="fw-bold mb-3" style={{ color: 'var(--dark-grey)' }}>Review & Submit</h2>
            <div className="card mb-3 p-3 bg-light">
              <h3 className="fw-bold mb-2" style={{ color: 'var(--dark-grey)' }}>Parent Information</h3>
              <div className="row g-3">
                <div className="col-md-6 small"><span className="fw-bold">Name:</span> {parentData.name}</div>
                <div className="col-md-6 small"><span className="fw-bold">Email:</span> {parentData.email}</div>
              </div>
            </div>
            <div className="card mb-3 p-3 bg-light">
              <h3 className="fw-bold mb-2" style={{ color: 'var(--dark-grey)' }}>Children ({children.length})</h3>
              {children.map((child, index) => (
                <div key={child.id} className="card mb-2 p-2">
                  <div className="row g-2">
                    <div className="col-md-4 small"><span className="fw-bold">Name:</span> {child.name}</div>
                    <div className="col-md-4 small"><span className="fw-bold">DOB:</span> {child.date_of_birth}</div>
                    <div className="col-md-4 small"><span className="fw-bold">Belt:</span> {child.belt_color}</div>
                  </div>
                </div>
              ))}
            </div>
            {errors.submit && (
              <div className="alert alert-danger mt-3">{errors.submit}</div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="d-flex justify-content-between pt-4 mt-4 border-top">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`btn btn-modern d-flex align-items-center ${currentStep === 1 ? 'btn-outline-secondary disabled' : 'btn-outline-dark'}`}
            type="button"
          >
            <ArrowLeft size={16} className="me-2" />
            Previous
          </button>
          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              disabled={loading}
              className={`btn btn-modern d-flex align-items-center ${loading ? 'disabled btn-primary' : 'btn-primary'}`}
              type="button"
            >
              {loading && currentStep === 1 ? 'Creating Account...' : 'Next'}
              <ArrowRight size={16} className="ms-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`btn btn-modern d-flex align-items-center ${loading ? 'disabled btn-primary' : 'btn-success'}`}
              type="button"
            >
              {loading ? 'Submitting...' : 'Complete Registration'}
              <Check size={16} className="ms-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentRegistrationForm;