import React, { useState } from 'react';

const UpgradeToProPage: React.FC = () => {
  const [isYearly, setIsYearly] = useState(true);

  const features = [
    { text: 'Professional grade intelligence for the sophisticated investor', included: true },
    { text: 'Predictive Modeling: AI persona models for future net worth', included: true },
    { text: 'Consolidated Hub: Connect institutional accounts, crypto, and private equity', included: true },
    { text: 'Bank-Level Security: AES-256 encryption and multi-factor authentication', included: true },
    { text: 'Unlimited goal projections and advanced analytics', included: true },
    { text: 'Priority customer support with dedicated account manager', included: true },
  ];

  return (
    <div className="space-y-xl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">Upgrade</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Experience institutional-grade financial intelligence.</p>
        </div>
      </div>

      {/* Hero Section */}
      <section className="text-center space-y-md max-w-3xl mx-auto">
        <h2 className="font-display-lg text-display-lg text-primary tracking-tight">Experience Institutional-Grade Intelligence</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Unlock advanced analytics, real-time market tracking, and unlimited goal projections tailored for serious investors.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-md pt-lg">
          <span className={`font-label-md text-label-md font-bold ${!isYearly ? 'text-primary' : 'text-on-surface-variant'}`}>MONTHLY</span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="w-14 h-7 bg-surface-container-highest rounded-full p-1 relative transition-colors"
          >
            <div className={`w-5 h-5 bg-secondary rounded-full shadow-sm transition-transform ${isYearly ? 'translate-x-7' : 'translate-x-0'}`} />
          </button>
          <span className={`font-label-md text-label-md font-bold flex items-center gap-xs ${isYearly ? 'text-primary' : 'text-on-surface-variant'}`}>
            YEARLY
            <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full text-[10px]">SAVE 20%</span>
          </span>
        </div>
      </section>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg lg:px-2xl items-start max-w-4xl mx-auto">
        {/* Guardian (Free) */}
        <article className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl space-y-xl flex flex-col h-full hover:shadow-md transition-shadow">
          <div className="space-y-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-md text-headline-md font-bold text-primary">Guardian</h3>
              <span className="font-label-md text-label-md bg-surface-container px-md py-1 rounded-full text-on-surface-variant">CURRENT PLAN</span>
            </div>
            <p className="text-on-surface-variant font-body-sm text-body-sm">Essential tools for individual wealth monitoring.</p>
          </div>

          <div className="py-md border-y border-outline-variant">
            <div className="text-display-lg font-display-lg text-primary">$0</div>
            <p className="text-on-surface-variant font-body-sm text-body-sm">Free forever</p>
          </div>

          <ul className="space-y-sm py-md">
            <li className="flex items-start gap-sm">
              <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
              <span className="text-body-sm text-on-surface-variant">Essential tools for individual wealth monitoring</span>
            </li>
            <li className="flex items-start gap-sm">
              <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
              <span className="text-body-sm text-on-surface-variant">Standard data integration</span>
            </li>
            <li className="flex items-start gap-sm">
              <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
              <span className="text-body-sm text-on-surface-variant">Basic goal tracking</span>
            </li>
          </ul>

          <button className="w-full py-md px-lg rounded-lg border border-outline text-primary font-bold hover:bg-surface-container transition-colors mt-auto">
            Stay on Guardian
          </button>
        </article>

        {/* Institutional Pro (Recommended) */}
        <article className="relative bg-surface-container-lowest border-2 border-secondary rounded-xl p-xl space-y-xl flex flex-col h-full shadow-[0_0_40px_-10px_rgba(0,108,73,0.15)] transform md:scale-105 z-10">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-on-secondary px-lg py-1 rounded-full text-label-md font-bold uppercase tracking-wider">
            Recommended
          </div>

          <div className="space-y-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-md text-headline-md font-bold text-primary">Institutional Pro</h3>
              <span className="material-symbols-outlined text-secondary p-1" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
            </div>
            <p className="text-on-surface-variant font-body-sm text-body-sm">Professional grade intelligence for the sophisticated investor.</p>
          </div>

          <div className="py-md border-y border-outline-variant">
            <div className="flex items-baseline gap-xs">
              <span className="text-display-lg font-display-lg font-bold text-primary">
                ${isYearly ? '241' : '29'}
              </span>
              <span className="font-body-lg text-body-lg text-on-surface-variant">
                {isYearly ? '/ year' : '/ month'}
              </span>
            </div>
            {isYearly && (
              <p className="text-secondary font-label-md text-label-md font-bold mt-1">Save $58 compared to monthly</p>
            )}
          </div>

          <ul className="space-y-sm py-md">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-sm">
                <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
                <span className="text-body-sm text-on-surface-variant">{f.text}</span>
              </li>
            ))}
          </ul>

          <button className="w-full py-md px-lg rounded-lg bg-secondary text-on-secondary font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-sm mt-auto">
            Upgrade to Pro
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </article>
      </div>

      {/* Feature Details */}
      <section className="max-w-4xl mx-auto w-full">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-xl shadow-sm">
          <h3 className="font-headline-md text-headline-md text-primary mb-lg text-center">Everything in Pro</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <div className="space-y-md">
              <div className="flex items-start gap-md p-md bg-surface-container-low rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-secondary">psychology</span>
                </div>
                <div>
                  <h4 className="font-body-md text-body-md font-semibold text-primary">AI-Powered Predictions</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Advanced machine learning models forecast your financial future with precision.</p>
                </div>
              </div>
              <div className="flex items-start gap-md p-md bg-surface-container-low rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-secondary">account_balance</span>
                </div>
                <div>
                  <h4 className="font-body-md text-body-md font-semibold text-primary">Unified Account Hub</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Connect all your accounts — from institutional to crypto — in one dashboard.</p>
                </div>
              </div>
            </div>
            <div className="space-y-md">
              <div className="flex items-start gap-md p-md bg-surface-container-low rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-secondary">shield</span>
                </div>
                <div>
                  <h4 className="font-body-md text-body-md font-semibold text-primary">Bank-Level Security</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">AES-256 encryption and multi-factor authentication protect your data.</p>
                </div>
              </div>
              <div className="flex items-start gap-md p-md bg-surface-container-low rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-secondary">support_agent</span>
                </div>
                <div>
                  <h4 className="font-body-md text-body-md font-semibold text-primary">Priority Support</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Dedicated account manager and 24/7 priority customer support.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section (Bonus) */}
      <section className="max-w-3xl mx-auto w-full">
        <h3 className="font-headline-md text-headline-md text-primary mb-lg text-center">Frequently Asked Questions</h3>
        <div className="space-y-md">
          {[
            { q: 'Can I switch plans at any time?', a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.' },
            { q: 'Is there a free trial for Pro?', a: 'We offer a 14-day free trial for the Institutional Pro plan. No credit card required.' },
            { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, debit cards, and bank transfers for annual plans.' },
            { q: 'Can I cancel my subscription?', a: 'Yes, you can cancel anytime. Your Pro features will remain active until the end of your billing period.' },
          ].map((faq, i) => (
            <details key={i} className="bg-surface-container-lowest rounded-xl border border-outline-variant group">
              <summary className="px-lg py-md font-body-md text-body-md font-semibold text-primary cursor-pointer hover:bg-surface-container-low rounded-xl transition-colors flex items-center justify-between list-none">
                {faq.q}
                <span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">expand_more</span>
              </summary>
              <div className="px-lg pb-md border-t border-outline-variant pt-md">
                <p className="font-body-sm text-body-sm text-on-surface-variant">{faq.a}</p>
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
};

export default UpgradeToProPage;
