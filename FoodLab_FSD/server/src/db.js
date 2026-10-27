import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Batch from './models/Batch.js';
import Sample from './models/Sample.js';
import Test from './models/Test.js';
import AuditLog from './models/AuditLog.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/foodlab';

let isMongoConnected = false;
let connectionError = null;

// Initial in-memory data store for fallback when local mongod is not yet running
let memBatches = [];
let memSamples = [];
let memTests = [];
let memAuditLogs = [];

function generateId() {
  return new mongoose.Types.ObjectId().toString();
}

function getSeedData() {
  const b1Id = generateId();
  const b2Id = generateId();
  const b3Id = generateId();
  const b4Id = generateId();

  const s1Id = generateId();
  const s2Id = generateId();
  const s3Id = generateId();
  const s4Id = generateId();
  const s5Id = generateId();
  const s6Id = generateId();
  const s7Id = generateId();

  const batches = [
    {
      _id: b1Id,
      batchCode: 'B-2026-001',
      productName: 'Alphonso Mango Pulp (Export Grade)',
      category: 'Processed Fruits',
      productionDate: '2026-09-15',
      expiryDate: '2027-03-15',
      batchSize: 5000,
      unit: 'kg',
      status: 'Approved',
      supervisor: 'Dr. Nawaz John',
      notes: 'Raw fruits sourced from Ratnagiri farms. Fully pasteurized and vacuum sealed.',
      createdAt: new Date('2026-09-15T08:00:00Z'),
    },
    {
      _id: b2Id,
      batchCode: 'B-2026-002',
      productName: 'Pasteurized Whole Milk (3.8% Fat)',
      category: 'Dairy',
      productionDate: '2026-09-27',
      expiryDate: '2026-10-06',
      batchSize: 12000,
      unit: 'liters',
      status: 'In Testing',
      supervisor: 'Dr. Nawaz John',
      notes: 'Standardized HTST pasteurized whole milk batch from Morning Intake Silo #2.',
      createdAt: new Date('2026-09-27T06:30:00Z'),
    },
    {
      _id: b3Id,
      batchCode: 'B-2026-003',
      productName: 'Organic Tomato Puree 28-30 Brix',
      category: 'Sauces & Condiments',
      productionDate: '2026-09-20',
      expiryDate: '2027-09-20',
      batchSize: 3500,
      unit: 'kg',
      status: 'Hold',
      supervisor: 'Quality Tech R. Sharma',
      notes: 'Sodium chloride level exceeded upper threshold. Batch kept on hold pending sensory audit.',
      createdAt: new Date('2026-09-20T10:15:00Z'),
    },
    {
      _id: b4Id,
      batchCode: 'B-2026-004',
      productName: 'Sparkling Citrus Punch (Glass 330ml)',
      category: 'Beverages',
      productionDate: '2026-09-26',
      expiryDate: '2027-03-26',
      batchSize: 8000,
      unit: 'bottles',
      status: 'In Testing',
      supervisor: 'Dr. Nawaz John',
      notes: 'High speed carbonated bottling line run. Environmental swabs and finished packs sampled.',
      createdAt: new Date('2026-09-26T14:00:00Z'),
    },
  ];

  const samples = [
    {
      _id: s1Id,
      sampleCode: 'S-1001',
      batchId: b1Id,
      sampleType: 'Raw Material',
      samplingPoint: 'Intake Bay #3 - Fruit Sorting conveyor',
      collectorName: 'P. Patel',
      collectedAt: '2026-09-15',
      priority: 'Normal',
      storageCondition: 'Ambient (22°C)',
      status: 'Completed',
      notes: 'Clean fresh mangoes, no bruising.',
      createdAt: new Date('2026-09-15T09:00:00Z'),
    },
    {
      _id: s2Id,
      sampleCode: 'S-1002',
      batchId: b1Id,
      sampleType: 'Finished Product',
      samplingPoint: 'Aseptic Filling Nozzle #1',
      collectorName: 'V. Nair',
      collectedAt: '2026-09-15',
      priority: 'High',
      storageCondition: 'Cool Room (4°C)',
      status: 'Completed',
      notes: 'Final aseptic container sample for release inspection.',
      createdAt: new Date('2026-09-15T15:00:00Z'),
    },
    {
      _id: s3Id,
      sampleCode: 'S-1003',
      batchId: b2Id,
      sampleType: 'In-Process',
      samplingPoint: 'Post-Homogenizer Sampling Cock',
      collectorName: 'K. Sundaram',
      collectedAt: '2026-09-27',
      priority: 'High',
      storageCondition: 'Chilled (2-4°C)',
      status: 'Completed',
      notes: 'Continuous flow verification for fat dispersion.',
      createdAt: new Date('2026-09-27T07:15:00Z'),
    },
    {
      _id: s4Id,
      sampleCode: 'S-1004',
      batchId: b2Id,
      sampleType: 'Finished Product',
      samplingPoint: 'Automated Pouch Packing Station',
      collectorName: 'K. Sundaram',
      collectedAt: '2026-09-27',
      priority: 'Urgent',
      storageCondition: 'Chilled (2-4°C)',
      status: 'In Testing',
      notes: 'Incubation sample for shelf-life testing and pathogen verification.',
      createdAt: new Date('2026-09-27T09:30:00Z'),
    },
    {
      _id: s5Id,
      sampleCode: 'S-1005',
      batchId: b3Id,
      sampleType: 'In-Process',
      samplingPoint: 'Concentration Vacuum Pan #4',
      collectorName: 'M. Ali',
      collectedAt: '2026-09-20',
      priority: 'Normal',
      storageCondition: 'Ambient (25°C)',
      status: 'Flagged',
      notes: 'Taste and salinity checked after salt addition.',
      createdAt: new Date('2026-09-20T11:45:00Z'),
    },
    {
      _id: s6Id,
      sampleCode: 'S-1006',
      batchId: b4Id,
      sampleType: 'Environmental Swab',
      samplingPoint: 'Capper Chuck Contact Area',
      collectorName: 'L. Gomez',
      collectedAt: '2026-09-26',
      priority: 'Normal',
      storageCondition: 'Transport Medium (4°C)',
      status: 'Completed',
      notes: 'Pre-production sanitation validation swab.',
      createdAt: new Date('2026-09-26T13:30:00Z'),
    },
    {
      _id: s7Id,
      sampleCode: 'S-1007',
      batchId: b4Id,
      sampleType: 'Finished Product',
      samplingPoint: 'End of Line Palletizing Inspection',
      collectorName: 'L. Gomez',
      collectedAt: '2026-09-26',
      priority: 'Normal',
      storageCondition: 'Ambient (20°C)',
      status: 'In Testing',
      notes: 'Final packaged beverage for fizzy beverage release criteria.',
      createdAt: new Date('2026-09-26T16:00:00Z'),
    },
  ];

  const tests = [
    // S-1001 tests
    {
      _id: generateId(),
      sampleId: s1Id,
      batchId: b1Id,
      testName: 'Total Soluble Solids (Brix)',
      category: 'Chemical',
      resultValue: '18.5',
      unit: '°Brix',
      specificationMin: 16.0,
      specificationMax: 22.0,
      specification: '16.0 - 22.0 °Brix',
      status: 'Pass',
      analystName: 'S. Kulkarni',
      testedAt: '2026-09-15',
      remarks: 'Digital Refractometer reading conforms to Grade A standards.',
      createdAt: new Date('2026-09-15T10:00:00Z'),
    },
    {
      _id: generateId(),
      sampleId: s1Id,
      batchId: b1Id,
      testName: 'Acidity (as Anhydrous Citric Acid)',
      category: 'Chemical',
      resultValue: '0.42',
      unit: '%',
      specificationMin: 0.35,
      specificationMax: 0.55,
      specification: '0.35 - 0.55 %',
      status: 'Pass',
      analystName: 'S. Kulkarni',
      testedAt: '2026-09-15',
      remarks: 'Titration with 0.1N NaOH using phenolphthalein.',
      createdAt: new Date('2026-09-15T11:00:00Z'),
    },
    // S-1002 tests
    {
      _id: generateId(),
      sampleId: s2Id,
      batchId: b1Id,
      testName: 'pH Level @ 20°C',
      category: 'Chemical',
      resultValue: '3.92',
      unit: 'pH',
      specificationMin: 3.80,
      specificationMax: 4.20,
      specification: '3.80 - 4.20 pH',
      status: 'Pass',
      analystName: 'S. Kulkarni',
      testedAt: '2026-09-15',
      remarks: 'Calibrated pH meter reading optimal for commercial sterility.',
      createdAt: new Date('2026-09-15T16:00:00Z'),
    },
    {
      _id: generateId(),
      sampleId: s2Id,
      batchId: b1Id,
      testName: 'Aerobic Plate Count (Total Bacterial Count)',
      category: 'Microbiological',
      resultValue: '< 10',
      unit: 'CFU/g',
      specificationMin: null,
      specificationMax: 50,
      specification: '< 50 CFU/g',
      status: 'Pass',
      analystName: 'Dr. Nawaz John',
      testedAt: '2026-09-17',
      remarks: 'Incubated at 35°C for 48 hrs on Plate Count Agar.',
      createdAt: new Date('2026-09-15T16:30:00Z'),
    },
    {
      _id: generateId(),
      sampleId: s2Id,
      batchId: b1Id,
      testName: 'Yeast & Mold Count',
      category: 'Microbiological',
      resultValue: 'Absent',
      unit: 'CFU/g',
      specificationMin: null,
      specificationMax: null,
      specification: 'Absent / 0.1g',
      status: 'Pass',
      analystName: 'Dr. Nawaz John',
      testedAt: '2026-09-17',
      remarks: 'Chloramphenicol Rose Bengal agar incubation negative.',
      createdAt: new Date('2026-09-15T16:45:00Z'),
    },
    // S-1003 tests
    {
      _id: generateId(),
      sampleId: s3Id,
      batchId: b2Id,
      testName: 'Milk Fat Content',
      category: 'Quality',
      resultValue: '3.82',
      unit: '%',
      specificationMin: 3.50,
      specificationMax: 4.20,
      specification: '3.50 - 4.20 %',
      status: 'Pass',
      analystName: 'A. Joseph',
      testedAt: '2026-09-27',
      remarks: 'Gerber method extraction shows uniform homogenization.',
      createdAt: new Date('2026-09-27T08:00:00Z'),
    },
    {
      _id: generateId(),
      sampleId: s3Id,
      batchId: b2Id,
      testName: 'Solids-Not-Fat (SNF)',
      category: 'Quality',
      resultValue: '8.68',
      unit: '%',
      specificationMin: 8.50,
      specificationMax: 9.50,
      specification: '>= 8.50 %',
      status: 'Pass',
      analystName: 'A. Joseph',
      testedAt: '2026-09-27',
      remarks: 'Richmond formula calculation compliant with FSSAI regulations.',
      createdAt: new Date('2026-09-27T08:30:00Z'),
    },
    // S-1004 tests
    {
      _id: generateId(),
      sampleId: s4Id,
      batchId: b2Id,
      testName: 'Alkaline Phosphatase Pasteurization Test',
      category: 'Chemical',
      resultValue: 'Negative',
      unit: 'Status',
      specificationMin: null,
      specificationMax: null,
      specification: 'Negative (Complete Pasteurization)',
      status: 'Pass',
      analystName: 'A. Joseph',
      testedAt: '2026-09-27',
      remarks: 'Enzyme fully denatured. Pasteurization confirmed effective.',
      createdAt: new Date('2026-09-27T10:15:00Z'),
    },
    {
      _id: generateId(),
      sampleId: s4Id,
      batchId: b2Id,
      testName: 'Coliform Count',
      category: 'Microbiological',
      resultValue: 'Pending',
      unit: 'CFU/ml',
      specificationMin: null,
      specificationMax: 10,
      specification: '< 10 CFU/ml',
      status: 'Pending',
      analystName: 'Dr. Nawaz John',
      testedAt: null,
      remarks: 'Incubation underway on VRBL agar.',
      createdAt: new Date('2026-09-27T10:30:00Z'),
    },
    // S-1005 tests
    {
      _id: generateId(),
      sampleId: s5Id,
      batchId: b3Id,
      testName: 'Salt (Sodium Chloride) Content',
      category: 'Chemical',
      resultValue: '2.85',
      unit: '%',
      specificationMin: 1.50,
      specificationMax: 2.20,
      specification: '1.50 - 2.20 %',
      status: 'Fail',
      analystName: 'M. Ali',
      testedAt: '2026-09-20',
      remarks: 'Mohr method titration: Exceeds maximum 2.20% recipe threshold. Batch quarantined.',
      createdAt: new Date('2026-09-20T12:00:00Z'),
    },
    {
      _id: generateId(),
      sampleId: s5Id,
      batchId: b3Id,
      testName: 'Natural Tomato Soluble Solids',
      category: 'Quality',
      resultValue: '28.4',
      unit: '°Brix',
      specificationMin: 28.0,
      specificationMax: 30.0,
      specification: '28.0 - 30.0 °Brix',
      status: 'Pass',
      analystName: 'M. Ali',
      testedAt: '2026-09-20',
      remarks: 'Brix concentration met required density.',
      createdAt: new Date('2026-09-20T12:30:00Z'),
    },
    // S-1006 tests
    {
      _id: generateId(),
      sampleId: s6Id,
      batchId: b4Id,
      testName: 'Surface Hygiene ATP Bioluminescence',
      category: 'Quality',
      resultValue: '14',
      unit: 'RLU',
      specificationMin: null,
      specificationMax: 30,
      specification: '< 30 RLU',
      status: 'Pass',
      analystName: 'L. Gomez',
      testedAt: '2026-09-26',
      remarks: 'Sanitation swap passed clean benchmark.',
      createdAt: new Date('2026-09-26T14:15:00Z'),
    },
    // S-1007 tests
    {
      _id: generateId(),
      sampleId: s7Id,
      batchId: b4Id,
      testName: 'Carbonation Gas Volume',
      category: 'Physical',
      resultValue: '3.35',
      unit: 'Vol CO2',
      specificationMin: 3.10,
      specificationMax: 3.60,
      specification: '3.10 - 3.60 Vol',
      status: 'Pass',
      analystName: 'L. Gomez',
      testedAt: '2026-09-26',
      remarks: 'Pressure gauge at 20°C is within target sparkling effervescence.',
      createdAt: new Date('2026-09-26T16:30:00Z'),
    },
    {
      _id: generateId(),
      sampleId: s7Id,
      batchId: b4Id,
      testName: 'Sodium Benzoate Preservative Concentration',
      category: 'Chemical',
      resultValue: 'Pending',
      unit: 'ppm',
      specificationMin: 80,
      specificationMax: 150,
      specification: '< 150 ppm',
      status: 'Pending',
      analystName: 'Dr. Nawaz John',
      testedAt: null,
      remarks: 'HPLC chromatography run scheduled.',
      createdAt: new Date('2026-09-26T17:00:00Z'),
    },
  ];

  return { batches, samples, tests };
}

