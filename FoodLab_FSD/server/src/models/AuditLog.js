import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    entityType: {
      type: String,
      enum: ['Batch', 'Sample', 'Test', 'System'],
      required: true,
    },
    entityId: {
      type: String,
      default: '',
    },
    details: {
      type: String,
      default: '',
    },
    performedBy: {
      type: String,
      default: 'Lab Administrator',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
