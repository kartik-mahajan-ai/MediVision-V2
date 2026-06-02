const express = require('express');
const User = require('../models/User');
const XRayAnalysis = require('../models/XRayAnalysis');
const SymptomCheck = require('../models/SymptomCheck');
const auth = require('../middleware/auth');

const router = express.Router();

// Get global stats (for landing page)
router.get('/global', async (req, res) => {
    try {
        const [profileCount, xrayCount, symptomCount] = await Promise.all([
            User.countDocuments(),
            XRayAnalysis.countDocuments(),
            SymptomCheck.countDocuments()
        ]);

        res.json({
            profiles: profileCount,
            xray_analyses: xrayCount,
            symptom_checks: symptomCount
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Get user stats
router.get('/user', auth, async (req, res) => {
    try {
        const [xrayCount, symptomCount] = await Promise.all([
            XRayAnalysis.countDocuments({ user_id: req.user._id }),
            SymptomCheck.countDocuments({ user_id: req.user._id })
        ]);

        res.json({
            xray_analyses: xrayCount,
            symptom_checks: symptomCount,
            total: xrayCount + symptomCount
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user stats' });
    }
});

module.exports = router;
