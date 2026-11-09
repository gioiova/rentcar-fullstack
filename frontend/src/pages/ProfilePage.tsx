
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CarCard from '../components/CarCard';
import type { UserProfile } from '../types/profile';
import type { OwnerRental } from '../types/rental';
import { getOwnerRentals, cancelRental } from '../services/rentals';

const API_URL = 'http://127.0.0.1:8000';

function ProfilePage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ownerRentals, setOwnerRentals] = useState<OwnerRental[]>([]);

  const [loading, setLoading] = useState(true);
  const [ownerLoading, setOwnerLoading] = useState(true);
  const [error, setError] = useState('');
  const [ownerError, setOwnerError] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProfile() {
      try {
        const response = await fetch(
          `${API_URL}/api/users/profile/`,
          {
            credentials: 'include',
            signal: controller.signal,
          }
        );

        if (response.status === 401 || response.status === 403) {
          navigate('/login', { replace: true });
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to load profile.');
        }

        const data: UserProfile = await response.json();

        if (!controller.signal.aborted) {
          setProfile(data);
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : 'Something went wrong.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => controller.abort();
  }, [navigate]);

  useEffect(() => {
    let active = true;

    async function loadOwnerRentals() {
      try {
        const data = await getOwnerRentals();

        if (active) {
          setOwnerRentals(data);
        }
      } catch (err) {
        if (active) {
          setOwnerError(
            err instanceof Error
              ? err.message
              : 'Failed to load owner bookings.'
          );
        }
      } finally {
        if (active) {
          setOwnerLoading(false);
        }
      }
    }

    loadOwnerRentals();

    return () => {
      active = false;
    };
  }, []);

  async function handleCancelRental(rentalId: number) {
    if (cancellingId !== null) return;

    const confirmed = window.confirm(
      'Are you sure you want to cancel this booking?'
    );

    if (!confirmed) return;

    setCancellingId(rentalId);
    setCancelError('');

    try {
      await cancelRental(rentalId);

      setProfile((previous) => {
        if (!previous) return previous;

        return {
          ...previous,
          rentals: previous.rentals.filter(
            (rental) => rental.id !== rentalId
          ),
        };
      });
    } catch (err) {
      setCancelError(
        err instanceof Error
          ? err.message
          : 'Failed to cancel booking.'
      );
    } finally {
      setCancellingId(null);
    }
  }

  function canCancel(startDate: string) {
    const today = new Date();
    const localToday = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-');

    return startDate > localToday;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <p className="p-10 text-center text-gray-500">
          Loading profile...
        </p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <p className="p-10 text-center text-red-600">
          {error || 'Profile not found.'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-12 px-6 py-10">
        <h1 className="text-3xl font-bold text-slate-900">
          My Profile
        </h1>

        {/* Personal Information */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-2xl font-bold">
            Personal Information
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <InfoItem
              label="First Name"
              value={profile.first_name}
            />
            <InfoItem
              label="Last Name"
              value={profile.last_name}
            />
            <InfoItem
              label="Phone Number"
              value={profile.phone_number}
            />
            <InfoItem
              label="Email"
              value={profile.email}
            />
          </div>
        </section>

        {/* My Rentals */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">
            My Rentals ({profile.rentals.length})
          </h2>

          {cancelError && (
            <p
              role="alert"
              className="mb-5 rounded-lg bg-red-50 p-4 text-red-600"
            >
              {cancelError}
            </p>
          )}

          {profile.rentals.length === 0 ? (
            <p className="text-gray-500">
              You haven't booked any cars yet.
            </p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {profile.rentals.map((rental) => (
                <div
                  key={rental.id}
                  className="rounded-xl bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold">
                        {rental.car_details.brand}{' '}
                        {rental.car_details.model}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Booking #{rental.id}
                      </p>
                    </div>

                    <span className="rounded-lg bg-blue-50 px-3 py-1 text-sm text-blue-700">
                      {rental.days} days
                    </span>
                  </div>

                  <div className="mt-5 space-y-2 text-sm text-gray-600">
                    <p>
                      <strong>From:</strong> {rental.start_date}
                    </p>
                    <p>
                      <strong>To:</strong> {rental.end_date}
                    </p>
                    <p>
                      <strong>Total:</strong> ${rental.total_price}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3 border-t pt-4">
                    <Link
                      to={`/cars/${rental.car}`}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
                    >
                      View Car
                    </Link>

                    {canCancel(rental.start_date) ? (
                      <button
                        type="button"
                        onClick={() => handleCancelRental(rental.id)}
                        disabled={cancellingId !== null}
                        className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                      >
                        {cancellingId === rental.id
                          ? 'Cancelling...'
                          : 'Cancel Booking'}
                      </button>
                    ) : (
                      <span className="self-center text-sm text-gray-500">
                        Cancellation unavailable
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Bookings on My Cars */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">
            Bookings on My Cars ({ownerRentals.length})
          </h2>

          {ownerLoading ? (
            <p className="text-gray-500">
              Loading bookings...
            </p>
          ) : ownerError ? (
            <p role="alert" className="text-red-600">
              {ownerError}
            </p>
          ) : ownerRentals.length === 0 ? (
            <p className="text-gray-500">
              Nobody has booked your cars yet.
            </p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {ownerRentals.map((rental) => (
                <div
                  key={rental.id}
                  className="rounded-xl bg-white p-6 shadow-sm"
                >
                  <h3 className="text-xl font-bold text-slate-900">
                    {rental.car_details.brand}{' '}
                    {rental.car_details.model}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Booking #{rental.id}
                  </p>

                  <div className="mt-5 space-y-2 text-sm text-gray-700">
                    <p>
                      <strong>Renter:</strong>{' '}
                      {rental.renter.first_name}{' '}
                      {rental.renter.last_name}
                    </p>

                    <p>
                      <strong>Phone:</strong>{' '}
                      {rental.renter.phone_number}
                    </p>

                    <p>
                      <strong>Email:</strong>{' '}
                      {rental.renter.email}
                    </p>

                    <p>
                      <strong>Start Date:</strong>{' '}
                      {rental.start_date}
                    </p>

                    <p>
                      <strong>End Date:</strong>{' '}
                      {rental.end_date}
                    </p>

                    <p>
                      <strong>Duration:</strong>{' '}
                      {rental.days} days
                    </p>

                    <p className="pt-2 text-lg font-bold text-blue-600">
                      Total: ${rental.total_price}
                    </p>
                  </div>

                  <Link
                    to={`/cars/${rental.car_details.id}`}
                    className="mt-5 inline-block text-sm font-medium text-blue-600 hover:underline"
                  >
                    View Car Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Favorites */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">
            My Favorites ({profile.favorites.length})
          </h2>

          {profile.favorites.length === 0 ? (
            <p className="text-gray-500">
              You haven't added any favorites yet.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {profile.favorites.map((favorite) => (
                <CarCard
                  key={favorite.id}
                  car={favorite.car}
                  onFavoriteChange={(isFavorite) => {
                    if (!isFavorite) {
                      setProfile((previous) => {
                        if (!previous) return previous;

                        return {
                          ...previous,
                          favorites: previous.favorites.filter(
                            (item) => item.id !== favorite.id
                          ),
                        };
                      });
                    }
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/* My Cars */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">
            My Cars ({profile.cars.length})
          </h2>

          {profile.cars.length === 0 ? (
            <p className="text-gray-500">
              You haven't added any cars yet.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {profile.cars.map((car) => (
                <div key={car.id} className="flex flex-col gap-3">
                  <CarCard car={car} />

                  <Link
                    to={`/cars/${car.id}/edit`}
                    className="block rounded-lg bg-blue-600 px-4 py-3 text-center font-medium text-white hover:bg-blue-700"
                  >
                    Edit Car
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

interface InfoItemProps {
  label: string;
  value: string;
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 font-medium text-slate-900">{value}</p>
    </div>
  );
}

export default ProfilePage;
