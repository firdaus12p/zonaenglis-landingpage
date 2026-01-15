/**
 * SEO Configuration for Zona English
 * Centralized SEO data and utilities
 *
 * Generated: 2026-01-15
 */

// =====================================================
// COMPANY INFORMATION
// =====================================================
export const COMPANY_INFO = {
  name: "Zona English",
  legalName: "Zona English",
  tagline: "Belajar Inggris Jadi Mudah dengan Metode NBSN",
  description:
    "Kursus bahasa Inggris terpercaya di Makassar sejak 2019. Belajar dengan metode NBSN yang seru, efektif, dan bikin percaya diri untuk usia 3-25+ tahun.",
  foundingYear: 2019,
  method: "NBSN",
} as const;

// =====================================================
// CONTACT INFORMATION
// =====================================================
export const CONTACT_INFO = {
  email: "zonaenglish.media@gmail.com",
  phone: "+62 858-8012-7034",
  phoneFormatted: "+62-858-8012-7034",
  whatsapp: "6285880127034",
  address: {
    street: "Jl. Sehati No.11, Karuwisi",
    district: "Kec. Panakkukang",
    city: "Makassar",
    province: "Sulawesi Selatan",
    postalCode: "90232",
    country: "Indonesia",
    countryCode: "ID",
    full: "Jl. Sehati No.11, Karuwisi, Kec. Panakkukang, Kota Makassar, Sulawesi Selatan 90232",
  },
  geo: {
    latitude: -5.1477,
    longitude: 119.4327,
  },
} as const;

// =====================================================
// SOCIAL MEDIA LINKS
// =====================================================
export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/zonaenglish.id/",
  // Add more as they become available
  // facebook: "",
  // youtube: "",
  // tiktok: "",
} as const;

// =====================================================
// SEO URLS
// =====================================================
export const SEO_URLS = {
  baseUrl:
    import.meta.env.MODE === "production"
      ? "https://zonaenglish.com"
      : "http://localhost:5173",
  ogImage: "/og-image.png",
  logo: "/logo.png",
  favicon: "/favicon.svg",
} as const;

// =====================================================
// DEFAULT META TAGS
// =====================================================
export const DEFAULT_META = {
  title:
    "Zona English - Kursus Bahasa Inggris Terbaik di Makassar | Metode NBSN",
  description:
    "Zona English - Kursus bahasa Inggris terpercaya di Makassar sejak 2019. Belajar dengan metode NBSN yang seru, efektif, dan bikin percaya diri untuk usia 3-25+ tahun.",
  keywords: [
    "kursus bahasa inggris makassar",
    "les inggris makassar",
    "zona english",
    "kursus inggris sulawesi selatan",
    "belajar inggris metode NBSN",
    "les inggris anak makassar",
    "kursus inggris dewasa makassar",
    "english course makassar",
    "kursus bahasa inggris terbaik makassar",
    "les bahasa inggris untuk anak",
  ],
} as const;

// =====================================================
// PAGE-SPECIFIC SEO DATA
// =====================================================
export const PAGE_SEO = {
  home: {
    title:
      "Zona English - Kursus Bahasa Inggris Terbaik di Makassar | Metode NBSN",
    description:
      "Zona English - Kursus bahasa Inggris terpercaya di Makassar sejak 2019. Belajar dengan metode NBSN yang seru, efektif, dan bikin percaya diri untuk usia 3-25+ tahun. Daftar sekarang!",
    keywords: [
      "kursus bahasa inggris makassar",
      "les inggris makassar",
      "zona english makassar",
      "english course makassar",
    ],
    path: "/",
  },
  promoCenter: {
    title: "Promo Kursus Bahasa Inggris Makassar | Zona English",
    description:
      "Dapatkan promo terbaru kursus bahasa Inggris di Zona English Makassar. Diskon spesial untuk program anak, remaja, dan dewasa. Daftar sekarang sebelum kehabisan!",
    keywords: [
      "promo kursus bahasa inggris",
      "diskon les inggris makassar",
      "promo zona english",
      "kursus inggris murah makassar",
    ],
    path: "/promo-center",
  },
  promoHub: {
    title: "Klaim Promo & Kode Diskon | Zona English Makassar",
    description:
      "Klaim kode promo dan diskon spesial untuk kursus bahasa Inggris di Zona English Makassar. Gunakan kode affiliate ambassador untuk diskon tambahan!",
    keywords: [
      "kode promo zona english",
      "diskon kursus inggris",
      "promo affiliate zona english",
      "kode diskon les inggris",
    ],
    path: "/promo-hub",
  },
  articles: {
    title: "Tips & Artikel Belajar Bahasa Inggris | Zona English",
    description:
      "Pelajari tips dan trik belajar bahasa Inggris dari Zona English. Artikel tentang grammar, vocabulary, speaking, dan tips sukses belajar English.",
    keywords: [
      "tips belajar bahasa inggris",
      "artikel bahasa inggris",
      "cara belajar english",
      "grammar bahasa inggris",
      "tips speaking english",
    ],
    path: "/articles",
  },
} as const;

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Generate full URL for a path
 */
export const getFullUrl = (path: string): string => {
  const baseUrl = SEO_URLS.baseUrl;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

/**
 * Generate OG image URL
 */
export const getOgImageUrl = (imagePath?: string): string => {
  if (imagePath) {
    if (imagePath.startsWith("http")) return imagePath;
    return getFullUrl(imagePath);
  }
  return getFullUrl(SEO_URLS.ogImage);
};

/**
 * Format keywords array to string
 */
export const formatKeywords = (keywords: readonly string[]): string => {
  return keywords.join(", ");
};

/**
 * Generate WhatsApp link
 */
export const getWhatsAppLink = (message?: string): string => {
  const baseUrl = `https://wa.me/${CONTACT_INFO.whatsapp}`;
  if (message) {
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  }
  return baseUrl;
};

/**
 * Generate article schema for structured data
 */
export const generateArticleSchema = (article: {
  title: string;
  description: string;
  author?: string;
  publishedAt: string;
  updatedAt?: string;
  image?: string;
  url: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: article.title,
  description: article.description,
  author: {
    "@type": "Organization",
    name: article.author || COMPANY_INFO.name,
  },
  publisher: {
    "@type": "Organization",
    name: COMPANY_INFO.name,
    logo: {
      "@type": "ImageObject",
      url: getFullUrl(SEO_URLS.logo),
    },
  },
  datePublished: article.publishedAt,
  dateModified: article.updatedAt || article.publishedAt,
  image: article.image ? getFullUrl(article.image) : getOgImageUrl(),
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": article.url,
  },
});

/**
 * Generate course/program schema for structured data
 */
export const generateCourseSchema = (course: {
  name: string;
  description: string;
  price?: number;
  duration?: string;
  ageRange?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Course",
  name: course.name,
  description: course.description,
  provider: {
    "@type": "EducationalOrganization",
    name: COMPANY_INFO.name,
    url: SEO_URLS.baseUrl,
    address: CONTACT_INFO.address.full,
  },
  ...(course.price && {
    offers: {
      "@type": "Offer",
      price: course.price,
      priceCurrency: "IDR",
    },
  }),
  ...(course.duration && { timeRequired: course.duration }),
  ...(course.ageRange && {
    audience: { "@type": "Audience", name: course.ageRange },
  }),
});
