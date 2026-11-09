import type { Car } from '../types/car';
import { Link } from 'react-router-dom';
import FavoriteButton from './FavoriteButton';

interface CarCardProps {
  car: Car;
  onFavoriteChange?: (isFavorite: boolean) => void;
}

function CarCard({ car,onFavoriteChange }: CarCardProps) {
  const imageUrl =
    car.images.length > 0
      ? new URL(car.images[0].image, 'http://127.0.0.1:8000').href
      : null;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg">
      {/* Car Image */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`${car.brand} ${car.model}`}
          className="h-52 w-full object-cover"
        />
      ) : (
        <div className="flex h-52 items-center justify-center bg-gray-100 text-gray-400">
          No Image Available
        </div>
      )}

      {/* Car Information */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-bold text-slate-900">
          {car.brand} {car.model}
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          {car.year} • {car.city}
        </p>

        <div className="mt-4 flex justify-between text-sm text-gray-600">
          <span>{car.capacity} Seats</span>
          <span className="capitalize">{car.transmission}</span>
        </div>

        {/* Price and Actions */}
        <div className="mt-auto pt-5">
          <div className="border-t border-gray-200 pt-4">
            <p className="text-2xl font-bold text-blue-600">
              ${car.price_per_day}
              <span className="text-sm font-normal text-gray-500">
                {' '}/ day
              </span>
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="[&>div>button]:w-full">
              <FavoriteButton carId={car.id}  onFavoriteChange={onFavoriteChange}/>
            </div>

            <Link
              to={`/cars/${car.id}`}
              className="flex min-h-10 items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-blue-600"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarCard;