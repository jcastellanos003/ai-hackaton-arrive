import { test } from '@playwright/test'

test.describe('Cart Page', () => {
  test.todo('shows empty cart state when no items are in cart')
  test.todo('displays cart items with image, name, price, and quantity')
  test.todo('increases item quantity when + button is clicked')
  test.todo('decreases item quantity when - button is clicked')
  test.todo('prevents quantity from exceeding available inventory')
  test.todo('removes item from cart when remove button is clicked')
  test.todo('displays correct subtotal, tax, shipping, and total')
  test.todo('navigates to checkout when CTA is clicked')
})
