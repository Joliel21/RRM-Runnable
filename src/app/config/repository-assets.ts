import { getDataUrl, getOrganizationRawBaseUrl } from "@/app/config/data-source";

/** Resolve relative magazine assets against the active repository/WordPress source. */
export function resolveRepositoryAssetUrl(value?: string | null): string {
  const rawValue = String(value || "").trim();
  if (!rawValue) return "";

  if (/^(?:https?:|data:|blob:)/i.test(rawValue) || rawValue.startsWith("//")) {
    return rawValue;
  }

  const baseRawUrl = getDataUrl("BASE_RAW_URL");
  if (!baseRawUrl) return rawValue;

  const normalizedBase = baseRawUrl.endsWith("/") ? baseRawUrl : `${baseRawUrl}/`;
  let normalizedPath = rawValue
    .replace(/^public\//i, "")
    .replace(/^\/+/, "");

  // Repository filename normalization for a legacy reader alias.
  if (normalizedPath === "images/bsyndro.png") {
    normalizedPath = "images/bardet_biedl_syndrome.png";
  }

  return `${normalizedBase}${normalizedPath}`;
}


/** Resolve assets stored at the repository root (for example community/ and series-cover/). */
export function resolveRepositoryRootAssetUrl(value?: string | null): string {
  const rawValue = String(value || "").trim();
  if (!rawValue) return "";

  if (/^(?:https?:|data:|blob:)/i.test(rawValue) || rawValue.startsWith("//")) {
    return rawValue;
  }

  const normalizedPath = rawValue.replace(/^\/+/, "");
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
