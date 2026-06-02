const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    conversation_id: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['user', 'assistant', 'system']
    },
    content: {
        type: String,
        required: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index for efficient queries
chatMessageSchema.index({ user_id: 1, conversation_id: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
