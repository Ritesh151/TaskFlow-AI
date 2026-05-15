import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In — TaskFlow AI',
  description: 'Sign in to your TaskFlow AI productivity assistant',
};

export default function LoginPage() {
  return (
    /*
     * Full-screen centered layout.
     * The subtle radial gradient echoes the blue/purple brand palette
     * without competing with the card's glassmorphism effect.
     */
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.12) 0%, transparent 70%), #f5f7fb',
      }}
    >
      {/* Decorative blurred blobs — purely visual, aria-hidden */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-50 rounded-full opacity-30 blur-2xl" />
      </div>

      {/* The form card sits above the decorative layer */}
      <div className="relative z-10 w-full flex justify-center">
        <LoginForm />
      </div>
    </div>
  );
}
