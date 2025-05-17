import React, { useState } from 'react';
import axios from 'axios';

function ExpenseForm() {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'other'
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:5001/api/expenses', formData);
      if (response.data) {
        setFormData({ title: '', amount: '', category: 'other' });
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Network error - Please check if the server is running');
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <div>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          placeholder="Enter expense title"
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={(e) => setFormData({...formData, amount: e.target.value})}
          placeholder="Enter amount"
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
        Add Expense
      </button>
    </form>
  );
}

export default ExpenseForm;