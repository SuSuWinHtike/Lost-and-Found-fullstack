import React from 'react';
import { Link } from 'react-router-dom';
import { PawPrint, Heart, Phone, Mail, MapPin, Shield, HelpCircle, Bell } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t-4 border-amber-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800">
          
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg">
                <PawPrint className="w-5 h-5 fill-white" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">Pet<span className="text-amber-400">Love</span></span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed max-w-sm">
              A community-based lost and found pet platform connecting caring citizens, shelters, and pet owners across Myanmar. Every reported pet deserves to find their way back home.
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs text-amber-300/80">
              <span className="flex items-center gap-1.5 bg-stone-800/80 px-3 py-1.5 rounded-lg border border-stone-700">
                <Shield className="w-4 h-4 text-amber-400" />
                Verified Community Reports
              </span>
              <span className="flex items-center gap-1.5 bg-stone-800/80 px-3 py-1.5 rounded-lg border border-stone-700">
                <Heart className="w-4 h-4 text-rose-400" />
                100% Free Service
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide uppercase">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-amber-400 transition">Home</Link></li>
              <li><Link to="/user/pet-reports" className="hover:text-amber-400 transition">All Pet Reports</Link></li>
              <li><Link to="/user/create-report" className="hover:text-amber-400 transition">Report Lost Pet</Link></li>
              <li><Link to="/user/create-report" className="hover:text-amber-400 transition">Report Found Pet</Link></li>
            </ul>
          </div>

          {/* User Portals */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide uppercase">Dashboards</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/user/dashboard" className="hover:text-amber-400 transition">User Dashboard</Link></li>
              <li><Link to="/user/matches" className="hover:text-amber-400 transition">Possible Pet Matches</Link></li>
              <li><Link to="/user/my-reports" className="hover:text-amber-400 transition">My Pet Reports</Link></li>
              <li><Link to="/user/messages" className="hover:text-amber-400 transition">Messages & Chat</Link></li>
              <li><Link to="/admin/dashboard" className="hover:text-amber-400 transition flex items-center gap-1">Admin Portal <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">Staff</span></Link></li>
            </ul>
          </div>

          {/* Contact / Emergency */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide uppercase">Contact & Support</h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>+95 9 798 123 456</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>support@petlove.community</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Kamayut & Bahan, Yangon, Myanmar</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} Community-Based Lost and Found Pet Platform. Final Year University Project.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-stone-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-stone-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-stone-400 cursor-pointer">Community Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
