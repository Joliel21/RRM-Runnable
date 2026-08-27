import { getDataUrl, getOrganizationRawBaseUrl } from "@/app/config/data-source";

const REMOVED_ASSET_PATHS = new Set([
  "images/tea.png",
  "series-cover/resources.png",
]);

const CDN_ASSET_PATHS = new Map([
  [
    "series/people-of-rare/people-of-rare-spread-title-page.png",
    "02ea0d0702569c749766d658b001e982d2b9fbcf",
  ],
  [
    "series/digital-spotlight/digital-spotlight-spread-title-page.png",
    "1b618c2fe944e262d9fc2922697c05e4ed986529",
  ],
  [
    "series/rare-reports/rare-reports-spread-title-page.png",
    "0859802fd559d037c21653799110079e68330ed6",
  ],
]);

const PAGE_SWAP_ASSET_PATHS = new Map([
  ["images/rare-revolution-series-spread.png", "images/ads/insider.png"],
  ["images/ads/insider.png", "images/rare-revolution-series-spread.png"],
]);

const normalizeRepositoryPath = (value: string) =>
  value
    .replace(/^public\//i, "")
    .replace(/^\/+/, "");

const isRemovedAssetPath = (value: string) =>
  REMOVED_ASSET_PATHS.has(normalizeRepositoryPath(value));

/** Resolve relative magazine assets against the active repository/WordPress source. */
export function resolveRepositoryAssetUrl(value?: string | null): string {
  const rawValue = String(value || "").trim();
  if (!rawValue) return "";

  if (/^(?:https?:|data:|blob:)/i.test(rawValue) || rawValue.startsWith("//")) {
    return rawValue;
  }

  if (isRemovedAssetPath(rawValue)) return "";

  const baseRawUrl = getDataUrl("BASE_RAW_URL");
  if (!baseRawUrl) return rawValue;

  const normalizedBase = baseRawUrl.endsWith("/") ? baseRawUrl : `${baseRawUrl}/`;
  let normalizedPath = normalizeRepositoryPath(rawValue);

  // Repository filename normalization for a legacy reader alias.
  if (normalizedPath === "images/bsyndro.png") {
    normalizedPath = "images/bardet_biedl_syndrome.png";
  }

  return `${normalizedBase}${normalizedPath}`;
}


/** Resolve assets stored at the repository root (for example community/, series/, images/ads/, and images/brand/). */
export function resolveRepositoryRootAssetUrl(value?: string | null): string {
  const rawValue = String(value || "").trim();
  if (!rawValue) return "";

  if (/^(?:https?:|data:|blob:)/i.test(rawValue) || rawValue.startsWith("//")) {
    return rawValue;
  }

  if (isRemovedAssetPath(rawValue)) return "";

  let normalizedPath = normalizeRepositoryPath(rawValue);

  // Approved displayed-page swap: pages 92–93 use Insider and pages 94–95
  // use Explore the Series. RARE INSIGHTS remains on pages 96–97.
  normalizedPath = PAGE_SWAP_ASSET_PATHS.get(normalizedPath) || normalizedPath;

  // These three verified PNG title spreads do not render reliably from GitHub's
  // raw/media hosts in the browser. Serve the same authoritative RRM/main files
  // through jsDelivr, using each current blob SHA only as a cache-busting token.
  const blobSha = CDN_ASSET_PATHS.get(normalizedPath);
  if (blobSha) {
    return `https://cdn.jsdelivr.net/gh/Joliel21/RRM@main/${normalizedPath}?v=${blobSha}`;
  }

  return `https://raw.githubusercontent.com/Joliel21/RRM/main/${normalizedPath}`;
}


/** Resolve an organization-owned logo, sponsor image, or issue asset. */
export function resolveOrganizationAssetUrl(value?: string | null): string {
  const rawValue = String(value || "").trim();
  if (!rawValue) return "";

  if (/^(?:https?:|data:|blob:)/i.test(rawValue) || rawValue.startsWith("//")) {
    return rawValue;
  }

  const organizationBase = getOrganizationRawBaseUrl();
  if (!organizationBase) return resolveRepositoryAssetUrl(rawValue);

  return `${organizationBase}${rawValue.replace(/^\/+/, "")}`;
}
