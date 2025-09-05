import React, { useState, useEffect } from 'react';
import { User, Users, Calendar, Award, ArrowRight, ArrowLeft, Check, Plus, Trash2, Upload, FileSpreadsheet, Download, Mail } from 'lucide-react';
import { link } from '../../constant';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import axios from 'axios';

const ParticipantForms = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Participants data
  const [participants, setParticipants] = useState([
    {
      id: Date.now(),
      name: '',
      email: '',
      date_of_birth: '',
      belt_color: 'White'
    }
  ]);

  const [errors, setErrors] = useState({});
  const [uploadMode, setUploadMode] = useState(false); // Toggle between manual and upload mode

  const beltColors = [
    'White', 'Yellow', 'Orange', 'Green', 'Purple', 'Brown', 'Black'
  ];

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/Login');
      return;
    }
  }, [navigate]);

  // Handle participant form changes
  const handleParticipantChange = (participantId, field, value) => {
    setParticipants(prev => prev.map(participant => 
      participant.id === participantId ? { ...participant, [field]: value } : participant
    ));
    
    // Clear error when user starts typing
    const errorKey = `participant_${participantId}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }));
    }
  };

  // Add new participant
  const addParticipant = () => {
    setParticipants(prev => [...prev, {
      id: Date.now(),
      name: '',
      email: '',
      date_of_birth: '',
      belt_color: 'White'
    }]);
  };

  // Remove participant
  const removeParticipant = (participantId) => {
    if (participants.length > 1) {
      setParticipants(prev => prev.filter(participant => participant.id !== participantId));
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

        const parsedParticipants = jsonData.map((row, index) => {
          // Try different possible column names for flexibility
          const name = row.name || row.Name || row['Participant Name'] || row['participant_name'] || '';
          const email = row.email || row.Email || row['Email Address'] || row['email_address'] || '';
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
            email: String(email).trim(),
            date_of_birth: formatDate(dateOfBirth),
            belt_color: validBeltColor
          };
        }).filter(participant => participant.name); // Only include rows with names

        if (parsedParticipants.length === 0) {
          setErrors({ upload: 'No valid participant data found in the Excel file. Please check the format.' });
          return;
        }

        setParticipants(parsedParticipants);
        setErrors({}); // Clear any previous errors
        alert(`Successfully imported ${parsedParticipants.length} participants from Excel file!`);
        
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
        email: 'john.doe@email.com',
        date_of_birth: '2010-05-15',
        belt_color: 'Yellow'
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@email.com',
        date_of_birth: '2012-08-22',
        belt_color: 'Green'
      },
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@email.com',
        date_of_birth: '2011-12-03',
        belt_color: 'White'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Participants');
    
    // Set column widths
    worksheet['!cols'] = [
      { width: 20 }, // name
      { width: 25 }, // email
      { width: 15 }, // date_of_birth
      { width: 15 }  // belt_color
    ];
    
    XLSX.writeFile(workbook, 'participants_registration_template.xlsx');
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    participants.forEach((participant) => {
      // Validate name
      if (!participant.name.trim()) {
        newErrors[`participant_${participant.id}_name`] = 'Participant name is required';
      }
      
      // Validate email
      if (!participant.email.trim()) {
        newErrors[`participant_${participant.id}_email`] = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(participant.email.trim())) {
        newErrors[`participant_${participant.id}_email`] = 'Please enter a valid email';
      }
      
      // Validate date of birth
      if (!participant.date_of_birth) {
        newErrors[`participant_${participant.id}_dob`] = 'Date of birth is required';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit participants
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      // Create participants for the account (account_id will be extracted from token on backend)
      const response = await axios.post(`${link}/participants/bulk`, {
        participants: participants.map(participant => ({
          name: participant.name.trim(),
          email: participant.email.trim(),
          date_of_birth: participant.date_of_birth,
          belt_color: participant.belt_color
        }))
      }, {
        headers: {
          'accessToken': token
        }
      });

      alert(`Registration complete! ${participants.length} participants registered successfully.`);
      navigate("/Competitors", { replace: true });
      
    } catch (error) {
      console.error('Participants registration error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to register participants';
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-modern py-3 py-sm-5 px-2 px-sm-3" style={{ 
      minHeight: '100vh',
      width: '100%', 
      overflow: 'visible'
    }}>
      {/* Page Header */}
      <div className="page-header-modern mb-4">
        <h1 className="page-title-modern">
          <i className="fas fa-user-plus me-2"></i>
          Add Competitors
        </h1>
        <p className="page-subtitle-modern">Register new competitors for your tournaments</p>
      </div>

      {/* Form Content */}
      <div className="card-modern p-2 p-sm-4" style={{ 
        width: '100%', 
        overflow: 'visible',
        minHeight: 'fit-content',
        height: 'auto'
      }}>
        <div className="mb-4">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-3">
            <h2 className="fw-bold mb-0" style={{ color: 'var(--dark-grey)' }}>
              <i className="fas fa-users me-2"></i>
              Add Competitors
            </h2>
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
                  onClick={addParticipant}
                  className="btn btn-success d-flex align-items-center justify-content-center w-100 w-sm-auto"
                  type="button"
                >
                  <Plus size={16} className="me-2" />
                  <span className="d-none d-sm-inline">Add Competitor</span>
                  <span className="d-sm-none">Add</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Excel Upload Mode */}
        {uploadMode && (
          <div className="card mb-3 p-3 bg-light" style={{ 
            width: '100%', 
            boxSizing: 'border-box',
            border: '1px solid #dee2e6',
            borderRadius: '0.375rem',
            overflow: 'visible',
            height: 'auto',
            minHeight: 'fit-content'
          }}>
            <div className="d-flex align-items-center mb-3">
              <FileSpreadsheet size={24} className="me-2 text-primary" />
              <h4 className="fw-bold mb-0" style={{ color: 'var(--dark-grey)' }}>Upload Excel File</h4>
            </div>
            <p className="text-muted mb-3" style={{ 
              wordWrap: 'break-word', 
              overflowWrap: 'break-word',
              lineHeight: '1.5',
              fontSize: '0.9rem'
            }}>
              Upload an Excel file (.xlsx, .xls) with competitor information. The file should have columns for:
              <br />
              <strong>name</strong>, <strong>email</strong>, <strong>date_of_birth</strong>, and <strong>belt_color</strong>
            </p>
            <div className="mb-3" style={{ 
              overflow: 'visible',
              height: 'auto',
              minHeight: 'fit-content'
            }}>
              <div className="d-flex flex-column gap-2 mb-2" style={{ 
                overflow: 'visible',
                height: 'auto',
                alignItems: 'center'
              }}>
                <label 
                  htmlFor="excel-upload" 
                  className="btn btn-primary"
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    padding: '10px',
                    marginBottom: '8px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Upload size={16} style={{ marginRight: '6px' }} />
                  Choose Excel File
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
                  className="btn btn-outline-secondary"
                  type="button"
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #6c757d',
                    cursor: 'pointer'
                  }}
                >
                  <Download size={16} style={{ marginRight: '6px' }} />
                  Download Template
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
            {participants.length > 0 && (
              <div className="alert alert-info mt-3">
                <strong>Note:</strong> Uploading a new file will replace all current competitor data.
              </div>
            )}
          </div>
        )}

        {/* Participants List - only show in manual mode or if data exists */}
        {(!uploadMode || participants.length > 0) && participants.map((participant, index) => (
          <div key={participant.id} className="card mb-3 p-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h3 className="fw-bold mb-0" style={{ color: 'var(--dark-grey)' }}>
                <i className="fas fa-user me-2"></i>
                Competitor {index + 1}
              </h3>
              {participants.length > 1 && (
                <button
                  onClick={() => removeParticipant(participant.id)}
                  className="btn btn-outline-danger btn-sm"
                  type="button"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label-modern">
                  <i className="fas fa-user me-2"></i>
                  Name *
                </label>
                <input
                  type="text"
                  value={participant.name}
                  onChange={(e) => handleParticipantChange(participant.id, 'name', e.target.value)}
                  className={`form-control-modern ${errors[`participant_${participant.id}_name`] ? 'border-danger' : ''}`}
                  placeholder="Enter competitor's name"
                />
                {errors[`participant_${participant.id}_name`] && (
                  <div className="text-danger small mt-1">{errors[`participant_${participant.id}_name`]}</div>
                )}
              </div>
              <div className="col-md-3">
                <label className="form-label-modern">
                  <i className="fas fa-envelope me-2"></i>
                  Email *
                </label>
                <input
                  type="email"
                  value={participant.email}
                  onChange={(e) => handleParticipantChange(participant.id, 'email', e.target.value)}
                  className={`form-control-modern ${errors[`participant_${participant.id}_email`] ? 'border-danger' : ''}`}
                  placeholder="Enter email address"
                />
                {errors[`participant_${participant.id}_email`] && (
                  <div className="text-danger small mt-1">{errors[`participant_${participant.id}_email`]}</div>
                )}
              </div>
              <div className="col-md-3">
                <label className="form-label-modern">
                  <i className="fas fa-calendar-alt me-2"></i>
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={participant.date_of_birth}
                  onChange={(e) => handleParticipantChange(participant.id, 'date_of_birth', e.target.value)}
                  className={`form-control-modern ${errors[`participant_${participant.id}_dob`] ? 'border-danger' : ''}`}
                />
                {errors[`participant_${participant.id}_dob`] && (
                  <div className="text-danger small mt-1">{errors[`participant_${participant.id}_dob`]}</div>
                )}
              </div>
              <div className="col-md-3">
                <label className="form-label-modern">
                  <i className="fas fa-medal me-2"></i>
                  Belt Color
                </label>
                <select
                  value={participant.belt_color}
                  onChange={(e) => handleParticipantChange(participant.id, 'belt_color', e.target.value)}
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

        {errors.submit && (
          <div className="alert alert-danger mt-3">{errors.submit}</div>
        )}

        {/* Submit Button */}
        <div className="d-grid gap-2 pt-4 mt-4 border-top">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`btn btn-modern ${loading ? 'disabled btn-primary' : 'btn-success'}`}
            type="button"
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Registering Competitors...
              </>
            ) : (
              <>
                <i className="fas fa-check me-2"></i>
                Register {participants.length} Competitor{participants.length !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParticipantForms;