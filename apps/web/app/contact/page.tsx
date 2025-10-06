// apps/web/app/contact/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact TijaraLink",
};

const CONTACT_CARDS = [
  {
    title: "Product & Platform",
    description:
      "Schedule a guided walkthrough of the buyer and supplier workspaces and learn how we can adapt to your current stack.",
    email: "product@tijaralink.com",
    cta: "Book a platform demo",
    href: "mailto:product@tijaralink.com",
  },
  {
    title: "Supplier Success",
    description:
      "Need help onboarding your sourcing team or verifying supplier credentials? Our success partners can assist within 24 hours.",
    email: "success@tijaralink.com",
    cta: "Talk to supplier success",
    href: "mailto:success@tijaralink.com",
  },
  {
    title: "Support & Escrow",
    description:
      "Questions about compliance, escrow release, or logistics milestones? Reach our support engineers any time.",
    email: "support@tijaralink.com",
    cta: "Open a support ticket",
    href: "mailto:support@tijaralink.com",
  },
];

export default function ContactPage() {
  return (
    <main className="page contact-page">
      <section className="card hero">
        <div className="hero__content">
          <span className="hero__eyebrow">Connect with TijaraLink</span>
          <h1 className="hero__title">We are ready to partner on your next trade lane.</h1>
          <p className="hero__subtitle">
            Choose the path that fits your team&apos;s needs or drop us a note and we&apos;ll route it to the right specialist within
            one business day.
          </p>
          <div className="cta-row">
            <Link className="button-primary" href="mailto:hello@tijaralink.com">
              Email hello@tijaralink.com
            </Link>
            <Link className="button-secondary" href="/register">
              Start your workspace
            </Link>
          </div>
        </div>
      </section>

      <section className="layout-grid contact-grid">
        {CONTACT_CARDS.map((card) => (
          <article key={card.title} className="card card--compact contact-card">
            <header className="contact-card__header">
              <h2>{card.title}</h2>
              <p>{card.description}</p>
            </header>
            <p className="contact-card__email">{card.email}</p>
            <a className="button-tertiary" href={card.href}>
              {card.cta}
            </a>
          </article>
        ))}
      </section>
    </main>
  );
}
