import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6 prose prose-slate">
      <h1 className="text-4xl font-extrabold mb-4">SiteVerdict Terms & Privacy</h1>
      <p className="text-slate-500 mb-8">Effective Date: February 15, 2026</p>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Privacy Policy</h2>
        <p>At SiteVerdict, we respect your privacy and are committed to protecting the data you share with us while using our AI-powered site audit platform.</p>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-bold mb-2">1. Information We Collect</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Account Information:</strong> Email addresses and names provided during signup, stored via <strong>Supabase Auth</strong>.</li>
          <li><strong>Project Data:</strong> Site inspection videos, property addresses, and assessment titles required to generate "Trade Verdicts".</li>
          <li><strong>Contractor Contact Info:</strong> Email addresses (e.g., candidate_email) provided by users to facilitate report delivery.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-bold mb-2">2. How We Use Your Information</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Report Generation:</strong> Processing video and text data via our AI engine to create technical audits.</li>
          <li><strong>Communication:</strong> Sending audit reports to designated contractors using <strong>Resend</strong>.</li>
          <li><strong>Automation:</strong> Utilizing <strong>Supabase Edge Functions</strong> to trigger status updates.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-bold mb-2">3. Data Storage and Security</h3>
        <p>Your data is stored in <strong>Supabase</strong> (hosted on AWS) and deployed via <strong>Vercel</strong>. We utilize <strong>Row Level Security (RLS)</strong> to ensure that only authorized users can access specific project data. We do not sell your personal or project data to third-party advertisers.</p>
      </section>

      <section className="mb-8">
        <h3 className="text-xl font-bold mb-2">4. Third-Party Services</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Supabase:</strong> Database and Authentication.</li>
          <li><strong>Vercel:</strong> Web Hosting and Serverless Functions.</li>
          <li><strong>Resend:</strong> Transactional Email Delivery.</li>
        </ul>
      </section>

      <section className="mb-8 border-t pt-8">
        <h3 className="text-xl font-bold mb-2">5. Your Rights</h3>
        <p>You may request to view, update, or delete your account data at any time by contacting us through the SiteVerdict dashboard.</p>
      </section>
      
      <footer className="mt-12 text-sm text-slate-400">
        © 2026 SiteVerdict. All rights reserved.
      </footer>
    </div>
  );
}