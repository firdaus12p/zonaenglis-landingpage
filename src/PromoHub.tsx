import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  Share2,
  Gift,
  DollarSign,
  Users,
  Trophy,
  Star,
  Filter,
  MapPin,
  Clock,
  Target,
} from "lucide-react";

// Import komponen universal dan konstanta
import { Badge, Button, FloatingButton, BADGE_VARIANTS } from "./components";
import { WHATSAPP_LINKS, CTA_REGISTER } from "./constants/cta";

// Konstanta CTA untuk backward compatibility
const CTA_WHATSAPP = WHATSAPP_LINKS.PROMO_HUB;
const CTA_AFFILIATE = "#daftar-affiliate";

// Program Filter Component
const FilterTabs = ({
  filters,
  activeFilter,
  onFilterChange,
}: {
  filters: Array<{ key: string; label: string; icon: React.ReactNode }>;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}) => (
  <div className="flex flex-wrap gap-2">
    {filters.map((filter) => (
      <Button
        key={filter.key}
        onClick={() => onFilterChange(filter.key)}
        variant={
          activeFilter === filter.key ? "secondary" : "outline-secondary"
        }
        size="sm"
        icon={filter.icon}
        iconPosition="left"
      >
        {filter.label}
      </Button>
    ))}
  </div>
);

