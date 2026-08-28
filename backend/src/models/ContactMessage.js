import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['UNREAD', 'READ', 'REPLIED'],
      default: 'UNREAD'
    },
    adminReply: {
      comment: String,
      repliedAt: Date,
      repliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }
  },
  {
    timestamps: true
  }
);

contactMessageSchema.index({ createdAt: -1 });
contactMessageSchema.index({ status: 1 });

export const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);
