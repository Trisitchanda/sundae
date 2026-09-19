import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../services/api';
import { useToast } from '../components/Toast';
import MagneticButton from '../components/MagneticButton';
import { updateUser } from '../features/auth/authSlice';
import { Skeleton } from '../components/Skeleton';

export default function Income() {
  const { user, isLoading: authLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const userSalaryStr = user?.baseSalary != null ? (user.baseSalary / 100).toString() : '';
  const [baseSalary, setBaseSalary] = useState(userSalaryStr);
  const [initialSalary, setInitialSalary] = useState(userSalaryStr);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  // Sync state if user loads from network
  useEffect(() => {
    if (user?.baseSalary != null) {
      const loaded = (user.baseSalary / 100).toString();
      setBaseSalary(loaded);
      setInitialSalary(loaded);
    }
  }, [user?.baseSalary]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const numericVal = Number(baseSalary);
      await api.put('/settings/income', { baseSalary: numericVal });
      dispatch(updateUser({ baseSalary: Math.round(numericVal * 100) }));
      setInitialSalary(baseSalary);
      showToast('Income updated successfully', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update income', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-12 pb-24 animate-in fade-in duration-500">
      <header className="mb-12 border-b border-cream-secondary pb-8">
        <h1 className="font-serif text-4xl md:text-5xl tracking-tight text-ink mb-4">Base Capital.</h1>
        <p className="text-olive text-lg font-light tracking-wide">
          Set your baseline monthly earnings. This forms the denominator for your savings rate calculations.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <label className="block text-xs font-medium tracking-widest uppercase text-olive">
            Monthly Base Salary
          </label>
          {authLoading && !user ? (
            <Skeleton className="h-16 w-full rounded-lg" />
          ) : (
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-olive font-serif text-3xl">₹</span>
              <input
                type="number"
                value={baseSalary}
                onChange={(e) => setBaseSalary(e.target.value)}
                className="w-full bg-[#FDFCF8] border border-cream-secondary rounded-lg text-ink pl-12 pr-6 py-4 text-3xl md:text-5xl font-serif num-tabular focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all interactive shadow-sm"
                placeholder="0.00"
                required
              />
            </div>
          )}
        </div>

        <MagneticButton
          type="submit"
          disabled={saving || baseSalary === initialSalary || baseSalary === ''}
          isCta
          className="bg-yellow text-ink px-8 py-4 rounded-sm hover:bg-[#d6c449] transition-colors font-medium tracking-wide disabled:opacity-50 mt-8"
        >
          {saving ? 'Saving...' : 'Save Base Income'}
        </MagneticButton>
      </form>
    </div>
  );
}
