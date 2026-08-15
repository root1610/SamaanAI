import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('demo@samaanai.com');
  const [password, setPassword] = useState('demo123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-xl bg-blue-600 items-center justify-center text-white font-black text-2xl mb-1 shadow-sm">
            S
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in to SamaanAI</h1>
          <p className="text-sm text-slate-600">AI Household Inventory & Expiry Manager</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-md app-input text-sm"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-md app-input text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-3 text-center border-t border-slate-200">
          <p className="text-xs text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:underline">
              Create account
            </Link>
          </p>
        </div>

        {/* Demo Credentials Tip */}
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800 text-center font-medium">
          ⚡ <strong>Demo Account:</strong> demo@samaanai.com / demo123456
        </div>

      </div>
    </div>
  );
};
