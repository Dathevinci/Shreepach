import Link from "next/link";
import { Compass, Code2, MessageCircle, Radio, Heart, ExternalLink, ShieldCheck, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative mt-20 bg-[#09090b] border-t border-white/10 overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-1 space-y-6">
            <Link href="/" className="flex items-center gap-3 group inline-flex font-fell font-bold text-2xl tracking-[0.2em] uppercase drop-shadow-md">
              <img src="/logo.png" alt="Da Vinci Logo" className="w-10 h-10 rounded-full border border-indigo-400/50 shadow-[0_0_15px_rgba(99,102,241,0.4)] object-cover group-hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] transition-all duration-300" />
              <span className="text-white group-hover:text-indigo-400 transition-all duration-300">
                DA <span className="text-indigo-400 font-black group-hover:text-purple-400 transition-all duration-300">VINCI</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              The ultimate modern dashboard for anime tracking. Syncs seamlessly with AniList API to provide a gorgeous, legally compliant data visualization experience.
            </p>
            <div className="pt-4">
              <a 
                href="https://discord.gg/dSPPjPUQbM" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-[#5865F2]/10 border border-white/10 hover:border-[#5865F2]/30 text-slate-300 hover:text-white text-sm font-medium rounded-lg transition-all duration-300 group"
              >
                <svg className="w-4 h-4 fill-[#5865F2] opacity-80 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                </svg>
                Join our Community Discord
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 tracking-wide">Navigation</h4>
            <ul className="space-y-3 text-slate-400 font-medium">
              <li>
                <Link href="/" className="hover:text-indigo-400 hover:pl-2 transition-all duration-300 inline-flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-indigo-500 opacity-0 transition-opacity"></span>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-indigo-400 hover:pl-2 transition-all duration-300 inline-flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-indigo-500 opacity-0 transition-opacity"></span>
                  Explore
                </Link>
              </li>
              <li>
                <Link href="/calendar" className="hover:text-indigo-400 hover:pl-2 transition-all duration-300 inline-flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-indigo-500 opacity-0 transition-opacity"></span>
                  Airing Calendar
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-indigo-400 hover:pl-2 transition-all duration-300 inline-flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-indigo-500 opacity-0 transition-opacity"></span>
                  Community
                </Link>
              </li>
              <li>
                <Link href="/updates" className="hover:text-indigo-400 hover:pl-2 transition-all duration-300 inline-flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-indigo-500 opacity-0 transition-opacity"></span>
                  Dev Updates
                </Link>
              </li>
            </ul>
          </div>

          {/* Data Sources */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 tracking-wide">Data Sources</h4>
            <ul className="space-y-3 text-slate-400 font-medium">
              <li>
                <a href="https://anilist.co" target="_blank" rel="noopener noreferrer" className="group hover:text-purple-400 transition-all duration-300 inline-flex items-center gap-2">
                  AniList GraphQL API
                  <ExternalLink className="w-3 h-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                </a>
              </li>
              <li>
                <a href="https://github.com/AniList/ApiV2-GraphQL-Docs" target="_blank" rel="noopener noreferrer" className="group hover:text-purple-400 transition-all duration-300 inline-flex items-center gap-2">
                  Developer Docs
                  <ExternalLink className="w-3 h-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                </a>
              </li>
            </ul>
          </div>

          {/* Legal / Contact */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 tracking-wide">Legal & Support</h4>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400 leading-relaxed">
                  Da Vinci is strictly an educational tracker interface. We do not host, scrape, or stream any copyrighted material.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                <Link href="/privacy" className="text-sm font-medium text-slate-300 hover:text-indigo-400 transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-sm font-medium text-slate-300 hover:text-indigo-400 transition-colors">
                  Terms of Service
                </Link>
                <Link href="/faq" className="text-sm font-medium text-slate-300 hover:text-indigo-400 transition-colors">
                  Frequently Asked Questions
                </Link>
                <Link href="/dmca" className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors">
                  DMCA / Copyright
                </Link>
              </div>

              <div className="h-px w-full bg-white/10 my-2"></div>
              <a href="mailto:Luc1lfeer@yandex.com" className="flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition">
                <Mail className="w-4 h-4" />
                Contact: Luc1lfeer@yandex.com
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
            Crafted with <Heart className="w-4 h-4 text-red-500 animate-pulse" /> by <span className="text-white font-bold tracking-wide">Dejavuh</span>
          </p>
          <p className="text-xs text-slate-600 font-medium">
            &copy; {new Date().getFullYear()} Da Vinci Tracker. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
