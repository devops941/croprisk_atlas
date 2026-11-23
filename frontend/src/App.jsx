import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import MapPage from './pages/MapPage';
import ScoutingPage from './pages/ScoutingPage';
import DataManagerPage from './pages/DataManagerPage';
import ReportsPage from './pages/ReportsPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';

function App() {
  return (
    <div className="min-vh-100 d-flex flex-column bg-slate-50">
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
          <Route path="/rules" element={<KnowledgeBasePage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
