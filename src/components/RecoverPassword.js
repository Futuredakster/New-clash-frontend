import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Container, Row, Col, Card, Form as BootstrapForm } from "react-bootstrap";
import { Link } from "react-router-dom";
import { link } from './constant';


export const RecoverPassword = () => {
  const [loading, setLoading] = useState(true); 



  const initialValues = {
    email: "", // Add email to initial values
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email format").required("Email is required"), // Add email validation
  });

  const onSubmit = async (values, { setSubmitting }) => {
    console.log("Submitting values:", values);
    try {
      const response = await axios.post(`${link}/users/verifyemail`, values);
      console.log("Request successful:", response.data);
      if (response.data.error) {
        alert(response.data.error);
      } else {
       alert( response.data.message)
      }
    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error.message);
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center" style={{background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)'}}>
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={8} md={6} lg={4} xl={3}>
          <div className="fade-in">
            <Card className="card-modern shadow">
              <Card.Header className="text-center bg-white border-0 pt-4 pb-2">
                <h3 className="mb-0 fw-bold" style={{color: 'var(--dark-grey)'}}>Password Recovery</h3>
                <p className="text-muted mb-0">Enter your email to reset your password</p>
              </Card.Header>
              <Card.Body className="px-4 pb-4">
                <Formik
                  initialValues={initialValues}
                  onSubmit={onSubmit}
                  validationSchema={validationSchema}
                  enableReinitialize
                >
                  {(formik) => (
                    <Form>
                      <div className="form-group-modern">
                        <label className="form-label-modern">Email Address</label>
                        <Field
                          type="email"
                          id="email"
                          name="email"
                          placeholder="Enter your email address"
                          className="form-control-modern"
                        />
                        <ErrorMessage name="email" component="div" className="text-danger mt-1" style={{fontSize: '14px'}} />
                      </div>

                      <div className="d-grid gap-2 mb-3">
                        <button 
                          type="submit" 
                          className="btn btn-modern"
                          disabled={formik.isSubmitting}
                        > 
                          <i className="fas fa-paper-plane me-2"></i>
                          {formik.isSubmitting ? 'Sending...' : 'Send Recovery Email'}
                        </button>
                      </div>
                      <div className="text-center">
                        <Link 
                          to="/Login" 
                          className="btn btn-modern-outline btn-sm"
                          style={{textDecoration: 'none'}}
                        > 
                          <i className="fas fa-arrow-left me-2"></i>
                          Back to Login
                        </Link>
                      </div>
                    </Form>
                  )}
                </Formik>
              </Card.Body>
            </Card>
            <div className="text-center mt-3">
              <small className="text-muted">
                Remember your password? <Link to="/Login" className="text-dark fw-bold">Sign in here</Link>
              </small>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};
