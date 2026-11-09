const API_URL = 'http://127.0.0.1:8000';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  password: string;
}

async function getErrorMessage(response: Response): Promise<string> {
  const data = await response.json();

  if (typeof data.detail === 'string') {
    return data.detail;
  }

  const firstError = Object.values(data)[0];

  if (Array.isArray(firstError)) {
    return String(firstError[0]);
  }

  return 'Something went wrong.';
}

export async function getCsrfToken(): Promise<string> {
  const response = await fetch(`${API_URL}/api/users/csrf/`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to get CSRF token.');
  }

  const data = await response.json();
  return data.csrfToken;
}

export async function registerUser(data: RegisterData) {
  const csrfToken = await getCsrfToken();

  const response = await fetch(`${API_URL}/api/users/register/`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function loginUser(phone_number: string, password: string) {
  const csrfToken = await getCsrfToken();

  const response = await fetch(`${API_URL}/api/users/login/`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken,
    },
    body: JSON.stringify({ phone_number, password }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function getProfile(): Promise<User> {
  const response = await fetch(`${API_URL}/api/users/profile/`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Not authenticated.');
  }

  return response.json();
}

export async function logoutUser() {
  const csrfToken = await getCsrfToken();

  const response = await fetch(`${API_URL}/api/users/logout/`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'X-CSRFToken': csrfToken,
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }
}