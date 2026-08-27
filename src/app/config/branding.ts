import { getBrandingCandidateUrls } from "@/app/config/data-source";
import { resolveOrganizationAssetUrl, resolveRepositoryAssetUrl, resolveRepositoryRootAssetUrl } from "@/app/config/repository-assets";

export interface BrandingConfig {
  publicationName: string;
  browserTitle: string;
  logoUrl: string;
  logoAlt: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    accentLight: string;
    surface: string;
    ink: string;
    border: string;
    hover: string;
    readerBackground: string;
  };
  fonts: {
    heading: string;
    body: string;
    interface: string;
    googleFontsUrl?: string;
  };
}

const DEFAULT_BRANDING: BrandingConfig = {
  publicationName: "RARE Revolution Magazine",
  browserTitle: "RARE Revolution Magazine",
  logoUrl: "/images/brand/rare-revolution-trademark-logo.png",
  logoAlt: "RARE Revolution Magazine",
  colors: {
    primary: "#0A6E78",
    secondary: "#D1E8E9",
    accent: "#FFFFFF",
    accentLight: "#D1E8E9",
    surface: "#FFFFFF",
    ink: "#0F7F8A",
    border: "#D1E8E9",
    hover: "#0A6E78",
    readerBackground: "#75B7D1",
  },
  fonts: {
    heading: "Arial",
    body: "Arial",
    interface: "Arial",
  },
};

let activeBranding = DEFAULT_BRANDING;

const mergeBranding = (value: Partial<BrandingConfig>): BrandingConfig => ({
  ...DEFAULT_BRANDING,
  ...value,
  colors: { ...DEFAULT_BRANDING.colors, ...(value.colors || {}) },
  fonts: { ...DEFAULT_BRANDING.fonts, ...(value.fonts || {}) },
});

const applyBrandingToDocument = (branding: BrandingConfig) => {
  const root = document.documentElement;
  const variables: Record<string, string> = {
    "--brand-primary": branding.colors.primary,
    "--brand-secondary": branding.colors.secondary,
    "--brand-accent": branding.colors.accent,
    "--brand-accent-light": branding.colors.accentLight,
    "--brand-surface": branding.colors.surface,
    "--brand-ink": branding.colors.ink,
    "--brand-border": branding.colors.border,
    "--brand-hover": branding.colors.hover,
    "--brand-reader-background": branding.colors.readerBackground,
    "--brand-font-heading": `"${branding.fonts.heading}", serif`,
    "--brand-font-body": `"${branding.fonts.body}", serif`,
    "--brand-font-interface": `"${branding.fonts.interface}", sans-serif`,
  };

  Object.entries(variables).forEach(([name, value]) => {
    root.style.setProperty(name, value);
  });

  document.title = branding.browserTitle || branding.publicationName;

  if (branding.fonts.googleFontsUrl) {
    const id = "magazine-brand-fonts";
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = branding.fonts.googleFontsUrl;
  }
};

export const loadBranding = async (): Promise<BrandingConfig> => {
  const urls = getBrandingCandidateUrls();
  let loaded = false;

  for (const url of urls) {
    try {
      if (!url) continue;
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) continue;
      const rawText = await response.text();
      if (!rawText.trim() || rawText.trim().startsWith("<")) continue;

      const loadedBranding = mergeBranding(JSON.parse(rawText));
      const isOrganizationBrand = url.includes("/organizations/");
      const isDefaultRrmRootLogo =
        !isOrganizationBrand &&
        loadedBranding.logoUrl === "/images/brand/rare-revolution-trademark-logo.png";

      activeBranding = {
        ...loadedBranding,
        logoUrl: isOrganizationBrand
          ? resolveOrganizationAssetUrl(loadedBranding.logoUrl)
          : isDefaultRrmRootLogo
            ? resolveRepositoryRootAssetUrl(loadedBranding.logoUrl)
            : resolveRepositoryAssetUrl(loadedBranding.logoUrl),
      };
      loaded = true;
      break;
    } catch (error) {
      console.warn(`Branding candidate could not be loaded: ${url}`, error);
    }
  }

  if (!loaded) {
    activeBranding = {
      ...DEFAULT_BRANDING,
      logoUrl: resolveRepositoryRootAssetUrl(DEFAULT_BRANDING.logoUrl),
    };
  }

  applyBrandingToDocument(activeBranding);
  return activeBranding;
};

export const getBranding = () => activeBranding;
