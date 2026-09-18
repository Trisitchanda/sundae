import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginUser } from '../features/auth/authSlice';
import { useToast } from '../components/Toast';
import MagneticButton from '../components/MagneticButton';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(loginUser({ email, password })).unwrap();
      navigate('/app');
    } catch (err) {
      showToast(err.message || err || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full animate-in fade-in duration-700">
      <div className="mb-12">
        <h2 className="font-serif text-3xl tracking-tight text-ink mb-2">Welcome back.</h2>
        <p className="text-olive font-light">Enter your credentials to access your ledger.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#FDFCF8] border border-cream-secondary rounded-md px-4 py-3 text-lg text-ink placeholder-olive focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all interactive"
          />
        </div>

        <div>
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#FDFCF8] border border-cream-secondary rounded-md px-4 py-3 text-lg text-ink placeholder-olive focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all interactive"
          />
        </div>

        <MagneticButton
          type="submit"
          disabled={loading || !email || !password}
          className="w-full py-4 bg-ink text-cream text-sm uppercase tracking-widest font-semibold hover:opacity-90 transition-colors disabled:opacity-50 mt-4"
        >
          {loading ? 'Authenticating...' : 'Sign in'}
        </MagneticButton>
      </form>

      <div className="mt-12 text-center">
        <p className="text-olive text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-ink font-medium hover:opacity-70 transition-opacity interactive">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
