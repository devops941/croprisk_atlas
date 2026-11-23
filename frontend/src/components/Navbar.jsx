import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-xl navbar-dark navbar-custom py-2 sticky-top">
      <div className="container-fluid px-3 px-lg-4">
        {/* Brand with Modern SVG Insignia */}
        <NavLink className="navbar-brand d-flex align-items-center me-4 py-1 text-decoration-none" to="/">
          <div className="me-2 p-1 rounded-3 d-flex align-items-center justify-content-center"
               style={{ 
                 background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', 
                 width: '38px', 
                 height: '38px',
                 boxShadow: '0 2px 8px rgba(16, 185, 129, 0.35)'
               }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12A10 10 0 0 1 12 2z" strokeOpacity="0.3"></path>
              <path d="M12 6a6 6 0 0 1 6 6c0 3.314-2.686 6-6 6a6 6 0 0 1-6-6 6 6 0 0 1 6-6z" strokeOpacity="0.6"></path>
              <path d="M12 2v20M2 12h20"></path>
              <circle cx="12" cy="12" r="3" fill="#ffffff"></circle>
            </svg>
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <span className="fw-bold text-white tracking-tight font-heading" style={{ fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
                CropRisk<span className="text-success" style={{ color: '#34d399' }}>Atlas</span>
              </span>
              <span className="badge bg-dark border border-secondary text-light px-1 py-0" style={{ fontSize: '0.62rem', letterSpacing: '0.05em' }}>
                PRO
              </span>
            </div>
            <div className="text-light opacity-50 small" style={{ fontSize: '0.70rem', marginTop: '-3px', letterSpacing: '0.02em' }}>
              Madurai Agro-Epidemiological GIS
            </div>
          </div>
        </NavLink>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0 shadow-none px-2 py-1"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" style={{ filter: 'brightness(1.2)' }}></span>
        </button>

        {/* Navigation Links */}
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-xl-0 gap-1">
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/" end>
                <i className="bi bi-house me-1 text-secondary opacity-75"></i> Overview
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/dashboard">
                <i className="bi bi-speedometer2 me-1 text-secondary opacity-75"></i> Executive Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/map">
                <i className="bi bi-map-fill me-1 text-secondary opacity-75"></i> Spatial Risk Map
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/scouting">
                <i className="bi bi-geo-alt-fill me-1 text-secondary opacity-75"></i> Field Scouting
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/data">
                <i className="bi bi-cloud-arrow-up-fill me-1 text-secondary opacity-75"></i> Data Hub
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/reports">
                <i className="bi bi-file-earmark-bar-graph-fill me-1 text-secondary opacity-75"></i> Analytics & PDF
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/knowledge">
                <i className="bi bi-journal-bookmark-fill me-1 text-secondary opacity-75"></i> Bio Rules
              </NavLink>
            </li>
          </ul>

          {/* Right Telemetry Controls */}
          <div className="d-flex align-items-center gap-2 pt-2 pt-xl-0">
            <div className="d-flex align-items-center bg-dark bg-opacity-75 border border-secondary border-opacity-50 px-3 py-1 rounded-pill">
              <span className="radar-pulse me-2"></span>
              <span className="text-light small fw-medium" style={{ fontSize: '0.78rem' }}>
                Spatial PIP Engine: <span className="text-success fw-bold">ONLINE</span>
              </span>
            </div>

            <div className="d-none d-xxl-flex align-items-center text-light opacity-75 small px-2 py-1 bg-black bg-opacity-25 rounded border border-light border-opacity-10" style={{ fontSize: '0.75rem' }}>
              <i className="bi bi-compass text-warning me-1"></i> EPSG:4326 | 11 Taluks
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
