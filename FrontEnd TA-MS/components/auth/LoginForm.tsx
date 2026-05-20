'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Zap, AlertCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from '@/components/providers/SessionProvider';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const errorVariants = {
  hidden: { opacity: 0, y: -6, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -4, scale: 0.97, transition: { duration: 0.15 } },
};

interface InputFieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon: React.ReactNode;
  error?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  autoComplete?: string;
  rightElement?: React.ReactNode;
  disabled?: boolean;
}

function InputField({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  icon,
  error,
  inputRef,
  autoComplete,
  rightElement,
  disabled,
}: InputFieldProps) {
  return (
    <motion.div variants={itemVariants} className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-xs font-semibold text-gray-600 uppercase tracking-wide"
      >
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {icon}
        </span>

        <input
          ref={inputRef}
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          suppressHydrationWarning
          className={cn(
            'w-full pl-10 pr-10 py-3 rounded-xl border bg-white text-sm text-gray-800',
            'placeholder-gray-400 transition-all duration-150 outline-none',
            'focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error
              ? 'border-red-300 focus:ring-red-500/20 focus:border-red-400'
              : 'border-gray-200 hover:border-gray-300'
          )}
        />

        {rightElement && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightElement}</span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            id={`${id}-error`}
            key={error}
            variants={errorVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="alert"
            className="flex items-center gap-1.5 text-xs text-red-500 font-medium"
          >
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const { isAuthenticated, signIn } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const emailRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  function validate(): boolean {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) errors.email = 'Email is required.';
    if (!password) errors.password = 'Password is required.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setGlobalError('');
    setFieldErrors({});

    await new Promise<void>((resolve) => setTimeout(resolve, 600));

    const result = await signIn(email, password);

    if (result.success) {
      router.push('/');
      router.refresh();
    } else {
      setLoading(false);
      setGlobalError(result.error ?? 'Invalid email or password.');
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md"
    >
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/60 px-8 py-10">

        <motion.div variants={itemVariants} className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-300/40 mb-4">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">TaskFlow AI</h1>
          <p className="text-sm text-gray-500 mt-1.5 text-center leading-relaxed">
            Your intelligent daily productivity assistant
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {globalError && (
            <motion.div
              key="global-error"
              variants={errorVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="alert"
              className="flex items-center gap-2.5 px-4 py-3 mb-5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {globalError}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <InputField
            id="email"
            label="Email address"
            type="email"
            value={email}
            onChange={(v) => { setEmail(v); if (globalError) setGlobalError(''); }}
            placeholder="you@example.com"
            icon={<Mail className="w-4 h-4" />}
            error={fieldErrors.email}
            inputRef={emailRef}
            autoComplete="email"
            disabled={loading}
          />

          <InputField
            id="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(v) => { setPassword(v); if (globalError) setGlobalError(''); }}
            placeholder="Enter your password"
            icon={<Lock className="w-4 h-4" />}
            error={fieldErrors.password}
            autoComplete="current-password"
            disabled={loading}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                tabIndex={0}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            }
          />

          <motion.div variants={itemVariants} className="pt-1">
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              transition={{ duration: 0.1 }}
              className={cn(
                'w-full flex items-center justify-center gap-2.5 py-3 px-6 rounded-xl',
                'text-sm font-semibold text-white transition-colors duration-150',
                'bg-blue-500 hover:bg-blue-600 shadow-md shadow-blue-200',
                'disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none',
                'focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2'
              )}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in securely
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
      </div>

      <motion.p
        variants={itemVariants}
        className="text-center text-xs text-gray-400 mt-6"
      >
        Protected session cookies · refresh rotation · installable PWA
      </motion.p>
    </motion.div>
  );
}
