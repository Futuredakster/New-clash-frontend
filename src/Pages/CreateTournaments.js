import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { link } from '../constant';

const CreateTournaments = () => {
  const navigate = useNavigate();

  const initialValues = {
    tournament_name: "",
    start_date: "",
    end_date: "",
    is_published: false,
    image: null,
    signup_duedate: "",
  };

  const validationSchema = Yup.object().shape({
    tournament_name: Yup.string().required("You must create a Tournament Name!!"),
    start_date: Yup.date().nullable().required("Start Date is required"),
    end_date: Yup.date().nullable().required("End Date is required"),
    is_published: Yup.boolean().required("Publication status is required"),
    image: Yup.mixed().required("Image is required"),
    signup_duedate: Yup.date().nullable().required("Signup Due Date is required"),
  });

  const onSubmit = async (values, { setSubmitting }) => {
    const formData = new FormData();
    formData.append("tournament_name", values.tournament_name);
    formData.append("start_date", values.start_date);
    formData.append("end_date", values.end_date);
    formData.append("is_published", values.is_published);
    formData.append("image", values.image);
    formData.append("signup_duedate", values.signup_duedate);

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        console.error("Access token not found. API request not made.");
        return;
      }

      const response = await axios.post(`${link}/tournaments`, formData, {
        headers: {
          accessToken: accessToken,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Request successful:", response.data);
      const queryString = new URLSearchParams({ tournament_id: response.data.tournament_id}).toString();
      navigate(`/CreateDivision?${queryString}`);
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
            <title>Create Tournament - Clash</title>
            <meta name="description" content="Create a new tournament with ease" />
          </Helmet>
          
          <div className="page-header-modern">
            <h1 className="page-title-modern">Create Tournament</h1>
            <p className="page-subtitle-modern">Set up your tournament in just a few steps</p>
          </div>

          <Card className="card-modern">
            <Card.Header className="card-modern-header">
              <h4 className="mb-0">
                <i className="fas fa-trophy me-2"></i>
                Tournament Details
              </h4>
              <small className="text-muted">Fill in the information below to create your tournament</small>
            </Card.Header>
            <Card.Body className="card-modern-body">
              <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
                {(formik) => (
                  <Form>
                    <div className="form-group-modern">
                      <label className="form-label-modern" htmlFor="tournament_name">
                        <i className="fas fa-tag me-2"></i>
                        Tournament Name
                      </label>
                      <ErrorMessage name="tournament_name" component="div" className="text-danger mb-2" />
                      <Field
                        type="text"
                        id="tournament_name"
                        name="tournament_name"
                        placeholder="Enter tournament name (e.g., USA Open Championship)"
                        className="form-control-modern"
                      />
                    </div>

                    <Row>
                      <Col md={6}>
                        <div className="form-group-modern">
                          <label className="form-label-modern" htmlFor="start_date">
                            <i className="fas fa-calendar-start me-2"></i>
                            Start Date
                          </label>
                          <ErrorMessage name="start_date" component="div" className="text-danger mb-2" />
                          <Field type="date" id="start_date" name="start_date" className="form-control-modern" />
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="form-group-modern">
                          <label className="form-label-modern" htmlFor="end_date">
                            <i className="fas fa-calendar-end me-2"></i>
                            End Date
                          </label>
                          <ErrorMessage name="end_date" component="div" className="text-danger mb-2" />
                          <Field type="date" id="end_date" name="end_date" className="form-control-modern" />
                        </div>
                      </Col>
                    </Row>

                    <div className="form-group-modern">
                      <label className="form-label-modern" htmlFor="signup_duedate">
                        <i className="fas fa-clock me-2"></i>
                        Signup Due Date
                      </label>
                      <ErrorMessage name="signup_duedate" component="div" className="text-danger mb-2" />
                      <Field type="date" id="signup_duedate" name="signup_duedate" className="form-control-modern" />
                      <small className="text-muted">Last date for participants to register</small>
                    </div>

                    <div className="form-group-modern">
                      <label className="form-label-modern" htmlFor="image">
                        <i className="fas fa-image me-2"></i>
                        Tournament Image
                      </label>
                      <ErrorMessage name="image" component="div" className="text-danger mb-2" />
                      <input
                        type="file"
                        id="image"
                        name="image"
                        accept="image/*"
                        onChange={(event) => formik.setFieldValue("image", event.target.files[0])}
                        className="form-control-modern"
                      />
                      <small className="text-muted">Upload a banner image for your tournament</small>
                    </div>

                    <div className="form-group-modern">
                      <div className="form-check">
                        <Field 
                          type="checkbox" 
                          id="is_published" 
                          name="is_published" 
                          className="form-check-input" 
                        />
                        <label htmlFor="is_published" className="form-check-label">
                          <i className="fas fa-globe me-2"></i>
                          Publish tournament immediately
                        </label>
                      </div>
                      <small className="text-muted">Make this tournament visible to the public</small>
                      <ErrorMessage name="is_published" component="div" className="text-danger" />
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
                            Creating Tournament...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-plus me-2"></i>
                            Create Tournament
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

export default CreateTournaments;
