import { PolicyLayout, PolicySection } from '@/components/atoms/PolicyLayout.tsx';
import { SEO } from '@/components/SEO.tsx';

export function ReturnsPage() {
  return (
    <PolicyLayout title="Return Policy" eyebrow="Returns & Refunds" lastUpdated="February 1, 2026">
      <SEO
        title="Return & Refund Policy — 7-Day Easy Returns"
        description="Akash Crackers return policy. 7-day easy returns for unopened products, free replacement for damaged items, and refunds within 5-7 business days."
        canonical="/returns"
      />
      <PolicySection title="Our Return Promise">
        <p>At Akash Crackers, customer satisfaction is paramount. If you're not happy with your purchase, we make returns simple and hassle-free. We stand behind the quality of every product we sell.</p>
      </PolicySection>

      <PolicySection title="Eligibility for Returns">
        <p>Returns are accepted under the following conditions:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Timeframe:</strong> Within 7 days of delivery date</li>
          <li><strong>Condition:</strong> Products must be unopened, unused, and in original sealed packaging</li>
          <li><strong>Damaged on arrival:</strong> Report within 48 hours with photos — eligible for immediate replacement</li>
          <li><strong>Wrong item received:</strong> We ship the correct item at no extra cost and arrange pickup of the wrong item</li>
        </ul>
      </PolicySection>

      <PolicySection title="Non-Returnable Items">
        <p>Due to safety regulations governing pyrotechnic products, the following are not eligible for return:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Products that have been opened, lit, or partially used</li>
          <li>Products without original packaging or labels</li>
          <li>Products damaged due to improper storage by the customer</li>
          <li>Custom or made-to-order event packages</li>
          <li>Products returned after 7 days of delivery</li>
        </ul>
      </PolicySection>

      <PolicySection title="How to Initiate a Return">
        <p>Follow these steps to return a product:</p>
        <ol className="list-decimal pl-6 space-y-2">
          <li><strong>Contact us</strong> via email (hello@akashcrackers.com) or phone (+91 98765 43210) with your Order ID and reason for return.</li>
          <li><strong>Receive approval</strong> — our team will review your request within 24 hours and provide a return authorization if eligible.</li>
          <li><strong>Ship the product</strong> back using the prepaid shipping label we provide (for eligible returns). Pack securely in original packaging.</li>
          <li><strong>Inspection</strong> — once received, we inspect the product within 2 business days.</li>
          <li><strong>Refund processed</strong> — approved refunds are initiated within 5-7 business days to your original payment method.</li>
        </ol>
      </PolicySection>

      <PolicySection title="Refund Timeline">
        <div className="overflow-x-auto">
          <table className="w-full text-body-sm">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-700">
                <th className="text-left py-3 pr-4 font-semibold text-surface-900 dark:text-surface-100">Payment Method</th>
                <th className="text-left py-3 font-semibold text-surface-900 dark:text-surface-100">Refund Timeline</th>
              </tr>
            </thead>
            <tbody className="text-surface-600 dark:text-surface-400">
              <tr className="border-b border-surface-100 dark:border-surface-800"><td className="py-3 pr-4">UPI / Google Pay / PhonePe</td><td className="py-3">2-3 business days</td></tr>
              <tr className="border-b border-surface-100 dark:border-surface-800"><td className="py-3 pr-4">Credit / Debit Card</td><td className="py-3">5-7 business days</td></tr>
              <tr className="border-b border-surface-100 dark:border-surface-800"><td className="py-3 pr-4">Net Banking</td><td className="py-3">5-7 business days</td></tr>
              <tr><td className="py-3 pr-4">Cash on Delivery</td><td className="py-3">7-10 business days (bank transfer)</td></tr>
            </tbody>
          </table>
        </div>
      </PolicySection>

      <PolicySection title="Exchanges">
        <p>We currently don't offer direct exchanges. To get a different product, please initiate a return for the original item and place a new order for the desired product. If the replacement order is placed before the refund is processed, we can prioritize it.</p>
      </PolicySection>

      <PolicySection title="Damaged Product Guarantee">
        <p>If you receive a product that is damaged during shipping, we guarantee a full replacement or refund — no questions asked. Simply share clear photos of the damage within 48 hours of delivery, and we'll take care of the rest.</p>
        <p className="font-medium text-surface-900 dark:text-surface-100">Contact: hello@akashcrackers.com | +91 98765 43210</p>
      </PolicySection>
    </PolicyLayout>
  );
}
