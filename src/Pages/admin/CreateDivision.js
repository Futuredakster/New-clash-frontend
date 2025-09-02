import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Container, Row, Col, Card, Button, Alert, Modal } from "react-bootstrap";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import { Upload, FileSpreadsheet, Download, Plus } from 'lucide-react';
import * as XLSX from 'xlsx';
import { link } from '../../constant';

const CreateDivision = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tournament_id = queryParams.get('tournament_id');
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadMode, setUploadMode] = useState(false);
  const [divisions, setDivisions] = useState([]);
  const [uploadError, setUploadError] = useState("");

  const initialValues = {
    age_group: "",
    proficiency_level: "",
    gender: "",  // Add gender to initialValues
    category: "", // Add category to initialValues
    tournament_id: tournament_id,
  };

  const validationSchema = Yup.object().shape({
    tournament_id: Yup.number().required("Tournament ID is required"),
    age_group: Yup.string().required("Age group is required"),
    proficiency_level: Yup.string().required("Proficiency level is required"),
    gender: Yup.string().required("Gender is required"),  // Add validation for gender
    category: Yup.string().required("Category is required"), // Add validation for category
  });

  // Available options for validation
  const ageGroups = ["6-7", "8-9", "10-11", "12-13", "14-15", "16-17", "18-21", "22-35", "36-49", "50+"];
  const proficiencyLevels = ["Beginner", "Intermediate", "Advanced"];
  const genders = ["Male", "Female"];
  const categories = ["Kata", "Kumite"];

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

        const parsedDivisions = jsonData.map((row, index) => {
          // Try different possible column names for flexibility
          const ageGroup = row.age_group || row['Age Group'] || row.age || row.Age || '';
          const proficiencyLevel = row.proficiency_level || row['Proficiency Level'] || row.proficiency || row.level || '';
          const gender = row.gender || row.Gender || '';
          const category = row.category || row.Category || '';

          // Validate and normalize values
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
            tournament_id: tournament_id
          };
        }).filter(division => division.age_group || division.proficiency_level || division.gender || division.category);

        if (parsedDivisions.length === 0) {
          setUploadError('No valid division data found in the Excel file. Please check the format.');
          return;
        }

        setDivisions(parsedDivisions);
        setUploadError(''); // Clear any previous errors
        alert(`Successfully imported ${parsedDivisions.length} divisions from Excel file!`);
        
      } catch (error) {
        console.error('Excel parsing error:', error);
        setUploadError('Error reading Excel file. Please check the file format and try again.');
      }
    };
    reader.readAsArrayBuffer(file);
    
    // Clear the file input
    event.target.value = '';
  };

  // Download Excel template
  const downloadExcelTemplate = () => {
    const templateData = [
      {
        age_group: '8-9',
        proficiency_level: 'Beginner',
        gender: 'Male',
        category: 'Kata'
      },
      {
        age_group: '8-9',
        proficiency_level: 'Beginner',
        gender: 'Female',
        category: 'Kata'
      },
      {
        age_group: '10-11',
        proficiency_level: 'Intermediate',
        gender: 'Male',
        category: 'Kumite'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Divisions');
    
    // Set column widths
    worksheet['!cols'] = [
      { width: 15 }, // age_group
      { width: 20 }, // proficiency_level
      { width: 10 }, // gender
      { width: 15 }  // category
    ];
    
    XLSX.writeFile(workbook, 'divisions_template.xlsx');
  };

  // Submit multiple divisions from Excel using bulk endpoint
  const handleBulkSubmit = async () => {
    if (divisions.length === 0) {
      setUploadError('No divisions to submit. Please upload an Excel file first.');
      return;
    }

    setErrorMessage("");
    setUploadError("");

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setUploadError("Access token not found. Please log in again.");
        return;
      }

      // Use bulk endpoint for better performance and transaction safety
      const response = await axios.post(`${link}/divisions/bulk`, {
        divisions: divisions,
        tournament_id: tournament_id
      }, {
        headers: {
          accessToken: accessToken,
          "Content-Type": "application/json",
        },
      });

      alert(`Successfully created ${response.data.count} divisions!`);
      navigate("/Home");
    } catch (error) {
      console.error("Error creating divisions:", error);
      
      if (error.response?.data?.duplicates) {
        setUploadError(`${error.response.data.error}:\n${error.response.data.duplicates.join('\n')}`);
      } else {
        setUploadError(error.response?.data?.error || "An error occurred while creating divisions. Please try again.");
      }
    }
  };

  const onSubmit = async (values, { setSubmitting }) => {
    console.log("Submitting values:", values);
    setErrorMessage(""); // Clear any previous errors
    
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setErrorMessage("Access token not found. Please log in again.");
        setSubmitting(false);
        return;
      }

      const response = await axios.post(`${link}/divisions`, values, {
        headers: {
          accessToken: accessToken,
          "Content-Type": "application/json",
        },
      });

      console.log("Request successful:", response.data);
      navigate("/Home");
    } catch (error) {
      console.error("Error:", error);
      
      if (error.response?.data?.error) {
        const errorMsg = error.response.data.error;
        
        // Check for duplicate key/constraint violation errors
        if (errorMsg.includes("duplicate") || 
            errorMsg.includes("already exists") || 
            errorMsg.includes("Duplicate entry") ||
            errorMsg.includes("UNIQUE constraint") ||
            errorMsg.includes("unique constraint")) {
          setErrorMessage("A division with these exact details already exists for this tournament. Please modify the age group, proficiency level, gender, or category.");
        } else {
          setErrorMessage(errorMsg);
        }
      } else {
        setErrorMessage("An unexpected error occurred while creating the division. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container fluid className="fade-in">
      <Row className="justify-content-center">
        <Col xs={12} lg={8} xl={6}>
          <Helmet>
            <title>Create Division - Clash</title>
            <meta name="description" content="Create a new division for your tournament" />
          </Helmet>
          
          <div className="page-header-modern mb-4">
            <h1 className="page-title-modern">Create Division</h1>
            <p className="page-subtitle-modern">Set up tournament divisions to organize competitors</p>
            
            {/* Mode Toggle */}
            <div className="d-flex justify-content-center mt-3">
              <div className="d-flex" role="group" style={{borderRadius: '6px', overflow: 'hidden'}}>
                <button
                  type="button"
                  onClick={() => setUploadMode(false)}
                  style={{ 
                    height: '38px',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: '1px solid #0d6efd',
                    borderRight: uploadMode ? '1px solid #0d6efd' : 'none',
                    borderTopLeftRadius: '6px',
                    borderBottomLeftRadius: '6px',
                    borderTopRightRadius: uploadMode ? '0' : '6px',
                    borderBottomRightRadius: uploadMode ? '0' : '6px',
                    padding: '6px 20px',
                    fontSize: '14px',
                    backgroundColor: !uploadMode ? '#0d6efd' : 'white',
                    color: !uploadMode ? 'white' : '#0d6efd',
                    cursor: 'pointer',
                    fontWeight: '400',
                    textAlign: 'center',
                    userSelect: 'none',
                    transition: 'none'
                  }}
                >
                  <Plus size={16} className="me-2" />
                  Manual Entry
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode(true)}
                  style={{ 
                    height: '38px',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: '1px solid #0d6efd',
                    borderLeft: !uploadMode ? '1px solid #0d6efd' : 'none',
                    borderTopLeftRadius: !uploadMode ? '0' : '6px',
                    borderBottomLeftRadius: !uploadMode ? '0' : '6px',
                    borderTopRightRadius: '6px',
                    borderBottomRightRadius: '6px',
                    padding: '6px 20px',
                    fontSize: '14px',
                    backgroundColor: uploadMode ? '#0d6efd' : 'white',
                    color: uploadMode ? 'white' : '#0d6efd',
                    cursor: 'pointer',
                    fontWeight: '400',
                    textAlign: 'center',
                    userSelect: 'none',
                    transition: 'none'
                  }}
                >
                  <FileSpreadsheet size={16} className="me-2" />
                  Excel Upload
                </button>
              </div>
            </div>
          </div>

          <Card className="card-modern">
            <Card.Header className="card-modern-header">
              <h4 className="mb-0">
                <i className="fas fa-users me-2"></i>
                Division Details
              </h4>
              <small className="text-muted">Define the division parameters for competitor organization</small>
            </Card.Header>
            <Card.Body className="card-modern-body">
              {errorMessage && (
                <Alert variant="danger" className="mb-4">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {errorMessage}
                </Alert>
              )}
              {uploadError && (
                <Alert variant="danger" className="mb-4">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {uploadError}
                </Alert>
              )}
              
              {/* Excel Upload Mode */}
              {uploadMode ? (
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
                    <div className="mb-3">
                      <div className="d-flex flex-column flex-sm-row gap-2 mb-2">
                        <label htmlFor="excel-upload" className="btn btn-primary d-flex align-items-center justify-content-center">
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
                        <button
                          onClick={downloadExcelTemplate}
                          className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
                          type="button"
                        >
                          <Download size={16} className="me-2" />
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
                  </div>

                  {/* Preview uploaded divisions */}
                  {divisions.length > 0 && (
                    <div className="card mb-3">
                      <div className="card-header">
                        <h5 className="mb-0">Preview - {divisions.length} Divisions</h5>
                      </div>
                      <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <div className="table-responsive">
                          <table className="table table-sm table-hover">
                            <thead className="table-light">
                              <tr>
                                <th>Age Group</th>
                                <th>Proficiency</th>
                                <th>Gender</th>
                                <th>Category</th>
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

                  <div className="d-grid gap-2">
                    <Button 
                      onClick={handleBulkSubmit}
                      className="btn btn-success"
                      disabled={divisions.length === 0}
                    >
                      <i className="fas fa-upload me-2"></i>
                      Create {divisions.length} Division{divisions.length !== 1 ? 's' : ''}
                    </Button>
                    <Button 
                      type="button" 
                      className="btn btn-modern-outline"
                      onClick={() => navigate('/Home')}
                    >
                      <i className="fas fa-arrow-left me-2"></i>
                      Back to Dashboard
                    </Button>
                  </div>
                </div>
              ) : (
                /* Manual Entry Mode */
                <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
                {(formik) => (
                  <Form>
                    <div className="form-group-modern">
                      <label className="form-label-modern" htmlFor="age_group">
                        <i className="fas fa-calendar-alt me-2"></i>
                        Age Group
                      </label>
                      <ErrorMessage name="age_group" component="div" className="text-danger mb-2" />
                      <Field
                        as="select"
                        id="age_group"
                        name="age_group"
                        className="form-control-modern"
                      >
                        <option value="" label="Select age group" />
                        <option value="6-7" label="6-7 years" />
                        <option value="8-9" label="8-9 years" />
                        <option value="10-11" label="10-11 years" />
                        <option value="12-13" label="12-13 years" />
                        <option value="14-15" label="14-15 years" />
                        <option value="16-17" label="16-17 years" />
                        <option value="18-21" label="18-21 years" />
                        <option value="22-35" label="22-35 years" />
                        <option value="36-49" label="36-49 years" />
                        <option value="50+" label="50+ years" />
                      </Field>
                    </div>

                    <div className="form-group-modern">
                      <label className="form-label-modern" htmlFor="proficiency_level">
                        <i className="fas fa-medal me-2"></i>
                        Proficiency Level
                      </label>
                      <ErrorMessage name="proficiency_level" component="div" className="text-danger mb-2" />
                      <Field
                        as="select"
                        id="proficiency_level"
                        name="proficiency_level"
                        className="form-control-modern"
                      >
                        <option value="" label="Select proficiency level" />
                        <option value="Beginner" label="Beginner" />
                        <option value="Intermediate" label="Intermediate" />
                        <option value="Advanced" label="Advanced" />
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
                          <Field
                            as="select"
                            id="gender"
                            name="gender"
                            className="form-control-modern"
                          >
                            <option value="" label="Select gender" />
                            <option value="Male" label="Male" />
                            <option value="Female" label="Female" />
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
                          <Field
                            as="select"
                            id="category"
                            name="category"
                            className="form-control-modern"
                          >
                            <option value="" label="Select category" />
                            <option value="kata" label="Kata" />
                            <option value="kumite" label="Kumite" />
                          </Field>
                        </div>
                      </Col>
                    </Row>

                    <div className="d-grid gap-2">
                      <Button 
                        type="submit" 
                        className="btn btn-modern"
                        disabled={formik.isSubmitting}
                      >
                        {formik.isSubmitting ? (
                          <>
                            <span className="loading-spinner me-2"></span>
                            Creating Division...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-plus me-2"></i>
                            Create Division
                          </>
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        className="btn btn-modern-outline"
                        onClick={() => navigate('/Home')}
                      >
                        <i className="fas fa-arrow-left me-2"></i>
                        Back to Dashboard
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateDivision;
