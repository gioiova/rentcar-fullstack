import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProfile, logoutUser } from '../services/auth';
import type { User } from '../services/auth';

function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const profile = await getProfile();
        setUser(profile);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  async function handleLogout() {
    try {
      await logoutUser();
      setUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }

  return (
    <nav className="bg-slate-900 px-6 py-4 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link to="/" className="text-2xl font-bold">
          Rent<span className="text-blue-500">Car</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/" className="hover:text-blue-400">
            Home
          </Link>

          <Link to="/#cars" className="hover:text-blue-400">
            Cars
          </Link>

          {!loading &&
            (user ? (
              <>
               <Link
                    to="/profile"
                    className="font-medium text-blue-400 hover:text-blue-300"
                  >
                    {user.first_name}
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-400">
                  Login
                </Link>

                <Link
                  to="/register"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700"
                >
                  Register
                </Link>
              </>
            ))}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;