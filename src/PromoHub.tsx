import { useState, useEffect } from "react";
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
  Copy,
  Check,
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

// Opportunity Card Component with Ambassador Code Support
const OpportunityCard = ({
  title,
  badges,
  description,
  benefits,
  requirements,
  commission,
  ctaText = "Daftar Sekarang",
  ctaLink = CTA_REGISTER,
  price,
}: {
  title: string;
  badges: Array<{ text: string; variant: keyof typeof BADGE_VARIANTS }>;
  description: string;
  benefits: string[];
  requirements: string[];
  commission: string;
  ctaText?: string;
  ctaLink?: string;
  price?: number;
}) => {
  const [codeInput, setCodeInput] = useState("");
  const [appliedCode, setAppliedCode] = useState<{
    code: string;
    ambassador: any;
    discount: number;
  } | null>(null);
  const [codeStatus, setCodeStatus] = useState<"idle" | "valid" | "invalid">(
    "idle"
  );
  const [copied, setCopied] = useState(false);

  const AMBASSADOR_DISCOUNT = 50000; // Potongan Rp 50.000

  const validateCode = (code: string) => {
    if (!code.trim()) {
      setCodeStatus("idle");
      setAppliedCode(null);
      return;
    }

    // Get ambassadors from localStorage
    const storedAmbassadors = localStorage.getItem("ambassadors");
    if (!storedAmbassadors) {
      setCodeStatus("invalid");
      setAppliedCode(null);
      return;
    }

    const ambassadors = JSON.parse(storedAmbassadors);
    const foundAmbassador = ambassadors.find(
      (amb: any) =>
        amb.affiliateCode &&
        amb.affiliateCode.toUpperCase() === code.trim().toUpperCase() &&
        amb.status === "Active"
    );

    if (foundAmbassador) {
      setCodeStatus("valid");
      setAppliedCode({
        code: code.trim().toUpperCase(),
        ambassador: foundAmbassador,
        discount: AMBASSADOR_DISCOUNT,
      });
    } else {
      setCodeStatus("invalid");
      setAppliedCode(null);
    }
  };

  const handleApplyCode = () => {
    validateCode(codeInput);
  };

  const handleCopyCode = () => {
    if (appliedCode) {
      navigator.clipboard.writeText(appliedCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const finalPrice =
    price && appliedCode ? price - appliedCode.discount : price;

  return (
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

        {/* Price Section */}
        {price && (
          <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 p-3">
            <div className="text-xs font-semibold text-blue-700 mb-1">
              Investasi Program:
            </div>
            <div className="flex items-center gap-2">
              {appliedCode ? (
                <>
                  <span className="text-sm text-slate-500 line-through">
                    Rp {price.toLocaleString("id-ID")}
                  </span>
                  <span className="text-lg font-bold text-emerald-700">
                    Rp {finalPrice?.toLocaleString("id-ID")}
                  </span>
                  <span className="text-xs text-emerald-600">
                    (Hemat Rp {appliedCode.discount.toLocaleString("id-ID")})
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-blue-900">
                  Rp {price.toLocaleString("id-ID")}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="rounded-lg bg-green-50 border border-green-200 p-3 mb-4">
          <div className="text-sm font-semibold text-green-700">
            💰 Komisi: {commission}
          </div>
        </div>

        {/* Ambassador Code Input */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <label className="mb-2 block text-xs font-semibold text-slate-700">
            Punya Kode Ambassador/Affiliate?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              placeholder="Contoh: ZE-SNR-SAR001"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              onKeyPress={(e) => e.key === "Enter" && handleApplyCode()}
            />
            <button
              onClick={handleApplyCode}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              Terapkan
            </button>
          </div>

          {/* Code Status Messages */}
          <div className="mt-2 min-h-[20px]">
            {codeStatus === "valid" && appliedCode && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Kode Valid! Potongan Rp{" "}
                      {appliedCode.discount.toLocaleString("id-ID")}
                    </div>
                    <div className="mt-1 text-xs text-emerald-600">
                      Ambassador: <strong>{appliedCode.ambassador.name}</strong>{" "}
                      • {appliedCode.ambassador.type}
                      <br />
                      Lokasi: {appliedCode.ambassador.location}
                    </div>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center gap-1"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3" /> Tersalin
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {codeStatus === "invalid" && (
              <div className="text-xs text-rose-600">
                ⚠️ Kode tidak ditemukan atau tidak aktif. Pastikan kode benar
                atau hubungi Ambassador Anda.
              </div>
            )}

            {codeStatus === "idle" && (
              <div className="text-xs text-slate-500">
                Masukkan kode untuk mendapatkan potongan tambahan Rp{" "}
                {AMBASSADOR_DISCOUNT.toLocaleString("id-ID")}
              </div>
            )}
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
};

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

// Ambassador Person Card Component (for directory)
const AmbassadorPersonCard = ({
  name,
  role,
  code,
  contact,
  testimonial,
}: {
  name: string;
  role: "Ambassador" | "Affiliate";
  code: string;
  contact: string;
  testimonial: string;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{name}</span>
          <span
            className={`rounded-full border px-2 py-0.5 text-xs ${
              role === "Ambassador"
                ? "border-amber-300 bg-amber-50 text-amber-700"
                : "border-emerald-300 bg-emerald-50 text-emerald-700"
            }`}
          >
            {role}
          </span>
        </div>
        <div className="mt-1 text-xs text-slate-500">
          Kode: <b>{code}</b>
        </div>
        <div className="mt-1 text-xs text-slate-600">"{testimonial}"</div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <a
          className="rounded-xl bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 transition-colors"
          href={contact}
          target="_blank"
          rel="noopener noreferrer"
        >
          Chat WA
        </a>
        <button
          onClick={handleCopy}
          className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 transition-colors"
        >
          {copied ? "Berhasil disalin ✓" : "Copy Kode"}
        </button>
      </div>
    </div>
  );
};

export default function PromoHub() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeLocation, setActiveLocation] = useState<
    "Pettarani" | "Kolaka" | "Kendari"
  >("Pettarani");
  const [searchInstitution, setSearchInstitution] = useState("");
  const [filterBranch, setFilterBranch] = useState<
    "all" | "Pettarani" | "Kolaka" | "Kendari"
  >("all");

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

  // Ambassador state - will load from localStorage
  const [ambassadors, setAmbassadors] = useState([
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
  ]);

  // Load ambassadors from localStorage
  useEffect(() => {
    const loadAmbassadors = () => {
      const stored = localStorage.getItem("ambassadors");
      if (stored) {
        const parsedAmbassadors = JSON.parse(stored);
        // Transform admin ambassador data to PromoHub format
        const transformedAmbassadors = parsedAmbassadors
          .filter((amb: any) => amb.status === "Active") // Only show active ambassadors
          .slice(0, 6) // Limit to 6 ambassadors for display
          .map((amb: any) => ({
            name: amb.name,
            role: amb.type,
            location: amb.location,
            achievement:
              amb.totalReferred > 30
                ? "Top Recruiter"
                : amb.totalReferred > 15
                ? "Rising Star"
                : "Konsisten",
            commission: `${(amb.totalEarnings / 1000000).toFixed(1)}jt`,
            referrals: amb.totalReferred,
            badge: {
              text:
                amb.type === "Senior Ambassador"
                  ? "Ambassador Elite"
                  : amb.type === "Campus Ambassador"
                  ? "Campus Leader"
                  : "Community Star",
              variant:
                amb.type === "Senior Ambassador"
                  ? "premium"
                  : ("ambassador" as keyof typeof BADGE_VARIANTS),
            },
            image:
              amb.photo ||
              `https://images.unsplash.com/photo-${
                amb.id % 2 === 0
                  ? "1494790108755-2616b612b786"
                  : "1507003211169-0a1dd7228f2d"
              }?q=80&w=150&auto=format&fit=crop`,
          }));

        setAmbassadors(transformedAmbassadors);
      }
    };

    loadAmbassadors();

    // Listen for localStorage changes (when ambassadors are added/updated from admin)
    const handleStorageChange = () => {
      loadAmbassadors();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

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
      price: 0, // Free untuk apply
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
      price: 0, // Free untuk join
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
      price: 0, // Free reward program
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

  // Ambassador institutions directory data
  const ambassadorInstitutions = [
    {
      institution: "SMAN 1 Makassar",
      branch: "Pettarani",
      people: [
        {
          name: "Aulia Ramadhani",
          role: "Ambassador" as const,
          code: "ZE-AULIA11",
          contact:
            "https://wa.me/6281234567890?text=Halo%2C%20saya%20tertarik%20dengan%20Zona%20English",
          testimonial: "Kelas premium-nya seru & fokus speaking!",
        },
        {
          name: "Fahri",
          role: "Affiliate" as const,
          code: "ZE-FAHRI12",
          contact:
            "https://wa.me/6285678901234?text=Halo%2C%20saya%20tertarik%20dengan%20Zona%20English",
          testimonial: "Tutor sabar & progress report-nya jelas.",
        },
      ],
    },
    {
      institution: "Universitas Hasanuddin",
      branch: "Pettarani",
      people: [
        {
          name: "Tania",
          role: "Ambassador" as const,
          code: "ZE-TANIA11",
          contact:
            "https://wa.me/6287788990011?text=Halo%2C%20saya%20tertarik%20dengan%20Zona%20English",
          testimonial: "Bisa tanya jadwal & level yang cocok dulu.",
        },
      ],
    },
    {
      institution: "PT Maju Jaya Makassar",
      branch: "Pettarani",
      people: [
        {
          name: "Rizal",
          role: "Affiliate" as const,
          code: "ZE-RIZAL88",
          contact:
            "https://wa.me/6282233445566?text=Halo%2C%20saya%20tertarik%20dengan%20Zona%20English",
          testimonial: "Cocok buat upgrade speaking kantor.",
        },
      ],
    },
  ];

  // Filter ambassador institutions based on search and branch
  const filteredAmbassadors = ambassadorInstitutions.filter(
    (amb) =>
      (filterBranch === "all" || amb.branch === filterBranch) &&
      amb.institution.toLowerCase().includes(searchInstitution.toLowerCase())
  );

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

      {/* LOKASI CABANG SECTION */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Lokasi Cabang</h2>
          <div className="flex gap-2">
            {(["Pettarani", "Kolaka", "Kendari"] as const).map((location) => (
              <button
                key={location}
                onClick={() => setActiveLocation(location)}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-all ${
                  activeLocation === location
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-100 hover:bg-blue-50/50"
                }`}
              >
                <MapPin className="mr-1 inline-block h-4 w-4" />
                {location}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {activeLocation === "Pettarani" && (
            <iframe
              className="h-[420px] w-full"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src="https://maps.google.com/maps?q=Zona%20English%20Makassar%20Pettarani&output=embed"
            />
          )}
          {activeLocation === "Kolaka" && (
            <iframe
              className="h-[420px] w-full"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src="https://maps.google.com/maps?q=Zona%20English%20Kolaka&output=embed"
            />
          )}
          {activeLocation === "Kendari" && (
            <iframe
              className="h-[420px] w-full"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src="https://maps.google.com/maps?q=Zona%20English%20Kendari&output=embed"
            />
          )}
        </div>
      </section>

      {/* AMBASSADOR DIRECTORY SECTION */}
      <section id="ambassador" className="mx-auto max-w-7xl px-4 pb-10">
        <div className="mb-3">
          <h2 className="text-2xl font-bold">
            Temukan Ambassador & Affiliate Terdekat
          </h2>
          <p className="mt-2 text-slate-600">
            Pilih sekolah, kampus, atau tempat kerja untuk melihat siapa yang
            bisa kamu hubungi dan dapatkan kode unik mereka.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-4 flex flex-wrap gap-2">
          <input
            id="search-inst"
            type="text"
            placeholder="Cari: sekolah/kampus/kantor..."
            value={searchInstitution}
            onChange={(e) => setSearchInstitution(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          <select
            id="filter-branch"
            value={filterBranch}
            onChange={(e) =>
              setFilterBranch(
                e.target.value as "all" | "Pettarani" | "Kolaka" | "Kendari"
              )
            }
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-300 focus:outline-none"
          >
            <option value="all">Semua Cabang</option>
            <option value="Pettarani">Pettarani</option>
            <option value="Kolaka">Kolaka</option>
            <option value="Kendari">Kendari</option>
          </select>
        </div>

        {/* Ambassador Cards Grid */}
        {filteredAmbassadors.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-600 shadow-sm">
            Data ambassador belum tersedia.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAmbassadors.map((inst, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                  {inst.branch}
                </div>
                <h3 className="text-lg font-bold">{inst.institution}</h3>
                <div className="mt-3 space-y-3">
                  {inst.people.map((person, pIdx) => (
                    <AmbassadorPersonCard key={pIdx} {...person} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
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
