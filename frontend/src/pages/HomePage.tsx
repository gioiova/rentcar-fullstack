
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CarCard from '../components/CarCard';
import type { Car } from '../types/car';
import type { PaginatedResponse } from '../types/pagination';

const API_URL = 'http://127.0.0.1:8000';

function HomePage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCars() {
      try {
        const response = await fetch(
          `${API_URL}/api/cars/?page_size=6`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch cars');
        }

        const data: PaginatedResponse<Car> = await response.json();

        if (!controller.signal.aborted) {
          setCars(data.results);
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error ? err.message : 'Unknown error'
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchCars();

    return () => controller.abort();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-slate-900 px-6 py-20 text-center text-white">
        <h1 className="text-4xl font-bold md:text-5xl">
          Find Your Perfect Rental Car
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-300">
          Explore our collection of vehicles and find the perfect car
          for your next journey.
        </p>

        <Link
          to="/cars"
          className="mt-8 inline-block rounded-lg bg-blue-600 px-8 py-3 font-semibold hover:bg-blue-700"
        >
          Explore Cars
        </Link>
      </section>

      {/* Featured Cars */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Available Cars
          </h2>

          <p className="mt-2 text-gray-500">
            Explore some of our available rental cars.
          </p>
        </div>

        {loading && <p>Loading cars...</p>}

        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && cars.length === 0 && (
          <p className="text-gray-500">
            No cars available at the moment.
          </p>
        )}

        {!loading && !error && (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>

            {cars.length > 0 && (
              <div className="mt-10 text-center">
                <Link
                  to="/cars"
                  className="inline-block rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  View All Cars
                </Link>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default HomePage;
