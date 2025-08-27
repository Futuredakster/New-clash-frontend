import React from 'react'
import { useEffect, useState,useContext } from 'react';
import axios from 'axios';
import styles from './DisplayCart.module.css';
import { link } from '../constant';
import {useLocation} from 'react-router-dom';
import { AuthContext } from '../helpers/AuthContext';

const DisplayCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const {parentState,setParentState} = useContext(AuthContext);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tournament_id = queryParams.get('tournament_id');
  console.log("Tournament ID:", tournament_id);

 
  useEffect(() => {
    if(!parentState.status){
    const fetchCartItems = async () => {
      const token = localStorage.getItem('participantAccessToken');
      try {
        const response = await axios.get(`${link}/cart`, {
          headers: {
            participantAccessToken: token
          },
           params: { tournament_id }
        });
        console.log('Fetched cart items:', response.data);
       setCartItems(response.data.divisions);
      } catch (error) {
        console.error('Error fetching cart items:', error);
      }
    };

    fetchCartItems();
  } else if(parentState.status) {
    const fetchCartItems = async () => {
        const parentToken = localStorage.getItem('parentToken');
        try {
          const response = await axios.get(`${link}/cart/parent`, {
            headers: {
              parentAccessToken: parentToken
            },
            params: { tournament_id }
          });
          console.log('Fetched cart items for parent:', response.data);
           setCartItems(response.data.cartItems);
        } catch (error) {
          console.error('Error fetching cart items for parent:', error);
        }
      };

      fetchCartItems();
    }
  }, [parentState.status]);

  const handlePayment = async () => {
     if(!parentState.status) {
     const token = localStorage.getItem('participantAccessToken');
  try {
    const response = await axios.post(
      `${link}/cart/create-checkout-session`,
      { tournament_id }, // body
      {
        headers: {
          participantAccessToken: token, // config (headers)
        },
      }
    );
    // Stripe Checkout session URL
    window.location.href = response.data.url;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    alert("Failed to start payment. Please try again.");
  }

  } else if(parentState.status) {
      const parentToken = localStorage.getItem('parentToken');
      try {
        const response = await axios.post(
          `${link}/cart/create-checkout-session/parent`,
          { tournament_id }, // body
          {
            headers: {
              parentAccessToken: parentToken, // config (headers)
            },
          }
        );
        // Stripe Checkout session URL
        window.location.href = response.data.url;
      } catch (error) {
        console.error("Error creating checkout session:", error);
        alert("Failed to start payment. Please try again.");
      }
  }
}

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
const renderCartItem = (item, index) => {
    if (parentState.status) {
      // Parent view - show participant name and division details
      const division = item.Division;
      return (
        <li key={`${item.cart_id}-${index}`} className={styles['cart-item-parent']}>
          <div className={styles['participant-info']}>
            <strong>{item.participant_name}</strong>
          </div>
          <span 
            className={styles['cart-info-group']} 
            title={`Proficiency: ${division.proficiency_level}, Gender: ${division.gender}, Category: ${division.category}, Age Group: ${division.age_group}`}
          >
            {capitalize(division.proficiency_level)} {capitalize(division.gender)} {capitalize(division.category)} {capitalize(division.age_group)}
          </span>
          <span title="Cost">${division.cost}</span>
        </li>
      );
    } else {
      // Participant view - original structure
      return (
        <li key={item.id}>
          <span 
            className={styles['cart-info-group']} 
            title={`Proficiency: ${item.proficiency_level}, Gender: ${item.gender}, Category: ${item.category}, Age Group: ${item.age_group}`}
          >
            {capitalize(item.proficiency_level)} {capitalize(item.gender)} {capitalize(item.category)} {capitalize(item.age_group)}
          </span>
          <span title="Cost">${item.cost}</span>
        </li>
      );
    }
  };

  return (
    <div className={styles['cart-container']}>
      <h2 className={styles['cart-title']}>
        Shopping Cart {parentState.status && "(Parent View)"}
      </h2>
      {cartItems.length === 0 ? (
        <p className={styles['empty-cart']}>Your cart is empty.</p>
      ) : (
        <>
          <ul className={styles['cart-list']}>
            {cartItems.map((item, index) => renderCartItem(item, index))}
          </ul>
          <button className={styles['pay-btn']} onClick={handlePayment}>Pay</button>
        </>
      )}
    </div>
  )
}

export default DisplayCart