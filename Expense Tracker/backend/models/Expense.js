const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required']
    },
    date: {
        type: Date,
        required: [true, 'Date is required'],
        default: Date.now
    },
    budget: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        default: 'Other',
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);