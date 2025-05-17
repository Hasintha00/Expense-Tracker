import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CATEGORY_OPTIONS = [
  { group: 'Essentials', options: ['Housing', 'Food', 'Transport', 'Health', 'Education'] },
  { group: 'Lifestyle', options: ['Entertainment', 'Shopping', 'Pet Care'] },
  { group: 'Financial', options: ['Savings/Debt'] },
  { group: 'Other', options: ['Miscellaneous', 'Other'] }
];

const CATEGORY_OPTIONS_FLAT = CATEGORY_OPTIONS.flatMap(group => group.options);

// Helper to get unique colors for categories
const CATEGORY_COLORS = [
  '#a855f7', // purple
  '#f59e42', // orange
  '#10b981', // green
  '#ef4444', // red
  '#6366f1', // indigo
  '#fbbf24', // yellow
  '#3b82f6', // blue
  '#eab308', // gold
  '#14b8a6', // teal
  '#f472b6', // pink
];

// Emoji map for categories
const CATEGORY_EMOJIS = {
  'Housing': '🏠',
  'Food': '🍔',
  'Transport': '🚗',
  'Health': '💊',
  'Education': '🎓',
  'Entertainment': '🎬',
  'Shopping': '🛍️',
  'Pet Care': '🐾',
  'Savings/Debt': '💰',
  'Miscellaneous': '🗂️',
  'Other': '🔖'
};

const getChartData = (expenses) => {
  console.log('Raw expenses data:', expenses);
  const grouped = {};
  expenses.forEach(exp => {
    const date = new Date(exp.date).toISOString().split('T')[0];
    if (!grouped[date]) grouped[date] = 0;
    grouped[date] += parseFloat(exp.amount);
  });
  const chartData = Object.entries(grouped)
    .map(([date, amount]) => ({ date, amount: parseFloat(amount.toFixed(2)) }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  console.log('Processed chart data:', chartData);
  return chartData;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 rounded shadow text-sm border border-red-200">
        <p className="font-semibold text-red-600">{label}</p>
        <p className="text-gray-700">Amount: <span className="font-bold">LKR {payload[0].value.toFixed(2)}</span></p>
      </div>
    );
  }
  return null;
};

