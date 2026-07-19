import { useEffect } from 'react';
import usePreferences from './usePreferences';

/**
 * Warns before a browser tab with unsaved edits is closed or reloaded.
 *
 * Governed by the "Warn me about unsaved changes" setting. Browsers deliberately
 * ignore any custom message here and show their own wording, so none is supplied.
 *
 * Note this covers leaving the *page* — closing the tab, reloading, following an
 * external link. In-app navigation between routes is not intercepted.
 */
export default function useUnsavedChangesWarning(hasUnsavedChanges) {
  const { confirmBeforeLeaving } = usePreferences();

  useEffect(() => {
    if (!hasUnsavedChanges || !confirmBeforeLeaving) return undefined;

    const onBeforeUnload = (e) => {
      e.preventDefault();
      // Required by older browsers to trigger the prompt at all.
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [hasUnsavedChanges, confirmBeforeLeaving]);
}
