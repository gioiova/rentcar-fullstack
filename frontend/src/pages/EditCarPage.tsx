
import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Navbar from '../components/Navbar';
import { getCsrfToken, getProfile } from '../services/auth';
import type { Car } from '../types/car';

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

function EditCarPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<CarFormData | null>(null);
  const [existingImages, setExistingImages] = useState<Car['images']>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadCar() {
      try {
        const [profile, carResponse] = await Promise.all([
          getProfile(),
          fetch(`${API_URL}/api/cars/${id}/`, {
            signal: controller.signal,
          }),
        ]);

        if (!carResponse.ok) {
          throw new Error('Car not found.');
        }

        const car: Car & { owner: number } =
          await carResponse.json();

        if (car.owner !== profile.id) {
          throw new Error('You can only edit your own cars.');
        }

        if (controller.signal.aborted) return;

        setForm({
          brand: car.brand,
          model: car.model,
          year: String(car.year),
          price_per_day: car.price_per_day,
          capacity: String(car.capacity),
          transmission: car.transmission,
          city: car.city,
          fuel_tank_capacity: String(car.fuel_tank_capacity),
        });

        setExistingImages(car.images);
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error ? err.message : 'Failed to load car.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadCar();

    return () => controller.abort();
  }, [id]);

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    setForm((previous) =>
      previous ? { ...previous, [name]: value } : previous
    );
  }

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const availableSlots = 3 - existingImages.length;

    if (files.length > availableSlots) {
      setError(`You can add only ${availableSlots} more image(s).`);
      setNewImages([]);
      e.target.value = '';
      return;
    }

    if (
      files.some(
        (file) => !['image/jpeg', 'image/png'].includes(file.type)
      )
    ) {
      setError('Only JPG and PNG images are allowed.');
      setNewImages([]);
      e.target.value = '';
      return;
    }

    setError('');
    setSuccess('');
    setNewImages(files);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form || saving || deleting || uploading) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const csrfToken = await getCsrfToken();

      const response = await fetch(
        `${API_URL}/api/cars/${id}/update/`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
          },
          body: JSON.stringify({
            ...form,
            year: Number(form.year),
            capacity: Number(form.capacity),
            fuel_tank_capacity: Number(form.fuel_tank_capacity),
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(JSON.stringify(data));
      }

      navigate(`/cars/${id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update car.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadImages() {
    if (
      newImages.length === 0 ||
      uploading ||
      saving ||
      deleting
    ) {
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    let uploadedCount = 0;

    try {
      const csrfToken = await getCsrfToken();

      for (const image of newImages) {
        const formData = new FormData();
        formData.append('image', image);

        const response = await fetch(
          `${API_URL}/api/cars/${id}/images/`,
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              'X-CSRFToken': csrfToken,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(JSON.stringify(data));
        }

        uploadedCount += 1;
      }

      setSuccess('Photos uploaded successfully!');
    } catch (err) {
      setError(
        err instanceof Error
          ? `Uploaded ${uploadedCount} photo(s). ${err.message}`
          : 'Image upload failed.'
      );
    } finally {
      // Refresh photos even if only some uploads succeeded.
      try {
        const response = await fetch(`${API_URL}/api/cars/${id}/`);

        if (response.ok) {
          const updatedCar: Car = await response.json();
          setExistingImages(updatedCar.images);
        }
      } catch {
        // Keep existing photos if refresh fails.
      }

      setNewImages([]);
      setUploading(false);
    }
  }

        
        async function handleDeleteImage(imageId: number) {
        if (saving || deleting || uploading) return;

        const confirmed = window.confirm(
            'Are you sure you want to remove this photo?'
        );

        if (!confirmed) return;

        setUploading(true);
        setError('');
        setSuccess('');

        try {
            const csrfToken = await getCsrfToken();

            const response = await fetch(
            `${API_URL}/api/cars/${id}/images/${imageId}/delete/`,
            {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                'X-CSRFToken': csrfToken,
                },
            }
            );

            if (!response.ok) {
            throw new Error('Failed to delete photo.');
            }

            setExistingImages((previous) =>
            previous.filter((image) => image.id !== imageId)
            );

            setSuccess('Photo deleted successfully!');
        } catch (err) {
            setError(
            err instanceof Error ? err.message : 'Failed to delete photo.'
            );
        } finally {
            setUploading(false);
        }
        }



  async function handleDelete() {
    if (saving || deleting || uploading) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete this car? This action cannot be undone.'
    );

    if (!confirmed) return;

    setDeleting(true);
    setError('');
    setSuccess('');

    try {
      const csrfToken = await getCsrfToken();

      const response = await fetch(
        `${API_URL}/api/cars/${id}/delete/`,
        {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'X-CSRFToken': csrfToken,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete car.');
      }

      navigate('/profile');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete car.'
      );
    } finally {
      setDeleting(false);
    }
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500';

  const busy = saving || deleting || uploading;
  const availableSlots = 3 - existingImages.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <p className="p-10 text-center text-gray-500">
          Loading car...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 py-12">
        <Link
          to="/profile"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Profile
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-slate-900">
          Edit Car
        </h1>

        <p className="mt-2 text-gray-500">
          Update your vehicle details and manage photos.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-600"
          >
            {error}
          </p>
        )}

        {success && (
          <p
            role="status"
            className="mt-5 rounded-lg bg-green-50 p-4 text-sm text-green-700"
          >
            {success}
          </p>
        )}

        {form && (
          <>
            {/* Car Information */}
            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-6 rounded-2xl bg-white p-8 shadow-sm"
            >
              <h2 className="text-xl font-bold text-slate-900">
                Vehicle Information
              </h2>

              <div className="grid gap-5 sm:grid-cols-2">
                {([
                  ['brand', 'Brand'],
                  ['model', 'Model'],
                  ['year', 'Year'],
                  ['price_per_day', 'Price per Day ($)'],
                  ['capacity', 'Capacity'],
                  ['city', 'City'],
                  ['fuel_tank_capacity', 'Fuel Tank Capacity (L)'],
                ] as const).map(([name, label]) => (
                  <div key={name}>
                    <label
                      htmlFor={name}
                      className="mb-2 block text-sm font-medium"
                    >
                      {label}
                    </label>

                    <input
                      id={name}
                      name={name}
                      type={
                        [
                          'year',
                          'price_per_day',
                          'capacity',
                          'fuel_tank_capacity',
                        ].includes(name)
                          ? 'number'
                          : 'text'
                      }
                      step={
                        name === 'price_per_day'
                          ? '0.01'
                          : undefined
                      }
                      min={
                        name === 'year'
                          ? 1886
                          : name === 'price_per_day'
                          ? 0.01
                          : [
                              'capacity',
                              'fuel_tank_capacity',
                            ].includes(name)
                          ? 1
                          : undefined
                      }
                      max={
                        name === 'year'
                          ? new Date().getFullYear() + 1
                          : name === 'capacity'
                          ? 50
                          : name === 'fuel_tank_capacity'
                          ? 300
                          : undefined
                      }
                      value={form[name]}
                      onChange={handleChange}
                      required
                      disabled={busy}
                      className={inputClass}
                    />
                  </div>
                ))}

                <div>
                  <label
                    htmlFor="transmission"
                    className="mb-2 block text-sm font-medium"
                  >
                    Transmission
                  </label>

                  <select
                    id="transmission"
                    name="transmission"
                    value={form.transmission}
                    onChange={handleChange}
                    disabled={busy}
                    className={inputClass}
                  >
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                    <option value="tiptronic">Tiptronic</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-gray-200 pt-6 sm:flex-row">
                <button
                  type="submit"
                  disabled={busy}
                  className="flex-1 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={busy}
                  className="rounded-lg bg-red-50 px-5 py-3 font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete Car'}
                </button>
              </div>
            </form>

            {/* Manage Photos */}
            <section className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">
                Manage Photos ({existingImages.length}/3)
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                View existing photos and upload additional images.
              </p>

              {existingImages.length > 0 ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {existingImages.map((image) => (
                        <div key={image.id} className="relative">
                            <img
                            src={new URL(image.image, API_URL).href}
                            alt="Car"
                            className="h-36 w-full rounded-lg bg-gray-100 object-cover"
                            />

                            <button
                            type="button"
                            onClick={() => handleDeleteImage(image.id)}
                            disabled={busy}
                            className="absolute right-2 top-2 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-red-700 disabled:opacity-50"
                            >
                            Remove
                            </button>
                        </div>
                        ))}
                </div>
              ) : (
                <p className="mt-5 text-sm text-gray-500">
                  No photos uploaded yet.
                </p>
              )}

              {availableSlots > 0 ? (
                <div className="mt-6 space-y-4 border-t border-gray-200 pt-6">
                  <label
                    htmlFor="car-images"
                    className="block text-sm font-medium"
                  >
                    Add New Photos
                  </label>

                  <input
                    id="car-images"
                    type="file"
                    accept="image/jpeg,image/png"
                    multiple
                    disabled={busy}
                    onChange={handleImageChange}
                    className="w-full rounded-lg border border-dashed border-gray-300 p-4 text-sm"
                  />

                  <p className="text-sm text-gray-500">
                    You can add {availableSlots} more photo(s).
                    Only JPG and PNG files are allowed.
                  </p>

                  {newImages.length > 0 && (
                    <p className="text-sm font-medium text-blue-600">
                      {newImages.length} new photo(s) selected
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleUploadImages}
                    disabled={busy || newImages.length === 0}
                    className="rounded-lg bg-slate-900 px-6 py-3 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {uploading
                      ? 'Uploading Photos...'
                      : 'Upload Photos'}
                  </button>
                </div>
              ) : (
                <p className="mt-6 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                  Maximum of 3 photos reached.
                </p>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default EditCarPage;
