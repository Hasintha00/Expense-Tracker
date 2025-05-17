const Expense = require('../models/Expense');

// Get all expenses
exports.getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find().sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ message: 'Failed to fetch expenses' });
    }
};

// Add new expense
exports.createExpense = async (req, res) => {
    try {
        const { title, amount, date, category } = req.body;

        const expense = new Expense({
            title: title.trim(),
            amount: Number(amount),
            date: new Date(date),
            category: category || 'Other'
        });

        const savedExpense = await expense.save();
        res.status(201).json(savedExpense);
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(400).json({ message: error.message });
    }
};

// Update expense
exports.updateExpense = async (req, res) => {
    try {
        const { title, amount, date, category } = req.body;
        
        const expense = await Expense.findByIdAndUpdate(
            req.params.id,
            {
                title: title.trim(),
                amount: Number(amount),
                date: new Date(date),
                category: category || 'Other'
            },
            { new: true }
        );

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.json(expense);
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(400).json({ message: error.message });
    }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findByIdAndDelete(req.params.id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ message: error.message });
    }
};