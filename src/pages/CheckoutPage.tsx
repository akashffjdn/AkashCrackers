import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Lock, Truck, CreditCard, CheckCircle } from 'lucide-react';
import { Container } from '@/components/atoms/Container.tsx';
import { Button } from '@/components/atoms/Button.tsx';
import { useCartStore } from '@/store/cart.ts';
import { formatPrice, cn } from '@/lib/utils.ts';

type CheckoutStep = 'information' | 'shipping' | 'payment';

export function CheckoutPage() {
  const { items, totalPrice, totalSavings } = useCartStore();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('information');
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

  const steps: { id: CheckoutStep; label: string; icon: typeof Lock }[] = [
    { id: 'information', label: 'Information', icon: Lock },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'payment', label: 'Payment', icon: CreditCard },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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

  return (
    <div className="pt-20 lg:pt-24 min-h-screen bg-surface-50 dark:bg-surface-950">
      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800">
        <Container size="wide">
          <nav className="flex items-center gap-2 py-4 text-body-sm text-surface-500">
            <Link to="/" className="hover:text-brand-500 transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link to="/shop" className="hover:text-brand-500 transition-colors">Shop</Link>
            <ChevronRight size={14} />
            <span className="text-surface-900 dark:text-surface-100 font-medium">Checkout</span>
          </nav>
        </Container>
      </div>

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
                      <input name="email" type="email" placeholder="Email address" value={formData.email} onChange={handleInputChange} className={inputClass} />
                      <div className="grid grid-cols-2 gap-4">
                        <input name="firstName" placeholder="First name" value={formData.firstName} onChange={handleInputChange} className={inputClass} />
                        <input name="lastName" placeholder="Last name" value={formData.lastName} onChange={handleInputChange} className={inputClass} />
                      </div>
                      <input name="phone" type="tel" placeholder="Phone number" value={formData.phone} onChange={handleInputChange} className={inputClass} />
                    </div>
                  </>
                )}

                {currentStep === 'shipping' && (
                  <>
                    <h2 className="font-display font-bold text-heading-md text-surface-900 dark:text-surface-50 mb-6">
                      Shipping Address
                    </h2>
                    <div className="space-y-4">
                      <input name="address" placeholder="Street address" value={formData.address} onChange={handleInputChange} className={inputClass} />
                      <div className="grid grid-cols-2 gap-4">
                        <input name="city" placeholder="City" value={formData.city} onChange={handleInputChange} className={inputClass} />
                        <input name="state" placeholder="State" value={formData.state} onChange={handleInputChange} className={inputClass} />
                      </div>
                      <input name="pincode" placeholder="PIN Code" value={formData.pincode} onChange={handleInputChange} className={inputClass} />
                    </div>

                    <div className="mt-6 p-4 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-800">
                      <p className="text-body-sm font-semibold text-surface-900 dark:text-surface-100">Shipping Method</p>
                      <div className="mt-3 space-y-2">
                        <label className="flex items-center justify-between p-3 rounded-lg border border-brand-500 bg-brand-500/5 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full border-2 border-brand-500 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-brand-500" />
                            </div>
                            <span className="text-body-sm font-medium text-surface-900 dark:text-surface-100">Standard Delivery (5-7 days)</span>
                          </div>
                          <span className="text-body-sm font-bold text-brand-500">FREE</span>
                        </label>
                        <label className="flex items-center justify-between p-3 rounded-lg border border-surface-200 dark:border-surface-700 cursor-pointer hover:border-surface-300 dark:hover:border-surface-600 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full border-2 border-surface-300 dark:border-surface-600" />
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
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl border border-brand-500/30 bg-brand-500/5">
                        <div className="flex items-center gap-3 mb-4">
                          <CreditCard size={20} className="text-brand-500" />
                          <span className="text-body-md font-semibold text-surface-900 dark:text-surface-100">Card Payment</span>
                        </div>
                        <div className="space-y-4">
                          <input placeholder="Card number" className={inputClass} />
                          <div className="grid grid-cols-2 gap-4">
                            <input placeholder="MM / YY" className={inputClass} />
                            <input placeholder="CVV" className={inputClass} />
                          </div>
                          <input placeholder="Name on card" className={inputClass} />
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-50 dark:bg-surface-850">
                        <Lock size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                        <p className="text-body-sm text-surface-500">
                          Your payment info is encrypted and secure. We never store your card details.
                        </p>
                      </div>
                    </div>
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
                    <Button size="lg" onClick={() => alert('Order placed! (Demo)')}>
                      <Lock size={16} />
                      Pay {formatPrice(totalPrice())}
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
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">FREE</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-surface-200 dark:border-surface-800">
                    <span className="font-display font-bold text-heading-sm text-surface-900 dark:text-surface-50">Total</span>
                    <span className="font-display font-bold text-heading-sm text-brand-600 dark:text-brand-400">{formatPrice(totalPrice())}</span>
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
