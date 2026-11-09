import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { Car } from '../types/car';

const API_URL = 'http://127.0.0.1:8000';

interface BookedDate {
  start_date: string;
  end_date: string;
}

interface BookingFormProps {
  car: Car;
}

function BookingForm({ car }: BookingFormProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookedDates, setBookedDates] = useState<BookedDate[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const today = new Date();
  const localToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');

  const days =
    startDate && endDate
      ? Math.max(
          0,
          Math.round(
            (Date.parse(endDate) - Date.parse(startDate)) / 86400000
          )
        )
      : 0;

  const totalPrice = days * Number(car.price_per_day);

  async function fetchBookedDates() {
    const response = await fetch(
      `${API_URL}/api/cars/${car.id}/booked-dates/`
    );

    if (!response.ok) {
      throw new Error('Could not load booked dates.');
    }

    const data: BookedDate[] = await response.json();
    setBookedDates(data);
  }
useEffect(() => {
  const controller = new AbortController();

  async function loadBookedDates() {
    try {
      const response = await fetch(
        `${API_URL}/api/cars/${car.id}/booked-dates/`,
        { signal: controller.signal }
      );

      if (!response.ok) {
        throw new Error('Could not load booked dates.');
      }

      const data: BookedDate[] = await response.json();

      if (!controller.signal.aborted) {
        setBookedDates(data);
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(
          err instanceof Error ? err.message : 'Unknown error'
        );
      }
    }
  }

  loadBookedDates();

  return () => controller.abort();
}, [car.id]);
  const hasOverlap = bookedDates.some(
    (booking) =>
      startDate < booking.end_date &&
      endDate > booking.start_date
  );

  async function handleBooking(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!startDate || !endDate || days <= 0) {
      setError('Please select valid rental dates.');
      return;
    }

    if (startDate < localToday) {
      setError('Start date cannot be in the past.');
      return;
    }

    if (hasOverlap) {
      setError('This car is already booked for the selected dates.');
      return;
    }

    setLoading(true);

    try {
      // Get a CSRF token from Django
      const csrfResponse = await fetch(`${API_URL}/api/users/csrf/`, {
        credentials: 'include',
      });

      if (!csrfResponse.ok) {
        throw new Error('Could not get CSRF token.');
      }

      const { csrfToken } = await csrfResponse.json();

      const response = await fetch(
        `${API_URL}/api/cars/rentals/create/`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
          },
          body: JSON.stringify({
            car: car.id,
            start_date: startDate,
            end_date: endDate,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(
            'Please log in before booking a car.'
          );
        }

        throw new Error(
          typeof data.detail === 'string'
            ? data.detail
            : JSON.stringify(data)
        );
      }

      setMessage('Car booked successfully!');
      setStartDate('');
      setEndDate('');

      await fetchBookedDates();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Booking failed.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl bg-white p-8 shadow-sm">
      <p className="text-sm text-gray-500">Rental price</p>

      <p className="mt-2 text-3xl font-bold text-blue-600">
        ${car.price_per_day}
        <span className="text-base font-normal text-gray-500">
          {' '}/ day
        </span>
      </p>

      <form onSubmit={handleBooking} className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Start Date
          </label>

          <input
            type="date"
            min={localToday}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            End Date
          </label>

          <input
            type="date"
            min={startDate || localToday}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 p-3"
          />
        </div>

        {bookedDates.length > 0 && (
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="mb-2 text-sm font-semibold">
              Unavailable periods:
            </p>

            {bookedDates.map((booking, index) => (
              <p key={index} className="text-sm text-gray-600">
                {booking.start_date} — {booking.end_date}
              </p>
            ))}
          </div>
        )}

        {days > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600">
              Rental days: {days}
            </p>

            <p className="mt-2 text-xl font-bold">
              Total: ${totalPrice.toFixed(2)}
            </p>
          </div>
        )}

        {hasOverlap && (
          <p className="text-sm text-red-600">
            Selected dates overlap with an existing booking.
          </p>
        )}

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        {message && (
          <p role="status" className="text-sm text-green-600">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || days <= 0 || hasOverlap}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Booking...' : 'Book This Car'}
        </button>
      </form>
    </div>
  );
}

export default BookingForm;