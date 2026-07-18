import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import api from '../../shared/utils/api';

const schema = z.object({
  firstName: z.string().min(1, 'Required').max(100),
  middleName: z.string().max(100).optional().or(z.literal('')),
  lastName: z.string().min(1, 'Required').max(100),
  suffix: z.string().max(10).optional().or(z.literal('')),
  dateOfBirth: z.string().min(1, 'Required'),
  sex: z.enum(['0', '1'], { required_error: 'Required' }),
  civilStatus: z.enum(['0', '1', '2', '3', '4'], { required_error: 'Required' }),
  barangay: z.string().min(1, 'Required').max(100),
  address: z.string().min(1, 'Required').max(500),
  contactNumber: z.string().max(20).optional().or(z.literal('')),
  emailAddress: z.string().email('Invalid email').optional().or(z.literal('')),
  occupation: z.string().max(100).optional().or(z.literal('')),
  monthlyIncome: z.string().optional().or(z.literal('')),
  welfareProgramIds: z.array(z.string()).optional(),
});

const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
function Field({ label, error, children, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function RegisterBeneficiaryPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['welfare-programs'],
    queryFn: () => api.get('/admin/welfare-programs', { params: { activeOnly: true } }).then(r => r.data),
  });

  const mutation = useMutation({
    mutationFn: payload => api.post('/beneficiaries', payload),
    onSuccess: res => {
      toast.success(`Beneficiary registered! Client No.: ${res.data.clientNumber}${res.data.duplicateFlagged ? ' (Flagged for duplicate review)' : ''}`);
      navigate(`/beneficiaries/${res.data.id}`);
    },
    onError: err => toast.error(err.response?.data?.message ?? 'Registration failed.'),
  });

  const onSubmit = data => {
    mutation.mutate({
      firstName: data.firstName,
      middleName: data.middleName || null,
      lastName: data.lastName,
      suffix: data.suffix || null,
      dateOfBirth: data.dateOfBirth,
      sex: parseInt(data.sex),
      civilStatus: parseInt(data.civilStatus),
      barangay: data.barangay,
      address: data.address,
      contactNumber: data.contactNumber || null,
      emailAddress: data.emailAddress || null,
      occupation: data.occupation || null,
      monthlyIncome: data.monthlyIncome ? parseFloat(data.monthlyIncome) : null,
      welfareProgramIds: data.welfareProgramIds ?? [],
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate('/beneficiaries')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors">
        <ArrowLeft size={16} /> Back to Beneficiaries
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Register New Beneficiary</h3>
        <p className="text-sm text-gray-500 mb-6">Fill out all required fields to create a beneficiary profile.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <section>
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Personal Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="First Name" error={errors.firstName?.message} required>
                <input {...register('firstName')} className={inputCls} />
              </Field>
              <Field label="Middle Name" error={errors.middleName?.message}>
                <input {...register('middleName')} className={inputCls} />
              </Field>
              <Field label="Last Name" error={errors.lastName?.message} required>
                <input {...register('lastName')} className={inputCls} />
              </Field>
              <Field label="Suffix" error={errors.suffix?.message}>
                <input {...register('suffix')} className={inputCls} placeholder="Jr., Sr., III…" />
              </Field>
              <Field label="Date of Birth" error={errors.dateOfBirth?.message} required>
                <input {...register('dateOfBirth')} type="date" className={inputCls} max={new Date().toISOString().split('T')[0]} />
              </Field>
              <Field label="Sex" error={errors.sex?.message} required>
                <select {...register('sex')} className={inputCls}>
                  <option value="">Select…</option>
                  <option value="0">Male</option>
                  <option value="1">Female</option>
                </select>
              </Field>
              <Field label="Civil Status" error={errors.civilStatus?.message} required>
                <select {...register('civilStatus')} className={inputCls}>
                  <option value="">Select…</option>
                  <option value="0">Single</option>
                  <option value="1">Married</option>
                  <option value="2">Widowed</option>
                  <option value="3">Separated</option>
                  <option value="4">Divorced</option>
                </select>
              </Field>
            </div>
          </section>

          <section>
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Contact & Address</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Barangay" error={errors.barangay?.message} required>
                <input {...register('barangay')} className={inputCls} />
              </Field>
              <Field label="Contact Number" error={errors.contactNumber?.message}>
                <input {...register('contactNumber')} className={inputCls} placeholder="09XX-XXX-XXXX" />
              </Field>
              <Field label="Complete Address" error={errors.address?.message} required>
                <input {...register('address')} className={inputCls} />
              </Field>
              <Field label="Email Address" error={errors.emailAddress?.message}>
                <input {...register('emailAddress')} type="email" className={inputCls} />
              </Field>
            </div>
          </section>

          <section>
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Socio-Economic Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Occupation" error={errors.occupation?.message}>
                <input {...register('occupation')} className={inputCls} />
              </Field>
              <Field label="Monthly Income (₱)" error={errors.monthlyIncome?.message}>
                <input {...register('monthlyIncome')} type="number" min="0" step="0.01" className={inputCls} />
              </Field>
            </div>
          </section>

          {programs.length > 0 && (
            <section>
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Welfare Program Enrollment</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {programs.map(p => (
                  <label key={p.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      value={p.id}
                      {...register('welfareProgramIds')}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {p.name}
                  </label>
                ))}
              </div>
            </section>
          )}

          <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <button type="button" onClick={() => navigate('/beneficiaries')}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={mutation.isPending}
              className="px-5 py-2 text-sm text-white bg-blue-700 rounded-lg hover:bg-blue-800 disabled:opacity-60">
              {mutation.isPending ? 'Registering…' : 'Register Beneficiary'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
