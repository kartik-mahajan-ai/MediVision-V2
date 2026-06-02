const express = require('express');
const XRayAnalysis = require('../models/XRayAnalysis');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all X-ray analyses for user
router.get('/', auth, async (req, res) => {
    try {
        const analyses = await XRayAnalysis.find({ user_id: req.user._id })
            .sort({ created_at: -1 });
        res.json(analyses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch analyses' });
    }
});

// Get recent X-ray analyses
router.get('/recent', auth, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const analyses = await XRayAnalysis.find({ user_id: req.user._id })
            .sort({ created_at: -1 })
            .limit(limit)
            .select('prediction created_at');
        res.json(analyses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch recent analyses' });
    }
});

// Get count
router.get('/count', auth, async (req, res) => {
    try {
        const count = await XRayAnalysis.countDocuments({ user_id: req.user._id });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get count' });
    }
});

// Create new X-ray analysis
router.post('/', auth, async (req, res) => {
    try {
        const { image_url, image_data, prediction, confidence, all_predictions, notes } = req.body;

        const analysis = new XRayAnalysis({
            user_id: req.user._id,
            image_url,
            image_data,
            prediction,
            confidence,
            all_predictions,
            notes
        });

        await analysis.save();
        res.status(201).json(analysis);
    } catch (error) {
        console.error('Create analysis error:', error);
        res.status(500).json({ error: 'Failed to create analysis' });
    }
});

// Upload image and create analysis
router.post('/upload', auth, async (req, res) => {
    try {
        const { image_data, notes } = req.body;

        // Verify if image_data exists
        if (!image_data) {
            return res.status(400).json({ error: 'No image data provided' });
        }

        // Send to FastAPI Python microservice
        const axios = require('axios');
        let pythonPrediction;
        try {
            const pythonResponse = await axios.post('http://127.0.0.1:8000/predict/xray', {
                image_data: image_data
            });
            pythonPrediction = pythonResponse.data;
        } catch (mlError) {
            console.error('Error reaching Python ML service:', mlError.message);
            return res.status(503).json({ 
                error: 'Medical AI service is currently unavailable. Please try again later or contact support.',
                code: 'ML_SERVICE_DOWN'
            });
        }

        // Store image as base64 data URL
        const imageUrl = `data:image/png;base64,${Date.now()}`;

        const analysis = new XRayAnalysis({
            user_id: req.user._id,
            image_url: imageUrl,
            image_data: image_data,
            prediction: pythonPrediction.prediction,
            confidence: pythonPrediction.confidence,
            all_predictions: pythonPrediction.all_predictions,
            heatmap_image: pythonPrediction.heatmap_image,
            notes
        });

        await analysis.save();
        res.status(201).json({
            analysis,
            publicUrl: imageUrl
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload and analyze' });
    }
});

// Stream upload with real-time SSE progress
router.post('/upload/stream', auth, async (req, res) => {
    try {
        const { image_data, notes } = req.body;

        if (!image_data) {
            return res.status(400).json({ error: 'No image data provided' });
        }

        // Set SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();

        const axios = require('axios');

        try {
            // Stream from Python ML service
            const pythonResponse = await axios.post('http://127.0.0.1:8000/predict/xray/stream', {
                image_data: image_data
            }, {
                responseType: 'stream',
                timeout: 120000 // 2 minute timeout for large models
            });

            let fullResult = null;
            let streamBuffer = '';

            // Pipe SSE events from Python to the client
            pythonResponse.data.on('data', (chunk) => {
                const text = chunk.toString();
                res.write(text);

                streamBuffer += text;
                const events = streamBuffer.split('\n\n');
                streamBuffer = events.pop() || ''; // Keep incomplete event in buffer

                for (const event of events) {
                    const lines = event.split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const parsed = JSON.parse(line.substring(6));
                                if (parsed.type === 'result') {
                                    fullResult = parsed.data;
                                }
                            } catch (e) {
                                // Not valid JSON, skip
                            }
                        }
                    }
                }
            });

            pythonResponse.data.on('end', async () => {
                // Save to database after stream completes
                if (fullResult) {
                    try {
                        const imageUrl = `data:image/png;base64,${Date.now()}`;
                        const analysis = new XRayAnalysis({
                            user_id: req.user._id,
                            image_url: imageUrl,
                            image_data: image_data,
                            prediction: fullResult.prediction,
                            confidence: fullResult.confidence,
                            all_predictions: fullResult.all_predictions,
                            heatmap_image: fullResult.heatmap_image,
                            notes
                        });
                        await analysis.save();
                        console.log('Analysis saved to DB after stream');
                    } catch (dbErr) {
                        console.error('Failed to save analysis after stream:', dbErr);
                    }
                }
                res.end();
            });

            pythonResponse.data.on('error', (err) => {
                console.error('Stream error from Python:', err);
                res.write(`data: ${JSON.stringify({ type: 'error', message: 'ML service stream error' })}\n\n`);
                res.end();
            });

        } catch (mlError) {
            console.error('Error reaching Python ML service:', mlError.message);
            res.write(`data: ${JSON.stringify({ type: 'error', message: 'Medical AI service is currently unavailable.' })}\n\n`);
            res.end();
        }

    } catch (error) {
        console.error('Stream upload error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to stream analysis' });
        } else {
            res.write(`data: ${JSON.stringify({ type: 'error', message: 'Internal server error' })}\n\n`);
            res.end();
        }
    }
});

module.exports = router;