// Helper function to truncate text
function truncateText(text, maxLength = 25) {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

// SVG icons for headers
const AmountIcon = () => (
  <svg className="inline w-4 h-4 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 16v-4" /></svg>
);
const DateIcon = () => (
  <svg className="inline w-4 h-4 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
);
const CategoryIcon = () => (
  <svg className="inline w-4 h-4 mr-1 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 11h.01M7 15h.01M11 7h2m-2 4h2m-2 4h2m4-8h.01M17 11h.01M17 15h.01" /></svg>
);

// Prepare multi-line chart data
const getCategoryLineChartData = (expenses, categories) => {
  // Get all unique dates
  const allDates = Array.from(new Set(expenses.map(exp => new Date(exp.date).toISOString().split('T')[0]))).sort();
  // Build a data array where each object has a date and each category's amount for that date
  return allDates.map(date => {
    const entry = { date };
    categories.forEach(cat => {
      entry[cat] = expenses
        .filter(exp => (new Date(exp.date).toISOString().split('T')[0] === date) && exp.category === cat)
        .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    });
    return entry;
  });
};

const getPieChartData = (expenses) => {
  const categoryTotals = {};
  expenses.forEach(exp => {
    const category = exp.category || 'Other';
    if (!categoryTotals[category]) {
      categoryTotals[category] = 0;
    }
    categoryTotals[category] += parseFloat(exp.amount);
  });
  
  return Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2))
  }));
};

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 rounded shadow text-sm border border-red-200">
        <p className="font-semibold text-red-600">{payload[0].name}</p>
        <p className="text-gray-700">Amount: <span className="font-bold">LKR {payload[0].value.toFixed(2)}</span></p>
      </div>
    );
  }
  return null;
};

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  if (percent < 0.04) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="#888"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={16}
      fontWeight={500}
    >
      {`${name} (${(percent * 100).toFixed(0)}%)`}
    </text>
  );
};

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Other'
  });
  const [editingId, setEditingId] = useState(null);
  const [budget, setBudget] = useState(0);
  const [showBudgetAlert, setShowBudgetAlert] = useState(false);

  useEffect(() => {
    console.log('Component mounted, fetching expenses...');
    fetchExpenses();
    const savedBudget = localStorage.getItem('expenseBudget');
    if (savedBudget) {
      setBudget(parseFloat(savedBudget));
    }
  }, []);

  // Check budget whenever expenses change
  useEffect(() => {
    if (budget > 0) {
      const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      if (totalExpenses >= budget) {
        setShowBudgetAlert(true);
      } else {
        setShowBudgetAlert(false);
      }
    }
  }, [expenses, budget]);

  const handleBudgetChange = (e) => {
    const newBudget = parseFloat(e.target.value) || 0;
    setBudget(newBudget);
    localStorage.setItem('expenseBudget', newBudget.toString());
  };

  const fetchExpenses = async () => {
    try {
      console.log('Fetching expenses from API...');
      const response = await axios.get('http://localhost:5001/api/expenses');
      console.log('API Response:', response.data);
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setExpenses([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: Title should not be only numbers
    if (/^\d+$/.test(formData.title.trim())) {
      alert('Title cannot be only numbers. Please enter a descriptive title.');
      return;
    }

    try {
      const expenseData = {
        title: formData.title.trim(),
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString(),
        category: formData.category
      };

      if (editingId) {
        await axios.put(`http://localhost:5001/api/expenses/${editingId}`, expenseData);
        setEditingId(null);
      } else {
        await axios.post('http://localhost:5001/api/expenses', expenseData);
      }
      
      setFormData({
        title: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Other'
      });
      
      fetchExpenses(); // Refresh the list after adding/updating
    } catch (error) {
      console.error('Error:', error.response?.data?.message || error.message);
      alert(error.response?.data?.message || 'Failed to save expense');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/api/expenses/${id}`);
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleEdit = (expense) => {
    // Format the date to YYYY-MM-DD for the input field
    const formattedDate = new Date(expense.date).toISOString().split('T')[0];
    
    setFormData({
      title: expense.title,
      amount: expense.amount,
      date: formattedDate,
      category: expense.category || 'Other'
    });
    setEditingId(expense._id);
  };

  // Get all categories in use
  const allCategories = CATEGORY_OPTIONS_FLAT;
  // Prepare data for multi-line chart
  const multiLineChartData = getCategoryLineChartData(expenses, allCategories);

  // Calculate additional statistics
  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const averageExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
  const highestExpense = expenses.length > 0 ? Math.max(...expenses.map(exp => parseFloat(exp.amount))) : 0;
  const monthlyExpenses = expenses.reduce((acc, exp) => {
    const month = new Date(exp.date).toLocaleString('default', { month: 'long' });
    if (!acc[month]) acc[month] = 0;
    acc[month] += parseFloat(exp.amount);
    return acc;
  }, {});
  const highestMonth = Object.entries(monthlyExpenses)
    .sort(([,a], [,b]) => b - a)[0] || ['N/A', 0];

  console.log('Statistics:', {
    totalExpenses,
    averageExpense,
    highestExpense,
    highestMonth
  });

  // Function to export expenses to PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Expenses Report', 14, 16);
    const tableColumn = ['Title', 'Amount (LKR)', 'Category', 'Date'];
    const tableRows = expenses.map(exp => [
      exp.title,
      `LKR ${parseFloat(exp.amount).toFixed(2)}`,
      exp.category || 'Other',
      new Date(exp.date).toLocaleDateString()
    ]);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 22,
    });
    doc.save('expenses_report.pdf');
  };

  // Function to export expenses to Excel
  const exportToExcel = () => {
    // Prepare data for Excel
    const data = expenses.map(expense => ({
      Title: expense.title,
      Amount: expense.amount,
      Date: new Date(expense.date).toLocaleDateString(),
      Category: expense.category || 'Other'
    }));

    // Add summary data
    const summaryData = [
      { Metric: 'Total Expenses', Value: `LKR ${totalExpenses.toFixed(2)}` },
      { Metric: 'Average Expense', Value: `LKR ${averageExpense.toFixed(2)}` },
      { Metric: 'Highest Expense', Value: `LKR ${highestExpense.toFixed(2)}` },
      { Metric: 'Highest Month', Value: `${highestMonth[0]} (LKR ${highestMonth[1].toFixed(2)})` }
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Add expenses sheet
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
    
    // Add summary sheet
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
    
    // Save the Excel file
    XLSX.writeFile(wb, 'expense-report.xlsx');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Decorative Header */}
      <div className="mb-8 text-center">
        <div className="relative inline-block">
          {/* Money with Sparkles Icon */}
          <svg className="w-24 h-24 text-red-500 mb-4" fill="none" viewBox="0 0 48 48">
            <rect x="6" y="14" width="36" height="20" rx="4" fill="#fee2e2" stroke="#ef4444" strokeWidth="2"/>
            <rect x="12" y="20" width="8" height="8" rx="2" fill="#fca5a5"/>
            <circle cx="36" cy="24" r="3" fill="#ef4444"/>
            <path d="M24 10l1.5 3M24 10l-1.5 3M24 10v4M38 18l1.5 3M38 18l-1.5 3M38 18v4M10 30l1.5 3M10 30l-1.5 3M10 30v4" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full w-6 h-6 flex items-center justify-center text-white font-bold">-</div>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Expense Management</h2>
        <p className="text-gray-600">Track and manage your expenses effectively</p>
      </div>

      {/* Budget Alert */}
      {showBudgetAlert && (
        <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-lg">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-bold">Budget Alert!</p>
          </div>
          <p className="mt-2">You have reached or exceeded your monthly budget of LKR ${budget.toFixed(2)}</p>
        </div>
      )}

      {/* Budget Setting with Progress Bar */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-50 rounded-full -ml-12 -mb-12"></div>
        <div className="relative">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Set Monthly Budget
          </h3>
          <div className="flex items-center space-x-4">
            <input
              type="number"
              value={budget}
              onChange={handleBudgetChange}
              placeholder="Enter monthly budget"
              className="flex-1 p-2 border rounded focus:ring-red-500 focus:border-red-500"
              min="0"
              step="0.01"
            />
            <span className="text-gray-600">LKR</span>
          </div>
          {budget > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Budget Progress</span>
                <span>LKR ${totalExpenses.toFixed(2)} / LKR ${budget.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${totalExpenses >= budget ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min((totalExpenses / budget) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards - Key Expense Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-purple-100 p-4 rounded-lg shadow-lg text-center transform hover:scale-105 transition-transform duration-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-200 rounded-full -mr-8 -mt-8"></div>
          <div className="relative">
            <div className="text-lg font-bold text-purple-700">Total Expenses</div>
            <div className="text-2xl font-extrabold text-purple-900">LKR {totalExpenses.toFixed(2)}</div>
          </div>
        </div>
        <div className="bg-blue-100 p-4 rounded-lg shadow-lg text-center transform hover:scale-105 transition-transform duration-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200 rounded-full -mr-8 -mt-8"></div>
          <div className="relative">
            <div className="text-lg font-bold text-blue-700">Average Expense</div>
            <div className="text-2xl font-extrabold text-blue-900">LKR {averageExpense.toFixed(2)}</div>
          </div>
        </div>
        <div className="bg-green-100 p-4 rounded-lg shadow-lg text-center transform hover:scale-105 transition-transform duration-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-green-200 rounded-full -mr-8 -mt-8"></div>
          <div className="relative">
            <div className="text-lg font-bold text-green-700">Highest Expense</div>
            <div className="text-2xl font-extrabold text-green-900">LKR {highestExpense.toFixed(2)}</div>
          </div>
        </div>
        <div className="bg-orange-100 p-4 rounded-lg shadow-lg text-center transform hover:scale-105 transition-transform duration-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-orange-200 rounded-full -mr-8 -mt-8"></div>
          <div className="relative">
            <div className="text-lg font-bold text-orange-700">Highest Month</div>
            <div className="text-xl font-extrabold text-orange-900">{highestMonth[0]}</div>
            <div className="text-lg font-bold text-orange-800">LKR {highestMonth[1].toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Category Distribution Pie Chart */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-50 rounded-full -ml-12 -mb-12"></div>
        <div className="relative">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            </svg>
            Expense Distribution
          </h3>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={getPieChartData(expenses)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getPieChartData(expenses).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow-lg space-y-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="" disabled>Select a category...</option>
            {CATEGORY_OPTIONS.map(group => (
              <optgroup key={group.group} label={group.group}>
                {group.options.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Categories help you group, analyze, and visualize your spending trends.</p>
        </div>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount (LKR)
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
        >
          {editingId ? 'Update Expense' : 'Add Expense'}
        </button>
      </form>

      {/* PDF Download Button */}
      <button
        onClick={handleDownloadPDF}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Generate a Report
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><span className="mr-1">📝</span>Title</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"><AmountIcon />Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><DateIcon />Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"><CategoryIcon />Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.map((expense) => (
                <tr key={expense._id} className="hover:bg-blue-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" title={expense.title}>
                    {truncateText(expense.title)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span className="inline-block px-2 py-1 rounded font-semibold text-xs bg-green-50 text-green-700">
                      -LKR {expense.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="inline-block px-2 py-1 rounded bg-indigo-50 text-indigo-700 font-semibold text-xs">
                      {expense.category || 'Other'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this expense?')) {
                            handleDelete(expense._id);
                          }
                        }}
                        className="inline-flex items-center px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Expenses;