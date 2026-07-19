import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button, FormField, Input, Textarea, Select } from '../../shared/components/ui';
import {
  CONTENT_STATUS,
  CONTENT_TYPES,
  useSaveContentItem,
} from '../../shared/hooks/useContent';

const schema = z
  .object({
    title: z.string().trim().min(1, 'This is required.').max(200, 'Keep this under 200 characters.'),
    body: z.string().trim().min(1, 'This is required.').max(4000, 'Keep this under 4000 characters.'),
    status: z.coerce.number(),
    publishAt: z.string().optional(),
    expiresAt: z.string().optional(),
    sortOrder: z.coerce.number().int().min(0).max(999),
  })
  .refine(
    (v) => !v.publishAt || !v.expiresAt || new Date(v.expiresAt) > new Date(v.publishAt),
    { path: ['expiresAt'], message: 'The expiry date must be after the publish date.' },
  );

/** `datetime-local` needs `YYYY-MM-DDTHH:mm` in local time, not an ISO string. */
function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ContentItemForm({ item, type, onDone }) {
  const isFaq = type === CONTENT_TYPES.faq;
  const save = useSaveContentItem();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: item.title ?? '',
      body: item.body ?? '',
      status: item.status ?? CONTENT_STATUS.draft,
      publishAt: toLocalInput(item.publishAt),
      expiresAt: toLocalInput(item.expiresAt),
      sortOrder: item.sortOrder ?? 0,
    },
  });

  const status = Number(watch('status'));

  const onSubmit = async (values) => {
    try {
      await save.mutateAsync({
        id: item.id,
        type,
        status: Number(values.status),
        title: values.title,
        body: values.body,
        // An empty datetime-local field means "unset", which the API expects as null.
        publishAt: values.publishAt ? new Date(values.publishAt).toISOString() : null,
        expiresAt: values.expiresAt ? new Date(values.expiresAt).toISOString() : null,
        sortOrder: Number(values.sortOrder),
      });
      toast.success(
        Number(values.status) === CONTENT_STATUS.published
          ? 'Published to the public website.'
          : 'Saved as a draft.',
      );
      onDone();
    } catch (err) {
      const data = err.response?.data;
      toast.error(data?.errors?.[0] ?? data?.message ?? 'Could not save this item.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField
        label={isFaq ? 'Question' : 'Title'}
        htmlFor="title"
        error={errors.title?.message}
        required
      >
        <Input
          id="title"
          placeholder={isFaq ? 'e.g. How do I register as a beneficiary?' : 'Short, specific headline'}
          error={errors.title?.message}
          {...register('title')}
        />
      </FormField>

      <FormField
        label={isFaq ? 'Answer' : 'Body'}
        htmlFor="body"
        error={errors.body?.message}
        required
      >
        <Textarea
          id="body"
          rows={6}
          placeholder={
            isFaq
              ? 'Answer in plain language. Avoid abbreviations residents may not know.'
              : 'Full text as it should appear on the website.'
          }
          error={errors.body?.message}
          {...register('body')}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Status" htmlFor="status" error={errors.status?.message}>
          <Select id="status" {...register('status')}>
            <option value={CONTENT_STATUS.draft}>Draft — not visible to the public</option>
            <option value={CONTENT_STATUS.published}>Published — visible on the website</option>
          </Select>
        </FormField>

        {isFaq ? (
          <FormField
            label="Display order"
            htmlFor="sortOrder"
            error={errors.sortOrder?.message}
            hint="Lower numbers appear first."
          >
            <Input id="sortOrder" type="number" min={0} max={999} {...register('sortOrder')} />
          </FormField>
        ) : (
          <FormField
            label="Publish date"
            htmlFor="publishAt"
            error={errors.publishAt?.message}
            hint="Leave blank to publish immediately."
          >
            <Input id="publishAt" type="datetime-local" {...register('publishAt')} />
          </FormField>
        )}
      </div>

      <FormField
        label="Expires on"
        htmlFor="expiresAt"
        error={errors.expiresAt?.message}
        hint="Optional. After this date the item leaves the landing page but stays readable in the public archive."
      >
        <Input id="expiresAt" type="datetime-local" {...register('expiresAt')} />
      </FormField>

      {status === CONTENT_STATUS.published && (
        <p role="status" className="rounded-lg bg-gold-50 border border-gold-200 px-3 py-2 text-xs text-gold-900">
          This will be publicly visible on the MSWD Caba website as soon as you save.
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting || save.isPending}>
          {item.id ? 'Save changes' : 'Create'}
        </Button>
      </div>
    </form>
  );
}
