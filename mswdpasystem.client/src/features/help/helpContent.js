/**
 * Help content for the in-app guide. Walkthroughs are tagged with the roles they
 * apply to so each user only sees tasks they can actually perform.
 */

const STAFF = ['Admin', 'MSWDStaff', 'HeadCoordinator'];

export const GUIDES = [
  {
    id: 'register-beneficiary',
    title: 'Register a new beneficiary',
    roles: ['Admin', 'MSWDStaff'],
    steps: [
      'Open Beneficiaries from the sidebar and choose Register Beneficiary.',
      'Complete the personal and address details. Fields marked with * are required.',
      'Select the welfare programs the client is enrolled in (Social Pension, 4Ps, PWD, Solo Parent, and so on).',
      'Review the summary and submit. A client number and QR code are generated automatically.',
      'If the system detects an existing record with the same name and birth date, the profile is tagged Flagged for Duplicate Review and a supervisor resolves it.',
    ],
  },
  {
    id: 'capture-signature',
    title: 'Capture a signature for ID issuance',
    roles: ['Admin', 'MSWDStaff'],
    steps: [
      'Open the beneficiary profile.',
      'In the Signature panel choose Capture Signature.',
      'Have the client sign in the box using a mouse, stylus or touchscreen.',
      'Choose Save Signature. It is stored securely and only staff can view it.',
    ],
  },
  {
    id: 'upload-documents',
    title: 'Upload supporting documents',
    roles: ['Admin', 'MSWDStaff'],
    steps: [
      'Open the beneficiary profile and find the Documents panel.',
      'Choose Upload, pick the file and select a document type.',
      'Accepted file types and the maximum size are configured by the administrator under System Parameters.',
      'Use the download icon beside a document to retrieve it later.',
    ],
  },
  {
    id: 'verify-qr',
    title: 'Verify a beneficiary by QR code',
    roles: ['Admin', 'MSWDStaff'],
    steps: [
      'Open QR Verification from the sidebar.',
      'Scan the QR code on the beneficiary ID, or type the client number shown beneath it.',
      'The profile, current status and full assistance history appear immediately.',
      'Every verification is logged with the time, the staff member and the beneficiary.',
    ],
  },
  {
    id: 'assistance-request',
    title: 'Encode an assistance request',
    roles: ['Admin', 'MSWDStaff'],
    steps: [
      'Open Assistance Requests and choose New Request.',
      'Search for the beneficiary, then select the assistance type and welfare program.',
      'Enter the amount and the purpose of the request, then submit.',
      'The request starts at Submitted and moves through Under Review, Approved and Released.',
    ],
  },
  {
    id: 'approve-assistance',
    title: 'Approve or deny a request',
    roles: ['Admin', 'HeadCoordinator'],
    steps: [
      'Open Assistance Requests and select the request to review.',
      'Check the beneficiary history and supporting documents.',
      'Choose Approve or Deny. A denial requires a reason.',
      'Every status change records the date and the responsible staff member, and notifies the encoder.',
    ],
  },
  {
    id: 'resolve-duplicates',
    title: 'Resolve a flagged duplicate',
    roles: ['Admin', 'HeadCoordinator'],
    steps: [
      'Open Duplicate Flags to see records the system matched against an existing profile.',
      'Compare the two records side by side.',
      'Confirm the match if they are the same person, or reject it if they are genuinely different individuals.',
      'Rejecting the flag returns the record to Active.',
    ],
  },
  {
    id: 'reports',
    title: 'Generate and export reports',
    roles: ['Admin', 'HeadCoordinator'],
    steps: [
      'Open Reports & Analytics.',
      'Choose a period (daily, monthly or annual) and optionally filter by barangay or welfare program.',
      'Review the summary figures and charts on screen.',
      'Export to PDF for printing and filing, or to Excel for further analysis.',
    ],
  },
  {
    id: 'staff-permissions',
    title: 'Configure staff data access',
    roles: ['Admin', 'HeadCoordinator'],
    steps: [
      'Open Staff Permissions from the sidebar.',
      'Each MSWD Staff member is listed with the modules they may access.',
      'Toggle a module off to remove access; the change takes effect immediately, even for staff already signed in.',
      'Use Reset to default to restore full access for that staff member.',
    ],
  },
  {
    id: 'system-parameters',
    title: 'Adjust system parameters',
    roles: ['Admin'],
    steps: [
      'Open System Parameters from the sidebar.',
      'Office Identity controls the details printed on reports.',
      'Operational Limits controls the barangay list, upload limits, duplicate sensitivity, session timeout and assistance ceiling.',
      'Save changes to apply them across the system straight away.',
    ],
  },
  {
    id: 'citizen-portal',
    title: 'Use the citizen portal',
    roles: ['Citizen'],
    steps: [
      'My Dashboard shows your linked profile and recent activity.',
      'My Requests lists every assistance request filed under your name and its current status.',
      'My Profile shows the details MSWD holds about you.',
      'If your account is not yet linked to a beneficiary record, visit the MSWD office to have it linked.',
    ],
  },
  {
    id: 'account-security',
    title: 'Keep your account secure',
    roles: [...STAFF, 'Citizen'],
    steps: [
      'Change your password regularly from Settings > Password.',
      'Never share your account. Every action is recorded in the audit trail under your name.',
      'After five failed sign-in attempts an account is locked for 15 minutes.',
      'You are signed out automatically after a period of inactivity.',
    ],
  },
];

export const FAQS = [
  {
    q: 'I forgot my password. What do I do?',
    a: 'Choose "Forgot password" on the sign-in page and follow the emailed link. If no email arrives, contact your system administrator.',
  },
  {
    q: 'Why is a beneficiary tagged "Flagged for Duplicate Review"?',
    a: 'The system found an existing record with matching identifying details. A supervisor must confirm or reject the match before the record returns to Active.',
  },
  {
    q: 'Why can I not see a module in the sidebar?',
    a: 'Access is role-based, and MSWD Staff access can be further restricted per person. Ask your Head Coordinator or administrator if you need a module enabled.',
  },
  {
    q: 'Can I delete a beneficiary record?',
    a: 'No. Records are deactivated rather than deleted so that the assistance history and audit trail stay intact.',
  },
  {
    q: 'Who can see uploaded documents?',
    a: 'Only signed-in staff with access to the beneficiaries module. Documents are never publicly reachable, and every download is recorded in the audit trail.',
  },
  {
    q: 'The system logged me out while I was working.',
    a: 'Sessions end after a period of inactivity for security. The timeout is configurable by the administrator under System Parameters.',
  },
];

export const ABOUT = {
  version: '1.0.0',
  systemName: 'Web-Based Profiling and Assistance System',
  office: 'Municipal Social Welfare and Development Office (MSWD)',
  location: 'Caba, La Union',
  researcher: 'Justine Grace P. Pajarillo',
  institution: 'Universidad de Dagupan — School of Professional Studies',
  program: 'Master in Information Technology',
  methodology: 'Agile — Feature-Driven Development (FDD)',
  qualityFramework: 'ISO/IEC 25010:2011',
  legalAnchors: [
    { code: 'RA 11032', name: 'Ease of Doing Business and Efficient Government Service Delivery Act of 2018' },
    { code: 'RA 10173', name: 'Data Privacy Act of 2012' },
    { code: 'RA 9994', name: 'Expanded Senior Citizens Act' },
    { code: 'RA 7277', name: 'Magna Carta for Disabled Persons' },
    { code: 'RA 8972', name: "Solo Parents' Welfare Act" },
  ],
};
