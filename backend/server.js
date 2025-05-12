const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');

dotenv.config({ path: __dirname + '/.env' });

const uri = process.env.MONGO_URI  
const JWT_SECRET = process.env.JWT_SECRET 



const port = process.env.PORT
const app = express();

mongoose.connect(uri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/tasksRoutes'));

app.listen(port, () => console.log(`Server started on port ${port}`));