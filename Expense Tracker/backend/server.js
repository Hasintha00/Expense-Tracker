require("dotenv").config(); // Make sure it's at the top!
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const expenseRoutes = require('./routes/expenseRoutes');
const incomeRoutes = require('./routes/incomeRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Routes
app.get("/", (req, res) => {
    res.send("API is running...");
});

app.use('/api/income', incomeRoutes);
app.use('/api/expenses', expenseRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.url} not found` });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const port = process.env.PORT || 5001;
app.listen(port, () => { 
    console.log(`🚀 Server running on port ${port}`);
    console.log(`Frontend URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});
