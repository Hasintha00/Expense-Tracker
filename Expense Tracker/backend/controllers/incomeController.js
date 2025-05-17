const Income = require('../models/Income');

// Get all income
exports.getIncomes = async (req, res) => {
    try {
        const incomes = await Income.find().sort({ date: -1 });
        res.json(incomes);
    } catch (error) {
        console.error('Error fetching incomes:', error);
        res.status(500).json({ message: 'Failed to fetch incomes' });
    }
};

// Add new income
exports.createIncome = async (req, res) => {
    try {
        const { amount, date, category, note } = req.body;

        const income = new Income({
            amount: Number(amount),
            date: new Date(date),
            category: category,
            note: note
        });

        const savedIncome = await income.save();
        res.status(201).json(savedIncome);
    } catch (error) {
        console.error('Error creating income:', error);
        res.status(400).json({ message: error.message });
    }
};

// Update income
exports.updateIncome = async (req, res) => {
    try {
        const { amount, date, category, note } = req.body;
        
        const income = await Income.findByIdAndUpdate(
            req.params.id,
            {
                amount: Number(amount),
                date: new Date(date),
                category: category,
                note: note
            },
            { new: true }
        );

        if (!income) {
            return res.status(404).json({ message: 'Income not found' });
        }

        res.json(income);
    } catch (error) {
        console.error('Error updating income:', error);
        res.status(400).json({ message: error.message });
    }
};

// Delete income
exports.deleteIncome = async (req, res) => {
    try {
        const income = await Income.findByIdAndDelete(req.params.id);
        if (!income) {
            return res.status(404).json({ message: 'Income not found' });
        }
        res.json({ message: 'Income deleted successfully' });
    } catch (error) {
        console.error('Error deleting income:', error);
        res.status(500).json({ message: error.message });
    }
};