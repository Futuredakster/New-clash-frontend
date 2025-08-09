import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Container, Card, Button } from "react-bootstrap";
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
    <Container style={{ marginTop: "20vh" }}>
      <Card bg="secondary" text="white">
        <Card.Body>
          <h4 className="card-title">Recover Password</h4>
          <p className="card-text">Please type in your email</p>
          <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            validationSchema={validationSchema}
            enableReinitialize
          >
            {(formik) => (
              <Form>

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

                <Button type="submit" variant="primary" disabled={formik.isSubmitting}>
                  Submit
                </Button>
              </Form>
            )}
          </Formik>
        </Card.Body>
      </Card>
    </Container>
  );
};
