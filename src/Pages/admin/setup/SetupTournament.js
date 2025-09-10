import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Row, Col, Button } from "react-bootstrap";
import { link } from '../../../constant';

const SetupTournament = ({ tournamentData, onStepComplete, onError }) => {
  const [existingTournament, setExistingTournament] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch existing tournament data if tournament_id exists
  useEffect(() => {
    const fetchTournamentData = async () => {
      if (tournamentData?.tournament_id) {
        try {
          const accessToken = localStorage.getItem("accessToken");
          if (!accessToken) return;

          const response = await axios.get(`${link}/tournaments`, {
            headers: { accessToken: accessToken }
          });

          const tournament = response.data.find(t => t.tournament_id === parseInt(tournamentData.tournament_id));
          if (tournament) {
            setExistingTournament(tournament);
          }
        } catch (error) {
          console.error('Error fetching tournament data:', error);
        }
      }
    };

    fetchTournamentData();
  }, [tournamentData?.tournament_id]);

  const initialValues = {
    tournament_name: existingTournament?.tournament_name || tournamentData?.tournament_name || "",
    start_date: existingTournament?.start_date ? existingTournament.start_date.split('T')[0] : "",
    end_date: existingTournament?.end_date ? existingTournament.end_date.split('T')[0] : "",
    is_published: existingTournament?.is_published || false,
    image: null,
    signup_duedate: existingTournament?.signup_duedate ? existingTournament.signup_duedate.split('T')[0] : "",
  };

  const validationSchema = Yup.object().shape({
    tournament_name: existingTournament ? Yup.string() : Yup.string().required("You must create a Tournament Name!!"),
    start_date: existingTournament ? Yup.date().nullable() : Yup.date().nullable().required("Start Date is required"),
    end_date: existingTournament ? Yup.date().nullable() : Yup.date().nullable().required("End Date is required"),
    is_published: existingTournament ? Yup.boolean() : Yup.boolean().required("Publication status is required"),
    image: existingTournament ? Yup.mixed().nullable() : Yup.mixed().required("Image is required"),
    signup_duedate: existingTournament ? Yup.date().nullable() : Yup.date().nullable().required("Signup Due Date is required"),
  });

  const onSubmit = async (values, { setSubmitting }) => {
    if (existingTournament) {
      // Update existing tournament
      await handleUpdate(values, setSubmitting);
    } else {
      // Create new tournament
      await handleCreate(values, setSubmitting);
    }
  };

  const handleCreate = async (values, setSubmitting) => {
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
        onError("Access token not found. API request not made.");
        return;
      }

      const response = await axios.post(`${link}/tournaments`, formData, {
        headers: {
          accessToken: accessToken,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Tournament created successfully:", response.data);
      
      // Complete this step and pass tournament data to next step
      onStepComplete(1, {
        tournament_id: response.data.tournament_id,
        tournament_name: values.tournament_name
      });

    } catch (error) {
      console.error("Error creating tournament:", error);
      onError(error.response?.data?.error || "Failed to create tournament. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (values, setSubmitting) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        onError("Access token not found. API request not made.");
        return;
      }

      // Use FormData to match the working API call from CustomModal
      const formData = new FormData();
      formData.append('tournament_id', existingTournament.tournament_id);
      formData.append('tournament_name', values.tournament_name);
      formData.append('start_date', values.start_date);
      formData.append('end_date', values.end_date);
      formData.append('is_published', values.is_published);
      formData.append('signup_duedate', values.signup_duedate);
      
      // Only include image if one was selected
      if (values.image) {
        formData.append('image', values.image);
      }

      // Make the actual API call using the same endpoint as CustomModal
      await axios.patch(`${link}/tournaments`, formData, {
        headers: {
          accessToken: accessToken,
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log("Tournament updated successfully");
      alert("Tournament updated successfully!");
      
      // Refresh the page to show updated data
      window.location.reload();

    } catch (error) {
      console.error("Error updating tournament:", error);
      onError(error.response?.data?.error || error.response?.data?.message || "Failed to update tournament. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingTournament) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete the tournament "${existingTournament.tournament_name}"? This action cannot be undone and will delete all associated divisions, mats, and competitor assignments.`
    );

    if (!confirmDelete) return;

    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        onError("Access token not found.");
        return;
      }

      await axios.delete(`${link}/tournaments`, {
        headers: {
          accessToken: accessToken,
        },
        data: {
          tournament_id: existingTournament.tournament_id,
        }
      });

      alert("Tournament deleted successfully!");
      
      // Navigate back to home
      window.location.href = '/Home';

    } catch (error) {
      console.error("Error deleting tournament:", error);
      onError(error.response?.data?.error || "Failed to delete tournament. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h5 className="text-primary mb-2">
          <i className="fas fa-trophy me-2"></i>
          {existingTournament ? 'Update Tournament Information' : 'Tournament Information'}
        </h5>
        <p className="text-muted">
          {existingTournament 
            ? 'Update any fields you want to change. You can leave other fields unchanged.'
            : 'Provide the basic details for your karate tournament. This information will be visible to participants and spectators.'
          }
        </p>
        {existingTournament && (
          <div className="alert alert-info">
            <i className="fas fa-info-circle me-2"></i>
            <strong>Editing existing tournament:</strong> "{existingTournament.tournament_name}"
          </div>
        )}
      </div>

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
                placeholder="Enter karate tournament name (e.g., USA Open Karate Championship)"
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
              <small className="text-muted">Last date for karate competitors to register</small>
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern" htmlFor="image">
                <i className="fas fa-image me-2"></i>
                Karate Tournament Image {existingTournament && <span className="text-muted">(Optional)</span>}
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
              <small className="text-muted">
                {existingTournament 
                  ? 'Upload a new banner image to replace the current one (leave empty to keep current image)'
                  : 'Upload a banner image for your karate tournament'
                }
              </small>
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
                  Publish karate tournament immediately
                </label>
              </div>
              <small className="text-muted">Make this karate tournament visible to the public</small>
              <ErrorMessage name="is_published" component="div" className="text-danger" />
            </div>

            <div className="d-flex justify-content-between gap-3 mt-4">
              <div className="d-flex gap-2">
                {existingTournament && (
                  <Button 
                    type="button" 
                    className="btn btn-outline-danger"
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="loading-spinner me-2"></span>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-trash me-2"></i>
                        Delete Tournament
                      </>
                    )}
                  </Button>
                )}
              </div>
              
              <div className="d-flex gap-2">
                <Button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={() => window.history.back()}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  {existingTournament ? 'Back' : 'Cancel'}
                </Button>
                
                <Button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={formik.isSubmitting}
                >
                  {formik.isSubmitting ? (
                    <>
                      <span className="loading-spinner me-2"></span>
                      {existingTournament ? 'Updating...' : 'Creating Tournament...'}
                    </>
                  ) : (
                    <>
                      <i className={`fas ${existingTournament ? 'fa-save' : 'fa-arrow-right'} me-2`}></i>
                      {existingTournament ? 'Update Tournament' : 'Create Tournament & Continue'}
                    </>
                  )}
                </Button>

                {existingTournament && (
                  <Button 
                    type="button" 
                    className="btn btn-success"
                    onClick={() => onStepComplete(1, {
                      tournament_id: existingTournament.tournament_id,
                      tournament_name: existingTournament.tournament_name
                    })}
                  >
                    <i className="fas fa-arrow-right me-2"></i>
                    Continue to Divisions
                  </Button>
                )}
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default SetupTournament;