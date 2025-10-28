import { useState, useEffect } from "react";
import { CheckCircle2, MessageCircle } from "lucide-react";

// Import komponen universal dan konstanta
import { FloatingButton } from "./components";
import { WHATSAPP_LINKS } from "./constants/cta";

// Konstanta CTA
const CTA_WHATSAPP = WHATSAPP_LINKS.PROMO_HUB;

// Types
interface PromoMedia {
  kind: "img" | "vid" | "yt";
  src: string;
}

interface PromoData {
  id: string;
  title: string;
  branch: "Pettarani" | "Kolaka" | "Kendari";
  type: string;
  program: string;
  start: string; // ISO 8601
  end: string; // ISO 8601
  quota: number;
  price: number;
  perks: string[];
  media: PromoMedia[];
  wa: string;
}

interface AmbassadorPerson {
  name: string;
  role: "Ambassador" | "Affiliate";
  code: string;
  contact: string;
  testimonial: string;
}

interface AmbassadorInstitution {
  institution: string;
  branch: "Pettarani" | "Kolaka" | "Kendari";
  people: AmbassadorPerson[];
}

interface CodeValidation {
  person?: AmbassadorPerson;
  institution?: string;
  branch?: string;
  promoName?: string;
  promoDescription?: string;
}

interface AppliedCode {
  code: string;
  type: "ambassador" | "promo";
  discount: number;
  discountType?: string;
  by?: CodeValidation;
  message: string;
}

