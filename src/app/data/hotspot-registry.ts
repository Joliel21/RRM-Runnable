import type { MagazineHotspot, MagazinePage } from "@/app/data/magazine-data";

export interface EditorialHotspot extends MagazineHotspot {
  id: string;
  placementPage: number;
  editable: true;
  source: "editorial";
}

export const DEFAULT_EDITORIAL_HOTSPOTS: EditorialHotspot[] = [
  {
    id: "brand-page-92",
    placementPage: 92,
    x: 4.583,
    y: 3.818,
    width: 51.042,
    height: 1.909,
    href: "https://rarerevolutionmagazine.com/",
    label: "Open RARE Revolution Magazine website",
    editable: true,
    source: "editorial",
  },
  {
    id: "brand-page-94",
    placementPage: 94,
    x: 7.5,
    y: 21.512,
    width: 50.625,
    height: 4.258,
    href: "https://rarerevolutionmagazine.com/",
    label: "Open RARE Revolution Magazine website",
    editable: true,
    source: "editorial",
  },
  {
    id: "brand-page-96",
    placementPage: 96,
    x: 9.896,
    y: 5.947,
    width: 37.292,
    height: 1.836,
    href: "https://rarerevolutionmagazine.com/",
    label: "Open RARE Revolution Magazine website",
    editable: true,
    source: "editorial",
  },
  {
    id: "brand-page-200",
    placementPage: 200,
    x: 4.699,
    y: 25.207,
    width: 34.554,
    height: 2.668,
    href: "https://rarerevolutionmagazine.com/",
    label: "Open RARE Revolution Magazine website",
    editable: true,
    source: "editorial",
  },
  {
    id: "brand-page-202",
    placementPage: 202,
    x: 7.708,
    y: 8.223,
    width: 41.979,
    height: 2.276,
    href: "https://rarerevolutionmagazine.com/",
    label: "Open RARE Revolution Magazine website",
    editable: true,
    source: "editorial",
  },
  {
    id: "brand-page-206",
    placementPage: 206,
    x: 8.323,
    y: 6.653,
    width: 49.306,
    height: 6.351,
    href: "https://rarerevolutionmagazine.com/",
    label: "Open RARE Revolution Magazine website",
    editable: true,
    source: "editorial",
  },
];

export function applyEditorialHotspots(
  pages: MagazinePage[],
  hotspots: EditorialHotspot[],
): MagazinePage[] {
  if (!hotspots.length) return pages;

  return pages.map((page) => {
    const pageHotspots = hotspots
      .filter((hotspot) => hotspot.placementPage === page.pageNumber)
      .map(({ placementPage: _placementPage, ...hotspot }) => hotspot);

    if (!pageHotspots.length) return page;

    return {
      ...page,
      hotspots: [...(page.hotspots || []), ...pageHotspots],
    };
  });
}


const finiteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function cloneDefaultEditorialHotspots(): EditorialHotspot[] {
  return DEFAULT_EDITORIAL_HOTSPOTS.map((hotspot) => ({ ...hotspot }));
}

export function validateEditorialHotspotImport(input: unknown): EditorialHotspot[] {
  if (!Array.isArray(input)) {
    throw new Error("Hotspot JSON must contain an array.");
  }

  const seenIds = new Set<string>();

  return input.map((entry, index) => {
    if (!entry || typeof entry !== "object") {
      throw new Error(`Hotspot ${index + 1} is not an object.`);
    }

    const candidate = entry as Record<string, unknown>;
    if (typeof candidate.id !== "string" || !candidate.id.trim()) {
      throw new Error(`Hotspot ${index + 1} is missing an id.`);
    }
    if (seenIds.has(candidate.id)) {
      throw new Error(`Duplicate hotspot id: ${candidate.id}`);
    }
    seenIds.add(candidate.id);

    if (!finiteNumber(candidate.placementPage) || candidate.placementPage < 0) {
      throw new Error(`Hotspot ${candidate.id} has an invalid placementPage.`);
    }
    if (typeof candidate.label !== "string") {
      throw new Error(`Hotspot ${candidate.id} has an invalid label.`);
    }

    for (const key of ["x", "y", "width", "height"] as const) {
      if (!finiteNumber(candidate[key])) {
        throw new Error(`Hotspot ${candidate.id} has an invalid ${key}.`);
      }
    }

    const pageNumber = finiteNumber(candidate.pageNumber)
      ? Math.max(0, Math.round(candidate.pageNumber))
      : undefined;
    const href = typeof candidate.href === "string" ? candidate.href : undefined;

    if (candidate.pageNumber !== undefined && pageNumber === undefined) {
      throw new Error(`Hotspot ${candidate.id} has an invalid pageNumber target.`);
    }
    if (candidate.href !== undefined && typeof candidate.href !== "string") {
      throw new Error(`Hotspot ${candidate.id} has an invalid href.`);
    }

    const x = clamp(candidate.x as number, 0, 99.5);
    const y = clamp(candidate.y as number, 0, 99.5);
    const width = clamp(candidate.width as number, 0.5, 100 - x);
    const height = clamp(candidate.height as number, 0.5, 100 - y);

    return {
      id: candidate.id,
      placementPage: Math.round(candidate.placementPage),
      label: candidate.label,
      x,
      y,
      width,
      height,
      ...(pageNumber !== undefined ? { pageNumber } : {}),
      ...(href !== undefined ? { href } : {}),
      editable: true,
      source: "editorial",
    };
  });
}
