import { useEffect, useState } from 'react';
import { getCsrfToken } from '../services/auth';

const API_URL = 'http://127.0.0.1:8000';

interface Favorite {
  id: number;
  car: {
    id: number;
  };
}

interface FavoriteButtonProps {
  carId: number;
  onFavoriteChange?: (isFavorite: boolean) => void;
}

function FavoriteButton({ carId,onFavoriteChange }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function checkFavorite() {
      try {
        const response = await fetch(`${API_URL}/api/cars/favorites/`, {
          credentials: 'include',
          signal: controller.signal,
        });

        if (response.status === 401 || response.status === 403) {
          setIsAuthenticated(false);
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to load favorites.');
        }

        const data: Favorite[] = await response.json();

        if (!controller.signal.aborted) {
          setIsAuthenticated(true);
          setIsFavorite(data.some((favorite) => favorite.car.id === carId));
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error ? err.message : 'Something went wrong.'
          );
        }
      }
    }

    checkFavorite();

    return () => controller.abort();
  }, [carId]);

  async function handleFavorite() {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    setLoading(true);
    setError('');

    try {
      const csrfToken = await getCsrfToken();

      const response = await fetch(
        `${API_URL}/api/cars/${carId}/favorite/`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'X-CSRFToken': csrfToken,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update favorite.');
      }

        const newFavoriteState = !isFavorite;

        setIsFavorite(newFavoriteState);
        onFavoriteChange?.(newFavoriteState);

    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleFavorite}
        disabled={loading}
        aria-pressed={isFavorite}
        className={`rounded-lg px-4 py-2 font-medium transition disabled:opacity-50 ${
          isFavorite
            ? 'bg-red-100 text-red-600 hover:bg-red-200'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {isFavorite ? '♥ Remove Favorite' : '♡ Add to Favorites'}
      </button>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default FavoriteButton;