import React from 'react';

const KnowledgeBasePage = () => {
  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-3 border-bottom gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-success text-white px-2 py-1 small" style={{ fontSize: '0.72rem' }}>
              AGRONOMIC REFERENCE
            </span>
            <span className="text-secondary small">&bull;</span>
            <span className="text-secondary small">TNAU & IRRI Certified Standards</span>
          </div>
          <h2 className="font-heading fw-bold mb-1 text-dark">
            Agro-Epidemiological Knowledge Base & Biological Rules
          </h2>
          <p className="text-muted small mb-0">
            Mathematical conduciveness thresholds, biological pathogen parameters, and IRRI SES rating criteria.
          </p>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Rice Blast Card */}
        <div className="col-12 col-lg-6">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-header bg-success-subtle text-success-emphasis py-3 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="font-heading fw-bold mb-0">
                  <i className="bi bi-virus me-2"></i> Rice Blast (<em>Magnaporthe oryzae</em>)
                </h5>
                <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                  Anamorph: <em>Pyricularia oryzae</em> &bull; Phylum: Ascomycota
                </div>
              </div>
              <span className="badge bg-danger">Critical Threat</span>
            </div>

            <div className="card-body p-4">
              <h6 className="font-heading fw-bold text-dark mb-2">Conducive Weather Criteria (TNAU Guidelines)</h6>
              <ul className="small text-secondary mb-3 d-flex flex-column gap-2">
                <li><strong>Night Temperature (T<sub>min</sub>):</strong> Optimal between 20.0°C and 24.0°C. Blast sporulation is severely suppressed below 16°C or above 28°C.</li>
                <li><strong>Relative Humidity (RH):</strong> Critical threshold &ge; 90% (particularly morning relative humidity at 07:00 IST).</li>
                <li><strong>Leaf Wetness Duration:</strong> &ge; 10–12 continuous hours (dew deposition on foliage).</li>
                <li><strong>Cloud Cover & Skies:</strong> Overcast days, low solar insolation (&lt; 14 MJ/m<sup>2</sup>/day), and intermittent light drizzles.</li>
              </ul>

              <h6 className="font-heading fw-bold text-dark mb-2">Symptom Morphology & Vulnerable Stages</h6>
              <p className="small text-secondary mb-3" style={{ lineHeight: '1.6' }}>
                <strong>Leaf Blast:</strong> Diamond- or spindle-shaped lesions with gray-whitish centers and dark brown-reddish borders, predominantly during the <em>Tillering</em> stage.<br />
                <strong>Neck / Panicle Blast:</strong> Blackish-brown necrotic lesions at the panicle base leading to chaffy grains and lodging, common during <em>Heading and Flowering</em>.
              </p>

              <div className="p-3 bg-light rounded-3 border small">
                <strong className="text-dark">Prophylactic Surveillance Directive:</strong> In high-risk zones, advise early scouting in nursery and tillering fields. Recommend balanced nitrogen split applications (avoid excess top-dressing during dew spells).
              </div>
            </div>
          </div>
        </div>

        {/* Brown Spot Card */}
        <div className="col-12 col-lg-6">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-header bg-warning-subtle text-warning-emphasis py-3 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="font-heading fw-bold mb-0">
                  <i className="bi bi-circle-half me-2"></i> Brown Spot (<em>Bipolaris oryzae</em>)
                </h5>
                <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                  Teleomorph: <em>Cochliobolus miyabeanus</em> &bull; Phylum: Ascomycota
                </div>
              </div>
              <span className="badge bg-warning text-dark">Chronic Threat</span>
            </div>

            <div className="card-body p-4">
              <h6 className="font-heading fw-bold text-dark mb-2">Conducive Weather Criteria (TNAU / ICAR Guidelines)</h6>
              <ul className="small text-secondary mb-3 d-flex flex-column gap-2">
                <li><strong>Ambient Temperature (T<sub>avg</sub>):</strong> Optimal between 25.0°C and 30.0°C (mean ~28.0°C).</li>
                <li><strong>Relative Humidity (RH):</strong> &ge; 85% sustained throughout tillering and grain filling.</li>
                <li><strong>Soil & Nutrient Stress:</strong> Aggravated by light sandy soils deficient in potassium (K) or silicon (Si), or fields experiencing intermittent drought spells.</li>
                <li><strong>Leaf Wetness:</strong> &ge; 8 hours required for conidial germination.</li>
              </ul>

              <h6 className="font-heading fw-bold text-dark mb-2">Symptom Morphology & Vulnerable Stages</h6>
              <p className="small text-secondary mb-3" style={{ lineHeight: '1.6' }}>
                Produces circular to oval dark brown spots on coleoptiles, leaves, and glumes. Lesions resemble sesame seeds. In severe attacks, spots coalesce, causing seedling blight and poor grain filling from <em>maximum tillering to milk stage</em>.
              </p>

              <div className="p-3 bg-light rounded-3 border small">
                <strong className="text-dark">Prophylactic Surveillance Directive:</strong> Prioritize soil fertility checks and ensure adequate potash application. In vulnerable blocks, scout water-stressed upland or rainfed tank-fed tracts.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* IRRI SES Reference Table */}
      <div className="card shadow-sm border-0 p-4 mb-4">
        <h5 className="font-heading fw-bold mb-3 text-dark">
          <i className="bi bi-rulers me-2 text-success"></i> IRRI Standard Evaluation System (SES) Scale for Rice
        </h5>
        <div className="table-responsive">
          <table className="table table-bordered table-sm small mb-0">
            <thead className="table-light">
              <tr>
                <th>Score</th>
                <th>Leaf Area Affected (%)</th>
                <th>Lesion Morphology Description</th>
                <th>Host Reaction Category</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="fw-bold text-success font-mono">0</td>
                <td>0%</td>
                <td>No lesions observed; healthy foliage</td>
                <td><span className="badge badge-risk-low">Immune / Highly Resistant</span></td>
              </tr>
              <tr>
                <td className="fw-bold font-mono">1</td>
                <td>&lt; 1%</td>
                <td>Small brown specks of pinhead size without sporulating centers</td>
                <td><span className="badge badge-risk-low">Resistant</span></td>
              </tr>
              <tr>
                <td className="fw-bold font-mono">2</td>
                <td>1 - 3%</td>
                <td>Slightly larger brown specks, few scattered</td>
                <td><span className="badge badge-risk-low">Moderately Resistant</span></td>
              </tr>
              <tr>
                <td className="fw-bold font-mono">3</td>
                <td>4 - 5%</td>
                <td>Small roundish necrotic grey spots, 1-2mm wide with brown margin</td>
                <td><span className="badge badge-risk-moderate">Mild Infection</span></td>
              </tr>
              <tr>
                <td className="fw-bold font-mono">4</td>
                <td>6 - 10%</td>
                <td>Typical spindle-shaped blast lesions, 1-2cm long, few on lower leaves</td>
                <td><span className="badge badge-risk-moderate">Moderate Symptoms</span></td>
              </tr>
              <tr>
                <td className="fw-bold font-mono">5</td>
                <td>11 - 25%</td>
                <td>Typical spindle-shaped lesions infecting less than 25% leaf area</td>
                <td><span className="badge badge-risk-moderate">Moderate-High</span></td>
              </tr>
              <tr>
                <td className="fw-bold font-mono">6</td>
                <td>26 - 50%</td>
                <td>Numerous coalescing lesions on upper leaves, 26-50% area necrotic</td>
                <td><span className="badge badge-risk-severe">Susceptible</span></td>
              </tr>
              <tr>
                <td className="fw-bold font-mono">7</td>
                <td>51 - 75%</td>
                <td>Lesions coalescing, occupying 51-75% leaf area; rapid death of lower leaves</td>
                <td><span className="badge badge-risk-severe">Highly Susceptible</span></td>
              </tr>
              <tr>
                <td className="fw-bold font-mono">8</td>
                <td>76 - 90%</td>
                <td>Extensive lesions coalescing, all leaves dead or dying</td>
                <td><span className="badge badge-risk-severe">Very Severe Blight</span></td>
              </tr>
              <tr>
                <td className="fw-bold text-danger font-mono">9</td>
                <td>&gt; 90%</td>
                <td>Total collapse; all leaves dead, field lodging</td>
                <td><span className="badge badge-risk-severe">Crop Failure</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBasePage;
