import React from 'react';

const KnowledgeBasePage = () => {
  return (
    <div className="container px-4 py-4">
      <div className="mb-4 pb-2 border-bottom">
        <h2 className="fw-bold mb-1 text-dark">Agro-Epidemiological Knowledge Base</h2>
        <p className="text-muted mb-0">
          Documented biological rules, conducive microclimatic thresholds &bull; TNAU & IRRI Reference Standards
        </p>
      </div>

      <div className="row g-4">
        {/* Rice Blast Card */}
        <div className="col-12 col-lg-6">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-header bg-success-subtle text-success-emphasis py-3">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-virus me-2"></i> Rice Blast (<em>Magnaporthe oryzae</em>)
              </h5>
              <div className="small text-muted">Anamorph: <em>Pyricularia oryzae</em> &bull; Phylum: Ascomycota</div>
            </div>
            <div className="card-body">
              <h6 className="fw-bold text-dark">Conducive Weather Criteria (TNAU Guidelines)</h6>
              <ul className="small text-secondary mb-3">
                <li><strong>Night Temperature (T<sub>min</sub>):</strong> Optimal between 20.0°C and 24.0°C. Blast sporulation is severely suppressed below 16°C or above 28°C.</li>
                <li><strong>Relative Humidity (RH):</strong> Critical threshold &ge; 90% (particularly morning relative humidity at 07:00 IST).</li>
                <li><strong>Leaf Wetness Duration:</strong> &ge; 10–12 continuous hours (dew deposition on foliage).</li>
                <li><strong>Cloud Cover & Skies:</strong> Overcast days, low solar insolation (&lt; 14 MJ/m<sup>2</sup>/day), and intermittent light drizzles.</li>
              </ul>

              <h6 className="fw-bold text-dark">Symptom Morphology & Vulnerable Stages</h6>
              <p className="small text-secondary mb-3">
                <strong>Leaf Blast:</strong> Diamond- or spindle-shaped lesions with gray-whitish centers and dark brown-reddish borders, predominantly during the <em>Tillering</em> stage.<br />
                <strong>Neck / Panicle Blast:</strong> Blackish-brown necrotic lesions at the panicle base leading to chaffy grains and lodging, common during <em>Heading and Flowering</em>.
              </p>

              <div className="p-3 bg-light rounded small">
                <strong>Prophylactic Surveillance Directive:</strong> In high-risk zones, advise early scouting in nursery and tillering fields. Recommend balanced nitrogen split applications (avoid excess top-dressing during dew spells).
              </div>
            </div>
          </div>
        </div>

        {/* Brown Spot Card */}
        <div className="col-12 col-lg-6">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-header bg-warning-subtle text-warning-emphasis py-3">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-circle-half me-2"></i> Brown Spot (<em>Bipolaris oryzae</em>)
              </h5>
              <div className="small text-muted">Teleomorph: <em>Cochliobolus miyabeanus</em> &bull; Phylum: Ascomycota</div>
            </div>
            <div className="card-body">
              <h6 className="fw-bold text-dark">Conducive Weather Criteria (TNAU / ICAR Guidelines)</h6>
              <ul className="small text-secondary mb-3">
                <li><strong>Ambient Temperature (T<sub>avg</sub>):</strong> Optimal between 25.0°C and 30.0°C (mean ~28.0°C).</li>
                <li><strong>Relative Humidity (RH):</strong> &ge; 85% sustained throughout tillering and grain filling.</li>
                <li><strong>Soil & Nutrient Stress:</strong> Aggravated by light sandy soils deficient in potassium (K) or silicon (Si), or fields experiencing intermittent drought spells followed by heavy monsoon showers.</li>
                <li><strong>Leaf Wetness:</strong> &ge; 8 hours required for conidial germination.</li>
              </ul>

              <h6 className="fw-bold text-dark">Symptom Morphology & Vulnerable Stages</h6>
              <p className="small text-secondary mb-3">
                Produces circular to oval dark brown spots on coleoptiles, leaves, and glumes. Lesions resemble sesame seeds. In severe attacks, spots coalesce, causing seedling blight and poor grain filling from <em>maximum tillering to milk stage</em>.
              </p>

              <div className="p-3 bg-light rounded small">
                <strong>Prophylactic Surveillance Directive:</strong> Prioritize soil fertility checks and ensure adequate potash application. In vulnerable blocks, scout water-stressed upland or rainfed tank-fed tracts.
              </div>
            </div>
          </div>
        </div>

        {/* IRRI SES Reference Table */}
        <div className="col-12">
          <div className="card shadow-sm border-0 p-4">
            <h5 className="fw-bold mb-3 text-dark">
              <i className="bi bi-rulers me-2"></i> IRRI Standard Evaluation System (SES) for Rice
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
                    <td className="fw-bold text-success">0</td>
                    <td>0%</td>
                    <td>No lesions observed; healthy foliage</td>
                    <td><span className="badge bg-success">Immune / Highly Resistant</span></td>
                  </tr>
                  <tr>
                    <td className="fw-bold">1</td>
                    <td>&lt; 1%</td>
                    <td>Small brown specks of pin-point size (&lt; 0.5 mm)</td>
                    <td><span className="badge bg-info text-dark">Resistant</span></td>
                  </tr>
                  <tr>
                    <td className="fw-bold">2</td>
                    <td>1 - 3%</td>
                    <td>Larger brown specks without necrotic center</td>
                    <td><span className="badge bg-info text-dark">Moderately Resistant</span></td>
                  </tr>
                  <tr>
                    <td className="fw-bold text-warning">3 - 4</td>
                    <td>4 - 10%</td>
                    <td>Typical spindle-shaped lesions; grey center</td>
                    <td><span className="badge bg-warning text-dark">Moderately Susceptible</span></td>
                  </tr>
                  <tr>
                    <td className="fw-bold text-danger">5 - 6</td>
                    <td>11 - 25%</td>
                    <td>Typical spindle lesions coalescing across leaf blade</td>
                    <td><span className="badge bg-danger">Susceptible</span></td>
                  </tr>
                  <tr>
                    <td className="fw-bold text-danger">7 - 9</td>
                    <td>&gt; 25%</td>
                    <td>Extensive coalescing, leaves killed, lodging observed</td>
                    <td><span className="badge bg-dark">Highly Susceptible</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBasePage;
