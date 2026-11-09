import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BookingForm from '../components/BookingForm';
import FavoriteButton from '../components/FavoriteButton';
import type { Car } from '../types/car';

const API_URL = 'http://127.0.0.1:8000';

function CarDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCar() {
      setLoading(true);
      setError('');
      setCar(null);

      try {
        const response = await fetch(`${API_URL}/api/cars/${id}/`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Car not found.');
        }

        const data: Car = await response.json();

        if (!controller.signal.aborted) {
          setCar(data);
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

    fetchCar();

    return () => controller.abort();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Back Button */}
        <Link
          to="/#cars"
          className="inline-block text-sm font-medium text-blue-600 hover:underline"
        >
          ← Back to Cars
        </Link>

        {/* Loading */}
        {loading && (
          <p className="mt-8 text-gray-500">
            Loading car details...
          </p>
        )}

        {/* Error */}
        {error && (
          <div className="mt-8 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {/* Car Details */}
        {!loading && !error && car && (
          <div className="mt-8">
            {/* Header */}
            <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-4xl font-bold text-slate-900">
                  {car.brand} {car.model}
                </h1>

                <p className="mt-2 text-gray-500">
                  {car.year} • {car.city}
                </p>
              </div>

              {/* Favorite Button */}
              <FavoriteButton carId={car.id} />
            </div>

            {/* Image Gallery */}
            <div className="grid gap-4 md:grid-cols-3">
              {car.images.map((image) => (
                <img
                  key={image.id}
                  src={new URL(image.image, API_URL).href}
                  alt={`${car.brand} ${car.model}`}
                  className="h-64 w-full rounded-xl bg-gray-200 object-cover shadow-sm"
                />
              ))}

              {car.images.length === 0 && (
                <div className="flex h-64 items-center justify-center rounded-xl bg-gray-200 text-gray-500">
                  No images available
                </div>
              )}
            </div>

            {/* Information and Booking */}
            <div className="mt-10 grid gap-8 lg:grid-cols-3">
              {/* Vehicle Information */}
              <section className="rounded-xl bg-white p-8 shadow-sm lg:col-span-2">
                <h2 className="mb-6 text-2xl font-bold text-slate-900">
                  Vehicle Information
                </h2>

                <div className="grid gap-6 sm:grid-cols-2">
                  <InfoItem label="Brand" value={car.brand} />

                  <InfoItem label="Model" value={car.model} />

                  <InfoItem label="Year" value={car.year} />

                  <InfoItem label="City" value={car.city} />

                  <InfoItem label="Seats" value={car.capacity} />

                  <InfoItem
                    label="Transmission"
                    value={car.transmission}
                  />

                  <InfoItem
                    label="Fuel Tank Capacity"
                    value={`${car.fuel_tank_capacity} L`}
                  />
                </div>
              </section>

              {/* Booking Form */}
              <div className="h-fit">
                <BookingForm car={car} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

interface InfoItemProps {
  label: string;
  value: string | number;
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>

      <p className="mt-1 font-semibold capitalize text-slate-900">
        {value}
      </p>
    </div>
  );
}

export default CarDetailPage;