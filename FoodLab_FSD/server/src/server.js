import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dbModule, { connectDB, getConnectionStatus, dbRepo } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize MongoDB connection on server start
connectDB().catch((err) => {
  console.error('[MongoDB Startup Error]:', err.message);
});

// Health check & MERN Stack verification endpoint
app.get('/api/health', (req, res) => {
  const conn = getConnectionStatus();
  res.json({
    ok: true,
    service: 'FoodLab Management System API',
    stack: 'MERN Stack (MongoDB, Express.js, React.js, Node.js)',
    nodeVersion: process.version,
    database: conn,
    uptime: Math.round(process.uptime()) + ' seconds',
    timestamp: new Date().toISOString(),
  });
});

// Dashboard KPIs and analytics
app.get('/api/dashboard', async (req, res, next) => {
  try {
    const data = await dbRepo.getDashboard();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Batches endpoints
app.get('/api/batches', async (req, res, next) => {
  try {
    const batches = await dbRepo.getBatches();
    res.json(batches);
  } catch (err) {
    next(err);
  }
});

app.post('/api/batches/bulk', async (req, res, next) => {
  try {
    const { batches } = req.body;
    if (!Array.isArray(batches) || !batches.length) {
      return res.status(400).json({ error: 'Array of batches is required' });
    }
    const results = [];
    for (const batchData of batches) {
      const created = await dbRepo.createBatch(batchData);
      results.push(created);
    }
    res.status(201).json({ success: true, count: results.length, batches: results });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/batches', async (req, res, next) => {
  try {
    const newBatch = await dbRepo.createBatch(req.body);
    res.status(201).json(newBatch);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/batches/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });
    const updated = await dbRepo.updateBatchStatus(req.params.id, status);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Samples endpoints
app.get('/api/samples', async (req, res, next) => {
  try {
    const samples = await dbRepo.getSamples();
    res.json(samples);
  } catch (err) {
    next(err);
  }
});

app.post('/api/samples', async (req, res, next) => {
  try {
    const newSample = await dbRepo.createSample(req.body);
    res.status(201).json(newSample);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Tests endpoints
app.get('/api/tests', async (req, res, next) => {
  try {
    const tests = await dbRepo.getTests();
    res.json(tests);
  } catch (err) {
    next(err);
  }
});

app.post('/api/tests/bulk', async (req, res, next) => {
  try {
    const { tests } = req.body;
    if (!Array.isArray(tests) || !tests.length) {
      return res.status(400).json({ error: 'Array of tests is required' });
    }
    const results = [];
    for (const testData of tests) {
      const created = await dbRepo.createTest(testData);
      results.push(created);
    }
    res.status(201).json({ success: true, count: results.length, tests: results });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/tests', async (req, res, next) => {
  try {
    const newTest = await dbRepo.createTest(req.body);
    res.status(201).json(newTest);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/tests/:id', async (req, res, next) => {
  try {
    const updated = await dbRepo.updateTest(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Reports & Traceability endpoint
app.get('/api/reports', async (req, res, next) => {
  try {
    const reports = await dbRepo.getReports();
    res.json(reports);
  } catch (err) {
    next(err);
  }
});

// Reset & Seed database endpoint
app.post('/api/seed', async (req, res, next) => {
  try {
    const result = await dbRepo.resetAndSeed();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[API Error]:', err);
  res.status(500).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🔬 FoodLab MERN Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Dashboard API: http://localhost:${PORT}/api/dashboard`);
  console.log(`📦 Batches API:   http://localhost:${PORT}/api/batches`);
  console.log(`🧪 Samples API:   http://localhost:${PORT}/api/samples`);
  console.log(`⚗️ Tests API:     http://localhost:${PORT}/api/tests`);
  console.log(`====================================================`);
});
