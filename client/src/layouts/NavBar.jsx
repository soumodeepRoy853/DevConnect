import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () =>{
    logout();
    Navigate("/login")
  }

  return (
    <nav className="bg-gray-900 text-white px-4 py-3 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">DevConnect</Link>
      <div className="space-x-4">
        {user ? (
          <>
            <Link to="/profile">Profile</Link>
            <Link to="/logout" onClick={handleLogout}>Logout</Link>
          </>
        ) : (
          <>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
