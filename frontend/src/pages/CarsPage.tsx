
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import Navbar from '../components/Navbar';
import CarCard from '../components/CarCard';
import CarFilters from '../components/CarFilter';

import type { CarFilterValues } from '../components/CarFilter';
import type { Car } from '../types/car';
import type { PaginatedResponse } from '../types/pagination';

const API_URL = 'http://127.0.0.1:8000';
const PAGE_SIZE = 9;

function CarsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const filters: CarFilterValues = {
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    year_min: searchParams.get('year_min') || '',
    year_max: searchParams.get('year_max') || '',
    capacity: searchParams.get('capacity') || '',
    ordering: searchParams.get('ordering') || '',
  };

  const [cars, setCars] = useState<Car[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const totalPages = Math.ceil(count / PAGE_SIZE);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCars() {
      setLoading(true);
      setError('');

      try {
        const params = new URLSearchParams(searchParams);
        params.set('page_size', String(PAGE_SIZE));

        const response = await fetch(
          `${API_URL}/api/cars/?${params.toString()}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch cars');
        }

        const data: PaginatedResponse<Car> = await response.json();

        if (!controller.signal.aborted) {
          setCars(data.results);
          setCount(data.count);
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
  }, [searchParams]);

  function handleFiltersChange(newFilters: CarFilterValues) {
    const params = new URLSearchParams();

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value.trim() !== '') {
        params.set(key, value);
      }
    });

    params.set('page', '1');
    setSearchParams(params);
  }

  function handlePageChange(newPage: number) {
    if (newPage < 1 || newPage > totalPages) return;

    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));

    setSearchParams(params);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Browse All Cars
          </h1>

          <p className="mt-2 text-gray-500">
            Find the perfect rental car using our filters.
          </p>
        </div>

        <CarFilters
          filters={filters}
          onChange={handleFiltersChange}
        />

        {!loading && !error && (
          <p className="mb-6 text-sm text-gray-500">
            {count} cars found
          </p>
        )}

        {loading && <p>Loading cars...</p>}

        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && cars.length === 0 && (
          <p className="text-gray-500">
            No cars found matching your filters.
          </p>
        )}

        {!loading && !error && (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => handlePageChange(pageNumber)}
                    aria-current={
                      page === pageNumber ? 'page' : undefined
                    }
                    className={`rounded-lg px-4 py-2 text-sm font-medium ${
                      page === pageNumber
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default CarsPage;
