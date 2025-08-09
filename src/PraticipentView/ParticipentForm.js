import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Container, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { link } from '../constant';

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
    return <div>Loading...</div>;
  }

  return (
    <Container style={{ marginTop: "20vh" }}>
      <Card bg="secondary" text="white">
        <Card.Body>
          <h4 className="card-title">Create Participant</h4>
          <p className="card-text">Please complete the form. It's simple</p>
          <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            validationSchema={validationSchema}
            enableReinitialize
          >
            {(formik) => (
              <Form>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Name:
                  </label>
                  <ErrorMessage name="name" component="div" className="text-danger" />
                  <Field
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter name"
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="date_of_birth" className="form-label">
                    Date of Birth:
                  </label>
                  <ErrorMessage name="date_of_birth" component="div" className="text-danger" />
                  <Field
                    type="date"
                    id="date_of_birth"
                    name="date_of_birth"
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="belt_color" className="form-label">
                    Belt Color:
                  </label>
                  <ErrorMessage name="belt_color" component="div" className="text-danger" />
                  <Field
                    type="text"
                    id="belt_color"
                    name="belt_color"
                    placeholder="Enter belt color"
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email:
                  </label>
                  <ErrorMessage name="email" component="div" className="text-danger" />
                  <Field
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter email"
                    className="form-control"
                  />
                </div>

                <Field type="hidden" name="division_id" />

                <Button type="submit" variant="primary" disabled={formik.isSubmitting}>
                  Create Participant
                </Button>
              </Form>
            )}
          </Formik>
        </Card.Body>
      </Card>
    </Container>
  );
};
