import { motion, AnimatePresence } from 'motion/react';
import { Clock } from 'lucide-react';

/**
 * FR-1.9 companion: warns before an idle session is terminated so a social
 * worker mid-interview is not silently signed out with unsaved work on screen.
 */
export default function IdleWarningDialog({ open, secondsLeft, onStay, onSignOut }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/50 p-4 backdrop-blur-sm"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="idle-title"
          aria-describedby="idle-desc"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 4 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-100 p-6 text-center shadow-xl"
          >
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-100">
              <Clock size={26} className="text-gold-700" />
            </div>

            <h2 id="idle-title" className="text-lg font-bold text-gray-900">
              Still there?
            </h2>
            <p id="idle-desc" className="mt-1.5 text-sm text-gray-500">
              For the security of beneficiary records, you'll be signed out in
            </p>

            <p className="my-3 font-mono text-4xl font-bold tabular-nums text-gold-700" aria-live="polite">
              {secondsLeft ?? 0}s
            </p>

            <div className="flex gap-2">
              <button
                onClick={onSignOut}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Sign out now
              </button>
              <button
                onClick={onStay}
                autoFocus
                className="flex-1 rounded-lg bg-primary-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-800"
              >
                Stay signed in
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
