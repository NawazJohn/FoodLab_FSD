import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity,
  Award,
  Beaker,
  Boxes,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Cpu,
  Database,
  Download,
  FileCheck2,
  FileText,
  Filter,
  FlaskConical,
  Info,
  LayoutDashboard,
  Layers,
  Microscope,
  Plus,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TestTube2,
  XCircle,
  Zap,
} from 'lucide-react';
import './styles.css';

const API = 'http://localhost:5000/api';

async function api(path, options = {}) {
  const r = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function StatusBadge({ value }) {
  const v = String(value || 'Pending');
  const cls = v.toLowerCase().replaceAll(' ', '-');
  return (
    <span className={`status ${cls}`}>
      {v === 'Pass' && <CheckCircle2 size={12} />}
      {v === 'Fail' && <XCircle size={12} />}
      {v === 'Approved' && <CheckCircle2 size={12} />}
      {v === 'Hold' && <ShieldAlert size={12} />}
      {v}
    </span>
  );
}

function App() {
  const [page, setPage] = useState('dashboard');
  const [health, setHealth] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [batches, setBatches] = useState([]);
  const [samples, setSamples] = useState([]);
  const [tests, setTests] = useState([]);
  const [reports, setReports] = useState([]);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Modals
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [showSampleForm, setShowSampleForm] = useState(false);
  const [showTestForm, setShowTestForm] = useState(false);
  const [selectedTestForEdit, setSelectedTestForEdit] = useState(null);
  const [selectedCOABatch, setSelectedCOABatch] = useState(null);
  const [showMernModal, setShowMernModal] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [h, d, b, s, t, r] = await Promise.all([
        api('/health').catch(() => null),
        api('/dashboard'),
        api('/batches'),
        api('/samples'),
        api('/tests'),
        api('/reports'),
      ]);
      setHealth(h);
      setDashboard(d);
      setBatches(b);
      setSamples(s);
      setTests(t);
      setReports(r);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateBatchStatus = async (batchId, status) => {
    try {
      await api(`/batches/${batchId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleResetSeed = async () => {
    if (!window.confirm('Reset database with standard food laboratory seed records?')) return;
    try {
      await api('/seed', { method: 'POST' });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredBatches = batches.filter((b) =>
    [b.batch_code, b.product_name, b.category, b.status].some((f) =>
      String(f || '').toLowerCase().includes(query.toLowerCase())
    )
  );

  const filteredSamples = samples.filter((s) =>
    [s.sample_code, s.batch_code, s.product_name, s.sample_type, s.status].some((f) =>
      String(f || '').toLowerCase().includes(query.toLowerCase())
    )
  );

  const filteredTests = tests.filter((t) => {
    const matchesSearch = [t.test_name, t.category, t.sample_code, t.batch_code, t.status].some((f) =>
      String(f || '').toLowerCase().includes(query.toLowerCase())
    );
    const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <FlaskConical size={24} />
          </div>
          <div className="brand-text">
            <strong>FoodLab</strong>
            <small>Laboratory Management</small>
            <div className="mern-badge-pill">
              <span>MERN STACK</span>
            </div>
          </div>
        </div>

        <div className="nav-title">WORKSPACE</div>
        <Nav icon={<LayoutDashboard />} text="Dashboard" active={page === 'dashboard'} onClick={() => setPage('dashboard')} />
        <Nav icon={<Boxes />} text="10-Product Intake" count={10} active={page === 'multi-product-10'} onClick={() => setPage('multi-product-10')} />
        <Nav icon={<Boxes />} text="Batches" count={batches.length} active={page === 'batches'} onClick={() => setPage('batches')} />
        <Nav icon={<TestTube2 />} text="Samples" count={samples.length} active={page === 'samples'} onClick={() => setPage('samples')} />
        <Nav icon={<Beaker />} text="Lab Tests" count={tests.length} active={page === 'tests'} onClick={() => setPage('tests')} />
        <Nav icon={<FileCheck2 />} text="Traceability & COA" active={page === 'reports'} onClick={() => setPage('reports')} />

        <div className="side-bottom">
          <div className="mern-status-widget">
            <div className="title">
              <span>System Stack</span>
              <span className={`live-indicator ${health?.database?.isMongoConnected ? '' : 'warn'}`}>
                <span className="pulse-dot" />
                {health?.database?.isMongoConnected ? 'MongoDB Live' : 'MERN Ready'}
              </span>
            </div>
            <div className="mern-stack-list">
              <span className="mern-tag" title="MongoDB">M</span>
              <span className="mern-tag" title="Express.js">E</span>
              <span className="mern-tag" title="React.js">R</span>
              <span className="mern-tag" title="Node.js">N</span>
            </div>
          </div>

          <button
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center', background: 'transparent', color: '#94a3b8', borderColor: '#334155' }}
            onClick={() => setShowMernModal(true)}
          >
            <Info size={14} /> MERN Tech Stack
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="main">
        {/* TOPBAR */}
        <header className="topbar">
          <div className="topbar-info">
            <h1>
              {page === 'dashboard' && 'Laboratory Quality Dashboard'}
              {page === 'multi-product-10' && '⚡ 10-Product Batch Production Intake (Take 10 Inputs at Once)'}
              {page === 'batches' && 'Production Batches Management'}
              {page === 'samples' && 'Laboratory Samples Intake'}
              {page === 'tests' && 'Chemical & Microbiological Testing Workbench'}
              {page === 'reports' && 'Compliance Traceability & COA Generator'}
            </h1>
            <p>Food Processing Quality Assurance, Chemical Analysis & Batch Traceability</p>
          </div>

          <div className="topbar-actions">
            <button className="btn-secondary" onClick={handleResetSeed} title="Reload default test dataset">
              <RefreshCw size={14} /> Reset Data
            </button>
            <button className="icon-btn" onClick={loadData} title="Refresh records">
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            </button>
          </div>
        </header>

        {/* MERN STACK ARCHITECTURE BANNER */}
        <div className="mern-banner">
          <div className="mern-banner-left">
            <div className="mern-banner-icon">
              <Database size={22} />
            </div>
            <div className="mern-banner-text">
              <b>Full MERN Stack Implementation</b>
              <p>
                MongoDB (Mongoose Schemas) • Express.js REST API • React.js UI • Node.js Runtime
              </p>
            </div>
          </div>
          <div className="mern-banner-chips">
            <span className={`chip ${health?.database?.isMongoConnected ? 'active-mongo' : ''}`}>
              🍃 MongoDB: {health?.database?.isMongoConnected ? 'Live Database' : 'In-Memory / Atlas Ready'}
            </span>
            <span className="chip">⚡ Express 5.1</span>
            <span className="chip">⚛️ React 19</span>
            <span className="chip">🟢 Node.js {health?.nodeVersion || 'v22'}</span>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <ShieldAlert size={18} />
            <div>
              <strong>Backend connection error:</strong> {error}. Make sure the Node server is running on port 5000.
            </div>
          </div>
        )}

        {/* PAGES */}
        {page === 'dashboard' && dashboard && (
          <DashboardView
            data={dashboard}
            setPage={setPage}
            onOpenTestEdit={(t) => setSelectedTestForEdit(t)}
          />
        )}

        {page === 'batches' && (
          <div className="section">
            <div className="section-head">
              <div>
                <h2>Production Batches</h2>
                <p>Register batches, monitor sample counts, and release/hold quality decisions</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button className="btn-rapid" onClick={() => setPage('multi-product-10')}>
                  <Boxes size={16} /> 10-Product Batch Intake
                </button>
                <button className="primary" onClick={() => setShowBatchForm(true)}>
                  <Plus size={16} /> New Batch
                </button>
              </div>
            </div>

            <div className="toolbar">
              <div className="search">
                <Search size={16} />
                <input
                  placeholder="Search batches by code, product, category..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Batch Code</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Production Date</th>
                    <th>Expiry Date</th>
                    <th>Samples</th>
                    <th>Tests</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBatches.length ? (
                    filteredBatches.map((b) => (
                      <tr key={b._id || b.id}>
                        <td><span className="code-cell">{b.batch_code}</span></td>
                        <td><b>{b.product_name}</b></td>
                        <td>{b.category || 'Processed Fruits'}</td>
                        <td>{b.production_date}</td>
                        <td>{b.expiry_date || '—'}</td>
                        <td><b>{b.sample_count}</b></td>
                        <td><b>{b.test_count}</b></td>
                        <td><StatusBadge value={b.status} /></td>
                        <td>
                          <div className="action-btn-group">
                            <button
                              className="btn-sm approve"
                              title="Approve for release"
                              onClick={() => handleUpdateBatchStatus(b._id || b.id, 'Approved')}
                            >
                              Approve
                            </button>
                            <button
                              className="btn-sm hold"
                              title="Put on hold"
                              onClick={() => handleUpdateBatchStatus(b._id || b.id, 'Hold')}
                            >
                              Hold
                            </button>
                            <button
                              className="btn-sm edit"
                              title="View Certificate of Analysis"
                              onClick={() => setSelectedCOABatch(b)}
                            >
                              COA
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="empty">No production batches found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {page === 'samples' && (
          <div className="section">
            <div className="section-head">
              <div>
                <h2>Laboratory Samples</h2>
                <p>Track raw materials, in-process tanks, and finished product samples</p>
              </div>
              <button className="primary" onClick={() => setShowSampleForm(true)}>
                <Plus size={16} /> Register Sample
              </button>
            </div>

            <div className="toolbar">
              <div className="search">
                <Search size={16} />
                <input
                  placeholder="Search samples by code, batch, type..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Sample Code</th>
                    <th>Batch</th>
                    <th>Product</th>
                    <th>Sample Type</th>
                    <th>Sampling Point</th>
                    <th>Collected Date</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSamples.length ? (
                    filteredSamples.map((s) => (
                      <tr key={s._id || s.id}>
                        <td><span className="code-cell">{s.sample_code}</span></td>
                        <td><span className="code-cell">{s.batch_code}</span></td>
                        <td>{s.product_name}</td>
                        <td><b>{s.sample_type}</b></td>
                        <td>{s.sampling_point || 'Line Station'}</td>
                        <td>{s.collected_at}</td>
                        <td>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            color: s.priority === 'Urgent' ? '#dc2626' : s.priority === 'High' ? '#d97706' : '#64748b'
                          }}>
                            {s.priority || 'Normal'}
                          </span>
                        </td>
                        <td><StatusBadge value={s.status} /></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="empty">No samples registered yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {page === 'tests' && (
          <div className="section">
            <div className="section-head">
              <div>
                <h2>Chemical & Quality Tests</h2>
                <p>Record laboratory measurements and evaluate compliance against food safety limits</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button className="btn-rapid" onClick={() => setPage('rapid-10')}>
                  <Zap size={16} /> 10-Parameter Rapid Intake
                </button>
                <button className="primary" onClick={() => setShowTestForm(true)}>
                  <Plus size={16} /> Add Test
                </button>
              </div>
            </div>

            <div className="toolbar">
              <div className="search">
                <Search size={16} />
                <input
                  placeholder="Search tests by parameter, sample, batch..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {['All', 'Chemical', 'Microbiological', 'Quality', 'Physical'].map((cat) => (
                  <button
                    key={cat}
                    className={`btn-secondary ${categoryFilter === cat ? 'active' : ''}`}
                    style={categoryFilter === cat ? { background: '#2563eb', color: 'white', borderColor: '#2563eb' } : {}}
                    onClick={() => setCategoryFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Test Parameter</th>
                    <th>Category</th>
                    <th>Sample</th>
                    <th>Batch</th>
                    <th>Result Value</th>
                    <th>Unit</th>
                    <th>Specification Range</th>
                    <th>Status</th>
                    <th>Tested At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTests.length ? (
                    filteredTests.map((t) => (
                      <tr key={t._id || t.id}>
                        <td><b>{t.test_name}</b></td>
                        <td>
                          <span style={{ fontSize: '11px', color: '#475569', fontWeight: '600' }}>
                            {t.category}
                          </span>
                        </td>
                        <td><span className="code-cell">{t.sample_code}</span></td>
                        <td><span className="code-cell">{t.batch_code}</span></td>
                        <td>
                          <b style={{ color: t.status === 'Fail' ? '#dc2626' : t.status === 'Pass' ? '#16a34a' : '#0f172a' }}>
                            {t.result_value || 'Pending'}
                          </b>
                        </td>
                        <td>{t.unit || '—'}</td>
                        <td>{t.specification || '—'}</td>
                        <td><StatusBadge value={t.status} /></td>
                        <td>{t.tested_at || 'Pending'}</td>
                        <td>
                          <button
                            className="btn-sm edit"
                            onClick={() => setSelectedTestForEdit(t)}
                          >
                            Record Result
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="empty">No tests match criteria.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {page === 'multi-product-10' && (
          <MultiProductBatchIntake
            onDone={() => {
              loadData();
              showToast('All 10 Products Successfully Registered in MongoDB!');
              setPage('batches');
            }}
            setPage={setPage}
            showToast={showToast}
          />
        )}

        {page === 'reports' && (
          <ReportsView
            reports={reports}
            batches={batches}
            onOpenCOA={(b) => setSelectedCOABatch(b)}
          />
        )}

        {/* MODALS */}
        {showBatchForm && (
          <Modal title="Register Production Batch" onClose={() => setShowBatchForm(false)}>
            <BatchForm onDone={() => { setShowBatchForm(false); loadData(); }} />
          </Modal>
        )}

        {showSampleForm && (
          <Modal title="Register Laboratory Sample" onClose={() => setShowSampleForm(false)}>
            <SampleForm batches={batches} onDone={() => { setShowSampleForm(false); loadData(); }} />
          </Modal>
        )}

        {showTestForm && (
          <Modal title="Add Laboratory Test" onClose={() => setShowTestForm(false)}>
            <TestForm samples={samples} onDone={() => { setShowTestForm(false); loadData(); }} />
          </Modal>
        )}

        {selectedTestForEdit && (
          <Modal title={`Record Test Result: ${selectedTestForEdit.test_name}`} onClose={() => setSelectedTestForEdit(null)}>
            <EditTestResultForm
              test={selectedTestForEdit}
              onDone={() => { setSelectedTestForEdit(null); loadData(); }}
            />
          </Modal>
        )}

        {selectedCOABatch && (
          <Modal title="Certificate of Analysis (COA)" onClose={() => setSelectedCOABatch(null)}>
            <COAView
              batch={selectedCOABatch}
              reports={reports}
              onClose={() => setSelectedCOABatch(null)}
            />
          </Modal>
        )}

        {showMernModal && (
          <Modal title="MERN Stack Architecture Details" onClose={() => setShowMernModal(false)}>
            <MernStackInfo health={health} />
          </Modal>
        )}

        {toast && (
          <div className={`toast-pill ${toast.type}`}>
            <CheckCircle2 size={18} color="#22c55e" />
            <span>{toast.msg}</span>
          </div>
        )}
      </main>
    </div>
  );
}

function Nav({ icon, text, count, active, onClick }) {
  return (
    <button className={`nav ${active ? 'active' : ''}`} onClick={onClick}>
      {React.cloneElement(icon, { size: 18 })}
      <span>{text}</span>
      {count !== undefined && (
        <span style={{ marginLeft: 'auto', fontSize: '11px', background: 'rgba(255,255,255,0.15)', padding: '1px 6px', borderRadius: '999px' }}>
          {count}
        </span>
      )}
    </button>
  );
}

function DashboardView({ data, setPage, onOpenTestEdit }) {
  const cards = [
    ['Batches', data.batches, Boxes, ''],
    ['Active Samples', data.samples, TestTube2, 'purple'],
    ['Total Lab Tests', data.tests, Beaker, ''],
    ['Passed Tests', data.passed, ClipboardCheck, 'success'],
    ['Failed Tests', data.failed, Activity, 'danger'],
    ['Pending Tests', data.pending, Database, 'warning'],
  ];

  const passPct = data.tests ? Math.round((data.passed / data.tests) * 100) : 0;
  const failPct = data.tests ? Math.round((data.failed / data.tests) * 100) : 0;
  const pendPct = data.tests ? Math.round((data.pending / data.tests) * 100) : 0;

  return (
    <>
      <div className="cards">
        {cards.map(([label, value, Icon, colorClass]) => (
          <div className="card" key={label}>
            <div className={`card-icon ${colorClass}`}>
              <Icon size={22} />
            </div>
            <div>
              <small>{label}</small>
              <strong>{value}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* 10-PRODUCT BATCH PRODUCTION INTAKE QUICK ACCESS BANNER */}
      <div style={{ padding: '0 32px 20px' }}>
        <div className="station-context-card" style={{ marginBottom: 0, padding: '18px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #2563eb, #06b6d4)', display: 'grid', placeItems: 'center', color: 'white', flexShrink: 0 }}>
                <Boxes size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <b style={{ fontSize: '15px', color: '#ffffff' }}>10-Product Batch Production Intake</b>
                  <span className="station-badge-ten">Take 10 Product Amounts at Once</span>
                </div>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0' }}>
                  Simultaneously input 10 different products & amounts (e.g. Dark Chocolate Hazelnut Spread 350g, Roasted Spiced Cashews 200g Pouch, Salted Caramel Butter Toffee 150g...) into MongoDB.
                </p>
              </div>
            </div>
            <button className="btn-rapid" onClick={() => setPage('multi-product-10')}>
              <Boxes size={14} /> Open 10-Product Intake →
            </button>
          </div>
        </div>
      </div>

      <div className="grid2">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Recent Test Activity</h2>
              <p>Latest food chemistry and microbiological tests</p>
            </div>
            <button className="link-btn" onClick={() => setPage('tests')}>
              View all tests →
            </button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Batch</th>
                  <th>Sample</th>
                  <th>Result</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.recent && data.recent.length ? (
                  data.recent.map((r) => (
                    <tr key={r._id || r.id}>
                      <td><b>{r.test_name}</b></td>
                      <td><span className="code-cell">{r.batch_code}</span></td>
                      <td><span className="code-cell">{r.sample_code}</span></td>
                      <td>{r.result_value || 'Pending'} {r.unit}</td>
                      <td><StatusBadge value={r.status} /></td>
                      <td>
                        <button
                          className="btn-sm edit"
                          onClick={() => onOpenTestEdit(r)}
                        >
                          Record
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="empty">No recent tests.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Quality Overview</h2>
              <p>Laboratory testing compliance breakdown</p>
            </div>
          </div>

          <div className="quality-row">
            <span>Overall Pass Rate</span>
            <b>{passPct}%</b>
          </div>

          <div className="bar">
            <div className="bar-fill-pass" style={{ width: `${passPct}%` }} title={`Passed: ${passPct}%`} />
            <div className="bar-fill-fail" style={{ width: `${failPct}%` }} title={`Failed: ${failPct}%`} />
            <div className="bar-fill-pending" style={{ width: `${pendPct}%` }} title={`Pending: ${pendPct}%`} />
          </div>

          <div className="legend">
            <span><i className="dot pass" /> Passed ({data.passed})</span>
            <span><i className="dot fail" /> Failed ({data.failed})</span>
            <span><i className="dot pending" /> Pending ({data.pending})</span>
          </div>

          <div className="trace-box">
            <ShieldCheck size={28} />
            <div>
              <b>MERN Traceability Engine</b>
              <small>
                MongoDB Schemas enforce batch-to-sample relational integrity for audit compliance.
              </small>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ReportsView({ reports, batches, onOpenCOA }) {
  const uniqueBatches = [...new Map(reports.map((r) => [r.batch_code, r])).values()];

  return (
    <div className="section">
      <div className="section-head">
        <div>
          <h2>Compliance & Traceability Audit</h2>
          <p>End-to-end chain from Production Batch → Quality Samples → Laboratory Tests</p>
        </div>
        <button className="primary" onClick={() => window.print()}>
          <Printer size={16} /> Print Full Audit Report
        </button>
      </div>

      <div className="report-grid">
        {uniqueBatches.map((b) => {
          const batchSamples = reports
            .filter((r) => r.batch_code === b.batch_code)
            .filter((r, i, a) => r.sample_code && a.findIndex((x) => x.sample_code === r.sample_code) === i);

          const fullBatchObj = batches.find((x) => x.batch_code === b.batch_code) || b;

          return (
            <div className="report-card" key={b.batch_code}>
              <div className="report-title">
                <div>
                  <b>{b.batch_code}</b>
                  <h3>{b.product_name}</h3>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <StatusBadge value={b.batch_status} />
                  <button
                    className="btn-sm edit"
                    onClick={() => onOpenCOA(fullBatchObj)}
                    title="View Certificate of Analysis"
                  >
                    View COA
                  </button>
                </div>
              </div>

              <div className="report-meta">
                <span>Production: <b>{b.production_date}</b></span>
                <span>Expiry: <b>{b.expiry_date || '—'}</b></span>
              </div>

              <div className="timeline">
                {batchSamples.map((s) => {
                  const sampleTests = reports.filter(
                    (r) => r.sample_code === s.sample_code && r.test_name
                  );

                  return (
                    <div className="timeline-item" key={s.sample_code}>
                      <div className="circle" />
                      <div style={{ flex: 1 }}>
                        <b>{s.sample_code}</b>
                        <small>{s.sample_type} • Status: {s.sample_status}</small>

                        {sampleTests.map((t, idx) => (
                          <div className="mini-test" key={idx}>
                            <span>
                              <strong>{t.test_name}</strong> ({t.category})
                            </span>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <span>{t.result_value || 'Pending'} {t.unit}</span>
                              <StatusBadge value={t.test_status} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <h2>{title}</h2>
          <button onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function BatchForm({ onDone }) {
  const [f, setF] = useState({
    batch_code: `B-2026-00${Math.floor(Math.random() * 900) + 100}`,
    product_name: '',
    category: 'Processed Fruits',
    production_date: new Date().toISOString().slice(0, 10),
    expiry_date: '',
    batch_size: 1000,
    unit: 'kg',
    status: 'In Testing',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api('/batches', { method: 'POST', body: JSON.stringify(f) });
      onDone();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <label>
        Batch Code
        <input required value={f.batch_code} onChange={(e) => setF({ ...f, batch_code: e.target.value })} />
      </label>
      <label>
        Product Name
        <input
          required
          placeholder="e.g. Alphonso Mango Pulp, Pasteurized Whole Milk"
          value={f.product_name}
          onChange={(e) => setF({ ...f, product_name: e.target.value })}
        />
      </label>
      <label>
        Category
        <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
          <option>Processed Fruits</option>
          <option>Dairy</option>
          <option>Beverages</option>
          <option>Sauces & Condiments</option>
          <option>Bakery</option>
          <option>Confectionery</option>
          <option>Snacks</option>
        </select>
      </label>
      <div className="two">
        <label>
          Production Date
          <input
            type="date"
            required
            value={f.production_date}
            onChange={(e) => setF({ ...f, production_date: e.target.value })}
          />
        </label>
        <label>
          Expiry Date
          <input
            type="date"
            value={f.expiry_date}
            onChange={(e) => setF({ ...f, expiry_date: e.target.value })}
          />
        </label>
      </div>
      <div className="two">
        <label>
          Batch Size
          <input
            type="number"
            value={f.batch_size}
            onChange={(e) => setF({ ...f, batch_size: Number(e.target.value) })}
          />
        </label>
        <label>
          Unit
          <select value={f.unit} onChange={(e) => setF({ ...f, unit: e.target.value })}>
            <option>kg</option>
            <option>liters</option>
            <option>bottles</option>
            <option>pouches</option>
          </select>
        </label>
      </div>
      <button className="primary full">Save Batch to MongoDB</button>
    </form>
  );
}

function SampleForm({ batches, onDone }) {
  const [f, setF] = useState({
    sample_code: `S-${Math.floor(Math.random() * 9000) + 1000}`,
    batch_id: batches[0]?._id || batches[0]?.id || '',
    sample_type: 'Finished Product',
    sampling_point: 'Filling Line Station #1',
    priority: 'Normal',
    collected_at: new Date().toISOString().slice(0, 10),
    collector_name: 'Dr. Nawaz John',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api('/samples', { method: 'POST', body: JSON.stringify(f) });
      onDone();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <label>
        Sample Code
        <input required value={f.sample_code} onChange={(e) => setF({ ...f, sample_code: e.target.value })} />
      </label>
      <label>
        Production Batch
        <select value={f.batch_id} onChange={(e) => setF({ ...f, batch_id: e.target.value })}>
          {batches.map((b) => (
            <option value={b._id || b.id} key={b._id || b.id}>
              {b.batch_code} — {b.product_name}
            </option>
          ))}
        </select>
      </label>
      <div className="two">
        <label>
          Sample Type
          <select value={f.sample_type} onChange={(e) => setF({ ...f, sample_type: e.target.value })}>
            <option>Raw Material</option>
            <option>In-Process</option>
            <option>Finished Product</option>
            <option>Packaging</option>
            <option>Environmental Swab</option>
          </select>
        </label>
        <label>
          Priority
          <select value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value })}>
            <option>Normal</option>
            <option>High</option>
            <option>Urgent</option>
          </select>
        </label>
      </div>
      <label>
        Sampling Point
        <input
          placeholder="e.g. Tank 2, Conveyor A, Capper Station"
          value={f.sampling_point}
          onChange={(e) => setF({ ...f, sampling_point: e.target.value })}
        />
      </label>
      <div className="two">
        <label>
          Collection Date
          <input
            type="date"
            required
            value={f.collected_at}
            onChange={(e) => setF({ ...f, collected_at: e.target.value })}
          />
        </label>
        <label>
          Collector Name
          <input
            value={f.collector_name}
            onChange={(e) => setF({ ...f, collector_name: e.target.value })}
          />
        </label>
      </div>
      <button className="primary full">Register Sample in MongoDB</button>
    </form>
  );
}

function TestForm({ samples, onDone }) {
  const [f, setF] = useState({
    sample_id: samples[0]?._id || samples[0]?.id || '',
    test_name: '',
    category: 'Chemical',
    specification: '',
    unit: '',
    result_value: '',
    status: 'Pending',
  });

  const presets = [
    { name: 'pH Level @ 20°C', cat: 'Chemical', spec: '3.80 - 4.20', unit: 'pH' },
    { name: 'Total Soluble Solids (Brix)', cat: 'Chemical', spec: '16.0 - 22.0', unit: '°Brix' },
    { name: 'Acidity (% Citric Acid)', cat: 'Chemical', spec: '0.35 - 0.55', unit: '%' },
    { name: 'Total Plate Count', cat: 'Microbiological', spec: '< 50', unit: 'CFU/g' },
    { name: 'Yeast & Mold Count', cat: 'Microbiological', spec: 'Absent', unit: 'CFU/g' },
    { name: 'Milk Fat Content', cat: 'Quality', spec: '3.50 - 4.50', unit: '%' },
    { name: 'Sodium Chloride (Salt)', cat: 'Chemical', spec: '1.50 - 2.20', unit: '%' },
  ];

  const applyPreset = (p) => {
    setF({
      ...f,
      test_name: p.name,
      category: p.cat,
      specification: p.spec,
      unit: p.unit,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api('/tests', { method: 'POST', body: JSON.stringify(f) });
      onDone();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div>
        <label style={{ display: 'block', marginBottom: '6px' }}>Quick Standard Parameters</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {presets.map((p) => (
            <button
              type="button"
              key={p.name}
              className="btn-sm"
              onClick={() => applyPreset(p)}
              style={{ fontSize: '11px' }}
            >
              + {p.name}
            </button>
          ))}
        </div>
      </div>

      <label>
        Target Sample
        <select value={f.sample_id} onChange={(e) => setF({ ...f, sample_id: e.target.value })}>
          {samples.map((s) => (
            <option value={s._id || s.id} key={s._id || s.id}>
              {s.sample_code} — {s.batch_code} ({s.sample_type})
            </option>
          ))}
        </select>
      </label>

      <label>
        Test Parameter Name
        <input
          required
          placeholder="e.g. pH Level, Aerobic Plate Count"
          value={f.test_name}
          onChange={(e) => setF({ ...f, test_name: e.target.value })}
        />
      </label>

      <div className="two">
        <label>
          Category
          <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
            <option>Chemical</option>
            <option>Microbiological</option>
            <option>Quality</option>
            <option>Physical</option>
            <option>Sensory</option>
          </select>
        </label>
        <label>
          Unit
          <input
            placeholder="e.g. pH, °Brix, %, CFU/g"
            value={f.unit}
            onChange={(e) => setF({ ...f, unit: e.target.value })}
          />
        </label>
      </div>

      <label>
        Specification Limit / Range
        <input
          placeholder="e.g. 3.50 - 4.20 or < 50 or Absent"
          value={f.specification}
          onChange={(e) => setF({ ...f, specification: e.target.value })}
        />
      </label>

      <button className="primary full">Create Lab Test in MongoDB</button>
    </form>
  );
}

function EditTestResultForm({ test, onDone }) {
  const [resultValue, setResultValue] = useState(test.result_value || '');
  const [specification, setSpecification] = useState(test.specification || '');
  const [unit, setUnit] = useState(test.unit || '');
  const [status, setStatus] = useState(test.status || 'Pending');
  const [remarks, setRemarks] = useState(test.remarks || '');

  // Live evaluation of Pass/Fail as user types
  const evaluate = (val, spec) => {
    if (!val) return 'Pending';
    const num = parseFloat(val);
    if (!isNaN(num) && spec) {
      const match = spec.match(/([0-9.]+)\s*-\s*([0-9.]+)/);
      if (match) {
        const min = parseFloat(match[1]);
        const max = parseFloat(match[2]);
        return num >= min && num <= max ? 'Pass' : 'Fail';
      }
      const maxMatch = spec.match(/<\s*([0-9.]+)/);
      if (maxMatch) {
        const max = parseFloat(maxMatch[1]);
        return num < max ? 'Pass' : 'Fail';
      }
    }
    if (spec.toLowerCase().includes('absent')) {
      return val.toLowerCase().includes('absent') || val.toLowerCase().includes('negative') ? 'Pass' : 'Fail';
    }
    return status;
  };

  const handleResultChange = (v) => {
    setResultValue(v);
    const calculated = evaluate(v, specification);
    setStatus(calculated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api(`/tests/${test._id || test.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          result_value: resultValue,
          specification,
          unit,
          status,
          remarks,
          tested_at: new Date().toISOString().slice(0, 10),
        }),
      });
      onDone();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', fontSize: '12px' }}>
        <div><b>Parameter:</b> {test.test_name} ({test.category})</div>
        <div><b>Sample:</b> {test.sample_code} | <b>Batch:</b> {test.batch_code}</div>
        <div><b>Specification Standard:</b> {specification || '—'}</div>
      </div>

      <div className="two">
        <label>
          Test Result Value
          <input
            required
            placeholder="e.g. 4.1 or Absent"
            value={resultValue}
            onChange={(e) => handleResultChange(e.target.value)}
          />
        </label>
        <label>
          Unit
          <input value={unit} onChange={(e) => setUnit(e.target.value)} />
        </label>
      </div>

      <div className="two">
        <label>
          Specification
          <input value={specification} onChange={(e) => setSpecification(e.target.value)} />
        </label>
        <label>
          Evaluated Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>Pending</option>
            <option>Pass</option>
            <option>Fail</option>
            <option>Retest</option>
          </select>
        </label>
      </div>

      <label>
        Analyst Remarks / Calibration Note
        <textarea
          rows={3}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Instrument reading, incubation time, analyst notes..."
        />
      </label>

      <button className="primary full">Update Test Result & Mongoose Document</button>
    </form>
  );
}

