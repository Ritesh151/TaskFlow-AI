'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const IDLE_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes

interface IdleModalProps {
  active: boolean; // only run when session is active (checked in, not checked out)
  onStartBreak: () => void;
  onDismiss: () => void;
}

export function IdleModal({ active, onStartBreak, onDismiss }: IdleModalProps) {
  const [idle, setIdle] = useState(false);
  const lastActivityRef = useRef(0);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    setIdle(false);
  }, []);

  useEffect(() => {
    if (!active) {
      const timeoutId = window.setTimeout(() => {
        setIdle(false);
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }

    lastActivityRef.current = Date.now();

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetActivity, { passive: true }));

    const interval = setInterval(() => {
      if (Date.now() - lastActivityRef.current >= IDLE_THRESHOLD_MS) {
        setIdle(true);
      }
    }, 30_000); // check every 30s

    return () => {
      events.forEach(e => window.removeEventListener(e, resetActivity));
      clearInterval(interval);
    };
  }, [active, resetActivity]);

  return (
    <AnimatePresence>
      {idle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Coffee className="w-5 h-5 text-amber-500" />
              </div>
              <button
                onClick={() => { setIdle(false); onDismiss(); }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <h3 className="text-base font-semibold text-gray-800 mb-1">
              You&apos;ve been idle for 15 minutes
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Looks like you stepped away. Would you like to log a break?
            </p>
            <div className="flex gap-3">
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                icon={<Coffee className="w-4 h-4" />}
                onClick={() => { setIdle(false); onStartBreak(); }}
              >
                Start Break
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => { resetActivity(); onDismiss(); }}
              >
                I&apos;m here
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
