import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CarCard from '../components/CarCard';
import type { UserProfile } from '../types/profile';

const API_URL = 'http://127.0.0.1:8000';

function ProfilePage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProfile() {
      try {
        const response = await fetch(`${API_URL}/api/users/profile/`, {
          credentials: 'include',
          signal: controller.signal,
        });

        if (response.status === 401 || response.status === 403) {
          navigate('/login', { replace: true });
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to load profile.');
        }

        const data: UserProfile = await response.json();

        setProfile(data);
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error ? err.message : 'Something went wrong.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchProfile();

    return () => controller.abort();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-12">
        {loading && <p>Loading profile...</p>}

        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && profile && (
          <>
            <h1 className="mb-8 text-3xl font-bold text-slate-900">
              My Profile
            </h1>

            {/* Personal Information */}
            <section className="mb-12 rounded-xl bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold">
                Personal Information
              </h2>

              <div className="grid gap-6 md:grid-cols-2">
                <Info label="First Name" value={profile.first_name} />
                <Info label="Last Name" value={profile.last_name} />
                <Info label="Phone Number" value={profile.phone_number} />
                <Info label="Email" value={profile.email} />
              </div>
            </section>

            {/* My Rentals */}
            <section className="mb-12">
              <h2 className="mb-6 text-2xl font-bold">
                My Rentals ({profile.rentals.length})
              </h2>

              {profile.rentals.length === 0 ? (
                <p className="text-gray-500">
                  You haven't booked any cars yet.
                </p>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {profile.rentals.map((rental) => (
                    <div
                      key={rental.id}
                      className="rounded-xl bg-white p-6 shadow-sm"
                    >
                      <Link
                        to={`/cars/${rental.car}`}
                        className="text-xl font-bold text-slate-900 hover:text-blue-600"
                      >
                        {rental.car_details.brand}{' '}
                        {rental.car_details.model}
                      </Link>

                      <p className="mt-3 text-gray-600">
                        Start: {rental.start_date}
                      </p>

                      <p className="text-gray-600">
                        End: {rental.end_date}
                      </p>

                      <p className="mt-2 text-gray-600">
                        Duration: {rental.days} days
                      </p>

                      <p className="mt-3 text-xl font-bold text-blue-600">
                        Total: ${rental.total_price}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Favorites */}
            <section className="mb-12">
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
                        className="block rounded-lg bg-blue-600 px-4 py-3 text-center font-medium text-white transition hover:bg-blue-700"
                    >
                        Edit Car
                    </Link>
                    </div>
                ))}
                </div>
            )}
            </section>

          </>
        )}
      </main>
    </div>
  );
}

interface InfoProps {
  label: string;
  value: string;
}

function Info({ label, value }: InfoProps) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export default ProfilePage;