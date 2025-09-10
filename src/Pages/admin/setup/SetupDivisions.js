import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Row, Col, Button, Alert, Modal } from "react-bootstrap";
import { Upload, FileSpreadsheet, Download, Plus } from 'lucide-react';
import * as XLSX from 'xlsx';
import { link } from '../../../constant';
import DivisionModal from '../../../components/modals/DivisionModal';

const SetupDivisions = ({ tournamentData, onStepComplete, onError }) => {
  const [uploadMode, setUploadMode] = useState(false);
  const [divisions, setDivisions] = useState([]);
  const [uploadError, setUploadError] = useState("");
  const [createdDivisions, setCreatedDivisions] = useState([]);
  const [existingDivisions, setExistingDivisions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDivisionModal, setShowDivisionModal] = useState(false);
  const [selectedDivisionId, setSelectedDivisionId] = useState(null);

  const initialValues = {
    age_group: "",
    proficiency_level: "",
    gender: "",
    category: "",
    tournament_id: tournamentData?.tournament_id,
  };

  const validationSchema = Yup.object().shape({
    tournament_id: Yup.number().required("Tournament ID is required"),
    age_group: Yup.string().required("Age group is required"),
    proficiency_level: Yup.string().required("Proficiency level is required"),
    gender: Yup.string().required("Gender is required"),
    category: Yup.string().required("Category is required"),
  });

  // Available options
  const ageGroups = ["6-7", "8-9", "10-11", "12-13", "14-15", "16-17", "18-21", "22-35", "36-49", "50+"];
  const proficiencyLevels = ["Beginner", "Intermediate", "Advanced"];
  const genders = ["Male", "Female"];
  const categories = ["Kata", "Kumite"];

  // Fetch existing divisions when component loads
  useEffect(() => {
    const fetchExistingDivisions = async () => {
      if (!tournamentData?.tournament_id) return;

      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return;

        const response = await axios.get(`${link}/divisions/`, {
          headers: { accessToken: accessToken },
          params: { tournament_id: tournamentData.tournament_id }
        });

        if (response.data && response.data.length > 0) {
          setExistingDivisions(response.data);
        }
      } catch (error) {
        console.error('Error fetching existing divisions:', error);
      }
    };

    fetchExistingDivisions();
  }, [tournamentData?.tournament_id]);

  // Handle Excel file upload (reusing existing logic)
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

        const parsedDivisions = jsonData.map((row, index) => {
          const ageGroup = row.age_group || row['Age Group'] || row.age || row.Age || '';
          const proficiencyLevel = row.proficiency_level || row['Proficiency Level'] || row.proficiency || row.level || '';
          const gender = row.gender || row.Gender || '';
          const category = row.category || row.Category || '';

          const normalizeAgeGroup = (age) => {
            if (!age) return '';
            const ageStr = String(age).trim();
            return ageGroups.find(group => group.toLowerCase() === ageStr.toLowerCase()) || ageStr;
          };

          const normalizeProficiency = (prof) => {
            if (!prof) return '';
            const profStr = String(prof).trim();
            return proficiencyLevels.find(level => level.toLowerCase() === profStr.toLowerCase()) || profStr;
          };

          const normalizeGender = (gen) => {
            if (!gen) return '';
            const genStr = String(gen).trim();
            return genders.find(g => g.toLowerCase() === genStr.toLowerCase()) || genStr;
          };

          const normalizeCategory = (cat) => {
            if (!cat) return '';
            const catStr = String(cat).trim();
            return categories.find(c => c.toLowerCase() === catStr.toLowerCase()) || catStr;
          };

          return {
            id: Date.now() + index,
            age_group: normalizeAgeGroup(ageGroup),
            proficiency_level: normalizeProficiency(proficiencyLevel),
            gender: normalizeGender(gender),
            category: normalizeCategory(category),
            tournament_id: tournamentData?.tournament_id
          };
        }).filter(division => division.age_group || division.proficiency_level || division.gender || division.category);

        if (parsedDivisions.length === 0) {
          setUploadError('No valid division data found in the Excel file. Please check the format.');
          return;
        }

        setDivisions(parsedDivisions);
        setUploadError('');
        
      } catch (error) {
        console.error('Excel parsing error:', error);
        setUploadError('Error reading Excel file. Please check the file format and try again.');
      }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = '';
  };

  // Download Excel template
  const downloadExcelTemplate = () => {
    const templateData = [
      { age_group: '8-9', proficiency_level: 'Beginner', gender: 'Male', category: 'Kata' },
      { age_group: '8-9', proficiency_level: 'Beginner', gender: 'Female', category: 'Kata' },
      { age_group: '10-11', proficiency_level: 'Intermediate', gender: 'Male', category: 'Kumite' }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Divisions');
    
    worksheet['!cols'] = [
      { width: 15 }, { width: 20 }, { width: 10 }, { width: 15 }
    ];
    
    XLSX.writeFile(workbook, 'divisions_template.xlsx');
  };

  // Submit multiple divisions from Excel
  const handleBulkSubmit = async () => {
    if (divisions.length === 0) {
      setUploadError('No divisions to submit. Please upload an Excel file first.');
      return;
    }

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setUploadError("Access token not found. Please log in again.");
        return;
      }

      const response = await axios.post(`${link}/divisions/bulk`, {
        divisions: divisions,
        tournament_id: tournamentData?.tournament_id
      }, {
        headers: {
          accessToken: accessToken,
          "Content-Type": "application/json",
        },
      });

      console.log(`Successfully created ${response.data.count} divisions!`);
      
      // Complete this step and move to next
      onStepComplete(2, {
        divisions_created: response.data.count
      });

    } catch (error) {
      console.error("Error creating divisions:", error);
      if (error.response?.data?.duplicates) {
        setUploadError(`${error.response.data.error}:\n${error.response.data.duplicates.join('\n')}`);
      } else {
        setUploadError(error.response?.data?.error || "An error occurred while creating divisions. Please try again.");
      }
    }
  };

  // Single division submit
  const onSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        onError("Access token not found. Please log in again.");
        setSubmitting(false);
        return;
      }

      const response = await axios.post(`${link}/divisions`, values, {
        headers: {
          accessToken: accessToken,
          "Content-Type": "application/json",
        },
      });

      console.log("Division created successfully:", response.data);
      
      // Add to created divisions list
      setCreatedDivisions(prev => [...prev, values]);
      resetForm();
      
      // Show success message but don't advance yet - let user create more or continue
      
    } catch (error) {
      console.error("Error creating division:", error);
      
      if (error.response?.data?.error) {
        const errorMsg = error.response.data.error;
        
        if (errorMsg.includes("duplicate") || errorMsg.includes("already exists") || 
            errorMsg.includes("Duplicate entry") || errorMsg.includes("UNIQUE constraint") ||
            errorMsg.includes("unique constraint")) {
          onError("A division with these exact details already exists for this tournament. Please modify the age group, proficiency level, gender, or category.");
        } else {
          onError(errorMsg);
        }
      } else {
        onError("An unexpected error occurred while creating the division. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle modal open/close
  const handleShowDivisionModal = (divisionId) => {
    setSelectedDivisionId(divisionId);
    setShowDivisionModal(true);
  };

  const handleCloseDivisionModal = () => {
    setShowDivisionModal(false);
    setSelectedDivisionId(null);
    // Refresh divisions after modal closes to show any updates
    if (tournamentData?.tournament_id) {
      const fetchExistingDivisions = async () => {
        try {
          const accessToken = localStorage.getItem("accessToken");
          if (!accessToken) return;

          const response = await axios.get(`${link}/divisions/`, {
            headers: { accessToken: accessToken },
            params: { tournament_id: tournamentData.tournament_id }
          });

          if (response.data && response.data.length > 0) {
            setExistingDivisions(response.data);
          }
        } catch (error) {
          console.error('Error refreshing divisions:', error);
        }
      };
      fetchExistingDivisions();
    }
  };

  // Handle individual division deletion
  const handleDeleteDivision = async (division) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the division "${division.gender} ${division.category} - ${division.age_group} (${division.proficiency_level})"? This will also remove all competitors assigned to this division.`
    );

    if (!confirmDelete) return;

    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        onError("Access token not found. Please log in again.");
        return;
      }

      await axios.delete(`${link}/divisions`, {
        headers: {
          accessToken: accessToken,
        },
        data: {
          division_id: division.division_id,
        }
      });

      // Remove from existing divisions list
      setExistingDivisions(prev => 
        prev.filter(d => d.division_id !== division.division_id)
      );

      alert("Division deleted successfully!");

    } catch (error) {
      console.error("Error deleting division:", error);
      onError(error.response?.data?.error || "Failed to delete division. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToNext = () => {
    const totalDivisions = existingDivisions.length + createdDivisions.length + divisions.length;
    
    if (totalDivisions === 0) {
      onError("Please create at least one division before continuing.");
      return;
    }
    
    // Complete this step
    onStepComplete(2, {
      divisions_created: totalDivisions
    });
  };

  if (!tournamentData?.tournament_id) {
    return (
      <Alert variant="warning">
        <i className="fas fa-exclamation-triangle me-2"></i>
        Please complete the tournament creation step first.
      </Alert>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h5 className="text-primary mb-2">
          <i className="fas fa-layer-group me-2"></i>
          Division Setup for "{tournamentData.tournament_name}"
        </h5>
        <p className="text-muted">
          Create divisions to organize your competitors by age group, skill level, gender, and category.
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="d-flex justify-content-center mb-4">
        <div className="d-flex gap-3">
          <div>
            <input
              type="radio"
              className="btn-check"
              name="mode"
              id="manual"
              checked={!uploadMode}
              onChange={() => setUploadMode(false)}
            />
            <label 
              className={`btn ${!uploadMode ? 'btn-primary' : 'btn-outline-primary'}`} 
              htmlFor="manual"
              style={{ minWidth: '150px', whiteSpace: 'nowrap' }}
            >
              <Plus size={16} className="me-2" />
              Manual Entry
            </label>
          </div>

          <div>
            <input
              type="radio"
              className="btn-check"
              name="mode"
              id="upload"
              checked={uploadMode}
              onChange={() => setUploadMode(true)}
            />
            <label 
              className={`btn ${uploadMode ? 'btn-primary' : 'btn-outline-primary'}`} 
              htmlFor="upload"
              style={{ minWidth: '150px', whiteSpace: 'nowrap' }}
            >
              <FileSpreadsheet size={16} className="me-2" />
              Excel Upload
            </label>
          </div>
        </div>
      </div>

      {uploadError && (
        <Alert variant="danger" className="mb-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {uploadError}
        </Alert>
      )}

      {/* Show existing divisions if any */}
      {existingDivisions.length > 0 && (
        <div className="card mb-4" style={{width: '100%', margin: '0 auto'}}>
          <div className="card-header">
            <h6 className="mb-0">
              <i className="fas fa-list me-2"></i>
              Existing Divisions ({existingDivisions.length})
            </h6>
          </div>
          <div className="card-body p-0">
            <div style={{width: '100%', overflowX: 'auto'}}>
              <table className="table table-hover mb-0" style={{width: '100%', tableLayout: 'fixed'}}>
                <thead className="table-light">
                  <tr>
                    <th style={{width: '20%'}}>Age Group</th>
                    <th style={{width: '25%'}}>Proficiency</th>
                    <th style={{width: '20%'}}>Gender</th>
                    <th style={{width: '20%'}}>Category</th>
                    <th className="text-center" style={{width: '15%'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {existingDivisions.map((division, index) => (
                    <tr key={division.division_id}>
                      <td>
                        <span className="badge bg-warning text-dark">{division.age_group}</span>
                      </td>
                      <td>
                        <span className={`badge ${
                          division.proficiency_level === 'Beginner' ? 'bg-success' :
                          division.proficiency_level === 'Intermediate' ? 'bg-warning text-dark' :
                          'bg-danger'
                        }`}>
                          {division.proficiency_level}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-info">{division.gender}</span>
                      </td>
                      <td>
                        <span className="badge bg-secondary">{division.category}</span>
                      </td>
                      <td className="text-center">
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleShowDivisionModal(division.division_id)}
                            disabled={loading}
                            title="Update Division"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDeleteDivision(division)}
                            disabled={loading}
                            title="Delete Division"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {uploadMode ? (
        // Excel Upload Mode
        <div>
          <div className="card mb-3 p-3 bg-light">
            <div className="d-flex align-items-center mb-3">
              <FileSpreadsheet size={24} className="me-2 text-primary" />
              <h4 className="fw-bold mb-0">Upload Excel File</h4>
            </div>
            <p className="text-muted mb-3">
              Upload an Excel file (.xlsx, .xls) with division information. The file should have columns for:
              <br />
              <strong>age_group</strong>, <strong>proficiency_level</strong>, <strong>gender</strong>, and <strong>category</strong>
            </p>
            
            <div className="d-flex gap-2 mb-2">
              <label htmlFor="excel-upload" className="btn btn-primary flex-grow-1">
                <Upload size={16} className="me-2" />
                Choose Excel File
              </label>
              <input
                id="excel-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExcelUpload}
                style={{ display: 'none' }}
              />
              <button onClick={downloadExcelTemplate} className="btn btn-outline-secondary">
                <Download size={16} className="me-2" />
                Download Template
              </button>
            </div>
            
            <small className="text-muted">Accepted formats: .xlsx, .xls</small>
          </div>

          {/* Preview uploaded divisions */}
          {divisions.length > 0 && (
            <div className="card mb-3" style={{width: '100%', margin: '0 auto'}}>
              <div className="card-header">
                <h5 className="mb-0">Preview - {divisions.length} Divisions</h5>
              </div>
              <div className="card-body p-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <div style={{width: '100%', overflowX: 'auto'}}>
                  <table className="table table-sm table-hover" style={{width: '100%', tableLayout: 'fixed'}}>
                    <thead className="table-light">
                      <tr>
                        <th style={{width: '25%'}}>Age Group</th>
                        <th style={{width: '30%'}}>Proficiency</th>
                        <th style={{width: '20%'}}>Gender</th>
                        <th style={{width: '25%'}}>Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {divisions.map((division, index) => (
                        <tr key={index}>
                          <td>{division.age_group}</td>
                          <td>{division.proficiency_level}</td>
                          <td>{division.gender}</td>
                          <td>{division.category}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <div className="d-flex justify-content-end gap-3 mt-4">
            <Button variant="outline-secondary" onClick={() => window.history.back()}>
              <i className="fas fa-arrow-left me-2"></i>
              Back
            </Button>
            <Button 
              variant="success"
              onClick={handleBulkSubmit}
              disabled={divisions.length === 0}
            >
              <i className="fas fa-upload me-2"></i>
              Create {divisions.length} Division{divisions.length !== 1 ? 's' : ''} & Continue
            </Button>
          </div>
        </div>
      ) : (
        // Manual Entry Mode
        <div>
          <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
            {(formik) => (
              <Form>
                <div className="form-group-modern">
                  <label className="form-label-modern" htmlFor="age_group">
                    <i className="fas fa-calendar-alt me-2"></i>
                    Age Group
                  </label>
                  <ErrorMessage name="age_group" component="div" className="text-danger mb-2" />
                  <Field as="select" id="age_group" name="age_group" className="form-control-modern">
                    <option value="" label="Select age group" />
                    {ageGroups.map(group => (
                      <option key={group} value={group} label={`${group} years`} />
                    ))}
                  </Field>
                </div>

                <div className="form-group-modern">
                  <label className="form-label-modern" htmlFor="proficiency_level">
                    <i className="fas fa-medal me-2"></i>
                    Proficiency Level
                  </label>
                  <ErrorMessage name="proficiency_level" component="div" className="text-danger mb-2" />
                  <Field as="select" id="proficiency_level" name="proficiency_level" className="form-control-modern">
                    <option value="" label="Select proficiency level" />
                    {proficiencyLevels.map(level => (
                      <option key={level} value={level} label={level} />
                    ))}
                  </Field>
                </div>

                <Row>
                  <Col md={6}>
                    <div className="form-group-modern">
                      <label className="form-label-modern" htmlFor="gender">
                        <i className="fas fa-venus-mars me-2"></i>
                        Gender
                      </label>
                      <ErrorMessage name="gender" component="div" className="text-danger mb-2" />
                      <Field as="select" id="gender" name="gender" className="form-control-modern">
                        <option value="" label="Select gender" />
                        {genders.map(gender => (
                          <option key={gender} value={gender} label={gender} />
                        ))}
                      </Field>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="form-group-modern">
                      <label className="form-label-modern" htmlFor="category">
                        <i className="fas fa-fist-raised me-2"></i>
                        Category
                      </label>
                      <ErrorMessage name="category" component="div" className="text-danger mb-2" />
                      <Field as="select" id="category" name="category" className="form-control-modern">
                        <option value="" label="Select category" />
                        {categories.map(category => (
                          <option key={category} value={category} label={category} />
                        ))}
                      </Field>
                    </div>
                  </Col>
                </Row>

                <div className="d-flex justify-content-between gap-3 mt-4">
                  <Button 
                    type="submit" 
                    className="btn btn-outline-primary"
                    disabled={formik.isSubmitting}
                  >
                    {formik.isSubmitting ? (
                      <>
                        <span className="loading-spinner me-2"></span>
                        Adding Division...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus me-2"></i>
                        Add Another Division
                      </>
                    )}
                  </Button>
                  
                  <div className="d-flex gap-2">
                    <Button variant="outline-secondary" onClick={() => window.history.back()}>
                      <i className="fas fa-arrow-left me-2"></i>
                      Back
                    </Button>
                    <Button variant="primary" onClick={handleContinueToNext}>
                      <i className="fas fa-arrow-right me-2"></i>
                      Continue to Mats
                      {(existingDivisions.length + createdDivisions.length) > 0 && (
                        <span className="badge bg-light text-dark ms-2">
                          {existingDivisions.length + createdDivisions.length}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </Form>
            )}
          </Formik>

          {/* Show created divisions */}
          {createdDivisions.length > 0 && (
            <div className="card mt-4">
              <div className="card-header">
                <h6 className="mb-0">Created Divisions ({createdDivisions.length})</h6>
              </div>
              <div className="card-body">
                <div className="row g-2">
                  {createdDivisions.map((division, index) => (
                    <div key={index} className="col-md-6">
                      <div className="p-2 bg-light rounded small">
                        <strong>{division.gender}</strong> {division.category} - {division.age_group} ({division.proficiency_level})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Division Edit Modal */}
      <DivisionModal 
        showModal={showDivisionModal} 
        handleClose={handleCloseDivisionModal} 
        division_id={selectedDivisionId} 
      />
    </div>
  );
};

export default SetupDivisions;