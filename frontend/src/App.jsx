import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import MapPage from './pages/MapPage';
import ScoutingPage from './pages/ScoutingPage';
import DataManagerPage from './pages/DataManagerPage';
import ReportsPage from './pages/ReportsPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';

function App() {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <Navbar />
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/scouting" element={<ScoutingPage />} />
          <Route path="/data" element={<DataManagerPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/knowledge" element={<KnowledgeBasePage />} />
        </Routes>
      </main>
      <footer className="bg-white border-top py-3 text-center text-muted small">
        <div className="container">
          <span>CropRisk Atlas &copy; 2026 &bull; Final Year Project &bull; Madurai District Agricultural Intelligence &bull; Rice Blast & Brown Spot Surveillance</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
