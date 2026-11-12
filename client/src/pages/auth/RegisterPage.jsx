import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { BrandLogo, Button, Card, CardContent, Input } from '../../components/ui/index.js';
import { Lock, Mail, User, Phone, AlertCircle } from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      await register({ name, email, password, phone });
      toast.success('Account created! Welcome to MyJourney.');
      navigate('/my-bookings');
    } catch (err) {
      setError(err.message || 'Registration failed. An account with this email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-12 bg-[#F7FAF8] dark:bg-[#0B1712]">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2.5">
          <div className="flex justify-center">
            <BrandLogo size="lg" showSubtitle={false} />
          </div>
          <h1 className="text-2xl font-bold text-[#14532D] dark:text-[#F0FDF4]">
            Create Passenger Account
          </h1>
          <p className="text-xs text-[#475569] dark:text-[#A7C4B0]">
            Register with MyJourney to reserve bus seats, download tickets, and track PNRs
          </p>
        </div>

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
                id="reg-name"
                label="Full Name *"
                type="text"
                icon={User}
                required
                placeholder="e.g. Vikram Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <Input
                id="reg-email"
                label="Email Address *"
                type="email"
                icon={Mail}
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                id="reg-phone"
                label="Mobile Number"
                type="tel"
                icon={Phone}
                placeholder="+91-9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <Input
                id="reg-password"
                label="Password * (min. 6 characters)"
                type="password"
                icon={Lock}
                required
                minLength={6}
                placeholder="Create a secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
                Create Account & Continue
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-[#DCE7DF] dark:border-[#294A38] text-center text-xs text-[#475569] dark:text-[#A7C4B0]">
              Already have a MyJourney account?{' '}
              <Link
                to="/login"
                className="font-bold text-[#166534] dark:text-[#4ADE80] hover:underline"
              >
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
