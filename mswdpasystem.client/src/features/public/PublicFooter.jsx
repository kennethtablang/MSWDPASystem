import { Link } from 'react-router-dom';
import { Globe, Mail, MapPin, Clock, Phone, ShieldCheck } from 'lucide-react';
import { LogoMark } from '../../shared/components/ui/Logo';
import { officeInfo, hotlines } from './content/siteContent';

export default function PublicFooter() {
  return (
    <footer id="contact" className="bg-primary-950 text-primary-100 dark:text-primary-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <LogoMark size={44} />
            <div className="leading-tight">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-primary-300">
                Republic of the Philippines
              </p>
              <p className="text-sm font-bold text-white">Municipality of Caba, La Union</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-primary-300 leading-relaxed">
            {officeInfo.office}. Serbisyong may malasakit — public service with integrity,
            transparency, and compassion.
          </p>
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Official Facebook page"
            className="inline-flex items-center gap-2 mt-4 px-3 py-2 rounded-lg bg-primary-900 text-primary-200 hover:bg-primary-800 hover:text-white transition-colors text-xs font-medium"
          >
            <Globe size={16} aria-hidden="true" />
            Official Facebook Page
          </a>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Visit Us</h3>
          <ul className="mt-4 space-y-3 text-sm text-primary-200">
            <li className="flex gap-2.5">
              <MapPin size={16} className="shrink-0 mt-0.5 text-gold-400" aria-hidden="true" />
              {officeInfo.address}
            </li>
            <li className="flex gap-2.5">
              <Clock size={16} className="shrink-0 mt-0.5 text-gold-400" aria-hidden="true" />
              {officeInfo.hours}
            </li>
            <li className="flex gap-2.5">
              <Mail size={16} className="shrink-0 mt-0.5 text-gold-400" aria-hidden="true" />
              {officeInfo.email}
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Emergency Hotlines</h3>
          <ul className="mt-4 space-y-3 text-sm text-primary-200">
            {hotlines.map((h) => (
              <li key={h.name} className="flex gap-2.5">
                <Phone size={16} className="shrink-0 mt-0.5 text-gold-400" aria-hidden="true" />
                <span>
                  {h.name}
                  <span className="block font-semibold text-white">{h.number}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Quick Links</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-primary-200">
            <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
            <li><Link to="/register" className="hover:text-white transition-colors">Create a Citizen Account</Link></li>
            <li><Link to="/announcements" className="hover:text-white transition-colors">All Announcements</Link></li>
            <li><Link to="/news" className="hover:text-white transition-colors">News &amp; Events</Link></li>
            <li><Link to="/faqs" className="hover:text-white transition-colors">FAQs</Link></li>
            <li><a href="/#downloads" className="hover:text-white transition-colors">Downloadable Forms</a></li>
            <li><a href="/#visit" className="hover:text-white transition-colors">Office Location &amp; Hours</a></li>
            <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/accessibility" className="hover:text-white transition-colors">Accessibility Statement</Link></li>
          </ul>
          <div className="mt-5 flex items-center gap-2 rounded-lg bg-primary-900 px-3 py-2.5">
            <ShieldCheck size={18} className="text-gold-400 shrink-0" aria-hidden="true" />
            <p className="text-xs text-primary-200 leading-snug">
              Transparency Seal — committed to full public disclosure of official transactions.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-primary-400">
          <p>
            © {new Date().getFullYear()} Municipal Social Welfare and Development Office, LGU Caba, La Union.
          </p>
          <p>Protected under the Data Privacy Act of 2012 (RA 10173).</p>
        </div>
      </div>
    </footer>
  );
}
