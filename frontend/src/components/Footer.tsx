/**
 * Footer — dark premium footer with disclaimer, links, branding.
 */
import { Scale, Shield, ExternalLink } from 'lucide-react'


export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="w-full mt-auto"
      style={{ background: 'linear-gradient(180deg, #060d1a 0%, #030810 100%)' }}
    >
      {/* Disclaimer Banner */}
      <div
        className="border-b w-full py-3 px-6"
        style={{ borderColor: 'rgba(201,154,46,0.15)', background: 'rgba(201,154,46,0.05)' }}
      >
        <p className="text-center text-xs max-w-4xl mx-auto" style={{ color: 'rgba(201,154,46,0.8)' }}>
          ⚠️ <strong>Not legal advice.</strong> Clarivo is an AI assistant for informational purposes only.
          Always consult a qualified lawyer before signing any legal document.
        </p>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #C99A2E, #dfae36)' }}
              >
                <Scale size={16} className="text-white" />
              </div>
              <span className="font-serif font-bold text-xl text-white">Clarivo</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              AI-powered legal document analysis. Understand your contracts before you sign — without the lawyer fees.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                <Shield size={12} />
                <span>SOC 2 Compliant</span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.15)' }}>•</span>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                <Shield size={12} />
                <span>Data Encrypted</span>
              </div>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Product</h4>
            <ul className="space-y-2.5">
              <li><a href="#how-it-works" className="footer-link">How it works</a></li>
              <li><a href="#features" className="footer-link">Features</a></li>
              <li><a href="#upload" className="footer-link">Analyze a document</a></li>
            </ul>
          </div>

          {/* Legal/Info links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Legal</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="footer-link">Privacy Policy</a></li>
              <li><a href="#" className="footer-link">Terms of Service</a></li>
              <li><a href="#" className="footer-link">Disclaimer</a></li>
              <li>
                <a
                  href="https://github.com"
                  className="footer-link flex items-center gap-1.5"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink size={13} />
                  Open Source
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            &copy; {year} Clarivo. Built with AI — for informed decision-making.
          </p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Powered by Google Gemini
          </p>
        </div>
      </div>
    </footer>
  )
}
