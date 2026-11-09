import type { Car } from '../types/car';
import { Link } from 'react-router-dom';

interface CarCardProps {
  car: Car;
}

function CarCard({ car }: CarCardProps) {
  const imageUrl = car.images.length > 0
    ? car.images[0].image
    : null;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg">
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

      <div className="p-5">
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

        <div className="mt-5 flex items-center justify-between border-t pt-4">
          <p className="text-xl font-bold text-blue-600">
            ${car.price_per_day}
            <span className="text-sm font-normal text-gray-500"> / day</span>
          </p>

          <Link
            to={`/cars/${car.id}`}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CarCard;