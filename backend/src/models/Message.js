import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: [true, 'Message text cannot be empty'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    attachments: [
      {
        url: { type: String, required: true },
        fileType: { type: String, default: 'image' },
        fileName: { type: String, default: '' }
      }
    ],
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

messageSchema.index({ conversation: 1, createdAt: 1 });
messageSchema.index({ recipient: 1, isRead: 1 });

export const Message = mongoose.model('Message', messageSchema);
