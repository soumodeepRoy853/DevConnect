import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";
import { Search } from "lucide-react"; // ✅ Correct icon import

const Navbar = () => {
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authUser");
    setAuth({ token: "", user: null });
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 text-white py-3 px-6 shadow-md flex flex-wrap justify-between items-center">
      <Link to="/" className="text-2xl font-bold tracking-wide">
        DevConnect
      </Link>

      <div className="flex gap-4 items-center mt-2 md:mt-0">
        {/* Search Icon */}
        <Link to="/search" title="Search">
          <Search className="w-5 h-5 hover:text-blue-200 transition duration-200" />
        </Link>

        {auth.user ? (
          <>
            <Link to="/" className="hover:underline">Home</Link>
            <Link to="/profile" className="hover:underline">My Profile</Link>
            <Link to="/explore" className="hover:underline">Discover</Link>
            <Link to="/edit-profile" className="hover:underline">Edit</Link>
            <button
              onClick={handleLogout}
              className="hover:underline text-red-200"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/register" className="hover:underline">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
