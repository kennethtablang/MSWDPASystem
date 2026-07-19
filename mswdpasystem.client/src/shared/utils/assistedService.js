/**
 * Shape and helpers for the inline assisted-service capture block.
 *
 * Kept out of the component file so both can be imported without dragging a
 * component into modules that only need the data helpers.
 */
export const EMPTY_ASSISTED = {
  isAssisted: false,
  reason: 'Elderly',
  reasonNotes: '',
  beneficiaryPresent: true,
  representativeName: '',
  representativeRelation: '',
  representativeBeneficiaryId: null,
  representativeIdType: 'Barangay ID',
  representativeIdNumber: '',
  acknowledged: false,
};

/** True when the block is filled in well enough to submit alongside the task. */
export function isAssistedComplete(value) {
  if (!value.isAssisted) return true;
  if (!value.acknowledged) return false;
  if (!value.beneficiaryPresent && !value.representativeName.trim()) return false;
  return true;
}

/** Shapes the block into the POST body for /assisted-service. */
export function toAssistedPayload(
  value,
  { beneficiaryId, serviceType, relatedEntityType, relatedEntityId, notes },
) {
  return {
    beneficiaryId,
    serviceType,
    reason: value.reason,
    reasonNotes: value.reasonNotes || null,
    beneficiaryPresent: value.beneficiaryPresent,
    representativeName: value.beneficiaryPresent ? null : value.representativeName,
    representativeRelation: value.beneficiaryPresent ? null : value.representativeRelation,
    representativeBeneficiaryId: value.beneficiaryPresent ? null : value.representativeBeneficiaryId,
    representativeIdType: value.beneficiaryPresent ? null : value.representativeIdType,
    representativeIdNumber: value.beneficiaryPresent ? null : value.representativeIdNumber,
    acknowledged: value.acknowledged,
    relatedEntityType: relatedEntityType ?? null,
    relatedEntityId: relatedEntityId ?? null,
    notes: notes || null,
  };
}
