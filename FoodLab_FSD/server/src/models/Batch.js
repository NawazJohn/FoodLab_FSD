import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema(
  {
    batchCode: {
      type: String,
      required: [true, 'Batch code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Processed Fruits', 'Dairy', 'Beverages', 'Sauces & Condiments', 'Bakery', 'Confectionery', 'Snacks'],
      default: 'Processed Fruits',
    },
    productionDate: {
      type: String,
      required: [true, 'Production date is required'],
    },
    expiryDate: {
      type: String,
      default: null,
    },
    batchSize: {
      type: Number,
      default: 1000,
    },
    unit: {
      type: String,
      default: 'kg',
    },
    status: {
      type: String,
      enum: ['In Testing', 'Approved', 'Hold', 'Rejected', 'Quarantined'],
      default: 'In Testing',
    },
    supervisor: {
      type: String,
      default: 'Dr. Nawaz John',
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

// Virtuals to populate samples
batchSchema.virtual('samples', {
  ref: 'Sample',
  localField: '_id',
  foreignField: 'batchId',
});

const Batch = mongoose.models.Batch || mongoose.model('Batch', batchSchema);

export default Batch;
