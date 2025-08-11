import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import { link } from '../constant';

const CreateDivision = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tournament_id = queryParams.get('tournament_id');

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

  const onSubmit = async (values, { setSubmitting }) => {
    console.log("Submitting values:", values);
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        console.error("Access token not found. API request not made.");
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
          
          <div className="page-header-modern">
            <h1 className="page-title-modern">Create Division</h1>
            <p className="page-subtitle-modern">Set up tournament divisions to organize competitors</p>
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
                        type="text"
                        id="age_group"
                        name="age_group"
                        placeholder="Enter age group (e.g., 18-25, Under 16)"
                        className="form-control-modern"
                      />
                    </div>

                    <div className="form-group-modern">
                      <label className="form-label-modern" htmlFor="proficiency_level">
                        <i className="fas fa-medal me-2"></i>
                        Proficiency Level
                      </label>
                      <ErrorMessage name="proficiency_level" component="div" className="text-danger mb-2" />
                      <Field
                        type="text"
                        id="proficiency_level"
                        name="proficiency_level"
                        placeholder="Enter proficiency level (e.g., Beginner, Intermediate, Advanced)"
                        className="form-control-modern"
                      />
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
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateDivision;
