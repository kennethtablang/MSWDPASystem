import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { DURATION, EASE } from '../../motion/tokens';

export default function Accordion({ items, defaultOpenId = null, className = '' }) {
  const [openId, setOpenId] = useState(defaultOpenId);
  const reduced = useReducedMotion();

  return (
    <div className={`divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white dark:bg-gray-100 ${className}`}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`accordion-panel-${item.id}`}
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
            >
              {item.title}
              <ChevronDown
                size={18}
                aria-hidden="true"
                className={`shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="panel"
                  id={`accordion-panel-${item.id}`}
                  initial={reduced ? false : { height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: DURATION.base, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
