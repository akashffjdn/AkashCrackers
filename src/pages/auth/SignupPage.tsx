import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, AlertCircle } from 'lucide-react';
import { Input } from '@/components/atoms/Input.tsx';
import { Button } from '@/components/atoms/Button.tsx';
import { SocialLoginButton } from '@/components/molecules/SocialLoginButton.tsx';
import { PasswordStrengthBar } from '@/components/molecules/PasswordStrengthBar.tsx';
import { signUpWithEmail, signInWithGoogle } from '@/services/auth.ts';
import { useAuthStore } from '@/store/auth.ts';

export function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!agreed) {
      setError('Please accept the terms and conditions');
      return;
    }

    setIsLoading(true);
    try {
      const user = await signUpWithEmail(form.email, form.password, form.name);
      setUser(user);
      navigate('/account', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('email-already-in-use')) {
        setError('An account with this email already exists');
      } else if (msg.includes('weak-password')) {
        setError('Password is too weak');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      const user = await signInWithGoogle();
      setUser(user);
      navigate('/account', { replace: true });
    } catch {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-surface-900 rounded-2xl p-6 sm:p-8 border border-surface-200 dark:border-surface-800 shadow-card"
    >
      <div className="text-center mb-8">
        <h1 className="font-display font-bold text-heading-lg text-surface-900 dark:text-surface-50">
          Create your account
        </h1>
        <p className="mt-2 text-body-md text-surface-500">
          Join 50,000+ happy customers
        </p>
      </div>

      {/* Google OAuth */}
      <SocialLoginButton onClick={handleGoogle} isLoading={isGoogleLoading} label="Sign up with Google" />

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
        <span className="text-caption text-surface-400 uppercase tracking-wider">or</span>
        <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-body-sm text-red-600 dark:text-red-400">
          <AlertCircle size={16} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          name="name"
          placeholder="John Doe"
          value={form.name}
          onChange={handleChange}
          icon={<User size={18} />}
          required
          autoFocus
        />
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          icon={<Mail size={18} />}
          required
          autoComplete="email"
        />
        <Input
          label="Phone"
          name="phone"
          type="tel"
          placeholder="+91 98765 43210"
          value={form.phone}
          onChange={handleChange}
          icon={<Phone size={18} />}
        />
        <div>
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Min. 8 characters"
            value={form.password}
            onChange={handleChange}
            icon={<Lock size={18} />}
            required
            autoComplete="new-password"
          />
          <PasswordStrengthBar password={form.password} />
        </div>
        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          placeholder="Repeat your password"
          value={form.confirmPassword}
          onChange={handleChange}
          icon={<Lock size={18} />}
          required
          autoComplete="new-password"
        />

        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-surface-300 text-brand-500 focus:ring-brand-500"
          />
          <span className="text-body-sm text-surface-500">
            I agree to the{' '}
            <Link to="/terms" className="text-brand-500 hover:underline" target="_blank">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-brand-500 hover:underline" target="_blank">Privacy Policy</Link>
          </span>
        </label>

        <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-body-sm text-surface-500">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-500 font-semibold hover:text-brand-600 transition-colors">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