// Ambassador Card Component
const AmbassadorCard = ({
  name,
  role,
  location,
  achievement,
  commission,
  referrals,
  badge,
  image,
}: {
  name: string;
  role: string;
  location: string;
  achievement: string;
  commission: string;
  referrals: number;
  badge: { text: string; variant: keyof typeof BADGE_VARIANTS };
  image: string;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start gap-3">
      <img
        src={image}
        alt={`${name} profile`}
        className="h-16 w-16 rounded-full border-2 border-slate-200 object-cover"
      />
      <div className="flex-1">
        <div className="mb-2">
          <Badge variant={badge.variant}>{badge.text}</Badge>
        </div>
        <h3 className="font-bold text-slate-900">{name}</h3>
        <p className="text-sm text-slate-600">{role}</p>
        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
          <MapPin className="h-3 w-3" /> {location}
        </p>
      </div>
    </div>

    <div className="mt-4 grid grid-cols-3 gap-3 text-center">
      <div className="rounded-lg bg-emerald-50 p-2">
        <div className="text-sm font-bold text-emerald-700">{commission}</div>
        <div className="text-xs text-emerald-600">Komisi</div>
      </div>
      <div className="rounded-lg bg-blue-50 p-2">
        <div className="text-sm font-bold text-blue-700">{referrals}</div>
        <div className="text-xs text-blue-600">Referral</div>
      </div>
      <div className="rounded-lg bg-amber-50 p-2">
        <div className="text-xs font-semibold text-amber-700">
          {achievement}
        </div>
      </div>
    </div>
  </div>
);

// Opportunity Card Component
const OpportunityCard = ({
  title,
  badges,
  description,
  benefits,
  requirements,
  commission,
  ctaText = "Daftar Sekarang",
  ctaLink = CTA_REGISTER,
}: {
  title: string;
  badges: Array<{ text: string; variant: keyof typeof BADGE_VARIANTS }>;
  description: string;
  benefits: string[];
  requirements: string[];
  commission: string;
  ctaText?: string;
  ctaLink?: string;
}) => (
  <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-transform hover:scale-[1.02]">
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {badges.map((badge, index) => (
          <Badge key={index} variant={badge.variant}>
            {badge.text}
          </Badge>
        ))}
      </div>
      <h3 className="mb-2 text-lg font-bold text-slate-900">{title}</h3>
      <p className="mb-4 text-sm text-slate-600">{description}</p>

      <div className="mb-4">
        <h4 className="mb-2 text-sm font-semibold text-slate-900">
          Keuntungan:
        </h4>
        <ul className="space-y-1">
          {benefits.map((benefit, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-sm text-slate-700"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <h4 className="mb-2 text-sm font-semibold text-slate-900">Syarat:</h4>
        <ul className="space-y-1">
          {requirements.map((requirement, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-sm text-slate-700"
            >
              <Target className="mt-0.5 h-4 w-4 text-blue-600 flex-shrink-0" />
              <span>{requirement}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg bg-green-50 border border-green-200 p-3">
        <div className="text-sm font-semibold text-green-700">
          💰 Komisi: {commission}
        </div>
      </div>
    </div>

    <div className="mt-6 flex items-center justify-between gap-3">
      <Button href={ctaLink} variant="primary" className="flex-1">
        {ctaText} <ArrowRight className="h-4 w-4" />
      </Button>
      <Button
        href={CTA_WHATSAPP}
        variant="link"
        size="sm"
        className="whitespace-nowrap"
      >
        Tanya Admin
      </Button>
    </div>
  </div>
);

// Success Story Component
const SuccessStory = ({
  name,
  before,
  after,
  timeline,
  image,
}: {
  name: string;
  before: string;
  after: string;
  timeline: string;
  image: string;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-start gap-4">
      <img
        src={image}
        alt={`${name} success story`}
        className="h-16 w-16 rounded-full border-2 border-amber-200 object-cover"
      />
      <div className="flex-1">
        <h3 className="font-bold text-slate-900">{name}</h3>
        <div className="flex items-center gap-2 text-xs text-amber-600 mb-3">
          <Clock className="h-3 w-3" />
          <span>{timeline}</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-xs font-semibold text-slate-600 mb-1">
              Sebelum:
            </div>
            <p className="text-sm text-slate-700">{before}</p>
          </div>
          <div className="rounded-lg bg-emerald-50 p-3">
            <div className="text-xs font-semibold text-emerald-600 mb-1">
              Sekarang:
            </div>
            <p className="text-sm text-emerald-700">{after}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function PromoHub() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { key: "all", label: "Semua", icon: <Filter className="h-4 w-4" /> },
    {
      key: "ambassador",
      label: "Ambassador",
      icon: <Users className="h-4 w-4" />,
    },
    {
      key: "affiliate",
      label: "Affiliate",
      icon: <Share2 className="h-4 w-4" />,
    },
    { key: "referral", label: "Referral", icon: <Gift className="h-4 w-4" /> },
  ];

  const ambassadors = [
    {
      name: "Sarah Pratiwi",
      role: "Senior Ambassador",
      location: "Makassar",
      achievement: "Top Recruiter",
      commission: "8.5jt",
      referrals: 47,
      badge: {
        text: "Ambassador Elite",
        variant: "premium" as keyof typeof BADGE_VARIANTS,
      },
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=150&auto=format&fit=crop",
    },
    {
      name: "Ahmad Rizki",
      role: "Campus Ambassador",
      location: "Kendari",
      achievement: "Rising Star",
      commission: "4.2jt",
      referrals: 23,
      badge: {
        text: "Campus Leader",
        variant: "ambassador" as keyof typeof BADGE_VARIANTS,
      },
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
    },
    {
      name: "Maya Sari",
      role: "Community Ambassador",
      location: "Kolaka",
      achievement: "Konsisten",
      commission: "2.8jt",
      referrals: 15,
      badge: {
        text: "Community Star",
        variant: "ambassador" as keyof typeof BADGE_VARIANTS,
      },
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop",
    },
  ];

  const opportunities = [
    {
      title: "Campus Ambassador",
      badges: [
        {
          text: "Target Mahasiswa",
          variant: "ambassador" as keyof typeof BADGE_VARIANTS,
        },
        { text: "Part-time", variant: "active" as keyof typeof BADGE_VARIANTS },
      ],
      description:
        "Promosikan Zona English di kampus & komunitas mahasiswa. Cocok untuk mahasiswa aktif yang ingin income tambahan.",
      benefits: [
        "Komisi 15-25% per pendaftaran berhasil",
        "Bonus achievement bulanan Rp500k-2jt",
        "Free kelas premium untuk diri sendiri",
        "Sertifikat ambassador resmi",
      ],
      requirements: [
        "Mahasiswa aktif atau fresh graduate",
        "Aktif di sosial media & komunitas",
        "Komunikasi baik & antusias",
        "Target minimal 5 referral/bulan",
      ],
      commission: "Rp150k-500k per siswa + bonus bulanan",
      ctaText: "Apply Ambassador",
      ctaLink: CTA_REGISTER,
    },
    {
      title: "Affiliate Partner",
      badges: [
        {
          text: "General Market",
          variant: "affiliate" as keyof typeof BADGE_VARIANTS,
        },
        { text: "Flexible", variant: "active" as keyof typeof BADGE_VARIANTS },
      ],
      description:
        "Program afiliasi terbuka untuk siapa saja. Share link unik, dapatkan komisi otomatis setiap ada yang daftar.",
      benefits: [
        "Komisi 10-20% tracking otomatis",
        "Dashboard analytics lengkap",
        "Material promosi disediakan",
        "Payment otomatis setiap minggu",
      ],
      requirements: [
        "Punya audience/network",
        "Aktif promosi online/offline",
        "Follow guidelines promosi",
        "No minimum target",
      ],
      commission: "Rp100k-300k per konversi",
      ctaText: "Join Affiliate",
      ctaLink: CTA_AFFILIATE,
    },
    {
      title: "Referral Reward",
      badges: [
        {
          text: "Siswa & Orang Tua",
          variant: "referral" as keyof typeof BADGE_VARIANTS,
        },
        { text: "One-time", variant: "active" as keyof typeof BADGE_VARIANTS },
      ],
      description:
        "Program rujukan untuk siswa aktif & orang tua. Ajak teman/keluarga, dapatkan reward langsung.",
      benefits: [
        "Voucher Rp100k per referral berhasil",
        "Bonus merchandise eksklusif",
        "Potongan kelas untuk diri sendiri",
        "Poin reward di aplikasi",
      ],
      requirements: [
        "Siswa aktif Zona English",
        "Referral harus join minimal 1 bulan",
        "Maksimal 10 referral per siswa",
        "Tidak boleh self-referral",
      ],
      commission: "Voucher Rp100k + merchandise",
      ctaText: "Mulai Refer",
      ctaLink: "#mulai-refer",
    },
  ];

  const successStories = [
    {
      name: "Sarah Pratiwi",
      before: "Mahasiswa biasa, income hanya dari part-time cafe Rp800k/bulan",
      after:
        "Ambassador elite dengan income Rp8.5jt/bulan + skill komunikasi meningkat",
      timeline: "6 bulan",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=150&auto=format&fit=crop",
    },
    {
      name: "Ahmad Rizki",
      before: "Fresh graduate mencari kerja, belum dapat income tetap",
      after: "Campus ambassador sukses, income Rp4.2jt sambil kuliah S2",
      timeline: "4 bulan",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
    },
  ];

  const filteredOpportunities =
    activeFilter === "all"
      ? opportunities
      : opportunities.filter((opp) =>
          opp.badges.some(
            (badge) =>
              badge.variant === activeFilter ||
              opp.title.toLowerCase().includes(activeFilter)
          )
        );

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white text-slate-900">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-100 via-white to-white" />
        <div className="mx-auto max-w-6xl px-4 pt-10 pb-6 md:pt-16 md:pb-10">
          <div className="rounded-3xl border border-purple-100 bg-white/70 p-6 shadow-md backdrop-blur-sm">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                  💼 Partnership & Affiliate Program
                </div>
                <h1 className="text-3xl font-extrabold leading-tight text-slate-900 md:text-4xl">
                  Zona English —{" "}
                  <span className="text-purple-700">Promo Hub</span>
                </h1>
                <p className="mt-2 max-w-2xl text-slate-600">
                  Bergabung sebagai <strong>Ambassador</strong>,{" "}
                  <strong>Affiliate Partner</strong>, atau manfaatkan{" "}
                  <strong>Referral Reward</strong>. Raih income sambil membantu
                  orang belajar bahasa Inggris.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  href={CTA_REGISTER}
                  variant="primary"
                  size="md"
                  className="bg-purple-700 hover:bg-purple-800"
                >
                  Daftar Partner <ArrowRight className="h-4 w-4" />
                </Button>
                <Button href={CTA_WHATSAPP} variant="whatsapp" size="md">
                  <MessageCircle className="h-4 w-4" /> Chat Admin
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="mx-auto max-w-6xl px-4 pb-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            {
              icon: <Users className="h-6 w-6" />,
              number: "47+",
              label: "Active Partners",
              color: "purple",
            },
            {
              icon: <DollarSign className="h-6 w-6" />,
              number: "125jt+",
              label: "Total Komisi Dibayar",
              color: "emerald",
            },
            {
              icon: <Trophy className="h-6 w-6" />,
              number: "890+",
              label: "Successful Referrals",
              color: "amber",
            },
            {
              icon: <Star className="h-6 w-6" />,
              number: "4.9",
              label: "Partner Satisfaction",
              color: "blue",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-center"
            >
              <div
                className={`inline-flex items-center justify-center rounded-full bg-${stat.color}-50 p-3 mb-2`}
              >
                <div className={`text-${stat.color}-600`}>{stat.icon}</div>
              </div>
              <div className="text-xl font-extrabold text-slate-900">
                {stat.number}
              </div>
              <div className="text-xs text-slate-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CURRENT AMBASSADORS */}
      <section className="mx-auto max-w-6xl px-4 pb-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Ambassador Aktif</h2>
          <p className="mt-1 text-slate-600">
            Meet our successful ambassadors & their achievements.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {ambassadors.map((ambassador, index) => (
            <AmbassadorCard key={index} {...ambassador} />
          ))}
        </div>
      </section>

      {/* FILTER & OPPORTUNITIES */}
      <section className="mx-auto max-w-6xl px-4 pb-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Peluang Partnership</h2>
            <p className="mt-1 text-slate-600">
              Pilih program yang sesuai dengan kemampuan & target income kamu.
            </p>
          </div>
          <FilterTabs
            filters={filters}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredOpportunities.map((opportunity, index) => (
            <OpportunityCard key={index} {...opportunity} />
          ))}
        </div>
      </section>

      {/* SUCCESS STORIES */}
      <section className="mx-auto max-w-6xl px-4 pb-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Success Stories</h2>
          <p className="mt-1 text-slate-600">
            Transformasi hidup partner-partner kami.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {successStories.map((story, index) => (
            <SuccessStory key={index} {...story} />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold">Cara Kerja Partnership</h2>
          <p className="mt-2 text-slate-600">4 langkah mudah mulai earning.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              step: "Step 1",
              title: "Apply & Interview",
              description:
                "Daftar online, ikuti interview singkat dengan tim kami. Proses 1-3 hari kerja.",
            },
            {
              step: "Step 2",
              title: "Training & Onboarding",
              description:
                "Pelatihan gratis tentang produk, teknik marketing, dan tools yang akan digunakan.",
            },
            {
              step: "Step 3",
              title: "Start Promoting",
              description:
                "Mulai promosi dengan material yang disediakan. Dapatkan link tracking unik.",
            },
            {
              step: "Step 4",
              title: "Earn Commission",
              description:
                "Monitor progress di dashboard. Komisi dibayar otomatis setiap minggu.",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-purple-700">
                {item.step}
              </div>
              <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
              <p className="text-sm text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold">FAQ Partnership</h2>
          <p className="mt-2 text-slate-600">
            Pertanyaan yang sering ditanyakan.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              question: "Berapa minimal income yang bisa didapat?",
              answer:
                "Ambassador: Rp1-8jt+/bulan tergantung performa. Affiliate: Rp500k-3jt+/bulan. Referral: Rp100k per berhasil.",
            },
            {
              question: "Apakah ada target minimal yang harus dicapai?",
              answer:
                "Campus Ambassador: minimal 5 referral/bulan. Affiliate: no minimum target. Referral: maksimal 10 per siswa.",
            },
            {
              question: "Kapan komisi dibayarkan?",
              answer:
                "Setiap hari Jumat via transfer bank/e-wallet. Minimal withdraw Rp100k.",
            },
            {
              question: "Bisakah gabung lebih dari 1 program?",
              answer:
                "Ya, kamu bisa jadi Ambassador sekaligus Affiliate. Tapi tidak bisa self-referral.",
            },
            {
              question: "Apakah ada kontrak atau ikatan tertentu?",
              answer:
                "Tidak ada kontrak mengikat. Partnership bisa di-terminate kapan saja oleh kedua belah pihak.",
            },
            {
              question: "Bagaimana cara tracking referral saya?",
              answer:
                "Setiap partner mendapat dashboard analytics real-time untuk monitor performa & komisi.",
            },
          ].map((faq, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="mb-2 font-bold text-slate-900">{faq.question}</h3>
              <p className="text-sm text-slate-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT & APPLY */}
      <section id="daftar-ambassador" className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white p-6 shadow-sm">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
              Ready to Join?
            </div>
            <h3 className="mb-2 text-xl font-bold">Daftar Sebagai Partner</h3>
            <p className="mb-4 text-sm text-slate-600">
              Pilih program partnership yang sesuai dan mulai earning journey
              kamu bersama Zona English.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                href={CTA_REGISTER}
                variant="primary"
                className="bg-purple-700 hover:bg-purple-800"
              >
                Apply Now <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href={CTA_WHATSAPP} variant="outline-primary">
                <MessageCircle className="h-4 w-4" /> Chat Admin
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Contact Info
            </div>
            <h3 className="mb-4 text-xl font-bold">Hubungi Tim Partnership</h3>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-center gap-3">
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                <span>
                  WhatsApp:{" "}
                  <a
                    className="text-blue-700 hover:underline"
                    href={CTA_WHATSAPP}
                  >
                    +62 821-8808-0688
                  </a>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Users className="h-4 w-4 text-purple-600" />
                <span>
                  Instagram: <strong>@zonaenglish.id</strong>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span>Kantor: Makassar • Kolaka • Kendari</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-4 pb-24 text-sm text-slate-500">
        © Zona English Partnership Program. All rights reserved.
      </footer>

      {/* FLOATING WA BUTTON */}
      <FloatingButton href={CTA_WHATSAPP}>
        <MessageCircle className="h-5 w-5" /> Partnership
      </FloatingButton>
    </main>
  );
}