// Initialize seed data into memory
const seed = getSeedData();
memBatches = seed.batches;
memSamples = seed.samples;
memTests = seed.tests;

export async function connectDB() {
  console.log('----------------------------------------------------');
  console.log('[MERN STACK] Initializing MongoDB connection...');
  console.log(`[MongoDB URI]: ${MONGODB_URI.replace(/:([^:@]{3,})@/, ':****@')}`);

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 2500,
    });
    isMongoConnected = true;
    connectionError = null;
    console.log('[MongoDB] Successfully connected to live MongoDB database!');

    // Seed database if empty
    const batchCount = await Batch.countDocuments();
    if (batchCount === 0) {
      console.log('[MongoDB] Database is empty. Seeding initial food processing laboratory data...');
      const seedData = getSeedData();
      await Batch.insertMany(seedData.batches);
      await Sample.insertMany(seedData.samples);
      await Test.insertMany(seedData.tests);
      console.log(`[MongoDB] Seeded ${seedData.batches.length} batches, ${seedData.samples.length} samples, and ${seedData.tests.length} tests.`);
    } else {
      console.log(`[MongoDB] Existing records found (${batchCount} batches). Ready.`);
    }
  } catch (err) {
    isMongoConnected = false;
    connectionError = err.message;
    console.warn(`[MongoDB Warning] Could not connect to local MongoDB daemon (${err.message}).`);
    console.warn('[FoodLab MERN] Server will continue running smoothly with zero crashes using MongoDB-compatible in-memory driver.');
    console.warn('[MongoDB Setup Tip] To connect to persistent MongoDB:');
    console.warn('   1. Start your local MongoDB server: "net start MongoDB" or "mongod"');
    console.warn('   2. OR paste your free MongoDB Atlas URI in server/.env: MONGODB_URI=mongodb+srv://...');
  }
  console.log('----------------------------------------------------');
}

