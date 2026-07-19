import { officeInfo } from './content/siteContent';

export default function AccessibilityPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <h1 className="text-3xl font-bold text-gray-900">Accessibility Statement</h1>
      <p className="mt-2 text-sm text-gray-500">
        Municipal Social Welfare and Development Office · Municipality of Caba, La Union
      </p>

      <div className="mt-8 space-y-8 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-gray-900">Our commitment</h2>
          <p className="mt-2">
            Social welfare services must be reachable by everyone who needs them, including
            senior citizens and persons with disability. This office is committed to keeping the
            MSWD Caba Profiling &amp; Assistance System usable by the widest possible public, in
            the spirit of the Magna Carta for Persons with Disability (Republic Act No. 7277) and
            the accessibility policies of the national government.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">Standard we aim for</h2>
          <p className="mt-2">
            We target conformance with the Web Content Accessibility Guidelines (WCAG) 2.1 at
            Level AA. This is an ongoing commitment rather than a finished state — we correct
            issues as they are found and reported.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">What we have built in</h2>
          <ul className="mt-2 space-y-2 list-disc pl-5">
            <li>
              Text and background colours are checked against WCAG AA contrast ratios in both the
              light and dark themes.
            </li>
            <li>
              A text-size control in the header enlarges the interface without breaking the
              layout, for readers who need larger type.
            </li>
            <li>
              Every page can be operated by keyboard alone, with a visible focus indicator and a
              &ldquo;Skip to main content&rdquo; link at the top of each page.
            </li>
            <li>
              Images and icons that carry meaning have text alternatives; decorative marks are
              hidden from screen readers.
            </li>
            <li>
              Forms use real labels, required-field indicators, and error messages announced to
              assistive technology rather than signalled by colour alone.
            </li>
            <li>
              Motion and animation are reduced to instant transitions when your device requests
              it through the operating system&apos;s <em>reduce motion</em> setting.
            </li>
            <li>The layout reflows for phones and tablets without requiring horizontal scrolling.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">Known limitations</h2>
          <p className="mt-2">
            The embedded map on the landing page is provided by OpenStreetMap and cannot be fully
            navigated by keyboard. The same office address, hours, and contact details are always
            available as plain text beside the map, and over the counter at the office.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">Assisted service</h2>
          <p className="mt-2">
            No one is required to use this website to receive assistance. If any part of the
            system is difficult for you to use, MSWD staff will complete the transaction on your
            behalf at the office. Assisted transactions are recorded so the service you receive is
            the same either way.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">Give us feedback</h2>
          <p className="mt-2">
            If you encounter a barrier on this site, please tell us so we can fix it. Visit the
            office at {officeInfo.address}, or write to {officeInfo.email}. Describe the page and
            what you were trying to do, and we will respond during office hours
            ({officeInfo.hours}).
          </p>
        </section>
      </div>
    </div>
  );
}
