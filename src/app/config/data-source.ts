/**
 * Data Source Configuration
 *
 * This file controls where the magazine reader loads content from in both:
 * - standalone Vite preview/builds, and
 * - WordPress plugin embeds.
 *
 * In WordPress, the PHP plugin passes URLs through window.theWordsWeCarryConfig.
 * Always prefer those WordPress URLs when they exist.
 */

declare global {
  interface Window {
    theWordsWeCarryConfig?: {
      configUrl?: string;
      defaultConfigUrl?: string;
      pluginUrl?: string;
      assetsUrl?: string;
      localManifestUrl?: string;
      localViewerUrl?: string;
      articlesUrl?: string;
      chaptersUrl?: string;
      baseRawUrl?: string;
      frontMatterUrl?: string;
      chapterDescriptionsUrl?: string;
      magazineManifestUrl?: string;
      wordpressMagazineUrl?: string;
      legacyWordPressMagazineUrl?: string;
      adsUrl?: string;
      analyticsUrl?: string;
      brandingUrl?: string;
      organizationSlug?: string;
      brandingVariant?: string;
      issueSlug?: string;
      sourcePriority?: string[];
    };
  }
}


export interface OrganizationSelection {
  organizationSlug: string;
  brandingVariant: string;
  issueSlug: string;
}

const safeSlug = (value?: string | null): string => {
  const normalized = String(value || "").trim().toLowerCase();
  return /^[a-z0-9][a-z0-9-]*$/.test(normalized) ? normalized : "";
};

/**
 * Select an organization/brand without editing application code.
 * WordPress-provided values win; standalone builds use ?org=, ?brand= and ?issue=.
 */
export function getOrganizationSelection(): OrganizationSelection {
  if (typeof window === "undefined") {
    return { organizationSlug: "", brandingVariant: "", issueSlug: "" };
  }

  const wpConfig = window.theWordsWeCarryConfig;
  const params = new URLSearchParams(window.location.search);

  return {
    organizationSlug: safeSlug(wpConfig?.organizationSlug || params.get("org")),
    brandingVariant: safeSlug(wpConfig?.brandingVariant || params.get("brand")),
    issueSlug: safeSlug(wpConfig?.issueSlug || params.get("issue")),
  };
}

const REPOSITORY_PUBLIC_RAW_URL =
  "https://raw.githubusercontent.com/Joliel21/RRM/main/magazine-source/public/";
const REPOSITORY_ROOT_RAW_URL =
  "https://raw.githubusercontent.com/Joliel21/RRM/main/";

export function getOrganizationRawBaseUrl(): string {
  const { organizationSlug } = getOrganizationSelection();
  return organizationSlug
    ? `${REPOSITORY_ROOT_RAW_URL}organizations/${organizationSlug}/`
    : "";
}

export function getOrganizationFileUrl(relativePath: string): string {
  const base = getOrganizationRawBaseUrl();
  if (!base) return "";
  return `${base}${String(relativePath || "").replace(/^\/+/, "")}`;
}

/** Ordered most-specific to least-specific brand files. */
export function getBrandingCandidateUrls(): string[] {
  if (typeof window !== "undefined" && window.theWordsWeCarryConfig?.brandingUrl) {
    return [window.theWordsWeCarryConfig.brandingUrl];
  }

  const { organizationSlug, brandingVariant, issueSlug } = getOrganizationSelection();
  if (!organizationSlug) {
    return [DATA_SOURCE_CONFIG.EXTERNAL_URLS.BRANDING_JSON];
  }

  const urls: string[] = [];
  if (issueSlug && brandingVariant) {
    urls.push(getOrganizationFileUrl(`issues/${issueSlug}/branding-options/${brandingVariant}.json`));
  }
  if (issueSlug) {
    urls.push(getOrganizationFileUrl(`issues/${issueSlug}/branding.json`));
  }
  if (brandingVariant) {
    urls.push(getOrganizationFileUrl(`branding-options/${brandingVariant}.json`));
  }
  urls.push(getOrganizationFileUrl("branding.json"));
  urls.push(DATA_SOURCE_CONFIG.EXTERNAL_URLS.BRANDING_JSON);
  return urls.filter(Boolean);
}

export type DataFileType =
  | "BRANDING_JSON"
  | "VIEWER_JSON"
  | "PUBLISH_MANIFEST_JSON"
  | "RUNTIME_CSS"
  | "RUNTIME_JS"
  | "ARTICLES_JSON"
  | "CHAPTERS_JSON"
  | "FRONT_MATTER_JSON"
  | "CHAPTER_DESCRIPTIONS_JSON"
  | "MAGAZINE_MANIFEST_JSON"
  | "WORDPRESS_MAGAZINE_JSON"
  | "LEGACY_WORDPRESS_MAGAZINE_JSON"
  | "ADS_URL"
  | "ANALYTICS_URL"
  | "BASE_RAW_URL";

