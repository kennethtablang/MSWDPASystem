import { toast } from 'sonner';

/**
 * The single entry point for transient messages.
 *
 * Call sites used `toast.*` directly with ad-hoc durations and wording, so an
 * error could vanish in the same 4s as a success. These wrappers fix the
 * durations by severity: failures stay long enough to be read and copied,
 * confirmations get out of the way.
 */
const DURATIONS = {
  success: 3500,
  info: 4000,
  warning: 6000,
  error: 8000,
};

export const notify = {
  success: (title, description) =>
    toast.success(title, { description, duration: DURATIONS.success }),

  info: (title, description) =>
    toast.info(title, { description, duration: DURATIONS.info }),

  warning: (title, description) =>
    toast.warning(title, { description, duration: DURATIONS.warning }),

  /**
   * Accepts either a message or an axios error, so call sites can pass the
   * rejection straight through without unwrapping it identically every time.
   */
  error: (titleOrError, description) => {
    if (titleOrError && typeof titleOrError === 'object') {
      const err = titleOrError;
      const serverMessage =
        err.response?.data?.message ??
        err.response?.data?.errors?.[0] ??
        err.message;
      return toast.error(description ?? 'Something went wrong', {
        description: serverMessage,
        duration: DURATIONS.error,
      });
    }
    return toast.error(titleOrError, { description, duration: DURATIONS.error });
  },

  /** Ties a toast to a promise: pending → resolved/rejected, in one call. */
  promise: (promise, { loading, success, error }) =>
    toast.promise(promise, {
      loading: loading ?? 'Working…',
      success: success ?? 'Done',
      error: (err) =>
        err?.response?.data?.message ?? (typeof error === 'string' ? error : 'Failed'),
    }),

  /**
   * An arriving system notification (assistance status change, duplicate flag,
   * new message). Carries an action that navigates to the related record.
   */
  notification: (title, message, onView) =>
    toast(title, {
      description: message,
      duration: 7000,
      action: onView ? { label: 'View', onClick: onView } : undefined,
    }),

  dismiss: toast.dismiss,
};

export default notify;
