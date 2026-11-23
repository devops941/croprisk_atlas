import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { getDiseases, getTalukSummary } from '../api/apiClient';

const ReportsPage = () => {
  const [diseases, setDiseases] = useState([]);
  const [selectedDiseaseId, setSelectedDiseaseId] = useState(1);
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        const dList = await getDiseases();
        setDiseases(dList);
        if (dList.length > 0) setSelectedDiseaseId(dList[0].id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDiseases();
  }, []);

  const fetchSummary = async () => {
    if (!selectedDiseaseId) return;
    try {
      setLoading(true);
      const data = await getTalukSummary(selectedDiseaseId, assessmentDate);
      setSummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [selectedDiseaseId, assessmentDate]);

  const handleDownloadCSV = () => {
    window.location.href = `/api/v1/reports/export-csv?disease_id=${selectedDiseaseId}&assessment_date=${assessmentDate}`;
  };

  const handleDownloadPDF = () => {
    if (!summary) return;
    const doc = new jsPDF();
    const diseaseName = summary.disease_name;

    // Header Title
    doc.setFontSize(18);
    doc.setTextColor(27, 94, 32); // Forest Green
    doc.text("CropRisk Atlas - Surveillance Priority Dossier", 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`District: Madurai, Tamil Nadu  |  Date: ${summary.assessment_date}`, 14, 28);
    doc.text(`Target Pathogen: ${diseaseName} (Rice / Paddy)`, 14, 34);

    // Summary Box
    doc.setDrawColor(200);
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(14, 40, 182, 22, 3, 3, "FD");

    doc.setFontSize(10);
    doc.setTextColor(33);
    doc.text(`High Priority Taluks: ${summary.high_risk_taluks_count}`, 20, 52);
    doc.text(`Medium Vulnerability: ${summary.medium_risk_taluks_count}`, 75, 52);
    doc.text(`Low / Safe: ${summary.low_risk_taluks_count}`, 130, 52);

    // Table
    const tableData = summary.taluk_breakdown.map((t) => [
      t.taluk_name,
      t.rule_based_level,
      `${(t.rule_based_score * 100).toFixed(1)}%`,
      `${t.consecutive_conducive_days} d`,
      t.avg_temp_min ? `${t.avg_temp_min}°C` : 'N/A',
      t.avg_rh ? `${t.avg_rh}%` : 'N/A',
      t.primary_risk_factor
    ]);

    doc.autoTable({
      startY: 68,
      head: [["Taluk", "Risk Level", "Score", "Days", "Min T", "Avg RH", "Dominant Weather Factor"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [46, 125, 50], textColor: [255, 255, 255] },
      styles: { fontSize: 8, cellPadding: 2 }
    });

    doc.save(`CropRisk_Atlas_${diseaseName.replace(' ', '_')}_${summary.assessment_date}.pdf`);
  };

  // Plotly Bar Chart Data
  const getPlotData = () => {
    if (!summary || !summary.taluk_breakdown) return [];
    const sorted = [...summary.taluk_breakdown].sort((a, b) => b.rule_based_score - a.rule_based_score);
    const taluks = sorted.map((t) => t.taluk_name);
    const scores = sorted.map((t) => t.rule_based_score * 100);
    const colors = sorted.map((t) => (t.rule_based_level === 'HIGH' ? '#dc3545' : t.rule_based_level === 'MEDIUM' ? '#ffc107' : '#28a745'));

    return [
      {
        x: taluks,
        y: scores,
        type: 'bar',
        marker: { color: colors },
        text: scores.map((s) => `${s.toFixed(0)}%`),
        textposition: 'auto'
      }
    ];
  };

  return (
    <div className="container-fluid px-4 py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1 text-dark">Area-Wise Surveillance Reports & Dossier Export</h2>
          <p className="text-muted mb-0">
            District breakdown matrix &bull; Comparative risk bar charts &bull; Formatted CSV and PDF export
          </p>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0">
          <button className="btn btn-sm btn-outline-success" onClick={handleDownloadCSV}>
            <i className="bi bi-filetype-csv me-1"></i> Export CSV
          </button>
          <button className="btn btn-sm btn-danger" onClick={handleDownloadPDF}>
            <i className="bi bi-file-earmark-pdf-fill me-1"></i> Export PDF Report
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="card shadow-sm border-0 p-3 mb-4 bg-white">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-4">
            <label className="form-label small fw-bold text-secondary mb-1">Select Disease</label>
            <select
              className="form-select form-select-sm"
              value={selectedDiseaseId}
              onChange={(e) => setSelectedDiseaseId(Number(e.target.value))}
            >
              {diseases.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label small fw-bold text-secondary mb-1">Assessment Date</label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={assessmentDate}
              onChange={(e) => setAssessmentDate(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-4 text-md-end pt-3 pt-md-0">
            {loading && <span className="spinner-border spinner-border-sm text-success me-2"></span>}
            <button className="btn btn-sm btn-success" onClick={fetchSummary}>
              <i className="bi bi-arrow-clockwise me-1"></i> Refresh Matrix
            </button>
          </div>
        </div>
      </div>

      {/* Plotly Chart */}
      <div className="card shadow-sm border-0 p-3 mb-4">
        <h5 className="fw-bold text-dark mb-3">
          <i className="bi bi-bar-chart-fill text-success me-2"></i>
          Comparative Taluk Vulnerability Index ({summary?.disease_name})
        </h5>
        <div style={{ height: '380px' }}>
          <Plot
            data={getPlotData()}
            layout={{
              autosize: true,
              margin: { l: 40, r: 20, t: 30, b: 80 },
              yaxis: { title: 'Risk Score (%)', range: [0, 100] },
              shapes: [
                {
                  type: 'line',
                  x0: -0.5,
                  x1: 10.5,
                  y0: 70,
                  y1: 70,
                  line: { color: '#dc3545', width: 2, dash: 'dot' }
                },
                {
                  type: 'line',
                  x0: -0.5,
                  x1: 10.5,
                  y0: 35,
                  y1: 35,
                  line: { color: '#ffc107', width: 2, dash: 'dot' }
                }
              ]
            }}
            useResizeHandler={true}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>

      {/* Full Breakdown Table */}
      <div className="card shadow-sm border-0 p-3">
        <h5 className="fw-bold text-dark mb-3">Detailed Taluk Risk Matrix</h5>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small">
              <tr>
                <th>Taluk</th>
                <th>Surveillance Priority</th>
                <th>Calculated Score</th>
                <th>Consecutive Days</th>
                <th>Window Min Temp</th>
                <th>Window Mean RH</th>
                <th>Primary Environmental Factor</th>
              </tr>
            </thead>
            <tbody>
              {summary?.taluk_breakdown?.map((t) => (
                <tr key={t.taluk_name}>
                  <td className="fw-bold text-dark">{t.taluk_name}</td>
                  <td>
                    <span className={`badge ${t.rule_based_level === 'HIGH' ? 'bg-danger' : t.rule_based_level === 'MEDIUM' ? 'bg-warning text-dark' : 'bg-success'}`}>
                      {t.rule_based_level}
                    </span>
                  </td>
                  <td>{(t.rule_based_score * 100).toFixed(1)}%</td>
                  <td>{t.consecutive_conducive_days} days</td>
                  <td>{t.avg_temp_min ? `${t.avg_temp_min}°C` : 'N/A'}</td>
                  <td>{t.avg_rh ? `${t.avg_rh}%` : 'N/A'}</td>
                  <td className="small text-muted">{t.primary_risk_factor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
