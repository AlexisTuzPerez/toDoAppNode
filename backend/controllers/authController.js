const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES;   

function generateToken(user) {
    return jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

exports.register = async (req, res) => {
    try {

        const { firstname, lastname, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) return res.status(400).json({ message: 'Email already registered' });

        const user = await User.create({ firstname, lastname, email, password, role });

        const token = generateToken(user);
        res.cookie('token', token, { httpOnly: true, sameSite: 'strict', secure: false });
        res.status(201).json({ message: 'User registered', user: { firstname, lastname, email, role } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.authenticate = async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);

        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = generateToken(user);

        res.cookie('token', token, { httpOnly: true, sameSite: 'strict', secure: false });
        
        res.status(200).json({ message: 'Authenticated', user: { firstname: user.firstname, lastname: user.lastname, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

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
