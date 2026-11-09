import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import {
  Scale,
  Plus,
  Trash2,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Info
} from 'lucide-react';

export const AdminCancellationPolicyPage = () => {
  const [policy, setPolicy] = useState(null);
  const [policyName, setPolicyName] = useState('');
  const [refundTiers, setRefundTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPolicy = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/cancellation-policy');
      if (res?.data?.policy) {
        setPolicy(res.data.policy);
        setPolicyName(res.data.policy.policyName || '');
        setRefundTiers(res.data.policy.refundTiers || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load policy.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
  }, []);

  const handleAddTier = () => {
    setRefundTiers((prev) => [
      ...prev,
      { minHoursBeforeDeparture: 12, refundPercentage: 75 }
    ]);
  };

  const handleRemoveTier = (index) => {
    if (refundTiers.length <= 1) {
      setError('At least one refund tier is required.');
      return;
    }
    setRefundTiers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTierChange = (index, field, value) => {
    const updated = [...refundTiers];
    updated[index][field] = Number(value);
    setRefundTiers(updated);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Sort tiers descending
      const sortedTiers = [...refundTiers].sort(
        (a, b) => b.minHoursBeforeDeparture - a.minHoursBeforeDeparture
      );

      const res = await api.put('/admin/cancellation-policy', {
        policyName,
        refundTiers: sortedTiers
      });

      setSuccess('Cancellation & refund tiers updated successfully in MongoDB.');
      if (res?.data?.policy) {
        setPolicy(res.data.policy);
        setRefundTiers(res.data.policy.refundTiers);
      }
    } catch (err) {
      setError(err.message || 'Failed to update policy.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
          Regulatory Rules
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
          Cancellation & Refund Policy Configuration
        </h1>
        <p className="text-xs text-slate-500">
          Set official simulated refund percentage thresholds according to departure proximity.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Loading policy rules...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Official Policy Title *
              </label>
              <input
                type="text"
                required
                value={policyName}
                onChange={(e) => setPolicyName(e.target.value)}
                className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Refund Tiers */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Configured Refund Tiers
                </label>
                <button
                  type="button"
                  onClick={handleAddTier}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Refund Threshold</span>
                </button>
              </div>

              <div className="space-y-2">
                {refundTiers.map((tier, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400 font-mono font-bold">Tier #{idx + 1}</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        When cancelled at least
                      </span>
                      <input
                        type="number"
                        min="0"
                        max="720"
                        value={tier.minHoursBeforeDeparture}
                        onChange={(e) => handleTierChange(idx, 'minHoursBeforeDeparture', e.target.value)}
                        className="w-20 h-9 px-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold font-mono text-center"
                      />
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        hours before departure:
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-auto">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Refund</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={tier.refundPercentage}
                        onChange={(e) => handleTierChange(idx, 'refundPercentage', e.target.value)}
                        className="w-20 h-9 px-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold font-mono text-center text-emerald-600 dark:text-emerald-400"
                      />
                      <span className="font-bold text-slate-700 dark:text-slate-300">%</span>

                      <button
                        type="button"
                        onClick={() => handleRemoveTier(idx)}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-indigo-900 dark:text-indigo-200 text-xs flex items-start space-x-2.5">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Refund amounts are simulated and calculated deterministically in backend services on transaction commit. The server sorts tiers in descending order of hours remaining. If departure has already passed, cancellation is strictly blocked.
              </p>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-indigo-600/20 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Policy...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Policy Configuration</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

