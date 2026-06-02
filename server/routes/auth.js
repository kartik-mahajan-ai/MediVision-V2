const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, full_name } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Create user
        const user = new User({
            email,
            password,
            full_name
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            user: {
                id: user._id,
                email: user.email,
                full_name: user.full_name,
                user_metadata: { full_name: user.full_name }
            },
            token
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: error.message || 'Failed to register' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            user: {
                id: user._id,
                email: user.email,
                full_name: user.full_name,
                user_metadata: { full_name: user.full_name }
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// Get current session/user
router.get('/session', auth, async (req, res) => {
    try {
        res.json({
            user: {
                id: req.user._id,
                email: req.user.email,
                full_name: req.user.full_name,
                user_metadata: { full_name: req.user.full_name }
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get session' });
    }
});

// Logout (client-side token removal, but we can invalidate if needed)
router.post('/logout', auth, async (req, res) => {
    try {
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to logout' });
    }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { full_name, password } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (full_name !== undefined) {
            user.full_name = full_name;
        }

        if (password && password.length >= 6) {
            user.password = password; // Hashed by pre-save hook
        }

        await user.save();

        res.json({
            user: {
                id: user._id,
                email: user.email,
                full_name: user.full_name,
                user_metadata: { full_name: user.full_name }
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

module.exports = router;
