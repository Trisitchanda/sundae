import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../components/Toast';
import MagneticButton from '../components/MagneticButton';

export default function Income() {
  const [baseSalary, setBaseSalary] = useState('');
  const [initialSalary, setInitialSalary] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchIncome = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data.data.baseSalary) {
          const loadedSalary = (res.data.data.baseSalary / 100).toString();
          setBaseSalary(loadedSalary);
          setInitialSalary(loadedSalary);
        }
      } catch (err) {
        // Ignored for now
      }
    };
    fetchIncome();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/settings/income', { baseSalary: Number(baseSalary) });
      setInitialSalary(baseSalary);
      showToast('Income updated successfully', 'success');
    } catch (err) {
      showToast('Failed to update income', 'error');
    } finally {
      setLoading(false);
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
        </div>

        <MagneticButton
          type="submit"
          disabled={loading || baseSalary === initialSalary || baseSalary === ''}
          isCta
          className="bg-yellow text-ink px-8 py-4 rounded-sm hover:bg-[#d6c449] transition-colors font-medium tracking-wide disabled:opacity-50 mt-8"
        >
          {loading ? 'Saving...' : 'Save Base Income'}
        </MagneticButton>
      </form>
    </div>
  );
}
