import { Toaster as SonnerToaster } from 'sonner';
import { CheckCircle2, AlertTriangle, XCircle, Info, Loader2 } from 'lucide-react';

/**
 * System-wide toast surface.
 *
 * sonner's `richColors` ships its own green/red/amber palette, which sat beside
 * the Caba brand scales rather than inside them. The colours here are the same
 * tokens the rest of the interface uses: primary (flag blue), accent (flag red),
 * gold (flag yellow) and emerald for success.
 */
export default function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      expand={false}
      duration={4000}
      gap={10}
      offset={16}
      visibleToasts={4}
      toastOptions={{
        // `unstyled` hands full control to these classes; without it sonner's own
        // background and border would still win on some variants.
        unstyled: true,
        classNames: {
          toast:
            'group w-full flex items-start gap-3 rounded-xl border bg-white dark:bg-gray-100 p-3.5 pr-4 shadow-card ' +
            'font-sans text-sm data-[type=success]:border-emerald-200 data-[type=error]:border-accent-200 ' +
            'data-[type=warning]:border-gold-300 data-[type=info]:border-primary-200 border-gray-200',
          title: 'font-semibold text-gray-900 leading-snug',
          description: 'text-gray-500 text-[13px] leading-snug mt-0.5',
          actionButton:
            'shrink-0 rounded-lg bg-primary-700 px-2.5 py-1 text-xs font-medium text-white ' +
            'transition-colors hover:bg-primary-800',
          cancelButton:
            'shrink-0 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 ' +
            'transition-colors hover:bg-gray-50',
          closeButton:
            'rounded-md border border-gray-200 bg-white dark:bg-gray-100 text-gray-400 transition-colors hover:text-gray-600',
          icon: 'shrink-0 mt-0.5',
        },
      }}
      icons={{
        success: <CheckCircle2 size={18} className="text-emerald-600" />,
        error: <XCircle size={18} className="text-accent-600" />,
        warning: <AlertTriangle size={18} className="text-gold-600" />,
        info: <Info size={18} className="text-primary-600" />,
        loading: <Loader2 size={18} className="animate-spin text-primary-600" />,
      }}
    />
  );
}
