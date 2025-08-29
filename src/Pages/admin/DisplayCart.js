import React from 'react'
import { useEffect, useState,useContext } from 'react';
import axios from 'axios';
import styles from './DisplayCart.module.css';
import { link } from '../../constant';
import {useLocation, useNavigate} from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';

const DisplayCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const {parentState, partState} = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const tournament_id = queryParams.get('tournament_id');
  console.log("Tournament ID:", tournament_id);

  // Wait for auth state to be determined
  useEffect(() => {
    const checkAuthState = () => {
      const parentToken = localStorage.getItem('parentToken');
      const participantToken = localStorage.getItem('participantAccessToken');
      
      // If we have tokens but states aren't loaded yet, wait
      if ((parentToken && !parentState.status && !partState.status) || 
          (participantToken && !partState.status && !parentState.status)) {
        // Still loading auth, wait a bit
        setTimeout(checkAuthState, 100);
        return;
      }
      
      setAuthLoading(false);
    };
    
    checkAuthState();
  }, [parentState.status, partState.status]);
 
  useEffect(() => {
    if (authLoading) return; // Wait for auth to complete
    
    const fetchCartItems = async () => {
      setLoading(true);
      setError('');
      
      try {
        if (parentState.status) {
          const parentToken = localStorage.getItem('parentToken');
          const response = await axios.get(`${link}/cart/parent`, {
            headers: { parentAccessToken: parentToken },
            params: { tournament_id }
          });
          console.log('Fetched cart items for parent:', response.data);
          setCartItems(response.data.cartItems || []);
        } else {
          const token = localStorage.getItem('participantAccessToken');
          const response = await axios.get(`${link}/cart`, {
            headers: { participantAccessToken: token },
            params: { tournament_id }
          });
          console.log('Fetched cart items:', response.data);
          setCartItems(response.data.divisions || []);
        }
      } catch (error) {
        console.error('Error fetching cart items:', error);
        setError('Failed to load cart items. Please try again.');
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [parentState.status, tournament_id, authLoading]);

  const handlePayment = async () => {
    if (cartItems.length === 0) return;
    
    setPaymentLoading(true);
    setError('');
    
    try {
      const endpoint = parentState.status ? '/create-checkout-session/parent' : '/create-checkout-session';
      const token = parentState.status 
        ? localStorage.getItem('parentToken')
        : localStorage.getItem('participantAccessToken');
      const headerKey = parentState.status ? 'parentAccessToken' : 'participantAccessToken';
      
      const response = await axios.post(
        `${link}/cart${endpoint}`,
        { tournament_id },
        { headers: { [headerKey]: token } }
      );
      
      // Redirect to Stripe Checkout
      window.location.href = response.data.url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      setError("Failed to start payment. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const division = parentState.status ? item.Division : item;
      return total + (division.cost || 0);
    }, 0);
  };

  const handleDeleteItem = async (cartId) => {
    try {
      const endpoint = parentState.status ? `/cart/parent/${cartId}` : `/cart/item/${cartId}`;
      const token = parentState.status 
        ? localStorage.getItem('parentToken')
        : localStorage.getItem('participantAccessToken');
      const headerKey = parentState.status ? 'parentAccessToken' : 'participantAccessToken';

      await axios.delete(`${link}${endpoint}`, {
        headers: { [headerKey]: token }
      });

      // Remove item from local state
      setCartItems(prevItems => prevItems.filter(item => item.cart_id !== cartId));
      setSuccess('Item removed from cart successfully');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('Error deleting cart item:', error);
      setError('Failed to remove item from cart. Please try again.');
      setTimeout(() => setError(''), 5000);
    }
  };

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  const renderCartItem = (item, index) => {
    const division = parentState.status ? item.Division : item;
    
    return (
      <Card key={`${item.cart_id || item.id}-${index}`} className="mb-3 border-0 shadow-sm">
        <Card.Body className="p-4">
          <Row className="align-items-center">
            <Col xs={12} md={parentState.status ? 3 : 4}>
              {parentState.status && (
                <div className="mb-2 mb-md-0">
                  <div className="d-flex align-items-center">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                         style={{width: '40px', height: '40px', minWidth: '40px'}}>
                      <i className="fas fa-user"></i>
                    </div>
                    <div>
                      <h6 className="mb-0 fw-bold">{item.participant_name}</h6>
                      <small className="text-muted">Participant</small>
                    </div>
                  </div>
                </div>
              )}
            </Col>
            
            <Col xs={12} md={parentState.status ? 6 : 5}>
              <div className="d-flex flex-wrap gap-2 mb-2 mb-md-0">
                <Badge bg="primary" className="px-3 py-2">
                  <i className="fas fa-medal me-1"></i>
                  {capitalize(division.proficiency_level)}
                </Badge>
                <Badge bg="info" className="px-3 py-2">
                  <i className="fas fa-venus-mars me-1"></i>
                  {capitalize(division.gender)}
                </Badge>
                <Badge bg="secondary" className="px-3 py-2">
                  <i className="fas fa-fist-raised me-1"></i>
                  {capitalize(division.category)}
                </Badge>
                <Badge bg="warning" text="dark" className="px-3 py-2">
                  <i className="fas fa-birthday-cake me-1"></i>
                  {division.age_group}
                </Badge>
              </div>
            </Col>
            
            <Col xs={12} md={3} className="text-md-end">
              <div className="d-flex align-items-center justify-content-md-end gap-3">
                <span className="h4 mb-0 text-success fw-bold">
                  <i className="fas fa-dollar-sign me-1"></i>
                  {(division.cost / 100).toFixed(2)}
                </span>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDeleteItem(item.cart_id)}
                  title="Remove from cart"
                >
                  <i className="fas fa-trash"></i>
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  return (
    <Container fluid className="py-4">
      <Row className="justify-content-center">
        <Col xs={12} lg={10} xl={8}>
          <Card className="border-0 shadow-lg">
            <Card.Header className="bg-primary text-white p-4">
              <Row className="align-items-center">
                <Col>
                  <h2 className="mb-0 d-flex align-items-center">
                    <i className="fas fa-shopping-cart me-3"></i>
                    Shopping Cart
                    {parentState.status && (
                      <Badge bg="light" text="primary" className="ms-3">
                        Parent View
                      </Badge>
                    )}
                  </h2>
                </Col>
                <Col xs="auto">
                  <Button 
                    variant="outline-light" 
                    size="sm" 
                    onClick={() => navigate(-1)}
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Back
                  </Button>
                </Col>
              </Row>
            </Card.Header>

            <Card.Body className="p-4">
              {/* Loading State */}
              {(loading || authLoading) && (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" className="mb-3" />
                  <p className="text-muted">
                    {authLoading ? 'Checking authentication...' : 'Loading your cart...'}
                  </p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              )}

              {/* Success State */}
              {success && (
                <Alert variant="success" dismissible onClose={() => setSuccess('')}>
                  <i className="fas fa-check-circle me-2"></i>
                  {success}
                </Alert>
              )}

              {/* Empty Cart */}
              {!loading && cartItems.length === 0 && (
                <div className="text-center py-5">
                  <div className="mb-4">
                    <i className="fas fa-shopping-cart fa-4x text-muted"></i>
                  </div>
                  <h4 className="text-muted mb-3">Your cart is empty</h4>
                  <p className="text-muted mb-4">
                    Browse divisions and add them to your cart to get started!
                  </p>
                  <Button 
                    variant="primary" 
                    onClick={() => navigate(-1)}
                  >
                    <i className="fas fa-search me-2"></i>
                    Browse Divisions
                  </Button>
                </div>
              )}

              {/* Cart Items */}
              {!loading && cartItems.length > 0 && (
                <>
                  <div className="mb-4">
                    <h5 className="text-muted mb-3">
                      <i className="fas fa-list me-2"></i>
                      Cart Items ({cartItems.length})
                    </h5>
                    {cartItems.map((item, index) => renderCartItem(item, index))}
                  </div>

                  {/* Cart Summary */}
                  <Card className="bg-light border-0">
                    <Card.Body className="p-4">
                      <Row className="align-items-center">
                        <Col>
                          <div className="d-flex align-items-center">
                            <i className="fas fa-calculator text-primary me-3 fa-lg"></i>
                            <div>
                              <h5 className="mb-1">Total Amount</h5>
                              <small className="text-muted">
                                {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
                              </small>
                            </div>
                          </div>
                        </Col>
                        <Col xs="auto">
                          <h3 className="mb-0 text-success fw-bold">
                            ${(calculateTotal() / 100).toFixed(2)}
                          </h3>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>

                  {/* Payment Button */}
                  <div className="d-grid gap-2 mt-4">
                    <Button 
                      variant="success" 
                      size="lg" 
                      onClick={handlePayment}
                      disabled={paymentLoading || cartItems.length === 0}
                    >
                      {paymentLoading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            className="me-2"
                          />
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-credit-card me-2"></i>
                          Proceed to Payment
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="text-center mt-3">
                    <small className="text-muted">
                      <i className="fas fa-lock me-1"></i>
                      Your payment is secured by Stripe
                    </small>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default DisplayCart