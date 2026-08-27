import { getDataUrl, getOrganizationRawBaseUrl } from "@/app/config/data-source";

const REMOVED_ASSET_PATHS = new Set([
  "images/tea.png",
  "series-cover/resources.png",
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

  const normalizedPath = normalizeRepositoryPath(rawValue);
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
