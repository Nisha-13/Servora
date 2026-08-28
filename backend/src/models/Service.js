import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      maxlength: [150, 'Service name cannot exceed 150 characters']
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required']
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Provider is required']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    startingPrice: {
      type: Number,
      required: [true, 'Starting price is required'],
      min: [0, 'Starting price must be positive']
    },
    estimatedDuration: {
      type: String,
      required: [true, 'Estimated duration is required'],
      default: '1-2 hours'
    },
    serviceArea: {
      type: [String],
      default: ['All City']
    },
    images: {
      type: [String],
      default: []
    },
    tags: {
      type: [String],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

serviceSchema.index({ name: 'text', description: 'text', tags: 'text' });
serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ provider: 1, isActive: 1 });
serviceSchema.index({ startingPrice: 1 });
serviceSchema.index({ rating: -1 });

export const Service = mongoose.model('Service', serviceSchema);
