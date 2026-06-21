import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import Logo from "../ui/Logo";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 dark:bg-dark-950 dark:text-slate-400 border-t border-slate-800 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <Logo size="md" showTagline={false} />
            </Link>
            <p className="text-sm text-slate-400 max-w-xs">
              A premium, trustworthy, and exclusive matchmaking portal designed specifically for the Lohar community. Connecting hearts, honoring traditions.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-gold-400 transition-colors" aria-label="Facebook">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/></svg>
              </a>
              <a href="#" className="hover:text-gold-400 transition-colors" aria-label="Instagram">
                <svg className="h-5 w-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" className="hover:text-gold-400 transition-colors" aria-label="Twitter">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="hover:text-gold-400 transition-colors" aria-label="Youtube">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.5 12 3.5 12 3.5s-7.518 0-9.388.553a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.553 9.388.553 9.388.553s7.518 0 9.388-.553a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/search" className="hover:text-white transition-colors">Browse Profiles</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Register Free</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Member Dashboard</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Premium Plans</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Success Stories</Link></li>
            </ul>
          </div>

          {/* Policies & Help */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Support & Policy</h3>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Use</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookie settings</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ & Help</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Report Abuse</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Get In Touch</h3>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-maroon-500 flex-shrink-0" />
                <span>Shivaji Nagar, Pune, Maharashtra - 411005</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-maroon-500 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-maroon-500 flex-shrink-0" />
                <span>support@loharmatrimony.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Lohar Matrimony. All rights reserved.
          </p>
          <p className="text-[10px] font-devanagari tracking-wide text-slate-600">
            ॥ विश्वास • परंपरा • नवे आयुष्य ॥
          </p>
        </div>
      </div>
    </footer>
  );
};
