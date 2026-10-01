// Python model API (FastAPI) location. Set MODEL_API_URL in production,
// e.g. https://<user>-medivision-model.hf.space
const MODEL_API_URL = (process.env.MODEL_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

// Optional shared secret; must match MODEL_API_KEY on the model API.
const modelApiHeaders = process.env.MODEL_API_KEY
    ? { 'X-API-Key': process.env.MODEL_API_KEY }
    : {};

module.exports = { MODEL_API_URL, modelApiHeaders };
