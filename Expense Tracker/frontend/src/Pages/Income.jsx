import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Link, useLocation } from "react-router-dom";
import { FaMoneyBillWave, FaWallet, FaUserCircle, FaPlus } from "react-icons/fa";

// Define your income categories
const INCOME_CATEGORIES = [
  'Salary/Wages',
  'Freelance/Contract Work',
  'Business Income',
  'Rental Income',
  'Investment',
  'Bonuses/Commission',
  'Government Support',
  'Gifts/Donations',
  'Selling Items',
  'Other'
];

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

// SVG icons for headers
const TitleIcon = () => (
  <svg className="inline w-4 h-4 mr-1 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const AmountIcon = () => (
  <svg className="inline w-4 h-4 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 16v-4" />
  </svg>
);

const DateIcon = () => (
  <svg className="inline w-4 h-4 mr-1 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const CategoryIcon = () => (
  <svg className="inline w-4 h-4 mr-1 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 11h.01M7 15h.01M11 7h2m-2 4h2m-2 4h2m4-8h.01M17 11h.01M17 15h.01" />
  </svg>
);

const ActionsIcon = () => (
  <svg className="inline w-4 h-4 mr-1 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const getPieChartData = (incomes) => {
  const categoryTotals = {};
  incomes.forEach(inc => {
    const cat = inc.category || 'Other';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(inc.amount);
  });
  return Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2))
  }));
};

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 rounded shadow text-sm border border-green-200">
        <p className="font-semibold text-green-600">{payload[0].name}</p>
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

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="w-64 h-screen bg-gradient-to-b from-gray-800 to-gray-900 shadow-lg fixed left-0 top-0 flex flex-col">
      <div className="p-6 flex items-center space-x-3">
        <FaUserCircle className="text-3xl text-white" />
        <span className="text-white text-lg font-semibold">Hello, User</span>
      </div>
      <nav className="mt-8 flex-1">
        <Link
          to="/income"
          className={`flex items-center px-6 py-3 text-lg transition-all duration-150 rounded-l-full ${
            location.pathname === '/income'
              ? 'bg-green-600 text-white shadow'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
        >
          <FaMoneyBillWave className="mr-3" />
          Income
        </Link>
        <Link
          to="/expenses"
          className={`flex items-center px-6 py-3 text-lg transition-all duration-150 rounded-l-full ${
            location.pathname === '/expenses'
              ? 'bg-blue-600 text-white shadow'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
        >
          <FaWallet className="mr-3" />
          Expenses
        </Link>
      </nav>
      <div className="p-6">
        <button className="w-full flex items-center justify-center bg-pink-500 text-white py-2 rounded-lg shadow hover:bg-pink-600 transition">
          <FaPlus className="mr-2" /> Add New
        </button>
      </div>
    </div>
  );
};

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Other',
    note: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [incomeGoal, setIncomeGoal] = useState(0);
  const [showGoalAlert, setShowGoalAlert] = useState(false);
  const location = useLocation();

  useEffect(() => {
    fetchIncomes();
    const savedGoal = localStorage.getItem('incomeGoal');
    if (savedGoal) {
      setIncomeGoal(parseFloat(savedGoal));
    }
  }, []);

  useEffect(() => {
    if (incomeGoal > 0) {
      const totalIncome = incomes.reduce((sum, inc) => sum + parseFloat(inc.amount), 0);
      setShowGoalAlert(totalIncome >= incomeGoal);
    }
  }, [incomes, incomeGoal]);

  const handleGoalChange = (e) => {
    const newGoal = parseFloat(e.target.value) || 0;
    setIncomeGoal(newGoal);
    localStorage.setItem('incomeGoal', newGoal.toString());
  };

  const fetchIncomes = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/income');
      console.log('Fetched incomes:', response.data); // Debug log
      setIncomes(response.data);
    } catch (error) {
      console.error('Error fetching incomes:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Form data before submission:', formData); // Debug log
      
      const incomeData = {
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString(),
        category: formData.category,
        note: formData.note || '' // Ensure note is always a string
      };

      console.log('Income data being sent:', incomeData); // Debug log

      let response;
      if (editingId) {
        response = await axios.put(`http://localhost:5001/api/income/${editingId}`, incomeData);
        console.log('Update response:', response.data); // Debug log
        setEditingId(null);
      } else {
        response = await axios.post('http://localhost:5001/api/income', incomeData);
        console.log('Create response:', response.data); // Debug log
      }

      // Verify the response includes the note
      console.log('Response note field:', response.data.note);
      
      setFormData({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Other',
        note: ''
      });
      
      await fetchIncomes(); // Wait for the fetch to complete
    } catch (error) {
      console.error('Error submitting income:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/api/income/${id}`);
      fetchIncomes();
    } catch (error) {
      console.error('Error deleting income:', error);
    }
  };

  const handleEdit = (income) => {
    setFormData({
      amount: income.amount,
      date: new Date(income.date).toISOString().split('T')[0],
      category: income.category || 'Other',
      note: income.note || ''
    });
    setEditingId(income._id);
  };

  const totalIncome = incomes.reduce((sum, inc) => sum + parseFloat(inc.amount), 0);
  const averageIncome = incomes.length > 0 ? totalIncome / incomes.length : 0;
  const highestIncome = incomes.length > 0 ? Math.max(...incomes.map(inc => parseFloat(inc.amount))) : 0;
  
  const monthlyIncomes = incomes.reduce((acc, inc) => {
    const month = new Date(inc.date).toLocaleString('default', { month: 'long' });
    if (!acc[month]) acc[month] = 0;
    acc[month] += parseFloat(inc.amount);
    return acc;
  }, {});
  const highestMonth = Object.entries(monthlyIncomes)
    .sort(([,a], [,b]) => b - a)[0] || ['N/A', 0];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Decorative Header */}
      <div className="mb-8 text-center">
        <div className="relative inline-block">
          <svg className="w-24 h-24 text-green-500 mb-4" fill="none" viewBox="0 0 48 48">
            <rect x="6" y="14" width="36" height="20" rx="4" fill="#d1fae5" stroke="#10b981" strokeWidth="2"/>
            <rect x="12" y="20" width="8" height="8" rx="2" fill="#6ee7b7"/>
            <circle cx="36" cy="24" r="3" fill="#10b981"/>
            <path d="M24 10l1.5 3M24 10l-1.5 3M24 10v4M38 18l1.5 3M38 18l-1.5 3M38 18v4M10 30l1.5 3M10 30l-1.5 3M10 30v4" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full w-6 h-6 flex items-center justify-center text-white font-bold">+</div>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Income Management</h2>
        <p className="text-gray-600">Track and manage your income streams effectively</p>
      </div>

      {/* Goal Achievement Alert */}
      {showGoalAlert && (
        <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-lg">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-bold">Goal Achieved!</p>
          </div>
          <p className="mt-2">Congratulations! You've reached your monthly income goal of LKR {incomeGoal.toFixed(2)}</p>
        </div>
      )}

      {/* Monthly Goal Setting */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-50 rounded-full -ml-12 -mb-12"></div>
        <div className="relative">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Set Monthly Income Goal
          </h3>
          <div className="flex items-center space-x-4">
            <input
              type="number"
              value={incomeGoal}
              onChange={handleGoalChange}
              placeholder="Enter monthly income goal"
              className="flex-1 p-2 border rounded focus:ring-green-500 focus:border-green-500"
              min="0"
              step="0.01"
            />
            <span className="text-gray-600">LKR</span>
          </div>
          {incomeGoal > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Goal Progress</span>
                <span>LKR {totalIncome.toFixed(2)} / LKR {incomeGoal.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${totalIncome >= incomeGoal ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min((totalIncome / incomeGoal) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-purple-100 p-4 rounded-lg shadow-lg text-center transform hover:scale-105 transition-transform duration-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-200 rounded-full -mr-8 -mt-8"></div>
          <div className="relative">
            <div className="text-lg font-bold text-purple-700">Total Income</div>
            <div className="text-2xl font-extrabold text-purple-900">LKR {totalIncome.toFixed(2)}</div>
          </div>
        </div>
        
        <div className="bg-blue-100 p-4 rounded-lg shadow-lg text-center transform hover:scale-105 transition-transform duration-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200 rounded-full -mr-8 -mt-8"></div>
          <div className="relative">
            <div className="text-lg font-bold text-blue-700">Average Income</div>
            <div className="text-2xl font-extrabold text-blue-900">LKR {averageIncome.toFixed(2)}</div>
          </div>
        </div>
        
        <div className="bg-green-100 p-4 rounded-lg shadow-lg text-center transform hover:scale-105 transition-transform duration-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-green-200 rounded-full -mr-8 -mt-8"></div>
          <div className="relative">
            <div className="text-lg font-bold text-green-700">Highest Income</div>
            <div className="text-2xl font-extrabold text-green-900">LKR {highestIncome.toFixed(2)}</div>
          </div>
        </div>
        
        <div className="bg-orange-100 p-4 rounded-lg shadow-lg text-center transform hover:scale-105 transition-transform duration-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-orange-200 rounded-full -mr-8 -mt-8"></div>
          <div className="relative">
            <div className="text-lg font-bold text-orange-700">Best Month</div>
            <div className="text-xl font-extrabold text-orange-900">{highestMonth[0]}</div>
            <div className="text-lg font-bold text-orange-800">LKR {highestMonth[1].toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Category Distribution Pie Chart */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-50 rounded-full -ml-12 -mb-12"></div>
        <div className="relative">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            </svg>
            Income Distribution
          </h3>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={getPieChartData(incomes)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getPieChartData(incomes).map((entry, index) => {
                    const categoryName = INCOME_CATEGORIES.includes(entry.name) ? entry.name : 'Other';
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={CATEGORY_COLORS[INCOME_CATEGORIES.indexOf(categoryName) % CATEGORY_COLORS.length]} 
                      />
                    );
                  })}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Income Entry Form */}
      <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow-lg space-y-4">
        {/* Category Input */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
            className="w-full p-2 border rounded focus:ring-green-500 focus:border-green-500"
            required
          >
            {INCOME_CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Note Input - Always visible */}
        <div>
          <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
            Note (Optional)
          </label>
          <input
            id="note"
            type="text"
            value={formData.note}
            onChange={e => {
              console.log('Note input changed:', e.target.value); // Debug log
              setFormData({ ...formData, note: e.target.value });
            }}
            className="w-full p-2 border rounded focus:ring-green-500 focus:border-green-500"
            placeholder="Add a note for this income"
          />
        </div>

        {/* Amount Input */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount (LKR) <span className="text-red-500">*</span>
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            className="w-full p-2 border rounded focus:ring-green-500 focus:border-green-500"
            required
          />
        </div>

        {/* Date Input */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            className="w-full p-2 border rounded focus:ring-green-500 focus:border-green-500"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
        >
          {editingId ? 'Update Income' : 'Add Income'}
        </button>
      </form>

      {/* Income Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <CategoryIcon />Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <AmountIcon />Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <DateIcon />Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  📝 Note
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <ActionsIcon />Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {incomes.map((income) => {
                const categoryName = INCOME_CATEGORIES.includes(income.category) ? income.category : 'Other';
                const categoryIndex = INCOME_CATEGORIES.indexOf(categoryName);
                const categoryColor = CATEGORY_COLORS[categoryIndex >= 0 ? categoryIndex : CATEGORY_COLORS.length - 1];

                return (
                  <tr key={income._id} className="hover:bg-green-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className="inline-block px-3 py-1 rounded-full font-semibold text-xs"
                        style={{
                          backgroundColor: `${categoryColor}20`,
                          color: categoryColor,
                          border: `1px solid ${categoryColor}40`
                        }}
                      >
                        {categoryName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className="inline-block px-2 py-1 rounded font-semibold text-xs bg-green-50 text-green-700">
                        +LKR {parseFloat(income.amount).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(income.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {income.note && income.note.trim() !== "" ? (
                        <span className="text-gray-700">{income.note}</span>
                      ) : (
                        <span className="text-gray-400 italic">No note</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleEdit(income)}
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
                            if (window.confirm('Are you sure you want to delete this income?')) {
                              handleDelete(income._id);
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Income;