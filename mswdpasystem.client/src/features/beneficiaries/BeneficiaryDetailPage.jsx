import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, Edit, QrCode, FileText, Upload, Trash2, ShieldCheck, PenLine } from 'lucide-react';
import { useAuth } from '../../shared/context/AuthContext';
import api from '../../shared/utils/api';
import StatusBadge from '../../shared/components/StatusBadge';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import Modal from '../../shared/components/Modal';
import ConfirmDialog from '../../shared/components/ConfirmDialog';
import SignaturePad from '../../shared/components/SignaturePad';

const SEX_LABELS = ['Male', 'Female'];
const CIVIL_LABELS = ['Single', 'Married', 'Widowed', 'Separated', 'Divorced'];

const editSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  middleName: z.string().optional().or(z.literal('')),
  lastName: z.string().min(1, 'Required'),
  suffix: z.string().optional().or(z.literal('')),
  dateOfBirth: z.string().min(1, 'Required'),
  sex: z.enum(['0', '1']),
  civilStatus: z.enum(['0', '1', '2', '3', '4']),
  barangay: z.string().min(1, 'Required'),
  address: z.string().min(1, 'Required'),
  contactNumber: z.string().optional().or(z.literal('')),
  emailAddress: z.string().email('Invalid email').optional().or(z.literal('')),
  occupation: z.string().optional().or(z.literal('')),
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

