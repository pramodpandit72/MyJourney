import React from 'react';
import { Card, CardContent, Breadcrumb } from '../../components/ui/index.js';

const LegalDocumentLayout = ({ title, updatedAt, sections }) => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
    <Breadcrumb items={[{ label: title }]} />
    <div className="space-y-1.5">
      <h1 className="text-3xl font-bold text-[#14532D] dark:text-[#F0FDF4]">{title}</h1>
      <p className="text-xs text-[#64748B] dark:text-[#A7C4B0]">Effective: {updatedAt}</p>
    </div>

    <Card>
      <CardContent className="space-y-6">
        {sections.map((sec, idx) => (
          <div key={idx} className="space-y-1.5">
            <h2 className="text-sm font-bold text-[#14532D] dark:text-[#F0FDF4]">{sec.heading}</h2>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#D1E7D8] leading-relaxed">
              {sec.body}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

export const TermsPage = () => (
  <LegalDocumentLayout
    title="Terms & Conditions"
    updatedAt="November 2026"
    sections={[
      {
        heading: '1. Platform Scope',
        body: 'MyJourney is an academic bus booking and fleet operations demonstration portal. Reservations, fares, and simulated payment transactions are for academic demonstration purposes and do not process real financial charges.'
      },
      {
        heading: '2. Seat Selection & PNR Validity',
        body: 'Selected seats are locked atomically during booking confirmation. A unique PNR is generated for every confirmed trip reservation and must be presented at boarding along with valid identification.'
      },
      {
        heading: '3. Cancellation & Refunds',
        body: 'Bookings may be cancelled prior to scheduled departure. Refund percentages are calculated automatically by the backend cancellation policy service according to remaining hours before departure.'
      },
      {
        heading: '4. Passenger Conduct',
        body: 'Passengers must report to designated boarding stops at least 15 minutes prior to departure and comply with operator boarding verification procedures.'
      }
    ]}
  />
);

export const PrivacyPage = () => (
  <LegalDocumentLayout
    title="Privacy Policy"
    updatedAt="November 2026"
    sections={[
      {
        heading: '1. Information Collected',
        body: 'MyJourney collects only information necessary to manage user authentication and passenger ticket manifests, including name, email address, phone number, passenger age, and gender.'
      },
      {
        heading: '2. Credential & Session Security',
        body: 'User passwords are hashed securely using bcrypt before storage. Authentication sessions rely on signed JSON Web Tokens (JWT) and protected role-based access rules.'
      },
      {
        heading: '3. Local Browser Preferences',
        body: 'Browser localStorage is used strictly for non-sensitive UI preferences such as light/dark theme selection, accessibility font scale, and session tokens.'
      },
      {
        heading: '4. Audit & Accountability',
        body: 'State-changing administrative and booking operations are recorded in system audit logs to maintain operational transparency.'
      }
    ]}
  />
);

