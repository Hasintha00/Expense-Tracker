import React, { useState } from 'react';
import axios from 'axios';

function IncomeForm() {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'salary'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/api/incomes', formData);
      setFormData({ title: '', amount: '', category: 'salary' });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          placeholder="Enter income title"
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
      <button type="submit" className="w-full bg-green-500 text-white p-2 rounded">
        Add Income
      </button>
    </form>
  );
}

export default IncomeForm;