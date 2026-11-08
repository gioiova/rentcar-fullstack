import { useEffect, useState } from 'react';

interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  price_per_day: string;
  city: string;
}

function App() {
  const [cars, setCars] = useState<Car[]>([]);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/cars/')
      .then((response) => response.json())
      .then((data: Car[]) => setCars(data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <div>
      <h1>RentCar</h1>

      {cars.map((car) => (
        <div key={car.id}>
          <h3>{car.brand} {car.model}</h3>
          <p>Year: {car.year}</p>
          <p>City: {car.city}</p>
          <p>Price: ${car.price_per_day} / day</p>
          <hr />
        </div>
      ))}
    </div>
  );
}

export default App;