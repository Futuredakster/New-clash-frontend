import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Container, Row, Col, Card } from "react-bootstrap";
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
        <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center" style={{background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)'}}>
            <Row className="w-100 justify-content-center">
                <Col xs={12} sm={8} md={6} lg={4} xl={3}>
                    <div className="fade-in">
                        <Card className="card-modern shadow">
                            <Card.Header className="text-center bg-white border-0 pt-4 pb-2">
                                <h3 className="mb-0 fw-bold" style={{color: 'var(--dark-grey)'}}>Reset Password</h3>
                                <p className="text-muted mb-0">Enter your new password to complete the reset</p>
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
                                                <label className="form-label-modern">New Password</label>
                                                <ErrorMessage name="password" component="div" className="text-danger small mb-2" />
                                                <Field
                                                    type="password"
                                                    id="password"
                                                    name="password"
                                                    placeholder="Enter new password"
                                                    className="form-control-modern"
                                                />
                                            </div>
                                            <div className="d-grid gap-2">
                                                <button 
                                                    type="submit" 
                                                    className="btn btn-modern"
                                                    disabled={formik.isSubmitting}
                                                >
                                                    <i className="fas fa-lock me-2"></i>
                                                    {formik.isSubmitting ? 'Updating...' : 'Update Password'}
                                                </button>
                                            </div>
                                        </Form>
                                    )}
                                </Formik>
                            </Card.Body>
                        </Card>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default ForgotPass;
