import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          Smart Code Translator
        </Link>
      </div>

      <div className="navbar-links">
        <Link to="/">Translator</Link>

        <Link to="/history">History</Link>

        <span className="navbar-user">
          {user?.name}
        </span>

        <button
          className="navbar-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;