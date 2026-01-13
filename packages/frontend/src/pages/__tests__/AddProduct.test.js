import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

import AddProduct from '../AddProduct';
import * as api from '../../services/api';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

jest.mock('../../services/api');

describe('AddProduct', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderAddProduct = () => {
    return render(
      <BrowserRouter>
        <AddProduct />
      </BrowserRouter>
    );
  };

  it('should render add product form', () => {
    renderAddProduct();

    expect(screen.getByRole('heading', { name: /add product/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/product name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/stock/i)).toBeInTheDocument();
  });

  it('should render cancel and add buttons', () => {
    renderAddProduct();

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add product/i })).toBeInTheDocument();
  });

  it('should update name input', async () => {
    const user = userEvent.setup();
    renderAddProduct();

    const nameInput = screen.getByLabelText(/product name/i);
    await user.type(nameInput, 'New Product');

    expect(nameInput).toHaveValue('New Product');
  });

  it('should update price input', async () => {
    const user = userEvent.setup();
    renderAddProduct();

    const priceInput = screen.getByLabelText(/price/i);
    await user.type(priceInput, '99.99');

    expect(priceInput).toHaveValue(99.99);
  });

  it('should update stock input', async () => {
    const user = userEvent.setup();
    renderAddProduct();

    const stockInput = screen.getByLabelText(/stock/i);
    await user.type(stockInput, '10');

    expect(stockInput).toHaveValue(10);
  });

  it('should navigate to /products when cancel is clicked', async () => {
    const user = userEvent.setup();
    renderAddProduct();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith('/products');
  });

  it('should show error when submitting empty form', async () => {
    const user = userEvent.setup();
    renderAddProduct();

    const addButton = screen.getByRole('button', { name: /add product/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/all fields are required/i)).toBeInTheDocument();
    });

    expect(api.createProduct).not.toHaveBeenCalled();
  });

  it('should show error when name is missing', async () => {
    const user = userEvent.setup();
    renderAddProduct();

    await user.type(screen.getByLabelText(/price/i), '99');
    await user.type(screen.getByLabelText(/stock/i), '10');

    const addButton = screen.getByRole('button', { name: /add product/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/all fields are required/i)).toBeInTheDocument();
    });
  });

  it('should show error when price is missing', async () => {
    const user = userEvent.setup();
    renderAddProduct();

    await user.type(screen.getByLabelText(/product name/i), 'Test Product');
    await user.type(screen.getByLabelText(/stock/i), '10');

    const addButton = screen.getByRole('button', { name: /add product/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/all fields are required/i)).toBeInTheDocument();
    });
  });

  it('should show error when stock is missing', async () => {
    const user = userEvent.setup();
    renderAddProduct();

    await user.type(screen.getByLabelText(/product name/i), 'Test Product');
    await user.type(screen.getByLabelText(/price/i), '99');

    const addButton = screen.getByRole('button', { name: /add product/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/all fields are required/i)).toBeInTheDocument();
    });
  });

  it('should call createProduct on valid form submit', async () => {
    const user = userEvent.setup();
    api.createProduct = jest.fn().mockResolvedValue({ id: 1, name: 'New Product' });

    renderAddProduct();

    await user.type(screen.getByLabelText(/product name/i), 'New Product');
    await user.type(screen.getByLabelText(/price/i), '99.99');
    await user.type(screen.getByLabelText(/stock/i), '10');

    const addButton = screen.getByRole('button', { name: /add product/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(api.createProduct).toHaveBeenCalledWith({
        name: 'New Product',
        price: 99.99,
        stock: 10
      });
    });
  });

  it('should navigate to /products on successful creation', async () => {
    const user = userEvent.setup();
    api.createProduct = jest.fn().mockResolvedValue({ id: 1, name: 'New Product' });

    renderAddProduct();

    await user.type(screen.getByLabelText(/product name/i), 'New Product');
    await user.type(screen.getByLabelText(/price/i), '99.99');
    await user.type(screen.getByLabelText(/stock/i), '10');

    const addButton = screen.getByRole('button', { name: /add product/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/products');
    });
  });

  it('should show error message when creation fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Failed to create product';
    api.createProduct = jest.fn().mockRejectedValue(new Error(errorMessage));

    renderAddProduct();

    await user.type(screen.getByLabelText(/product name/i), 'New Product');
    await user.type(screen.getByLabelText(/price/i), '99.99');
    await user.type(screen.getByLabelText(/stock/i), '10');

    const addButton = screen.getByRole('button', { name: /add product/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to create product/i)).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should clear error on new valid submit', async () => {
    const user = userEvent.setup();
    api.createProduct = jest.fn().mockRejectedValueOnce(new Error('First error')).mockResolvedValueOnce({ id: 1 });

    renderAddProduct();

    // First failed attempt
    await user.type(screen.getByLabelText(/product name/i), 'Product 1');
    await user.type(screen.getByLabelText(/price/i), '50');
    await user.type(screen.getByLabelText(/stock/i), '5');
    await user.click(screen.getByRole('button', { name: /add product/i }));

    await waitFor(() => {
      expect(screen.getByText(/first error/i)).toBeInTheDocument();
    });

    // Second successful attempt
    await user.clear(screen.getByLabelText(/product name/i));
    await user.type(screen.getByLabelText(/product name/i), 'Product 2');
    await user.click(screen.getByRole('button', { name: /add product/i }));

    await waitFor(() => {
      expect(screen.queryByText(/first error/i)).not.toBeInTheDocument();
    });
  });

  it('should handle decimal prices', async () => {
    const user = userEvent.setup();
    api.createProduct = jest.fn().mockResolvedValue({ id: 1 });

    renderAddProduct();

    await user.type(screen.getByLabelText(/product name/i), 'Decimal Product');
    await user.type(screen.getByLabelText(/price/i), '19.99');
    await user.type(screen.getByLabelText(/stock/i), '100');

    await user.click(screen.getByRole('button', { name: /add product/i }));

    await waitFor(() => {
      expect(api.createProduct).toHaveBeenCalledWith({
        name: 'Decimal Product',
        price: 19.99,
        stock: 100
      });
    });
  });
});
