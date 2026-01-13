import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

import UserList from '../UserList';
import * as api from '../../services/api';

jest.mock('../../services/api');

describe('UserList', () => {
  const mockUsers = [
    {
      id: 1,
      firstname: 'John',
      lastname: 'Doe',
      username: 'johndoe',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
    },
    {
      id: 2,
      firstname: 'Jane',
      lastname: 'Smith',
      username: 'janesmith',
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() // 15 days ago
    },
    {
      id: 3,
      firstname: 'Bob',
      lastname: 'Johnson',
      username: 'bobjohnson',
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days ago
    },
    {
      id: 4,
      firstname: 'Alice',
      lastname: 'Williams',
      username: 'alicew',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    api.getUsers.mockResolvedValue(mockUsers);
  });

  const renderUserList = () => {
    return render(
      <BrowserRouter>
        <UserList />
      </BrowserRouter>
    );
  };

  it('should render user list page', () => {
    renderUserList();

    expect(screen.getByRole('heading', { name: /users/i })).toBeInTheDocument();
  });

  it('should fetch and display users on mount', async () => {
    renderUserList();

    await waitFor(() => {
      expect(api.getUsers).toHaveBeenCalled();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });
  });

  it('should display loading state initially', () => {
    api.getUsers.mockImplementation(() => new Promise(() => {}));
    renderUserList();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should display error message when fetch fails', async () => {
    const errorMessage = 'Failed to load users';
    api.getUsers.mockRejectedValue(new Error(errorMessage));

    renderUserList();

    await waitFor(() => {
      expect(screen.getByText(/failed to load users/i)).toBeInTheDocument();
    });
  });

  it('should display user details (name, username, joined date)', async () => {
    renderUserList();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('@johndoe')).toBeInTheDocument();
      expect(screen.getByText(/joined:/i)).toBeInTheDocument();
    });
  });

  it('should render search input', async () => {
    renderUserList();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search users/i)).toBeInTheDocument();
    });
  });

  it('should filter users by search term (exact match)', async () => {
    const user = userEvent.setup();
    renderUserList();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search users/i);
    await user.type(searchInput, 'Jane');

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
  });

  it('should filter users with fuzzy matching on firstname', async () => {
    const user = userEvent.setup();
    renderUserList();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search users/i);
    // Test fuzzy matching with slight typo (Levenshtein distance <= 2)
    await user.type(searchInput, 'Jon');

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should filter users with fuzzy matching on lastname', async () => {
    const user = userEvent.setup();
    renderUserList();

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search users/i);
    await user.type(searchInput, 'Smit');

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should filter users with fuzzy matching on username', async () => {
    const user = userEvent.setup();
    renderUserList();

    await waitFor(() => {
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search users/i);
    await user.type(searchInput, 'bobjohn');

    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('should render joined filter dropdown', async () => {
    renderUserList();

    await waitFor(() => {
      const joinedSelect = screen.getByDisplayValue(/all users/i);
      expect(joinedSelect).toBeInTheDocument();
    });
  });

  it('should filter users joined this week', async () => {
    const user = userEvent.setup();
    renderUserList();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const joinedFilter = screen.getByDisplayValue(/all users/i);
    await user.selectOptions(joinedFilter, 'week');

    // Users joined in last 7 days
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Alice Williams')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
  });

  it('should filter users joined this month', async () => {
    const user = userEvent.setup();
    renderUserList();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const joinedFilter = screen.getByDisplayValue(/all users/i);
    await user.selectOptions(joinedFilter, 'month');

    // Users joined in last 30 days
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Alice Williams')).toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
  });

  it('should filter users joined earlier', async () => {
    const user = userEvent.setup();
    renderUserList();

    await waitFor(() => {
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    const joinedFilter = screen.getByDisplayValue(/all users/i);
    await user.selectOptions(joinedFilter, 'older');

    // Users joined more than 30 days ago
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  it('should render sort field dropdown', async () => {
    renderUserList();

    await waitFor(() => {
      const sortSelect = screen.getByDisplayValue(/sort by name/i);
      expect(sortSelect).toBeInTheDocument();
    });
  });

  it('should sort users by name', async () => {
    const user = userEvent.setup();
    renderUserList();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const sortField = screen.getByDisplayValue(/sort by name/i);
    await user.selectOptions(sortField, 'name');

    const userElements = screen.getAllByRole('heading', { level: 3 });
    const userNames = userElements.map((el) => el.textContent);

    // Should be sorted alphabetically by full name
    expect(userNames[0]).toBe('Alice Williams');
    expect(userNames[1]).toBe('Bob Johnson');
  });

  it('should sort users by username', async () => {
    const user = userEvent.setup();
    renderUserList();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const sortField = screen.getByDisplayValue(/sort by name/i);
    await user.selectOptions(sortField, 'username');

    const userElements = screen.getAllByText(/@\w+/);
    const usernames = userElements.map((el) => el.textContent);

    // Should be sorted alphabetically by username
    expect(usernames).toContain('@alicew');
    expect(usernames).toContain('@bobjohnson');
    expect(usernames).toContain('@janesmith');
    expect(usernames).toContain('@johndoe');
  });

  it('should sort users by joined date', async () => {
    const user = userEvent.setup();
    renderUserList();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const sortField = screen.getByDisplayValue(/sort by name/i);
    await user.selectOptions(sortField, 'joined');

    // Most recent first (ascending by default shows newest)
    const userElements = screen.getAllByRole('heading', { level: 3 });
    expect(userElements[0]).toHaveTextContent('Alice Williams'); // 1 day ago
  });

  it('should toggle sort direction', async () => {
    const user = userEvent.setup();
    renderUserList();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const toggleButton = screen.getByRole('button', { name: /↑/ });
    expect(toggleButton).toBeInTheDocument();

    await user.click(toggleButton);

    expect(screen.getByRole('button', { name: /↓/ })).toBeInTheDocument();
  });

  it('should change sort order when direction is toggled', async () => {
    const user = userEvent.setup();
    renderUserList();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Set to sort by name
    const sortField = screen.getByDisplayValue(/sort by name/i);
    await user.selectOptions(sortField, 'name');

    const toggleButton = screen.getByRole('button', { name: /↑/ });
    await user.click(toggleButton);

    const userElements = screen.getAllByRole('heading', { level: 3 });
    const userNames = userElements.map((el) => el.textContent);

    // Should be in descending order now
    expect(userNames[userNames.length - 1]).toBe('Alice Williams');
  });

  it('should combine search and joined filters', async () => {
    const user = userEvent.setup();
    renderUserList();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search users/i);
    await user.type(searchInput, 'John');

    const joinedFilter = screen.getByDisplayValue(/all users/i);
    await user.selectOptions(joinedFilter, 'week');

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
  });

  it('should show no users message when no matches found', async () => {
    const user = userEvent.setup();
    renderUserList();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search users/i);
    await user.type(searchInput, 'NonexistentUser');

    expect(screen.getByText(/no users found matching your criteria/i)).toBeInTheDocument();
  });

  it('should clear search and show all users', async () => {
    const user = userEvent.setup();
    renderUserList();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Apply search
    const searchInput = screen.getByPlaceholderText(/search users/i);
    await user.type(searchInput, 'Jane');

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();

    // Clear search
    await user.clear(searchInput);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });
});
