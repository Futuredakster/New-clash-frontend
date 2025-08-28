import axios from "axios";
import { useNavigate } from 'react-router-dom';
import React, { useState,useContext } from "react";
import {AuthContext} from '../../context/AuthContext';
import { Link } from "react-router-dom";
import { link } from '../../constant';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const {setAuthState, authState} = useContext(AuthContext);
  const navigate = useNavigate();
  const login = () => {
    const data = { username: username, password: password };
    axios.post(`${link}/users/Login`, data).then((response) => {
      if(response.data.error){
        alert(response.data.error)
      }
      else{
      localStorage.setItem("accessToken", response.data.token);
      setAuthState({
        username: response.data.username,
        id: response.data.id,
        status: true,
        account_id: response.data.account_id,
        role: response.data.role
      });
      navigate('/Home');
      }
    });
  };
  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center" style={{background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)'}}>
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={8} md={6} lg={4} xl={3}>
          <div className="fade-in">
            <Card className="card-modern shadow">
              <Card.Header className="text-center bg-white border-0 pt-4 pb-2">
                <h3 className="mb-0 fw-bold" style={{color: 'var(--dark-grey)'}}>Welcome Back</h3>
                <p className="text-muted mb-0">Sign in to your account</p>
              </Card.Header>
              <Card.Body className="px-4 pb-4">
                <Form>
                  <div className="form-group-modern">
                    <label className="form-label-modern">Username</label>
                    <input
                      type="text"
                      className="form-control-modern"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(event) => {
                        setUsername(event.target.value);
                      }}
                    />
                  </div>
                  <div className="form-group-modern">
                    <label className="form-label-modern">Password</label>
                    <input
                      type="password"
                      className="form-control-modern"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                      }}
                    />
                  </div>
                  <div className="d-grid gap-2 mb-3">
                    <button 
                      type="button" 
                      className="btn btn-modern"
                      onClick={login}
                    > 
                      <i className="fas fa-sign-in-alt me-2"></i>
                      Sign In
                    </button>
                  </div>
                  <div className="text-center">
                    <Link 
                      to="/RecoverPassword" 
                      className="btn btn-modern-outline btn-sm"
                      style={{textDecoration: 'none'}}
                    > 
                      <i className="fas fa-key me-2"></i>
                      Forgot Password?
                    </Link>
                  </div>
                </Form>
              </Card.Body>
            </Card>
            <div className="text-center mt-3">
              <small className="text-muted">
                Don't have an account? <Link to="/AccountUser" className="text-dark fw-bold">Sign up here</Link>
              </small>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
