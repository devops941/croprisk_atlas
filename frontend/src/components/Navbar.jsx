import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-custom py-2">
      <div className="container-fluid px-4">
        <NavLink className="navbar-brand d-flex align-items-center" to="/">
          <span className="fs-3 me-2">🌾</span>
          <div>
            <div className="fw-bold tracking-tight" style={{ fontSize: '1.25rem' }}>CropRisk Atlas</div>
            <div className="text-light opacity-75 small" style={{ fontSize: '0.75rem', marginTop: '-4px' }}>
              Madurai Agriculture Intelligence
            </div>
          </div>
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-4">
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/" end>
                <i className="bi bi-house-door me-1"></i> Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/dashboard">
                <i className="bi bi-speedometer2 me-1"></i> Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/map">
                <i className="bi bi-map me-1"></i> Spatial Risk Map
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/scouting">
                <i className="bi bi-geo-alt me-1"></i> Field Scouting
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/data">
                <i className="bi bi-cloud-arrow-up me-1"></i> Data Hub
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/reports">
                <i className="bi bi-file-earmark-bar-graph me-1"></i> Reports & Export
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/knowledge">
                <i className="bi bi-journal-medical me-1"></i> Knowledge Base
              </NavLink>
            </li>
          </ul>

          <div className="d-flex align-items-center text-light small">
            <span className="badge bg-light text-dark me-2 px-2 py-1">
              <i className="bi bi-shield-check text-success me-1"></i> Surveillance Mode
            </span>
            <span className="text-light opacity-75 d-none d-xl-inline">
              <i className="bi bi-geo-fill text-warning me-1"></i> Madurai (11 Taluks)
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
