import React from 'react'
import { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './DisplayCart.module.css';
import { link } from '../constant';

const DisplayCart = () => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const fetchCartItems = async () => {
      const token = localStorage.getItem('participantAccessToken');
      try {
        const response = await axios.get(`${link}/cart`, {
          headers: {
            participantAccessToken: token
          }
        });
        console.log('Fetched cart items:', response.data);
       setCartItems(response.data.divisions);
      } catch (error) {
        console.error('Error fetching cart items:', error);
      }
    };

    fetchCartItems();
  }, []);

    const handlePayment = async () => {
    try {
      const response = await axios.post(`${link}/cart/create-checkout-session`, {
        cartItems,
      });
      // Stripe Checkout session URL
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start payment. Please try again.');
    }
  };

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  return (
    <div className={styles['cart-container']}>
      <h2 className={styles['cart-title']}>Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <p className={styles['empty-cart']}>Your cart is empty.</p>
      ) : (
        <>
          <ul className={styles['cart-list']}>
            {cartItems.map(item => (
              <li key={item.id}>
                <span className={styles['cart-info-group']} title={`Proficiency: ${item.proficiency_level}, Gender: ${item.gender}, Category: ${item.category}, Age Group: ${item.age_group}`}>
                  {capitalize(item.proficiency_level)} {capitalize(item.gender)} {capitalize(item.category)} {capitalize(item.age_group)}
                </span>
                <span title="Cost">${item.cost}</span>
              </li>
            ))}
          </ul>
           <button className={styles['pay-btn']} onClick={handlePayment}>Pay</button>
        </>
      )}
    </div>
  )
}

export default DisplayCart