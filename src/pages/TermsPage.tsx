import { PolicyLayout, PolicySection } from '@/components/atoms/PolicyLayout.tsx';
import { SEO } from '@/components/SEO.tsx';

export function TermsPage() {
  return (
    <PolicyLayout title="Terms of Service" eyebrow="Legal" lastUpdated="February 1, 2026">
      <SEO
        title="Terms of Service"
        description="Akash Crackers terms of service. Read our policies on eligibility, ordering, payments, shipping, and usage of our website and services."
        canonical="/terms"
      />
      <PolicySection title="Agreement to Terms">
        <p>By accessing and using the Akash Crackers website (akashcrackers.com) and services, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our website or services.</p>
      </PolicySection>

      <PolicySection title="Eligibility">
        <p>You must be at least 18 years of age to purchase products from our store. By placing an order, you confirm that you meet this age requirement. Fireworks classified as "Professional Grade" may have additional age and licensing requirements as per local regulations.</p>
      </PolicySection>

      <PolicySection title="Products & Pricing">
        <p>All products listed on our website are BIS (Bureau of Indian Standards) certified and comply with applicable Indian regulations for fireworks and pyrotechnic articles.</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Prices are listed in Indian Rupees (₹) and include applicable taxes unless stated otherwise.</li>
          <li>We reserve the right to modify prices at any time without prior notice.</li>
          <li>Product images are representative. Actual packaging and product appearance may vary slightly.</li>
          <li>Product availability is subject to stock levels and may change without notice.</li>
        </ul>
      </PolicySection>

      <PolicySection title="Orders & Payment">
        <p>Placing an order constitutes an offer to purchase. We reserve the right to accept or decline orders. An order is confirmed only upon payment verification and dispatch of confirmation email.</p>
        <p>We accept credit/debit cards, UPI, net banking, and cash on delivery. All online payments are processed through secure, PCI-DSS compliant payment gateways.</p>
      </PolicySection>

      <PolicySection title="Shipping & Delivery">
        <p>Please refer to our <a href="/shipping" className="text-brand-500 hover:underline">Shipping Policy</a> for detailed information on delivery timelines, packaging, and coverage. Delivery timelines are estimates and not guaranteed — delays due to weather, logistics, or regulatory factors are beyond our control.</p>
      </PolicySection>

      <PolicySection title="Returns & Refunds">
        <p>Our return and refund policies are outlined in our <a href="/returns" className="text-brand-500 hover:underline">Return Policy</a>. By purchasing from us, you agree to the terms and conditions specified therein.</p>
      </PolicySection>

      <PolicySection title="Safety & Liability">
        <p>Fireworks are inherently hazardous products. By purchasing from Akash Crackers, you acknowledge that:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>You will use all products in accordance with the safety instructions provided on each product and on our <a href="/safety" className="text-brand-500 hover:underline">Safety Guidelines</a> page.</li>
          <li>You assume full responsibility for the safe use, storage, and handling of all products purchased.</li>
          <li>Akash Crackers is not liable for injuries, property damage, or any loss resulting from misuse, improper storage, or failure to follow safety guidelines.</li>
          <li>You will comply with all local, state, and national laws and regulations regarding fireworks use in your area.</li>
        </ul>
      </PolicySection>

      <PolicySection title="Intellectual Property">
        <p>All content on this website — including text, images, logos, product names, and design elements — is the property of Akash Crackers and protected by applicable intellectual property laws. You may not reproduce, distribute, or use any content without our written permission.</p>
      </PolicySection>

      <PolicySection title="Limitation of Liability">
        <p>To the maximum extent permitted by law, Akash Crackers shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our website or products. Our total liability shall not exceed the amount paid by you for the specific product in question.</p>
      </PolicySection>

      <PolicySection title="Governing Law">
        <p>These Terms of Service are governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Sivakasi / Virudhunagar, Tamil Nadu.</p>
      </PolicySection>

      <PolicySection title="Contact">
        <p>For questions about these Terms of Service, contact us at:</p>
        <p className="font-medium text-surface-900 dark:text-surface-100">Email: hello@akashcrackers.com | Phone: +91 98765 43210</p>
      </PolicySection>
    </PolicyLayout>
  );
}
