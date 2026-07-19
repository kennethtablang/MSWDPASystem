/**
 * Form sections shared by the two account-related pages.
 *
 * "My Account" (identity and credentials) and "Settings" (how the application
 * behaves for you) are separate destinations, but both are backed by the same
 * /account endpoints, so the forms themselves live here.
 */
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import api from '../../shared/utils/api';
import Button from '../../shared/components/ui/Button';
import FormField, { Input } from '../../shared/components/ui/FormField';
import PasswordStrength from '../../shared/components/ui/PasswordStrength';
import notify from '../../shared/utils/notify';
import { applyFontScale, FONT_SCALES } from '../../shared/utils/appearance';

const profileSchema = z.object({
  fullName: z.string().min(1, 'Required'),
  email: z.string().email('Enter a valid email address'),
  contactNumber: z.string().optional().or(z.literal('')),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Needs an uppercase letter')
    .regex(/[a-z]/, 'Needs a lowercase letter')
    .regex(/[0-9]/, 'Needs a number')
    .regex(/[^A-Za-z0-9]/, 'Needs a symbol'),
  confirmPassword: z.string().min(1, 'Required'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export function ProfileTab({ account }) {
  const qc = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: account.fullName ?? '',
      email: account.email ?? '',
      contactNumber: account.contactNumber ?? '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => api.put('/account/profile', data),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ['my-account'] });
      reset(vars);
      notify.success('Profile updated.');
    },
    onError: (err) => notify.error(err.response?.data?.message ?? 'Could not update your profile.'),
  });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5 max-w-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Username" hint="Your username cannot be changed.">
          <Input value={account.userName} disabled />
        </FormField>
        <FormField label="Role" hint="Only an administrator can change your role.">
          <Input value={account.role} disabled />
        </FormField>
      </div>

      <FormField label="Full name" required error={errors.fullName?.message}>
        <Input {...register('fullName')} error={errors.fullName} />
      </FormField>

      <FormField label="Email address" required error={errors.email?.message}
        hint="Used for password recovery and system notices.">
        <Input type="email" {...register('email')} error={errors.email} />
      </FormField>

      <FormField label="Contact number" error={errors.contactNumber?.message}>
        <Input {...register('contactNumber')} placeholder="09XX-XXX-XXXX" error={errors.contactNumber} />
      </FormField>

      <div className="flex justify-end">
        <Button type="submit" loading={mutation.isPending} disabled={!isDirty}>
          Save changes
        </Button>
      </div>
    </form>
  );
}

export function PasswordTab() {
  const [show, setShow] = useState(false);
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
    resolver: zodResolver(passwordSchema),
  });
  const newPassword = useWatch({ control, name: 'newPassword' }) ?? '';

  const mutation = useMutation({
    mutationFn: (data) => api.put('/account/password', {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    }),
    onSuccess: () => {
      reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
      notify.success('Password changed.');
    },
    onError: (err) => {
      const data = err.response?.data;
      notify.error(data?.errors?.[0] ?? data?.message ?? 'Could not change your password.');
    },
  });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5 max-w-xl">
      <FormField label="Current password" required error={errors.currentPassword?.message}>
        <Input type="password" autoComplete="current-password"
          {...register('currentPassword')} error={errors.currentPassword} />
      </FormField>

      <FormField label="New password" required error={errors.newPassword?.message}>
        <div className="relative">
          <Input type={show ? 'text' : 'password'} autoComplete="new-password"
            className="pr-10" {...register('newPassword')} error={errors.newPassword} />
          <button type="button" onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Hide password' : 'Show password'}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600">
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <div className="mt-2"><PasswordStrength password={newPassword} /></div>
      </FormField>

      <FormField label="Confirm new password" required error={errors.confirmPassword?.message}>
        <Input type="password" autoComplete="new-password"
          {...register('confirmPassword')} error={errors.confirmPassword} />
      </FormField>

      <p className="text-xs text-gray-500">
        Changing your password signs you out on other devices.
      </p>

      <div className="flex justify-end">
        <Button type="submit" loading={mutation.isPending}>Change password</Button>
      </div>
    </form>
  );
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex items-start gap-3 py-3 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-700 focus:ring-primary-500" />
      <span>
        <span className="block text-sm font-medium text-gray-800">{label}</span>
        <span className="block text-xs text-gray-500">{description}</span>
      </span>
    </label>
  );
}

export function PreferencesTab({ account }) {
  const qc = useQueryClient();
  const [prefs, setPrefs] = useState(account.preferences);

  const mutation = useMutation({
    mutationFn: (data) => api.put('/account/preferences', data).then((r) => r.data),
    onSuccess: (saved) => {
      qc.invalidateQueries({ queryKey: ['my-account'] });
      applyFontScale(saved.fontScale);
      notify.success('Preferences saved.');
    },
    onError: (err) => notify.error(err.response?.data?.message ?? 'Could not save preferences.'),
  });

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-1">Notifications</h4>
        <div className="divide-y divide-gray-100">
          <Toggle
            checked={prefs.notifyOnAssistanceStatus}
            onChange={(v) => setPrefs((p) => ({ ...p, notifyOnAssistanceStatus: v }))}
            label="Assistance status updates"
            description="Notify me when an assistance request I am involved in changes status."
          />
          <Toggle
            checked={prefs.notifyOnNewMessage}
            onChange={(v) => setPrefs((p) => ({ ...p, notifyOnNewMessage: v }))}
            label="New messages"
            description="Notify me when I receive an internal message."
          />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Text size</h4>
        <p className="text-xs text-gray-500 mb-3">
          Increases the size of all text in the system. Saved to your account, so it follows you between devices.
        </p>
        <div className="flex gap-2">
          {FONT_SCALES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setPrefs((p) => ({ ...p, fontScale: s.value }))}
              aria-pressed={prefs.fontScale === s.value}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                prefs.fontScale === s.value
                  ? 'border-primary-600 bg-primary-50 text-primary-800 dark:text-primary-300'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className={s.previewClass}>A</span>
              <span className="ml-2">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => mutation.mutate(prefs)} loading={mutation.isPending}>
          Save preferences
        </Button>
      </div>
    </div>
  );
}
