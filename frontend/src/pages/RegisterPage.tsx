import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { registerUser } from '../services/auth';
import type { RegisterData } from '../services/auth';

const initialForm: RegisterData = {
  first_name: '',
  last_name: '',
  phone_number: '',
  email: '',
  password: '',
};

function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterData>(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await registerUser(form);
      navigate('/login');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Registration failed.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex min-h-[85vh] items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="text-center text-3xl font-bold text-slate-900">
            Create Account
          </h1>

          <p className="mt-2 text-center text-gray-500">
            Join RentCar and start your journey
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {[
              { name: 'first_name', label: 'First Name', type: 'text' },
              { name: 'last_name', label: 'Last Name', type: 'text' },
              { name: 'phone_number', label: 'Phone Number', type: 'tel' },
              { name: 'email', label: 'Email', type: 'email' },
              { name: 'password', label: 'Password', type: 'password' },
            ].map((field) => (
              <div key={field.name}>
                <label className="mb-2 block text-sm font-medium">
                  {field.label}
                </label>

                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name as keyof RegisterData]}
                  onChange={handleChange}
                  required
                  placeholder={
                    field.name === 'phone_number'
                      ? '599123456'
                      : `Enter ${field.label.toLowerCase()}`
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>
            ))}

            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;