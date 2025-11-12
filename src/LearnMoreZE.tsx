import { useState, useEffect } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Star,
  MessageCircle,
  MapPin,
  Phone,
  ShieldCheck,
  Rocket,
  CalendarCheck,
  Gift,
  Users,
  Video,
  BookOpen,
} from "lucide-react";

// Import komponen universal dan konstanta
import { Badge, Button, FloatingButton, AutoplayYouTube } from "./components";
import {
  CTA_WHATSAPP,
  CTA_REGISTER,
  CTA_SCHEDULE,
  CTA_TRYFREE,
} from "./constants/cta";

// 💡 NOTES to Editor:
// - Replace all links with your real URLs (WhatsApp, registration form, maps, brochures, IG reels, etc.)
// - Tailwind is available. You can tweak colors to match ZE brand (light blue, dark blue, red, white).
// - This is a single-page component. Embed it in any React/Vite/Next app, or export as a static HTML via SSR.

const Stat = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center">
    <div className="text-3xl md:text-4xl font-extrabold text-blue-900">
      {value}
    </div>
    <div className="text-sm text-blue-900/70">{label}</div>
  </div>
);

const Feature = ({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) => (
  <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
    <div className="mb-3 flex items-center gap-3">
      <div className="rounded-xl bg-blue-600/10 p-2">
        <Icon className="h-5 w-5 text-blue-700" />
      </div>
      <h4 className="text-base font-semibold text-slate-900">{title}</h4>
    </div>
    <p className="text-sm leading-relaxed text-slate-600">{desc}</p>
  </div>
);

const ProgramCard = ({
  emoji,
  title,
  age,
  description1,
  description2,
  targetIcon,
  targetText,
}: {
  emoji: string;
  title: string;
  age: string;
  description1: string;
  description2: string;
  targetIcon: string;
  targetText: string;
}) => (
  <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
    <div className="mb-4 flex items-center gap-3">
      <span className="text-3xl">{emoji}</span>
      <div>
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-blue-700 font-semibold">{age}</p>
      </div>
    </div>
    <div className="mb-4 flex-grow space-y-3">
      <p className="text-sm leading-relaxed text-slate-700">{description1}</p>
      <p className="text-sm leading-relaxed text-slate-700">{description2}</p>
    </div>
    <div className="mt-4 rounded-xl bg-blue-50 p-4">
      <p className="mb-2 text-sm font-semibold text-blue-900">
        <span className="mr-2">{targetIcon}</span>
        Cocok untuk:
      </p>
      <p className="text-sm leading-relaxed text-slate-700">{targetText}</p>
    </div>
    <Button
      href={CTA_REGISTER}
      variant="primary"
      size="md"
      icon={<ArrowRight className="h-4 w-4" />}
      iconPosition="right"
      className="mt-4"
    >
      Lihat Detail & Daftar
    </Button>
  </div>
);

const Testimonial = ({
  quote,
  name,
  role,
}: {
  quote: string;
  name: string;
  role: string;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-3 flex items-center gap-2 text-yellow-500">
      <Star className="h-5 w-5 fill-yellow-500" />
      <Star className="h-5 w-5 fill-yellow-500" />
      <Star className="h-5 w-5 fill-yellow-500" />
      <Star className="h-5 w-5 fill-yellow-500" />
      <Star className="h-5 w-5 fill-yellow-500" />
    </div>
    <p className="mb-3 text-slate-700">"{quote}"</p>
    <div className="text-sm font-semibold text-slate-900">{name}</div>
    <div className="text-xs text-slate-500">{role}</div>
  </div>
);

import { API_BASE } from "./config/api";

// Helper function to extract YouTube video ID
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

export default function LearnMoreZE() {
  const [homepageVideoId, setHomepageVideoId] = useState<string | null>(null);

  // Fetch homepage video URL
  useEffect(() => {
    const fetchHomepageVideo = async () => {
      try {
        const response = await fetch(`${API_BASE}/settings/homepage_video_url`);
        const data = await response.json();

        if (data.success && data.data?.setting_value) {
          const videoId = getYouTubeVideoId(data.data.setting_value);
          setHomepageVideoId(videoId);
        }
      } catch (error) {
        console.error("Error fetching homepage video:", error);
      }
    };

    fetchHomepageVideo();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white text-slate-900">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-white to-white" />
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <Badge variant="active">
                <ShieldCheck className="h-4 w-4" />
                Metode NBSN • Fun • Terukur
              </Badge>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight text-slate-900 md:text-5xl">
                Belajar Inggris yang <span className="text-blue-700">Seru</span>
                ,
                <br /> Efektif, dan Bikin{" "}
                <span className="text-blue-700">Percaya Diri</span>!
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
                Untuk usia 3 tahun hingga dewasa. Online & Offline. Dengan AI
                Coach, project class, dan feedback harian agar progres nyata
                terasa tiap minggu.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  href={CTA_TRYFREE}
                  variant="primary"
                  size="lg"
                  icon={<Rocket className="h-4 w-4" />}
                  iconPosition="right"
                >
                  Coba Kelas Gratis
                </Button>
                <Button
                  href={CTA_SCHEDULE}
                  variant="outline-primary"
                  size="lg"
                  icon={<CalendarCheck className="h-4 w-4" />}
                  iconPosition="right"
                >
                  Lihat Program & Jadwal
                </Button>
                <Button
                  href={CTA_WHATSAPP}
                  variant="outline-success"
                  size="lg"
                  icon={<MessageCircle className="h-4 w-4" />}
                  iconPosition="right"
                >
                  Konsultasi Admin
                </Button>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-5 rounded-2xl border border-blue-100 bg-white/70 p-4 backdrop-blur">
                <Stat value="200+" label="Siswa Aktif" />
                <Stat value="90%" label="Orang Tua Puas" />
                <Stat value="10+" label="Project Class/Bulan" />
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
                {homepageVideoId ? (
                  <AutoplayYouTube videoId={homepageVideoId} />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-600/10 to-blue-300/10">
                    <Video className="h-12 w-12 text-blue-700" />
                    <span className="ml-3 text-slate-600">
                      Preview: Inside Zona English
                    </span>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-5 -right-5 hidden w-40 rotate-3 rounded-xl border border-blue-100 bg-white p-3 shadow md:block">
                <div className="text-xs font-semibold text-blue-700">
                  NBSN Method
                </div>
                <p className="text-xs text-slate-600">
                  Neuron • Biomolecular • Sensory • Nature
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">Kenapa Zona English?</h2>
            <p className="mt-3 text-slate-600">
              Zona English menggunakan pendekatan <strong>NBSN</strong> yang
              menstimulasi cara kerja otak alami: banyak interaksi, praktik
              langsung, dan project nyata. Dikombinasikan dengan{" "}
              <strong>AI Coach</strong> dan <strong>feedback terukur</strong>,
              siswa belajar lebih cepat, percaya diri, dan konsisten.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Feature
                icon={BookOpen}
                title="Guru Profesional"
                desc="Pengajar berpengalaman dengan training berkala dan kurikulum bertingkat."
              />
              <Feature
                icon={Rocket}
                title="AI Coach & App"
                desc="Latihan mandiri, kuis harian, dan reward system di aplikasi ZE."
              />
              <Feature
                icon={Users}
                title="Small Class"
                desc="Kelas kecil, praktik speaking intensif, dan kolaborasi tim."
              />
              <Feature
                icon={Gift}
                title="Reward System"
                desc="Poin bisa ditukar voucher, merchandise, atau kelas spesial."
              />
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <Gift className="h-4 w-4" /> Promo Bulan Ini
            </div>
            <h3 className="text-xl font-bold">Zona English — Promo Hub</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-blue-700" /> Semua
                promo aktif
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-blue-700" /> Diskon
                fasilitas & potongan iuran bulan pertama
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-blue-700" /> Bonus
                Project Class "Cooking in English"
              </li>
            </ul>
            <div className="mt-5 flex gap-3">
              <Button
                href={CTA_REGISTER}
                variant="primary"
                size="md"
                icon={<ArrowRight className="h-4 w-4" />}
                iconPosition="right"
              >
                Ambil Promo
              </Button>
              <Button href={CTA_WHATSAPP} variant="outline-primary" size="md">
                Tanya Admin
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section id="jadwal" className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Program & Segmentasi Usia</h2>
          <Button
            href={CTA_SCHEDULE}
            variant="link"
            icon={<ArrowRight className="h-4 w-4" />}
            iconPosition="right"
          >
            Lihat Jadwal
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <ProgramCard
            emoji="✨"
            title="Bright Stars"
            age="Usia 3–6 tahun"
            description1="Belajar bahasa Inggris lewat lagu, permainan, dan cerita menyenangkan."
            description2="Anak tumbuh percaya diri, aktif berbicara, dan berakhlak baik sejak dini."
            targetIcon="🧩"
            targetText="Anak yang baru mulai belajar dan orang tua yang ingin anaknya tumbuh bahagia sambil belajar."
          />
          <ProgramCard
            emoji="🚀"
            title="Smart Path"
            age="Usia 7–12 tahun"
            description1="Kelas interaktif untuk membangun kemampuan membaca, menulis, mendengar, dan berbicara."
            description2="Anak belajar berpikir kritis lewat project dan kegiatan nyata yang seru."
            targetIcon="🧠"
            targetText="Siswa SD yang ingin meningkatkan kemampuan bahasa dan percaya diri berbicara."
          />
          <ProgramCard
            emoji="🔥"
            title="The Quest"
            age="Usia 13–17 tahun"
            description1="Remaja belajar berbicara lancar, berdiskusi, dan menulis ide dengan percaya diri."
            description2="Didesain agar siap menghadapi sekolah, lomba, dan dunia global."
            targetIcon="💬"
            targetText="Remaja yang ingin menguasai bahasa Inggris untuk prestasi dan masa depan."
          />
          <ProgramCard
            emoji="🎯"
            title="The Elevate"
            age="Usia 18 tahun ke atas"
            description1="Bahasa Inggris profesional untuk kuliah, kerja, dan karier global."
            description2="Latihan presentasi, wawancara, dan komunikasi dengan percaya diri."
            targetIcon="💼"
            targetText="Mahasiswa & profesional yang ingin naik level akademik dan karier."
          />
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold">Apa Kata Mereka</h2>
          <p className="mt-2 text-slate-600">
            Cerita singkat dari orang tua & siswa setelah belajar di Zona
            English.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Testimonial
            quote="Anak saya dulu pemalu, sekarang berani presentasi pakai Bahasa Inggris."
            name="Ibu Rina"
            role="Orang Tua (Kolaka)"
          />
          <Testimonial
            quote="Belajar di ZE tuh kayak main game—seru tapi ilmunya nempel."
            name="Arka"
            role="Siswa (10 th)"
          />
          <Testimonial
            quote="Kurikulumnya rapi, progres tiap minggu bisa kami pantau dari report gurunya."
            name="Pak Ahmad"
            role="Orang Tua"
          />
        </div>
      </section>

      {/* HOW TO JOIN */}
      <section id="daftar" className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold">Cara Daftar Cepat</h2>
          <p className="mt-2 text-slate-600">
            3 langkah sederhana untuk mulai kelas.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
              Langkah 1
            </div>
            <h3 className="mb-2 text-lg font-bold">Isi Form Pendaftaran</h3>
            <p className="text-sm text-slate-600">
              Pilih program & jadwal yang diinginkan. Admin akan menerima data
              Anda.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
              Langkah 2
            </div>
            <h3 className="mb-2 text-lg font-bold">Konsultasi Jadwal</h3>
            <p className="text-sm text-slate-600">
              Admin menghubungi via WhatsApp untuk finalisasi jadwal & trial.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
              Langkah 3
            </div>
            <h3 className="mb-2 text-lg font-bold">Mulai Belajar</h3>
            <p className="text-sm text-slate-600">
              Bergabung ke kelas, dapatkan report dan reward tiap minggu.
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button
            href={CTA_REGISTER}
            variant="primary"
            size="lg"
            icon={<ArrowRight className="h-4 w-4" />}
            iconPosition="right"
          >
            Daftar Sekarang
          </Button>
          <Button
            href={CTA_WHATSAPP}
            variant="outline-primary"
            size="lg"
            icon={<Phone className="h-4 w-4" />}
            iconPosition="right"
          >
            Chat Admin
          </Button>
        </div>
      </section>

      {/* PARTNERS */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-blue-700">
            Bagian dari Ekosistem
          </div>
          <div className="grid grid-cols-2 items-center gap-6 text-center md:grid-cols-6">
            {[
              "Hira Space",
              "Hira Academy",
              "Docterbee",
              "Freshskill.my.id",
              "ZonaEnglish App",
              "ZE Camp",
            ].map((p) => (
              <div
                key={p}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700"
              >
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h4 className="text-lg font-bold">Zona English</h4>
            <p className="mt-2 text-sm text-slate-600">
              Belajar Inggris yang seru & terukur. Online & offline, untuk semua
              usia.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-bold">Kontak</h4>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> Admin:{" "}
                <a
                  className="text-blue-700 hover:underline"
                  href={CTA_WHATSAPP}
                >
                  WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Kolaka • Makassar • Kendari (dan
                online)
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold">Ikuti Kami</h4>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              <li>@zonaenglish.id</li>
              <li>Reels: Testimoni • Project Class • Tips</li>
            </ul>
          </div>
        </div>
      </footer>

      {/* FLOATING WA BUTTON */}
      <FloatingButton
        href={CTA_WHATSAPP}
        icon={<MessageCircle className="h-5 w-5" />}
        iconPosition="left"
      >
        Tanya Admin
      </FloatingButton>
    </main>
  );
}
