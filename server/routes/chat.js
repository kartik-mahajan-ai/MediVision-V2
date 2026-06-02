const express = require('express');
const ChatMessage = require('../models/ChatMessage');
const XRayAnalysis = require('../models/XRayAnalysis');
const SymptomCheck = require('../models/SymptomCheck');
const auth = require('../middleware/auth');

const router = express.Router();

// Smart parameter optimization based on question complexity
function getOptimalParams(message) {
    const msgLower = message.toLowerCase().trim();
    const wordCount = message.split(/\s+/).length;

    // Quick greetings and simple questions
    const quickPatterns = [
        /^(hi|hello|hey|thanks|thank you|ok|okay|bye|goodbye)$/i,
        /^(yes|no|sure|got it|understood)$/i,
        /^what('s| is) your name/i,
        /^how are you/i
    ];

    // Medium complexity - factual questions
    const mediumPatterns = [
        /what (is|are|does|do)/i,
        /tell me about/i,
        /can you (help|tell|explain)/i,
        /^(define|meaning of)/i
    ];

    // High complexity - detailed explanations
    const complexPatterns = [
        /explain (in detail|thoroughly|completely)/i,
        /compare (and contrast)?/i,
        /analyze|analysis/i,
        /summarize (all|my|every)/i,
        /list all|give me all/i,
        /step by step/i,
        /why (does|do|is|are|should)/i
    ];

    // Check for quick responses
    if (quickPatterns.some(p => p.test(msgLower)) || wordCount <= 3) {
        return { max_tokens: 150, temperature: 0.5, complexity: 'quick' };
    }

    // Check for complex queries
    if (complexPatterns.some(p => p.test(msgLower)) || wordCount > 20) {
        return { max_tokens: 2048, temperature: 0.7, complexity: 'detailed' };
    }

    // Check for medium complexity
    if (mediumPatterns.some(p => p.test(msgLower)) || wordCount > 8) {
        return { max_tokens: 512, temperature: 0.6, complexity: 'standard' };
    }

    // Default: balanced params
    return { max_tokens: 384, temperature: 0.6, complexity: 'balanced' };
}

// Get messages for a conversation
router.get('/messages/:conversationId', auth, async (req, res) => {
    try {
        const messages = await ChatMessage.find({
            user_id: req.user._id,
            conversation_id: req.params.conversationId
        }).sort({ created_at: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Get user context (xrays and symptoms for AI)
router.get('/context', auth, async (req, res) => {
    try {
        const xrays = await XRayAnalysis.find({ user_id: req.user._id })
            .sort({ created_at: -1 })
            .limit(5)
            .select('prediction confidence all_predictions notes created_at');

        const symptoms = await SymptomCheck.find({ user_id: req.user._id })
            .sort({ created_at: -1 })
            .limit(5)
            .select('symptoms risk_level recommendations analysis_result created_at');

        res.json({ xrays, symptoms });
    } catch (error) {
        console.error('Context fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch context' });
    }
});

// Create a new message
router.post('/messages', auth, async (req, res) => {
    try {
        const { conversation_id, role, content, metadata } = req.body;

        const message = new ChatMessage({
            user_id: req.user._id,
            conversation_id,
            role,
            content,
            metadata
        });

        await message.save();
        res.status(201).json(message);
    } catch (error) {
        console.error('Create message error:', error);
        res.status(500).json({ error: 'Failed to create message' });
    }
});

// Chat with AI (simple response for now - can be enhanced with actual AI)
router.post('/chat', auth, async (req, res) => {
    try {
        const { message, conversationId } = req.body;

        // Save user message
        const userMessage = new ChatMessage({
            user_id: req.user._id,
            conversation_id: conversationId,
            role: 'user',
            content: message
        });
        await userMessage.save();

        // Get user context for AI response
        const xrays = await XRayAnalysis.find({ user_id: req.user._id })
            .sort({ created_at: -1 })
            .limit(5)
            .select('prediction confidence all_predictions notes created_at');

        const symptoms = await SymptomCheck.find({ user_id: req.user._id })
            .sort({ created_at: -1 })
            .limit(5)
            .select('symptoms risk_level recommendations analysis_result created_at');

        // Generate contextual response using Perplexity AI
        let aiResponse = "";

        const apiKey = process.env.PERPLEXITY_API_KEY;

        if (!apiKey) {
            // Fallback to local logic if no API key
            console.warn('No PERPLEXITY_API_KEY found, using fallback logic');
            if (message.toLowerCase().includes('xray') || message.toLowerCase().includes('x-ray') || message.toLowerCase().includes('report') || message.toLowerCase().includes('result') || message.toLowerCase().includes('analysis')) {
                if (xrays.length > 0) {
                    const latest = xrays[0];
                    const preds = latest.all_predictions || {};
                    aiResponse = `Based on your most recent X-ray analysis (${new Date(latest.created_at).toLocaleDateString()}):\n\n`;
                    aiResponse += `**Primary Finding:** ${latest.prediction.replace('covid19', 'COVID-19').replace('pneumonia', 'Pneumonia').replace('normal', 'Normal')}\n`;
                    aiResponse += `**Confidence:** ${latest.confidence}%\n\n`;
                    aiResponse += `**All Predictions:**\n`;
                    if (preds.covid19 !== undefined) aiResponse += `- COVID-19: ${preds.covid19}%\n`;
                    if (preds.pneumonia !== undefined) aiResponse += `- Pneumonia: ${preds.pneumonia}%\n`;
                    if (preds.normal !== undefined) aiResponse += `- Normal: ${preds.normal}%\n`;
                    if (latest.notes) aiResponse += `\n**Notes:** ${latest.notes}\n`;
                    aiResponse += `\nYou have ${xrays.length} total X-ray analysis(es) on record.`;
                    aiResponse += `\n\n*Remember: This is for educational purposes. Always consult a healthcare professional.*`;
                } else {
                    aiResponse = "You haven't uploaded any X-ray scans yet. Would you like me to guide you through the analysis process? You can upload a chest X-ray from the **X-Ray Analysis** page.";
                }
            } else if (message.toLowerCase().includes('symptom') || message.toLowerCase().includes('check') || message.toLowerCase().includes('health')) {
                if (symptoms.length > 0) {
                    const latest = symptoms[0];
                    const result = latest.analysis_result || {};
                    aiResponse = `Your most recent symptom check (${new Date(latest.created_at).toLocaleDateString()}):\n\n`;
                    aiResponse += `**Risk Level:** ${(latest.risk_level || 'Unknown').charAt(0).toUpperCase() + (latest.risk_level || 'unknown').slice(1)}\n`;
                    if (result.possibleConditions?.length) {
                        aiResponse += `**Possible Condition:** ${result.possibleConditions.join(', ')}\n`;
                    }
                    if (latest.symptoms?.length) {
                        aiResponse += `**Reported Symptoms:** ${latest.symptoms.map(s => s.replace(/_/g, ' ')).join(', ')}\n`;
                    }
                    if (latest.recommendations?.length) {
                        aiResponse += `\n**Recommendations:**\n${latest.recommendations.map(r => `- ${r}`).join('\n')}\n`;
                    }
                    aiResponse += `\nYou have ${symptoms.length} symptom check(s) on record.`;
                    aiResponse += `\n\n*Remember: This is for educational purposes. Always consult a healthcare professional.*`;
                } else {
                    aiResponse = "You haven't done any symptom checks yet. You can start one from the **Symptom Checker** page.";
                }
            } else if (message.toLowerCase().includes('history') || message.toLowerCase().includes('summary') || message.toLowerCase().includes('all')) {
                aiResponse = `Here's your MediVision history:\n\n`;
                aiResponse += `**X-Ray Analyses:** ${xrays.length} on record\n`;
                aiResponse += `**Symptom Checks:** ${symptoms.length} on record\n\n`;
                if (xrays.length > 0) {
                    aiResponse += `**Recent X-Rays:**\n`;
                    xrays.forEach((x, i) => {
                        aiResponse += `${i+1}. ${x.prediction.replace('covid19', 'COVID-19').replace('pneumonia', 'Pneumonia').replace('normal', 'Normal')} (${x.confidence}%) - ${new Date(x.created_at).toLocaleDateString()}\n`;
                    });
                }
                if (symptoms.length > 0) {
                    aiResponse += `\n**Recent Symptom Checks:**\n`;
                    symptoms.forEach((s, i) => {
                        const cond = s.analysis_result?.possibleConditions?.[0] || 'Unknown';
                        aiResponse += `${i+1}. Risk: ${s.risk_level} (${cond}) - ${new Date(s.created_at).toLocaleDateString()}\n`;
                    });
                }
                aiResponse += `\nWould you like to know more about any specific result?`;
            } else {
                // General fallback - still provide context
                let dataContext = '';
                if (xrays.length > 0) {
                    const latest = xrays[0];
                    dataContext += `I can see your latest X-ray showed **${latest.prediction.replace('covid19', 'COVID-19').replace('pneumonia', 'Pneumonia').replace('normal', 'Normal')}** (${latest.confidence}% confidence). `;
                }
                if (symptoms.length > 0) {
                    dataContext += `Your latest symptom check had a **${symptoms[0].risk_level}** risk level. `;
                }
                aiResponse = `I can help you understand your X-ray results, symptom assessments, and provide general medical information. ${dataContext}\n\nTry asking me:\n- "Show my latest X-ray result"\n- "What does my symptom check mean?"\n- "Show my history"\n\nFor full AI capabilities, ensure PERPLEXITY_API_KEY is set in server/.env.`;
            }
        } else {
            // Call Perplexity AI API
            try {
                const axios = require('axios');

                // Construct system prompt with rich context
                const hasXrays = xrays.length > 0;
                const hasSymptoms = symptoms.length > 0;

                let contextInfo = "";
                if (hasXrays) {
                    contextInfo += `\n\nUSER'S X-RAY HISTORY (${xrays.length} analyses):\n`;
                    xrays.forEach((x, i) => {
                        contextInfo += `${i+1}. Prediction: ${x.prediction} (${x.confidence}% confidence) on ${new Date(x.created_at).toLocaleDateString()}`;
                        if (x.all_predictions) {
                            contextInfo += ` | COVID-19: ${x.all_predictions.covid19 || 0}%, Pneumonia: ${x.all_predictions.pneumonia || 0}%, Normal: ${x.all_predictions.normal || 0}%`;
                        }
                        if (x.notes) contextInfo += ` | Notes: ${x.notes}`;
                        contextInfo += '\n';
                    });
                }
                if (hasSymptoms) {
                    contextInfo += `\n\nUSER'S SYMPTOM CHECKS (${symptoms.length} checks):\n`;
                    symptoms.forEach((s, i) => {
                        const cond = s.analysis_result?.possibleConditions?.[0] || 'Unknown';
                        contextInfo += `${i+1}. Risk Level: ${s.risk_level}, Condition: ${cond}, Symptoms: ${s.symptoms?.join(', ') || 'N/A'}`;
                        if (s.recommendations?.length) contextInfo += `, Recommendations: ${s.recommendations.join('; ')}`;
                        contextInfo += ` on ${new Date(s.created_at).toLocaleDateString()}\n`;
                    });
                }

                const systemPrompt = `You are MediVision AI, a friendly and helpful medical information assistant.

YOUR ROLE:
- Help users understand their health data from MediVision
- Answer medical questions in simple, clear language
- Provide educational information about conditions, symptoms, and treatments
- Be warm, empathetic, and conversational

IMPORTANT: You DO have access to this user's MediVision data:${contextInfo || '\n- No X-rays or symptom checks recorded yet'}

When the user asks about their data, reference their ACTUAL results above. Be specific and helpful.
Keep responses concise but friendly. Don't repeat the same disclaimer every message.`;

                console.log('[APIFreeLLM] Sending request...');
                const fullPrompt = systemPrompt + "\n\nUser Question:\n" + message;

                const response = await axios.post('https://apifreellm.com/api/v1/chat', {
                    message: fullPrompt
                }, {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 60000 // 60 second timeout since API has 25s delay
                });

                console.log('[APIFreeLLM] Response received');

                if (response.data && response.data.success && response.data.response) {
                    aiResponse = response.data.response;
                } else if (response.data && response.data.response) {
                    aiResponse = response.data.response;
                } else {
                    aiResponse = "I apologize, but I couldn't generate a response. Please try again.";
                }
            } catch (aiError) {
                console.error('APIFreeLLM API Error:', aiError.response?.data || aiError.message);
                
                // Provide a more helpful error if it hits the 429 rate limit
                if (aiError.response && aiError.response.status === 429) {
                    aiResponse = "I'm still processing a previous request. Please wait about 30 seconds and try again!";
                } else {
                    aiResponse = "I'm experiencing technical difficulties connecting to the AI server. Please try again later.";
                }
            }
        }

        // Ensure aiResponse is never null or empty
        if (!aiResponse || aiResponse.trim() === '') {
            aiResponse = "I understand you're asking about \"" + message.substring(0, 30) + "\". I'm experiencing technical difficulties. Please try again or consult a healthcare professional for medical concerns.";
        }

        // Save AI response
        const assistantMessage = new ChatMessage({
            user_id: req.user._id,
            conversation_id: conversationId,
            role: 'assistant',
            content: aiResponse
        });
        await assistantMessage.save();

        res.json({
            response: aiResponse,
            messageId: assistantMessage._id
        });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Failed to process chat' });
    }
});

module.exports = router;
