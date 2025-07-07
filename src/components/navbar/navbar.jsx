import { Link, useNavigate } from 'react-router-dom';
import { logout } from "../../services/auth.service";
import './navbar.css';
import { FaHome } from "react-icons/fa";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate("/");
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark navbar-first px-3">

        <Link className="navbar-brand flex items-center gap-2 group" to="/dashboard">
          <FaHome className="me-1 icon" size={32} />
          <span className="text-lg font-semibold label">EQPIMS</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">

            <li className="nav-item dropdown hover-dropdown position-relative">
              <div className="nav-link dropdown-toggle" role="button">
                Master
              </div>
              <ul className="dropdown-menu">
                <li><Link className="dropdown-item" to="/make">Make</Link></li>
                <li><Link className="dropdown-item" to="/model">Model</Link></li>
              </ul>
            </li>

            <li className="nav-item dropdown hover-dropdown position-relative ms-3 me-3">
              <div className="nav-link dropdown-toggle" role="button">
                Equipment
              </div>
              <ul className="dropdown-menu">
                <li><Link className="dropdown-item" to="/equipment">Equipment </Link></li>
                <li><Link className="dropdown-item" to="/equipmentlog">Equipment Log </Link></li>
              </ul>
            </li>
            <li>
            <div className="nav-link dropdown-toggle" role="button">
                Calibration
              </div>
            </li>
            <li>
            <div className="nav-link dropdown-toggle" role="button">
                Inventory Components
              </div>
            </li>
            <li>
            <div className="nav-link dropdown-toggle" role="button">
                Material Gatepass
              </div>
            </li>
            <li>
            <div className="nav-link dropdown-toggle" role="button">
                Stock Verification
              </div>
            </li>
            {/* <li>
            <div className="nav-link dropdown-toggle" role="button">
                Product Tree Inventory
              </div>
            </li> */}

            <li className="nav-item">
              <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </nav>


    </>
  );
};

export default Navbar;
