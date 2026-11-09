
import { getCsrfToken } from './auth';
import type { OwnerRental } from '../types/rental';

const API_URL = 'http://127.0.0.1:8000';

export async function getOwnerRentals(): Promise<OwnerRental[]> {
  const response = await fetch(
    `${API_URL}/api/cars/owner/rentals/`,
    {
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to load bookings on your cars.');
  }

  return response.json();
}

export async function cancelRental(rentalId: number): Promise<void> {
  const csrfToken = await getCsrfToken();

  const response = await fetch(
    `${API_URL}/api/cars/rentals/${rentalId}/cancel/`,
    {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'X-CSRFToken': csrfToken,
      },
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));

    throw new Error(
      typeof data.detail === 'string'
        ? data.detail
        : 'Failed to cancel booking.'
    );
  }
}
