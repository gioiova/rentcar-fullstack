const API_URL = 'http://127.0.0.1:8000';

export async function getCsrfToken(): Promise<string> {
  const response = await fetch(`${API_URL}/api/users/csrf/`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to get CSRF token.');
  }

  const data: { csrfToken: string } = await response.json();
  return data.csrfToken;
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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data.detail === 'string'
        ? data.detail
        : JSON.stringify(data)
    );
  }

  return data;
}