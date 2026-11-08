import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import CarCard from './components/CarCard';
import type { Car } from './types/car';

function App() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCars() {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/cars/');

        if (!response.ok) {
          throw new Error('Failed to fetch cars');
        }

        const data: Car[] = await response.json();
        setCars(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchCars();
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

        <a
          href="#cars"
          className="mt-8 inline-block rounded-lg bg-blue-600 px-8 py-3 font-semibold hover:bg-blue-700"
        >
          Explore Cars
        </a>
      </section>

      {/* Cars Section */}
      <section id="cars" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Available Cars
          </h2>

          <p className="mt-2 text-gray-500">
            Choose from our available rental vehicles.
          </p>
        </div>

        {loading && <p>Loading cars...</p>}

        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && cars.length === 0 && (
          <p>No cars available yet.</p>
        )}

        {!loading && !error && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default App;