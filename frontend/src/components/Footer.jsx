import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-top mt-auto" style={{ borderColor: 'var(--slate-200)' }}>
      {/* Top Banner with Micro Stats */}
      <div className="bg-slate-50 border-bottom py-2" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
        <div className="container-fluid px-4 d-flex flex-wrap justify-content-between align-items-center gap-2 small text-muted">
          <div className="d-flex align-items-center gap-3">
            <span><i className="bi bi-geo-alt text-success me-1"></i> Area of Interest: <strong>Madurai District, TN</strong></span>
            <span className="d-none d-md-inline">&bull;</span>
            <span className="d-none d-md-inline"><i className="bi bi-layers text-primary me-1"></i> Coverage: <strong>11 Administrative Taluks</strong></span>
            <span className="d-none d-lg-inline">&bull;</span>
            <span className="d-none d-lg-inline"><i className="bi bi-cpu text-info me-1"></i> Surveillance: <strong>Automated Spatial Indexing</strong></span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
              <i className="bi bi-check2-circle me-1"></i> System Active
            </span>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container-fluid px-4 py-4">
        <div className="row g-4">
          <div className="col-12 col-lg-5">
            <div className="d-flex align-items-center gap-2 mb-2">
              <div className="p-1 rounded bg-success text-white d-inline-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
                <i className="bi bi-shield-check"></i>
              </div>
              <span className="font-heading fw-bold text-dark fs-5">CropRisk Atlas Intelligence</span>
            </div>
            <p className="text-secondary small mb-3" style={{ maxWidth: '480px', lineHeight: '1.6' }}>
              A regional epidemiological spatial surveillance decision support system. Prioritizes agricultural extension squads and field scouting resources across Madurai's 11 administrative taluks using biometeorological infection indices (TNAU/IRRI) before macro sporulation.
            </p>
            <div className="d-flex flex-wrap gap-2">
              <span className="badge bg-light text-secondary border px-2 py-1 small">
                <i className="bi bi-flower1 me-1 text-success"></i> <em>Oryza sativa</em> (Rice)
              </span>
              <span className="badge bg-light text-secondary border px-2 py-1 small">
                <i className="bi bi-virus me-1 text-danger"></i> <em>Magnaporthe oryzae</em> (Blast)
              </span>
              <span className="badge bg-light text-secondary border px-2 py-1 small">
                <i className="bi bi-bug me-1 text-warning"></i> <em>Bipolaris oryzae</em> (Brown Spot)
              </span>
            </div>
          </div>

          <div className="col-6 col-sm-3 col-lg-2">
            <h6 className="font-heading fw-bold text-dark text-uppercase small mb-3" style={{ letterSpacing: '0.05em' }}>
              Navigation
            </h6>
            <ul className="list-unstyled small mb-0 d-flex flex-column gap-2">
              <li><Link to="/" className="text-decoration-none text-secondary hover-dark">System Overview</Link></li>
              <li><Link to="/dashboard" className="text-decoration-none text-secondary hover-dark">Executive Dashboard</Link></li>
              <li><Link to="/map" className="text-decoration-none text-secondary hover-dark">Interactive Spatial Map</Link></li>
              <li><Link to="/scouting" className="text-decoration-none text-secondary hover-dark">Field Scouting Entry</Link></li>
            </ul>
          </div>

          <div className="col-6 col-sm-3 col-lg-2">
            <h6 className="font-heading fw-bold text-dark text-uppercase small mb-3" style={{ letterSpacing: '0.05em' }}>
              Data & Standards
            </h6>
            <ul className="list-unstyled small mb-0 d-flex flex-column gap-2">
              <li><Link to="/data" className="text-decoration-none text-secondary hover-dark">Data Hub & CSV Upload</Link></li>
              <li><Link to="/reports" className="text-decoration-none text-secondary hover-dark">Taluk Risk Dossiers</Link></li>
              <li><Link to="/knowledge" className="text-decoration-none text-secondary hover-dark">TNAU Biological Rules</Link></li>
              <li><a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer" className="text-decoration-none text-secondary hover-dark">FastAPI Swagger Docs <i className="bi bi-box-arrow-up-right ms-1" style={{ fontSize: '0.7rem' }}></i></a></li>
            </ul>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <h6 className="font-heading fw-bold text-dark text-uppercase small mb-3" style={{ letterSpacing: '0.05em' }}>
              Platform Architecture
            </h6>
            <div className="p-3 rounded-3 bg-light border border-slate-200 small">
              <div className="fw-semibold text-dark mb-1">Regional Epidemiological Surveillance</div>
              <div className="text-secondary small mb-2">Engineered with spatial block cross-validation and verified regional administrative boundaries.</div>
              <div className="d-flex align-items-center text-muted small">
                <i className="bi bi-shield-check text-success me-1"></i> Agricultural GIS & Intelligence Engine
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-top py-3 bg-white" style={{ borderColor: '#f1f5f9' }}>
        <div className="container-fluid px-4 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 small text-muted">
          <span>&copy; {new Date().getFullYear()} CropRisk Atlas &bull; Madurai Agricultural Epidemiological Intelligence.</span>
          <span className="text-secondary">Engineered with React 18 &bull; Vite &bull; Leaflet &bull; FastAPI &bull; Shapely</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
