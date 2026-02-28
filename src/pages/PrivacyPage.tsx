import {
  Shield, Eye, Database, Share2, Lock,
  Cookie, UserCheck, Clock, RefreshCw, Mail,
} from 'lucide-react';
import { PolicyLayout, type PolicySection } from '@/components/atoms/PolicyLayout.tsx';
import { SEO } from '@/components/SEO.tsx';

const sections: PolicySection[] = [
  {
    id: 'introduction',
    icon: Shield,
    title: 'Introduction',
    summary: 'We are committed to protecting your personal information and privacy.',
    content: (
      <>
        <p>Akash Crackers ("we", "our", "us") is committed to protecting your personal information and your right to privacy. This Privacy Policy describes how we collect, use, and protect information when you visit our website (akashcrackers.com) or make a purchase.</p>
        <p>By using our services, you consent to the data practices described in this policy.</p>
      </>
    ),
  },
  {
    id: 'info-collect',
    icon: Eye,
    title: 'Information We Collect',
    summary: 'We collect personal details you provide (name, email, address) and automatic data (IP, browser, cookies).',
    content: (
      <>
        <p><strong>Personal Information:</strong> When you place an order or create an account, we collect:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Full name, email address, and phone number</li>
          <li>Shipping and billing address</li>
          <li>Payment information (processed securely via third-party payment gateways — we do not store card details)</li>
          <li>Order history and product preferences</li>
        </ul>
        <p className="mt-3"><strong>Automatically Collected Information:</strong> When you browse our website, we may collect:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>IP address, browser type, and device information</li>
          <li>Pages visited, time spent, and navigation patterns</li>
          <li>Referral source and search queries</li>
          <li>Cookies and similar tracking technologies</li>
        </ul>
      </>
    ),
  },
  {
    id: 'how-we-use',
    icon: Database,
    title: 'How We Use Your Information',
    summary: 'We use your data to process orders, communicate with you, improve our services, and comply with the law.',
    content: (
      <>
        <p>We use the collected information for the following purposes:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Order fulfillment:</strong> Processing, shipping, and delivering your orders</li>
          <li><strong>Communication:</strong> Sending order confirmations, shipping updates, and customer support responses</li>
          <li><strong>Improvement:</strong> Analyzing usage patterns to improve our website, products, and services</li>
          <li><strong>Marketing:</strong> Sending promotional offers and newsletters (only with your consent; you can unsubscribe at any time)</li>
          <li><strong>Legal compliance:</strong> Meeting regulatory requirements related to the sale and transport of pyrotechnic products</li>
        </ul>
      </>
    ),
  },
  {
    id: 'data-sharing',
    icon: Share2,
    title: 'Data Sharing',
    summary: 'We never sell your data. We only share with shipping partners, payment processors, and when legally required.',
    content: (
      <>
        <p>We do not sell, trade, or rent your personal information. We may share data with:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Shipping partners:</strong> Name, phone, and address for delivery purposes</li>
          <li><strong>Payment processors:</strong> Secure payment processing (Razorpay, PayU, etc.)</li>
          <li><strong>Analytics providers:</strong> Anonymized usage data for website improvement</li>
          <li><strong>Legal authorities:</strong> If required by law, court order, or government request</li>
        </ul>
      </>
    ),
  },
  {
    id: 'data-security',
    icon: Lock,
    title: 'Data Security',
    summary: 'We use SSL encryption, PCI-DSS compliant payments, and regular security audits to protect your data.',
    content: (
      <>
        <p>We implement industry-standard security measures to protect your information:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>SSL/TLS encryption for all data transmission</li>
          <li>PCI-DSS compliant payment processing</li>
          <li>Encrypted database storage for personal information</li>
          <li>Regular security audits and vulnerability assessments</li>
          <li>Role-based access controls for internal data access</li>
        </ul>
      </>
    ),
  },
  {
    id: 'cookies',
    icon: Cookie,
    title: 'Cookies',
    summary: 'We use essential, preference, and analytics cookies. You can control them via your browser.',
    content: (
      <>
        <p>We use cookies and similar technologies to enhance your browsing experience. These include:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Essential cookies:</strong> Required for website functionality (cart, login sessions)</li>
          <li><strong>Preference cookies:</strong> Remember your settings (theme, currency, language)</li>
          <li><strong>Analytics cookies:</strong> Help us understand how visitors use our website</li>
        </ul>
        <p>You can control cookie settings through your browser. Disabling essential cookies may affect website functionality.</p>
      </>
    ),
  },
  {
    id: 'your-rights',
    icon: UserCheck,
    title: 'Your Rights',
    summary: 'You can access, correct, delete your data, or withdraw marketing consent at any time.',
    content: (
      <>
        <p>Under applicable Indian data protection laws, you have the right to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate information</li>
          <li>Request deletion of your personal data (subject to legal obligations)</li>
          <li>Withdraw consent for marketing communications</li>
          <li>Lodge a complaint with the relevant data protection authority</li>
        </ul>
        <p>To exercise these rights, contact us at hello@akashcrackers.com.</p>
      </>
    ),
  },
  {
    id: 'data-retention',
    icon: Clock,
    title: 'Data Retention',
    summary: 'We keep your data as long as needed. Order data is retained for 8 years per Indian tax law.',
    content: (
      <p>We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, and resolve disputes. Order data is retained for a minimum of 8 years as required by Indian tax and commercial regulations.</p>
    ),
  },
  {
    id: 'changes',
    icon: RefreshCw,
    title: 'Changes to This Policy',
    summary: 'We may update this policy. Changes will be posted here with an updated date.',
    content: (
      <p>We may update this Privacy Policy periodically. Changes will be posted on this page with an updated "Last Updated" date. We encourage you to review this policy regularly.</p>
    ),
  },
  {
    id: 'contact',
    icon: Mail,
    title: 'Contact',
    summary: 'Reach our Data Protection Officer for any privacy-related questions.',
    content: (
      <>
        <p>For privacy-related questions or requests, contact our Data Protection Officer:</p>
        <p className="font-medium text-surface-900 dark:text-surface-100">
          Email: privacy@akashcrackers.com<br />
          Phone: +91 98765 43210
        </p>
        <p>Akash Crackers, Sivakasi, Tamil Nadu, India — 626189</p>
      </>
    ),
  },
];

export function PrivacyPage() {
  return (
    <>
      <SEO
        title="Privacy Policy"
        description="Akash Crackers privacy policy. Learn how we collect, use, and protect your personal information when you use our website and services."
        canonical="/privacy"
      />
      <PolicyLayout
        title="Privacy Policy"
        eyebrow="Your Privacy"
        description="Learn how we collect, use, and protect your personal information when you use our services."
        lastUpdated="February 1, 2026"
        sections={sections}
      />
    </>
  );
}