// Helper Functions
const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const timeLeftISO = (isoEnd: string) => {
  const now = new Date();
  const end = new Date(isoEnd);
  const diff = end.getTime() - now.getTime();
  if (diff <= 0) return null;
  const s = Math.floor(diff / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const t = s % 60;
  return { d, h, m, t };
};

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

// Data
// PROMOS will be fetched from API

// Components
const AmbassadorPersonCard = ({
  name,
  role,
  code,
  contact,
  testimonial,
}: AmbassadorPerson) => {
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

const PromoCard = ({
  promo,
  appliedCode,
  onApplyCode,
  onValidationError,
}: {
  promo: PromoData;
  appliedCode: AppliedCode | null;
  onApplyCode: (code: string, validation: AppliedCode) => void;
  onValidationError: (error: string) => void;
}) => {
  const [codeInput, setCodeInput] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const tl = timeLeftISO(promo.end);
  const media = promo.media?.[0] || null;
  const discount = appliedCode?.discount || 0;
  const finalPrice = promo.price ? Math.max(0, promo.price - discount) : null;

  const handleApply = async () => {
    if (!codeInput.trim()) {
      onValidationError("Masukkan kode terlebih dahulu");
      return;
    }

    console.log("🔄 Starting validation for code:", codeInput.trim());
    setIsValidating(true);
    try {
      console.log("📡 Sending request to API...");
      const response = await fetch("http://localhost:3001/api/validate/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: codeInput.trim(),
          purchaseAmount: promo.price,
        }),
      });

      console.log(
        "✅ Response received:",
        response.status,
        response.statusText
      );
      const data = await response.json();
      console.log("📦 Response data:", data);

      if (!data.valid) {
        console.log("❌ Code invalid:", data.message);
        onValidationError(data.message || "Kode tidak valid");
        return;
      }

      console.log("✅ Code valid! Building validation object...");
      // Build validation object based on type
      const validation: AppliedCode = {
        code: codeInput.trim(),
        type: data.type,
        discount: data.discount,
        discountType: data.discountType,
        message: data.message,
        by:
          data.type === "ambassador" && data.ambassador
            ? {
                person: {
                  name: data.ambassador.name,
                  role: data.ambassador.role,
                  code: data.ambassador.code,
                  contact: `https://wa.me/${data.ambassador.phone}?text=Halo, saya tertarik dengan Zona English`,
                  testimonial: data.ambassador.testimonial || "",
                },
                institution: data.ambassador.institution || "",
                branch: data.ambassador.location || "",
              }
            : data.type === "promo" && data.promo
            ? {
                promoName: data.promo.name,
                promoDescription: data.promo.description,
              }
            : undefined,
      };

      console.log("🎉 Calling onApplyCode with validation:", validation);
      onApplyCode(codeInput.trim(), validation);
      setCodeInput("");
      console.log("✅ Code applied successfully!");
    } catch (error) {
      console.error("❌ Error validating code:", error);
      onValidationError("Gagal memvalidasi kode. Coba lagi.");
    } finally {
      setIsValidating(false);
      console.log("🔄 Validation complete");
    }
  };

  return (
    <div className="card flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div>
        {/* Media */}
        {media && (
          <div className="mb-3">
            {media.kind === "yt" ? (
              <iframe
                className="aspect-video w-full rounded-xl border border-slate-200"
                src={media.src}
                loading="lazy"
                allowFullScreen
              />
            ) : media.kind === "vid" ? (
              <video
                className="w-full rounded-xl border border-slate-200"
                controls
                preload="metadata"
                src={media.src}
              />
            ) : (
              <img
                className="w-full rounded-xl border border-slate-200"
                src={media.src}
                alt={promo.title}
              />
            )}
          </div>
        )}

        {/* Badges */}
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
            Cabang: {promo.branch}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-xs font-bold text-purple-700">
            {promo.type}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-xs font-bold text-teal-700">
            {promo.program}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700">
            Kuota: {promo.quota}
          </span>
        </div>

        <h3 className="text-lg font-bold">{promo.title}</h3>
        <p className="mt-1 text-sm text-slate-600">
          Periode: <b>{fmtDate(promo.start)}</b> — <b>{fmtDate(promo.end)}</b>
        </p>

        {/* Countdown */}
        <div className="mt-2">
          {tl ? (
            <div className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-bold">
              ⏳ Sisa: {tl.d}h {tl.h}j {tl.m}m {tl.t}d
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600">
              Selesai / Segera berakhir
            </div>
          )}
        </div>

        {/* Price */}
        {promo.price && (
          <div className="mt-2 text-sm">
            <span className="font-semibold">Biaya Program:</span>{" "}
            {discount > 0 ? (
              <>
                <span className="text-slate-400 line-through">
                  {rupiah(promo.price)}
                </span>
                <span className="mx-2">→</span>
                <span className="font-bold text-emerald-700">
                  {rupiah(finalPrice!)}
                </span>
                <span className="ml-2 text-xs text-emerald-600">
                  (kode {appliedCode?.code} -{rupiah(discount)})
                </span>
              </>
            ) : (
              <span className="font-bold">{rupiah(promo.price)}</span>
            )}
          </div>
        )}

        {/* Perks */}
        <ul className="mt-3 space-y-1 text-sm text-slate-700">
          {promo.perks.map((perk, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
              <span>{perk}</span>
            </li>
          ))}
        </ul>

        {/* Code Input */}
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            placeholder="Kode Ambassador/Affiliate (opsional)"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          <button
            onClick={handleApply}
            disabled={isValidating || !codeInput.trim()}
            className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isValidating ? "Validasi..." : "Apply"}
          </button>
        </div>

        {/* Status */}
        <div className="mt-2 min-h-[40px] text-xs">
          {appliedCode ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2">
              <div className="font-semibold text-emerald-700">
                {appliedCode.message}
              </div>
              {appliedCode.type === "ambassador" && appliedCode.by?.person && (
                <div className="mt-1 text-emerald-600">
                  Kontak:{" "}
                  <a
                    className="font-semibold text-blue-700 hover:underline"
                    href={appliedCode.by.person.contact}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {appliedCode.by.person.name}
                  </a>{" "}
                  • {appliedCode.by.person.role}
                  {appliedCode.by.institution &&
                    ` — ${appliedCode.by.institution}`}
                </div>
              )}
              {appliedCode.type === "promo" && appliedCode.by?.promoName && (
                <div className="mt-1 text-emerald-600">
                  Promo: <b>{appliedCode.by.promoName}</b>
                  {appliedCode.by.promoDescription && (
                    <> — {appliedCode.by.promoDescription}</>
                  )}
                </div>
              )}
            </div>
          ) : (
            <span className="text-slate-500">
              Masukkan kode untuk potongan tambahan.
            </span>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-4 flex items-center justify-between">
        <a
          className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 transition-colors"
          href={promo.wa}
          target="_blank"
          rel="noopener noreferrer"
        >
          Ambil Promo
        </a>
        <a
          className="text-sm font-semibold text-blue-700 hover:underline"
          href={`https://wa.me/6282188080688?text=Halo%20ZE%2C%20saya%20mau%20tanya%20tentang%20${encodeURIComponent(
            promo.title
          )}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Tanya Admin
        </a>
      </div>
    </div>
  );
};

export default function PromoHub() {
  const [filterBranch, setFilterBranch] = useState<
    "all" | "Pettarani" | "Kolaka" | "Kendari"
  >("all");
  const [filterType, setFilterType] = useState("all");
  const [filterProgram, setFilterProgram] = useState("all");
  const [globalCode, setGlobalCode] = useState("");
  const [globalStatus, setGlobalStatus] = useState(
    "Masukkan kode di sini atau pada kartu promo."
  );
  const [appliedCodes, setAppliedCodes] = useState<Map<string, AppliedCode>>(
    new Map()
  );
  const [activeLocation, setActiveLocation] = useState<
    "Pettarani" | "Kolaka" | "Kendari"
  >("Pettarani");
  const [searchInstitution, setSearchInstitution] = useState("");
  const [ambassadorFilterBranch, setAmbassadorFilterBranch] = useState<
    "all" | "Pettarani" | "Kolaka" | "Kendari"
  >("all");

  // State untuk data ambassador dari API
  const [ambassadorInstitutions, setAmbassadorInstitutions] = useState<
    AmbassadorInstitution[]
  >([]);

  // State untuk data programs/promos dari API
  const [promos, setPromos] = useState<PromoData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch ambassadors dan programs dari API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch ambassadors
        const ambassadorsResponse = await fetch(
          "http://localhost:3001/api/ambassadors"
        );
        const ambassadorsData = await ambassadorsResponse.json();

        // Group ambassadors by institution
        const grouped: Record<string, AmbassadorInstitution> = {};

        ambassadorsData.forEach((amb: any) => {
          const institution = amb.institution || "Lainnya";
          const branch = amb.location as "Pettarani" | "Kolaka" | "Kendari";

          if (!grouped[institution]) {
            grouped[institution] = {
              institution,
              branch,
              people: [],
            };
          }

          // Determine role from database role
          // Senior Ambassador = Ambassador, Others (Campus/Community/Junior) = Affiliate
          let role: "Ambassador" | "Affiliate" = "Ambassador";
          if (amb.role !== "Senior Ambassador") {
            role = "Affiliate";
          }

          grouped[institution].people.push({
            name: amb.name,
            role,
            code: amb.affiliate_code,
            contact: amb.phone
              ? `https://wa.me/${amb.phone.replace(
                  /\D/g,
                  ""
                )}?text=Halo%2C%20saya%20tertarik%20dengan%20Zona%20English`
              : "https://wa.me/6282188080688?text=Halo%2C%20saya%20tertarik%20dengan%20Zona%20English",
            testimonial: amb.testimonial || "Bergabunglah dengan Zona English!",
          });
        });

        setAmbassadorInstitutions(Object.values(grouped));

        // Fetch programs
        const programsResponse = await fetch(
          "http://localhost:3001/api/programs"
        );
        const programsData = await programsResponse.json();

        // Transform API data to PromoData format
        const transformedPromos: PromoData[] = programsData.map(
          (program: any) => ({
            id: program.id.toString(),
            title: program.title,
            branch: program.branch as "Pettarani" | "Kolaka" | "Kendari",
            type: program.type,
            program: program.program,
            start: new Date(program.start_date).toISOString(),
            end: new Date(program.end_date).toISOString(),
            quota: program.quota,
            price: parseFloat(program.price),
            perks:
              typeof program.perks === "string"
                ? JSON.parse(program.perks)
                : program.perks,
            media: [
              {
                kind: "img" as const,
                src:
                  program.image_url ||
                  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1471",
              },
            ],
            wa:
              program.wa_link ||
              "https://wa.me/6282188080688?text=Daftar%20Program",
          })
        );

        setPromos(transformedPromos);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Refresh data when returning to page or when ambassador data is updated
  useEffect(() => {
    const handleDataUpdate = () => {
      console.log("🔄 Ambassador data updated, refreshing PromoHub...");
      const fetchData = async () => {
        try {
          const ambassadorsResponse = await fetch(
            "http://localhost:3001/api/ambassadors"
          );
          const ambassadorsData = await ambassadorsResponse.json();

          const grouped: Record<string, AmbassadorInstitution> = {};

          ambassadorsData.forEach((amb: any) => {
            const institution = amb.institution || "Lainnya";
            const branch = amb.location as "Pettarani" | "Kolaka" | "Kendari";

            if (!grouped[institution]) {
              grouped[institution] = {
                institution,
                branch,
                people: [],
              };
            }

            let role: "Ambassador" | "Affiliate" = "Ambassador";
            if (amb.role !== "Senior Ambassador") {
              role = "Affiliate";
            }

            grouped[institution].people.push({
              name: amb.name,
              role,
              code: amb.affiliate_code,
              contact: amb.phone
                ? `https://wa.me/${amb.phone.replace(
                    /\D/g,
                    ""
                  )}?text=Halo%2C%20saya%20tertarik%20dengan%20Zona%20English`
                : "https://wa.me/6282188080688?text=Halo%2C%20saya%20tertarik%20dengan%20Zona%20English",
              testimonial:
                amb.testimonial || "Bergabunglah dengan Zona English!",
            });
          });

          setAmbassadorInstitutions(Object.values(grouped));
          console.log("✅ Ambassador data refreshed in PromoHub");
        } catch (error) {
          console.error("❌ Error refreshing ambassador data:", error);
        }
      };

      fetchData();
    };

    window.addEventListener("ambassadorDataUpdated", handleDataUpdate);
    window.addEventListener("focus", handleDataUpdate);

    return () => {
      window.removeEventListener("ambassadorDataUpdated", handleDataUpdate);
      window.removeEventListener("focus", handleDataUpdate);
    };
  }, []);

  const handleApplyGlobal = async () => {
    if (!globalCode.trim()) {
      setGlobalStatus("⚠️ Masukkan kode terlebih dahulu");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/api/validate/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: globalCode.trim(),
        }),
      });

      const data = await response.json();

      if (data.valid) {
        if (data.type === "ambassador" && data.ambassador) {
          setGlobalStatus(
            `✅ Kode ${globalCode.toUpperCase()} valid — ${
              data.ambassador.name
            } (${data.ambassador.location}). Gunakan pada kartu promo di bawah.`
          );
        } else if (data.type === "promo" && data.promo) {
          setGlobalStatus(
            `✅ Kode Promo ${globalCode.toUpperCase()} valid — ${
              data.promo.name
            }. Gunakan pada kartu promo di bawah.`
          );
        }
      } else {
        setGlobalStatus(
          data.message ||
            "⚠️ Kode tidak ditemukan. Hubungi Ambassador/Affiliate pada direktori di bawah."
        );
      }
    } catch (error) {
      console.error("Error validating global code:", error);
      setGlobalStatus("⚠️ Gagal memvalidasi kode. Coba lagi.");
    }
  };

  const handleApplyPromoCode = async (
    promoId: string,
    _code: string,
    validation: AppliedCode
  ) => {
    const newCodes = new Map(appliedCodes);
    newCodes.set(promoId, validation);
    setAppliedCodes(newCodes);
  };

  const handleValidationError = (error: string) => {
    setGlobalStatus(`⚠️ ${error}`);
    // Auto clear after 5 seconds
    setTimeout(() => setGlobalStatus(""), 5000);
  };

  const filteredPromos = promos.filter(
    (p: PromoData) =>
      (filterBranch === "all" || p.branch === filterBranch) &&
      (filterType === "all" || p.type === filterType) &&
      (filterProgram === "all" || p.program === filterProgram)
  );

  const filteredAmbassadors = ambassadorInstitutions.filter(
    (amb) =>
      (ambassadorFilterBranch === "all" ||
        amb.branch === ambassadorFilterBranch) &&
      amb.institution.toLowerCase().includes(searchInstitution.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white text-slate-900">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-white to-white" />
        <div className="mx-auto max-w-7xl px-4 pb-6 pt-10 md:pb-8 md:pt-14">
          <div className="glass rounded-3xl border border-blue-100 bg-white/70 p-6 shadow-md backdrop-blur-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  🎯 Promo Hub • Semua Cabang
                </div>
                <h1 className="text-3xl font-extrabold leading-tight md:text-4xl">
                  Zona English —{" "}
                  <span className="text-blue-700">Promo Hub</span>
                </h1>
                <p className="mt-2 max-w-2xl text-slate-600">
                  Semua promo aktif + jaringan <b>Ambassador & Affiliate</b> di
                  sekolah/kampus/kantor. <em>Masukkan kode unik mereka</em>{" "}
                  untuk potongan tambahan & ngobrol langsung soal pengalaman
                  belajar.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://wa.me/6282188080688?text=Halo%20Zona%20English%2C%20saya%20ingin%20tanya%20Promo%20Hub"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition-colors"
                >
                  Chat Admin (WA)
                </a>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                Undangan Belajar Gratis — Kelas Premium
              </div>
              <p className="mt-1 text-sm text-slate-700">
                <b>Semua fasilitas premium</b> • Kelas kecil <b>8–12 siswa</b> •{" "}
                <b>Kuota 100 peserta</b>/batch. Gunakan{" "}
                <b>kode Ambassador/Affiliate</b> dari sekolah/kampus/kantor kamu
                untuk potongan ekstra.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FILTER SECTION */}
      <section className="mx-auto max-w-7xl px-4 pb-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-5">
            <div>
              <label className="text-xs font-semibold text-slate-600">
                Cabang
              </label>
              <select
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-300 focus:outline-none"
              >
                <option value="all">Semua Cabang</option>
                <option value="Pettarani">Makassar — Pettarani</option>
                <option value="Kolaka">Kolaka — Center</option>
                <option value="Kendari">Kendari — Center</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">
                Jenis Promo
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-300 focus:outline-none"
              >
                <option value="all">Semua Jenis</option>
                <option value="Grand Opening">Grand Opening</option>
                <option value="11.11">11.11</option>
                <option value="Gajian">Gajian (25–28)</option>
                <option value="12.12">12.12</option>
                <option value="Akhir Bulan">Akhir Bulan (29–31)</option>
                <option value="Akhir Tahun">Akhir Tahun</option>
                <option value="Back to School">Back to School</option>
                <option value="Penerimaan Rapor">Penerimaan Rapor</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">
                Program
              </label>
              <select
                value={filterProgram}
                onChange={(e) => setFilterProgram(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-300 focus:outline-none"
              >
                <option value="all">Semua Program</option>
                <option value="Regular">Regular (Offline)</option>
                <option value="Speaking Online">Speaking Online</option>
                <option value="Academic Online">Academic Online</option>
                <option value="Intensive">Intensive</option>
                <option value="Project NBSN">Project NBSN</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-600">
                Punya Kode Ambassador/Affiliate?
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Contoh: ZE-AULIA11"
                  value={globalCode}
                  onChange={(e) => setGlobalCode(e.target.value.toUpperCase())}
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <button
                  onClick={handleApplyGlobal}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
                >
                  Terapkan
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-500">{globalStatus}</p>
            </div>
          </div>
        </div>
      </section>

      {/* PROMO LIST */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        {filteredPromos.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-600">
            Tidak ada promo untuk filter yang dipilih.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPromos.map((promo) => (
              <PromoCard
                key={promo.id}
                promo={promo}
                appliedCode={appliedCodes.get(promo.id) || null}
                onApplyCode={(code, validation) =>
                  handleApplyPromoCode(promo.id, code, validation)
                }
                onValidationError={handleValidationError}
              />
            ))}
          </div>
        )}
      </section>

      {/* LOKASI CABANG */}
      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Lokasi Cabang</h2>
          <div className="flex gap-2">
            {(["Pettarani", "Kolaka", "Kendari"] as const).map((location) => (
              <button
                key={location}
                onClick={() => setActiveLocation(location)}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-all ${
                  activeLocation === location
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-100"
                }`}
              >
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

      {/* AMBASSADOR DIRECTORY */}
      <section id="ambassador" className="mx-auto max-w-7xl px-4 pb-20">
        <h2 className="mb-3 text-2xl font-bold">
          Temukan Ambassador & Affiliate Terdekat
        </h2>
        <p className="mb-5 text-slate-600">
          Pilih sekolah, kampus, atau tempat kerja untuk melihat siapa yang bisa
          kamu hubungi dan dapatkan kode unik mereka.
        </p>

        <div className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="Cari: sekolah/kampus/kantor..."
            value={searchInstitution}
            onChange={(e) => setSearchInstitution(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          <select
            value={ambassadorFilterBranch}
            onChange={(e) => setAmbassadorFilterBranch(e.target.value as any)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-300 focus:outline-none"
          >
            <option value="all">Semua Cabang</option>
            <option value="Pettarani">Pettarani</option>
            <option value="Kolaka">Kolaka</option>
            <option value="Kendari">Kendari</option>
          </select>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-600">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-3">Memuat data ambassador...</p>
          </div>
        ) : filteredAmbassadors.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-600">
            {searchInstitution || ambassadorFilterBranch !== "all"
              ? "Tidak ada ambassador yang sesuai dengan filter."
              : "Data ambassador belum tersedia."}
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

      <footer className="mx-auto max-w-7xl px-4 pb-24 text-sm text-slate-500">
        © Zona English. All rights reserved. • IG: @zonaenglish.id • WA: +62
        821-8808-0688
      </footer>

      <FloatingButton href={CTA_WHATSAPP}>
        <MessageCircle className="h-5 w-5" /> Tanya Admin
      </FloatingButton>
    </main>
  );
}
