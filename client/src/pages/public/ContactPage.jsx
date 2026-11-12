import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Breadcrumb, Input, Button } from '../../components/ui/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PhoneCall, Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';

export const ContactPage = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', pnr: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success('Your support inquiry has been logged for passenger desk review.');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <Breadcrumb items={[{ label: 'Contact' }]} />

      <div className="space-y-2">
        <span className="text-xs font-bold text-[#0F766E] dark:text-[#5EEAD4] uppercase tracking-wider">
          Passenger Assistance
        </span>
        <h1 className="text-3xl font-bold text-[#14532D] dark:text-[#F0FDF4]">
          Contact MyJourney Support Desk
        </h1>
        <p className="text-sm text-[#475569] dark:text-[#D1E7D8]">
          Reach out for booking queries, PNR assistance, operator onboarding, or portal feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Contact Details */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#DCFCE7] dark:bg-[#234B35] text-[#166534] dark:text-[#4ADE80] flex items-center justify-center shrink-0">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#A7C4B0]">
                    Toll-Free Helpline
                  </h3>
                  <p className="text-sm font-bold text-[#14532D] dark:text-[#F0FDF4]">1800-11-2048</p>
                  <p className="text-xs text-[#475569] dark:text-[#A7C4B0]">Available 24/7 for PNR inquiries</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#CCFBF1] dark:bg-[#134E4A] text-[#0F766E] dark:text-[#5EEAD4] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#A7C4B0]">
                    Support Email
                  </h3>
                  <p className="text-sm font-bold text-[#14532D] dark:text-[#F0FDF4]">support@myjourney.in</p>
                  <p className="text-xs text-[#475569] dark:text-[#A7C4B0]">Response within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#DCFCE7] dark:bg-[#234B35] text-[#166534] dark:text-[#4ADE80] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#A7C4B0]">
                    Operations Center
                  </h3>
                  <p className="text-xs text-[#172B24] dark:text-[#D1E7D8] mt-0.5">
                    Transport Operations Hub, Connaught Place, New Delhi — 110001
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#EFF6F1] dark:bg-[#1C382C] text-[#475569] dark:text-[#D1E7D8] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#A7C4B0]">
                    Standard Portal Timezone
                  </h3>
                  <p className="text-xs text-[#172B24] dark:text-[#D1E7D8] mt-0.5">
                    Asia/Kolkata (IST, UTC+05:30)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader>
              <CardTitle>Send a Support Message</CardTitle>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#DCFCE7] dark:bg-[#234B35] text-[#15803D] dark:text-[#4ADE80] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-[#14532D] dark:text-[#F0FDF4]">
                    Inquiry Received
                  </h3>
                  <p className="text-xs text-[#475569] dark:text-[#D1E7D8] max-w-sm mx-auto">
                    Thank you, {formData.name}. Our support desk has recorded your inquiry for {formData.email}.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', pnr: '', message: '' });
                    }}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name *"
                      required
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <Input
                      label="Email Address *"
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <Input
                    label="PNR Reference (Optional)"
                    placeholder="e.g. MJ-8A2F1C"
                    value={formData.pnr}
                    onChange={(e) => setFormData({ ...formData, pnr: e.target.value })}
                  />
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#172B24] dark:text-[#D1E7D8] uppercase tracking-wider">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Describe how we can assist you..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full p-3 bg-white dark:bg-[#10231B] border border-[#DCE7DF] dark:border-[#294A38] rounded-lg text-sm text-[#172B24] dark:text-[#F0FDF4] placeholder:text-[#64748B] dark:placeholder:text-[#A7C4B0] focus:outline-none focus:border-[#166534] dark:focus:border-[#4ADE80]"
                    />
                  </div>
                  <Button type="submit" variant="primary" size="md">
                    <Send className="w-4 h-4" />
                    <span>Submit Inquiry</span>
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

