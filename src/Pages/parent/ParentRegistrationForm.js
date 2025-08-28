import React, { useState, useContext, useEffect } from 'react';
import { User, Users, Calendar, Award, ArrowRight, ArrowLeft, Check, Plus, Trash2, Upload, FileSpreadsheet, Download } from 'lucide-react';
import { link } from '../../constant';
import {AuthContext} from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

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
  const [uploadMode, setUploadMode] = useState(false); // Toggle between manual and upload mode

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

  // Handle Excel file upload
  const handleExcelUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const parsedChildren = jsonData.map((row, index) => {
          // Try different possible column names for flexibility
          const name = row.name || row.Name || row['Child Name'] || row['child_name'] || '';
          const dateOfBirth = row.date_of_birth || row['Date of Birth'] || row.dob || row.DOB || row.birthday || '';
          const beltColor = row.belt_color || row['Belt Color'] || row.belt || row.Belt || 'White';

          // Validate belt color with case-insensitive matching
          const normalizedBeltColor = String(beltColor).trim();
          const validBeltColor = beltColors.find(color => 
            color.toLowerCase() === normalizedBeltColor.toLowerCase()
          ) || 'White';

          return {
            id: Date.now() + index,
            name: String(name).trim(),
            date_of_birth: formatDate(dateOfBirth),
            belt_color: validBeltColor
          };
        }).filter(child => child.name); // Only include rows with names

        if (parsedChildren.length === 0) {
          setErrors({ upload: 'No valid children data found in the Excel file. Please check the format.' });
          return;
        }

        setChildren(parsedChildren);
        setErrors({}); // Clear any previous errors
        alert(`Successfully imported ${parsedChildren.length} children from Excel file!`);
        
      } catch (error) {
        console.error('Excel parsing error:', error);
        setErrors({ upload: 'Error reading Excel file. Please check the file format and try again.' });
      }
    };
    reader.readAsArrayBuffer(file);
    
    // Clear the file input
    event.target.value = '';
  };

  // Helper function to format date from Excel
  const formatDate = (dateValue) => {
    if (!dateValue) return '';
    
    try {
      let date;
      
      // If it's already a string in YYYY-MM-DD format, return as is
      if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        return dateValue;
      }
      
      // Handle Excel date serial number
      if (typeof dateValue === 'number') {
        // Excel serial date to JS date
        date = new Date((dateValue - 25569) * 86400 * 1000);
      } else {
        // Try to parse as date string
        date = new Date(dateValue);
      }
      
      if (isNaN(date.getTime())) {
        return '';
      }
      
      // Format as YYYY-MM-DD
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  // Download Excel template
  const downloadExcelTemplate = () => {
    const templateData = [
      {
        name: 'John Doe',
        date_of_birth: '2010-05-15',
        belt_color: 'Yellow'
      },
      {
        name: 'Jane Smith',
        date_of_birth: '2012-08-22',
        belt_color: 'Green'
      },
      {
        name: 'Mike Johnson',
        date_of_birth: '2011-12-03',
        belt_color: 'White'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Children');
    
    // Set column widths
    worksheet['!cols'] = [
      { width: 20 }, // name
      { width: 15 }, // date_of_birth
      { width: 15 }  // belt_color
    ];
    
    XLSX.writeFile(workbook, 'children_registration_template.xlsx');
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
            <div className="mb-3">
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-3">
                <h2 className="fw-bold mb-0" style={{ color: 'var(--dark-grey)' }}>Add Your Children</h2>
                <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-sm-auto">
                  <div className="d-flex w-100 w-sm-auto" role="group" style={{borderRadius: '6px', overflow: 'hidden'}}>
                    <button
                      type="button"
                      onClick={() => setUploadMode(false)}
                      style={{ 
                        height: '38px',
                        minHeight: '38px',
                        maxHeight: '38px',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        border: '1px solid #0d6efd',
                        borderRight: uploadMode ? '1px solid #0d6efd' : 'none',
                        borderTopLeftRadius: '6px',
                        borderBottomLeftRadius: '6px',
                        borderTopRightRadius: uploadMode ? '0' : '0',
                        borderBottomRightRadius: uploadMode ? '0' : '0',
                        padding: '6px 12px',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        boxSizing: 'border-box',
                        backgroundColor: !uploadMode ? '#0d6efd' : 'white',
                        color: !uploadMode ? 'white' : '#0d6efd',
                        cursor: 'pointer',
                        flex: '1',
                        fontWeight: '400',
                        textAlign: 'center',
                        userSelect: 'none',
                        transition: 'none'
                      }}
                    >
                      <span className="d-none d-sm-inline">Manual Entry</span>
                      <span className="d-sm-none">Manual</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode(true)}
                      style={{ 
                        height: '38px',
                        minHeight: '38px',
                        maxHeight: '38px',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        border: '1px solid #0d6efd',
                        borderLeft: !uploadMode ? '1px solid #0d6efd' : 'none',
                        borderTopLeftRadius: !uploadMode ? '0' : '0',
                        borderBottomLeftRadius: !uploadMode ? '0' : '0',
                        borderTopRightRadius: '6px',
                        borderBottomRightRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        boxSizing: 'border-box',
                        backgroundColor: uploadMode ? '#0d6efd' : 'white',
                        color: uploadMode ? 'white' : '#0d6efd',
                        cursor: 'pointer',
                        flex: '1',
                        fontWeight: '400',
                        textAlign: 'center',
                        userSelect: 'none',
                        transition: 'none'
                      }}
                    >
                      <span className="d-none d-sm-inline">Excel Upload</span>
                      <span className="d-sm-none">Excel</span>
                    </button>
                  </div>
                  {!uploadMode && (
                    <button
                      onClick={addChild}
                      className="btn btn-success d-flex align-items-center justify-content-center w-100 w-sm-auto"
                      type="button"
                    >
                      <Plus size={16} className="me-2" />
                      <span className="d-none d-sm-inline">Add Child</span>
                      <span className="d-sm-none">Add</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Excel Upload Mode */}
            {uploadMode && (
              <div className="card mb-3 p-3 bg-light">
                <div className="d-flex align-items-center mb-3">
                  <FileSpreadsheet size={24} className="me-2 text-primary" />
                  <h4 className="fw-bold mb-0" style={{ color: 'var(--dark-grey)' }}>Upload Excel File</h4>
                </div>
                <p className="text-muted mb-3">
                  Upload an Excel file (.xlsx, .xls) with your children's information. The file should have columns for:
                  <br />
                  <strong>name</strong> (or "Child Name"), <strong>date_of_birth</strong> (or "Date of Birth", "dob"), and <strong>belt_color</strong> (or "Belt Color", "belt")
                </p>
                <div className="mb-3">
                  <div className="d-flex flex-column flex-sm-row gap-2 mb-2">
                    <label htmlFor="excel-upload" className="btn btn-primary d-flex align-items-center justify-content-center">
                      <Upload size={16} className="me-2" />
                      <span className="d-none d-sm-inline">Choose Excel File</span>
                      <span className="d-sm-none">Choose File</span>
                    </label>
                    <input
                      id="excel-upload"
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleExcelUpload}
                      style={{ display: 'none' }}
                    />
                    <button
                      onClick={downloadExcelTemplate}
                      className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
                      type="button"
                    >
                      <Download size={16} className="me-2" />
                      <span className="d-none d-sm-inline">Download Template</span>
                      <span className="d-sm-none">Template</span>
                    </button>
                  </div>
                  <div className="text-center text-sm-start">
                    <small className="text-muted">Accepted formats: .xlsx, .xls</small>
                  </div>
                </div>
                <div className="alert alert-info">
                  <small>
                    <strong>Need help?</strong> Download the template above to see the expected format. 
                    The template includes sample data showing exactly how to structure your Excel file.
                  </small>
                </div>
                {errors.upload && (
                  <div className="alert alert-danger mt-3">{errors.upload}</div>
                )}
                {children.length > 0 && (
                  <div className="alert alert-info mt-3">
                    <strong>Note:</strong> Uploading a new file will replace all current children data.
                  </div>
                )}
              </div>
            )}

            {/* Children List - only show in manual mode or if data exists */}
            {(!uploadMode || children.length > 0) && children.map((child, index) => (
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