import { officeInfo } from './content/siteContent';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-500">
        Municipal Social Welfare and Development Office · Municipality of Caba, La Union
      </p>

      <div className="mt-8 space-y-8 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-gray-900">Our commitment</h2>
          <p className="mt-2">
            The MSWD Caba Profiling &amp; Assistance System processes personal information in
            accordance with the Data Privacy Act of 2012 (Republic Act No. 10173), its
            Implementing Rules and Regulations, and issuances of the National Privacy Commission.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">What we collect</h2>
          <p className="mt-2">
            We collect personal information needed to deliver social welfare services: your name,
            birthdate, address and barangay, contact details, household composition, program
            enrollment, and records of assistance you request or receive. Citizen accounts also
            store a username and email address.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">How we use it</h2>
          <p className="mt-2">
            Your information is used solely for beneficiary profiling, eligibility assessment,
            assistance processing, identity verification, and reporting required of the office.
            It is not sold or shared with third parties outside of lawful government functions.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">How we protect it</h2>
          <p className="mt-2">
            Access is limited to authorized MSWD personnel through role-based accounts. Every
            access to and change of records is written to an audit trail. Data is stored on
            systems managed by the local government unit.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">Your rights</h2>
          <p className="mt-2">
            You have the right to be informed, to access and correct your personal data, and to
            object to or request erasure of processing not required by law. To exercise these
            rights, visit the office at {officeInfo.address} or write to {officeInfo.email}.
          </p>
        </section>
      </div>
    </div>
  );
}
