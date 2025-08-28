import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { link } from './constant';

export const ParticipentForm = ({ division }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const division_id = queryParams.get("division_id") || "";

  const [data, setData] = useState(null); 
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    if (!division || Object.keys(division).length === 0) {
      fetchDivisionData();
    } else {
      setData(division);
      setLoading(false);
    }
  }, [division]);

  const fetchDivisionData = async () => {
    try {
      const response = await axios.get(`${link}/divisions/default`, {
        params: { division_id: division_id },
      });
      if (response.data.error) {
        alert(response.data.error);
      } else {
        setData(response.data);
        console.log("Data fetched:", response.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const initialValues = {
    name: "",
    date_of_birth: "",
    belt_color: "",
    division_id: division_id,
    age_group: division?.age_group || data?.age_group || "",
    proficiency_level: division?.proficiency_level || data?.proficiency_level || "",
    email: "", // Add email to initial values
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    date_of_birth: Yup.date().required("Date of Birth is required"),
    belt_color: Yup.string().required("Belt Color is required"),
    division_id: Yup.number().required("Division ID is required"),
    email: Yup.string().email("Invalid email format").required("Email is required"), // Add email validation
  });

  const onSubmit = async (values, { setSubmitting }) => {
    console.log("Submitting values:", values);
    try {
      const response = await axios.post(`${link}/participants`, values);
      console.log("Request successful:", response.data);
      if (response.data.error) {
        const queryString = new URLSearchParams({ tournament_id: data?.tournament_id }).toString();
        alert(response.data.error);
        navigate(`/Divisions?${queryString}`);
      } else {
        navigate("/LandingPage");
      }
    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container fluid className="fade-in">
        <Row className="justify-content-center">
          <Col xs={12} lg={8} xl={6}>
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
              <div className="text-center">
                <span className="loading-spinner me-2"></span>
                <span>Loading division details...</span>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className="fade-in">
      <Row className="justify-content-center">
        <Col xs={12} lg={8} xl={6}>
          <Helmet>
            <title>Participant Registration - Clash</title>
            <meta name="description" content="Register as a participant for the tournament" />
          </Helmet>
          
          <div className="page-header-modern">
            <h1 className="page-title-modern">Participant Registration</h1>
            <p className="page-subtitle-modern">Join the tournament by completing your registration</p>
          </div>

          <Card className="card-modern">
            <Card.Header className="card-modern-header">
              <h4 className="mb-0">
                <i className="fas fa-user-plus me-2"></i>
                Your Information
              </h4>
              <small className="text-muted">Please provide your details to complete registration</small>
            </Card.Header>
            <Card.Body className="card-modern-body">
          <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            validationSchema={validationSchema}
            enableReinitialize
          >
            {(formik) => (
              <Form>
                <div className="form-group-modern">
                  <label className="form-label-modern" htmlFor="name">
                    <i className="fas fa-user me-2"></i>
                    Full Name
                  </label>
                  <ErrorMessage name="name" component="div" className="text-danger mb-2" />
                  <Field
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter your full name"
                    className="form-control-modern"
                  />
                </div>

                <Row>
                  <Col md={6}>
                    <div className="form-group-modern">
                      <label className="form-label-modern" htmlFor="date_of_birth">
                        <i className="fas fa-birthday-cake me-2"></i>
                        Date of Birth
                      </label>
                      <ErrorMessage name="date_of_birth" component="div" className="text-danger mb-2" />
                      <Field
                        type="date"
                        id="date_of_birth"
                        name="date_of_birth"
                        className="form-control-modern"
                      />
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="form-group-modern">
                      <label className="form-label-modern" htmlFor="belt_color">
                        <i className="fas fa-medal me-2"></i>
                        Belt Color
                      </label>
                      <ErrorMessage name="belt_color" component="div" className="text-danger mb-2" />
                      <Field
                        type="text"
                        id="belt_color"
                        name="belt_color"
                        placeholder="Enter your belt color (e.g., White, Yellow, Orange)"
                        className="form-control-modern"
                      />
                    </div>
                  </Col>
                </Row>

                <div className="form-group-modern">
                  <label className="form-label-modern" htmlFor="email">
                    <i className="fas fa-envelope me-2"></i>
                    Email Address
                  </label>
                  <ErrorMessage name="email" component="div" className="text-danger mb-2" />
                  <Field
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email address"
                    className="form-control-modern"
                  />
                  <small className="text-muted">We'll use this to send you tournament updates</small>
                </div>

                {/* Display division information */}
                {(data || division) && (
                  <div className="form-group-modern">
                    <div className="card-modern" style={{ background: 'var(--light-grey)', border: '1px solid var(--border-grey)' }}>
                      <div className="card-modern-body" style={{ padding: '1rem' }}>
                        <h6 className="mb-2">
                          <i className="fas fa-info-circle me-2"></i>
                          Division Information
                        </h6>
                        <p className="mb-1"><strong>Age Group:</strong> {(division?.age_group || data?.age_group) || 'N/A'}</p>
                        <p className="mb-0"><strong>Proficiency Level:</strong> {(division?.proficiency_level || data?.proficiency_level) || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                <Field type="hidden" name="division_id" />

                <div className="d-grid gap-2">
                  <Button 
                    type="submit" 
                    className="btn btn-modern"
                    disabled={formik.isSubmitting}
                  >
                    {formik.isSubmitting ? (
                      <>
                        <span className="loading-spinner me-2"></span>
                        Registering...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-check me-2"></i>
                        Complete Registration
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    className="btn btn-modern-outline"
                    onClick={() => navigate('/LandingPage')}
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to Divisions
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
