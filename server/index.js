require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/auth');
const xrayRoutes = require('./routes/xray');
const symptomsRoutes = require('./routes/symptoms');
const chatRoutes = require('./routes/chat');
const statsRoutes = require('./routes/stats');

const mongoose = require('mongoose');

const app = express();

// Behind a hosting proxy (Render etc.) so rate limiting sees real client IPs
app.set('trust proxy', 1);

// Allowed frontend origins: local dev + comma-separated CORS_ORIGINS for production
const allowedOrigins = [
    'http://localhost:5173', 'http://localhost:8080', 'http://localhost:8081',
    'http://127.0.0.1:5173', 'http://127.0.0.1:8080', 'http://127.0.0.1:8081',
    ...(process.env.CORS_ORIGINS || '').split(',').map(o => o.trim().replace(/\/+$/, '')).filter(Boolean)
];

// Enable CORS first so preflight requests are handled properly
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

// Security Middleware
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per window
    message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});

const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // Limit each IP to 100 login/register attempts per hour
    message: { error: 'Too many authentication attempts, please try again after an hour' }
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Middleware

// Request Logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/xray', xrayRoutes);
app.use('/api/symptoms', symptomsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/stats', statsRoutes);

// Health check
// Pings MongoDB so uptime monitors also keep the free Atlas cluster from auto-pausing
app.get('/api/health', async (req, res) => {
    let database = 'disconnected';
    try {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.db.admin().ping();
            database = 'connected';
        }
    } catch (err) {
        database = 'error';
    }
    res.status(database === 'connected' ? 200 : 503)
        .json({ status: database === 'connected' ? 'ok' : 'degraded', database, timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
});
