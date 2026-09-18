import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser, fetchUser } from '../features/auth/authSlice';
import { useToast } from '../components/Toast';
import MagneticButton from '../components/MagneticButton';

export default function Settings() {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingsGoalRate, setSavingsGoalRate] = useState(user?.savingsGoalRate != null ? (user.savingsGoalRate * 100).toString() : '50');
  const [savingGoal, setSavingGoal] = useState(false);
  
  const [categories, setCategories] = useState([]);
  const [budgetInputs, setBudgetInputs] = useState({});
  const [savingBudgets, setSavingBudgets] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (user?.savingsGoalRate != null) {
      setSavingsGoalRate((user.savingsGoalRate * 100).toString());
    }
  }, [user?.savingsGoalRate]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data);
      const initialInputs = {};
      res.data.data.forEach(c => {
        initialInputs[c._id] = c.budgetLimit ? (c.budgetLimit / 100).toString() : '';
      });
      setBudgetInputs(initialInputs);
    } catch (err) {
      showToast('Failed to load categories', 'error');
    }
  };

  const handleBudgetChange = (id, value) => {
    setBudgetInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveBudget = async (categoryId) => {
    setSavingBudgets(prev => ({ ...prev, [categoryId]: true }));
    try {
      const val = budgetInputs[categoryId];
      let limit = null;
      if (val && !isNaN(val) && Number(val) >= 0) {
        limit = Math.round(Number(val) * 100);
      }
      
      await api.put(`/categories/${categoryId}`, { budgetLimit: limit });
      showToast('Budget limit saved.');
    } catch (err) {
      showToast('Failed to save budget limit', 'error');
    } finally {
      setSavingBudgets(prev => ({ ...prev, [categoryId]: false }));
    }
  };

  const handleSaveGoal = async () => {
    if (!savingsGoalRate || isNaN(savingsGoalRate)) return;
    setSavingGoal(true);
    try {
      await api.put('/settings/savings-goal', { savingsGoalRate: Number(savingsGoalRate) });
      showToast('Savings goal updated successfully.');
      dispatch(fetchUser());
    } catch (err) {
      showToast('Failed to update savings goal', 'error');
    } finally {
      setSavingGoal(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      showToast('Password changed. Please log in again.');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => dispatch(logoutUser()), 2000);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-16 animate-in fade-in duration-700 max-w-2xl">
      
      <header className="border-b border-cream-secondary pb-8">
        <h1 className="font-serif text-4xl md:text-5xl tracking-tight text-ink mb-4">
          Settings.
        </h1>
        <p className="text-olive text-lg font-light tracking-wide">
          Manage your account credentials and preferences.
        </p>
      </header>

      <section className="space-y-12">
        <div>
          <h3 className="font-serif text-2xl tracking-tight text-ink mb-6 border-b border-cream-secondary pb-4">
            Profile
          </h3>
          <div className="grid grid-cols-3 gap-4">
             <div className="col-span-1">
               <span className="text-xs uppercase tracking-widest text-olive font-medium">Email</span>
             </div>
             <div className="col-span-2">
               <span className="text-ink font-medium">{user?.email}</span>
             </div>
             
             <div className="col-span-1 mt-4">
               <span className="text-xs uppercase tracking-widest text-olive font-medium">Role</span>
             </div>
             <div className="col-span-2 mt-4">
               <span className="text-ink">{user?.role}</span>
             </div>
          </div>
        </div>

        <div>
          <h3 className="font-serif text-2xl tracking-tight text-ink mb-2 border-b border-cream-secondary pb-4">
            Target Savings Goal
          </h3>
          <p className="text-sm text-olive mb-6">What percentage of your salary do you want to save every month?</p>
          
          <div className="flex items-center space-x-4 max-w-sm">
            <div className="relative flex-1">
              <input
                type="number"
                value={savingsGoalRate}
                onChange={(e) => setSavingsGoalRate(e.target.value)}
                className="w-full bg-[#FDFCF8] border border-cream-secondary rounded-md px-4 py-3 text-lg text-ink placeholder-olive focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all num-tabular pr-10"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-olive font-serif text-lg">%</span>
            </div>
            <MagneticButton 
              onClick={handleSaveGoal}
              disabled={savingGoal}
              className="bg-ink text-cream text-sm uppercase tracking-widest font-semibold px-8 py-3.5 rounded-sm hover:opacity-90 disabled:opacity-50"
            >
              {savingGoal ? 'Saving' : 'Save'}
            </MagneticButton>
          </div>
        </div>

        <div>
          <h3 className="font-serif text-2xl tracking-tight text-ink mb-2 border-b border-cream-secondary pb-4">
            Category Budgets
          </h3>
          <p className="text-sm text-olive mb-6">Set optional monthly spending limits. Leave blank for flexible AI recommendations.</p>
          
          <div className="space-y-6 max-w-md">
            {categories.map(cat => (
              <div key={cat._id} className="flex items-center justify-between group">
                <span className="text-ink font-medium w-1/3">{cat.name}</span>
                <div className="flex items-center space-x-3 w-2/3 justify-end">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-olive font-serif">₹</span>
                    <input
                      type="number"
                      placeholder="No limit"
                      value={budgetInputs[cat._id] || ''}
                      onChange={(e) => handleBudgetChange(cat._id, e.target.value)}
                      className="w-32 bg-[#FDFCF8] border border-cream-secondary rounded-md pl-8 pr-3 py-2 text-sm text-ink placeholder-olive/50 focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all num-tabular"
                    />
                  </div>
                  <button 
                    onClick={() => handleSaveBudget(cat._id)}
                    disabled={savingBudgets[cat._id]}
                    className="text-xs font-semibold uppercase tracking-widest bg-cream-secondary text-ink px-4 py-2 rounded-md hover:bg-ink hover:text-cream transition-colors disabled:opacity-50"
                  >
                    {savingBudgets[cat._id] ? '...' : 'Save'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-serif text-2xl tracking-tight text-ink mb-6 border-b border-cream-secondary pb-4">
            Security
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-8 max-w-sm">
            <div>
              <input
                type="password"
                required
                placeholder="Current Password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full bg-[#FDFCF8] border border-cream-secondary rounded-md px-4 py-3 text-lg text-ink placeholder-olive focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all interactive shadow-sm"
              />
            </div>
            <div>
              <input
                type="password"
                required
                minLength={8}
                placeholder="New Password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-[#FDFCF8] border border-cream-secondary rounded-md px-4 py-3 text-lg text-ink placeholder-olive focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all interactive shadow-sm"
              />
            </div>
            <MagneticButton
              type="submit"
              disabled={loading || !currentPassword || !newPassword}
              className="w-full bg-ink text-cream text-sm uppercase tracking-widest font-semibold py-4 rounded-sm hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </MagneticButton>
          </form>
        </div>
      </section>

    </div>
  );
}
