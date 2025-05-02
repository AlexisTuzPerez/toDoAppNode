const User = require('../models/User');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = '1d';   

function generateToken(user) {
    return jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

exports.register =  asyncHandler (async (req, res) => {


    const { firstname, lastname, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ firstname, lastname, email, password, role });

    const token = generateToken(user);
    res.cookie('token', token, { httpOnly: true, sameSite: 'strict', secure: false });
    res.status(201).json({ message: 'User registered', user: { firstname, lastname, email, role } });

    
});

exports.authenticate =  asyncHandler (async (req, res) => {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);

    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user);

    res.cookie('token', token, { httpOnly: true, sameSite: 'strict', secure: false });
    
    res.status(200).json({ message: 'Authenticated', user: { firstname: user.firstname, lastname: user.lastname, email: user.email, role: user.role } });

   
});

exports.verifyAuth = (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.status(200).json({ message: 'Authenticated', user: decoded });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token', { httpOnly: true, sameSite: 'strict', secure: false });
    res.status(200).json({ message: 'Logged out' });
};

exports.updateUser = async (req, res) => {
    try {
        const { firstname, lastname, email } = req.body;
        
        // Check if email already exists for another user
        if (email) {
            const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use by another account' });
            }
        }
        
        const updated = await User.findOneAndUpdate(
            { _id: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!updated) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const deleted = await User.findOneAndDelete({ _id: req.user.id });
        
        if (!deleted) return res.status(404).json({ message: 'User not found' });
        
        // Clear authentication token
        res.clearCookie('token', { httpOnly: true, sameSite: 'strict', secure: false });
        res.status(200).json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get user profile for the authenticated user
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user.id }).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
