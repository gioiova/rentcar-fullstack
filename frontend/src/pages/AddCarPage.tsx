
import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar from '../components/Navbar';
import { getCsrfToken } from '../services/auth';

const API_URL = 'http://127.0.0.1:8000';

interface CarFormData {
  brand: string;
  model: string;
  year: string;
  price_per_day: string;
  capacity: string;
  transmission: string;
  city: string;
  fuel_tank_capacity: string;
}

const initialForm: CarFormData = {
  brand: '',
  model: '',
  year: '',
  price_per_day: '',
  capacity: '',
  transmission: 'automatic',
  city: '',
  fuel_tank_capacity: '',
};

function AddCarPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<CarFormData>(initialForm);
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  }

  function handleImages(e: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length > 3) {
      setError('You can upload a maximum of 3 images.');
      setImages([]);
      e.target.value = '';
      return;
    }

    const validFiles = selectedFiles.every(
      (file) =>
        ['image/jpeg', 'image/png','image/jpg'].includes(file.type)
    );

    if (!validFiles) {
      setError('Only JPG, JPEG and PNG images are allowed.');
      setImages([]);
      e.target.value = '';
      return;
    }

    setError('');
    setImages(selectedFiles);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError('');

    try {
      const csrfToken = await getCsrfToken();

      // Step 1: Create the car
      const response = await fetch(`${API_URL}/api/cars/create/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({
          ...form,
          year: Number(form.year),
          price_per_day: form.price_per_day,
          capacity: Number(form.capacity),
          fuel_tank_capacity: Number(form.fuel_tank_capacity),
        }),
      });

      const carData = await response.json();

      if (!response.ok) {
        throw new Error(JSON.stringify(carData));
      }

      const carId: number = carData.id;

      // Step 2: Upload images one by one
      for (const image of images) {
        const formData = new FormData();
        formData.append('image', image);

        const imageResponse = await fetch(
          `${API_URL}/api/cars/${carId}/images/`,
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              'X-CSRFToken': csrfToken,
            },
            body: formData,
          }
        );

        if (!imageResponse.ok) {
          const imageError = await imageResponse.json();
          throw new Error(
            `Car created, but image upload failed: ${JSON.stringify(imageError)}`
          );
        }
      }

      navigate(`/cars/${carId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to add car.'
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Add Your Car
          </h1>
          <p className="mt-2 text-gray-500">
            Fill in your vehicle details and upload up to 3 photos.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl bg-white p-8 shadow-sm"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Brand
              </label>
              <input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="BMW"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Model
              </label>
              <input
                name="model"
                value={form.model}
                onChange={handleChange}
                placeholder="X5"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Year
              </label>
              <input
                type="number"
                name="year"
                value={form.year}
                onChange={handleChange}
                min={1886}
                max={new Date().getFullYear() + 1}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Price per Day ($)
              </label>
              <input
                type="number"
                name="price_per_day"
                value={form.price_per_day}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Capacity (Seats)
              </label>
              <input
                type="number"
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
                min={1}
                max={50}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Transmission
              </label>
              <select
                name="transmission"
                value={form.transmission}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
                <option value="tiptronic">Tiptronic</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                City
              </label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Tbilisi"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Fuel Tank Capacity (L)
              </label>
              <input
                type="number"
                name="fuel_tank_capacity"
                value={form.fuel_tank_capacity}
                onChange={handleChange}
                min={1}
                max={300}
                required
                className={inputClass}
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <label className="mb-2 block text-sm font-medium">
              Car Images (Maximum 3)
            </label>

            <input
              type="file"
              accept="image/jpeg,image/png"
              multiple
              onChange={handleImages}
              className="w-full rounded-lg border border-dashed border-gray-300 p-4 text-sm"
            />

            {images.length > 0 && (
              <p className="mt-2 text-sm text-gray-500">
                {images.length} image(s) selected
              </p>
            )}
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Adding Car...' : 'Add Car'}
          </button>
        </form>
      </main>
    </div>
  );
}

export default AddCarPage;
