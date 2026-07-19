import {
  HeartHandshake, Users, Accessibility, Baby, HandCoins, LifeBuoy,
  FileText, QrCode, ClipboardList, Building2, Stethoscope, GraduationCap,
} from 'lucide-react';

/**
 * Static, config-driven content for the public site. Editable without touching
 * components — announcements, news, FAQs, and hotlines live here so office
 * staff (via a developer) can update the landing page from one file.
 */

export const mission =
  'To provide timely, compassionate, and transparent social welfare services that uplift the lives of disadvantaged individuals, families, and communities in the Municipality of Caba.';

export const vision =
  'A community where every Caba resident — especially the poor, vulnerable, and marginalized — lives with dignity, self-reliance, and equal access to opportunities for a better quality of life.';

export const programs = [
  {
    code: 'SOCPEN',
    name: 'Social Pension Program',
    description: 'Monthly social pension for indigent senior citizens under RA 9994.',
    icon: HeartHandshake,
  },
  {
    code: '4PS',
    name: 'Pantawid Pamilyang Pilipino Program',
    description: 'Conditional cash transfers that keep children healthy and in school.',
    icon: Users,
  },
  {
    code: 'PWD',
    name: 'Persons with Disability Program',
    description: 'Assistance, ID issuance, and benefits for persons with disability under RA 7277.',
    icon: Accessibility,
  },
  {
    code: 'SOLOPARENT',
    name: 'Solo Parent Welfare Program',
    description: 'Support services and ID processing for solo parents under RA 8972.',
    icon: Baby,
  },
  {
    code: 'INDIGENT',
    name: 'Indigent Family Assistance',
    description: 'Financial and in-kind assistance for families in crisis situations.',
    icon: HandCoins,
  },
  {
    code: 'CALAMITY',
    name: 'Calamity Assistance',
    description: 'Emergency relief for households affected by typhoons, floods, and other calamities.',
    icon: LifeBuoy,
  },
];

export const services = [
  {
    name: 'Register as a Beneficiary',
    description: 'Visit the MSWD office to be profiled and enrolled in programs you qualify for.',
    icon: ClipboardList,
  },
  {
    name: 'Request Assistance',
    description: 'Apply for financial, medical, burial, educational, livelihood, or relief assistance.',
    icon: FileText,
  },
  {
    name: 'QR Identity Verification',
    description: 'Each registered beneficiary receives a QR-coded record for fast, secure verification.',
    icon: QrCode,
  },
  {
    name: 'Medical Assistance Referrals',
    description: 'Get referrals and support for medicines, check-ups, and hospitalization costs.',
    icon: Stethoscope,
  },
  {
    name: 'Educational Assistance',
    description: 'Support for school fees and materials for students of qualified families.',
    icon: GraduationCap,
  },
  {
    name: 'Certificate of Indigency Support',
    description: 'Assessment and endorsement for indigency-related requirements.',
    icon: Building2,
  },
];

export const announcements = [
  {
    id: 1,
    date: '2026-07-14',
    title: 'Social Pension payout schedule for the 3rd quarter',
    body: 'Qualified senior citizens may claim their social pension at the Municipal Gymnasium. Bring your OSCA ID and QR beneficiary record. Schedules are released per barangay — check with your barangay hall.',
  },
  {
    id: 2,
    date: '2026-07-07',
    title: 'PWD ID renewal now accommodated every weekday',
    body: 'Renewal of PWD identification cards is now processed Monday to Friday, 8:00 AM–3:00 PM at the MSWD office, Caba Municipal Hall.',
  },
  {
    id: 3,
    date: '2026-06-30',
    title: 'Online citizen accounts now available',
    body: 'Residents may now create a citizen account on this website to view announcements and track their assistance requests online.',
  },
];

export const news = [
  {
    id: 1,
    date: '2026-07-10',
    title: 'MSWD Caba conducts family development sessions in coastal barangays',
    body: 'Family development sessions for 4Ps beneficiary families covered parenting, budgeting, and disaster preparedness topics.',
  },
  {
    id: 2,
    date: '2026-06-25',
    title: 'Relief operations completed after heavy monsoon rains',
    body: 'Food packs and non-food items were distributed to affected households in coordination with the MDRRMO and barangay officials.',
  },
  {
    id: 3,
    date: '2026-06-12',
    title: 'Solo parents attend livelihood skills training',
    body: 'Registered solo parents completed a skills training on food processing in partnership with the Public Employment Service Office.',
  },
];

