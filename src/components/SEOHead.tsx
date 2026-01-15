/**
 * SEO Head Component
 * Dynamic meta tags for React SPA
 *
 * Usage:
 * <SEOHead
 *   title="Page Title"
 *   description="Page description"
 *   path="/page-path"
 *   image="/custom-og-image.png"
 * />
 */

import { useEffect } from "react";
import {
  DEFAULT_META,
  COMPANY_INFO,
  getFullUrl,
  getOgImageUrl,
  formatKeywords,
} from "../config/seo";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: readonly string[];
  path?: string;
  image?: string;
  type?: "website" | "article";
  article?: {
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    section?: string;
    tags?: readonly string[];
  };
  noIndex?: boolean;
}

/**
 * Update document head with SEO meta tags
 * Works without react-helmet by directly manipulating DOM
 */
export default function SEOHead({
  title,
  description,
  keywords,
  path = "/",
  image,
  type = "website",
  article,
  noIndex = false,
}: SEOHeadProps) {
  const fullTitle = title || DEFAULT_META.title;
  const fullDescription = description || DEFAULT_META.description;
  const fullKeywords = keywords || DEFAULT_META.keywords;
  const fullUrl = getFullUrl(path);
  const fullImage = getOgImageUrl(image);

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper function to update or create meta tag
    const updateMeta = (
      selector: string,
      attribute: string,
      value: string,
      content: string
    ) => {
      let meta = document.querySelector(selector) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attribute, value);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    // Helper function to update or create link tag
    const updateLink = (rel: string, href: string) => {
      let link = document.querySelector(
        `link[rel="${rel}"]`
      ) as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", rel);
        document.head.appendChild(link);
      }
      link.setAttribute("href", href);
    };

    // Primary Meta Tags
    updateMeta(
      'meta[name="description"]',
      "name",
      "description",
      fullDescription
    );
    updateMeta(
      'meta[name="keywords"]',
      "name",
      "keywords",
      formatKeywords(fullKeywords)
    );
    updateMeta(
      'meta[name="robots"]',
      "name",
      "robots",
      noIndex ? "noindex, nofollow" : "index, follow"
    );

    // Canonical URL
    updateLink("canonical", fullUrl);

    // Open Graph Tags
    updateMeta('meta[property="og:title"]', "property", "og:title", fullTitle);
    updateMeta(
      'meta[property="og:description"]',
      "property",
      "og:description",
      fullDescription
    );
    updateMeta('meta[property="og:url"]', "property", "og:url", fullUrl);
    updateMeta('meta[property="og:image"]', "property", "og:image", fullImage);
    updateMeta('meta[property="og:type"]', "property", "og:type", type);
    updateMeta(
      'meta[property="og:site_name"]',
      "property",
      "og:site_name",
      COMPANY_INFO.name
    );
    updateMeta('meta[property="og:locale"]', "property", "og:locale", "id_ID");

    // Twitter Card Tags
    updateMeta(
      'meta[name="twitter:title"]',
      "name",
      "twitter:title",
      fullTitle
    );
    updateMeta(
      'meta[name="twitter:description"]',
      "name",
      "twitter:description",
      fullDescription
    );
    updateMeta('meta[name="twitter:url"]', "name", "twitter:url", fullUrl);
    updateMeta(
      'meta[name="twitter:image"]',
      "name",
      "twitter:image",
      fullImage
    );
    updateMeta(
      'meta[name="twitter:card"]',
      "name",
      "twitter:card",
      "summary_large_image"
    );

    // Article-specific tags
    if (type === "article" && article) {
      if (article.author) {
        updateMeta(
          'meta[property="article:author"]',
          "property",
          "article:author",
          article.author
        );
      }
      if (article.publishedTime) {
        updateMeta(
          'meta[property="article:published_time"]',
          "property",
          "article:published_time",
          article.publishedTime
        );
      }
      if (article.modifiedTime) {
        updateMeta(
          'meta[property="article:modified_time"]',
          "property",
          "article:modified_time",
          article.modifiedTime
        );
      }
      if (article.section) {
        updateMeta(
          'meta[property="article:section"]',
          "property",
          "article:section",
          article.section
        );
      }
      if (article.tags) {
        article.tags.forEach((tag, index) => {
          updateMeta(
            `meta[property="article:tag"]:nth-of-type(${index + 1})`,
            "property",
            "article:tag",
            tag
          );
        });
      }
    }

    // Cleanup: Reset to defaults when component unmounts
    return () => {
      document.title = DEFAULT_META.title;
    };
  }, [
    fullTitle,
    fullDescription,
    fullKeywords,
    fullUrl,
    fullImage,
    type,
    article,
    noIndex,
  ]);

  // This component doesn't render anything visible
  return null;
}

/**
 * Inject JSON-LD structured data into the page
 */
export function useStructuredData(schema: object) {
  useEffect(() => {
    const scriptId = "structured-data-" + JSON.stringify(schema).slice(0, 20);

    // Remove existing script with same ID if exists
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    // Create and inject new script
    const script = document.createElement("script");
    script.id = scriptId;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      const scriptToRemove = document.getElementById(scriptId);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [schema]);
}
