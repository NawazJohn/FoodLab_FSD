import mongoose from 'mongoose';

const testSchema = new mongoose.Schema(
  {
    sampleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sample',
      required: [true, 'Sample reference is required'],
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: [true, 'Batch reference is required'],
    },
    testName: {
      type: String,
      required: [true, 'Test name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Chemical', 'Microbiological', 'Quality', 'Physical', 'Sensory'],
      default: 'Chemical',
    },
    resultValue: {
      type: String,
      default: '',
    },
    unit: {
      type: String,
      default: '',
    },
    specificationMin: {
      type: Number,
      default: null,
    },
    specificationMax: {
      type: Number,
      default: null,
    },
    specification: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Pass', 'Fail', 'Retest'],
      default: 'Pending',
    },
    analystName: {
      type: String,
      default: 'FoodLab Senior Analyst',
    },
    testedAt: {
      type: String,
      default: null,
    },
    remarks: {
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

// Helper function to auto-evaluate test result against numeric or text specs
testSchema.methods.evaluateStatus = function () {
  if (this.resultValue === '' || this.resultValue === null || this.resultValue === undefined) {
    this.status = 'Pending';
    return this.status;
  }
  const numericVal = parseFloat(this.resultValue);
  if (!isNaN(numericVal)) {
    if (this.specificationMin !== null && numericVal < this.specificationMin) {
      this.status = 'Fail';
      return this.status;
    }
    if (this.specificationMax !== null && numericVal > this.specificationMax) {
      this.status = 'Fail';
      return this.status;
    }
    if (this.specificationMin !== null || this.specificationMax !== null) {
      this.status = 'Pass';
      return this.status;
    }
  }

  // Text spec fallback
  if (this.specification && this.specification.toLowerCase().includes('absent')) {
    if (String(this.resultValue).toLowerCase().includes('detected') || String(this.resultValue).toLowerCase().includes('positive')) {
      this.status = 'Fail';
    } else {
      this.status = 'Pass';
    }
    return this.status;
  }

  return this.status;
};

const Test = mongoose.models.Test || mongoose.model('Test', testSchema);

export default Test;