function COAView({ batch, reports, onClose }) {
  const batchReports = reports.filter((r) => r.batch_code === batch.batch_code && r.test_name);
  const passedAll = batchReports.length > 0 && batchReports.every((t) => t.test_status === 'Pass');

  return (
    <div>
      <div className="coa-sheet">
        <div className="coa-header">
          <h1>FOODLAB QUALITY CONTROL LABORATORY</h1>
          <p>ISO 17025 / FSSAI ACCREDITED FOOD TESTING FACILITY</p>
          <h2 style={{ fontSize: '16px', marginTop: '6px' }}>CERTIFICATE OF ANALYSIS (COA)</h2>
        </div>

        <div className="coa-grid">
          <div>
            <div><span>Batch Code:</span> <b>{batch.batch_code}</b></div>
            <div><span>Product Name:</span> <b>{batch.product_name}</b></div>
            <div><span>Category:</span> <b>{batch.category || 'Processed Foods'}</b></div>
          </div>
          <div>
            <div><span>Production Date:</span> <b>{batch.production_date}</b></div>
            <div><span>Expiry Date:</span> <b>{batch.expiry_date || '—'}</b></div>
            <div><span>Batch Status:</span> <b>{batch.status}</b></div>
          </div>
        </div>

        <h3 style={{ fontSize: '13px', marginBottom: '8px' }}>Laboratory Analytical Test Results</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Category</th>
                <th>Specification</th>
                <th>Observed Result</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {batchReports.length ? (
                batchReports.map((t, idx) => (
                  <tr key={idx}>
                    <td><b>{t.test_name}</b></td>
                    <td>{t.category}</td>
                    <td>{t.specification || '—'}</td>
                    <td>{t.result_value} {t.unit}</td>
                    <td><StatusBadge value={t.test_status} /></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="empty">No tests recorded for this batch.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="coa-stamp">
          <div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Release Decision:</div>
            <div className={`coa-seal ${passedAll ? '' : 'failed'}`} style={passedAll ? {} : { borderColor: '#dc2626', color: '#dc2626' }}>
              {passedAll ? 'QUALITY CERTIFIED & RELEASED' : 'HOLD / PENDING RE-EVALUATION'}
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '11px' }}>
            <div style={{ borderBottom: '1px solid #94a3b8', width: '160px', marginBottom: '4px' }} />
            <b>Dr. Nawaz John</b>
            <div style={{ color: '#64748b' }}>Head of Food Safety & QA</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '16px', justifyContent: 'flex-end' }}>
        <button className="btn-secondary" onClick={() => window.print()}>
          <Printer size={15} /> Print Certificate
        </button>
        <button className="primary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

function MernStackInfo({ health }) {
  return (
    <div style={{ display: 'grid', gap: '14px', fontSize: '12px' }}>
      <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '14px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Database size={16} /> M — MongoDB & Mongoose
        </h3>
        <p style={{ marginTop: '4px', color: '#475569' }}>
          Document database models defined via Mongoose Schemas: <code>Batch</code>, <code>Sample</code>, <code>Test</code>, and <code>AuditLog</code>.
          Supports live local MongoDB (<code>mongodb://127.0.0.1:27017/foodlab</code>) or cloud MongoDB Atlas URI in <code>server/.env</code>.
        </p>
        <div style={{ marginTop: '8px', fontSize: '11px', color: '#0f172a' }}>
          <b>Active Status:</b> {health?.database?.activeMode || 'MongoDB Ready'}
        </div>
      </div>

      <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '14px', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Server size={16} /> E — Express.js
        </h3>
        <p style={{ marginTop: '4px', color: '#475569' }}>
          Fast, unopinionated REST API routing with CORS, JSON body parser, and structured error handling.
          Endpoints: <code>/api/dashboard</code>, <code>/api/batches</code>, <code>/api/samples</code>, <code>/api/tests</code>, <code>/api/reports</code>, <code>/api/seed</code>.
        </p>
      </div>

      <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '14px', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={16} /> R — React.js
        </h3>
        <p style={{ marginTop: '4px', color: '#475569' }}>
          Interactive Single Page Application built with React 19, hooks (<code>useState</code>, <code>useEffect</code>, <code>useMemo</code>), Lucide React iconography, dynamic test evaluation, search & filters, and printable Certificate of Analysis.
        </p>
      </div>

      <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '14px', color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Cpu size={16} /> N — Node.js
        </h3>
        <p style={{ marginTop: '4px', color: '#475569' }}>
          Node.js server runtime environment (v{health?.nodeVersion || '22'}) running ES Modules (<code>type: "module"</code>) and asynchronous non-blocking event loop.
        </p>
      </div>
    </div>
  );
}

const DEFAULT_10_PRODUCTS = [
  {
    id: 1,
    product_name: 'Dark Chocolate Hazelnut Spread',
    package_amount: '350g Jar',
    batch_size: 2500,
    unit: 'jars',
    category: 'Confectionery',
    batch_code: 'B-2026-CHOC-350',
    production_date: new Date().toISOString().slice(0, 10),
    expiry_date: '2027-10-25',
    status: 'In Testing',
  },
  {
    id: 2,
    product_name: 'Roasted Spiced Cashews',
    package_amount: '200g Pouch',
    batch_size: 4000,
    unit: 'pouches',
    category: 'Snacks',
    batch_code: 'B-2026-CASH-200',
    production_date: new Date().toISOString().slice(0, 10),
    expiry_date: '2027-04-25',
    status: 'In Testing',
  },
  {
    id: 3,
    product_name: 'Salted Caramel Butter Toffee',
    package_amount: '150g Box',
    batch_size: 3200,
    unit: 'boxes',
    category: 'Confectionery',
    batch_code: 'B-2026-TOFF-150',
    production_date: new Date().toISOString().slice(0, 10),
    expiry_date: '2027-06-25',
    status: 'In Testing',
  },
  {
    id: 4,
    product_name: 'Artisanal Almond Butter Crunch',
    package_amount: '250g Glass Jar',
    batch_size: 1800,
    unit: 'jars',
    category: 'Confectionery',
    batch_code: 'B-2026-ALMD-250',
    production_date: new Date().toISOString().slice(0, 10),
    expiry_date: '2027-09-15',
    status: 'In Testing',
  },
  {
    id: 5,
    product_name: 'Organic Wildflower Blossom Honey',
    package_amount: '500g Jar',
    batch_size: 2200,
    unit: 'jars',
    category: 'Confectionery',
    batch_code: 'B-2026-HONY-500',
    production_date: new Date().toISOString().slice(0, 10),
    expiry_date: '2028-03-01',
    status: 'Approved',
  },
  {
    id: 6,
    product_name: 'Alphonso Mango Export Pulp',
    package_amount: '850g Tin',
    batch_size: 5000,
    unit: 'tins',
    category: 'Processed Fruits',
    batch_code: 'B-2026-MNGO-850',
    production_date: new Date().toISOString().slice(0, 10),
    expiry_date: '2027-08-10',
    status: 'Approved',
  },
  {
    id: 7,
    product_name: 'Cold-Pressed Extra Virgin Olive Oil',
    package_amount: '750ml Bottle',
    batch_size: 1500,
    unit: 'bottles',
    category: 'Sauces & Condiments',
    batch_code: 'B-2026-OLIV-750',
    production_date: new Date().toISOString().slice(0, 10),
    expiry_date: '2027-11-20',
    status: 'In Testing',
  },
  {
    id: 8,
    product_name: 'Spiced Masala Chai Concentrate',
    package_amount: '1L Bottle',
    batch_size: 3500,
    unit: 'bottles',
    category: 'Beverages',
    batch_code: 'B-2026-CHAI-1000',
    production_date: new Date().toISOString().slice(0, 10),
    expiry_date: '2027-05-15',
    status: 'In Testing',
  },
  {
    id: 9,
    product_name: 'Smoked Paprika & Sea Salt Crisps',
    package_amount: '180g Bag',
    batch_size: 6000,
    unit: 'bags',
    category: 'Snacks',
    batch_code: 'B-2026-CHIP-180',
    production_date: new Date().toISOString().slice(0, 10),
    expiry_date: '2027-03-30',
    status: 'Hold',
  },
  {
    id: 10,
    product_name: 'Gluten-Free Cranberry Oat Cookies',
    package_amount: '300g Pack',
    batch_size: 2800,
    unit: 'packs',
    category: 'Bakery',
    batch_code: 'B-2026-COOK-300',
    production_date: new Date().toISOString().slice(0, 10),
    expiry_date: '2027-04-12',
    status: 'In Testing',
  },
];

function MultiProductBatchIntake({ onDone, setPage, showToast }) {
  const [products, setProducts] = useState(DEFAULT_10_PRODUCTS);
  const [saving, setSaving] = useState(false);
  const [activePreset, setActivePreset] = useState('gourmet');

  const handleFieldChange = (index, field, value) => {
    setProducts((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const applyPreset = (type) => {
    setActivePreset(type);
    if (type === 'gourmet') {
      setProducts(DEFAULT_10_PRODUCTS);
    } else if (type === 'dairy-bev') {
      setProducts([
        { id: 1, product_name: 'Pasteurized Homogenized Milk', package_amount: '1L Pouch', batch_size: 8000, unit: 'liters', category: 'Dairy', batch_code: 'B-2026-MILK-1L', production_date: new Date().toISOString().slice(0, 10), expiry_date: '2026-11-05', status: 'In Testing' },
        { id: 2, product_name: 'Greek Style Strawberry Yogurt', package_amount: '400g Tub', batch_size: 3500, unit: 'tubs', category: 'Dairy', batch_code: 'B-2026-YGRT-400', production_date: new Date().toISOString().slice(0, 10), expiry_date: '2026-11-20', status: 'In Testing' },
        { id: 3, product_name: 'Cold-Brew Arabica Coffee Concentrate', package_amount: '500ml Bottle', batch_size: 2400, unit: 'bottles', category: 'Beverages', batch_code: 'B-2026-BREW-500', production_date: new Date().toISOString().slice(0, 10), expiry_date: '2027-02-15', status: 'Approved' },
        { id: 4, product_name: 'Alphonso Mango Nectar', package_amount: '1L Tetra Pak', batch_size: 5000, unit: 'packs', category: 'Beverages', batch_code: 'B-2026-NECT-1L', production_date: new Date().toISOString().slice(0, 10), expiry_date: '2027-05-10', status: 'In Testing' },
        { id: 5, product_name: 'Spiced Buttermilk (Chaas)', package_amount: '250ml Pouch', batch_size: 10000, unit: 'pouches', category: 'Dairy', batch_code: 'B-2026-CHAS-250', production_date: new Date().toISOString().slice(0, 10), expiry_date: '2026-11-02', status: 'In Testing' },
        { id: 6, product_name: 'Pure Desi Cultured Ghee', package_amount: '500ml Glass Jar', batch_size: 1500, unit: 'jars', category: 'Dairy', batch_code: 'B-2026-GHEE-500', production_date: new Date().toISOString().slice(0, 10), expiry_date: '2027-10-15', status: 'Approved' },
        { id: 7, product_name: 'Sparkling Lemon & Mint Soda', package_amount: '330ml Can', batch_size: 12000, unit: 'cans', category: 'Beverages', batch_code: 'B-2026-SODA-330', production_date: new Date().toISOString().slice(0, 10), expiry_date: '2027-04-20', status: 'In Testing' },
        { id: 8, product_name: 'Artisanal Cheddar Cheese Block', package_amount: '200g Vacuum Pack', batch_size: 2000, unit: 'packs', category: 'Dairy', batch_code: 'B-2026-CHED-200', production_date: new Date().toISOString().slice(0, 10), expiry_date: '2027-03-30', status: 'Hold' },
        { id: 9, product_name: 'Electrolyte Mineral Hydration Drink', package_amount: '750ml Sports Bottle', batch_size: 4500, unit: 'bottles', category: 'Beverages', batch_code: 'B-2026-ELCT-750', production_date: new Date().toISOString().slice(0, 10), expiry_date: '2027-06-18', status: 'In Testing' },
        { id: 10, product_name: 'Probiotic Strawberry Kefir', package_amount: '350ml Bottle', batch_size: 1800, unit: 'bottles', category: 'Dairy', batch_code: 'B-2026-KEFR-350', production_date: new Date().toISOString().slice(0, 10), expiry_date: '2026-11-15', status: 'In Testing' },
      ]);
    } else if (type === 'clear') {
      setProducts(Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        product_name: '',
        package_amount: '',
        batch_size: 1000,
        unit: 'units',
        category: 'Confectionery',
        batch_code: `B-2026-P0${i + 1}-${Math.floor(Math.random() * 900) + 100}`,
        production_date: new Date().toISOString().slice(0, 10),
        expiry_date: '',
        status: 'In Testing',
      })));
    }
  };

  const regenerateCodes = () => {
    setProducts((prev) =>
      prev.map((p) => {
        const prefix = (p.product_name || 'PROD').slice(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X');
        return {
          ...p,
          batch_code: `B-2026-${prefix}-${Math.floor(Math.random() * 900) + 100}`,
        };
      })
    );
  };

  const handleSubmitAll = async () => {
    const invalid = products.find((p) => !p.product_name.trim());
    if (invalid) {
      alert(`Please provide a Product Name for item #${invalid.id}`);
      return;
    }

    try {
      setSaving(true);
      const payload = products.map((p) => ({
        batch_code: p.batch_code || `B-2026-0${p.id}-${Math.floor(Math.random() * 900) + 100}`,
        product_name: p.package_amount ? `${p.product_name} (${p.package_amount})` : p.product_name,
        category: p.category,
        batch_size: Number(p.batch_size) || 1000,
        unit: p.unit || 'units',
        production_date: p.production_date || new Date().toISOString().slice(0, 10),
        expiry_date: p.expiry_date || null,
        status: p.status || 'In Testing',
        supervisor: 'Dr. Nawaz John',
        notes: `Simultaneous 10-Product Batch Production Intake. Packaging amount: ${p.package_amount || 'Standard'}`,
      }));

      await api('/batches/bulk', {
        method: 'POST',
        body: JSON.stringify({ batches: payload }),
      });

      onDone();
    } catch (err) {
      alert('Failed to register 10 products: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filledCount = products.filter((p) => p.product_name.trim() && p.package_amount.trim()).length;
  const totalUnits = products.reduce((acc, p) => acc + (Number(p.batch_size) || 0), 0);
  const categoriesCount = new Set(products.map((p) => p.category)).size;

  return (
    <div className="section rapid-station">
      {/* CONTEXT HERO CARD */}
      <div className="station-context-card">
        <div className="station-context-head">
          <div className="station-context-title">
            <h2>
              <Boxes size={22} color="#38bdf8" />
              10-Product Batch Production Intake
              <span className="station-badge-ten">10 Product Amounts at Once</span>
            </h2>
            <p>
              Simultaneously enter and register 10 different manufactured products and package amounts (e.g. Dark Chocolate Hazelnut Spread 350g, Roasted Spiced Cashews 200g Pouch, Salted Caramel Butter Toffee 150g...) into MongoDB with single-click batch generation.
            </p>
          </div>
          <button
            className="btn-secondary"
            style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
            onClick={() => setPage('batches')}
          >
            View Batches Table →
          </button>
        </div>
      </div>

      {/* PRESET BAR */}
      <div className="preset-bar">
        <div className="preset-bar-title">
          <Sparkles size={16} color="#2563eb" />
          <span>Quick 10-Product Presets:</span>
        </div>
        <div className="preset-buttons">
          <button
            type="button"
            className={`btn-preset ${activePreset === 'gourmet' ? 'active' : ''}`}
            onClick={() => applyPreset('gourmet')}
            title="Pre-fills Hazelnut Spread 350g, Roasted Cashews 200g, Butter Toffee 150g, etc."
          >
            🍫 Gourmet Products (Hazelnut 350g, Cashews 200g, Toffee 150g...)
          </button>
          <button
            type="button"
            className={`btn-preset ${activePreset === 'dairy-bev' ? 'active' : ''}`}
            onClick={() => applyPreset('dairy-bev')}
            title="Pre-fills Dairy & Beverage packaging batch line"
          >
            🥛 Dairy & Beverage Line (10 Items)
          </button>
          <button
            type="button"
            className="btn-preset"
            onClick={regenerateCodes}
            title="Generate unique batch codes"
          >
            <RotateCcw size={13} /> Regenerate Batch Codes
          </button>
          <button
            type="button"
            className="btn-preset"
            onClick={() => applyPreset('clear')}
            title="Clear all 10 product inputs to type manually"
          >
            Clear All 10
          </button>
        </div>
      </div>

      {/* METRIC HUD */}
      <div className="station-hud">
        <div className="hud-card">
          <div className="hud-card-title">10 Products Intake Status</div>
          <div className="hud-card-val">
            <b>{filledCount} / 10 Ready</b>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
              ({Math.round((filledCount / 10) * 100)}%)
            </span>
          </div>
          <div className="hud-progress-track">
            <div className="hud-progress-fill" style={{ width: `${(filledCount / 10) * 100}%` }} />
          </div>
        </div>

        <div className="hud-card">
          <div className="hud-card-title">Total Production Units</div>
          <div className="hud-card-val" style={{ color: '#2563eb' }}>
            <Boxes size={20} />
            <b>{totalUnits.toLocaleString()}</b>
          </div>
        </div>

        <div className="hud-card">
          <div className="hud-card-title">Categories Active</div>
          <div className="hud-card-val" style={{ color: '#16a34a' }}>
            <Layers size={20} />
            <b>{categoriesCount} Categories</b>
          </div>
        </div>

        <div className="hud-card">
          <div className="hud-card-title">QA Supervisor</div>
          <div className="hud-card-val" style={{ fontSize: '15px', color: '#0f172a' }}>
            <b>Dr. Nawaz John</b>
          </div>
        </div>
      </div>

      {/* 10 PRODUCTS CARDS GRID */}
      <div className="ten-inputs-grid">
        {products.map((p, index) => {
          const catClass = `cat-${p.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

          return (
            <div className={`product-intake-card ${catClass}`} key={p.id}>
              <div className="product-card-top">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="product-index-badge">#{index + 1}</div>
                  <span className="product-code-pill">{p.batch_code}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <select
                    value={p.category}
                    onChange={(e) => handleFieldChange(index, 'category', e.target.value)}
                    style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: '700' }}
                  >
                    <option>Confectionery</option>
                    <option>Snacks</option>
                    <option>Bakery</option>
                    <option>Processed Fruits</option>
                    <option>Beverages</option>
                    <option>Sauces & Condiments</option>
                    <option>Dairy</option>
                  </select>
                  <select
                    value={p.status}
                    onChange={(e) => handleFieldChange(index, 'status', e.target.value)}
                    style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: '700' }}
                  >
                    <option>In Testing</option>
                    <option>Approved</option>
                    <option>Hold</option>
                  </select>
                </div>
              </div>

              {/* PRODUCT NAME & PACKAGE AMOUNT */}
              <div className="product-grid-fields">
                <div>
                  <label className="field-label-mini">Product Name</label>
                  <input
                    type="text"
                    className="input-styled-box"
                    placeholder="e.g. Dark Chocolate Hazelnut Spread"
                    value={p.product_name}
                    onChange={(e) => handleFieldChange(index, 'product_name', e.target.value)}
                  />
                </div>

                <div>
                  <label className="field-label-mini">Package Amount / Size</label>
                  <input
                    type="text"
                    className="input-styled-box amount-input-highlight"
                    placeholder="e.g. 350g, 200g Pouch"
                    value={p.package_amount}
                    onChange={(e) => handleFieldChange(index, 'package_amount', e.target.value)}
                  />
                </div>
              </div>

              {/* BATCH SIZE, UNIT & DATES */}
              <div className="product-grid-sub">
                <div>
                  <label className="field-label-mini">Production Batch Size</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="number"
                      className="input-styled-box"
                      style={{ flex: 1.5 }}
                      value={p.batch_size}
                      onChange={(e) => handleFieldChange(index, 'batch_size', e.target.value)}
                    />
                    <select
                      value={p.unit}
                      onChange={(e) => handleFieldChange(index, 'unit', e.target.value)}
                      style={{ flex: 1, fontSize: '11px', padding: '6px', borderRadius: '8px', border: '1.5px solid #cbd5e1', background: 'white' }}
                    >
                      <option>jars</option>
                      <option>pouches</option>
                      <option>boxes</option>
                      <option>bottles</option>
                      <option>tins</option>
                      <option>packs</option>
                      <option>kg</option>
                      <option>liters</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="field-label-mini">Expiry Date</label>
                  <input
                    type="date"
                    className="input-styled-box"
                    value={p.expiry_date}
                    onChange={(e) => handleFieldChange(index, 'expiry_date', e.target.value)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ACTION FOOTER */}
      <div className="station-actions-footer">
        <div className="station-summary-status">
          <div className="summary-badge-circle pass">
            <Boxes size={18} />
          </div>
          <div className="summary-text">
            <b>{filledCount} of 10 Products Configured with Amount & Packaging</b>
            <small>Total Production Volume: <b>{totalUnits.toLocaleString()} Units</b> across {categoriesCount} Categories</small>
          </div>
        </div>

        <button
          type="button"
          className="station-submit-btn"
          disabled={saving || filledCount === 0}
          onClick={handleSubmitAll}
        >
          <Boxes size={16} />
          {saving ? 'Registering 10 Products in MongoDB...' : 'Register All 10 Products to MongoDB'}
        </button>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
