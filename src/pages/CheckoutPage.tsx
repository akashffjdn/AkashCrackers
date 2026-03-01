import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Truck, CreditCard, CheckCircle, ShieldCheck, Wallet, AlertCircle } from 'lucide-react';
import { Container } from '@/components/atoms/Container.tsx';
import { Button } from '@/components/atoms/Button.tsx';
import { useCartStore } from '@/store/cart.ts';
import { useAuthStore } from '@/store/auth.ts';
import { useRazorpay } from '@/hooks/useRazorpay.ts';
import { createOrder } from '@/services/firestore.ts';
import api from '@/lib/api.ts';
import { siteConfig } from '@/config/site.ts';
import { formatPrice, cn } from '@/lib/utils.ts';
import type { OrderItem } from '@/types/index.ts';

type CheckoutStep = 'information' | 'shipping' | 'payment';

export function CheckoutPage() {
  const { items, totalPrice, totalSavings, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { isLoading: isRazorpayLoading, isProcessing, error: paymentError, openPayment } = useRazorpay();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('information');
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const shippingCost = shippingMethod === 'express' ? 199 : 0;
  const orderTotal = totalPrice() + shippingCost;

  const steps: { id: CheckoutStep; label: string; icon: typeof Lock }[] = [
    { id: 'information', label: 'Information', icon: Lock },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'payment', label: 'Payment', icon: CreditCard },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = 'Invalid email address';

    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.phone.trim()) errors.phone = 'Phone is required';
    else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\s/g, '')))
      errors.phone = 'Enter a valid 10-digit phone number';

    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.pincode.trim()) errors.pincode = 'PIN code is required';
    else if (!/^\d{6}$/.test(formData.pincode))
      errors.pincode = 'Enter a valid 6-digit PIN code';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      if (formErrors.email || formErrors.firstName || formErrors.lastName || formErrors.phone) {
        setCurrentStep('information');
      } else {
        setCurrentStep('shipping');
      }
      return;
    }

    if (!isAuthenticated || !user) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKeyId) {
      setFormErrors({ submit: 'Payment gateway is not configured.' });
      return;
    }

    try {
      // Step 1: Create Razorpay order on backend (tamper-proof amount)
      const paymentOrder: { id: string; amount: number; currency: string } =
        await api.post('/payments/create-order', { amount: orderTotal });

      // Step 2: Open Razorpay with server-generated order
      await openPayment({
        key: razorpayKeyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency || 'INR',
        name: siteConfig.name,
        description: `Order — ${items.length} item${items.length > 1 ? 's' : ''}`,
        order_id: paymentOrder.id,
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#F59E0B',
        },
        handler: async (response) => {
          setIsSubmitting(true);
          try {
            // Step 3: Verify payment signature on backend
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // Step 4: Create order in database
            const orderItems: OrderItem[] = items.map((item) => ({
              productId: item.product.id,
              name: item.product.name,
              slug: item.product.slug,
              image: item.product.images[0],
              price: item.product.price,
              quantity: item.quantity,
            }));

            const orderId = await createOrder(user.uid, {
              userId: user.uid,
              items: orderItems,
              subtotal: totalPrice(),
              shipping: shippingCost,
              total: orderTotal,
              status: 'pending',
              shippingAddress: {
                id: '',
                label: 'Checkout',
                fullName: `${formData.firstName} ${formData.lastName}`,
                phone: formData.phone,
                addressLine1: formData.address,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                isDefault: false,
              },
              paymentMethod: 'razorpay',
              paymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
            });

            clearCart();
            navigate(`/order-confirmation/${orderId}`);
          } catch {
            setFormErrors({ submit: 'Payment verification failed. Please contact support.' });
          } finally {
            setIsSubmitting(false);
          }
        },
        modal: {
          confirm_close: true,
        },
      });
    } catch (err) {
      setFormErrors({ submit: err instanceof Error ? err.message : 'Payment failed. Please try again.' });
    }
  };

  if (items.length === 0) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display font-bold text-display-sm text-surface-900 dark:text-surface-50">
            Your Cart is Empty
          </h1>
          <p className="mt-4 text-body-lg text-surface-500">
            Add some products before checking out.
          </p>
          <Link to="/shop" className="mt-6 inline-block">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const inputClass = cn(
    'w-full px-4 py-3 rounded-xl text-body-md',
    'bg-white dark:bg-surface-850',
    'border border-surface-200 dark:border-surface-700',
    'text-surface-900 dark:text-surface-100',
    'placeholder:text-surface-400 dark:placeholder:text-surface-500',
    'focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500',
    'transition-colors',
  );

  const errorInputClass = cn(
    'w-full px-4 py-3 rounded-xl text-body-md',
    'bg-white dark:bg-surface-850',
    'border border-red-500',
    'text-surface-900 dark:text-surface-100',
    'placeholder:text-surface-400 dark:placeholder:text-surface-500',
    'focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500',
    'transition-colors',
  );

  const getInputClass = (field: string) => formErrors[field] ? errorInputClass : inputClass;

  return (
    <div className="pt-16 lg:pt-18 min-h-screen bg-surface-50 dark:bg-surface-950">

      <Container size="wide">
        <div className="py-8 lg:py-12">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-4 mb-10">
            {steps.map((step, i) => {
              const StepIcon = step.icon;
              const isCompleted = i < currentStepIndex;
              const isCurrent = step.id === currentStep;
              return (
                <div key={step.id} className="flex items-center gap-2">
                  {i > 0 && (
                    <div className={cn(
                      'w-12 h-px',
                      isCompleted ? 'bg-brand-500' : 'bg-surface-300 dark:bg-surface-700',
                    )} />
                  )}
                  <button
                    onClick={() => i <= currentStepIndex && setCurrentStep(step.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-xl text-body-sm font-medium transition-colors',
                      isCompleted && 'text-brand-500',
                      isCurrent && 'bg-brand-500/10 text-brand-500 border border-brand-500/20',
                      !isCompleted && !isCurrent && 'text-surface-400',
                    )}
                  >
                    {isCompleted ? <CheckCircle size={16} /> : <StepIcon size={16} />}
                    <span className="hidden sm:inline">{step.label}</span>
                  </button>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Form Section */}
            <div className="lg:col-span-3">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-surface-900 rounded-2xl p-6 lg:p-8 border border-surface-200 dark:border-surface-800"
              >
                {currentStep === 'information' && (
                  <>
                    <h2 className="font-display font-bold text-heading-md text-surface-900 dark:text-surface-50 mb-6">
                      Contact Information
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <input name="email" type="email" placeholder="Email address" value={formData.email} onChange={handleInputChange} className={getInputClass('email')} />
                        {formErrors.email && <p className="mt-1 text-caption text-red-500">{formErrors.email}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <input name="firstName" placeholder="First name" value={formData.firstName} onChange={handleInputChange} className={getInputClass('firstName')} />
                          {formErrors.firstName && <p className="mt-1 text-caption text-red-500">{formErrors.firstName}</p>}
                        </div>
                        <div>
                          <input name="lastName" placeholder="Last name" value={formData.lastName} onChange={handleInputChange} className={getInputClass('lastName')} />
                          {formErrors.lastName && <p className="mt-1 text-caption text-red-500">{formErrors.lastName}</p>}
                        </div>
                      </div>
                      <div>
                        <input name="phone" type="tel" placeholder="Phone number" value={formData.phone} onChange={handleInputChange} className={getInputClass('phone')} />
                        {formErrors.phone && <p className="mt-1 text-caption text-red-500">{formErrors.phone}</p>}
                      </div>
                    </div>
                  </>
                )}

                {currentStep === 'shipping' && (
                  <>
                    <h2 className="font-display font-bold text-heading-md text-surface-900 dark:text-surface-50 mb-6">
                      Shipping Address
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <input name="address" placeholder="Street address" value={formData.address} onChange={handleInputChange} className={getInputClass('address')} />
                        {formErrors.address && <p className="mt-1 text-caption text-red-500">{formErrors.address}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <input name="city" placeholder="City" value={formData.city} onChange={handleInputChange} className={getInputClass('city')} />
                          {formErrors.city && <p className="mt-1 text-caption text-red-500">{formErrors.city}</p>}
                        </div>
                        <div>
                          <input name="state" placeholder="State" value={formData.state} onChange={handleInputChange} className={getInputClass('state')} />
                          {formErrors.state && <p className="mt-1 text-caption text-red-500">{formErrors.state}</p>}
                        </div>
                      </div>
                      <div>
                        <input name="pincode" placeholder="PIN Code" value={formData.pincode} onChange={handleInputChange} className={getInputClass('pincode')} />
                        {formErrors.pincode && <p className="mt-1 text-caption text-red-500">{formErrors.pincode}</p>}
                      </div>
                    </div>

                    <div className="mt-6 p-4 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-800">
                      <p className="text-body-sm font-semibold text-surface-900 dark:text-surface-100">Shipping Method</p>
                      <div className="mt-3 space-y-2">
                        <label
                          onClick={() => setShippingMethod('standard')}
                          className={cn(
                            'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors',
                            shippingMethod === 'standard'
                              ? 'border-brand-500 bg-brand-500/5'
                              : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600',
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full border-2 border-brand-500 flex items-center justify-center">
                              {shippingMethod === 'standard' && <div className="w-2 h-2 rounded-full bg-brand-500" />}
                            </div>
                            <span className="text-body-sm font-medium text-surface-900 dark:text-surface-100">Standard Delivery (5-7 days)</span>
                          </div>
                          <span className="text-body-sm font-bold text-brand-500">FREE</span>
                        </label>
                        <label
                          onClick={() => setShippingMethod('express')}
                          className={cn(
                            'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors',
                            shippingMethod === 'express'
                              ? 'border-brand-500 bg-brand-500/5'
                              : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600',
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                              shippingMethod === 'express' ? 'border-brand-500' : 'border-surface-300 dark:border-surface-600',
                            )}>
                              {shippingMethod === 'express' && <div className="w-2 h-2 rounded-full bg-brand-500" />}
                            </div>
                            <span className="text-body-sm font-medium text-surface-700 dark:text-surface-300">Express Delivery (2-3 days)</span>
                          </div>
                          <span className="text-body-sm font-bold text-surface-700 dark:text-surface-300">{formatPrice(199)}</span>
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {currentStep === 'payment' && (
                  <>
                    <h2 className="font-display font-bold text-heading-md text-surface-900 dark:text-surface-50 mb-6">
                      Payment
                    </h2>

                    {/* Razorpay payment option */}
                    <div className="p-5 rounded-xl border-2 border-brand-500 bg-brand-500/5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full border-2 border-brand-500 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-brand-500" />
                          </div>
                          <Wallet size={20} className="text-brand-500" />
                          <span className="text-body-md font-semibold text-surface-900 dark:text-surface-100">
                            Pay with Razorpay
                          </span>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-brand-500/10 text-caption font-bold text-brand-600 dark:text-brand-400">
                          RECOMMENDED
                        </span>
                      </div>
                      <p className="text-body-sm text-surface-500 ml-10">
                        Cards, UPI, Net Banking, Wallets &mdash; all payment methods in one secure checkout.
                      </p>
                    </div>

                    {/* Payment method icons */}
                    <div className="mt-4 flex items-center gap-3 px-1">
                      {['UPI', 'Visa', 'Mastercard', 'Net Banking', 'Wallets'].map((method) => (
                        <span key={method} className="px-2.5 py-1.5 rounded-lg bg-surface-100 dark:bg-surface-850 text-caption font-medium text-surface-500">
                          {method}
                        </span>
                      ))}
                    </div>

                    {/* Security note */}
                    <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-surface-50 dark:bg-surface-850">
                      <ShieldCheck size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      <p className="text-body-sm text-surface-500">
                        Payment is processed securely by Razorpay. Your financial details are never shared with us.
                      </p>
                    </div>

                    {/* Error display */}
                    {(paymentError || formErrors.submit) && (
                      <div className="mt-4 flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                        <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                        <p className="text-body-sm text-red-600 dark:text-red-400">
                          {paymentError || formErrors.submit}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Navigation */}
                <div className="mt-8 flex items-center justify-between">
                  {currentStepIndex > 0 ? (
                    <button
                      onClick={handleBack}
                      className="text-body-sm font-medium text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
                    >
                      &larr; Back
                    </button>
                  ) : (
                    <div />
                  )}
                  {currentStep === 'payment' ? (
                    <Button
                      size="lg"
                      onClick={handlePayment}
                      isLoading={isRazorpayLoading || isProcessing || isSubmitting}
                      disabled={isRazorpayLoading || isProcessing || isSubmitting}
                    >
                      <Lock size={16} />
                      {isProcessing
                        ? 'Processing...'
                        : isSubmitting
                          ? 'Creating Order...'
                          : `Pay ${formatPrice(orderTotal)}`}
                    </Button>
                  ) : (
                    <Button size="lg" onClick={handleNext}>
                      Continue
                    </Button>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 bg-white dark:bg-surface-900 rounded-2xl p-6 border border-surface-200 dark:border-surface-800">
                <h3 className="font-display font-bold text-heading-sm text-surface-900 dark:text-surface-50 mb-4">
                  Order Summary
                </h3>

                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-surface-100 dark:bg-surface-850 flex-shrink-0">
                        <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-500 text-surface-950 text-caption font-bold flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm font-medium text-surface-900 dark:text-surface-100 truncate">{item.product.name}</p>
                        <p className="text-caption text-surface-500">{formatPrice(item.product.price)} each</p>
                      </div>
                      <span className="text-body-sm font-bold text-surface-900 dark:text-surface-100">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-surface-200 dark:border-surface-800 space-y-2">
                  <div className="flex justify-between text-body-sm text-surface-500">
                    <span>Subtotal</span>
                    <span>{formatPrice(totalPrice())}</span>
                  </div>
                  {totalSavings() > 0 && (
                    <div className="flex justify-between text-body-sm text-emerald-600 dark:text-emerald-400">
                      <span>Savings</span>
                      <span>-{formatPrice(totalSavings())}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-body-sm text-surface-500">
                    <span>Shipping</span>
                    <span className={cn(
                      'font-medium',
                      shippingCost === 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-surface-900 dark:text-surface-100',
                    )}>
                      {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-surface-200 dark:border-surface-800">
                    <span className="font-display font-bold text-heading-sm text-surface-900 dark:text-surface-50">Total</span>
                    <span className="font-display font-bold text-heading-sm text-brand-600 dark:text-brand-400">{formatPrice(orderTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
