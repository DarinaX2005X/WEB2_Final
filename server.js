require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as view engine
app.set('view engine', 'ejs');

// API Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);

// View Routes
app.get('/', (req, res) => {
  res.render('index');
});

const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Transaction = require('./models/Transaction');

// Dashboard view route (renders EJS view)
app.get('/dashboard', async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.redirect('/login');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    let transactions;
    if (user.role === 'admin') {
      transactions = await Transaction.find({}).sort({ date: -1 });
    } else {
      transactions = await Transaction.find({ user: user._id }).sort({ date: -1 });
    }
    const totalTransactions = transactions.length;
    const totalIncome = transactions.reduce((sum, tx) => tx.type === 'income' ? sum + tx.amount : sum, 0);
    const totalExpense = transactions.reduce((sum, tx) => tx.type === 'expense' ? sum + tx.amount : sum, 0);
    res.render('dashboard', { user, transactions, totalTransactions, totalIncome, totalExpense });
  } catch (err) {
    next(err);
  }
});

// Login & Register view routes
app.get('/login', (req, res) => {
  res.render('login', { error: null, formData: {} });
});

app.get('/register', (req, res) => {
  res.render('register', { error: null, formData: {} });
});

// Global error handler
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
