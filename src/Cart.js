import React, { useState, useContext } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import Input from './Input.js';
import Button from './Button.js';
import { AppContext } from './AppContext.js';

const stripeLoadedPromise = loadStripe(
  'pk_test_51J3n7ZAvqK1K95t27ZpkR67YXYYYbLe9tAKVqOjBwZ6rEvdvXbbHDX0zIf0PhG61xLYBfrOTo9veTBtjXI0ULY1w00vj20Yir3'
);

export default function Cart() {
  const app = useContext(AppContext);
  const cart = app.cart;
  const totalPrice = app.getTotalPrice();

  const [email, setEmail] = useState('');

  function handleFormSubmit(event) {
    event.preventDefault();

    const lineItems = cart.map((product) => {
      return { price: product.price_id, quantity: product.quantity };
    });

    // TODO: change success and cancel URL. Bad practice to rely on URL to validate payment
    // normally handeled by back-end with Stripe API.
    stripeLoadedPromise.then((stripe) => {
      stripe
        .redirectToCheckout({
          lineItems: lineItems,
          mode: 'payment',
          successUrl: 'https://myreactmarket.com',
          cancelUrl: 'https://myreactmarket.com',
          customerEmail: email,
        })
        .then((response) => {
          // this will only log if the redirect did not work
          console.log(response.error);
        })
        .catch((error) => {
          // wrong API key? you will see the error message here
          console.log(error);
        });
    });
  }

  return (
    <div className='cart-layout'>
      <div>
        <h1>Your Cart</h1>
        {cart.length === 0 && (
          <p>You have not added any product to your cart yet.</p>
        )}
        {cart.length > 0 && (
          <>
            <table className='table table-cart'>
              <thead>
                <tr>
                  <th width='25%' className='th-product'>
                    Product
                  </th>
                  <th width='20%'>Unit price</th>
                  <th width='10%'>Quanity</th>
                  <th width='25%'>Total</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((product) => {
                  return (
                    <tr key={product.id}>
                      <td>
                        <img
                          src={product.image}
                          width='30'
                          height='30'
                          alt=''
                        />{' '}
                        {product.name}
                      </td>
                      <td>${product.price}</td>
                      <td>{product.quantity}</td>
                      <td>
                        <strong>${product.price * product.quantity}</strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan='2'></th>
                  <th className='cart-highlight'>Total</th>
                  <th className='cart-highlight'>${totalPrice}</th>
                </tr>
              </tfoot>
            </table>
            <form className='pay-form' onSubmit={handleFormSubmit}>
              <p>
                Enter your email and then click on pay and your products will be
                delivered to you on the same day!
                <br />
              </p>
              <Input
                placeholder='Email'
                onChange={(event) => setEmail(event.target.value)}
                value={email}
                type='email'
                required
              />
              <Button type='submit'>Pay</Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
