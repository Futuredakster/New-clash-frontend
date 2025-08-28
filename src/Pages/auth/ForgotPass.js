import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Container, Card, Button } from "react-bootstrap";
import { link } from '../../constant';

const ForgotPass = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    const initialValues = {
        password: "",
    };

    const validationSchema = Yup.object().shape({
        password: Yup.string().min(8, "Password must be at least 8 characters").required("Password is required"),
    });

    const onSubmit = async (values, { setSubmitting }) => {
        console.log("Submitting values:", values);
        try {
            const response = await axios.patch(
                `${link}/users/newpassword`,
                values,
                {
                    headers: {
                        token: token,
                    }
                }
            );
            console.log("Request successful:", response.data);
            if (response.data.error) {
              alert(response.data.error);
            } else {
                alert(response.data.message);
                navigate("/Login");
            }
        } catch (error) {
          alert("Link has expired. Please input your email again.");
          navigate("/RecoverPassword");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Container style={{ marginTop: "20vh" }}>
            <Card bg="secondary" text="white">
                <Card.Body>
                    <h4 className="card-title">Recover Password</h4>
                    <p className="card-text">Please type in your password</p>
                    <Formik
                        initialValues={initialValues}
                        onSubmit={onSubmit}
                        validationSchema={validationSchema}
                        enableReinitialize
                    >
                        {(formik) => (
                            <Form>
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">
                                        Password:
                                    </label>
                                    <ErrorMessage name="password" component="div" className="text-danger" />
                                    <Field
                                        type="password"
                                        id="password"
                                        name="password"
                                        placeholder="Enter password"
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

export default ForgotPass;
