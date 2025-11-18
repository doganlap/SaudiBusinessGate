import React, { useState, useEffect } from 'react';
import './PMOInteractiveStory.css';

/**
 * ==========================================
 * PMO INTERACTIVE STORY — DEMO
 * ==========================================
 * 
 * An interactive training/demo tool for PMO scenarios.
 * Features:
 * - Multiple scenario scenes (Delay, Cost, Dispute, Reporting)
 * - Role-based views
 * - Timeline simulation
 * - Interactive decision-making
 * - Real-time portfolio impact visualization
 */

const PMOInteractiveStory = () => {
  const [state, setState] = useState({
    role: 'PMO Director',
    week: 8,
    projects: 18,
    budgetUtil: 72,
    spi: 0.93,
    cpi: 0.98,
    claimsOpen: 5,
    claimExposure: 3.9,
    activeScene: 'overview',
    topProjects: [
      { name: 'AL-KHOBAR Dockyard', issue: 'Delay' },
      { name: 'Riyadh Hangar', issue: 'Cost' }
    ]
  });

  const [log, setLog] = useState([
    'System initialized. Sample portfolio loaded (18 projects)',
    'Interactive PMO story ready. Try the scenarios on the left and change roles to see different effects.'
  ]);
  const [modal, setModal] = useState({ show: false, title: '', body: '' });
  const [delayStrategy, setDelayStrategy] = useState('negotiate');
  const [contingency, setContingency] = useState(150000);
  const [claimAction, setClaimAction] = useState('accept');
  const [evidence, setEvidence] = useState(45);
  const [tiaInclude, setTiaInclude] = useState(true);
  const [costInclude, setCostInclude] = useState(true);
  const [arbitApproach, setArbitApproach] = useState('mediate');
  const [recipients, setRecipients] = useState('ceo@company.com,pm@company.com');
  const [freq, setFreq] = useState('Weekly');

  const addLog = (msg) => {
    setLog(prev => [`[Week ${state.week}] ${msg}`, ...prev]);
  };

  const setScene = (scene) => {
    setState(prev => ({ ...prev, activeScene: scene }));
    addLog(`Switched to scene: ${scene}`);
  };

  const sceneText = (scene) => {
    const texts = {
      overview: 'Watch the simulated portfolio. Use the timeline and role controls to see different outcomes.',
      delay: 'AL-KHOBAR Dockyard: material shipment lag. Select a strategy and apply to see impacts.',
      cost: 'Subcontractor submitted claim that exceeds verified progress. Choose dispute approach.',
      dispute: 'Assemble arbitration case — build bundle and simulate the hearing.',
      reporting: 'Generate the weekly PMO snapshot and auto-email it to recipients.'
    };
    return texts[scene] || '';
  };

  const buildChart = (values, labels) => {
    const max = Math.max(...values.map(v => Math.abs(v)), 1);
    return values.map((v, i) => {
      const h = Math.max(6, Math.round((Math.abs(v) / max) * 100));
      return { height: h, label: labels[i], value: v };
    });
  };

  const scheduleChartData = buildChart([90, 80, 95, 70, 60, 85, 92], ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7']);
  const costChartData = buildChart([72, 86, 58, 94], ['Q1', 'Q2', 'Q3', 'Q4']);
  const miniCostChartData = buildChart([72, 88, 66, 95], ['B', 'F', 'A', 'R']);

  const handleSimulate = () => {
    const deltaSPI = (Math.random() - 0.4) * 0.02;
    const deltaCPI = (Math.random() - 0.3) * 0.02;
    setState(prev => ({
      ...prev,
      spi: Math.max(0.6, Math.min(1.2, prev.spi + deltaSPI)),
      cpi: Math.max(0.6, Math.min(1.2, prev.cpi + deltaCPI))
    }));
    addLog(`Simulated portfolio impact by role ${state.role}. SPI -> ${(state.spi + deltaSPI).toFixed(2)}, CPI -> ${(state.cpi + deltaCPI).toFixed(2)}`);
  };

  const applyDelayStrategy = () => {
    let outcome = { scheduleShift: 0, costImpact: 0, claimRisk: 'Medium', notes: '' };
    
    if (delayStrategy === 'negotiate') {
      outcome = { scheduleShift: 12, costImpact: contingency * 0.5, claimRisk: 'Low', notes: 'Negotiate extension and partial acceleration. Resequence critical path.' };
      setState(prev => ({ ...prev, spi: prev.spi + 0.03 }));
    } else if (delayStrategy === 'force') {
      outcome = { scheduleShift: 25, costImpact: contingency * 0.2, claimRisk: 'High', notes: 'Force majeure accepted — risk of dispute and long negotiations.' };
      setState(prev => ({ ...prev, spi: prev.spi - 0.05 }));
    } else if (delayStrategy === 'accelerate') {
      outcome = { scheduleShift: 0, costImpact: contingency * 2, claimRisk: 'Medium-High', notes: 'Approve costly acceleration; short-term schedule recovery at high cost.' };
      setState(prev => ({ ...prev, spi: prev.spi + 0.06, cpi: prev.cpi - 0.08 }));
    } else if (delayStrategy === 'workaround') {
      outcome = { scheduleShift: 6, costImpact: contingency * 0.8, claimRisk: 'Low-Medium', notes: 'Local workaround implemented; limited rework risk.' };
      setState(prev => ({ ...prev, spi: prev.spi + 0.02 }));
    }
    
    addLog(`Applied delay strategy "${delayStrategy}" — schedule shift ${outcome.scheduleShift} days, cost impact $${outcome.costImpact.toLocaleString()}`);
    return outcome;
  };

  const applyClaimAction = () => {
    let result = { costDelta: 0, daysImpact: 0, claimStatus: 'Open', notes: '' };
    
    if (claimAction === 'accept') {
      result = { costDelta: 420000, daysImpact: 0, claimStatus: 'Paid (partial)', notes: 'Partial acceptance to maintain progress cashflow.' };
      setState(prev => ({ ...prev, cpi: prev.cpi - 0.02 }));
    } else if (claimAction === 'dispute') {
      result = { costDelta: -126000, daysImpact: 10, claimStatus: 'Disputed', notes: evidence < 50 ? 'Low evidence — dispute recommended' : 'Evidence moderate — prepare negotiation' };
      setState(prev => ({ ...prev, cpi: prev.cpi + 0.01 }));
    } else if (claimAction === 'audit') {
      result = { costDelta: 0, daysImpact: 14, claimStatus: 'Audit in progress', notes: 'Independent audit will confirm entitlement.' };
    } else if (claimAction === 'hold') {
      result = { costDelta: -126000, daysImpact: 21, claimStatus: 'Held', notes: 'Hold payment pending recovery plan.' };
      setState(prev => ({ ...prev, cpi: prev.cpi + 0.005 }));
    }
    
    addLog(`Claim action "${claimAction}" executed. Status: ${result.claimStatus}. Cost delta ${result.costDelta >= 0 ? '+' : ''}$${result.costDelta.toLocaleString()}`);
    return result;
  };

  const buildBundle = () => {
    addLog(`Arbitration bundle built. Approach: ${arbitApproach}`);
  };

  const generateReport = () => {
    const preview = `Report (${freq}) — Week ${state.week}\nSPI: ${state.spi.toFixed(2)} | CPI: ${state.cpi.toFixed(2)}\nOpen Claims: ${state.claimsOpen}\nTop Issues: ${state.topProjects.map(p => p.name + ' (' + p.issue + ')').join(', ')}`;
    addLog(`Report generated & emailed to: ${recipients}`);
    setModal({ show: true, title: 'Report Preview', body: `<pre style="white-space:pre-wrap;color:#cfe9ff">${preview}</pre>` });
  };

  const handleRunAction = () => {
    if (state.activeScene === 'delay') {
      applyDelayStrategy();
    } else if (state.activeScene === 'cost') {
      applyClaimAction();
    } else if (state.activeScene === 'dispute') {
      buildBundle();
    } else if (state.activeScene === 'reporting') {
      generateReport();
    } else {
      addLog('No specific recommended action for Overview. Try Simulate Impact.');
      alert('Try selecting a scenario (Delay, Cost, Dispute, Reporting) and then Run Recommended Action.');
    }
  };

  const roles = ['PMO Director', 'Project Controls Manager', 'Senior Planning Engineer', 'Senior Cost Control Engineer', 'Claims Consultant', 'Reporting Specialist'];
  const scenes = [
    { id: 'overview', label: 'Overview & Dashboard' },
    { id: 'delay', label: 'Delay Alert — AL-KHOBAR Dockyard' },
    { id: 'cost', label: 'Cost Overrun & Claim' },
    { id: 'dispute', label: 'Dispute / Arbitration' },
    { id: 'reporting', label: 'Reporting Automation' }
  ];

  const [delayOutcome, setDelayOutcome] = useState(null);
  const [claimOutcome, setClaimOutcome] = useState(null);
  const [bundlePreview, setBundlePreview] = useState('No bundle built yet.');

  return (
    <div className="pmo-story">
      <header>
        <div className="logo">PMO</div>
        <div>
          <h1>PMO Interactive Story — Demo</h1>
          <p className="lead">Explore scenarios, make decisions, and watch the portfolio react in real time.</p>
        </div>
        <div style={{ marginLeft: 'auto' }} className="small">
          Role: <span className="badge">{state.role}</span>
        </div>
      </header>

      <div className="container">
        <aside className="panel" style={{ height: 'calc(100vh - 140px)', overflow: 'auto' }}>
          <h3>Story Scenes</h3>
          <nav id="scenes">
            {scenes.map(scene => (
              <div
                key={scene.id}
                className={`menu-item ${state.activeScene === scene.id ? 'selected' : ''}`}
                onClick={() => setScene(scene.id)}
              >
                {scene.label}
              </div>
            ))}
          </nav>

          <hr style={{ border: 'none', height: '1px', background: 'rgba(255,255,255,0.03)', margin: '12px 0' }} />

          <h3>Choose Role</h3>
          <div className="roles">
            {roles.map(role => (
              <div
                key={role}
                className={`role ${state.role === role ? 'active' : ''}`}
                onClick={() => {
                  setState(prev => ({ ...prev, role }));
                  addLog(`Role switched to ${role}`);
                }}
              >
                {role}
              </div>
            ))}
          </div>

          <hr style={{ border: 'none', height: '1px', background: 'rgba(255,255,255,0.03)', margin: '12px 0' }} />

          <h3>Scenario Controls</h3>
          <div className="small">Timeline (weeks)</div>
          <div className="timeline">
            <input
              type="range"
              min="0"
              max="24"
              value={state.week}
              onChange={(e) => setState(prev => ({ ...prev, week: parseInt(e.target.value) }))}
            />
            <div className="badge">Week {state.week}</div>
          </div>

          <div style={{ marginTop: '12px' }}>
            <button className="cta" onClick={handleRunAction}>Run Recommended Action</button>
            <button className="small-btn" onClick={() => {
              const playbookContent = `
                <div class="mini"><strong>Delay — Negotiate</strong>: Request confirmation from supplier, resequence works, track TIA.</div>
                <div class="mini" style="margin-top:6px"><strong>Cost — Dispute</strong>: Hold 30% pending evidence & audit within 14 days.</div>
                <div class="mini" style="margin-top:6px"><strong>Arbitration</strong>: Prepare TIA, financial quant, and contemporaneous records.</div>
              `;
              setModal({ show: true, title: 'Response Playbook', body: playbookContent });
            }} style={{ marginLeft: '8px' }}>Open Response Playbook</button>
          </div>

          <hr style={{ border: 'none', height: '1px', background: 'rgba(255,255,255,0.03)', margin: '12px 0' }} />

          <h3>Live Log</h3>
          <div className="log">
            {log.map((msg, i) => (
              <div key={i} className="mini" style={{ marginTop: i > 0 ? '6px' : '0' }}>{msg}</div>
            ))}
          </div>
        </aside>

        <main className="panel" style={{ height: 'calc(100vh - 140px)', overflow: 'auto' }}>
          {/* Overview Scene */}
          {state.activeScene === 'overview' && (
            <section className="scene active">
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div className="small">Portfolio Snapshot</div>
                  <div className="stat">
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div className="num">{state.projects}</div>
                      <div className="small">Active projects</div>
                    </div>
                    <div style={{ width: '12px' }}></div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div className="stat">
                        <div className="num">{state.budgetUtil}%</div>
                        <div className="small">Budget Utilization</div>
                      </div>
                      <div className="stat">
                        <div className="num">{state.spi.toFixed(2)}</div>
                        <div className="small">SPI</div>
                      </div>
                      <div className="stat">
                        <div className="num">{state.cpi.toFixed(2)}</div>
                        <div className="small">CPI</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ minWidth: '360px' }}>
                  <div className="small">Top Variance Projects</div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <div style={{ flex: 1 }} className="badge center">{state.topProjects[0].name} — {state.topProjects[0].issue}</div>
                    <div style={{ flex: 1 }} className="badge center">{state.topProjects[1].name} — {state.topProjects[1].issue}</div>
                  </div>
                </div>
              </div>

              <hr style={{ margin: '14px 0', border: 'none', height: '1px', background: 'rgba(255,255,255,0.03)' }} />

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div className="small">Schedule Health (portfolio)</div>
                  <div className="chart">
                    {scheduleChartData.map((bar, i) => (
                      <div key={i} className="bar" style={{ height: `${bar.height}%` }} title={`${bar.label} — ${bar.value}`}>
                        {bar.label.slice(0, 3)}
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div className="small">Claims Tracker (value & risk)</div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        <div className="badge">Open: {state.claimsOpen}</div>
                        <div className="badge">High Risk: 2</div>
                        <div className="badge">Total Exposure: ${state.claimExposure}M</div>
                      </div>
                    </div>
                    <div style={{ width: '220px' }}>
                      <div className="small">Portfolio Forecast</div>
                      <div className="chart">
                        {costChartData.map((bar, i) => (
                          <div key={i} className="bar" style={{ height: `${bar.height}%` }} title={`${bar.label} — ${bar.value}`}>
                            {bar.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ width: '320px' }}>
                  <div className="small">Active Scenario</div>
                  <div className="card" style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', marginTop: '8px' }}>
                    <div style={{ fontWeight: 700 }}>{scenes.find(s => s.id === state.activeScene)?.label}</div>
                    <div className="mini">{sceneText(state.activeScene)}</div>
                    <div style={{ marginTop: '10px' }}>
                      <button className="small-btn" onClick={handleSimulate}>Simulate Impact</button>
                    </div>
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <div className="small">Quick Actions</div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                      <button className="small-btn" onClick={() => { addLog('Project AL-KHOBAR escalated to Executive — partial contingency approved.'); alert('Escalation sent to Executive.'); }}>Escalate Project</button>
                      <button className="small-btn" onClick={() => { addLog('Requested supporting documents from contractor. 14-day SLA.'); alert('Document request sent.'); }}>Request Docs</button>
                      <button className="small-btn" onClick={() => { addLog('New claim opened for assessment ($100k initial estimate).'); alert('Claim opened in tracker.'); }}>Open Claim</button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Delay Scene */}
          {state.activeScene === 'delay' && (
            <section className="scene">
              <h2>Delay Alert — AL-KHOBAR Dockyard</h2>
              <p className="small">Material shipment lag flagged: potential 25-day delay. Choose response & test outcomes.</p>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <div style={{ flex: 1 }} className="card">
                  <div style={{ fontWeight: 700 }}>Situation</div>
                  <div className="mini" style={{ marginTop: '8px' }}>Critical long-lead item delayed at port. Contractor requests extension and acceleration proposal.</div>

                  <div style={{ marginTop: '12px' }}>
                    <label className="small">Select Response Strategy</label>
                    <select value={delayStrategy} onChange={(e) => setDelayStrategy(e.target.value)}>
                      <option value="negotiate">Negotiate extension + partial acceleration</option>
                      <option value="force">Force majeure claim & extend</option>
                      <option value="accelerate">Approve acceleration (costly)</option>
                      <option value="workaround">Implement local workaround & resequence works</option>
                    </select>
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <label className="small">Allocate Contingency ($)</label>
                    <input type="number" value={contingency} onChange={(e) => setContingency(Number(e.target.value))} />
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <button className="cta" onClick={() => {
                      const outcome = applyDelayStrategy();
                      setDelayOutcome(outcome);
                    }}>Apply Strategy</button>
                    <button className="small-btn" onClick={() => setModal({ show: true, title: 'Delay Analysis (TIA)', body: '<div class="mini">Time Impact Analysis report (simulated)</div>' })}>Open Delay Analysis (TIA)</button>
                  </div>
                </div>

                <div style={{ width: '420px' }} className="card">
                  <div style={{ fontWeight: 700 }}>Projected Outcomes</div>
                  <div style={{ marginTop: '10px' }}>
                    {delayOutcome ? (
                      <>
                        <div><strong>Schedule shift:</strong> +{delayOutcome.scheduleShift} days</div>
                        <div><strong>Cost impact:</strong> ${delayOutcome.costImpact.toLocaleString()}</div>
                        <div><strong>Claims risk:</strong> {delayOutcome.claimRisk}</div>
                        <div className="mini" style={{ marginTop: '8px' }}>{delayOutcome.notes}</div>
                      </>
                    ) : (
                      <div className="mini">Choose a strategy to see simulated results: schedule change, cost impact, claims risk.</div>
                    )}
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <div className="small">Timeline visualization</div>
                    <div className="chart">
                      {buildChart([100, 85, 70, 55, 45], ['T-4', 'T0', '+4', '+8', '+12']).map((bar, i) => (
                        <div key={i} className="bar" style={{ height: `${bar.height}%` }}>{bar.label}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Cost Scene */}
          {state.activeScene === 'cost' && (
            <section className="scene">
              <h2>Cost Overrun & Claim</h2>
              <p className="small">Electrical subcontractor claim exceeds reported progress. You can accept, dispute, or ask for evidence.</p>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <div style={{ flex: 1 }} className="card">
                  <div style={{ fontWeight: 700 }}>Claim Summary</div>
                  <div className="mini" style={{ marginTop: '8px' }}>Claim amount: $420,000 — progress reported 78% vs verified 66%.</div>

                  <div style={{ marginTop: '12px' }}>
                    <label className="small">Action</label>
                    <select value={claimAction} onChange={(e) => setClaimAction(e.target.value)}>
                      <option value="accept">Accept and pay partial</option>
                      <option value="dispute">Dispute and request evidence</option>
                      <option value="audit">Trigger independent audit</option>
                      <option value="hold">Hold payment pending recovery plan</option>
                    </select>
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <label className="small">Evidence confidence</label>
                    <input type="range" min="0" max="100" value={evidence} onChange={(e) => setEvidence(Number(e.target.value))} />
                    <div className="mini">{evidence}% confidence</div>
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <button className="cta" onClick={() => {
                      const result = applyClaimAction();
                      setClaimOutcome(result);
                    }}>Execute Action</button>
                    <button className="small-btn" onClick={() => setModal({ show: true, title: 'Evidence Folder', body: '<div class="mini">Evidence documents (simulated)</div>' })}>Open Evidence Folder</button>
                  </div>
                </div>

                <div style={{ width: '420px' }} className="card">
                  <div style={{ fontWeight: 700 }}>Financial Impact</div>
                  <div className="mini" style={{ marginTop: '8px' }}>
                    {claimOutcome ? (
                      <>
                        <div><strong>Financial change:</strong> ${claimOutcome.costDelta.toLocaleString()}</div>
                        <div><strong>Schedule impact:</strong> +{claimOutcome.daysImpact} days</div>
                        <div className="mini" style={{ marginTop: '6px' }}>{claimOutcome.notes}</div>
                      </>
                    ) : (
                      'Select action to simulate cost & schedule impacts.'
                    )}
                  </div>
                  <div style={{ marginTop: '12px' }} className="chart">
                    {claimOutcome && buildChart([Math.abs(claimOutcome.costDelta / 1000), 200, 300], ['Claim', 'Contingency', 'Other']).map((bar, i) => (
                      <div key={i} className="bar" style={{ height: `${bar.height}%` }}>{bar.label}</div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Dispute Scene */}
          {state.activeScene === 'dispute' && (
            <section className="scene">
              <h2>Dispute & Arbitration</h2>
              <p className="small">Dockyard Expansion Phase II — unresolved claim escalated to arbitration.</p>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <div style={{ flex: 1 }} className="card">
                  <div style={{ fontWeight: 700 }}>Assemble Case</div>
                  <div className="mini" style={{ marginTop: '8px' }}>Add items to the arbitration bundle (time analysis, cost records, evidence logs).</div>
                  <div className="form-row">
                    <label style={{ width: '120px' }}>Include TIA?</label>
                    <input type="checkbox" checked={tiaInclude} onChange={(e) => setTiaInclude(e.target.checked)} />
                  </div>
                  <div className="form-row">
                    <label style={{ width: '120px' }}>Cost Quantification?</label>
                    <input type="checkbox" checked={costInclude} onChange={(e) => setCostInclude(e.target.checked)} />
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <label className="small">Choose Approach</label>
                    <select value={arbitApproach} onChange={(e) => setArbitApproach(e.target.value)}>
                      <option value="mediate">Mediation attempt</option>
                      <option value="litigate">Proceed to arbitration</option>
                      <option value="settle">Settle with structured payments</option>
                    </select>
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <button className="cta" onClick={() => {
                      buildBundle();
                      setBundlePreview(`Bundle built: TIA=${tiaInclude ? 'Yes' : 'No'}, CostQuant=${costInclude ? 'Yes' : 'No'}, Approach=${arbitApproach}`);
                    }}>Build Arbitration Bundle</button>
                  </div>
                </div>

                <div style={{ width: '420px' }} className="card">
                  <div style={{ fontWeight: 700 }}>Arbitration Bundle Preview</div>
                  <div className="mini" style={{ marginTop: '8px' }}>{bundlePreview}</div>
                  <div style={{ marginTop: '10px' }}>
                    <button className="small-btn" onClick={() => setModal({ show: true, title: 'Export Bundle', body: '<div class="mini">Bundle prepared — downloadable ZIP (simulated).</div>' })}>Export Bundle (ZIP)</button>
                    <button className="small-btn" onClick={() => {
                      const outcomes = ['Favourable', 'Partial Award', 'Unfavourable'];
                      const pick = outcomes[Math.floor(Math.random() * outcomes.length)];
                      setModal({ show: true, title: 'Hearing Simulation', body: `<div class="mini">Simulated outcome: <strong>${pick}</strong></div><div class="mini" style="margin-top:8px">Notes: This is a probabilistic simulation — real hearings vary widely.</div>` });
                      addLog(`Hearing simulated — result: ${pick}`);
                    }}>Simulate Hearing Outcome</button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Reporting Scene */}
          {state.activeScene === 'reporting' && (
            <section className="scene">
              <h2>Reporting Automation</h2>
              <p className="small">Demo of weekly automated report generation and email broadcast.</p>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <div style={{ flex: 1 }} className="card">
                  <div style={{ fontWeight: 700 }}>Report Settings</div>
                  <div style={{ marginTop: '8px' }} className="mini">Choose recipients & frequency</div>
                  <div style={{ marginTop: '8px' }}>
                    <label className="small">Recipients (comma separated)</label>
                    <input value={recipients} onChange={(e) => setRecipients(e.target.value)} />
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    <label className="small">Frequency</label>
                    <select value={freq} onChange={(e) => setFreq(e.target.value)}>
                      <option>Weekly</option>
                      <option>Bi-weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <button className="cta" onClick={generateReport}>Generate & Email</button>
                    <button className="small-btn" onClick={() => {
                      const preview = `Report (${freq}) — Week ${state.week}\nSPI: ${state.spi.toFixed(2)} | CPI: ${state.cpi.toFixed(2)}\nOpen Claims: ${state.claimsOpen}\nTop Issues: ${state.topProjects.map(p => p.name + ' (' + p.issue + ')').join(', ')}`;
                      setModal({ show: true, title: 'Report Preview', body: `<pre style="white-space:pre-wrap;color:#cfe9ff">${preview}</pre>` });
                    }}>Preview PDF</button>
                  </div>
                </div>

                <div style={{ width: '420px' }} className="card">
                  <div style={{ fontWeight: 700 }}>Preview</div>
                  <div className="mini" style={{ marginTop: '8px' }}>
                    {modal.show && modal.title === 'Report Preview' ? modal.body : 'No report generated yet.'}
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <div className="small">KPIs</div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                      <div className="badge">SPI: {state.spi.toFixed(2)}</div>
                      <div className="badge">CPI: {state.cpi.toFixed(2)}</div>
                      <div className="badge">Claims Open: {state.claimsOpen}</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>

        <aside className="panel" style={{ height: 'calc(100vh - 140px)', overflow: 'auto' }}>
          <h3>Quick Dashboard</h3>
          <div style={{ marginTop: '8px' }}>
            <div className="small">Budget vs Forecast</div>
            <div className="chart">
              {miniCostChartData.map((bar, i) => (
                <div key={i} className="bar" style={{ height: `${bar.height}%` }}>{bar.label}</div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '12px' }}>
            <div className="small">Open Actions</div>
            <div style={{ marginTop: '8px' }}>
              <div className="mini">1. AL-KHOBAR: Approve contingency (Assigned: Planning)</div>
              <div className="mini">2. Riyadh Hangar: Audit claim (Assigned: Cost Control)</div>
              <div className="mini">3. Dockyard: Legal review (Assigned: Claims)</div>
            </div>
          </div>

          <hr style={{ border: 'none', height: '1px', background: 'rgba(255,255,255,0.03)', margin: '12px 0' }} />
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="small">Response Playbook</div>
            </div>
            <div style={{ marginTop: '8px' }}>
              <div className="mini"><strong>Delay — Negotiate</strong>: Request confirmation from supplier, resequence works, track TIA.</div>
              <div className="mini" style={{ marginTop: '6px' }}><strong>Cost — Dispute</strong>: Hold 30% pending evidence & audit within 14 days.</div>
              <div className="mini" style={{ marginTop: '6px' }}><strong>Arbitration</strong>: Prepare TIA, financial quant, and contemporaneous records.</div>
            </div>
          </div>
        </aside>
      </div>

      <footer>
        Demo built for PMO module training — interactive scenarios and simulated outcomes.
      </footer>

      {modal.show && (
        <div className="modal show" onClick={() => setModal({ show: false, title: '', body: '' })}>
          <div className="card-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700 }}>{modal.title}</div>
              <button className="small-btn" onClick={() => setModal({ show: false, title: '', body: '' })}>Close</button>
            </div>
            <div style={{ marginTop: '12px' }} dangerouslySetInnerHTML={{ __html: modal.body }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PMOInteractiveStory;

