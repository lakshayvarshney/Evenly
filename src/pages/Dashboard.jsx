// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const [friendInput, setFriendInput] = useState('');
  const [friends, setFriends] = useState([]);

  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({});

  const [editingIndex, setEditingIndex] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedAmount, setEditedAmount] = useState('');

  const [settleFriend, setSettleFriend] = useState('');
  const [settleAmount, setSettleAmount] = useState('');

  const userRef = doc(db, 'users', user.uid);

  useEffect(() => {
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      const data = docSnap.data();
      setFriends(data?.friends || []);
      setExpenses(data?.expenses || []);
      const newSummary = {};
      data?.expenses?.forEach((exp) => {
        if (!exp.settled) {
          exp.splitWith.forEach((friend) => {
            if (!newSummary[friend]) newSummary[friend] = 0;
            newSummary[friend] += parseFloat(exp.perPerson);
          });
        }
      });
      setSummary(newSummary);
    });

    return () => unsubscribe();
  }, [user.uid]);

  useEffect(() => {
    const createUserDoc = async () => {
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        await setDoc(userRef, { friends: [], expenses: [] });
      }
    };
    createUserDoc();
  }, [user.uid]);

  const handleAddFriend = async () => {
    if (friendInput && !friends.includes(friendInput)) {
      const updatedFriends = [...friends, friendInput];
      await updateDoc(userRef, { friends: updatedFriends });
      setFriendInput('');
    }
  };

  const toggleFriend = (email) => {
    setSelectedFriends((prev) =>
      prev.includes(email) ? prev.filter((f) => f !== email) : [...prev, email]
    );
  };

  const handleAddExpense = async () => {
    if (!expenseTitle || !expenseAmount || selectedFriends.length === 0) return;

    const total = parseFloat(expenseAmount);
    const numPeople = selectedFriends.length + 1;
    const perPerson = (total / numPeople).toFixed(2);

    const newExpense = {
      title: expenseTitle,
      amount: total,
      splitWith: selectedFriends,
      perPerson,
    };

    const updatedExpenses = [...expenses, newExpense];
    await updateDoc(userRef, { expenses: updatedExpenses });

    setExpenseTitle('');
    setExpenseAmount('');
    setSelectedFriends([]);
  };

  const startEdit = (index) => {
    const exp = expenses[index];
    setEditingIndex(index);
    setEditedTitle(exp.title);
    setEditedAmount(exp.amount);
  };

  const handleSaveEdit = async () => {
    const updatedExpenses = [...expenses];
    const oldExpense = updatedExpenses[editingIndex];
    const newAmount = parseFloat(editedAmount);
    const newPerPerson = (newAmount / (oldExpense.splitWith.length + 1)).toFixed(2);

    updatedExpenses[editingIndex] = {
      ...oldExpense,
      title: editedTitle,
      amount: newAmount,
      perPerson: newPerPerson,
    };

    await updateDoc(userRef, { expenses: updatedExpenses });
    setEditingIndex(null);
  };

  const handleDelete = async (index) => {
    const updatedExpenses = [...expenses];
    updatedExpenses.splice(index, 1);
    await updateDoc(userRef, { expenses: updatedExpenses });
  };

  const handleSettleUp = async () => {
    if (!settleFriend || !settleAmount) return;

    const amount = parseFloat(settleAmount);
    const current = summary[settleFriend] || 0;
    const newBalance = Math.max(0, current - amount);

    const newExpense = {
      title: `Settled ₹${amount} with ${settleFriend}`,
      amount,
      splitWith: [settleFriend],
      perPerson: 0,
      settled: true,
    };

    const updatedExpenses = [...expenses, newExpense];
    await updateDoc(userRef, { expenses: updatedExpenses });

    setSettleFriend('');
    setSettleAmount('');
  };

  return (
    <div className="max-w-5xl mx-auto p-6 mt-10">
      <div className="bg-white shadow-lg rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-indigo-600">Welcome, {user.email}</h2>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            onClick={logout}
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Add Friend */}
          <div className="bg-gray-100 p-4 rounded-xl shadow-inner">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Add Friend</h3>
            <div className="flex gap-2 mb-4">
              <input
                type="email"
                value={friendInput}
                onChange={(e) => setFriendInput(e.target.value)}
                placeholder="Friend’s Email"
                className="border w-full p-2 rounded-md"
              />
              <button
                onClick={handleAddFriend}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
              >
                Add
              </button>
            </div>
            <p className="font-medium">Your Friends:</p>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {friends.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>

          {/* Add Expense */}
          <div className="bg-gray-100 p-4 rounded-xl shadow-inner">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Add Expense</h3>
            <input
              type="text"
              value={expenseTitle}
              onChange={(e) => setExpenseTitle(e.target.value)}
              placeholder="Expense title"
              className="border w-full p-2 rounded mb-2"
            />
            <input
              type="number"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              placeholder="Total amount"
              className="border w-full p-2 rounded mb-2"
            />
            <div className="mb-2">
              {friends.map((friend, index) => (
                <label key={index} className="block text-sm">
                  <input
                    type="checkbox"
                    checked={selectedFriends.includes(friend)}
                    onChange={() => toggleFriend(friend)}
                    className="mr-2"
                  />
                  {friend}
                </label>
              ))}
            </div>
            <button
              onClick={handleAddExpense}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 w-full rounded"
            >
              Add Expense
            </button>
          </div>
        </div>

        {/* All Expenses */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3 text-gray-700">All Expenses</h3>
          {expenses.map((exp, index) => (
            <div
              key={index}
              className="bg-white border rounded-lg p-3 mb-2 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-center font-medium">
                <span>{exp.title} — ₹{exp.amount}</span>
                {!exp.settled && (
                  <div className="text-sm space-x-3">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => startEdit(index)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleDelete(index)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {exp.settled
                  ? 'Settlement recorded'
                  : `Split with ${exp.splitWith.join(', ')} | ₹${exp.perPerson} each`}
              </p>
            </div>
          ))}
        </div>

        {/* Edit Form */}
        {editingIndex !== null && (
          <div className="mt-6 p-4 bg-yellow-50 border rounded-lg">
            <h3 className="font-bold mb-2">Edit Expense</h3>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="border p-2 rounded w-full mb-2"
            />
            <input
              type="number"
              value={editedAmount}
              onChange={(e) => setEditedAmount(e.target.value)}
              className="border p-2 rounded w-full mb-2"
            />
            <div className="flex gap-4">
              <button
                onClick={handleSaveEdit}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setEditingIndex(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="mt-8 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Summary</h3>
          <ul className="list-disc list-inside text-sm">
            {Object.entries(summary).map(([friend, amt], index) => (
              <li key={index}>
                {friend} owes you ₹{amt.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>

        {/* Settle Up */}
        <div className="mt-6 bg-yellow-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Settle Up</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <select
              className="border p-2 rounded w-full md:w-1/2"
              value={settleFriend}
              onChange={(e) => setSettleFriend(e.target.value)}
            >
              <option value="">Select Friend</option>
              {Object.keys(summary).map((friend, i) => (
                <option key={i} value={friend}>
                  {friend}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Amount"
              value={settleAmount}
              onChange={(e) => setSettleAmount(e.target.value)}
              className="border p-2 rounded w-full md:w-1/4"
            />
            <button
              onClick={handleSettleUp}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
            >
              Settle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
