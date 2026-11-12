import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { BrandLogo, Button, Card, CardContent, Input } from '../../components/ui/index.js';
import { Lock, Mail, AlertCircle, KeyRound } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await login(email, password);
      const userRole = res?.data?.user?.role;
      toast.success(`Welcome back to MyJourney, ${res?.data?.user?.name || 'User'}.`);

      if (redirect) {
        navigate(redirect);
      } else if (userRole === 'ADMIN') {
        navigate('/admin');
      } else if (userRole === 'OPERATOR') {
        navigate('/operator');
      } else {
        navigate('/my-bookings');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password@123');
    setError('');
  };

  const demoAccounts = [
    { label: 'Passenger', email: 'customer@myjourney.in', role: 'Customer' },
    { label: 'Administrator', email: 'admin@myjourney.in', role: 'Admin' },
    { label: 'Delhi Operator', email: 'operator.delhi@myjourney.in', role: 'Operator' },
    { label: 'Jaipur Operator', email: 'operator.jaipur@myjourney.in', role: 'Operator' }
  ];

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-12 bg-[#F7FAF8] dark:bg-[#0B1712]">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2.5">
          <div className="flex justify-center">
            <BrandLogo size="lg" showSubtitle={false} />
          </div>
          <h1 className="text-2xl font-bold text-[#14532D] dark:text-[#F0FDF4]">
            Sign In to MyJourney
          </h1>
          <p className="text-xs text-[#475569] dark:text-[#A7C4B0]">
            Access passenger tickets, fleet operations, or portal administration
          </p>
        </div>

        {/* Demo Account Quick Select */}
        <Card className="bg-[#F0FDF4] dark:bg-[#10231B]">
          <CardContent className="p-4 space-y-2.5">
            <p className="text-[11px] font-bold text-[#14532D] dark:text-[#D1E7D8] uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#5EEAD4]" />
              <span>Quick Demo Credentials</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => setDemoCredentials(acc.email)}
                  className="p-2 rounded-lg bg-white dark:bg-[#162B22] hover:bg-[#DCFCE7] dark:hover:bg-[#1C382C] border border-[#DCE7DF] dark:border-[#294A38] text-left transition-colors cursor-pointer"
                >
                  <span className="text-xs font-bold block text-[#166534] dark:text-[#4ADE80]">
                    {acc.label}
                  </span>
                  <span className="text-[10px] text-[#64748B] dark:text-[#A7C4B0] truncate block">
                    {acc.email}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Login Form */}
        <Card>
          <CardContent className="p-6 sm:p-7">
            {error && (
              <div
                role="alert"
                className="mb-4 p-3 rounded-lg bg-[#FEE2E2] dark:bg-[#3B1517] border border-[#B91C1C]/30 dark:border-[#F87171]/30 text-[#991B1B] dark:text-[#FEE2E2] text-xs font-medium flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="login-email"
                label="Email Address"
                type="email"
                icon={Mail}
                required
                placeholder="name@myjourney.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                id="login-password"
                label="Password"
                type="password"
                icon={Lock}
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
                Sign In
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-[#DCE7DF] dark:border-[#294A38] text-center text-xs text-[#475569] dark:text-[#A7C4B0]">
              Don't have a passenger account?{' '}
              <Link
                to="/register"
                className="font-bold text-[#166534] dark:text-[#4ADE80] hover:underline"
              >
                Create Account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
