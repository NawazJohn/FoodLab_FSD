import mongoose from 'mongoose';

const sampleSchema = new mongoose.Schema(
  {
    sampleCode: {
      type: String,
      required: [true, 'Sample code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: [true, 'Batch reference is required'],
    },
    sampleType: {
      type: String,
      enum: ['Raw Material', 'In-Process', 'Finished Product', 'Packaging', 'Environmental Swab'],
      default: 'Finished Product',
    },
    samplingPoint: {
      type: String,
      default: 'Main Processing Line',
    },
    collectorName: {
      type: String,
      default: 'Quality Inspector',
    },
    collectedAt: {
      type: String,
      required: [true, 'Collection date is required'],
    },
    priority: {
      type: String,
      enum: ['Normal', 'High', 'Urgent'],
      default: 'Normal',
    },
    storageCondition: {
      type: String,
      default: 'Ambient (20-25°C)',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Testing', 'Completed', 'Flagged'],
      default: 'Pending',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for tests on this sample
sampleSchema.virtual('tests', {
  ref: 'Test',
  localField: '_id',
  foreignField: 'sampleId',
});

const Sample = mongoose.models.Sample || mongoose.model('Sample', sampleSchema);

export default Sample;
