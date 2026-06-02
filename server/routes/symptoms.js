const express = require('express');
const SymptomCheck = require('../models/SymptomCheck');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all symptom checks for user
router.get('/', auth, async (req, res) => {
    try {
        const checks = await SymptomCheck.find({ user_id: req.user._id })
            .sort({ created_at: -1 });
        res.json(checks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch symptom checks' });
    }
});

// Get recent symptom checks
router.get('/recent', auth, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const checks = await SymptomCheck.find({ user_id: req.user._id })
            .sort({ created_at: -1 })
            .limit(limit)
            .select('risk_level created_at');
        res.json(checks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch recent checks' });
    }
});

// Get count
router.get('/count', auth, async (req, res) => {
    try {
        const count = await SymptomCheck.countDocuments({ user_id: req.user._id });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get count' });
    }
});

// Create new symptom check
router.post('/', auth, async (req, res) => {
    try {
        const { symptoms, additional_info } = req.body;

        // Call Python AI microservice for symptom analysis
        const axios = require('axios');
        let aiResult = {
            prediction: 'General Health Issue',
            confidence: 0,
            riskLevel: 'moderate',
            urgency: 'Monitor symptoms.',
            recommendations: ['Consult a healthcare professional.']
        };

        try {
            const response = await axios.post('http://localhost:8000/predict/symptoms', {
                selected_symptoms: symptoms
            });
            aiResult = response.data;
        } catch (aiError) {
            console.error('Python AI Service Error:', aiError.message);
            // Fallback is already set in aiResult
        }

        const check = new SymptomCheck({
            user_id: req.user._id,
            symptoms,
            analysis_result: {
                riskLevel: aiResult.riskLevel,
                possibleConditions: [aiResult.prediction],
                recommendations: aiResult.recommendations,
                urgency: aiResult.urgency,
                confidence: aiResult.confidence,
                featureImportance: aiResult.featureImportance
            },
            risk_level: aiResult.riskLevel,
            recommendations: aiResult.recommendations
        });

        await check.save();
        res.status(201).json(check);
    } catch (error) {
        console.error('Create symptom check error:', error);
        res.status(500).json({ error: 'Failed to create symptom check' });
    }
});

module.exports = router;
