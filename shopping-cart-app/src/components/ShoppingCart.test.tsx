import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event'; 
import { ShoppingCart } from './ShoppingCart';

async function addItem(
    user: ReturnType<typeof userEvent.setup>,
    name: string,
    price: string
) {
    await user.type(screen.getByLabelText('Product name'), name);
    await user.type(screen.getByLabelText('Product price'), price);
    await user.click(screen.getByRole('button', { name: /add to cart/i }));
}

describe('ShoppingCart', () => {
  describe('initial render', () => {
    it('should show the heading', () => {
      render(<ShoppingCart />);
      expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
    });

    it('should show the empty cart message', () => {
      render(<ShoppingCart />);
      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    });

    it('should show both inputs and the Add to Cart button', () => {
      render(<ShoppingCart />);
      expect(screen.getByLabelText('Product name')).toBeInTheDocument();
      expect(screen.getByLabelText('Product price')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /add to cart/i })
      ).toBeInTheDocument();
    });
  });

  describe('adding items', () => {
    it('should show the item after adding it', async () => {
      const user = userEvent.setup();
      render(<ShoppingCart />);

      await addItem(user, 'Shirt', '20');

      expect(screen.getByText('Shirt')).toBeInTheDocument();
      expect(screen.getByText('$20.00')).toBeInTheDocument();
      expect(screen.queryByText('Your cart is empty')).not.toBeInTheDocument();
    });

    it('should clear both inputs after adding', async () => {
      const user = userEvent.setup();
      render(<ShoppingCart />);

      await addItem(user, 'Shirt', '20');

      expect(screen.getByLabelText('Product name')).toHaveValue('');
      expect(screen.getByLabelText('Product price')).toHaveValue(null);
    });

    it('should not add an item when the name is empty', async () => {
      const user = userEvent.setup();
      render(<ShoppingCart />);

      await user.type(screen.getByLabelText('Product price'), '20');
      await user.click(screen.getByRole('button', { name: /add to cart/i }));

      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    });

    it('should not add an item when the price is empty', async () => {
      const user = userEvent.setup();
      render(<ShoppingCart />);

      await user.type(screen.getByLabelText('Product name'), 'Shirt');
      await user.click(screen.getByRole('button', { name: /add to cart/i }));

      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    });

    it('should not add an item when the price is 0', async () => {
      const user = userEvent.setup();
      render(<ShoppingCart />);

      await addItem(user, 'Free', '0');

      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    });

    it('should not add an item when the price is negative', async () => {
      const user = userEvent.setup();
      render(<ShoppingCart />);

      await addItem(user, 'Bad', '-5');

      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    });

    it('should not add an item when the name is only spaces', async () => {
      const user = userEvent.setup();
      render(<ShoppingCart />);

      await addItem(user, '   ', '20');

      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    });
  });

  describe('removing items', () => {
    it('should remove an item when Remove is clicked', async () => {
      const user = userEvent.setup();
      render(<ShoppingCart />);

      await addItem(user, 'Shirt', '20');
      await user.click(screen.getByRole('button', { name: 'Remove' }));

      expect(screen.queryByText('Shirt')).not.toBeInTheDocument();
    });

    it('should show the empty message after removing the last item', async () => {
      const user = userEvent.setup();
      render(<ShoppingCart />);

      await addItem(user, 'Shirt', '20');
      await user.click(screen.getByRole('button', { name: 'Remove' }));

      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    });
  });

  describe('updating quantity', () => {
    it('should update the totals when the quantity changes', async () => {
      const user = userEvent.setup();
      render(<ShoppingCart />);

      await addItem(user, 'Shirt', '10');
      expect(screen.getByText('Subtotal: $10.00')).toBeInTheDocument();

      // The box already holds "1", so typing "2" makes it "12"
      await user.type(screen.getByLabelText('Quantity for Shirt'), '2');

      expect(screen.getByText('Subtotal: $120.00')).toBeInTheDocument();
    });

    it('should ignore a quantity below 1', async () => {
      const user = userEvent.setup();
      render(<ShoppingCart />);

      await addItem(user, 'Shirt', '10');

      // fireEvent is used here only because userEvent can't type a clean 0 into this box
      fireEvent.change(screen.getByLabelText('Quantity for Shirt'), {
        target: { value: '0' },
      });

      expect(screen.getByLabelText('Quantity for Shirt')).toHaveValue(1);
      expect(screen.getByText('Subtotal: $10.00')).toBeInTheDocument();
    });
  });

  describe('calculations', () => {
    it('should show no discount under $50', async () => {
      const user = userEvent.setup();
      render(<ShoppingCart />);

      await addItem(user, 'Pen', '20');

      expect(screen.getByText('Subtotal: $20.00')).toBeInTheDocument();
      expect(screen.getByText('Discount: -$0.00')).toBeInTheDocument();
      expect(screen.getByText('Tax: $1.60')).toBeInTheDocument();
      expect(screen.getByText('Total: $21.60')).toBeInTheDocument();
    });

    it('should show a 5% discount at $50 or more', async () => {
      const user = userEvent.setup();
      render(<ShoppingCart />);

      await addItem(user, 'Shirt', '60');

      expect(screen.getByText('Subtotal: $60.00')).toBeInTheDocument();
      expect(screen.getByText('Discount: -$3.00')).toBeInTheDocument();
      expect(screen.getByText('Tax: $4.56')).toBeInTheDocument();
      expect(screen.getByText('Total: $61.56')).toBeInTheDocument();
    });

    it('should show a 10% discount at $100 or more', async () => {
      const user = userEvent.setup();
      render(<ShoppingCart />);

      await addItem(user, 'Jacket', '100');

      expect(screen.getByText('Subtotal: $100.00')).toBeInTheDocument();
      expect(screen.getByText('Discount: -$10.00')).toBeInTheDocument();
      expect(screen.getByText('Tax: $7.20')).toBeInTheDocument();
      expect(screen.getByText('Total: $97.20')).toBeInTheDocument();
    });
  });

  describe('clearing the cart', () => {
    it('should empty the cart when Clear Cart is clicked', async () => {
      const user = userEvent.setup();
      render(<ShoppingCart />);

      await addItem(user, 'Shirt', '20');
      await addItem(user, 'Pen', '5');
      await user.click(screen.getByRole('button', { name: /clear cart/i }));

      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
      expect(screen.queryByText('Shirt')).not.toBeInTheDocument();
      expect(screen.queryByText('Pen')).not.toBeInTheDocument();
    });
  });
});

