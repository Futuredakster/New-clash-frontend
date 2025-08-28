import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import {AuthContext} from '../../context/AuthContext';
import { useContext } from "react";
import { link } from "../../constant";

export const ParticipantLogin = () => {
  const navigate = useNavigate();
    const {setPartState,partState} = useContext(AuthContext);

  const initialValues = {
    name: "",
    date_of_birth: "",
    belt_color: "",
    email: "",
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    date_of_birth: Yup.date().required("Date of Birth is required"),
    belt_color: Yup.string().required("Belt Color is required"),
    email: Yup.string().email("Invalid email format").required("Email is required"),
  });

  const onSubmit = async (values, { setSubmitting }) => {
    console.log("Submitting values:", values);
    try {
      const response = await axios.post(`${link}/participants/login`, values);
      console.log("Request successful:", response.data);

      if (response.data.error) {
        alert(response.data.error);
      } else {
         const { token } = response.data;

      // Save token to local storage
      localStorage.setItem('participantAccessToken', token);
       setPartState({
        id:response.data.id,
        name:response.data.name,
        status:true
       })
        navigate("/CompetitorView");
      }
    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container fluid className="fade-in">
      <Row className="justify-content-center">
        <Col xs={12} lg={8} xl={6}>
          <Helmet>
            <title>Participant Registration - Clash</title>
            <meta
              name="description"
              content="Register as a participant for the tournament"
            />
          </Helmet>

          <div className="page-header-modern">
            <h1 className="page-title-modern">Participant Registration</h1>
            <p className="page-subtitle-modern">
              Join the tournament by completing your registration
            </p>
          </div>

          <Card className="card-modern">
            <Card.Header className="card-modern-header">
              <h4 className="mb-0">
                <i className="fas fa-user-plus me-2"></i>
                Your Information
              </h4>
              <small className="text-muted">
                Please provide your details to complete registration
              </small>
            </Card.Header>
            <Card.Body className="card-modern-body">
              <Formik
                initialValues={initialValues}
                onSubmit={onSubmit}
                validationSchema={validationSchema}
              >
                {(formik) => (
                  <Form>
                    {/* Name */}
                    <div className="form-group-modern">
                      <label className="form-label-modern" htmlFor="name">
                        <i className="fas fa-user me-2"></i>
                        Full Name
                      </label>
                      <ErrorMessage
                        name="name"
                        component="div"
                        className="text-danger mb-2"
                      />
                      <Field
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Enter your full name"
                        className="form-control-modern"
                      />
                    </div>

                    {/* DOB + Belt */}
                    <Row>
                      <Col md={6}>
                        <div className="form-group-modern">
                          <label className="form-label-modern" htmlFor="date_of_birth">
                            <i className="fas fa-birthday-cake me-2"></i>
                            Date of Birth
                          </label>
                          <ErrorMessage
                            name="date_of_birth"
                            component="div"
                            className="text-danger mb-2"
                          />
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
                          <ErrorMessage
                            name="belt_color"
                            component="div"
                            className="text-danger mb-2"
                          />
                          <Field
                            type="text"
                            id="belt_color"
                            name="belt_color"
                            placeholder="Enter your belt color"
                            className="form-control-modern"
                          />
                        </div>
                      </Col>
                    </Row>



                    {/* Email */}
                    <div className="form-group-modern">
                      <label className="form-label-modern" htmlFor="email">
                        <i className="fas fa-envelope me-2"></i>
                        Email Address
                      </label>
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="text-danger mb-2"
                      />
                      <Field
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Enter your email address"
                        className="form-control-modern"
                      />
                    </div>

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
                        onClick={() => navigate("/LandingPage")}
                      >
                        <i className="fas fa-arrow-left me-2"></i>
                        Back
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
