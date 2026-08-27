import { resolveRepositoryRootAssetUrl } from "@/app/config/repository-assets";

export type CommunityGalleryOrientation = "portrait" | "landscape" | "square";
export interface CommunityGalleryImage {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  orientation: CommunityGalleryOrientation;
  featured?: boolean;
}

export const communityGalleryImages: CommunityGalleryImage[] = [
  { id: "gallery_0001_960x718", src: resolveRepositoryRootAssetUrl("/community/gallery_0001_960x718.jpg"), alt: "RARE community gallery photograph 1", width: 960, height: 718, orientation: "landscape", featured: true },
  { id: "gallery_0002_960x720", src: resolveRepositoryRootAssetUrl("/community/gallery_0002_960x720.jpg"), alt: "RARE community gallery photograph 2", width: 960, height: 720, orientation: "landscape" },
  { id: "gallery_0003_720x960", src: resolveRepositoryRootAssetUrl("/community/gallery_0003_720x960.jpg"), alt: "RARE community gallery photograph 3", width: 720, height: 960, orientation: "portrait" },
  { id: "gallery_0004_1316x640", src: resolveRepositoryRootAssetUrl("/community/gallery_0004_1316x640.jpg"), alt: "RARE community gallery photograph 4", width: 1316, height: 640, orientation: "landscape" },
  { id: "gallery_0005_720x960", src: resolveRepositoryRootAssetUrl("/community/gallery_0005_720x960.jpg"), alt: "RARE community gallery photograph 5", width: 720, height: 960, orientation: "portrait" },
  { id: "gallery_0006_1440x1080", src: resolveRepositoryRootAssetUrl("/community/gallery_0006_1440x1080.jpg"), alt: "RARE community gallery photograph 6", width: 1440, height: 1080, orientation: "landscape", featured: true },
  { id: "gallery_0007_1600x1200", src: resolveRepositoryRootAssetUrl("/community/gallery_0007_1600x1200.jpg"), alt: "RARE community gallery photograph 7", width: 1600, height: 1200, orientation: "landscape" },
  { id: "gallery_0008_943x943", src: resolveRepositoryRootAssetUrl("/community/gallery_0008_943x943.jpg"), alt: "RARE community gallery photograph 8", width: 943, height: 943, orientation: "square" },
  { id: "gallery_0009_1600x1200", src: resolveRepositoryRootAssetUrl("/community/gallery_0009_1600x1200.jpg"), alt: "RARE community gallery photograph 9", width: 1600, height: 1200, orientation: "landscape" },
  { id: "gallery_0010_935x935", src: resolveRepositoryRootAssetUrl("/community/gallery_0010_935x935.jpg"), alt: "RARE community gallery photograph 10", width: 935, height: 935, orientation: "square" },
  { id: "gallery_0011_2016x1512", src: resolveRepositoryRootAssetUrl("/community/gallery_0011_2016x1512.jpg"), alt: "RARE community gallery photograph 11", width: 2016, height: 1512, orientation: "landscape" },
  { id: "gallery_0012_2016x1512", src: resolveRepositoryRootAssetUrl("/community/gallery_0012_2016x1512.jpg"), alt: "RARE community gallery photograph 12", width: 2016, height: 1512, orientation: "landscape" },
  { id: "gallery_0013_960x720", src: resolveRepositoryRootAssetUrl("/community/gallery_0013_960x720.jpg"), alt: "RARE community gallery photograph 13", width: 960, height: 720, orientation: "landscape", featured: true },
  { id: "gallery_0014_1512x2016", src: resolveRepositoryRootAssetUrl("/community/gallery_0014_1512x2016.jpg"), alt: "RARE community gallery photograph 14", width: 1512, height: 2016, orientation: "portrait" },
  { id: "gallery_0015_1512x2016", src: resolveRepositoryRootAssetUrl("/community/gallery_0015_1512x2016.jpg"), alt: "RARE community gallery photograph 15", width: 1512, height: 2016, orientation: "portrait" },
  { id: "gallery_0016_2016x1512", src: resolveRepositoryRootAssetUrl("/community/gallery_0016_2016x1512.jpg"), alt: "RARE community gallery photograph 16", width: 2016, height: 1512, orientation: "landscape" },
  { id: "gallery_0017_1200x1600", src: resolveRepositoryRootAssetUrl("/community/gallery_0017_1200x1600.jpg"), alt: "RARE community gallery photograph 17", width: 1200, height: 1600, orientation: "portrait" },
  { id: "gallery_0018_2048x1365", src: resolveRepositoryRootAssetUrl("/community/gallery_0018_2048x1365.jpg"), alt: "RARE community gallery photograph 18", width: 2048, height: 1365, orientation: "landscape" },
  { id: "gallery_0019_2048x1536", src: resolveRepositoryRootAssetUrl("/community/gallery_0019_2048x1536.jpg"), alt: "RARE community gallery photograph 19", width: 2048, height: 1536, orientation: "landscape" },
  { id: "gallery_0020_2048x1536", src: resolveRepositoryRootAssetUrl("/community/gallery_0020_2048x1536.jpg"), alt: "RARE community gallery photograph 20", width: 2048, height: 1536, orientation: "landscape" },
  { id: "gallery_0021_1600x1600", src: resolveRepositoryRootAssetUrl("/community/gallery_0021_1600x1600.png"), alt: "RARE community gallery photograph 21", width: 1600, height: 1600, orientation: "square", featured: true },
  { id: "gallery_0022_1600x777", src: resolveRepositoryRootAssetUrl("/community/gallery_0022_1600x777.jpg"), alt: "RARE community gallery photograph 22", width: 1600, height: 777, orientation: "landscape" },
  { id: "gallery_0023_1280x960", src: resolveRepositoryRootAssetUrl("/community/gallery_0023_1280x960.jpg"), alt: "RARE community gallery photograph 23", width: 1280, height: 960, orientation: "landscape" },
  { id: "gallery_0024_960x720", src: resolveRepositoryRootAssetUrl("/community/gallery_0024_960x720.jpg"), alt: "RARE community gallery photograph 24", width: 960, height: 720, orientation: "landscape" },
  { id: "gallery_0025_1200x1600", src: resolveRepositoryRootAssetUrl("/community/gallery_0025_1200x1600.jpg"), alt: "RARE community gallery photograph 25", width: 1200, height: 1600, orientation: "portrait" },
  { id: "gallery_0026_3024x4032", src: resolveRepositoryRootAssetUrl("/community/gallery_0026_3024x4032.jpg"), alt: "RARE community gallery photograph 26", width: 3024, height: 4032, orientation: "portrait" },
  { id: "gallery_0027_3024x4032", src: resolveRepositoryRootAssetUrl("/community/gallery_0027_3024x4032.jpg"), alt: "RARE community gallery photograph 27", width: 3024, height: 4032, orientation: "portrait" },
  { id: "gallery_0028_4256x2832", src: resolveRepositoryRootAssetUrl("/community/gallery_0028_4256x2832.jpg"), alt: "RARE community gallery photograph 28", width: 4256, height: 2832, orientation: "landscape" },
  { id: "gallery_0029_5520x3680", src: resolveRepositoryRootAssetUrl("/community/gallery_0029_5520x3680.jpg"), alt: "RARE community gallery photograph 29", width: 5520, height: 3680, orientation: "landscape" },
  { id: "gallery_0030_5520x3680", src: resolveRepositoryRootAssetUrl("/community/gallery_0030_5520x3680.jpg"), alt: "RARE community gallery photograph 30", width: 5520, height: 3680, orientation: "landscape" },
  { id: "gallery_0031_1600x1066", src: resolveRepositoryRootAssetUrl("/community/gallery_0031_1600x1066.jpg"), alt: "RARE community gallery photograph 31", width: 1600, height: 1066, orientation: "landscape" },
  { id: "gallery_0032_2969x3418", src: resolveRepositoryRootAssetUrl("/community/gallery_0032_2969x3418.jpg"), alt: "RARE community gallery photograph 32", width: 2969, height: 3418, orientation: "portrait", featured: true },
  { id: "gallery_0033_5595x3730", src: resolveRepositoryRootAssetUrl("/community/gallery_0033_5595x3730.jpg"), alt: "RARE community gallery photograph 33", width: 5595, height: 3730, orientation: "landscape" },
  { id: "gallery_0034_6000x4000", src: resolveRepositoryRootAssetUrl("/community/gallery_0034_6000x4000.jpg"), alt: "RARE community gallery photograph 34", width: 6000, height: 4000, orientation: "landscape" },
  { id: "gallery_0035_5184x3456", src: resolveRepositoryRootAssetUrl("/community/gallery_0035_5184x3456.jpg"), alt: "RARE community gallery photograph 35", width: 5184, height: 3456, orientation: "landscape" },
  { id: "gallery_0036_3024x4032", src: resolveRepositoryRootAssetUrl("/community/gallery_0036_3024x4032.jpg"), alt: "RARE community gallery photograph 36", width: 3024, height: 4032, orientation: "portrait" },
  { id: "gallery_0037_746x743", src: resolveRepositoryRootAssetUrl("/community/gallery_0037_746x743.jpg"), alt: "RARE community gallery photograph 37", width: 746, height: 743, orientation: "square" },
  { id: "gallery_0038_990x706", src: resolveRepositoryRootAssetUrl("/community/gallery_0038_990x706.jpg"), alt: "RARE community gallery photograph 38", width: 990, height: 706, orientation: "landscape" },
  { id: "gallery_0039_750x735", src: resolveRepositoryRootAssetUrl("/community/gallery_0039_750x735.jpg"), alt: "RARE community gallery photograph 39", width: 750, height: 735, orientation: "square" },
  { id: "gallery_0040_750x719", src: resolveRepositoryRootAssetUrl("/community/gallery_0040_750x719.jpg"), alt: "RARE community gallery photograph 40", width: 750, height: 719, orientation: "square" },
  { id: "gallery_0041_750x665", src: resolveRepositoryRootAssetUrl("/community/gallery_0041_750x665.jpg"), alt: "RARE community gallery photograph 41", width: 750, height: 665, orientation: "landscape", featured: true },
  { id: "gallery_0042_2370x1058", src: resolveRepositoryRootAssetUrl("/community/gallery_0042_2370x1058.png"), alt: "RARE community gallery photograph 42", width: 2370, height: 1058, orientation: "landscape" },
  { id: "gallery_0043_1000x668", src: resolveRepositoryRootAssetUrl("/community/gallery_0043_1000x668.jpg"), alt: "RARE community gallery photograph 43", width: 1000, height: 668, orientation: "landscape" },
  { id: "gallery_0044_linkedin_2370x1058", src: resolveRepositoryRootAssetUrl("/community/gallery_0044_linkedin_2370x1058.png"), alt: "Follow RARE Revolution Magazine on LinkedIn", width: 2370, height: 1058, orientation: "landscape" },
];

export const getCommunityGalleryImage = (index: number) =>
  communityGalleryImages[index % communityGalleryImages.length];
