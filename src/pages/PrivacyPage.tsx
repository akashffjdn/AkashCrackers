import { PolicyLayout, PolicySection } from '@/components/atoms/PolicyLayout.tsx';

export function PrivacyPage() {
  return (
    <PolicyLayout title="Privacy Policy" eyebrow="Your Privacy" lastUpdated="February 1, 2026">
      <PolicySection title="Introduction">
        <p>Akash Crackers ("we", "our", "us") is committed to protecting your personal information and your right to privacy. This Privacy Policy describes how we collect, use, and protect information when you visit our website (akashcrackers.com) or make a purchase.</p>
        <p>By using our services, you consent to the data practices described in this policy.</p>
      </PolicySection>

      <PolicySection title="Information We Collect">
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
      </PolicySection>

      <PolicySection title="How We Use Your Information">
        <p>We use the collected information for the following purposes:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Order fulfillment:</strong> Processing, shipping, and delivering your orders</li>
          <li><strong>Communication:</strong> Sending order confirmations, shipping updates, and customer support responses</li>
          <li><strong>Improvement:</strong> Analyzing usage patterns to improve our website, products, and services</li>
          <li><strong>Marketing:</strong> Sending promotional offers and newsletters (only with your consent; you can unsubscribe at any time)</li>
          <li><strong>Legal compliance:</strong> Meeting regulatory requirements related to the sale and transport of pyrotechnic products</li>
        </ul>
      </PolicySection>

      <PolicySection title="Data Sharing">
        <p>We do not sell, trade, or rent your personal information. We may share data with:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Shipping partners:</strong> Name, phone, and address for delivery purposes</li>
          <li><strong>Payment processors:</strong> Secure payment processing (Razorpay, PayU, etc.)</li>
          <li><strong>Analytics providers:</strong> Anonymized usage data for website improvement</li>
          <li><strong>Legal authorities:</strong> If required by law, court order, or government request</li>
        </ul>
      </PolicySection>

      <PolicySection title="Data Security">
        <p>We implement industry-standard security measures to protect your information:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>SSL/TLS encryption for all data transmission</li>
          <li>PCI-DSS compliant payment processing</li>
          <li>Encrypted database storage for personal information</li>
          <li>Regular security audits and vulnerability assessments</li>
          <li>Role-based access controls for internal data access</li>
        </ul>
      </PolicySection>

      <PolicySection title="Cookies">
        <p>We use cookies and similar technologies to enhance your browsing experience. These include:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Essential cookies:</strong> Required for website functionality (cart, login sessions)</li>
          <li><strong>Preference cookies:</strong> Remember your settings (theme, currency, language)</li>
          <li><strong>Analytics cookies:</strong> Help us understand how visitors use our website</li>
        </ul>
        <p>You can control cookie settings through your browser. Disabling essential cookies may affect website functionality.</p>
      </PolicySection>

      <PolicySection title="Your Rights">
        <p>Under applicable Indian data protection laws, you have the right to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate information</li>
          <li>Request deletion of your personal data (subject to legal obligations)</li>
          <li>Withdraw consent for marketing communications</li>
          <li>Lodge a complaint with the relevant data protection authority</li>
        </ul>
        <p>To exercise these rights, contact us at hello@akashcrackers.com.</p>
      </PolicySection>

      <PolicySection title="Data Retention">
        <p>We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, and resolve disputes. Order data is retained for a minimum of 8 years as required by Indian tax and commercial regulations.</p>
      </PolicySection>

      <PolicySection title="Changes to This Policy">
        <p>We may update this Privacy Policy periodically. Changes will be posted on this page with an updated "Last Updated" date. We encourage you to review this policy regularly.</p>
      </PolicySection>

      <PolicySection title="Contact">
        <p>For privacy-related questions or requests, contact our Data Protection Officer:</p>
        <p className="font-medium text-surface-900 dark:text-surface-100">Email: privacy@akashcrackers.com | Phone: +91 98765 43210</p>
        <p>Akash Crackers, Sivakasi, Tamil Nadu, India — 626189</p>
      </PolicySection>
    </PolicyLayout>
  );
}
