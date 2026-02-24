import { useState, useCallback } from 'react';
import type { RazorpayOptions } from '@/types/index.ts';

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const existingScript = document.querySelector(
      `script[src="${RAZORPAY_SCRIPT_URL}"]`,
    );
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () =>
        reject(new Error('Failed to load Razorpay SDK')),
      );
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.body.appendChild(script);
  });
}

export function useRazorpay() {
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPayment = useCallback(async (options: RazorpayOptions) => {
    setError(null);
    setIsLoading(true);

    try {
      await loadRazorpayScript();
      setIsLoading(false);
      setIsProcessing(true);

      const wrappedOptions: RazorpayOptions = {
        ...options,
        handler: (response) => {
          setIsProcessing(false);
          options.handler(response);
        },
        modal: {
          ...options.modal,
          ondismiss: () => {
            setIsProcessing(false);
            options.modal?.ondismiss?.();
          },
        },
      };

      const rzp = new window.Razorpay(wrappedOptions);
      rzp.on('payment.failed', () => {
        setIsProcessing(false);
        setError('Payment failed. Please try again.');
      });
      rzp.open();
    } catch (err) {
      setIsLoading(false);
      setIsProcessing(false);
      setError(
        err instanceof Error ? err.message : 'Failed to initialize payment',
      );
    }
  }, []);

  return { isLoading, isProcessing, error, openPayment };
}
