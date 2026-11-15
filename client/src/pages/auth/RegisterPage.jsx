import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import api from '../../services/api.js';
import { BrandLogo, Button, Card, CardContent, Input, Select } from '../../components/ui/index.js';
import {
  Lock,
  Mail,
  User,
  Phone,
  AlertCircle,
  Building2,
  CheckCircle2,
  ShieldAlert,
  Clock,
  ArrowRight
} from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState('CUSTOMER'); // 'CUSTOMER' | 'ADMIN'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [assignedState, setAssignedState] = useState('');

  const [availableStates, setAvailableStates] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingSuccessData, setPendingSuccessData] = useState(null);

  useEffect(() => {
    if (accountType === 'ADMIN') {
      fetchAvailableStates();
    }
  }, [accountType]);

  const fetchAvailableStates = async () => {
    setLoadingStates(true);
    try {
      const res = await api.get('/auth/available-states');
      const list = res?.data?.states || [];
      setAvailableStates(list);

      // Default select the first unclaimed state if available
      const firstUnclaimed = list.find((s) => !s.isClaimed);
      if (firstUnclaimed) {
        setAssignedState(firstUnclaimed.state);
      } else if (list.length > 0) {
        setAssignedState(list[0].state);
      }
    } catch (err) {
      console.error('Failed to load available states', err);
    } finally {
      setLoadingStates(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    if (accountType === 'ADMIN') {
      if (!assignedState) {
        setError('Please select a state jurisdiction for your administration account.');
        setLoading(false);
        return;
      }

      // Check if chosen state is already claimed
      const selected = availableStates.find(
        (s) => s.state.toLowerCase() === assignedState.toLowerCase()
      );
      if (selected && selected.isClaimed) {
        setError(
          `A State Administrator has already been registered for ${assignedState}. Under governance policy, only the National Super Administrator can assign additional administrators for this state.`
        );
        setLoading(false);
        return;
      }
    }

    try {
      const payload = {
        name,
        email,
        password,
        phone,
        role: accountType,
        assignedState: accountType === 'ADMIN' ? assignedState : undefined
      };

      const res = await register(payload);

      if (accountType === 'ADMIN') {
        setPendingSuccessData({
          name,
          email,
          state: assignedState
        });
        toast.info(
          `State Admin application submitted for ${assignedState}. Awaiting Super Admin verification.`
        );
      } else {
        toast.success('Account created! Welcome to MyJourney.');
        navigate('/my-bookings');
      }
    } catch (err) {
      setError(
        err.message || 'Registration failed. An account with this email may already exist.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (pendingSuccessData) {
    return (
      <div className="min-h-[82vh] flex items-center justify-center px-4 py-12 bg-[#F7FAF8] dark:bg-[#0B1712]">
        <div className="max-w-lg w-full space-y-6">
          <Card className="border border-[#166534]/30 dark:border-[#4ADE80]/30 shadow-md">
            <CardContent className="p-7 sm:p-8 space-y-5 text-center">
              <div className="w-16 h-16 rounded-full bg-[#DCFCE7] dark:bg-[#234B35] text-[#166534] dark:text-[#4ADE80] flex items-center justify-center mx-auto shadow-xs">
                <Clock className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#0F766E] dark:text-[#5EEAD4] uppercase tracking-wider">
                  State Administrator Application Submitted
                </span>
                <h1 className="text-2xl font-bold text-[#14532D] dark:text-[#F0FDF4]">
                  Pending Super Admin Verification
                </h1>
                <p className="text-xs sm:text-sm text-[#475569] dark:text-[#D1E7D8] leading-relaxed max-w-md mx-auto">
                  Your administrator account for <strong>{pendingSuccessData.state} State Transport</strong> has been registered. Under public transport policy, newly created state admin accounts must be verified and approved by the <strong>National Super Administrator</strong> before timetable modification rights are activated.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F0FDF4] dark:bg-[#10231B] border border-[#DCE7DF] dark:border-[#294A38] text-left text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-[#DCE7DF]/60 dark:border-[#294A38]/60">
                  <span className="text-[#64748B] dark:text-[#A7C4B0]">Officer Name:</span>
                  <span className="font-semibold text-[#172B24] dark:text-[#F0FDF4]">{pendingSuccessData.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#DCE7DF]/60 dark:border-[#294A38]/60">
                  <span className="text-[#64748B] dark:text-[#A7C4B0]">Registered Email:</span>
                  <span className="font-semibold font-mono text-[#172B24] dark:text-[#F0FDF4]">{pendingSuccessData.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#DCE7DF]/60 dark:border-[#294A38]/60">
                  <span className="text-[#64748B] dark:text-[#A7C4B0]">Assigned State:</span>
                  <span className="font-bold text-[#166534] dark:text-[#4ADE80]">{pendingSuccessData.state}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#64748B] dark:text-[#A7C4B0]">Approval Status:</span>
                  <span className="font-bold text-[#B45309] dark:text-[#FBBF24]">Pending Verification</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  <span>Proceed to Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const selectedStateClaimed =
    accountType === 'ADMIN' &&
    availableStates.find(
      (s) => s.state.toLowerCase() === assignedState.toLowerCase() && s.isClaimed
    );

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-12 bg-[#F7FAF8] dark:bg-[#0B1712]">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2.5">
          <div className="flex justify-center">
            <BrandLogo size="lg" showSubtitle={false} />
          </div>
          <h1 className="text-2xl font-bold text-[#14532D] dark:text-[#F0FDF4]">
            {accountType === 'ADMIN' ? 'State Admin Registration' : 'Create Passenger Account'}
          </h1>
          <p className="text-xs text-[#475569] dark:text-[#A7C4B0]">
            {accountType === 'ADMIN'
              ? 'Register as an official state transport administrator for timetable management'
              : 'Register with MyJourney to reserve bus seats, download tickets, and track PNRs'}
          </p>
        </div>

        {/* Account Type Selector Toggle */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-white dark:bg-[#162B22] border border-[#DCE7DF] dark:border-[#294A38] shadow-xs text-xs">
          <button
            type="button"
            onClick={() => {
              setAccountType('CUSTOMER');
              setError('');
            }}
            className={`py-2 px-3 rounded-lg font-bold transition-all cursor-pointer ${
              accountType === 'CUSTOMER'
                ? 'bg-[#166534] text-white shadow-xs'
                : 'text-[#475569] dark:text-[#A7C4B0] hover:bg-[#F0FDF4] dark:hover:bg-[#10231B]'
            }`}
          >
            Passenger Account
          </button>
          <button
            type="button"
            onClick={() => {
              setAccountType('ADMIN');
              setError('');
            }}
            className={`py-2 px-3 rounded-lg font-bold transition-all cursor-pointer ${
              accountType === 'ADMIN'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'text-[#475569] dark:text-[#A7C4B0] hover:bg-[#F0FDF4] dark:hover:bg-[#10231B]'
            }`}
          >
            State Administrator
          </button>
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
                label={accountType === 'ADMIN' ? 'Officer Full Name *' : 'Full Name *'}
                type="text"
                icon={User}
                required
                placeholder={accountType === 'ADMIN' ? 'e.g. Ramesh Chandra' : 'e.g. Vikram Sharma'}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <Input
                id="reg-email"
                label="Official Email Address *"
                type="email"
                icon={Mail}
                required
                placeholder={accountType === 'ADMIN' ? 'officer.jharkhand@myjourney.in' : 'name@example.com'}
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

              {/* State Jurisdiction Dropdown for State Admin */}
              {accountType === 'ADMIN' && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="reg-state"
                    className="block text-xs font-semibold text-[#172B24] dark:text-[#D1E7D8]"
                  >
                    State Jurisdiction *
                  </label>
                  {loadingStates ? (
                    <div className="h-10 rounded-lg bg-[#F1F5F9] dark:bg-[#10231B] animate-pulse flex items-center px-3 text-xs text-[#64748B]">
                      Loading state availability...
                    </div>
                  ) : (
                    <Select
                      id="reg-state"
                      value={assignedState}
                      onChange={(e) => setAssignedState(e.target.value)}
                      required
                    >
                      {availableStates.map((s) => (
                        <option
                          key={s.state}
                          value={s.state}
                          disabled={s.isClaimed}
                        >
                          {s.state} {s.isClaimed ? '— [Admin Registered]' : '— [Available]'}
                        </option>
                      ))}
                    </Select>
                  )}
                  {selectedStateClaimed && (
                    <p className="text-[11px] text-[#B91C1C] dark:text-[#F87171] font-medium flex items-center gap-1 mt-1">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        An administrator is already registered for {assignedState}. Only the Super Administrator can add more administrators for this state.
                      </span>
                    </p>
                  )}
                  <p className="text-[11px] text-[#64748B] dark:text-[#A7C4B0]">
                    Only one self-registered administrator is permitted per state. Super Admin approves account upon review.
                  </p>
                </div>
              )}

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

              <Button
                type="submit"
                variant={accountType === 'ADMIN' ? 'secondary' : 'primary'}
                size="lg"
                loading={loading}
                disabled={Boolean(selectedStateClaimed)}
                className="w-full"
              >
                {accountType === 'ADMIN'
                  ? 'Submit State Admin Application'
                  : 'Create Passenger Account'}
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
