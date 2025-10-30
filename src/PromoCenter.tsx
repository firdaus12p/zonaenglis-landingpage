import { useState, useEffect } from "react";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Phone,
  MessageCircle,
  Clock,
} from "lucide-react";

// Import komponen universal dan konstanta
import { Badge, Button, FloatingButton, BADGE_VARIANTS } from "./components";
import { WHATSAPP_LINKS, CTA_REGISTER } from "./constants/cta";

// Konstanta CTA untuk backward compatibility
const CTA_WHATSAPP = WHATSAPP_LINKS.PROMO_CENTER;

// Active Batch Display Component (replaces old hardcoded countdown)
const ActiveBatchDisplay = () => {
  const [activeBatch, setActiveBatch] = useState<{
    id: number;
    name: string;
    start_date: string;
    start_time: string;
    end_date?: string;
    end_time?: string;
    timezone: string;
    description: string;
    instructor?: string;
    location_mode?: "Online" | "Offline" | "Hybrid";
    location_address?: string;
    price?: number;
    registration_deadline?: string;
    target_students: number;
    current_students: number;
    status: string;
    visibility: string;
  } | null>(null);

  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  // Fetch active countdown batch
  useEffect(() => {
    const fetchActiveBatch = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/api/countdown/active"
        );
        const data = await response.json();

        if (data.success && data.data) {
          setActiveBatch(data.data);
        }
      } catch (error) {
        console.error("Error fetching active batch:", error);
      }
    };

    fetchActiveBatch();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (!activeBatch) return;

    const calculateTimeRemaining = () => {
      // Extract date part from ISO timestamp
      const dateOnly = activeBatch.start_date.split("T")[0];

      // Map timezone to UTC offset
      const timezoneOffsets: { [key: string]: string } = {
        WIB: "+07:00",
        WITA: "+08:00",
        WIT: "+09:00",
      };

      const offset = timezoneOffsets[activeBatch.timezone] || "+08:00";
      const targetDate = new Date(
        `${dateOnly}T${activeBatch.start_time}${offset}`
      );
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          expired: true,
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds, expired: false });
    };

    // Calculate immediately
    calculateTimeRemaining();

    // Update every second
    const timer = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(timer);
  }, [activeBatch]);

  if (!activeBatch) return null;

  return (
    <div className="mt-4 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 p-5 shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
        <h3 className="text-lg font-bold text-emerald-900">
          🎓 Batch Aktif Sedang Dibuka!
        </h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Left: Batch Info */}
        <div>
          <h4 className="text-xl font-extrabold text-slate-900 mb-2">
            {activeBatch.name}
          </h4>
          {activeBatch.description && (
            <p className="text-slate-600 mb-3 text-sm">
              {activeBatch.description}
            </p>
          )}

          <div className="space-y-2 text-sm">
            {activeBatch.instructor && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">
                  👨‍🏫 Instruktur:
                </span>
                <span className="text-slate-600">{activeBatch.instructor}</span>
              </div>
            )}
            {activeBatch.location_mode && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">📍 Mode:</span>
                <span className="text-slate-600">
                  {activeBatch.location_mode}
                </span>
                {activeBatch.location_address && (
                  <span className="text-slate-500 text-xs">
                    (
                    {activeBatch.location_address.length > 30
                      ? activeBatch.location_address.substring(0, 30) + "..."
                      : activeBatch.location_address}
                    )
                  </span>
                )}
              </div>
            )}
            {activeBatch.price !== undefined && activeBatch.price > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">
                  💰 Investasi:
                </span>
                <span className="text-emerald-700 font-bold">
                  Rp {activeBatch.price.toLocaleString("id-ID")}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">
                👥 Kapasitas:
              </span>
              <span className="text-slate-600">
                {activeBatch.current_students} / {activeBatch.target_students}{" "}
                siswa
              </span>
              <div className="flex-1 bg-slate-200 rounded-full h-2 ml-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      (activeBatch.current_students /
                        activeBatch.target_students) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Countdown Timer */}
        <div className="flex flex-col justify-center">
          <div className="text-center mb-3">
            <p className="text-sm font-semibold text-slate-600 mb-1">
              ⏰ Pendaftaran Ditutup Dalam:
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200">
              <div className="text-2xl md:text-3xl font-bold text-emerald-600">
                {countdown.days}
              </div>
              <div className="text-xs text-slate-500 uppercase">Hari</div>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200">
              <div className="text-2xl md:text-3xl font-bold text-emerald-600">
                {countdown.hours}
              </div>
              <div className="text-xs text-slate-500 uppercase">Jam</div>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200">
              <div className="text-2xl md:text-3xl font-bold text-emerald-600">
                {countdown.minutes}
              </div>
              <div className="text-xs text-slate-500 uppercase">Menit</div>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200">
              <div className="text-2xl md:text-3xl font-bold text-emerald-600">
                {countdown.seconds}
              </div>
              <div className="text-xs text-slate-500 uppercase">Detik</div>
            </div>
          </div>

          <a
            href={`https://wa.me/6282188080688?text=Halo%2C%20saya%20ingin%20daftar%20batch%20${encodeURIComponent(
              activeBatch.name
            )}`}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl"
          >
            <MessageCircle className="h-5 w-5" />
            Daftar Sekarang via WhatsApp
          </a>

          {activeBatch.registration_deadline && (
            <p className="text-xs text-center text-slate-500 mt-2">
              Batas registrasi:{" "}
              {new Date(activeBatch.registration_deadline).toLocaleDateString(
                "id-ID",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Program Card Component
const ProgramCard = ({
  title,
  badges,
  batches,
  focus,
  ctaText = "Klaim Sekarang",
  adminText = "Tanya Admin",
}: {
  title: string;
  badges: Array<{ text: string; variant: keyof typeof BADGE_VARIANTS }>;
  batches: Array<{ name: string; date: string; quota: number }>;
  focus: string;
  ctaText?: string;
  adminText?: string;
}) => (
  <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-transform hover:scale-[1.02]">
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {badges.map((badge, index) => (
          <Badge key={index} variant={badge.variant}>
            {badge.text}
          </Badge>
        ))}
      </div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <ul className="mt-2 space-y-2 text-sm text-slate-700">
        {batches.map((batch, index) => (
          <li key={index} className="flex items-start gap-2">
            <Clock className="mt-0.5 h-4 w-4 text-blue-700 flex-shrink-0" />
            <span>
              <strong>{batch.name}:</strong> {batch.date} •{" "}
              <strong>Kuota:</strong> {batch.quota}
            </span>
          </li>
        ))}
        <li className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 text-blue-700 flex-shrink-0" />
          <span>
            <strong>Fokus:</strong> {focus}
          </span>
        </li>
      </ul>
    </div>
    <div className="mt-4 flex items-center justify-between gap-3">
      <Button
        href={CTA_REGISTER}
        variant="primary"
        size="sm"
        className="flex-1"
      >
        {ctaText}
      </Button>
      <Button
        href={CTA_WHATSAPP}
        variant="ghost"
        size="sm"
        className="whitespace-nowrap"
      >
        {adminText}
      </Button>
    </div>
  </div>
);

// Map Component
const MapSection = () => {
  const [activeMap, setActiveMap] = useState("pettarani");

  const mapData = [
    {
      key: "pettarani",
      label: "Pettarani",
      embedUrl:
        "https://maps.google.com/maps?q=Zona%20English%20Makassar%20Pettarani&output=embed",
    },
    {
      key: "kolaka",
      label: "Kolaka",
      embedUrl:
        "https://maps.google.com/maps?q=Zona%20English%20Kolaka&output=embed",
    },
    {
      key: "kendari",
      label: "Kendari",
      embedUrl:
        "https://maps.google.com/maps?q=Zona%20English%20Kendari&output=embed",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 pb-10">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold">Lokasi Cabang</h2>
        <div className="flex gap-2 overflow-x-auto">
          {mapData.map((map) => (
            <Button
              key={map.key}
              onClick={() => setActiveMap(map.key)}
              variant={
                activeMap === map.key ? "secondary" : "outline-secondary"
              }
              size="sm"
              className="whitespace-nowrap"
            >
              {map.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
        {mapData.map((map) => (
          <iframe
            key={map.key}
            className={`w-full h-[420px] ${
              activeMap === map.key ? "block" : "hidden"
            }`}
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={map.embedUrl}
            title={`Map of Zona English ${map.label}`}
          />
        ))}
      </div>
    </section>
  );
};

// Gallery Section
const GallerySection = () => {
  const galleryData: Array<{
    title: string;
    badge: { text: string; variant: keyof typeof BADGE_VARIANTS };
    media: Array<
      | { type: "image"; src: string; alt: string }
      | { type: "video"; src: string }
      | { type: "youtube"; src: string; title?: string }
    >;
  }> = [
    {
      title: "Kids (4–12 th)",
      badge: { text: "Fun Phonics • Vocabulary", variant: "kids" },
      media: [
        {
          type: "image",
          src: "https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=1200&auto=format&fit=crop",
          alt: "Kids Class 1",
        },
        {
          type: "image",
          src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop",
          alt: "Kids Class 2",
        },
        {
          type: "video",
          src: "https://cdn.coverr.co/videos/coverr-a-boy-doing-homework-5561/1080p.mp4",
        },
      ],
    },
    {
      title: "Teens (14–17 th)",
      badge: { text: "Speaking • Confidence", variant: "teens" },
      media: [
        {
          type: "image",
          src: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1200&auto=format&fit=crop",
          alt: "Teens 1",
        },
        {
          type: "image",
          src: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1200&auto=format&fit=crop",
          alt: "Teens 2",
        },
        {
          type: "youtube",
          src: "https://www.youtube.com/embed/wnHW6o8WMas",
          title: "Speaking practice video",
        },
      ],
    },
    {
      title: "Intensive (Mon–Fri, 3–5 jam/hari)",
      badge: { text: "Sprint + Project", variant: "sprint" },
      media: [
        {
          type: "image",
          src: "https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=1200&auto=format&fit=crop",
          alt: "Intensive 1",
        },
        {
          type: "image",
          src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200&auto=format&fit=crop",
          alt: "Intensive 2",
        },
        {
          type: "video",
          src: "https://cdn.coverr.co/videos/coverr-students-in-a-classroom-8708/1080p.mp4",
        },
      ],
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <h2 className="text-2xl font-bold mb-2">Galeri Kegiatan</h2>
      <p className="text-slate-600 mb-6">
        Cuplikan foto & video kegiatan sesuai program.
      </p>

      {galleryData.map((program, index) => (
        <div key={index} className="mb-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
            <h3 className="text-lg font-bold">{program.title}</h3>
            <Badge variant={program.badge.variant}>{program.badge.text}</Badge>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {program.media.map((item, mediaIndex) => {
              if (item.type === "image") {
                return (
                  <img
                    key={mediaIndex}
                    className="rounded-xl border border-slate-200 w-full h-48 object-cover"
                    src={item.src}
                    alt={item.alt}
                  />
                );
              } else if (item.type === "video") {
                return (
                  <video
                    key={mediaIndex}
                    className="rounded-xl border border-slate-200 w-full h-48 object-cover"
                    controls
                    preload="metadata"
                    src={item.src}
                  />
                );
              } else if (item.type === "youtube") {
                return (
                  <iframe
                    key={mediaIndex}
                    className="rounded-xl border border-slate-200 w-full aspect-video"
                    loading="lazy"
                    src={item.src}
                    title={
                      "title" in item ? item.title : `Video ${mediaIndex + 1}`
                    }
                    allowFullScreen
                  />
                );
              }
              return null;
            })}
          </div>
        </div>
      ))}
    </section>
  );
};

export default function PromoCenter() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white text-slate-900">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-white to-white" />
        <div className="mx-auto max-w-6xl px-4 pt-10 pb-6 md:pt-16 md:pb-10">
          <div className="rounded-3xl border border-blue-100 bg-white/70 p-6 shadow-md backdrop-blur-sm">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  🎉 Grand Opening • Makassar Pettarani
                </div>
                <h1 className="text-3xl font-extrabold leading-tight text-slate-900 md:text-4xl">
                  Zona English —{" "}
                  <span className="text-blue-700">Promo Center</span>
                </h1>
                <p className="mt-2 max-w-2xl text-slate-600">
                  Semua program promo & <em>Undangan Belajar Gratis</em> ada di
                  sini. Pilih sesuai usia & kebutuhan, klaim sekarang sebelum
                  kuota habis.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button href={CTA_REGISTER} variant="primary" size="md">
                  Daftar Sekarang <ArrowRight className="h-4 w-4" />
                </Button>
                <Button href={CTA_WHATSAPP} variant="whatsapp" size="md">
                  <MessageCircle className="h-4 w-4" /> Chat Admin
                </Button>
              </div>
            </div>

            {/* Premium Ribbon */}
            <div className="mt-5 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent">
                Undangan Belajar Gratis — Kelas Premium
              </div>
              <p className="mt-1 text-sm text-slate-700">
                Dapatkan <strong>semua fasilitas kelas premium</strong> • Kelas
                kecil <strong>8–12 siswa</strong> •{" "}
                <strong>Kuota 100 peserta</strong> per batch. Kamu akan bilang:{" "}
                <em>
                  "Belajar Inggris itu mudah, seru, dan nggak bikin stres!"
                </em>
              </p>
            </div>

            {/* Active Batch Display with Dynamic Countdown */}
            <ActiveBatchDisplay />
          </div>
        </div>
      </section>

      {/* PREMIUM SECTION */}
      <section className="mx-auto max-w-6xl px-4 pb-6">
        <div className="rounded-3xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 p-6 shadow-sm">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            Kelas Premium Gratis
          </div>
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent">
            Rasakan Pengalaman Kelas Premium, Tanpa Biaya
          </h2>
          <p className="mt-2 text-slate-700 max-w-3xl">
            Biasanya berbayar jutaan rupiah — sekarang <strong>gratis</strong>{" "}
            untuk peserta terpilih. Kami menjawab kendala yang sering kamu
            alami: bingung grammar, tidak percaya diri, cepat lupa kosakata.
            Dengan metode <strong>NBSN</strong> + <strong>AI Coach</strong>,
            belajar jadi menyenangkan dan progres terasa.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Fasilitas Premium",
                items: [
                  "Ruang belajar nyaman & interaktif",
                  "Modul & video modern",
                  "Project showcase + sertifikat",
                ],
              },
              {
                title: "Kelas Kecil",
                items: [
                  "Hanya 8–12 siswa/kelas agar guru fokus membimbing satu per satu",
                  "Kuota batch: 100 peserta",
                ],
              },
              {
                title: "Hasil yang Terasa",
                items: [
                  "Grammar jadi masuk akal",
                  "Berani ngomong & lebih lancar",
                  "Belajar terasa fun, nggak stres",
                ],
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="rounded-xl border border-amber-200 bg-white p-4"
              >
                <div className="text-sm font-semibold mb-2">
                  {feature.title}
                </div>
                <ul className="space-y-1 text-sm text-slate-700">
                  {feature.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button href={CTA_REGISTER} variant="primary" size="md">
              Ambil Slot Premium <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href={CTA_WHATSAPP} variant="outline-primary" size="md">
              Tanya Admin
            </Button>
          </div>
        </div>
      </section>

      {/* PROMO GRID */}
      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Paket Promo Aktif</h2>
          <p className="mt-1 text-slate-600">
            Khusus cabang Makassar Pettarani + kelas online nasional.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ProgramCard
            title="1 Bulan Kelas Reguler — Remaja (14–17 th)"
            badges={[
              { text: "Undangan Belajar Gratis", variant: "free" },
              { text: "Makassar (Offline)", variant: "location" },
            ]}
            batches={[
              { name: "Batch A", date: "03–28 Nov 2025", quota: 30 },
              { name: "Batch B", date: "01–26 Des 2025", quota: 30 },
              { name: "Batch C", date: "05–30 Jan 2026", quota: 30 },
            ]}
            focus="Speaking, Confidence, Daily English"
          />

          <ProgramCard
            title="2 Minggu Kelas Reguler — Anak (4–12 th)"
            badges={[
              { text: "Undangan Belajar Gratis", variant: "free" },
              { text: "Makassar (Offline)", variant: "location" },
            ]}
            batches={[
              { name: "Batch A", date: "03–15 Nov 2025", quota: 36 },
              { name: "Batch B", date: "17–29 Nov 2025", quota: 36 },
              { name: "Batch C", date: "01–13 Des 2025", quota: 36 },
            ]}
            focus="Fun Phonics, Vocabulary, Listening"
          />

          <ProgramCard
            title="1 Minggu Intensive (Senin–Jumat) — 3–5 jam/hari"
            badges={[
              { text: "Kelas Intensive", variant: "intensive" },
              { text: "Makassar (Offline)", variant: "location" },
            ]}
            batches={[
              { name: "Sprint 1", date: "10–14 Nov 2025", quota: 24 },
              { name: "Sprint 2", date: "24–28 Nov 2025", quota: 24 },
              { name: "Sprint 3", date: "08–12 Des 2025", quota: 24 },
            ]}
            focus="Speaking Sprint + Project"
            ctaText="Ambil Kursi"
          />
        </div>
      </section>

      {/* HOW TO REGISTER */}
      <section id="daftar" className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold">Cara Klaim & Daftar</h2>
          <p className="mt-2 text-slate-600">Mudah dalam 3 langkah.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              step: "Langkah 1",
              title: "Pilih Promo",
              description:
                "Klik tombol Klaim pada paket yang kamu inginkan sesuai usia & kebutuhan.",
            },
            {
              step: "Langkah 2",
              title: "Chat Admin",
              description:
                "Konfirmasi jadwal, kelas, dan ketersediaan kuota via WhatsApp. Dapatkan e-ticket/konfirmasi.",
            },
            {
              step: "Langkah 3",
              title: "Mulai Belajar",
              description:
                "Ikuti arahan guru, dapatkan progress report & reward poin di aplikasi.",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
                {item.step}
              </div>
              <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
              <p className="text-sm text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MAPS */}
      <MapSection />

      {/* GALLERY */}
      <GallerySection />

      {/* TERMS & FOOTER */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Syarat & Ketentuan
            </div>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>
                • Promo berlaku selama masa Grand Opening cabang Makassar
                Pettarani & kuota masih tersedia.
              </li>
              <li>
                • Satu peserta dapat mengambil maksimal 1 promo utama + 1
                project NBSN.
              </li>
              <li>• Jadwal ditentukan oleh admin sesuai ketersediaan kelas.</li>
              <li>
                • Kehadiran minimal 80% untuk sertifikat/reward pada beberapa
                promo.
              </li>
              <li>
                • Voucher Rp100.000 berlaku untuk potongan kelas/merchandise
                tertentu.
              </li>
            </ul>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Kontak & Cabang
            </div>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Admin WA:{" "}
                <a
                  className="text-blue-700 hover:underline"
                  href={CTA_WHATSAPP}
                >
                  +62 821-8808-0688
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Cabang: Makassar Pettarani • Kolaka • Kendari
              </li>
              <li>
                Instagram: <strong>@zonaenglish.id</strong>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-4 pb-24 text-sm text-slate-500">
        © Zona English. All rights reserved.
      </footer>

      {/* FLOATING WA BUTTON */}
      <FloatingButton href={CTA_WHATSAPP}>
        <MessageCircle className="h-5 w-5" /> Tanya Admin
      </FloatingButton>
    </main>
  );
}
