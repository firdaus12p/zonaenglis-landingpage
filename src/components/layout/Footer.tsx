import { Phone, MapPin, Instagram } from "lucide-react";

const CTA_WHATSAPP = "https://wa.me/6282188080688";

export default function Footer() {
  return (
    <footer className="border-t-2 border-slate-200 bg-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid gap-8 md:grid-cols-3 mb-8">
          {/* Column 1: About */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ZE</span>
              </div>
              <h4 className="text-lg font-bold text-slate-900">Zona English</h4>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Belajar bahasa Inggris yang seru, efektif, dan terukur. Program
              untuk semua usia dengan metode NBSN dan AI Coach.
            </p>
          </div>

          {/* Column 2: Contact */}
          <div>
            <h4 className="text-lg font-bold text-slate-900 mb-3">Kontak</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span>
                  Admin:{" "}
                  <a
                    className="text-blue-700 hover:underline font-semibold"
                    href={CTA_WHATSAPP}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    +62 821-8808-0688
                  </a>
                </span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span>Kolaka • Makassar • Kendari</span>
              </li>
              <li className="flex items-center gap-2">
                <Instagram className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <a
                  href="https://instagram.com/zonaenglish.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:underline font-semibold"
                >
                  @zonaenglish.id
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Links */}
          <div>
            <h4 className="text-lg font-bold text-slate-900 mb-3">Program</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <a
                  href="/learn-more"
                  className="hover:text-blue-700 transition-colors"
                >
                  Bright Stars (3-6 tahun)
                </a>
              </li>
              <li>
                <a
                  href="/learn-more"
                  className="hover:text-blue-700 transition-colors"
                >
                  Smart Path (7-12 tahun)
                </a>
              </li>
              <li>
                <a
                  href="/learn-more"
                  className="hover:text-blue-700 transition-colors"
                >
                  The Quest (13-17 tahun)
                </a>
              </li>
              <li>
                <a
                  href="/learn-more"
                  className="hover:text-blue-700 transition-colors"
                >
                  The Elevate (18+ tahun)
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <p>
              © {new Date().getFullYear()} Zona English. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="/promo-center"
                className="hover:text-blue-700 transition-colors"
              >
                Promo Center
              </a>
              <a
                href="/promo-hub"
                className="hover:text-blue-700 transition-colors"
              >
                Promo Hub
              </a>
              <a
                href={CTA_WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-700 transition-colors"
              >
                Hubungi Kami
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
