import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import {
  Card,
  CardContent,
  Button,
  Input,
  LoadingSkeleton
} from '../../components/ui/index.js';
import { Plus, Trash2, Save, AlertCircle, CheckCircle2, Info } from 'lucide-react';

export const AdminCancellationPolicyPage = () => {
  const { toast } = useToast();
  const [policy, setPolicy] = useState(null);
  const [policyName, setPolicyName] = useState('');
  const [refundTiers, setRefundTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPolicy = async () => {
    setLoading(true);
    setError('');
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
      const sortedTiers = [...refundTiers].sort(
        (a, b) => b.minHoursBeforeDeparture - a.minHoursBeforeDeparture
      );

      const res = await api.put('/admin/cancellation-policy', {
        policyName,
        refundTiers: sortedTiers
      });

      const msg = 'Cancellation & refund tiers updated successfully in MongoDB.';
      setSuccess(msg);
      toast.success(msg);
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
        <span className="text-[11px] font-bold text-[#0F766E] dark:text-[#5EEAD4] uppercase tracking-wider">
          Regulatory Rules
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-[#14532D] dark:text-[#F0FDF4] mt-0.5">
          Cancellation & Refund Policy Configuration
        </h1>
        <p className="text-xs sm:text-sm text-[#475569] dark:text-[#A7C4B0]">
          Set official simulated refund percentage thresholds according to departure proximity.
        </p>
      </div>

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <form onSubmit={handleSave} className="space-y-5">
          {error && (
            <div className="p-4 rounded-lg bg-[#FEE2E2] dark:bg-[#3B1517] border border-[#B91C1C]/30 text-[#991B1B] dark:text-[#FEE2E2] text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-lg bg-[#DCFCE7] dark:bg-[#143323] border border-[#15803D]/30 text-[#14532D] dark:text-[#4ADE80] text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <Card>
            <CardContent className="space-y-5">
              <Input
                label="Official Policy Title *"
                type="text"
                required
                value={policyName}
                onChange={(e) => setPolicyName(e.target.value)}
              />

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-[#14532D] dark:text-[#D1E7D8] uppercase tracking-wider">
                    Configured Refund Tiers {policy ? `(${refundTiers.length})` : ''}
                  </label>
                  <button
                    type="button"
                    onClick={handleAddTier}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#166534] dark:text-[#4ADE80] hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Refund Threshold</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {refundTiers.map((tier, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg bg-[#F7FAF8] dark:bg-[#10231B] border border-[#DCE7DF] dark:border-[#294A38] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[#0F766E] dark:text-[#5EEAD4] font-mono font-bold">
                          Tier #{idx + 1}
                        </span>
                        <span className="font-medium text-[#172B24] dark:text-[#D1E7D8]">
                          When cancelled at least
                        </span>
                        <input
                          type="number"
                          min="0"
                          max="720"
                          value={tier.minHoursBeforeDeparture}
                          onChange={(e) => handleTierChange(idx, 'minHoursBeforeDeparture', e.target.value)}
                          className="w-20 h-9 px-2 bg-white dark:bg-[#162B22] border border-[#DCE7DF] dark:border-[#294A38] rounded-md text-xs font-bold font-mono text-center text-[#172B24] dark:text-[#F0FDF4]"
                        />
                        <span className="font-medium text-[#172B24] dark:text-[#D1E7D8]">
                          hours before departure:
                        </span>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <span className="font-medium text-[#475569] dark:text-[#D1E7D8]">Refund</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={tier.refundPercentage}
                          onChange={(e) => handleTierChange(idx, 'refundPercentage', e.target.value)}
                          className="w-20 h-9 px-2 bg-white dark:bg-[#162B22] border border-[#DCE7DF] dark:border-[#294A38] rounded-md text-xs font-bold font-mono text-center text-[#15803D] dark:text-[#4ADE80]"
                        />
                        <span className="font-bold text-[#172B24] dark:text-[#F0FDF4]">%</span>

                        <button
                          type="button"
                          onClick={() => handleRemoveTier(idx)}
                          className="p-2 text-[#B91C1C] dark:text-[#F87171] hover:bg-[#FEE2E2] dark:hover:bg-[#3B1517] rounded-md"
                          aria-label={`Remove tier ${idx + 1}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#CCFBF1]/60 dark:bg-[#134E4A]/40 border border-[#0F766E]/25 dark:border-[#5EEAD4]/25 text-[#0F766E] dark:text-[#CCFBF1] text-xs flex items-start gap-2.5">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Refund amounts are simulated and calculated deterministically in backend services on transaction commit. The server sorts tiers in descending order of hours remaining. If departure has already passed, cancellation is strictly blocked.
                </p>
              </div>

              <div className="flex justify-end pt-3 border-t border-[#DCE7DF] dark:border-[#294A38]">
                <Button type="submit" variant="primary" icon={Save} loading={saving}>
                  Save Policy Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
};
