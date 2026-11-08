export interface CarFilterValues {
  search: string;
  city: string;
  year_min: string;
  year_max: string;
  capacity: string;
  ordering: string;
}

interface CarFiltersProps {
  filters: CarFilterValues;
  onChange: (filters: CarFilterValues) => void;
}

function CarFilters({ filters, onChange }: CarFiltersProps) {
  function handleChange(
    field: keyof CarFilterValues,
    value: string
  ) {
    onChange({
      ...filters,
      [field]: value,
    });
  }

  function handleReset() {
    onChange({
      search: '',
      city: '',
      year_min: '',
      year_max: '',
      capacity: '',
      ordering: '',
    });
  }

  const inputStyle =
    'w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500';

  return (
    <div className="mb-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-5 text-xl font-bold text-slate-900">
        Find Your Car
      </h3>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <input
          type="text"
          placeholder="Search brand or model"
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          className={inputStyle}
        />

        <input
          type="text"
          placeholder="City (e.g. Tbilisi)"
          value={filters.city}
          onChange={(e) => handleChange('city', e.target.value)}
          className={inputStyle}
        />

        <input
          type="number"
          placeholder="Year From"
          value={filters.year_min}
          onChange={(e) => handleChange('year_min', e.target.value)}
          className={inputStyle}
        />

        <input
          type="number"
          placeholder="Year To"
          value={filters.year_max}
          onChange={(e) => handleChange('year_max', e.target.value)}
          className={inputStyle}
        />

        <input
          type="number"
          placeholder="Seats"
          min="1"
          value={filters.capacity}
          onChange={(e) => handleChange('capacity', e.target.value)}
          className={inputStyle}
        />

        <select
          value={filters.ordering}
          onChange={(e) => handleChange('ordering', e.target.value)}
          className={inputStyle}
        >
          <option value="">Sort by Price</option>
          <option value="price_per_day">Price: Low to High</option>
          <option value="-price_per_day">Price: High to Low</option>
        </select>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={handleReset}
          className="rounded-lg bg-slate-900 px-6 py-3 font-medium text-white transition hover:bg-slate-700"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}

export default CarFilters;