import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    ],
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    lastMessage: {
      type: String,
      default: ''
    },
    lastMessageSender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastMessageAt: {
      type: Date,
      default: Date.now
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {}
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

export const Conversation = mongoose.model('Conversation', conversationSchema);
