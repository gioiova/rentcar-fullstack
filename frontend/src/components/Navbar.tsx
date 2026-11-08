function Navbar() {
  return (
    <nav className="bg-slate-900 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <a href="/" className="text-2xl font-bold">
          Rent<span className="text-blue-500">Car</span>
        </a>

        <div className="flex items-center gap-8">
          <a href="/" className="hover:text-blue-400">
            Home
          </a>

          <a href="#cars" className="hover:text-blue-400">
            Cars
          </a>

          <a href="/login" className="hover:text-blue-400">
            Login
          </a>

          <a
            href="/register"
            className="rounded-lg bg-blue-600 px-5 py-2 font-medium hover:bg-blue-700"
          >
            Register
          </a>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;