export const DATA_SOURCE_CONFIG = {
  // Standalone RRM builds load their reader content directly from Joliel21/RRM.
  // WordPress-localized URLs still win when the reader is embedded by WordPress.
  USE_EXTERNAL_URLS: true,

  EXTERNAL_URLS: {
    BRANDING_JSON: `${REPOSITORY_PUBLIC_RAW_URL}branding.json`,
    VIEWER_JSON: "",
    PUBLISH_MANIFEST_JSON: `${REPOSITORY_PUBLIC_RAW_URL}publish_manifest.json`,
    RUNTIME_CSS: "",
    RUNTIME_JS: "",
    // RRM currently uses front-matter.json as the primary page manifest.
    // These legacy article/chapter feeds are optional and are skipped when absent.
    ARTICLES_JSON: "",
    CHAPTERS_JSON: "",
    FRONT_MATTER_JSON: `${REPOSITORY_PUBLIC_RAW_URL}content/front-matter.json`,
    CHAPTER_DESCRIPTIONS_JSON: "",
    MAGAZINE_MANIFEST_JSON: "",
    WORDPRESS_MAGAZINE_JSON: "",
    LEGACY_WORDPRESS_MAGAZINE_JSON: "",
    ADS_URL: "",
    ANALYTICS_URL: "",
    BASE_RAW_URL: REPOSITORY_PUBLIC_RAW_URL,
  },

  LOCAL_PATHS: {
    BRANDING_JSON: "/branding.json",
    VIEWER_JSON: "/viewer.json",
    PUBLISH_MANIFEST_JSON: "/publish_manifest.json",
    RUNTIME_CSS: "/runtime.css",
    RUNTIME_JS: "/runtime.js",
    ARTICLES_JSON: "/content/articles.json",
    CHAPTERS_JSON: "/content/chapters.json",
    FRONT_MATTER_JSON: "/content/front-matter.json",
    CHAPTER_DESCRIPTIONS_JSON: "/content/chapter-descriptions.json",
    MAGAZINE_MANIFEST_JSON: "/content/magazine-manifest.json",
    WORDPRESS_MAGAZINE_JSON: "",
    LEGACY_WORDPRESS_MAGAZINE_JSON: "",
    ADS_URL: "",
    ANALYTICS_URL: "",
    BASE_RAW_URL: "/",
  },
};
function getWordPressConfigUrl(
  fileType: DataFileType,
): string | null {
  if (typeof window === "undefined") return null;

  const wpConfig = window.theWordsWeCarryConfig;
  if (!wpConfig) return null;

  switch (fileType) {
    case "BRANDING_JSON":
      return wpConfig.brandingUrl || null;
    case "PUBLISH_MANIFEST_JSON":
      return (
        wpConfig.configUrl ||
        wpConfig.localManifestUrl ||
        wpConfig.defaultConfigUrl ||
        null
      );
    case "VIEWER_JSON":
      return wpConfig.localViewerUrl || null;
    case "ARTICLES_JSON":
      return wpConfig.articlesUrl || DATA_SOURCE_CONFIG.EXTERNAL_URLS.ARTICLES_JSON || null;
    case "CHAPTERS_JSON":
      return wpConfig.chaptersUrl || DATA_SOURCE_CONFIG.EXTERNAL_URLS.CHAPTERS_JSON || null;
    case "FRONT_MATTER_JSON":
      return wpConfig.frontMatterUrl || DATA_SOURCE_CONFIG.EXTERNAL_URLS.FRONT_MATTER_JSON || null;
    case "CHAPTER_DESCRIPTIONS_JSON":
      return wpConfig.chapterDescriptionsUrl || DATA_SOURCE_CONFIG.EXTERNAL_URLS.CHAPTER_DESCRIPTIONS_JSON || null;
    case "MAGAZINE_MANIFEST_JSON":
      return wpConfig.magazineManifestUrl || DATA_SOURCE_CONFIG.EXTERNAL_URLS.MAGAZINE_MANIFEST_JSON || null;
    case "WORDPRESS_MAGAZINE_JSON":
      return wpConfig.wordpressMagazineUrl || null;
    case "LEGACY_WORDPRESS_MAGAZINE_JSON":
      return wpConfig.legacyWordPressMagazineUrl || null;
    case "ADS_URL":
      return wpConfig.adsUrl || null;
    case "ANALYTICS_URL":
      return wpConfig.analyticsUrl || null;
    case "BASE_RAW_URL":
      return wpConfig.baseRawUrl || DATA_SOURCE_CONFIG.EXTERNAL_URLS.BASE_RAW_URL || null;
    case "RUNTIME_CSS":
      return wpConfig.assetsUrl
        ? `${wpConfig.assetsUrl}runtime.css`
        : null;
    case "RUNTIME_JS":
      return wpConfig.assetsUrl
        ? `${wpConfig.assetsUrl}runtime.js`
        : null;
    default:
      return null;
  }
}

/**
 * Get the URL for a data file.
 * WordPress-localized URLs win over standalone defaults.
 */
export function getDataUrl(fileType: DataFileType): string {
  const wpUrl = getWordPressConfigUrl(fileType);
  if (wpUrl) return wpUrl;

  if (DATA_SOURCE_CONFIG.USE_EXTERNAL_URLS) {
    const { organizationSlug } = getOrganizationSelection();
    if (organizationSlug) {
      if (fileType === "PUBLISH_MANIFEST_JSON") {
        return getOrganizationFileUrl("magazine.json");
      }
      if (fileType === "ADS_URL") {
        return getOrganizationFileUrl("sponsors.json");
      }
      if (fileType === "BRANDING_JSON") {
        return getBrandingCandidateUrls()[0] || DATA_SOURCE_CONFIG.EXTERNAL_URLS.BRANDING_JSON;
      }
    }
    return DATA_SOURCE_CONFIG.EXTERNAL_URLS[fileType];
  }

  return DATA_SOURCE_CONFIG.LOCAL_PATHS[fileType];
}

/**
 * Get the reader content-source priority from WordPress when available.
 * The Reader Display Plugin currently sends:
 * 1. Magazine Content Plugin endpoint
 * 2. Legacy WordPress endpoint, temporary only
 * 3. Built-in emergency fallback
 *
 * Standalone/Figma preview still uses the GitHub content files because it is not
 * running inside the WordPress plugin shell.
 */
export function getWordPressSourcePriority(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  const sourcePriority =
    window.theWordsWeCarryConfig?.sourcePriority;
  return Array.isArray(sourcePriority)
    ? sourcePriority.filter(
        (item): item is string => typeof item === "string",
      )
    : [];
}