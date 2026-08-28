import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service'
    },
    itemType: {
      type: String,
      enum: ['PROVIDER', 'SERVICE'],
      default: 'PROVIDER'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Use partialFilterExpression so documents without provider/service are NOT indexed under the wrong unique constraint
favoriteSchema.index(
  { customer: 1, provider: 1 },
  { unique: true, partialFilterExpression: { provider: { $exists: true, $type: 'objectId' } } }
);

favoriteSchema.index(
  { customer: 1, service: 1 },
  { unique: true, partialFilterExpression: { service: { $exists: true, $type: 'objectId' } } }
);

export const Favorite = mongoose.model('Favorite', favoriteSchema);
