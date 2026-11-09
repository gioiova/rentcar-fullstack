
import type { Car } from './car';

export interface OwnerRental {
  id: number;
  renter: {
    id: number;
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
  };
  car_details: Car;
  start_date: string;
  end_date: string;
  days: number;
  total_price: string;
  created_at: string;
}
