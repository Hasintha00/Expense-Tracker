import React, { useState, useEffect } from 'react';
import ExpenseForm from './ExpenseForm';
import IncomeForm from './IncomeForm';
import ExpenseList from './ExpenseList';
import IncomeList from './IncomeList';

const Dashboard = () => {
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Add Income</h2>
          <IncomeForm />
          <IncomeList />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Add Expense</h2>
          <ExpenseForm />
          <ExpenseList />
        </div>
      </div>
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-100 p-4 rounded-lg">
            <h3 className="text-lg font-medium">Total Income</h3>
            <p className="text-2xl text-green-600">${totalIncome}</p>
          </div>
          <div className="bg-red-100 p-4 rounded-lg">
            <h3 className="text-lg font-medium">Total Expense</h3>
            <p className="text-2xl text-red-600">${totalExpense}</p>
          </div>
          <div className="bg-blue-100 p-4 rounded-lg">
            <h3 className="text-lg font-medium">Balance</h3>
            <p className="text-2xl text-blue-600">${totalIncome - totalExpense}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;