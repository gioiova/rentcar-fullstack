import type { Car } from './car';

export interface Favorite {
  id: number;
  car: Car;
}

export interface Rental {
  id: number;
  car: number;
  car_details: Car;
  start_date: string;
  end_date: string;
  days: number;
  total_price: string;
  created_at: string;
}

export interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  cars: Car[];
  favorites: Favorite[];
  rentals: Rental[];
}