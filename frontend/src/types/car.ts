export interface CarImage {
  id: number;
  image: string;
}

export interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  price_per_day: string;
  capacity: number;
  transmission: string;
  city: string;
  images: CarImage[];
}