export const faqs = [
  {
    id: 'register',
    question: 'How do I register as a beneficiary?',
    answer:
      'Visit the MSWD office at the Caba Municipal Hall during office hours. Bring a valid ID, and depending on the program, supporting documents such as a barangay certificate of residency or indigency. Our staff will profile your household and enroll you in programs you qualify for.',
  },
  {
    id: 'requirements',
    question: 'What are the usual requirements for assistance?',
    answer:
      'Most assistance requests need a valid government ID, a barangay certificate of indigency, and documents specific to the request — for example, a medical abstract and prescription for medical assistance, or a death certificate for burial assistance.',
  },
  {
    id: 'processing',
    question: 'How long does an assistance request take?',
    answer:
      'Simple requests are usually assessed within a few working days. Requests that need further verification or fund availability may take longer; you can follow up at the office or track your request online with a citizen account.',
  },
  {
    id: 'account',
    question: 'What can I do with a citizen account on this website?',
    answer:
      'A citizen account lets you view announcements, see your beneficiary record once it is linked by MSWD staff, and monitor the status of your assistance requests without visiting the office.',
  },
  {
    id: 'link',
    question: 'Why does my account say it is not yet linked to a beneficiary record?',
    answer:
      'For your protection, MSWD staff link citizen accounts to beneficiary records after verifying your identity at the office. Visit the MSWD office once with a valid ID to have your account linked.',
  },
  {
    id: 'privacy',
    question: 'How is my personal information protected?',
    answer:
      'The system complies with the Data Privacy Act of 2012 (RA 10173). Your information is used only for social welfare service delivery, is accessible only to authorized personnel, and every access is recorded in an audit trail.',
  },
];

export const testimonials = [
  {
    id: 1,
    name: 'Aling R.S.',
    barangay: 'Brgy. Poblacion Norte',
    quote:
      'Mabilis na ang proseso ngayon. Hindi na ako kailangang bumalik-balik para lang malaman kung aprubado na ang hiling kong tulong medikal.',
  },
  {
    id: 2,
    name: 'Mang E.D.',
    barangay: 'Brgy. Santiago Sur',
    quote:
      'Bilang senior citizen, malaking tulong ang social pension. Ang QR code sa aking record ang nagpapabilis ng beripikasyon tuwing payout.',
  },
  {
    id: 3,
    name: 'J.M.',
    barangay: 'Brgy. San Carlos',
    quote:
      'As a solo parent, hindi ko akalaing may ganitong suporta pala. Maraming salamat sa MSWD Caba sa pag-asikaso sa amin ng aking mga anak.',
  },
];

export const hotlines = [
  { name: 'National Emergency Hotline', number: '911' },
  { name: 'MSWD Caba Office', number: '(072) XXX-XXXX' },
  { name: 'MDRRMO Caba', number: '(072) XXX-XXXX' },
  { name: 'Philippine Red Cross', number: '143' },
];

export const officeInfo = {
  office: 'Municipal Social Welfare and Development Office',
  address: 'Caba Municipal Hall, Poblacion, Caba, La Union 2502',
  hours: 'Monday – Friday, 8:00 AM – 5:00 PM (no noon break)',
  email: 'mswd@caba-launion.gov.ph',
};

/**
 * Approximate centroid of Caba poblacion — close enough to frame the map, but
 * NOT surveyed. Replace with the municipal hall's exact coordinates before
 * launch so the marker lands on the building rather than near it.
 */
export const mapLocation = { lat: 16.4333, lng: 120.35, zoom: 16 };

export const downloadableForms = [
  {
    name: 'Assistance Request Form',
    description: 'General intake form for financial, medical, burial, and other assistance.',
    file: '/forms/assistance-request-form.pdf',
  },
  {
    name: 'Beneficiary Registration Form',
    description: 'Household profiling form for new beneficiary registration.',
    file: '/forms/beneficiary-registration-form.pdf',
  },
  {
    name: 'Solo Parent ID Application',
    description: 'Application form for the Solo Parent identification card.',
    file: '/forms/solo-parent-id-application.pdf',
  },
];

export const fallbackStats = {
  beneficiariesServed: 1200,
  assistanceReleased: 850,
  activePrograms: 6,
  barangaysCovered: 17,
};
