import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

import ProductList from '../ProductList';
import * as api from '../../services/api';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

jest.mock('../../services/api');

describe('ProductList', () => {
  const mockProducts = [
    { id: 1, name: 'Laptop', price: 1200, stock: 5 },
    { id: 2, name: 'Mouse', price: 25, stock: 50 },
    { id: 3, name: 'Keyboard', price: 75, stock: 8 },
    { id: 4, name: 'Monitor', price: 300, stock: 0 },
    { id: 5, name: 'Headphones', price: 150, stock: 3 }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    api.getProducts.mockResolvedValue(mockProducts);
  });

  const renderProductList = () => {
    return render(
      <BrowserRouter>
        <ProductList />
      </BrowserRouter>
    );
  };

  it('should render product list page', () => {
    renderProductList();

    expect(screen.getByRole('heading', { name: /products/i })).toBeInTheDocument();
  });

  it('should fetch and display products on mount', async () => {
    renderProductList();

    await waitFor(() => {
      expect(api.getProducts).toHaveBeenCalled();
      expect(screen.getByText('Laptop')).toBeInTheDocument();
      expect(screen.getByText('Mouse')).toBeInTheDocument();
      expect(screen.getByText('Keyboard')).toBeInTheDocument();
    });
  });

  it('should display loading state initially', () => {
    api.getProducts.mockImplementation(() => new Promise(() => {}));
    renderProductList();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should display error message when fetch fails', async () => {
    const errorMessage = 'Failed to load products';
    api.getProducts.mockRejectedValue(new Error(errorMessage));

    renderProductList();

    await waitFor(() => {
      expect(screen.getByText(/failed to load products/i)).toBeInTheDocument();
    });
  });

  it('should display product details (name, price, stock)', async () => {
    renderProductList();

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
      expect(screen.getByText(/price: \$1200/i)).toBeInTheDocument();
      expect(screen.getByText(/stock: 5/i)).toBeInTheDocument();
    });
  });

  it('should render search input', async () => {
    renderProductList();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search products/i)).toBeInTheDocument();
    });
  });

  it('should filter products by search term (exact match)', async () => {
    const user = userEvent.setup();
    renderProductList();

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search products/i);
    await user.type(searchInput, 'Mouse');

    expect(screen.getByText('Mouse')).toBeInTheDocument();
    expect(screen.queryByText('Laptop')).not.toBeInTheDocument();
    expect(screen.queryByText('Keyboard')).not.toBeInTheDocument();
  });

  it('should filter products with fuzzy matching', async () => {
    const user = userEvent.setup();
    renderProductList();

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search products/i);
    // Test fuzzy matching with slight typo (Levenshtein distance <= 2)
    await user.type(searchInput, 'Lapto');

    expect(screen.getByText('Laptop')).toBeInTheDocument();
  });

  it('should render price filter dropdown', async () => {
    renderProductList();

    await waitFor(() => {
      const priceSelect = screen.getByDisplayValue(/all prices/i);
      expect(priceSelect).toBeInTheDocument();
    });
  });

  it('should filter products by low price (<$50)', async () => {
    const user = userEvent.setup();
    renderProductList();

    await waitFor(() => {
      expect(screen.getByText('Mouse')).toBeInTheDocument();
    });

    const priceFilter = screen.getByDisplayValue(/all prices/i);
    await user.selectOptions(priceFilter, 'low');

    expect(screen.getByText('Mouse')).toBeInTheDocument();
    expect(screen.queryByText('Laptop')).not.toBeInTheDocument();
    expect(screen.queryByText('Monitor')).not.toBeInTheDocument();
  });

  it('should filter products by medium price ($50-$100)', async () => {
    const user = userEvent.setup();
    renderProductList();

    await waitFor(() => {
      expect(screen.getByText('Keyboard')).toBeInTheDocument();
    });

    const priceFilter = screen.getByDisplayValue(/all prices/i);
    await user.selectOptions(priceFilter, 'medium');

    expect(screen.getByText('Keyboard')).toBeInTheDocument();
    expect(screen.queryByText('Mouse')).not.toBeInTheDocument();
    expect(screen.queryByText('Laptop')).not.toBeInTheDocument();
  });

  it('should filter products by high price (>$100)', async () => {
    const user = userEvent.setup();
    renderProductList();

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    const priceFilter = screen.getByDisplayValue(/all prices/i);
    await user.selectOptions(priceFilter, 'high');

    expect(screen.getByText('Laptop')).toBeInTheDocument();
    expect(screen.getByText('Monitor')).toBeInTheDocument();
    expect(screen.getByText('Headphones')).toBeInTheDocument();
    expect(screen.queryByText('Mouse')).not.toBeInTheDocument();
  });

  it('should render stock filter dropdown', async () => {
    renderProductList();

    await waitFor(() => {
      const stockSelect = screen.getByDisplayValue(/all stock/i);
      expect(stockSelect).toBeInTheDocument();
    });
  });

  it('should filter products by out of stock', async () => {
    const user = userEvent.setup();
    renderProductList();

    await waitFor(() => {
      expect(screen.getByText('Monitor')).toBeInTheDocument();
    });

    const stockFilter = screen.getByDisplayValue(/all stock/i);
    await user.selectOptions(stockFilter, 'out');

    expect(screen.getByText('Monitor')).toBeInTheDocument();
    expect(screen.queryByText('Laptop')).not.toBeInTheDocument();
    expect(screen.queryByText('Mouse')).not.toBeInTheDocument();
  });

  it('should filter products by low stock (<10)', async () => {
    const user = userEvent.setup();
    renderProductList();

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    const stockFilter = screen.getByDisplayValue(/all stock/i);
    await user.selectOptions(stockFilter, 'low');

    expect(screen.getByText('Laptop')).toBeInTheDocument();
    expect(screen.getByText('Keyboard')).toBeInTheDocument();
    expect(screen.getByText('Headphones')).toBeInTheDocument();
    expect(screen.queryByText('Mouse')).not.toBeInTheDocument();
  });

  it('should filter products by available stock (>=10)', async () => {
    const user = userEvent.setup();
    renderProductList();

    await waitFor(() => {
      expect(screen.getByText('Mouse')).toBeInTheDocument();
    });

    const stockFilter = screen.getByDisplayValue(/all stock/i);
    await user.selectOptions(stockFilter, 'available');

    expect(screen.getByText('Mouse')).toBeInTheDocument();
    expect(screen.queryByText('Laptop')).not.toBeInTheDocument();
    expect(screen.queryByText('Monitor')).not.toBeInTheDocument();
  });

  it('should combine search and price filters', async () => {
    const user = userEvent.setup();
    renderProductList();

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search products/i);
    await user.type(searchInput, 'Laptop');

    const priceFilter = screen.getByDisplayValue(/all prices/i);
    await user.selectOptions(priceFilter, 'high');

    expect(screen.getByText('Laptop')).toBeInTheDocument();
  });

  it('should combine all three filters', async () => {
    const user = userEvent.setup();
    renderProductList();

    await waitFor(() => {
      expect(screen.getByText('Keyboard')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search products/i);
    await user.type(searchInput, 'Key');

    const priceFilter = screen.getByDisplayValue(/all prices/i);
    await user.selectOptions(priceFilter, 'medium');

    const stockFilter = screen.getByDisplayValue(/all stock/i);
    await user.selectOptions(stockFilter, 'low');

    expect(screen.getByText('Keyboard')).toBeInTheDocument();
  });

  it('should show no products message when no matches found', async () => {
    const user = userEvent.setup();
    renderProductList();

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search products/i);
    await user.type(searchInput, 'NonexistentProduct');

    expect(screen.getByText(/no products found matching your criteria/i)).toBeInTheDocument();
  });

  it('should render link to add product page', async () => {
    renderProductList();

    await waitFor(() => {
      const addLink = screen.getByText(/add product/i).closest('a');
      expect(addLink).toHaveAttribute('href', '/add-product');
    });
  });

  it('should clear filters and show all products', async () => {
    const user = userEvent.setup();
    renderProductList();

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    // Apply filters
    const searchInput = screen.getByPlaceholderText(/search products/i);
    await user.type(searchInput, 'Mouse');

    expect(screen.queryByText('Laptop')).not.toBeInTheDocument();

    // Clear search
    await user.clear(searchInput);

    expect(screen.getByText('Laptop')).toBeInTheDocument();
    expect(screen.getByText('Mouse')).toBeInTheDocument();
  });
});