export default function BeneficiaryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const canEdit = user?.role === 'MSWDStaff' || user?.role === 'Admin';
  const canChangeStatus = user?.role === 'Admin' || user?.role === 'HeadCoordinator';
  const fileInputRef = useRef(null);
  const sigPadRef = useRef(null);

  const [capturingSig, setCapturingSig] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [deleteDocTarget, setDeleteDocTarget] = useState(null);
  const [uploadDocOpen, setUploadDocOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({ file: null, documentType: '', description: '' });

  const { data: b, isLoading } = useQuery({
    queryKey: ['beneficiary', id],
    queryFn: () => api.get(`/beneficiaries/${id}`).then(r => r.data),
    enabled: !!id,
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['welfare-programs'],
    queryFn: () => api.get('/admin/welfare-programs', { params: { activeOnly: true } }).then(r => r.data),
    enabled: editOpen,
  });

  const { data: qrData } = useQuery({
    queryKey: ['qr', id],
    queryFn: () => api.get(`/beneficiaries/${id}/qr-code`).then(r => r.data.qrCode),
    enabled: showQr && !!id,
    staleTime: Infinity,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(editSchema),
  });

  const statusMutation = useMutation({
    mutationFn: (data) => api.patch(`/beneficiaries/${id}/status`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['beneficiary', id] });
      toast.success('Status updated.');
      setStatusOpen(false);
      setStatusNotes('');
    },
    onError: err => toast.error(err.response?.data?.message ?? 'Status update failed.'),
  });

  const editMutation = useMutation({
    mutationFn: (data) => api.put(`/beneficiaries/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['beneficiary', id] });
      toast.success('Beneficiary updated.');
      setEditOpen(false);
    },
    onError: err => toast.error(err.response?.data?.message ?? 'Update failed.'),
  });

  const deleteDocMutation = useMutation({
    mutationFn: (docId) => api.delete(`/beneficiaries/${id}/documents/${docId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['beneficiary', id] });
      toast.success('Document deleted.');
      setDeleteDocTarget(null);
    },
    onError: err => toast.error(err.response?.data?.message ?? 'Delete failed.'),
  });

  const uploadDocMutation = useMutation({
    mutationFn: (formData) => api.post(`/beneficiaries/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['beneficiary', id] });
      toast.success('Document uploaded.');
      setUploadDocOpen(false);
      setUploadForm({ file: null, documentType: '', description: '' });
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    onError: err => toast.error(err.response?.data?.message ?? 'Upload failed.'),
  });

  const signatureMutation = useMutation({
    mutationFn: (dataUrl) => api.post(`/beneficiaries/${id}/signature`, { signatureDataUrl: dataUrl }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['beneficiary', id] });
      toast.success('Signature saved.');
      setCapturingSig(false);
    },
    onError: err => toast.error(err.response?.data?.message ?? 'Failed to save signature.'),
  });

  const handleSaveSignature = () => {
    if (sigPadRef.current?.isEmpty()) {
      toast.error('Please provide a signature first.');
      return;
    }
    signatureMutation.mutate(sigPadRef.current.toDataURL());
  };

  const openEditModal = () => {
    if (!b) return;
    const sexIndex = SEX_LABELS.indexOf(b.sex === 'Female' || b.sex === 1 ? 'Female' : 'Male');
    const civilIndex = CIVIL_LABELS.findIndex(c => c.toLowerCase() === String(b.civilStatus).toLowerCase());
    reset({
      firstName: b.firstName,
      middleName: b.middleName ?? '',
      lastName: b.lastName,
      suffix: b.suffix ?? '',
      dateOfBirth: b.dateOfBirth,
      sex: String(Math.max(0, sexIndex)),
      civilStatus: String(Math.max(0, civilIndex)),
      barangay: b.barangay,
      address: b.address,
      contactNumber: b.contactNumber ?? '',
      emailAddress: b.emailAddress ?? '',
      occupation: b.occupation ?? '',
      monthlyIncome: b.monthlyIncome != null ? String(b.monthlyIncome) : '',
      welfareProgramIds: b.programs?.filter(p => p.isActive).map(p => p.programId) ?? [],
    });
    setEditOpen(true);
  };

  const onEditSubmit = (data) => {
    editMutation.mutate({
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

  const handleUploadDoc = () => {
    if (!uploadForm.file) return;
    const fd = new FormData();
    fd.append('file', uploadForm.file);
    if (uploadForm.documentType) fd.append('documentType', uploadForm.documentType);
    if (uploadForm.description) fd.append('description', uploadForm.description);
    uploadDocMutation.mutate(fd);
  };

  if (isLoading) return <LoadingSpinner className="py-24" size="lg" />;
  if (!b) return <p className="text-gray-500 p-8">Beneficiary not found.</p>;

  const sexLabel = typeof b.sex === 'number' ? SEX_LABELS[b.sex] : b.sex;
  const civilLabel = typeof b.civilStatus === 'number' ? CIVIL_LABELS[b.civilStatus] : b.civilStatus;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <button onClick={() => navigate('/beneficiaries')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
        <ArrowLeft size={16} /> Back to Beneficiaries
      </button>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-700">
              {b.firstName?.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">{b.fullName}</h2>
                <StatusBadge status={b.status} />
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                Client No.: <span className="font-mono font-semibold text-blue-700">{b.clientNumber}</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Registered {new Date(b.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowQr(v => !v)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <QrCode size={16} /> {showQr ? 'Hide QR' : 'QR Code'}
            </button>
            {canChangeStatus && (
              <button onClick={() => { setNewStatus(b.status); setStatusOpen(true); }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <ShieldCheck size={16} /> Status
              </button>
            )}
            {canEdit && (
              <button onClick={openEditModal}
                className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors">
                <Edit size={16} /> Edit
              </button>
            )}
          </div>
        </div>

        {showQr && (
          <div className="mt-5 flex flex-col items-center gap-2 py-4 border-t border-gray-100">
            {qrData ? <img src={qrData} alt="QR Code" className="w-40 h-40" /> : <LoadingSpinner size="md" />}
            <p className="text-xs text-gray-400">Scan to verify beneficiary identity</p>
          </div>
        )}
      </div>

      {/* Info Grid */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Personal Information</h4>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm">
          {[
            ['Date of Birth', `${b.dateOfBirth} (${b.ageYears} yrs)`],
            ['Sex', sexLabel],
            ['Civil Status', civilLabel],
            ['Barangay', b.barangay],
            ['Address', b.address],
            ['Contact No.', b.contactNumber ?? '—'],
            ['Email', b.emailAddress ?? '—'],
            ['Occupation', b.occupation ?? '—'],
            ['Monthly Income', b.monthlyIncome != null ? `₱${Number(b.monthlyIncome).toLocaleString()}` : '—'],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-gray-400 font-medium">{label}</dt>
              <dd className="mt-0.5 text-gray-800">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Programs */}
      {b.programs?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Enrolled Programs</h4>
          <div className="flex flex-wrap gap-2">
            {b.programs.map(p => (
              <span key={p.programId}
                className={`px-3 py-1 rounded-full text-sm font-medium ${p.isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                {p.programName}{!p.isActive && ' (Inactive)'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent Assistance */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Recent Assistance</h4>
          <button onClick={() => navigate(`/assistance?beneficiaryId=${id}`)}
            className="text-xs text-blue-600 hover:underline">View All</button>
        </div>
        {b.recentAssistance?.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {b.recentAssistance.map(r => (
              <div key={r.id} onClick={() => navigate(`/assistance/${r.id}`)}
                className="py-3 flex items-center justify-between text-sm cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors">
                <div>
                  <span className="font-mono text-xs text-gray-500 mr-2">{r.requestNumber}</span>
                  <span className="text-gray-800">{r.assistanceType}</span>
                </div>
                <div className="flex items-center gap-3">
                  {r.amount && <span className="text-gray-600">₱{Number(r.amount).toLocaleString()}</span>}
                  <StatusBadge status={r.status} type="assistance" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No assistance requests on record.</p>
        )}
      </div>

      {/* Documents */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Documents</h4>
          {canEdit && (
            <button onClick={() => setUploadDocOpen(true)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
              <Upload size={14} /> Upload
            </button>
          )}
        </div>
        {b.documents?.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {b.documents.map(d => (
              <div key={d.id} className="py-3 flex items-center gap-3 text-sm">
                <FileText size={16} className="text-gray-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-gray-800">{d.fileName}</p>
                  <p className="text-xs text-gray-400">{d.documentType} · {new Date(d.uploadedAt).toLocaleDateString('en-PH')}</p>
                </div>
                {canEdit && (
                  <button onClick={() => setDeleteDocTarget(d)} className="text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No documents uploaded.</p>
        )}
      </div>

      {/* Signature (for ID issuance) */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
            <PenLine size={15} className="text-gray-400" /> Signature
          </h4>
          {canEdit && !capturingSig && (
            <button onClick={() => setCapturingSig(true)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
              <PenLine size={14} /> {b.signatureUrl ? 'Re-capture' : 'Capture Signature'}
            </button>
          )}
        </div>

        {capturingSig ? (
          <div>
            <SignaturePad ref={sigPadRef} />
            <div className="flex gap-3 justify-end pt-3">
              <button type="button" onClick={() => setCapturingSig(false)}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSaveSignature} disabled={signatureMutation.isPending}
                className="px-5 py-2 text-sm text-white bg-blue-700 rounded-lg hover:bg-blue-800 disabled:opacity-60">
                {signatureMutation.isPending ? 'Saving…' : 'Save Signature'}
              </button>
            </div>
          </div>
        ) : b.signatureUrl ? (
          <div className="flex flex-col items-start gap-1">
            <img src={b.signatureUrl} alt="Beneficiary signature"
              className="max-h-32 border border-gray-200 rounded-lg bg-white p-2" />
            <p className="text-xs text-gray-400">On file for ID issuance.</p>
          </div>
        ) : (
          <p className="text-sm text-gray-400">No signature captured yet.</p>
        )}
      </div>

      {/* Edit Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Beneficiary" size="xl">
        <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              <input {...register('suffix')} className={inputCls} />
            </Field>
            <Field label="Date of Birth" error={errors.dateOfBirth?.message} required>
              <input {...register('dateOfBirth')} type="date" className={inputCls} />
            </Field>
            <Field label="Sex" error={errors.sex?.message} required>
              <select {...register('sex')} className={inputCls}>
                <option value="0">Male</option>
                <option value="1">Female</option>
              </select>
            </Field>
            <Field label="Civil Status" error={errors.civilStatus?.message} required>
              <select {...register('civilStatus')} className={inputCls}>
                {CIVIL_LABELS.map((s, i) => <option key={s} value={i}>{s}</option>)}
              </select>
            </Field>
            <Field label="Barangay" error={errors.barangay?.message} required>
              <input {...register('barangay')} className={inputCls} />
            </Field>
            <Field label="Contact No." error={errors.contactNumber?.message}>
              <input {...register('contactNumber')} className={inputCls} />
            </Field>
          </div>
          <Field label="Complete Address" error={errors.address?.message} required>
            <input {...register('address')} className={inputCls} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Email" error={errors.emailAddress?.message}>
              <input {...register('emailAddress')} type="email" className={inputCls} />
            </Field>
            <Field label="Occupation" error={errors.occupation?.message}>
              <input {...register('occupation')} className={inputCls} />
            </Field>
            <Field label="Monthly Income (₱)" error={errors.monthlyIncome?.message}>
              <input {...register('monthlyIncome')} type="number" min="0" step="0.01" className={inputCls} />
            </Field>
          </div>
          {programs.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Welfare Programs</p>
              <div className="grid grid-cols-2 gap-2">
                {programs.map(p => (
                  <label key={p.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" value={p.id} {...register('welfareProgramIds')}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                    {p.name}
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <button type="button" onClick={() => setEditOpen(false)}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={editMutation.isPending}
              className="px-5 py-2 text-sm text-white bg-blue-700 rounded-lg hover:bg-blue-800 disabled:opacity-60">
              {editMutation.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Upload Document Modal */}
      <Modal isOpen={uploadDocOpen} onClose={() => { setUploadDocOpen(false); setUploadForm({ file: null, documentType: '', description: '' }); }} title="Upload Document" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File <span className="text-red-500">*</span></label>
            <input
              type="file"
              ref={fileInputRef}
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
              onChange={e => setUploadForm(f => ({ ...f, file: e.target.files?.[0] ?? null }))}
              className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="mt-1 text-xs text-gray-400">PDF, Word, JPEG, PNG — max 10 MB</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
            <select value={uploadForm.documentType}
              onChange={e => setUploadForm(f => ({ ...f, documentType: e.target.value }))}
              className={inputCls}>
              <option value="">General</option>
              <option value="Valid ID">Valid ID</option>
              <option value="Birth Certificate">Birth Certificate</option>
              <option value="Medical Certificate">Medical Certificate</option>
              <option value="Income Certificate">Income Certificate</option>
              <option value="Barangay Certificate">Barangay Certificate</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input type="text" value={uploadForm.description}
              onChange={e => setUploadForm(f => ({ ...f, description: e.target.value }))}
              className={inputCls} placeholder="Optional note…" />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => { setUploadDocOpen(false); setUploadForm({ file: null, documentType: '', description: '' }); }}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleUploadDoc} disabled={!uploadForm.file || uploadDocMutation.isPending}
              className="px-4 py-2 text-sm text-white bg-blue-700 rounded-lg hover:bg-blue-800 disabled:opacity-60">
              {uploadDocMutation.isPending ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Change Status Modal */}
      <Modal isOpen={statusOpen} onClose={() => setStatusOpen(false)} title="Change Beneficiary Status" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
            <select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value)}
              className={inputCls}
            >
              <option value="Active">Active</option>
              <option value="Verified">Verified</option>
              <option value="Flagged">Flagged</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              value={statusNotes}
              onChange={e => setStatusNotes(e.target.value)}
              rows={3}
              placeholder="Reason for status change…"
              className={`${inputCls} resize-none`}
            />
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <button type="button" onClick={() => setStatusOpen(false)}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button
              onClick={() => statusMutation.mutate({ status: newStatus, notes: statusNotes || null })}
              disabled={statusMutation.isPending || newStatus === b?.status}
              className="px-5 py-2 text-sm text-white bg-blue-700 rounded-lg hover:bg-blue-800 disabled:opacity-60"
            >
              {statusMutation.isPending ? 'Saving…' : 'Update Status'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Document Confirm */}
      <ConfirmDialog
        isOpen={!!deleteDocTarget}
        onClose={() => setDeleteDocTarget(null)}
        onConfirm={() => deleteDocMutation.mutate(deleteDocTarget.id)}
        title="Delete Document"
        message={`Are you sure you want to delete "${deleteDocTarget?.fileName}"? This cannot be undone.`}
        danger
        loading={deleteDocMutation.isPending}
      />
    </div>
  );
}
