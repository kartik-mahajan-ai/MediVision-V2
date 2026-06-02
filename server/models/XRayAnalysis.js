const mongoose = require('mongoose');

const xrayAnalysisSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    image_url: {
        type: String,
        required: true
    },
    image_data: {
        type: String // Base64 encoded image for storage
    },
    prediction: {
        type: String,
        required: true,
        enum: ['covid19', 'pneumonia', 'non_covid', 'normal', 'inconclusive']
    },
    confidence: {
        type: Number,
        required: true
    },
    all_predictions: {
        covid19: Number,
        pneumonia: Number,
        normal: Number
    },
    notes: {
        type: String,
        default: null
    },
    heatmap_image: {
        type: String,
        default: null
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('XRayAnalysis', xrayAnalysisSchema);
