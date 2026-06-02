const mongoose = require('mongoose');

const symptomCheckSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    symptoms: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    analysis_result: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    risk_level: {
        type: String,
        enum: ['low', 'moderate', 'high', 'critical'],
        default: null
    },
    recommendations: [{
        type: String
    }]
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('SymptomCheck', symptomCheckSchema);