export function getConnectionStatus() {
  return {
    stack: 'MERN (MongoDB, Express, React, Node.js)',
    isMongoConnected,
    connectionError,
    uri: MONGODB_URI.replace(/:([^:@]{3,})@/, ':****@'),
    activeMode: isMongoConnected ? 'Live MongoDB Database' : 'MongoDB In-Memory Driver Mode (Ready for local mongod or Atlas URI)',
  };
}

// Unified Repository Layer for MERN Stack operations:
export const dbRepo = {
  // DASHBOARD
  async getDashboard() {
    if (isMongoConnected) {
      try {
        const [batches, samples, tests, passed, failed, pending, recent] = await Promise.all([
          Batch.countDocuments(),
          Sample.countDocuments(),
          Test.countDocuments(),
          Test.countDocuments({ status: 'Pass' }),
          Test.countDocuments({ status: 'Fail' }),
          Test.countDocuments({ status: 'Pending' }),
          Test.find()
            .populate('sampleId', 'sampleCode sampleType')
            .populate('batchId', 'batchCode productName')
            .sort({ createdAt: -1 })
            .limit(8)
            .lean(),
        ]);

        const mappedRecent = recent.map((t) => ({
          _id: t._id,
          id: t._id,
          test_name: t.testName,
          category: t.category,
          result_value: t.resultValue,
          unit: t.unit,
          specification: t.specification,
          status: t.status,
          tested_at: t.testedAt,
          sample_code: t.sampleId?.sampleCode || '—',
          batch_code: t.batchId?.batchCode || '—',
          product_name: t.batchId?.productName || '—',
        }));

        return { batches, samples, tests, passed, failed, pending, recent: mappedRecent };
      } catch (err) {
        console.error('Mongo error in getDashboard, falling back:', err);
      }
    }

    // In-memory fallback
    const batches = memBatches.length;
    const samples = memSamples.length;
    const tests = memTests.length;
    const passed = memTests.filter((t) => t.status === 'Pass').length;
    const failed = memTests.filter((t) => t.status === 'Fail').length;
    const pending = memTests.filter((t) => t.status === 'Pending').length;

    const recent = [...memTests]
      .reverse()
      .slice(0, 8)
      .map((t) => {
        const sample = memSamples.find((s) => String(s._id) === String(t.sampleId));
        const batch = memBatches.find((b) => String(b._id) === String(t.batchId));
        return {
          _id: t._id,
          id: t._id,
          test_name: t.testName,
          category: t.category,
          result_value: t.resultValue,
          unit: t.unit,
          specification: t.specification,
          status: t.status,
          tested_at: t.testedAt,
          sample_code: sample?.sampleCode || '—',
          batch_code: batch?.batchCode || '—',
          product_name: batch?.productName || '—',
        };
      });

    return { batches, samples, tests, passed, failed, pending, recent };
  },

  // BATCHES
  async getBatches() {
    if (isMongoConnected) {
      try {
        const batches = await Batch.find().sort({ createdAt: -1 }).lean();
        const samples = await Sample.find().lean();
        const tests = await Test.find().lean();

        return batches.map((b) => {
          const bSamples = samples.filter((s) => String(s.batchId) === String(b._id));
          const bTests = tests.filter((t) => String(t.batchId) === String(b._id));
          return {
            _id: b._id,
            id: b._id,
            batch_code: b.batchCode,
            product_name: b.productName,
            category: b.category,
            production_date: b.productionDate,
            expiry_date: b.expiryDate,
            batch_size: b.batchSize,
            unit: b.unit,
            status: b.status,
            supervisor: b.supervisor,
            notes: b.notes,
            sample_count: bSamples.length,
            test_count: bTests.length,
          };
        });
      } catch (err) {
        console.error('Mongo getBatches error:', err);
      }
    }

    return memBatches.map((b) => {
      const bSamples = memSamples.filter((s) => String(s.batchId) === String(b._id));
      const bTests = memTests.filter((t) => String(t.batchId) === String(b._id));
      return {
        _id: b._id,
        id: b._id,
        batch_code: b.batchCode,
        product_name: b.productName,
        category: b.category,
        production_date: b.productionDate,
        expiry_date: b.expiryDate,
        batch_size: b.batchSize,
        unit: b.unit,
        status: b.status,
        supervisor: b.supervisor,
        notes: b.notes,
        sample_count: bSamples.length,
        test_count: bTests.length,
      };
    });
  },

  async createBatch(data) {
    const batchCode = (data.batch_code || data.batchCode || '').trim().toUpperCase();
    const productName = (data.product_name || data.productName || '').trim();
    const productionDate = data.production_date || data.productionDate;
    const expiryDate = data.expiry_date || data.expiryDate || null;
    const category = data.category || 'Processed Fruits';
    const status = data.status || 'In Testing';
    const supervisor = data.supervisor || 'Dr. Nawaz John';
    const notes = data.notes || '';

    if (!batchCode || !productName || !productionDate) {
      throw new Error('batchCode, productName and productionDate are required');
    }

    const batchSize = data.batch_size !== undefined ? Number(data.batch_size) : (data.batchSize !== undefined ? Number(data.batchSize) : 1000);
    const unit = data.unit || 'units';

    if (isMongoConnected) {
      const created = await Batch.create({
        batchCode,
        productName,
        category,
        productionDate,
        expiryDate,
        batchSize,
        unit,
        status,
        supervisor,
        notes,
      });
      return {
        _id: created._id,
        id: created._id,
        batch_code: created.batchCode,
        product_name: created.productName,
        category: created.category,
        production_date: created.productionDate,
        expiry_date: created.expiryDate,
        batch_size: created.batchSize,
        unit: created.unit,
        status: created.status,
        supervisor: created.supervisor,
        notes: created.notes,
      };
    }

    const exists = memBatches.some((b) => b.batchCode.toLowerCase() === batchCode.toLowerCase());
    if (exists) throw new Error(`Batch code "${batchCode}" already exists.`);

    const newBatch = {
      _id: generateId(),
      batchCode,
      productName,
      category,
      productionDate,
      expiryDate,
      batchSize,
      unit,
      status,
      supervisor,
      notes,
      createdAt: new Date(),
    };
    memBatches.unshift(newBatch);
    return {
      _id: newBatch._id,
      id: newBatch._id,
      batch_code: newBatch.batchCode,
      product_name: newBatch.productName,
      category: newBatch.category,
      production_date: newBatch.productionDate,
      expiry_date: newBatch.expiryDate,
      batch_size: newBatch.batchSize,
      unit: newBatch.unit,
      status: newBatch.status,
      supervisor: newBatch.supervisor,
      notes: newBatch.notes,
    };
  },

  async updateBatchStatus(id, newStatus) {
    if (isMongoConnected) {
      const updated = await Batch.findByIdAndUpdate(id, { status: newStatus }, { new: true });
      return updated;
    }
    const batch = memBatches.find((b) => String(b._id) === String(id));
    if (!batch) throw new Error('Batch not found');
    batch.status = newStatus;
    return batch;
  },

  // SAMPLES
  async getSamples() {
    if (isMongoConnected) {
      try {
        const samples = await Sample.find().populate('batchId').sort({ createdAt: -1 }).lean();
        return samples.map((s) => ({
          _id: s._id,
          id: s._id,
          sample_code: s.sampleCode,
          batch_id: s.batchId?._id || s.batchId,
          batch_code: s.batchId?.batchCode || '—',
          product_name: s.batchId?.productName || '—',
          sample_type: s.sampleType,
          sampling_point: s.samplingPoint,
          collector_name: s.collectorName,
          collected_at: s.collectedAt,
          priority: s.priority,
          storage_condition: s.storageCondition,
          status: s.status,
          notes: s.notes,
        }));
      } catch (err) {
        console.error('Mongo getSamples error:', err);
      }
    }

    return memSamples.map((s) => {
      const batch = memBatches.find((b) => String(b._id) === String(s.batchId));
      return {
        _id: s._id,
        id: s._id,
        sample_code: s.sampleCode,
        batch_id: s.batchId,
        batch_code: batch?.batchCode || '—',
        product_name: batch?.productName || '—',
        sample_type: s.sampleType,
        sampling_point: s.samplingPoint,
        collector_name: s.collectorName,
        collected_at: s.collectedAt,
        priority: s.priority,
        storage_condition: s.storageCondition,
        status: s.status,
        notes: s.notes,
      };
    });
  },

  async createSample(data) {
    const sampleCode = (data.sample_code || data.sampleCode || '').trim().toUpperCase();
    const batchId = data.batch_id || data.batchId;
    const sampleType = data.sample_type || data.sampleType || 'Finished Product';
    const collectedAt = data.collected_at || data.collectedAt;
    const samplingPoint = data.sampling_point || data.samplingPoint || 'Processing Line';
    const priority = data.priority || 'Normal';
    const status = data.status || 'Pending';
    const collectorName = data.collector_name || data.collectorName || 'Quality Tech';

    if (!sampleCode || !batchId || !collectedAt) {
      throw new Error('sampleCode, batchId and collectedAt are required');
    }

    if (isMongoConnected) {
      const created = await Sample.create({
        sampleCode,
        batchId,
        sampleType,
        collectedAt,
        samplingPoint,
        priority,
        status,
        collectorName,
      });
      const populated = await Sample.findById(created._id).populate('batchId').lean();
      return {
        _id: populated._id,
        id: populated._id,
        sample_code: populated.sampleCode,
        batch_id: populated.batchId?._id,
        batch_code: populated.batchId?.batchCode,
        product_name: populated.batchId?.productName,
        sample_type: populated.sampleType,
        collected_at: populated.collectedAt,
        status: populated.status,
      };
    }

    const exists = memSamples.some((s) => s.sampleCode.toLowerCase() === sampleCode.toLowerCase());
    if (exists) throw new Error(`Sample code "${sampleCode}" already exists.`);

    const newSample = {
      _id: generateId(),
      sampleCode,
      batchId,
      sampleType,
      collectedAt,
      samplingPoint,
      priority,
      status,
      collectorName,
      storageCondition: 'Ambient',
      createdAt: new Date(),
    };
    memSamples.unshift(newSample);
    const batch = memBatches.find((b) => String(b._id) === String(batchId));

    return {
      _id: newSample._id,
      id: newSample._id,
      sample_code: newSample.sampleCode,
      batch_id: newSample.batchId,
      batch_code: batch?.batchCode || '—',
      product_name: batch?.productName || '—',
      sample_type: newSample.sampleType,
      collected_at: newSample.collectedAt,
      status: newSample.status,
    };
  },

  // TESTS
  async getTests() {
    if (isMongoConnected) {
      try {
        const tests = await Test.find()
          .populate('sampleId')
          .populate('batchId')
          .sort({ createdAt: -1 })
          .lean();
        return tests.map((t) => ({
          _id: t._id,
          id: t._id,
          test_name: t.testName,
          category: t.category,
          sample_id: t.sampleId?._id || t.sampleId,
          sample_code: t.sampleId?.sampleCode || '—',
          batch_id: t.batchId?._id || t.batchId,
          batch_code: t.batchId?.batchCode || '—',
          product_name: t.batchId?.productName || '—',
          result_value: t.resultValue,
          unit: t.unit,
          specification: t.specification,
          status: t.status,
          analyst_name: t.analystName,
          tested_at: t.testedAt,
          remarks: t.remarks,
        }));
      } catch (err) {
        console.error('Mongo getTests error:', err);
      }
    }

    return memTests.map((t) => {
      const sample = memSamples.find((s) => String(s._id) === String(t.sampleId));
      const batch = memBatches.find((b) => String(b._id) === String(t.batchId));
      return {
        _id: t._id,
        id: t._id,
        test_name: t.testName,
        category: t.category,
        sample_id: t.sampleId,
        sample_code: sample?.sampleCode || '—',
        batch_id: t.batchId,
        batch_code: batch?.batchCode || '—',
        product_name: batch?.productName || '—',
        result_value: t.resultValue,
        unit: t.unit,
        specification: t.specification,
        status: t.status,
        analyst_name: t.analystName,
        tested_at: t.testedAt,
        remarks: t.remarks,
      };
    });
  },

  async createTest(data) {
    const sampleId = data.sample_id || data.sampleId;
    let batchId = data.batch_id || data.batchId;
    const testName = (data.test_name || data.testName || '').trim();
    const category = data.category || 'Chemical';
    const resultValue = data.result_value !== undefined ? String(data.result_value) : '';
    const unit = data.unit || '';
    const specification = data.specification || '';
    let status = data.status || 'Pending';
    const analystName = data.analyst_name || data.analystName || 'Dr. Nawaz John';
    const testedAt = data.tested_at || data.testedAt || (resultValue ? new Date().toISOString().slice(0, 10) : null);
    const remarks = data.remarks || '';

    if (!sampleId || !testName || !category) {
      throw new Error('sampleId, testName and category are required');
    }

    // Auto find batchId from sample if not directly provided
    if (!batchId) {
      if (isMongoConnected) {
        const sampleDoc = await Sample.findById(sampleId);
        if (sampleDoc) batchId = sampleDoc.batchId;
      } else {
        const sampleDoc = memSamples.find((s) => String(s._id) === String(sampleId));
        if (sampleDoc) batchId = sampleDoc.batchId;
      }
    }

    // Auto evaluate status if numeric range or absent check
    if (resultValue && status === 'Pending') {
      const num = parseFloat(resultValue);
      if (!isNaN(num) && specification) {
        const rangeMatch = specification.match(/([0-9.]+)\s*-\s*([0-9.]+)/);
        if (rangeMatch) {
          const min = parseFloat(rangeMatch[1]);
          const max = parseFloat(rangeMatch[2]);
          status = num >= min && num <= max ? 'Pass' : 'Fail';
        }
      }
    }

    if (isMongoConnected) {
      const created = await Test.create({
        sampleId,
        batchId,
        testName,
        category,
        resultValue,
        unit,
        specification,
        status,
        analystName,
        testedAt,
        remarks,
      });
      return {
        _id: created._id,
        id: created._id,
        test_name: created.testName,
        category: created.category,
        result_value: created.resultValue,
        unit: created.unit,
        specification: created.specification,
        status: created.status,
      };
    }

    const newTest = {
      _id: generateId(),
      sampleId,
      batchId,
      testName,
      category,
      resultValue,
      unit,
      specification,
      status,
      analystName,
      testedAt,
      remarks,
      createdAt: new Date(),
    };
    memTests.unshift(newTest);
    return {
      _id: newTest._id,
      id: newTest._id,
      test_name: newTest.testName,
      category: newTest.category,
      result_value: newTest.resultValue,
      unit: newTest.unit,
      specification: newTest.specification,
      status: newTest.status,
    };
  },

  async updateTest(id, data) {
    const resultValue = data.result_value !== undefined ? String(data.result_value) : '';
    const unit = data.unit !== undefined ? data.unit : '';
    const specification = data.specification !== undefined ? data.specification : '';
    let status = data.status || 'Pending';
    const testedAt = data.tested_at || (resultValue ? new Date().toISOString().slice(0, 10) : null);
    const remarks = data.remarks !== undefined ? data.remarks : '';

    if (resultValue && (status === 'Pending' || !data.status)) {
      const num = parseFloat(resultValue);
      if (!isNaN(num) && specification) {
        const rangeMatch = specification.match(/([0-9.]+)\s*-\s*([0-9.]+)/);
        if (rangeMatch) {
          const min = parseFloat(rangeMatch[1]);
          const max = parseFloat(rangeMatch[2]);
          status = num >= min && num <= max ? 'Pass' : 'Fail';
        }
      }
    }

    if (isMongoConnected) {
      const updated = await Test.findByIdAndUpdate(
        id,
        { resultValue, unit, specification, status, testedAt, remarks },
        { new: true }
      );
      if (!updated) throw new Error('Test not found');
      return updated;
    }

    const test = memTests.find((t) => String(t._id) === String(id));
    if (!test) throw new Error('Test not found');

    test.resultValue = resultValue;
    if (unit) test.unit = unit;
    if (specification) test.specification = specification;
    test.status = status;
    test.testedAt = testedAt;
    test.remarks = remarks;

    return test;
  },

  // COMPLIANCE & REPORTS
  async getReports() {
    const batches = await this.getBatches();
    const samples = await this.getSamples();
    const tests = await this.getTests();

    const reportRows = [];
    for (const b of batches) {
      const bSamples = samples.filter((s) => String(s.batch_id) === String(b._id));
      if (bSamples.length === 0) {
        reportRows.push({
          batch_id: b._id,
          batch_code: b.batch_code,
          product_name: b.product_name,
          production_date: b.production_date,
          expiry_date: b.expiry_date,
          batch_status: b.status,
          sample_id: null,
          sample_code: null,
          sample_type: null,
          sample_status: null,
          test_id: null,
          test_name: null,
          category: null,
          result_value: null,
          unit: null,
          specification: null,
          test_status: null,
          tested_at: null,
        });
      } else {
        for (const s of bSamples) {
          const sTests = tests.filter((t) => String(t.sample_id) === String(s._id));
          if (sTests.length === 0) {
            reportRows.push({
              batch_id: b._id,
              batch_code: b.batch_code,
              product_name: b.product_name,
              production_date: b.production_date,
              expiry_date: b.expiry_date,
              batch_status: b.status,
              sample_id: s._id,
              sample_code: s.sample_code,
              sample_type: s.sample_type,
              sample_status: s.status,
              test_id: null,
              test_name: null,
              category: null,
              result_value: null,
              unit: null,
              specification: null,
              test_status: null,
              tested_at: null,
            });
          } else {
            for (const t of sTests) {
              reportRows.push({
                batch_id: b._id,
                batch_code: b.batch_code,
                product_name: b.product_name,
                production_date: b.production_date,
                expiry_date: b.expiry_date,
                batch_status: b.status,
                sample_id: s._id,
                sample_code: s.sample_code,
                sample_type: s.sample_type,
                sample_status: s.status,
                test_id: t._id,
                test_name: t.test_name,
                category: t.category,
                result_value: t.result_value,
                unit: t.unit,
                specification: t.specification,
                test_status: t.status,
                tested_at: t.tested_at,
              });
            }
          }
        }
      }
    }
    return reportRows;
  },

  // Reset/Re-seed
  async resetAndSeed() {
    const seedData = getSeedData();
    if (isMongoConnected) {
      await Batch.deleteMany({});
      await Sample.deleteMany({});
      await Test.deleteMany({});
      await Batch.insertMany(seedData.batches);
      await Sample.insertMany(seedData.samples);
      await Test.insertMany(seedData.tests);
    }
    memBatches = seedData.batches;
    memSamples = seedData.samples;
    memTests = seedData.tests;
    return { success: true, message: 'Database reseeded successfully.' };
  },
};

export default { connectDB, getConnectionStatus, dbRepo };
