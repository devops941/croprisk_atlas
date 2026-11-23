import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { getDiseases, getTalukSummary } from '../api/apiClient';

const ReportsPage = () => {
  const [diseases, setDiseases] = useState([]);
  const [selectedDiseaseId, setSelectedDiseaseId] = useState(1);
  const [assessmentDate, setAssessmentDate] = useState('2026-10-25');
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
    doc.setTextColor(5, 150, 105); // Emerald Green
    doc.text("CropRisk Atlas - Surveillance Priority Dossier", 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`District: Madurai, Tamil Nadu  |  Assessment Date: ${summary.assessment_date}`, 14, 28);
    doc.text(`Target Pathogen: ${diseaseName} (Rice / Oryza sativa, Samba Season)`, 14, 34);

    // Summary Box
    doc.setDrawColor(220);
    doc.setFillColor(248, 250, 252);
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
      headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255] },
      styles: { fontSize: 8, cellPadding: 2 }
    });

    doc.save(`CropRisk_Atlas_${diseaseName.replace(' ', '_')}_${summary.assessment_date}.pdf`);
  };

  // Plotly Bar Chart Data
  const getPlotData = () => {
    if (!summary || !summary.taluk_breakdown) return [];
    const sorted = [...summary.taluk_breakdown].sort((a, b) => a.rule_based_score - b.rule_based_score);

    const talukNames = sorted.map((t) => t.taluk_name);
    const scores = sorted.map((t) => +(t.rule_based_score * 100).toFixed(1));
    const colors = sorted.map((t) => {
      if (t.rule_based_level === 'HIGH') return '#ef4444';
      if (t.rule_based_level === 'MEDIUM') return '#f59e0b';
      return '#10b981';
    });

    return [
      {
        y: talukNames,
        x: scores,
        type: 'bar',
        orientation: 'h',
        marker: {
          color: colors,
          line: { color: '#ffffff', width: 1.5 }
        },
        text: scores.map((s) => `${s}%`),
        textposition: 'auto',
        hoverinfo: 'y+x'
      }
    ];
  };

  const currentDisease = diseases.find((d) => d.id === selectedDiseaseId);

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      {/* Header and Controls */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-3 border-bottom gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary text-white px-2 py-1 small" style={{ fontSize: '0.72rem' }}>
              REGIONAL DOSSIER
            </span>
            <span className="text-secondary small">&bull;</span>
            <span className="text-secondary small">Madurai 11 Administrative Taluks</span>
          </div>
          <h2 className="font-heading fw-bold mb-1 text-dark">
            Epidemiological Reports & Squad Briefing Dossiers
          </h2>
          <p className="text-muted small mb-0">
            Export standardized taluk risk rankings, microclimate factor breakdowns, and official PDF advisories.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-pro-outline btn-sm d-flex align-items-center gap-1"
            onClick={handleDownloadCSV}
            disabled={!summary}
          >
            <i className="bi bi-filetype-csv text-success"></i>
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            className="btn btn-pro-primary btn-sm d-flex align-items-center gap-1"
            onClick={handleDownloadPDF}
            disabled={!summary}
          >
            <i className="bi bi-file-earmark-pdf"></i>
            <span>Download Official PDF Dossier</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="card shadow-sm border-0 mb-4 bg-white p-3">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-5">
            <label className="form-label small fw-bold text-secondary mb-1">Target Pathogen</label>
            <div className="btn-group w-100">
              {diseases.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  className={`btn btn-sm ${selectedDiseaseId === d.id ? 'btn-pro-primary fw-semibold' : 'btn-pro-outline'}`}
                  onClick={() => setSelectedDiseaseId(d.id)}
                >
                  <i className="bi bi-virus me-1"></i> {d.name}
                </button>
              ))}
            </div>
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label small fw-bold text-secondary mb-1">Assessment Date</label>
            <div className="input-group input-group-sm">
              <input
                type="date"
                className="form-control"
                value={assessmentDate}
                onChange={(e) => setAssessmentDate(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setAssessmentDate('2026-10-25')}
                title="Samba Peak Date"
              >
                Samba Peak
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setAssessmentDate(new Date().toISOString().split('T')[0])}
                title="Today"
              >
                Today
              </button>
            </div>
          </div>

          <div className="col-12 col-md-3 text-md-end pt-3 pt-md-0">
            {loading && (
              <span className="spinner-border spinner-border-sm text-success me-2" role="status"></span>
            )}
            <span className="badge bg-light text-secondary border p-2">
              <i className="bi bi-calendar3 me-1"></i> Active: <strong>{assessmentDate}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Row for Selected Assessment */}
      {summary && (
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card p-3 border-0 bg-light">
              <div className="text-muted small text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>High-Risk Taluks</div>
              <div className="fs-3 fw-bold text-danger font-mono">{summary.high_risk_taluks_count}</div>
              <div className="small text-danger" style={{ fontSize: '0.75rem' }}>Immediate Squad Priority</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card p-3 border-0 bg-light">
              <div className="text-muted small text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>Medium Vulnerability</div>
              <div className="fs-3 fw-bold text-warning font-mono">{summary.medium_risk_taluks_count}</div>
              <div className="small text-warning" style={{ fontSize: '0.75rem' }}>Elevated Watch List</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card p-3 border-0 bg-light">
              <div className="text-muted small text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>Low / Suppressive</div>
              <div className="fs-3 fw-bold text-success font-mono">{summary.low_risk_taluks_count}</div>
              <div className="small text-success" style={{ fontSize: '0.75rem' }}>Routine Surveillance</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card p-3 border-0 bg-light">
              <div className="text-muted small text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>District Average Risk</div>
              <div className="fs-3 fw-bold text-dark font-mono">{(summary.district_average_score * 100).toFixed(1)}%</div>
              <div className="small text-muted" style={{ fontSize: '0.75rem' }}>5-Day Decay Weighted</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Comparative Plotly Chart & Table */}
      <div className="row g-4">
        {/* Left: Plotly Chart */}
        <div className="col-12 col-xl-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="font-heading fw-bold mb-0 text-dark">
                  <i className="bi bi-bar-chart-steps text-success me-2"></i>
                  Taluk Risk Ranking Comparison
                </h5>
                <span className="small text-muted" style={{ fontSize: '0.75rem' }}>
                  Relative vulnerability ranked from highest to lowest
                </span>
              </div>
            </div>

            <div className="card-body p-3">
              {summary && summary.taluk_breakdown ? (
                <div style={{ width: '100%', minHeight: '440px' }}>
                  <Plot
                    data={getPlotData()}
                    layout={{
                      autosize: true,
                      margin: { l: 120, r: 40, t: 20, b: 40 },
                      xaxis: {
                        title: 'Risk Score (%)',
                        range: [0, 100],
                        gridcolor: '#f1f5f9'
                      },
                      yaxis: {
                        automargin: true
                      },
                      font: {
                        family: 'Inter, sans-serif',
                        size: 12,
                        color: '#334155'
                      },
                      paper_bgcolor: 'transparent',
                      plot_bgcolor: 'transparent'
                    }}
                    useResizeHandler={true}
                    style={{ width: '100%', height: '100%' }}
                    config={{ displayModeBar: false }}
                  />
                </div>
              ) : (
                <div className="p-5 text-center text-muted">Loading chart data...</div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Detailed Table */}
        <div className="col-12 col-xl-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="font-heading fw-bold mb-0 text-dark">
                  <i className="bi bi-table text-primary me-2"></i>
                  Taluk Vulnerability Dossier Table
                </h5>
                <span className="small text-muted" style={{ fontSize: '0.75rem' }}>
                  Microclimate drivers and consecutive conducive days
                </span>
              </div>
            </div>

            <div className="card-body p-0">
              <div className="table-responsive" style={{ maxHeight: '480px' }}>
                <table className="table table-hover align-middle mb-0">
                  <thead className="sticky-top bg-light">
                    <tr>
                      <th>Taluk</th>
                      <th>Priority</th>
                      <th>Score</th>
                      <th>Min T / RH</th>
                      <th>Dominant Driver</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary?.taluk_breakdown?.map((t) => (
                      <tr key={t.taluk_name}>
                        <td className="fw-semibold text-dark">{t.taluk_name}</td>
                        <td>
                          <span className={`badge ${t.rule_based_level === 'HIGH' ? 'badge-risk-severe' : t.rule_based_level === 'MEDIUM' ? 'badge-risk-moderate' : 'badge-risk-low'}`}>
                            {t.rule_based_level}
                          </span>
                        </td>
                        <td>
                          <strong className="font-mono text-dark">{(t.rule_based_score * 100).toFixed(1)}%</strong>
                        </td>
                        <td className="small text-secondary">
                          {t.avg_temp_min ? `${t.avg_temp_min}°C` : 'N/A'} / {t.avg_rh ? `${t.avg_rh}%` : 'N/A'}
                        </td>
                        <td className="small text-secondary text-truncate" style={{ maxWidth: '180px' }}>
                          {t.primary_risk_factor}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
